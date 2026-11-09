import {
	decodePDFRawStream,
	PDFArray,
	PDFName,
	type PDFPage,
	PDFRawStream,
} from 'pdf-lib'

// A 4x4 JPEG: a valid image for the builder to embed.
export const tinyJpeg = Uint8Array.from(
	atob(
		'/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCWiiivLPVP/9k=',
	),
	(char) => char.charCodeAt(0),
)

function contentOf(page: PDFPage): string {
	const contents = page.node.lookup(PDFName.of('Contents'))
	const streams =
		contents instanceof PDFArray
			? contents.asArray().map((ref) => page.doc.context.lookup(ref))
			: [contents]
	return streams
		.map((stream) =>
			stream instanceof PDFRawStream
				? new TextDecoder('latin1').decode(decodePDFRawStream(stream).decode())
				: '',
		)
		.join('\n')
}

// pdf-lib writes the text of a standard font as hex strings: <48656C6C6F> Tj.
export function drawnTexts(page: PDFPage): string[] {
	return [...contentOf(page).matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)].map(
		([, hex]) =>
			String.fromCharCode(
				...(hex?.match(/../g) ?? []).map((pair) => Number.parseInt(pair, 16)),
			),
	)
}

export function drawnImageCount(page: PDFPage): number {
	return [...contentOf(page).matchAll(/\bDo\b/g)].length
}

// pdf-lib draws an image with three matrices and one Do:
// 1 0 0 1 x y cm (move), 1 0 0 1 0 0 cm (rotate), w 0 0 h 0 0 cm (scale).
export function drawnImageRects(page: PDFPage) {
	const number = '(-?[\\d.]+)'
	const move = `1 0 0 1 ${number} ${number} cm`
	const rotate = '[^\\n]* cm'
	const scale = `${number} 0 0 ${number} 0 0 cm`
	const pattern = new RegExp(
		`${move}\\s+${rotate}\\s+${scale}\\s+${rotate}\\s+/\\S+ Do`,
		'g',
	)
	return [...contentOf(page).matchAll(pattern)].map(([, x, y, w, h]) => ({
		x: Number(x),
		y: Number(y),
		width: Number(w),
		height: Number(h),
	}))
}
