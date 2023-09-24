import { SvelteGoogleAuthHook } from 'svelte-google-auth/server';
import type { Handle } from '@sveltejs/kit';

// Import client credentials from json file
import {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} from '$env/static/private';

const auth = new SvelteGoogleAuthHook({client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET});

export const handle: Handle = async ({ event, resolve }) => {
	return await auth.handleAuth({ event, resolve });
};