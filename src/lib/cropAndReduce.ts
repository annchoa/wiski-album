import type { Rect } from './slotRects'
import type { Photo } from './worksheet'

// Quick preview quality: a small copy that is quick to build, not fit for printing.
const maxLongSidePx = 1000
const jpegQuality = 0.7

// Cuts the region of the photo that shows in its slot and shrinks it to a JPEG.
export async function cropAndReduce(
	photo: Photo,
	crop: Rect,
): Promise<Uint8Array> {
	const image = new Image()
	image.src = photo.url
	await image.decode()

	// A photo smaller than the limit is not enlarged.
	const scale = Math.min(1, maxLongSidePx / Math.max(crop.width, crop.height))
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(1, Math.round(crop.width * scale))
	canvas.height = Math.max(1, Math.round(crop.height * scale))
	const context = canvas.getContext('2d')
	if (!context) throw new Error('The canvas has no 2D context')
	context.drawImage(
		image,
		crop.x,
		crop.y,
		crop.width,
		crop.height,
		0,
		0,
		canvas.width,
		canvas.height,
	)

	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, 'image/jpeg', jpegQuality),
	)
	if (!blob) throw new Error('The canvas could not make a JPEG')
	return new Uint8Array(await blob.arrayBuffer())
}
