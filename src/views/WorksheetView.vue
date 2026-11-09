<script setup lang="ts">
import {
	PhBookOpen,
	PhCaretDown,
	PhBook,
	PhCheck,
	PhCreditCard,
	PhEye,
	PhRectangle,
	PhSquare,
	PhTrash,
	PhUploadSimple,
} from '@phosphor-icons/vue'
import {
	type DnDEndEvent,
	DnDProvider,
	snapCenterToCursor,
} from '@vue-dnd-kit/core'
import { onClickOutside, useElementSize } from '@vueuse/core'
import {
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogRoot,
	AlertDialogTitle,
} from 'reka-ui'
import {
	computed,
	nextTick,
	onUnmounted,
	ref,
	useTemplateRef,
	watch,
} from 'vue'
import { useRouter } from 'vue-router'
import AssetPanelPhoto from '@/components/worksheet/AssetPanelPhoto.vue'
import DropArea from '@/components/worksheet/DropArea.vue'
import PanelOverlay from '@/components/worksheet/PanelOverlay.vue'
import QuickPreview from '@/components/worksheet/QuickPreview.vue'
import SlotCell from '@/components/worksheet/SlotCell.vue'
import TrashOverlay from '@/components/worksheet/TrashOverlay.vue'
import {
	slotsInThumbnail,
	slotsOnPage,
} from '@/components/worksheet/templateSlots'
import { distributeInColumns } from '@/lib/masonry'
import { getProduct, type Product, products } from '@/lib/products'
import { readPhoto } from '@/lib/readPhoto'
import { templates } from '@/lib/templates'
import {
	createWorksheet,
	type DragSource,
	type DropTarget,
	type Margins,
} from '@/lib/worksheet'

const props = defineProps<{ productId: string }>()

const router = useRouter()
const worksheet = createWorksheet(getProduct(props.productId))
// The browser history can move between products without remounting this view.
watch(
	() => props.productId,
	(productId) => {
		if (productId !== worksheet.product.id) {
			worksheet.changeProduct(getProduct(productId))
		}
	},
)
const currentTemplateId = computed(
	() => worksheet.pages[worksheet.currentPage]?.templateId,
)
const currentMargins = computed(
	() => worksheet.pages[worksheet.currentPage]?.margins ?? 'full-bleed',
)
const marginsModes: Margins[] = ['framed', 'full-bleed']

// Full bleed has no gap, so each slot of a thumbnail needs its own tone.
// Written out in full because Tailwind scans this file.
const fullBleedThumbnailTones = ['bg-neutral-300', 'bg-neutral-600', 'bg-neutral-800', 'bg-neutral-400']

const pageElement = useTemplateRef<HTMLElement>('pageElement')
const { width: pageWidthPx } = useElementSize(pageElement, undefined, {
	box: 'border-box',
})
// Zero while the page has no size yet: no slot can tell its resolution until then.
const cmPerPixel = computed(() =>
	pageWidthPx.value === 0 ? 0 : worksheet.product.widthCm / pageWidthPx.value,
)

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const photoColumnCount = 3
const photoColumns = computed(() =>
	distributeInColumns(worksheet.sortedAssetPanel(), photoColumnCount),
)

const isProductMenuOpen = ref(false)
const productSelector = useTemplateRef<HTMLElement>('productSelectorElement')
onClickOutside(productSelector, () => {
	isProductMenuOpen.value = false
})
const pendingProduct = ref<Product | null>(null)

function chooseProduct(product: Product) {
	isProductMenuOpen.value = false
	if (product.id !== worksheet.product.id) pendingProduct.value = product
}

function confirmProductChange() {
	if (pendingProduct.value) {
		worksheet.changeProduct(pendingProduct.value)
		router.replace(`/worksheet/wiski-${pendingProduct.value.id}`)
	}
	pendingProduct.value = null
}

function cancelProductChange(isOpen: boolean) {
	if (!isOpen) pendingProduct.value = null
}

onUnmounted(() => {
	for (const { url } of worksheet.photos()) URL.revokeObjectURL(url)
})

let nextPhotoId = 1

