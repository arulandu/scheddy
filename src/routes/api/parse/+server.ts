import { json, type RequestHandler } from '@sveltejs/kit';
import { google } from 'googleapis';
import { getOAuth2Client, isSignedIn } from 'svelte-google-auth';
import type { EventData } from '.';
import { openai } from '@/lib/openai';

class Chat {
	messages: any[];
	constructor(prompt: string) {
		this.messages = [
			{
				role: 'system',
				content: prompt
			}
		];
	}

	async message(message: string) {
		this.messages.push({
			role: 'user',
			content: message
		});

		const res = await openai.chat.completions.create({
			messages: this.messages,
			model: 'gpt-3.5-turbo'
		});

		const choice = res.choices.find((c) => {
			// TODO: filter bad out
			return true;
		});
		const response = choice!.message.content;
		this.messages.push({
			role: 'assistant',
			content: response
		});

		console.log('MESSAGE: ', message);
		console.log('RESPONSE: ', response);
		return response ? response : undefined;
	}
}

export const POST = (async ({ request, locals }) => {
	if (!isSignedIn(locals)) return json({}, { status: 401 });

	const { raw, today } = await request.json();

	const parsed: Partial<EventData> = {
		startDate: undefined,
		endDate: undefined,
		title: '',
		description: raw,
		location: undefined
	};

	const ctx = 'You are a helpful assistant.';

	const chat = new Chat(ctx);
	await chat.message(
		"You are a helpful information parser that answers in the exact format describes. You will be provided with a snippet of raw text corresponding to an event. Answer with just the answer, not a full sentence. If the information to answer is not present, respond with 'n/a'."
	);
	await chat.message(`Here is the raw text:
	"
	${raw}
	"

	Today is ${today}.
	`);

	parsed.title = await chat.message('Can you create a short title that describes this text?');
	parsed.location = await chat.message('What location?');
	parsed.startDate = await chat.message('What is the start date/time? MM/DD/YY HH:MM:SS AM/PM');
	parsed.endDate = await chat.message('What is the end date/time? MM/DD/YY HH:MM:SS AM/PM');

	const parseDate = (date: string | undefined) => {
		if (!date) return undefined;

		for (const s of ['pm', 'am']) {
			if (date.includes(s) && !date.includes(' ' + s)) {
				const x = date.indexOf(s);
				date = date.substring(0, x) + ' ' + date.substring(x);
			}
		}

		date = date.replaceAll("YY", ((new Date()).getUTCFullYear() % 100) + "")
		
		let iso = ''
		try {
			iso = new Date(date.trim()).toISOString();
		} catch {
			return undefined;
		}
		return iso
	};

	const addHour = (date:Date, hr:number) => {
		const n = new Date(date.getTime())
		n.setHours(n.getHours()+hr)
		return n
	} 

	parsed.startDate = parsed.startDate ? parseDate(parsed.startDate) : undefined;
	parsed.endDate = parsed.endDate ? parseDate(parsed.endDate) : undefined;
	
	if(parsed.startDate && !parsed.endDate) parsed.endDate = addHour(new Date(parsed.startDate), 1).toISOString()
	if(!parsed.startDate && parsed.endDate) parsed.startDate = addHour(new Date(parsed.endDate), -1).toISOString()

	if(parsed.startDate) parsed.startDate = parsed.startDate.replaceAll('-', '').replaceAll(':', '').replaceAll('.', '');
	if(parsed.endDate) parsed.endDate = parsed.endDate.replaceAll('-', '').replaceAll(':', '').replaceAll('.', '');

	return json({ event: parsed });
}) satisfies RequestHandler;
