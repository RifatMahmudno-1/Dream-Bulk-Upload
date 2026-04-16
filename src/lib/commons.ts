import { load } from 'cheerio'

type CookiesType = Record<
	string,
	{ expires: number | undefined; value: string }
>

let cookies: CookiesType = {}
const getCookies = () => cookies
const setCookies = (cookiesObj: CookiesType): void => {
	cookies = cookiesObj
}

export function parseAndSaveCookies(headers: Headers) {
	const rawCookies = headers.getSetCookie()
	if (!rawCookies.length) return

	const parsedCookies: CookiesType = { ...getCookies() }

	rawCookies.forEach(el => {
		const items = el.split(';').map(e => e.trim())
		if (!items.length) return

		const firstEqIndex = items[0]!.indexOf('=')
		if (firstEqIndex === -1) return

		const cookieName = items[0]!.slice(0, firstEqIndex)
		const cookieValue = items[0]!.slice(firstEqIndex + 1)

		if (!cookieName || !cookieValue) return

		const expires = items
			.find(el => el.toLowerCase().startsWith('expires='))
			?.slice(8)

		parsedCookies[cookieName] = {
			value: cookieValue,
			expires: expires ? new Date(expires).getTime() : undefined
		}
	})

	setCookies(parsedCookies)
}

export function stringifySavedCookies() {
	const cookiesArray = []
	const savedCookies = getCookies()
	for (const cookie in savedCookies) {
		cookiesArray.push(`${cookie}=${savedCookies[cookie]!.value}`)
	}
	return cookiesArray.join('; ')
}

let token: string | undefined = undefined
const setToken = (newToken: string) => {
	token = newToken
}
export const getToken = () => token!

export function parseAndSaveToken(html: string) {
	const $ = load(html)
	const rawToken = $('input[name="_token"]')?.attr('value')
	if (!rawToken) throw new Error("Couldn't get token.")
	setToken(rawToken)
}