async function addPhotos(files: readonly File[]) {
	for (const file of files) {
		try {
			const { url, width, height } = await readPhoto(file)
			worksheet.upload({
				id: nextPhotoId++,
				name: file.name,
				url,
				width,
				height,
			})
		} catch {
			// An unreadable file is skipped; the rest of the batch still uploads.
		}
	}
}

function uploadPhotos(event: Event) {
	const input = event.target as HTMLInputElement
	const files = Array.from(input.files ?? [])
	// Clearing the input lets the user pick the same file again.
	input.value = ''
	addPhotos(files)
}

const returnedPhotoHighlightMs = 5000
const highlightedPhotoId = ref<number | null>(null)

async function showReturnedPhoto(photoId: number) {
	highlightedPhotoId.value = photoId
	setTimeout(() => {
		if (highlightedPhotoId.value === photoId) highlightedPhotoId.value = null
	}, returnedPhotoHighlightMs)
	await nextTick()
	document
		.querySelector(`[data-photo-id="${photoId}"]`)
		?.scrollIntoView({ block: 'nearest' })
}

// The key includes the page and its template: a slot that changes either one starts
// over, so a slot editing left open does not follow the new content.
const currentPageSlots = computed(() => {
	const page = worksheet.pages[worksheet.currentPage]
	return (page?.slots ?? []).map((photo, slot) => {
		const address = { page: worksheet.currentPage, slot }
		return {
			key: `${address.page}-${page?.templateId}-${slot}`,
			photo,
			address,
			positionAndZoom: worksheet.positionAndZoom(address),
		}
	})
})

function handleDrop({ active, over }: DnDEndEvent) {
	if (active.external) return addPhotos(active.external.files)
	if (!over) return
	const source = active.data as DragSource
	const target = over.data as DropTarget
	const returnedPhoto =
		source.kind === 'slot'
			? worksheet.pages[source.address.page]?.slots[source.address.slot]
			: null
	const deleted = worksheet.drop(source, target)
	if (deleted) URL.revokeObjectURL(deleted.url)
	if (returnedPhoto && target.kind !== 'slot')
		showReturnedPhoto(returnedPhoto.id)
}
</script>

