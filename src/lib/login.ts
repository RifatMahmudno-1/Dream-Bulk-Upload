import {
	parseAndSaveCookies,
	stringifySavedCookies,
	parseAndSaveToken,
	getToken
} from './commons.ts'

async function getAndParseLoginPage() {
	const headers = new Headers()
	headers.append(
		'User-Agent',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0'
	)

	const req = await fetch('https://dream.rifatalmuin.com/login', {
		method: 'GET',
		headers,
		redirect: 'error'
	})
	if (!req.ok) throw new Error(`Failed to fetch login page: ${req.statusText}`)

	parseAndSaveCookies(req.headers)
	parseAndSaveToken(await req.text())
}

export async function login(email: string, password: string) {
	await getAndParseLoginPage()

	const body = new URLSearchParams()
	body.append('_token', getToken())
	body.append('email', email)
	body.append('password', password)
	body.append('remember', 'on')

	const headers = new Headers()
	headers.append('Content-Type', 'application/x-www-form-urlencoded')
	headers.append(
		'User-Agent',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0'
	)
	headers.append('Cookie', stringifySavedCookies())

	const req = await fetch('https://dream.rifatalmuin.com/login', {
		method: 'POST',
		body,
		headers,
		redirect: 'manual'
	})
	if (req.status !== 302 && !req.ok) {
		throw new Error(`Failed to login: ${req.statusText}`)
	}

	parseAndSaveCookies(req.headers)
}
