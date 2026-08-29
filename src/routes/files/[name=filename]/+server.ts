import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import { env } from '$env/dynamic/private';
import { getCachedStats, invalidateStatCache } from '$lib/server/fileCache';

const FILES_DIR = path.resolve(env.FILES_DIR ?? '.tempFiles');
const RESIZE_CACHE_DIR = path.join(FILES_DIR, '.cache');
const RESIZABLE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp']);

if (!fs.existsSync(FILES_DIR)) {
	fs.mkdirSync(FILES_DIR, { recursive: true });
}
if (!fs.existsSync(RESIZE_CACHE_DIR)) {
	fs.mkdirSync(RESIZE_CACHE_DIR, { recursive: true });
}

/**
 * Returns a resized+webp-encoded copy of an image, generating and caching it on
 * first request. Subsequent requests for the same source (by mtime) reuse the
 * cached file instead of re-encoding.
 */
async function getResizedImagePath(
	sourcePath: string,
	sourceStats: fs.Stats,
	width: number,
	quality: number
): Promise<string> {
	const base = path.basename(sourcePath, path.extname(sourcePath));
	const cachePath = path.join(RESIZE_CACHE_DIR, `${base}-w${width}-q${quality}.webp`);

	const cached = getCachedStats(cachePath);
	if (cached && cached.mtimeMs >= sourceStats.mtimeMs) {
		return cachePath;
	}

	const buffer = await sharp(sourcePath)
		.resize({ width, withoutEnlargement: true })
		.webp({ quality })
		.toBuffer();
	fs.writeFileSync(cachePath, buffer);
	invalidateStatCache(cachePath);
	return cachePath;
}

// ---------------------------------------------------------------------------
// Cache-Control policy per file type
// ---------------------------------------------------------------------------
const CACHE_TTL: Record<string, string> = {
	immutable: 'public, max-age=31536000, immutable',
	long: 'public, max-age=86400',
	short: 'public, max-age=600',
	none: 'no-store'
};

function cacheControl(ext: string): string {
	if (['webp', 'png', 'jpg', 'jpeg', 'avif', 'mp4', 'webm', 'mp3'].includes(ext))
		return CACHE_TTL.long;
	if (['pdf', 'txt'].includes(ext)) return CACHE_TTL.short;
	return CACHE_TTL.none;
}

// ---------------------------------------------------------------------------
// Range header parser
// ---------------------------------------------------------------------------
function parseRange(header: string, size: number): { start: number; end: number } | null {
	const match = header.match(/^bytes=(\d*)-(\d*)$/);
	if (!match) return null;

	let start = match[1] === '' ? NaN : Number(match[1]);
	let end = match[2] === '' ? NaN : Number(match[2]);

	if (isNaN(start) && isNaN(end)) return null;

	if (isNaN(start)) {
		// suffix: bytes=-500
		start = Math.max(0, size - end);
		end = size - 1;
	} else if (isNaN(end)) {
		// open-ended: bytes=500-
		end = size - 1;
	}

	if (start > end || end >= size) return null;
	return { start, end };
}

// ---------------------------------------------------------------------------
// MIME types
// ---------------------------------------------------------------------------
const mimes: Record<string, string> & { lookup: (s: string) => string } = {
	// Text
	txt: 'text/plain',
	pdf: 'application/pdf',
	// Images
	webp: 'image/webp',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	avif: 'image/avif',
	// Audio
	mp3: 'audio/mpeg',
	// Video
	webm: 'video/webm',
	mp4: 'video/mp4',
	lookup(s: string): string {
		const ext = s.toLowerCase().split('.').at(-1);
		return (ext && this[ext]) ?? 'application/octet-stream';
	}
};

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET({ params, request }: { params: { name: string }; request: Request }) {
	// Security: prevent path traversal
	const file_path = path.resolve(FILES_DIR, params.name);
	const relative = path.relative(FILES_DIR, file_path);
	if (relative.startsWith('..') || path.isAbsolute(relative)) {
		return new Response('forbidden', { status: 403 });
	}

	// Stat (with cache)
	const sourceStats = getCachedStats(file_path);
	if (!sourceStats) return new Response('not found', { status: 404 });

	let ext = params.name.toLowerCase().split('.').at(-1) ?? '';
	let servePath = file_path;
	let stats = sourceStats;

	// Optional on-the-fly resize+webp conversion, e.g. ?w=1600&q=75
	const widthParam = new URL(request.url).searchParams.get('w');
	if (widthParam && RESIZABLE_EXTS.has(ext)) {
		const width = Math.min(3840, Math.max(50, parseInt(widthParam, 10) || 0));
		const qualityParam = new URL(request.url).searchParams.get('q');
		const quality = Math.min(95, Math.max(30, parseInt(qualityParam ?? '75', 10) || 75));
		if (width > 0) {
			try {
				servePath = await getResizedImagePath(file_path, sourceStats, width, quality);
				ext = 'webp';
				stats = getCachedStats(servePath) ?? sourceStats;
			} catch {
				// Fall back to serving the original file on any encoding error.
				servePath = file_path;
				ext = params.name.toLowerCase().split('.').at(-1) ?? '';
				stats = sourceStats;
			}
		}
	}

	const mimeType = mimes.lookup(`file.${ext}`);
	const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;
	const lastMod = stats.mtime.toUTCString();

	// Conditional requests
	if (request.headers.get('if-none-match') === etag) {
		return new Response(null, { status: 304 });
	}
	const ifModifiedSince = request.headers.get('if-modified-since');
	if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
		return new Response(null, { status: 304 });
	}

	// Range requests (audio/video seeking)
	const rangeHeader = request.headers.get('range');
	if (rangeHeader) {
		const range = parseRange(rangeHeader, stats.size);
		if (!range) {
			return new Response('range not satisfiable', {
				status: 416,
				headers: { 'Content-Range': `bytes */${stats.size}` }
			});
		}
		const { start, end } = range;
		const stream = Readable.toWeb(fs.createReadStream(servePath, { start, end }), {
			strategy: new CountQueuingStrategy({ highWaterMark: 100 })
		});
		return new Response(stream as ReadableStream, {
			status: 206,
			headers: {
				'Content-Range': `bytes ${start}-${end}/${stats.size}`,
				'Content-Length': String(end - start + 1),
				'Content-Type': mimeType,
				'Accept-Ranges': 'bytes',
				'Cache-Control': cacheControl(ext),
				'Last-Modified': lastMod,
				ETag: etag
			}
		});
	}

	// Full response
	const stream = Readable.toWeb(fs.createReadStream(servePath), {
		strategy: new CountQueuingStrategy({ highWaterMark: 100 })
	});
	return new Response(stream as ReadableStream, {
		headers: {
			'Content-Type': mimeType,
			'Content-Length': String(stats.size),
			'Cache-Control': cacheControl(ext),
			'Last-Modified': lastMod,
			'Accept-Ranges': 'bytes',
			ETag: etag
		}
	});
}