<template>
  <DnDProvider :modifiers="[snapCenterToCursor]">
    <div class="flex h-screen flex-col overflow-hidden bg-white text-neutral-950">
      <header class="flex h-[88px] shrink-0 items-center gap-6 border-b border-neutral-200 px-6">
        <div ref="productSelectorElement" class="relative w-[200px] shrink-0" @keydown.esc="isProductMenuOpen = false">
          <button
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isProductMenuOpen"
            class="flex h-10 w-full items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 text-sm font-semibold"
            @click="isProductMenuOpen = !isProductMenuOpen"
          >
            {{ $t(`products.${worksheet.product.id}.name`) }}
            <span class="flex items-center gap-1 text-xs font-medium text-neutral-500">
              <PhBookOpen aria-hidden="true" class="size-3" />
              {{ worksheet.product.pages }}
            </span>
            <PhCaretDown aria-hidden="true" class="ml-auto size-4" />
          </button>
          <ul
            v-if="isProductMenuOpen"
            role="menu"
            class="absolute top-[calc(100%+4px)] left-0 z-20 w-[264px] rounded-[10px] border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <li v-for="product in products" :key="product.id" role="none">
              <button
                type="button"
                role="menuitem"
                class="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-neutral-100"
                :class="{ 'bg-neutral-100': product.id === worksheet.product.id }"
                @click="chooseProduct(product)"
              >
                <PhSquare v-if="product.widthCm === product.heightCm" aria-hidden="true" class="size-4 shrink-0" />
                <PhRectangle v-else aria-hidden="true" class="size-4 shrink-0 rotate-90" />
                {{ $t(`products.${product.id}.name`) }}
                <span class="flex items-center gap-1 text-xs font-medium text-neutral-500">
                  <PhBookOpen aria-hidden="true" class="size-3" />
                  {{ product.pages }}
                </span>
                <PhCheck v-if="product.id === worksheet.product.id" aria-hidden="true" class="ml-auto size-4" />
              </button>
            </li>
          </ul>
        </div>

        <div aria-hidden="true" class="w-[200px] shrink-0" />
        <QuickPreview
          class="max-w-[816px] flex-1"
          :pages="worksheet.pages"
          :current="worksheet.currentPage"
          :aspect-ratio="`${worksheet.product.widthCm} / ${worksheet.product.heightCm}`"
          :position-and-zoom="worksheet.positionAndZoom"
          @select="(page) => (worksheet.currentPage = page)"
          @previous="worksheet.previousPage()"
          @next="worksheet.nextPage()"
        />
      </header>

      <div class="flex min-h-0 flex-1">
        <DropArea
          as="aside"
          :target="{ kind: 'asset-panel' }"
          :external="{ files: 'image/*' }"
          :overlay="PanelOverlay"
          class="flex w-[408px] shrink-0 flex-col border-r border-neutral-200 bg-white data-[over=true]:bg-neutral-50"
          @drop="handleDrop"
        >
          <div class="flex h-14 shrink-0 items-center gap-2 px-4">
            <button
              type="button"
              :aria-label="$t('editor.sort.vertical')"
              :title="$t('editor.sort.vertical')"
              :aria-pressed="worksheet.sort === 'vertical'"
              class="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white"
              @click="worksheet.toggleSort('vertical')"
            >
              <PhRectangle aria-hidden="true" class="size-4 rotate-90" />
            </button>
            <button
              type="button"
              :aria-label="$t('editor.sort.horizontal')"
              :title="$t('editor.sort.horizontal')"
              :aria-pressed="worksheet.sort === 'horizontal'"
              class="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white"
              @click="worksheet.toggleSort('horizontal')"
            >
              <PhRectangle aria-hidden="true" class="size-4" />
            </button>
          </div>

          <div class="relative min-h-0 flex-1">
            <div class="h-full overflow-y-auto px-4">
              <button
                v-if="worksheet.assetPanel.length === 0"
                type="button"
                class="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-sm text-neutral-500"
                @click="fileInput?.click()"
              >
                <PhUploadSimple aria-hidden="true" class="size-6 text-neutral-400" />
                {{ $t('editor.uploadHint') }}
              </button>
              <ul v-else :aria-label="$t('editor.photos')" class="flex gap-2">
                <li v-for="(column, columnIndex) in photoColumns" :key="columnIndex" class="min-w-0 flex-1">
                  <ul class="flex flex-col gap-2">
                    <AssetPanelPhoto v-for="photo in column" :key="photo.id" :photo="photo" :highlighted="photo.id === highlightedPhotoId" />
                  </ul>
                </li>
              </ul>
            </div>
            <DropArea
              :target="{ kind: 'trash' }"
              :overlay="TrashOverlay"
              :title="$t('editor.trash')"
              class="absolute bottom-[91px] left-4 flex size-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] data-[over=true]:border-neutral-900 data-[over=true]:bg-neutral-900 data-[over=true]:text-white"
              @drop="handleDrop"
            >
              <PhTrash aria-hidden="true" class="size-5" />
              <span class="sr-only">{{ $t('editor.trash') }}</span>
            </DropArea>
          </div>

          <div class="shrink-0 p-4">
            <label
              :title="$t('editor.upload')"
              class="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-white has-focus-visible:ring-2 has-focus-visible:ring-neutral-900"
            >
              <PhUploadSimple aria-hidden="true" class="size-4" />
              <span class="sr-only">{{ $t('editor.upload') }}</span>
              <input ref="fileInput" type="file" accept="image/*" multiple class="sr-only" @change="uploadPhotos" />
            </label>
          </div>
        </DropArea>

        <div class="flex min-w-0 flex-1 flex-col">
        <section :aria-label="$t('editor.worksheet')" class="relative flex min-h-0 flex-1 items-center justify-center bg-neutral-100">
          <div
            ref="pageElement"
            class="h-[540px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            :style="{ aspectRatio: `${worksheet.product.widthCm} / ${worksheet.product.heightCm}` }"
          >
            <ul class="grid h-full w-full" :class="slotsOnPage(currentTemplateId ?? '', currentMargins)">
              <SlotCell
                v-for="slot in currentPageSlots"
                :key="slot.key"
                :photo="slot.photo"
                :address="slot.address"
                :position-and-zoom="slot.positionAndZoom"
                :cm-per-pixel="cmPerPixel"
                @zoom="(zoom) => worksheet.setZoom(slot.address, zoom)"
                @reset="worksheet.resetPositionAndZoom(slot.address)"
                @position="(position) => worksheet.setPosition(slot.address, position)"
                @drop="handleDrop"
              />
            </ul>
          </div>

          <!-- PROTOTYPE: order buttons without behavior, to feel the interaction. Delete or replace. -->
          <div class="absolute right-8 bottom-5 flex flex-col items-center gap-2.5">
            <button
              type="button"
              :aria-label="$t('editor.pay')"
              :title="$t('editor.pay')"
              class="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <PhCreditCard aria-hidden="true" class="size-10" />
            </button>
            <button
              type="button"
              :aria-label="$t('editor.editCover')"
              :title="$t('editor.editCover')"
              class="flex size-14 items-center justify-center rounded-full border border-border bg-background text-primary shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <PhBook aria-hidden="true" class="size-7" />
            </button>
            <button
              type="button"
              :aria-label="$t('editor.previewPdf')"
              :title="$t('editor.previewPdf')"
              class="flex size-14 items-center justify-center rounded-full border border-border bg-background text-primary shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <PhEye aria-hidden="true" class="size-8" />
            </button>
          </div>
        </section>

        <div class="flex h-[72px] shrink-0 items-center justify-center gap-6 border-t border-neutral-200 px-4">
          <div aria-hidden="true" class="w-[200px] shrink-0" />
            <div role="radiogroup" :aria-label="$t('editor.templates.label')" class="flex items-center justify-center gap-2">
              <button
                v-for="template in templates"
                :key="template.id"
                type="button"
                role="radio"
                :aria-checked="template.id === currentTemplateId"
                :aria-label="$t(`editor.templates.${template.id}`)"
                :title="$t(`editor.templates.${template.id}`)"
                class="h-11 overflow-hidden rounded-md border border-neutral-200 bg-white aria-checked:border-2 aria-checked:border-neutral-900"
            :style="{ aspectRatio: `${worksheet.product.widthCm} / ${worksheet.product.heightCm}` }"
                @click="worksheet.changeTemplate(worksheet.currentPage, template.id)"
              >
                <span class="grid h-full w-full" :class="slotsInThumbnail(template.id, currentMargins)">
                  <span
                    v-for="slot in template.slotCount"
                    :key="slot"
                    class="rounded-[1px]"
                    :class="currentMargins === 'full-bleed' ? fullBleedThumbnailTones[slot - 1] : 'bg-neutral-300'"
                  />
                </span>
              </button>
            </div>
          <div role="radiogroup" :aria-label="$t('editor.margins.label')" class="flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
            <button
              v-for="margins in marginsModes"
              :key="margins"
              type="button"
              role="radio"
              :aria-checked="margins === currentMargins"
              class="h-[30px] rounded-md px-3 text-[13px] font-medium text-neutral-500 aria-checked:border aria-checked:border-neutral-200 aria-checked:bg-white aria-checked:font-semibold aria-checked:text-neutral-950"
              @click="worksheet.changeMargins(worksheet.currentPage, margins)"
            >
              {{ $t(`editor.margins.${margins}`) }}
            </button>
          </div>
          <div aria-hidden="true" class="w-[200px] shrink-0" />
        </div>
        </div>
      </div>
    </div>

    <AlertDialogRoot :open="pendingProduct !== null" @update:open="cancelProductChange">
      <AlertDialogPortal>
        <AlertDialogOverlay class="fixed inset-0 z-30 bg-neutral-950/50" />
        <AlertDialogContent
          class="fixed top-1/2 left-1/2 z-40 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.16)]"
        >
          <AlertDialogTitle class="text-lg font-semibold">{{ $t('editor.changeProduct.title') }}</AlertDialogTitle>
          <AlertDialogDescription class="mt-2 text-sm text-neutral-500">
            {{ $t('editor.changeProduct.message') }}
          </AlertDialogDescription>
          <div class="mt-6 flex justify-end gap-2">
            <AlertDialogCancel class="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium">
              {{ $t('editor.changeProduct.cancel') }}
            </AlertDialogCancel>
            <button type="button" class="h-10 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-neutral-50" @click="confirmProductChange">
              {{ $t('editor.changeProduct.confirm') }}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </DnDProvider>
</template>
