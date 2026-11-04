import type { Photo } from './worksheet'

// Every column has the same width, so a photo's height is proportional to height / width.
export function distributeInColumns(photos: Photo[], columnCount: number) {
	const columns: Photo[][] = Array.from({ length: columnCount }, () => [])
	const heights = Array(columnCount).fill(0)

	for (const photo of photos) {
		const shortest = heights.indexOf(Math.min(...heights))
		columns[shortest]?.push(photo)
		heights[shortest] += photo.height / photo.width
	}
	return columns
}
