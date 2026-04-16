import { openAsBlob } from 'node:fs'
import { basename } from 'node:path'
import { stringifySavedCookies, parseAndSaveCookies, parseAndSaveToken, getToken } from './commons.ts'

async function getAndParseBulkUploadPage() {
	const headers = new Headers()
	headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0')
	headers.append('Cookie', stringifySavedCookies())

	const req = await fetch('https://dream.rifatalmuin.com/donors/bulk-upload', {
		method: 'GET',
		headers,
		redirect: 'error'
	})
	if (!req.ok) throw new Error(`Failed to fetch Bulk Upload page: ${req.statusText}`)

	parseAndSaveCookies(req.headers)
	parseAndSaveToken(await req.text())
}

async function sendBulkStoreRequest() {
	const body = new URLSearchParams()
	body.append('_token', getToken())

	const headers = new Headers()
	headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0')
	headers.append('Cookie', stringifySavedCookies())
	headers.append('Content-Type', 'application/x-www-form-urlencoded')

	const req = await fetch('https://dream.rifatalmuin.com/donors/bulk-store', {
		method: 'POST',
		body,
		headers,
		redirect: 'manual'
	})

	if (req.status !== 302 && !req.ok) throw new Error(`Failed to store bulk upload: ${req.statusText}`)

	parseAndSaveCookies(req.headers)
}

export async function uploadFiles(filePath: string) {
	await getAndParseBulkUploadPage()

	const body = new FormData()
	body.append('_token', getToken())
	body.append('donor_file', await openAsBlob(filePath, { type: 'application/octet-stream' }), basename(filePath))

	const headers = new Headers()
	headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0')
	headers.append('Cookie', stringifySavedCookies())

	const req = await fetch('https://dream.rifatalmuin.com/donors/bulk-parse', {
		method: 'POST',
		body,
		headers,
		redirect: 'manual'
	})
	if (req.status !== 302 && !req.ok) throw new Error(`Failed to parse bulk upload: ${req.statusText}`)

	parseAndSaveCookies(req.headers)

	if (req.status !== 302) {
		parseAndSaveToken(await req.text())
		await sendBulkStoreRequest()
	}
}
