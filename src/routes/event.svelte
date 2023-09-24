<script lang="ts">
	import type { EventData } from './api/parse';

	let raw = '';
	let loading = false;
	let data: Partial<EventData> = {
		startDate: '',
		endDate: '',
		description: '',
		location: '',
		title: ''
	};
	const analyze = async () => {
		loading = true;
		const res = await fetch('/api/parse', {
			method: 'POST',
			body: JSON.stringify({
				raw,
                date: (new Date()).toLocaleString()
			})
		});
		const { event } = await res.json();
		data = event;
		loading = false;
		window.open(computeInviteLink(data));
	};

	const computeInviteLink = (data: any) => {
		let s = `https://calendar.google.com/calendar/r/eventedit?action=TEMPLATE`;
		if (data.startDate && data.endDate)
			s += `&dates=${encodeURIComponent(data.startDate)}/${encodeURIComponent(data.endDate)}`;
		if (data.description) s += `&details=${encodeURIComponent(data.description)}`;
		if (data.location) s += `&location=${encodeURIComponent(data.location)}`;
		if (data.title) s += `&text=${encodeURIComponent(data.title)}`;

		return s;
	};
</script>

<div class="flex flex-col">
	<textarea
		bind:value={raw}
		id="raw"
		placeholder="Paste raw text here..."
		class="resize-none h-52 max-w-2xl bg-background border-solid border-2 border-primary rounded-md p-1"
	/>
	<button
		aria-label="Play"
		on:click={analyze}
		disabled={loading}
		aria-disabled={loading}
		class="mt-2 py-1 px-2 rounded-md bg-secondary text-accent font-bold text-sm whitespace-pre"
	>
		{#if loading}
			Loading...
		{:else}
			Analyze
		{/if}
	</button>
</div>
