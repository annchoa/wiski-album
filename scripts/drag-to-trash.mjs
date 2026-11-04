// Example: drag the first photo of the asset panel onto the trash.
// Needs `make up` running. Usage: node scripts/drag-to-trash.mjs [screenshot.png]
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dragTo, drop, launch } from './cdp.mjs'
import { uploadPhotos } from './fixtures.mjs'

const screenshotFile = process.argv[2] ?? join(tmpdir(), 'drag-to-trash.png')
const trash = [38, 583]

const browser = await launch('http://localhost:5173/worksheet/wiski-moment')
await browser.evaluate(uploadPhotos(4))
await browser.sleep(900)

const centerOfFirstPhoto = JSON.parse(
	await browser.evaluate(`(() => {
		const { x, y, width, height } = document.querySelector('[data-photo-id="1"]').getBoundingClientRect()
		return JSON.stringify([x + width / 2, y + height / 2])
	})()`),
)
const countPhotos = () =>
	browser.evaluate("document.querySelectorAll('aside li img').length")

console.log('photos before:', await countPhotos())
await dragTo(browser, centerOfFirstPhoto, trash)
await browser.sleep(400)
await browser.screenshot(screenshotFile)
await drop(browser, trash)
await browser.sleep(600)
console.log('photos after:', await countPhotos())
console.log('screenshot mid-drag:', screenshotFile)
browser.close()
