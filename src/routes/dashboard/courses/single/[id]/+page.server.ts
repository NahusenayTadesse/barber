import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { edit, adjust, damaged, editGallery } from './schema';

import { db } from '$lib/server/db';
import { courses as products, priceOptions as priceList } from '$lib/server/db/schema';
import { eq, and, sql, isNotNull, desc } from 'drizzle-orm';
import { fail, message } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';

import type { Actions } from './$types';

export const actions: Actions = {
	editProduct: async ({ request, cookies, locals, params }) => {
		const { id } = params;
		const form = await superValidate(request, zod4(edit));
		console.log(form.data);

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form data.' }, cookies);
			return fail(400, { form });
		}

		const { productName, category, description, quantity, prices, supplier, reorderLevel, image } =
			form.data;

		try {
			if (image) {
				const featuredImage = await saveUploadedFile(image);

				await db
					.update(products)
					.set({
						name: productName,
						description,
						categoryId: category,
						quantity,
						supplierId: supplier ? supplier : 1,
						reorderLevel,
						updatedBy: locals?.user?.id,
						featuredImage
					})
					.where(eq(products.id, Number(id)));
			} else {
				await db
					.update(products)
					.set({
						name: productName,
						description,
						categoryId: category,
						quantity,
						supplierId: supplier ? supplier : 1,
						reorderLevel,
						updatedBy: locals?.user?.id
					})
					.where(eq(products.id, Number(id)));
			}

			const priceRecords = prices.map((p) => ({
				productId: Number(id),
				price: p.price,
				amount: p.amount
			}));
			await db.delete(priceList).where(eq(priceList.productId, Number(id)));
			await db.insert(priceList).values(priceRecords);

			// Stay on the same page and set a flash message

			return message(form, { type: 'success', text: 'Product Updated Successfully' });
		} catch (err) {
			console.error(err?.message);

			return message(form, { type: 'error', text: 'Product Update Failed' + err?.message });
		}
	},

	delete: async ({ cookies, params }) => {
		const { id } = params;

		try {
			if (!id) {
				setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
				return fail(400);
			}

			await db.delete(products).where(eq(products.id, Number(id)));

			setFlash({ type: 'success', message: 'Product Deleted Successfully!' }, cookies);
		} catch (err) {
			console.error('Error deleting product:', err);
			setFlash({ type: 'error', message: `Unexpected Error: ${err?.message}` }, cookies);
			return fail(400);
		}
	}
};
