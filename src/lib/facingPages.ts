export type FacingPages = { left: number | null; right: number | null }

export function facingPages(pageCount: number): FacingPages[] {
	if (pageCount === 0) return []
	const pairs: FacingPages[] = [{ left: null, right: 0 }]
	for (let left = 1; left < pageCount; left += 2) {
		const right = left + 1 < pageCount ? left + 1 : null
		pairs.push({ left, right })
	}
	return pairs
}
