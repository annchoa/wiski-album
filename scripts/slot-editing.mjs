// Example: place a photo on a slot, open slot editing and press zoom in, an arrow, the wheel, a drag, zoom out and reset, then check it closes when the template or the page changes.
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
const pressKey = async (key) => {
	await browser.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key })
	await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key })
	await browser.sleep(200)
	console.log(`${key}:`, await photoStyle())
}
await pressKey('ArrowRight')
const [wheelX, wheelY] = slot
await browser.send('Input.dispatchMouseEvent', {
	type: 'mouseWheel',
	x: wheelX,
	y: wheelY - 100,
	deltaX: 0,
	deltaY: -100,
})
await browser.sleep(200)
console.log('wheel up one notch:', await photoStyle())
const dragFrom = [slot[0] - 30, slot[1] - 80]
await dragTo(browser, dragFrom, [dragFrom[0] + 40, dragFrom[1] + 30])
await drop(browser, [dragFrom[0] + 40, dragFrom[1] + 30])
await browser.sleep(300)
console.log('after dragging 40 right and 30 down:', await photoStyle())
console.log(
	'photos still in the asset panel:',
	await browser.evaluate("document.querySelectorAll('aside li img').length"),
)
await press('Alejar')
const [hoverX, hoverY] = await centerOf('button[aria-label="Acercar"]')
await browser.send('Input.dispatchMouseEvent', {
	type: 'mouseMoved',
	x: hoverX,
	y: hoverY,
	buttons: 0,
})
await browser.sleep(300)
await browser.screenshot(screenshotFile)
await press('Restablecer posición y zoom')
console.log('screenshot after zoom:', screenshotFile)

const openControls = () =>
	browser.evaluate(
		'document.querySelectorAll(\'button[aria-label="Acercar"]\').length',
	)
const reopen = async () => {
	await browser.evaluate(
		"document.querySelector('section li').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))",
	)
	await browser.sleep(300)
}
await reopen()
console.log('controls open before changing template:', await openControls())
const [templateX, templateY] = await centerOf('[role="radio"]:nth-of-type(2)')
await browser.click(templateX, templateY)
console.log('controls open after changing template:', await openControls())
await reopen()
console.log('controls open before changing page:', await openControls())
const [nextX, nextY] = await centerOf('button[aria-label="Página siguiente"]')
await browser.click(nextX, nextY)
console.log('controls open after changing page:', await openControls())
browser.close()
