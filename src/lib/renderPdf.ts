import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

export interface LoadedPdf {
	// Draws the page (from 0) on the canvas, `widthPx` wide on screen.
	renderPage(
		index: number,
		canvas: HTMLCanvasElement,
		widthPx: number,
	): Promise<void>
	destroy(): void
}

export async function loadPdf(bytes: Uint8Array): Promise<LoadedPdf> {
	// pdf.js takes over the buffer it receives, so it gets a copy.
	const loadingTask = getDocument({ data: bytes.slice() })
	const document = await loadingTask.promise
	return {
		async renderPage(index, canvas, widthPx) {
			const page = await document.getPage(index + 1)
			const unscaled = page.getViewport({ scale: 1 })
			const pixelRatio = window.devicePixelRatio || 1
			const viewport = page.getViewport({
				scale: (widthPx / unscaled.width) * pixelRatio,
			})
			canvas.width = Math.floor(viewport.width)
			canvas.height = Math.floor(viewport.height)
			canvas.style.width = `${widthPx}px`
			canvas.style.height = `${(widthPx * unscaled.height) / unscaled.width}px`
			await page.render({ canvas, viewport }).promise
		},
		destroy() {
			loadingTask.destroy()
		},
	}
}
