import type { Point } from './geometry'

// A Handle is named after its compass point on the Selection box.
export type Handle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se'

export const handles: Handle[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

export interface Box {
	x: number
	y: number
	width: number
	height: number
}

// Dragging can pull a Handle past the opposite side: the box never flips.
const smallestScale = 0.01

function isCorner(handle: Handle) {
	return handle.length === 2
}

// How much one drag axis grows the box: 1 means no change.
function scaleOnAxis(size: number, growth: number) {
	return Math.max((size + growth) / size, smallestScale)
}

// Scales the box and keeps the side opposite to the Handle where it is.
// A box with no opposite side on an axis (a side Handle) grows from its center.
function scaleFrom(box: Box, handle: Handle, scale: number): Box {
	const width = box.width * scale
	const height = box.height * scale
	const fixedLeft = handle.includes('e')
	const fixedRight = handle.includes('w')
	const fixedTop = handle.includes('s')
	const fixedBottom = handle.includes('n')

	let x = box.x + (box.width - width) / 2
	if (fixedLeft) x = box.x
	if (fixedRight) x = box.x + box.width - width
	let y = box.y + (box.height - height) / 2
	if (fixedTop) y = box.y
	if (fixedBottom) y = box.y + box.height - height

	return { x, y, width, height }
}

function growthAlongX(handle: Handle, delta: Point) {
	return handle.includes('w') ? -delta.x : delta.x
}

function growthAlongY(handle: Handle, delta: Point) {
	return handle.includes('n') ? -delta.y : delta.y
}

// Only the width changes, and the side opposite to the Handle stays.
function resizeWidth(box: Box, handle: Handle, delta: Point): Box {
	const width = box.width * scaleOnAxis(box.width, growthAlongX(handle, delta))
	const x = handle === 'w' ? box.x + box.width - width : box.x
	return { ...box, x, width }
}

// A text has no height of its own to drag: the browser decides it.
export function dragHandle(
	box: Box,
	handle: Handle,
	delta: Point,
	{ lockProportion = false } = {},
): Box {
	if (isCorner(handle)) {
		const scaleX = scaleOnAxis(box.width, growthAlongX(handle, delta))
		const scaleY = scaleOnAxis(box.height, growthAlongY(handle, delta))
		// The bigger drag decides: the one farther from "no change".
		const scale = Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY
		return scaleFrom(box, handle, scale)
	}

	const isHorizontalSide = handle === 'e' || handle === 'w'
	if (lockProportion) {
		const scale = isHorizontalSide
			? scaleOnAxis(box.width, growthAlongX(handle, delta))
			: scaleOnAxis(box.height, growthAlongY(handle, delta))
		return scaleFrom(box, handle, scale)
	}
	return isHorizontalSide ? resizeWidth(box, handle, delta) : box
}
