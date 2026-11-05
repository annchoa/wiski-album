import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const debuggingPort = 9333

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForPage() {
	for (let attempt = 0; attempt < 50; attempt++) {
		try {
			const targets = await (
				await fetch(`http://localhost:${debuggingPort}/json`)
			).json()
			const page = targets.find(({ type }) => type === 'page')
			if (page) return page
		} catch {
			// Chrome is not listening yet.
		}
		await sleep(200)
	}
	throw new Error('Chrome did not start')
}

// Starts a headless Chrome on `url` and returns helpers to drive it over CDP.
export async function launch(url, { width = 1440, height = 768 } = {}) {
	const chrome = spawn(
		'google-chrome',
		[
			'--headless=new',
			'--no-sandbox',
			`--window-size=${width},${height}`,
			`--remote-debugging-port=${debuggingPort}`,
			// Headless reports no hover or fine pointer, so Tailwind's `hover:` variants would never apply.
			'--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
			`--user-data-dir=${join(tmpdir(), 'wiski-cdp-profile')}`,
			'about:blank',
		],
		{ stdio: 'ignore' },
	)
	const page = await waitForPage()
	const socket = new WebSocket(page.webSocketDebuggerUrl)
	await new Promise((resolve) => socket.addEventListener('open', resolve))

	let lastId = 0
	const pending = new Map()
	const events = []
	socket.addEventListener('message', ({ data }) => {
		const message = JSON.parse(data)
		if (pending.has(message.id)) {
			pending.get(message.id)(message)
			pending.delete(message.id)
		} else {
			events.push(message)
		}
	})

	const send = (method, params = {}) =>
		new Promise((resolve) => {
			const id = ++lastId
			pending.set(id, resolve)
			socket.send(JSON.stringify({ id, method, params }))
		})

	await send('Page.enable')
	await send('Runtime.enable')
	await send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: 1,
		mobile: false,
	})
	await send('Page.navigate', { url })
	await sleep(2500)

	const mouse = (type, x, y) =>
		send('Input.dispatchMouseEvent', {
			type,
			x,
			y,
			button: 'left',
			buttons: type === 'mouseReleased' ? 0 : 1,
			clickCount: 1,
		})

	return {
		send,
		sleep,
		events,
		mouse,
		async evaluate(expression) {
			const reply = await send('Runtime.evaluate', {
				expression,
				returnByValue: true,
				awaitPromise: true,
			})
			return reply.result?.result?.value
		},
		async click(x, y) {
			await mouse('mousePressed', x, y)
			await mouse('mouseReleased', x, y)
			await sleep(350)
		},
		async screenshot(file) {
			const { result } = await send('Page.captureScreenshot', {
				format: 'png',
			})
			writeFileSync(file, Buffer.from(result.data, 'base64'))
		},
		close() {
			socket.close()
			chrome.kill()
		},
	}
}

// Presses on `from` and moves to `to` in small steps, leaving the button down.
export async function dragTo(browser, from, to, steps = 12) {
	await browser.mouse('mousePressed', from[0], from[1])
	for (let step = 1; step <= steps; step++) {
		const x = from[0] + ((to[0] - from[0]) * step) / steps
		const y = from[1] + ((to[1] - from[1]) * step) / steps
		await browser.mouse('mouseMoved', x, y)
		await browser.sleep(30)
	}
}

export function drop(browser, at) {
	return browser.mouse('mouseReleased', at[0], at[1])
}
