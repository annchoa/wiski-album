const cmPerInch = 2.54

interface Size {
	width: number
	height: number
}

export function effectiveResolution({
	photo,
	slotCm,
	zoom,
}: {
	photo: Size
	slotCm: Size
	zoom: number
}): number | null {
	if (slotCm.width === 0 || slotCm.height === 0) return null
	const slotInches = {
		width: slotCm.width / cmPerInch,
		height: slotCm.height / cmPerInch,
	}
	const coveringSide = Math.min(
		photo.width / slotInches.width,
		photo.height / slotInches.height,
	)
	return coveringSide / zoom
}

const lowResolutionBelow = 150

export function isLowResolution(resolution: number | null): boolean {
	return resolution !== null && resolution < lowResolutionBelow
}
