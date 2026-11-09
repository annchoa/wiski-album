import type { Size } from './geometry'
import type { Rect } from './slotRects'
import type { PositionAndZoom } from './worksheet'

// The region of the photo, in photo pixels, that shows inside the slot.
// It follows the editor: `object-cover`, `object-position` and
// `transform: scale(zoom)` around the same point as the position.
export function visibleCrop(
	photo: Size,
	slot: Size,
	{ position, zoom }: PositionAndZoom,
): Rect {
	const scale = Math.max(slot.width / photo.width, slot.height / photo.height)
	const coveredWidth = photo.width * scale
	const coveredHeight = photo.height * scale
	// Where the covered photo starts inside the slot, before the zoom.
	const offsetX = (slot.width - coveredWidth) * position.x
	const offsetY = (slot.height - coveredHeight) * position.y
	// The zoom keeps the focus point fixed, so the slot's edges move toward it.
	const edgeX = slot.width * position.x * (1 - 1 / zoom)
	const edgeY = slot.height * position.y * (1 - 1 / zoom)
	return {
		x: (edgeX - offsetX) / scale,
		y: (edgeY - offsetY) / scale,
		width: slot.width / (zoom * scale),
		height: slot.height / (zoom * scale),
	}
}
