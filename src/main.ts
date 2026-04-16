import { login } from './lib/login.ts'
import { uploadFiles } from './lib/fileUpload.ts'
import { input, password } from '@inquirer/prompts'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'

async function main() {
	let email: string = ''
	let userPassword: string = ''
	let folderPath: string = ''

	try {
		email = await input({
			message: 'Enter your email:',
			required: true,
			validate: value =>
				/\S+@\S+\.\S+/.test(value) || 'Enter a valid email address'
		})
		userPassword = await password({
			message: 'Enter your password:',
			mask: '*',
			validate: value => value.length > 0 || 'Password cannot be empty'
		})
		folderPath = await input({
			message: 'Enter the full path to the folder containing the files:',
			required: true,
			validate: value => {
				if (!existsSync(value)) return 'Path does not exist'
				if (!statSync(value).isDirectory()) return 'Path must be a directory'
				return true
			}
		})
	} catch {
		process.exit(0)
	}

	try {
		await login(email, userPassword)
	} catch (error) {
		if (process.argv.includes('--dev')) console.error(error)
		else console.error('Login failed.')
		process.exit(1)
	}

	try {
		const files = readdirSync(folderPath).filter(file =>
			statSync(join(folderPath, file)).isFile()
		)

		if (!files.length) {
			return console.log('No files found in the specified folder.')
		}

		console.log('Starting file upload... Total files:', files.length)
		for (const file of files) {
			const filePath = join(folderPath, file)
			await uploadFiles(filePath)
			console.log(`Uploaded: ${basename(filePath)}`)
		}
		console.log('All files were uploaded successfully.')
	} catch (error) {
		if (process.argv.includes('--dev')) console.error(error)
		else console.error(`File upload failed.`)
		process.exit(1)
	}
}

main()
