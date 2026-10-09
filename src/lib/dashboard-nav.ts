import {
	Users,
	Mail,
	LayoutDashboard,
	BookText,
	Plus,
	Sheet,
	SprayCan,
	Images,
	Clock3,
	CircleHelp,
	BadgePercent,
	CreditCard,
	Award
} from '@lucide/svelte';

export const navigation = [
	{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
	{ title: 'Enrollments', url: '/dashboard/enrollments', icon: Users },
	{ title: 'Certificates', url: '/dashboard/certificates', icon: Award },
	{ title: 'Services', url: '/dashboard/services', icon: SprayCan },
	{ title: 'Gallery', url: '/dashboard/gallery', icon: Images },
	{ title: 'Opening Hours', url: '/dashboard/hours', icon: Clock3 },
	{
		title: 'Courses',
		url: '/dashboard/courses',
		icon: BookText,
		items: [
			{ title: 'All Courses', url: '/dashboard/courses', icon: Sheet },
			{ title: 'Add Course', url: '/dashboard/courses/add-course', icon: Plus }
		]
	},
	{ title: 'Discounts', url: '/dashboard/discounts', icon: BadgePercent },
	{ title: 'Payment Methods', url: '/dashboard/payment-methods', icon: CreditCard },
	{ title: 'Messages', url: '/dashboard/messages', icon: Mail },
	{ title: 'Help', url: '/dashboard/help', icon: CircleHelp }
];

// Main destinations in the phone tab bar; everything else lives under "More"
export const tabs = [
	{ title: 'Home', url: '/dashboard', icon: LayoutDashboard },
	{ title: 'Students', url: '/dashboard/enrollments', icon: Users },
	{ title: 'Courses', url: '/dashboard/courses', icon: BookText },
	{ title: 'Messages', url: '/dashboard/messages', icon: Mail }
];

export function isActive(url: string, pathname: string) {
	const path = pathname.replace(/\/$/, '');
	if (url === '/dashboard') return path === '/dashboard';
	return path === url || path.startsWith(url + '/');
}

export function pageTitle(pathname: string) {
	const path = pathname.replace(/\/$/, '');
	if (path === '/dashboard/courses/add-course') return 'Add Course';
	if (path === '/dashboard/change-password') return 'Change Password';
	if (/^\/dashboard\/courses\/[^/]+$/.test(path)) return 'Edit Course';
	return (
		navigation.find((item) => item.url !== '/dashboard' && isActive(item.url, path))?.title ??
		'Dashboard'
	);
}
