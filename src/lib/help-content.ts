export type HelpBlock =
	| { type: 'p'; text: string }
	| { type: 'steps'; title?: string; items: string[] }
	| { type: 'list'; title?: string; items: string[] }
	| { type: 'tip'; text: string }
	| { type: 'warning'; text: string };

export type HelpSection = {
	id: string;
	title: string;
	summary: string;
	/** Extra words people might search for that don't appear in the text */
	keywords?: string[];
	blocks: HelpBlock[];
};

export const helpTitle = 'Dashboard User Guide';
export const helpSubtitle =
	'How to manage your barbershop website, courses, enrollments and messages';

export const helpSections: HelpSection[] = [
	{
		id: 'getting-started',
		title: 'Getting Started',
		summary: 'Signing in, finding your way around, and managing your account.',
		keywords: ['login', 'sign in', 'menu', 'navigation', 'sidebar', 'mobile', 'logout', 'password'],
		blocks: [
			{
				type: 'p',
				text: 'The dashboard is the private area where you control what appears on your public website and where you receive enrollments and messages from customers. You must be signed in to see it. If you are not, you will be sent to the login page.'
			},
			{
				type: 'steps',
				title: 'Signing in',
				items: [
					'Go to the /login page of your website.',
					'Enter your email and password and press Login.',
					'You will land on the Dashboard Overview page.'
				]
			},
			{
				type: 'list',
				title: 'Finding your way around',
				items: [
					'Sidebar (left): links to every section - Dashboard, Enrollments, Certificates, Services, Gallery, Opening Hours, Courses, Discounts, Payment Methods, Messages and Help.',
					'Sidebar toggle (top-left button): opens and closes the sidebar. On a phone or tablet the sidebar is hidden until you press this button.',
					'Logo (top of sidebar): opens your public website in a new tab so you can check your changes.',
					'Account menu (top-right circle with your initial): change your password or log out.'
				]
			},
			{
				type: 'steps',
				title: 'Changing your password',
				items: [
					'Click the circle with your initial at the top-right.',
					'Choose Change Password.',
					'Enter your current password, then the new password twice.',
					'Press Change Password.'
				]
			},
			{
				type: 'warning',
				text: 'A new password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character (for example ! or #).'
			},
			{
				type: 'tip',
				text: 'Always log out from the account menu when you use a shared or public computer.'
			}
		]
	},
	{
		id: 'overview',
		title: 'Dashboard Overview',
		summary:
			"The dashboard's home page: today's numbers, what needs attention, quick actions and a map of every section.",
		keywords: [
			'stats',
			'statistics',
			'cards',
			'today',
			'engagement',
			'home',
			'quick links',
			'shortcuts',
			'map',
			'attention',
			'to do'
		],
		blocks: [
			{
				type: 'p',
				text: 'The Dashboard page is your starting point. It shows what happened today, what needs doing, and links to everything else.'
			},
			{
				type: 'list',
				title: "Today's cards",
				items: [
					'New Enrolments: how many people enrolled on a course today.',
					'Inquiries: how many messages were sent through the Contact form on your website today.',
					'Total Engagement: new enrolments and inquiries added together.',
					'Underneath: your total paid students, certificates issued and discounts running right now.'
				]
			},
			{
				type: 'list',
				title: 'Needs attention',
				items: [
					'Students still to pay: registered or started paying but not paid yet. Send them their payment link from Enrollments.',
					'Paid students without a certificate: issue one when they finish their course.',
					'Active courses that cannot be paid for online: they have no payment methods. Add some under Payment Methods.',
					'Messages in the last 7 days: new enquiries to answer.',
					'When nothing needs doing, it says "All caught up".'
				]
			},
			{
				type: 'p',
				text: 'Quick actions are one-click shortcuts to the most common jobs. Register Student and Issue Certificate open their forms straight away. View Website opens your public site in a new tab.'
			},
			{
				type: 'p',
				text: 'The Dashboard map lists every section, grouped into Students, Courses & Pricing, Website, and Inbox & Account, with a line explaining what each one is for. Click any of them to go there.'
			},
			{
				type: 'tip',
				text: 'Check the Overview first thing every morning and work down the Needs attention list.'
			}
		]
	},
	{
		id: 'tables',
		title: 'Using Tables (Search, Sort, Filter, Export)',
		summary:
			'Everything that works the same way on the Enrollments, Services, Courses, Discounts, Payment Methods and Messages lists.',
		keywords: [
			'search',
			'sort',
			'filter',
			'columns',
			'pagination',
			'pages',
			'export',
			'csv',
			'pdf',
			'download',
			'copy',
			'resize'
		],
		blocks: [
			{
				type: 'p',
				text: 'Most pages show a table. The tools above every table are the same everywhere, so you only need to learn them once.'
			},
			{
				type: 'list',
				title: 'Table tools',
				items: [
					'Search Table: type in the search box to instantly show only the rows that contain your text in any column.',
					'Columns: choose which columns to show or hide. Useful on small screens.',
					'Pages: choose how many rows to show at once. Use Previous and Next at the bottom to move between pages.',
					'Results: shows how many rows match your current search and filters.',
					'Download button (arrow icon): export the table as a PDF or as a CSV file that opens in Excel or Google Sheets.',
					'Column headings: click a heading that has arrows to sort by that column. Click again to reverse the order.',
					'Copy: click a phone number or email address in the table to copy it.',
					'Resize: drag the handle on the right edge of the table to make it narrower or wider on large screens.',
					'Scrolling: tables use the full height of your screen. When there are more rows than fit, scroll inside the table.'
				]
			},
			{
				type: 'steps',
				title: 'Filtering',
				items: [
					'Open the Filter menu above the table.',
					'Pick one or more values for any filter (for example a course or a status).',
					'The table updates straight away. Use the reset button to clear all filters.'
				]
			},
			{
				type: 'tip',
				text: 'Search and filters apply to the exported file too. Filter first, then download, to export only the rows you need.'
			}
		]
	},
	{
		id: 'enrollments',
		title: 'Enrollments',
		summary:
			'See everyone enrolled on your courses, register students yourself and send them payment links.',
		keywords: [
			'students',
			'customers',
			'payment',
			'status',
			'paid',
			'unpaid',
			'pending',
			'course',
			'register',
			'add student',
			'cash',
			'bank transfer',
			'payment link',
			'link',
			'send',
			'whatsapp',
			'email'
		],
		blocks: [
			{
				type: 'p',
				text: 'The Enrollments page lists every student on your courses, newest first. Students appear here in two ways: when they enrol and pay on a course page of the website, and when you register them yourself with the Register Student button.'
			},
			{
				type: 'list',
				title: 'What each column means',
				items: [
					'Name, Phone, Email: the contact details of the student.',
					'Course: the course they enrolled on.',
					'Payment Option: the payment method they chose, for example Deposit to Secure, 3 Equal Instalments or Pay in Full (see Payment Methods).',
					'Amount: what they were charged, or what they still need to pay, in pounds after any discount.',
					'Discount: the discount that was applied, or None. A removed discount is crossed out, with the date, who removed it and why underneath.',
					'Status: Paid (green) means the payment was received - by card through Stripe, or marked as paid by you. Unpaid (red) means they have not paid yet. Cancelled means a website payment page expired without payment, usually after 24 hours.',
					'Payment Link: for every Unpaid student, a Copy Link button and an email button to send them their personal payment link. Paid and cancelled students show a dash.',
					'Enrolled At: the date they enrolled.'
				]
			},
			{
				type: 'steps',
				title: 'Registering a student yourself',
				items: [
					'Press Register Student at the top of the Enrollments page.',
					"Enter the student's first and last name, email and phone.",
					'Choose the Course, then the Payment Option. Only the payment methods that course offers are listed, with their price.',
					"The Amount fills in with today's price, including any discount. Change it if you agreed a different amount.",
					'Choose the Status. It starts on Unpaid: keep it for a student who will pay by card online, or choose Paid if they have already paid you (for example in cash or by bank transfer).',
					'Press Register Student. A green message confirms the student was added.'
				]
			},
			{
				type: 'steps',
				title: 'Sending a student their payment link',
				items: [
					'When you register an Unpaid student, the window changes to show their personal payment link.',
					'Press Copy next to the link and paste it into a text, WhatsApp or email - or press WhatsApp to open a chat with the message ready (needs their phone number), or press Email to send it to them straight away.',
					'You do not have to send it now. Close the window whenever you like - the link is always in the Payment Link column of the table, where you can copy it or email it again.',
					'The student opens the link, sees their course and amount, and pays securely by card. Their status changes to Paid by itself once Stripe confirms the payment.',
					'Press Register Another Student to start a blank form.'
				]
			},
			{
				type: 'steps',
				title: 'Removing (nullifying) a discount from a student',
				items: [
					"Use this when a student shouldn't have had a discount, for example they chose the wrong gender to get a women-only or men-only discount.",
					'In the Discount column, press Nullify next to their discount.',
					'Amount still to pay fills in with what they owe without the discount: the full price if they have not paid yet, or the discount they got if they already paid. Change it if needed, or enter 0 to remove the discount without asking for money.',
					'Write the Reason and check the Date - both are kept for the audit record, together with your name.',
					'Press Nullify Discount for This Student. The student becomes Unpaid and the Payment Link column has a link for the amount still to pay. Send it the usual way; their payment page explains that the discount was removed.'
				]
			},
			{
				type: 'p',
				text: 'The heading shows the total number of enrollments. You can filter by status, course, payment option, discount and date, search by name or phone, and export the list as PDF or CSV (see Using Tables).'
			},
			{
				type: 'tip',
				text: 'Filter Status to Unpaid to see who still needs to pay, then use the Payment Link column to send each of them a reminder.'
			},
			{
				type: 'tip',
				text: 'Click a phone number or email to copy it, then paste it into WhatsApp, your phone or your email app.'
			},
			{
				type: 'p',
				text: 'A payment link charges exactly the amount you entered when registering the student, even if course prices or discounts change later. Each link only works for that one student. If they leave the payment page without paying, the same link still works later. Once they have paid, opening the link again just tells them it is already paid.'
			},
			{
				type: 'warning',
				text: 'The Email buttons only work once email sending has been set up for the website by whoever looks after it. Until then the Email button is greyed out - use Copy or WhatsApp instead.'
			},
			{
				type: 'warning',
				text: 'A student marked Paid gets no payment link. If they paid only a deposit or the first instalment, the link cannot collect the rest of the balance - take the remaining payments another way.'
			}
		]
	},
	{
		id: 'certificates',
		title: 'Certificates',
		summary:
			'Issue printable certificates to students who complete a course, and let anyone check they are genuine.',
		keywords: [
			'certificate',
			'diploma',
			'award',
			'graduate',
			'completion',
			'print',
			'pdf',
			'qr',
			'verify',
			'verification',
			'revoke',
			'signature'
		],
		blocks: [
			{
				type: 'p',
				text: 'When a student finishes a course, issue them a certificate. It is a gold-and-black A4 PDF with the academy seal, their name, the course, the completion date, a signature line and a certificate number. A QR code on the certificate opens a page on your website that confirms it is genuine, so employers can check it in seconds.'
			},
			{
				type: 'steps',
				title: 'Issuing a certificate',
				items: [
					'Open Certificates in the sidebar and press Issue Certificate.',
					"Choose the student's Enrolment (type to search). Their name, course and course details fill in by themselves. You can also leave it empty and type the details yourself.",
					"Check the Student's Full Name exactly as it should be printed.",
					'Certificate Title: "Certificate of Completion" prints as a large CERTIFICATE with "of Completion" underneath. You can use another title, for example "Professional Barber Diploma".',
					'Pick the Date of Completion.',
					'Signed By and Their Role: printed on the signature line. These are remembered for next time. Leave Signed By empty if you would rather sign each certificate by hand after printing.',
					'Press Issue Certificate. The window then lets you View PDF, Print, Email it to the student or copy its verification link.'
				]
			},
			{
				type: 'list',
				title: 'The buttons in the Actions column',
				items: [
					'View (eye): shows the certificate right there in the dashboard, with buttons to Download PDF, Print or Open in New Tab. On a phone, use Open in New Tab if the certificate does not appear.',
					'Print (printer): opens the print window straight away. Print in landscape on A4 - thick card stock looks best.',
					'Email (envelope): sends the student a congratulations email with the certificate attached as a PDF. Only available when the certificate was issued from an enrolment, so we know their email address.',
					'Copy (two squares): copies the verification link, for example to send on WhatsApp.',
					'Revoke (red circle): cancels a certificate issued by mistake. Its verification page then says it is no longer valid and the PDF can no longer be opened. Press Restore to make it valid again.'
				]
			},
			{
				type: 'tip',
				text: 'Students can download or print their certificate again at any time from the verification page - the link printed at the bottom of the certificate. It works whether they type it in capitals or small letters.'
			},
			{
				type: 'warning',
				text: 'A certificate never changes once issued. To fix a spelling mistake, revoke it and issue a new one - it gets a new certificate number.'
			},
			{
				type: 'warning',
				text: 'An enrolment can only have one valid certificate at a time. Revoke the old one first if you need to reissue it.'
			}
		]
	},
	{
		id: 'courses',
		title: 'Courses',
		summary: 'Add, view, edit, hide and delete the courses shown on your website.',
		keywords: [
			'price',
			'level',
			'duration',
			'deposit',
			'payment methods',
			'instalments',
			'active',
			'inactive',
			'add course',
			'edit course'
		],
		blocks: [
			{
				type: 'p',
				text: 'Courses are the training programmes people can enrol on. Use Courses > All Courses in the sidebar to see them, and Courses > Add Course to create a new one.'
			},
			{
				type: 'steps',
				title: 'Adding a course',
				items: [
					'In the sidebar open Courses, then Add Course.',
					'Fill in the form. Only Course Name is required; the other fields are optional but make your course page more useful.',
					'Under Payment Methods Offered, tick the ways students can pay for this course. Every enabled method is ticked to start with; untick any you do not want. At least one is needed.',
					'Press the Add button at the bottom. A green message confirms it was saved.'
				]
			},
			{
				type: 'list',
				title: 'Course fields',
				items: [
					'Course Name: required.',
					'Course Level and Duration: for example "Beginner" and "6 weeks".',
					'Base Price: the full price of the course.',
					'Minimum Price to Enroll and Minimum Price Message: the deposit needed to book a place, and the text explaining it to customers. The Deposit payment method charges this amount.',
					'Target Audience and Experience Level: who the course is for and what they should already know.',
					'Course Description: a longer description shown on the course page.',
					'Payment Methods Offered: the payment options shown on the course page, for example Pay in Full, 2 Instalments or Deposit (see Payment Methods).'
				]
			},
			{
				type: 'steps',
				title: 'Editing or hiding a course',
				items: [
					'Open Courses > All Courses and click the three dots in the Actions column.',
					"Choose View [course]'s Details. The details page opens in a new tab.",
					'Press Edit, change what you need and press Save Changes.',
					'To hide a course from the website without deleting it, set Status to Inactive and save.',
					'To change how students can pay, tick or untick methods under Payment Methods Offered and save. The details page lists the methods the course currently offers.'
				]
			},
			{
				type: 'warning',
				text: 'Delete (on the course details page) removes the course permanently. A course that already has enrollments cannot be deleted, because the enrollments are your student records - set it to Inactive instead. Inactive courses disappear from the website and cannot be booked, but you can switch them back on at any time.'
			}
		]
	},
	{
		id: 'discounts',
		title: 'Course Discounts',
		summary: 'Run a percentage-off sale on one, several or all of your courses for a set time.',
		keywords: [
			'sale',
			'offer',
			'promotion',
			'promo',
			'percent',
			'percentage',
			'off',
			'deal',
			'popup',
			'pop-up',
			'confetti',
			'expire',
			'expiry',
			'end date',
			'opening day'
		],
		blocks: [
			{
				type: 'p',
				text: 'A discount takes a percentage off the price of the courses you choose, between a start date and an expiration date. While it is running, the website applies it automatically: course prices are reduced everywhere, including at payment, and visitors see a celebration pop-up announcing it.'
			},
			{
				type: 'steps',
				title: 'Adding a discount',
				items: [
					'Open Discounts in the sidebar and press Add Discount.',
					'Name of Discount: the name customers will see, for example "Opening Day Discount" or "Summer Sale".',
					'Percentage Off: how much to take off, for example 20 for 20% off.',
					'Who Gets It: Everyone, or Women only / Men only. A women-only or men-only discount applies when the student chooses that gender on the enrolment form, which also shows a small note that a false gender means the discount is removed (see Enrollments to remove it).',
					'Courses: tick each course the discount applies to. Use Select all to tick every course.',
					'Starts On and Expires On: pick the first and last day of the discount from the calendars.',
					'Leave Enabled ticked, then press Add Discount. A green message confirms it was saved.'
				]
			},
			{
				type: 'list',
				title: 'What customers see while a discount is running',
				items: [
					'A pop-up with gold confetti when they open the website, showing the discount name, the percentage, which courses it covers and the date it ends. It appears once per visit - not on every page - and never on the payment pages.',
					'On each discounted course card: the new price, the old price crossed out, and a gold note with the discount name and percentage.',
					'On the enrolment page: every payment method the course offers is reduced by the discount, and Stripe charges the reduced amount. A method with its own extra % off (for example Pay in Full) gets that on top.'
				]
			},
			{
				type: 'list',
				title: 'Understanding the Status column',
				items: [
					'Active: running now and shown on the website.',
					'Scheduled: saved, but the start date has not arrived yet. It switches on by itself at midnight on the start date.',
					'Expired: the expiration date has passed. It switches off by itself - you do not need to do anything.',
					'Disabled: you unticked Enabled. It is not shown, whatever the dates.'
				]
			},
			{
				type: 'steps',
				title: 'Editing, pausing or removing a discount',
				items: [
					'Click the discount name, or the pencil icon in the Edit column.',
					'Change what you need and press Save Changes.',
					'To pause a discount without losing it, untick Enabled and save. Tick it again to bring it back.',
					'To remove a discount completely, press the red bin icon in the Delete column and confirm.'
				]
			},
			{
				type: 'tip',
				text: 'Dates are UK dates. A discount starts at 00:00 on its start date and ends at 23:59 on its expiration date, so a discount that expires on 8 November is still available all day on the 8th.'
			},
			{
				type: 'tip',
				text: 'To schedule a sale in advance, add it now with a future start date. It will show as Scheduled and switch on by itself.'
			},
			{
				type: 'warning',
				text: 'If two discounts cover the same course at the same time, the course gets the bigger one only - discounts never add together. The pop-up shows the biggest discount running.'
			},
			{
				type: 'warning',
				text: 'Ticking every course covers only the courses that exist today. When you add a new course, edit the discount and tick it too if it should be included.'
			}
		]
	},
	{
		id: 'payment-methods',
		title: 'Payment Methods',
		summary:
			'Choose the ways students can pay - in full, in 2, 3 or more instalments, or with a deposit - and which courses offer each one.',
		keywords: [
			'payment',
			'pay in full',
			'full payment',
			'instalments',
			'installments',
			'two instalments',
			'three instalments',
			'monthly',
			'deposit',
			'payment plan',
			'payment options',
			'checkout',
			'card'
		],
		blocks: [
			{
				type: 'p',
				text: 'Payment methods are the payment cards a student picks from on a course page, such as Deposit to Secure, 3 Equal Instalments or Pay in Full. Each course only shows the methods you have chosen for it, and Stripe charges the amount the chosen method works out.'
			},
			{
				type: 'list',
				title: 'How each type charges',
				items: [
					'Pay in Full: the whole course price, paid at once.',
					'Instalments: the course price split into equal payments - you choose how many, for example 2 or 3. The student pays the first instalment at checkout. The page shows it as, for example, £250 × 3.',
					"Deposit: the course's Minimum Price to Enroll, paid now to secure a place. Courses without a minimum price do not show a deposit method."
				]
			},
			{
				type: 'steps',
				title: 'Adding a payment method',
				items: [
					'Open Payment Methods in the sidebar and press Add Payment Method.',
					'Name: what students see on the card, for example "2 Equal Instalments".',
					'How it charges: choose Pay in Full, Instalments or Deposit. For Instalments, also enter the Number of Instalments (2 or more).',
					'Extra % Off (optional): a reduction for this method only, for example 10 to give 10% off for paying in full. Leave it at 0 for none.',
					'Card Text: the short lines shown under the price on the card, one per line, for example "One payment, nothing to track".',
					'Courses That Offer It: tick each course that should show this method.',
					'Display Order: lower numbers are shown first on the course page.',
					'Leave Enabled ticked, then press Add Payment Method. A green message confirms it was saved.'
				]
			},
			{
				type: 'steps',
				title: 'Choosing the methods for a course',
				items: [
					'Either open the payment method and tick or untick courses under Courses That Offer It,',
					'or open the course (Courses > All Courses > View Details > Edit) and tick or untick methods under Payment Methods Offered. Both ways change the same setting.',
					'Save. The course page on the website updates straight away.'
				]
			},
			{
				type: 'steps',
				title: 'Editing, pausing or removing a payment method',
				items: [
					'Click the method name, or the pencil icon in the Edit column.',
					'Change what you need and press Save Changes.',
					'To stop offering a method everywhere without losing it, untick Enabled and save. Tick it again to bring it back.',
					'To remove a method completely, press the red bin icon in the Delete column and confirm.'
				]
			},
			{
				type: 'tip',
				text: 'Course discounts apply to every payment method. A method with an Extra % Off gets its reduction on top of the course discount.'
			},
			{
				type: 'tip',
				text: 'Students who already enrolled keep the method name and the amount they were charged, even if you later change or delete the method.'
			},
			{
				type: 'warning',
				text: 'A course with no enabled payment methods cannot be paid for online - its page asks visitors to call instead. Make sure every active course offers at least one method.'
			}
		]
	},
	{
		id: 'services',
		title: 'Services',
		summary: 'Manage the barber services, prices and booking links on your website.',
		keywords: [
			'haircut',
			'barber',
			'price',
			'booking link',
			'image',
			'photo',
			'add service',
			'delete'
		],
		blocks: [
			{
				type: 'p',
				text: 'The Services page controls the list of services (for example haircuts and beard trims) that visitors see on the website.'
			},
			{
				type: 'steps',
				title: 'Adding a service',
				items: [
					'Press the Add Service button at the top of the page.',
					'Enter the Name of Service (required, 2 to 50 characters).',
					'Add the Price, a Description and the Booking Link (the full web address customers should use to book).',
					'Upload an image for the service. Images must be smaller than 10 MB.',
					'Press Add Service.'
				]
			},
			{
				type: 'steps',
				title: 'Editing a service',
				items: [
					'Find the service in the table (use the search box if the list is long).',
					'Click the service name, or press the pencil button in the Edit column.',
					'Change the details and save. You only need to upload a new image if you want to replace the current one.'
				]
			},
			{
				type: 'steps',
				title: 'Deleting a service',
				items: [
					'Press the red bin button in the Delete column.',
					'Read the confirmation message and confirm.'
				]
			},
			{
				type: 'tip',
				text: 'Click a service image in the table to see it full size. The Booking Link column opens the link in a new tab so you can test that it works.'
			},
			{
				type: 'warning',
				text: 'Deleting a service cannot be undone and it disappears from the website straight away.'
			}
		]
	},
	{
		id: 'gallery',
		title: 'Gallery',
		summary: 'Choose the images that scroll across your homepage.',
		keywords: ['photos', 'images', 'upload', 'homepage', 'remove', 'slideshow', 'carousel'],
		blocks: [
			{
				type: 'p',
				text: 'The Gallery page controls the pictures that scroll on your homepage. The number of images currently in the gallery is shown in the card title.'
			},
			{
				type: 'steps',
				title: 'Adding images',
				items: [
					'Drop image files onto the upload area, or click it to choose files from your device. You can select several at once.',
					'Images must be JPG, PNG, WebP or AVIF, each smaller than 10 MB, and you can add up to 30 at a time.',
					'Press Save Gallery. Nothing is published until you save.'
				]
			},
			{
				type: 'steps',
				title: 'Removing images',
				items: [
					'Press the X in the corner of an image to take it out of the gallery.',
					'Use the clear button to remove all newly selected files at once.',
					'Press Save Gallery to apply the change.'
				]
			},
			{
				type: 'tip',
				text: 'Use bright, landscape or square photos of your best work. Smaller files load faster for your visitors.'
			}
		]
	},
	{
		id: 'hours',
		title: 'Opening Hours',
		summary: 'Set the weekly opening times shown across the website.',
		keywords: ['open', 'closed', 'schedule', 'time', 'days', 'week', 'google business'],
		blocks: [
			{
				type: 'p',
				text: 'The hours you set here are shown on the home page, in the footer and on the contact page, so you only need to change them in one place.'
			},
			{
				type: 'steps',
				title: 'Updating your hours',
				items: [
					'Open Opening Hours in the sidebar. All seven days are listed.',
					'For a day you are closed, tick Closed. The time boxes disappear.',
					'For an open day, type the Opens and Closes times as you want visitors to read them, for example 9AM and 6PM.',
					'Press Save Hours.'
				]
			},
			{
				type: 'tip',
				text: 'Keep these hours in sync with your Google Business Profile so customers see the same times everywhere.'
			}
		]
	},
	{
		id: 'messages',
		title: 'Messages',
		summary: 'Read and manage enquiries sent through the website Contact form.',
		keywords: ['contact', 'inquiries', 'enquiries', 'email', 'phone', 'subject', 'delete', 'inbox'],
		blocks: [
			{
				type: 'p',
				text: 'Every time someone fills in the Contact form on your website, their message appears here with their name, phone number, email, subject, the message and the time it was sent. The newest messages are at the top.'
			},
			{
				type: 'steps',
				title: 'Working through messages',
				items: [
					'Open Messages in the sidebar.',
					'Click the long message text to read it in full.',
					'Click a phone number or email to copy it, then reply from your own phone or email app.',
					'Use the Filter menu to show only one subject, or search for a name.',
					'When you have dealt with a message, press the bin button in the Delete column and confirm.'
				]
			},
			{
				type: 'tip',
				text: 'Export messages to CSV from the download button if you want to keep a record before deleting them.'
			},
			{
				type: 'warning',
				text: 'Deleted messages cannot be recovered.'
			}
		]
	},
	{
		id: 'troubleshooting',
		title: 'Troubleshooting & Tips',
		summary: 'Quick answers to common problems.',
		keywords: [
			'error',
			'problem',
			'not saving',
			'cannot',
			'help',
			'fix',
			'slow',
			'upload failed',
			'logged out'
		],
		blocks: [
			{
				type: 'list',
				title: 'Common problems',
				items: [
					'My change did not appear on the website: make sure you pressed the Save button and saw the green confirmation message, then refresh the website page.',
					'A form shows red text: a required field is empty or a value is not valid. Fix the highlighted fields and try again.',
					'An image will not upload: check that it is a JPG, PNG, WebP or AVIF image, smaller than 10 MB, and that you are uploading no more than 30 at once. iPhone HEIC photos must be converted to JPG first.',
					'A discount is not showing on the website: open Discounts and check its Status. Scheduled means the start date has not arrived, Expired means it has ended, and Disabled means Enabled is unticked. Also check the right courses are ticked.',
					'I cannot delete a course: courses with enrollments cannot be deleted. Set the course to Inactive to hide it instead.',
					'A payment option is missing from a course page: open Payment Methods and check that the method is Enabled and that the course is ticked under Courses That Offer It. A Deposit method only shows on courses that have a Minimum Price to Enroll.',
					'A course page says online payment is not available: the course has no enabled payment methods. Tick at least one under Payment Methods Offered on the course.',
					'The Email button for a payment link is greyed out: email sending has not been set up for the website yet. Use Copy or WhatsApp to send the link instead.',
					'A student says their payment link is "no longer active": their enrollment was cancelled. Register them again to get a new link.',
					'A student paid but still shows Unpaid: refresh the Enrollments page. Card payments are usually confirmed within a minute.',
					'The Email button on a certificate is greyed out: the certificate was issued without choosing an enrolment, so there is no email address. Use View to download the PDF and send it yourself.',
					'Someone says a certificate QR code shows "revoked" or "not found": check the number in Certificates. Revoked ones can be restored with the Restore button.',
					'I was sent back to the login page: your session ended. Sign in again.',
					'The table looks cramped on my phone: use the Columns menu to hide columns you do not need.',
					'I forgot my password: ask the site administrator to reset it, then change it from the account menu.'
				]
			},
			{
				type: 'list',
				title: 'Good habits',
				items: [
					'Check your public website after every change.',
					'Use Inactive instead of Delete when you may want something back later.',
					'Export enrollments and messages regularly as a backup.',
					'Register students who pay in person straight away, so the Enrollments list stays complete.'
				]
			}
		]
	}
];
