// Example: place a photo on a slot, open slot editing and press zoom in, zoom out and reset.
// Needs `make up` running. Usage: node scripts/slot-editing.mjs [screenshot.png]
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dragTo, drop, launch } from './cdp.mjs'
import { uploadPhotos } from './fixtures.mjs'

const screenshotFile = process.argv[2] ?? join(tmpdir(), 'slot-editing.png')

const browser = await launch('http://localhost:5173/worksheet/wiski-moment')
await browser.evaluate(uploadPhotos(4))
await browser.sleep(900)

const centerOf = async (selector) =>
	JSON.parse(
		await browser.evaluate(`(() => {
			const { x, y, width, height } = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect()
			return JSON.stringify([x + width / 2, y + height / 2])
		})()`),
	)
const photoStyle = () =>
	browser.evaluate(
		"(() => { const { transform, objectPosition } = document.querySelector('section li img').style; return transform + ' / ' + objectPosition })()",
	)

const slot = await centerOf('section li')
await dragTo(browser, await centerOf('[data-photo-id="1"]'), slot)
await drop(browser, slot)
await browser.sleep(600)
console.log('placed:', await photoStyle())

await browser.evaluate(
	"document.querySelector('section li').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))",
)
await browser.sleep(300)
const press = async (label) => {
	const [x, y] = await centerOf(`button[aria-label="${label}"]`)
	await browser.click(x, y)
	console.log(`${label}:`, await photoStyle())
}
await press('Acercar')
await press('Acercar')
await press('Alejar')
await browser.screenshot(screenshotFile)
await press('Restablecer posición y zoom')
console.log('screenshot after zoom:', screenshotFile)
browser.close()
