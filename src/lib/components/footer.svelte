
<script>
	let { courses } = $props()
</script>
<footer>
	<div class="footer-inner">
		<div>
			<div class="flogo">D&D Barber & Academy</div>
			<div class="faddr">69 · London · 020 3700 3997</div>
			<p class="fdesc">
				London's premier barbering academy. From zero experience to paid career in 12 weeks.
			</p>
			<a
				href="https://wa.me/447846119677"
				target="_blank"
				class="wa-big"
				style="font-size:12px;padding:12px 22px"><span>💬</span> WhatsApp</a
			>
		</div>
		<div>
			<div class="fctitle">Navigate</div>
			<ul class="flinks">
				<li><a href="/">Home</a></li>
				<li><a href="/haircuts">Haircuts</a></li>
				<li><a href="contact" id="nav-contact">Contact</a></li>
				<li><a href="/courses" class="nav-enrol">Start Your Career</a></li>
			</ul>
		</div>
		<div>
			<div class="fctitle">Courses</div>
			<ul class="flinks">
			  {#if courses.length}
			    {#each courses as c (c.id)}
				<li><a href="/courses/{c.id}">{c.name}</a></li>
				{/each}
	
			{/if}
			</ul>
		</div>
		<div>
			<div class="fctitle">Follow Us</div>
			<ul class="flinks">
				<li><a href="https://www.instagram.com/dnd_barber_academy/" target="_blank">Instagram</a></li>
				<li><a href="https://www.tiktok.com/@dnd_barber_academy" target="_blank">TikTok</a></li>
				<li><a href="https://wa.me/447846119677" target="_blank">WhatsApp</a></li>
				<li><a href="tel:02037003997">020 3700 3997</a></li>
				<li><a href="tel:07846119677">078 46 11 96 77</a></li>
			</ul>
		</div>
	</div>
	<div class="justify-self-center text-xs">
		<span>© {new Date().getFullYear()} D&D Barber & Academy. All rights reserved.</span><span
			>✂ Turning passion into profession</span
		>
	</div>
	<!-- <div class="legal-links">
		<a href="/refund">Refund Policy</a><a href="/terms">Terms & Conditions</a><a href="/privacy"
			>Privacy Policy</a
		>
	</div> -->
</footer>
