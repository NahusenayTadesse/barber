<script>
	import { page } from '$app/state';

	function toggleMenu() {
		document.querySelectorAll('.nav-left,.nav-right').forEach((el) => el.classList.toggle('open'));
	}
</script>

<nav>
	<!-- LEFT: Home + Courses -->
	<ul class="nav-left">
		<li>
			<a href="/" id="nav-home" class={page.url.pathname === '/' ? 'al' : ''}>Home </a>
		</li>
		<li>
			<a href="/courses" class={page.url.pathname === '/courses' ? 'al' : ''} id="nav-courses"
				>Courses</a
			>
		</li>
	</ul>

	<!-- CENTRE: Logo -->
	<a class="nav-logo" href="/home">
		<div class="nav-oval"><span class="nav-oval-t">D&D</span></div>
		<div class="nav-nt">D&D Barber & Academy</div>
		<div class="nav-nb">London · Est. 69 · Barber Academy</div>
	</a>

	<!-- RIGHT: Free Haircut + Start Your Career -->
	<ul class="nav-right">
		<li>
			<a
				href="/freehaircut"
				class={page.url.pathname === '/freehaircut' ? 'al' : ''}
				id="nav-freehaircut">Free Haircut</a
			>
		</li>
		<li>
			<a href="contact" id="nav-contact" class={page.url.pathname === '/contact' ? 'al' : ''}
				>Contact</a
			>
		</li>
		<li><a href="/courses" class="nav-enrol">Start Your Career</a></li>
	</ul>

	<button class="ham" id="ham" onclick={toggleMenu} aria-label="toggle menu"
		><span></span><span></span><span></span></button
	>
</nav>
