import type { Point, Size } from './geometry'

// A photo covering the slot overflows it on one axis. Zoom grows both, so moving
// `position` by one unit shifts the photo by (zoom × covered size − slot size) pixels.
function pixelsPerPositionUnit(
	photo: Size,
	slotPx: Size,
	zoom: number,
): { x: number; y: number } {
	const coverScale = Math.max(
		slotPx.width / photo.width,
		slotPx.height / photo.height,
	)
	return {
		x: zoom * photo.width * coverScale - slotPx.width,
		y: zoom * photo.height * coverScale - slotPx.height,
	}
}

// Measured sizes carry decimals, so "no room" can show up as a fraction of a pixel.
const minRoomPx = 0.5

// Where the photo has no room to move, the position stays where it is.
function movedAlong(position: number, dragPx: number, pxPerUnit: number) {
	return pxPerUnit >= minRoomPx ? position - dragPx / pxPerUnit : position
}

export function positionAfterDrag({
	position,
	zoom,
	photo,
	slotPx,
	drag,
}: {
	position: Point
	zoom: number
	photo: Size
	slotPx: Size
	drag: Point
}): Point {
	const perUnit = pixelsPerPositionUnit(photo, slotPx, zoom)
	return {
		x: movedAlong(position.x, drag.x, perUnit.x),
		y: movedAlong(position.y, drag.y, perUnit.y),
	}
}
