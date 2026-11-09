import { cropAndReduce } from './cropAndReduce'
import type { Product } from './products'
import { buildQuickPreview } from './quickPreview'
import { slotRects } from './slotRects'
import { visibleCrop } from './visibleCrop'
import type { Page, PositionAndZoom, SlotAddress } from './worksheet'

export async function makeQuickPreview({
	product,
	pages,
	positionAndZoom,
	notice,
}: {
	product: Product
	pages: Page[]
	positionAndZoom: (address: SlotAddress) => PositionAndZoom
	notice: string
}): Promise<Uint8Array> {
	const pageCm = { width: product.widthCm, height: product.heightCm }
	const quickPages = await Promise.all(
		pages.map(async ({ templateId, margins, slots }, page) => {
			const rects = slotRects(templateId, margins, pageCm)
			const photos = await Promise.all(
				slots.map(async (photo, slot) => {
					const rect = rects[slot]
					if (!photo || !rect) return null
					const crop = visibleCrop(photo, rect, positionAndZoom({ page, slot }))
					return cropAndReduce(photo, crop)
				}),
			)
			return { templateId, margins, photos }
		}),
	)
	return buildQuickPreview({ pageCm, pages: quickPages, notice })
}
