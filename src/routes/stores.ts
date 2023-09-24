import { browser } from "$app/environment";
import { derived, readable, writable } from "svelte/store";
import { page } from "$app/stores";

export enum Mode {
  LIGHT = 'light',
  DARK = 'dark'
}

type Theme = {
  mode: Mode,
  hue: number
}
// TODO: switch to server side
export const theme = writable<Theme>({mode: Mode.LIGHT, hue: 264}, (set) => {
  if(browser) {
    let val;
    try {
      const prev = window.localStorage.getItem('theme');
      if(!prev) throw Error("No stored theme")

      val = JSON.parse(prev)
    } catch(e) {
      console.error(e)
      val = {mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? Mode.DARK : Mode.LIGHT, hue: 264}
    }

    set(val)
  }
});

theme.subscribe((v) => {
  if(browser) {
    window.localStorage.setItem('theme', JSON.stringify(v))
  }
})

export const user = derived(page, ($page) => $page.data.auth ? $page.data.auth.user : undefined)