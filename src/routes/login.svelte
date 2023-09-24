<script lang="ts">
	import { signIn, signOut } from 'svelte-google-auth/client';
	import { user } from './stores';
</script>

<div class="w-full">
<button aria-label="Play" on:click={() => $user ? signOut() : signIn()} class="py-1 px-2 rounded-md bg-secondary text-accent font-bold text-sm whitespace-pre">
    {#if $user}
    Sign Out
    {:else}
    Sign In
    {/if}
</button>
</div>
