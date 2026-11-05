<script setup lang="ts">
import {
	BookOpen,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	RectangleHorizontal,
	RectangleVertical,
	Square,
	Trash2,
	Upload,
} from '@lucide/vue'
import {
	type DnDEndEvent,
	DnDProvider,
	snapCenterToCursor,
} from '@vue-dnd-kit/core'
import { onClickOutside } from '@vueuse/core'
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

function slotAddress(slot: number) {
	return { page: worksheet.currentPage, slot }
}

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
      <header class="flex h-16 shrink-0 items-center gap-6 border-b border-neutral-200 px-6">
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
              <BookOpen aria-hidden="true" class="size-3" />
              {{ worksheet.product.pages }}
            </span>
            <ChevronDown aria-hidden="true" class="ml-auto size-4" />
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
                <component
                  :is="product.widthCm === product.heightCm ? Square : RectangleVertical"
                  aria-hidden="true"
                  class="size-4 shrink-0"
                />
                {{ $t(`products.${product.id}.name`) }}
                <span class="flex items-center gap-1 text-xs font-medium text-neutral-500">
                  <BookOpen aria-hidden="true" class="size-3" />
                  {{ product.pages }}
                </span>
                <Check v-if="product.id === worksheet.product.id" aria-hidden="true" class="ml-auto size-4" />
              </button>
            </li>
          </ul>
        </div>

        <div role="radiogroup" :aria-label="$t('editor.templates.label')" class="flex flex-1 items-center justify-center gap-2">
          <button
            v-for="template in templates"
            :key="template.id"
            type="button"
            role="radio"
            :aria-checked="template.id === currentTemplateId"
            :aria-label="$t(`editor.templates.${template.id}`)"
            :title="$t(`editor.templates.${template.id}`)"
            class="h-[50px] w-9 overflow-hidden rounded-md border border-neutral-200 bg-white aria-checked:border-2 aria-checked:border-neutral-900"
            @click="worksheet.changeTemplate(worksheet.currentPage, template.id)"
          >
            <span class="grid h-full w-full" :class="slotsInThumbnail(template.id)">
              <span v-for="slot in template.slotCount" :key="slot" class="rounded-[1px] bg-neutral-300" />
            </span>
          </button>
        </div>

        <nav class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            :aria-label="$t('editor.previousPage')"
            :title="$t('editor.previousPage')"
            :disabled="worksheet.currentPage === 0"
            class="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
            @click="worksheet.previousPage()"
          >
            <ChevronLeft aria-hidden="true" class="size-4" />
          </button>
          <span class="text-sm font-medium">{{ worksheet.currentPage + 1 }}/{{ worksheet.product.pages }}</span>
          <button
            type="button"
            :aria-label="$t('editor.nextPage')"
            :title="$t('editor.nextPage')"
            :disabled="worksheet.currentPage === worksheet.product.pages - 1"
            class="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
            @click="worksheet.nextPage()"
          >
            <ChevronRight aria-hidden="true" class="size-4" />
          </button>
        </nav>
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
              <RectangleVertical aria-hidden="true" class="size-4" />
            </button>
            <button
              type="button"
              :aria-label="$t('editor.sort.horizontal')"
              :title="$t('editor.sort.horizontal')"
              :aria-pressed="worksheet.sort === 'horizontal'"
              class="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white"
              @click="worksheet.toggleSort('horizontal')"
            >
              <RectangleHorizontal aria-hidden="true" class="size-4" />
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
                <Upload aria-hidden="true" class="size-6 text-neutral-400" />
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
              <Trash2 aria-hidden="true" class="size-5" />
              <span class="sr-only">{{ $t('editor.trash') }}</span>
            </DropArea>
          </div>

          <div class="shrink-0 p-4">
            <label
              :title="$t('editor.upload')"
              class="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-400 bg-white has-focus-visible:ring-2 has-focus-visible:ring-neutral-900"
            >
              <Upload aria-hidden="true" class="size-4" />
              <span class="sr-only">{{ $t('editor.upload') }}</span>
              <input ref="fileInput" type="file" accept="image/*" multiple class="sr-only" @change="uploadPhotos" />
            </label>
          </div>
        </DropArea>

        <section :aria-label="$t('editor.worksheet')" class="flex min-w-0 flex-1 items-center justify-center bg-neutral-100">
          <div
            class="h-[560px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            :style="{ aspectRatio: `${worksheet.product.widthCm} / ${worksheet.product.heightCm}` }"
          >
            <ul class="grid h-full w-full" :class="slotsOnPage(currentTemplateId ?? '')">
              <SlotCell
                v-for="(photo, slotIndex) in worksheet.pages[worksheet.currentPage]?.slots"
                :key="slotIndex"
                :photo="photo"
                :address="slotAddress(slotIndex)"
                :view="worksheet.slotView(slotAddress(slotIndex))"
                @zoom="(zoom) => worksheet.setZoom(slotAddress(slotIndex), zoom)"
                @reset="worksheet.resetSlotView(slotAddress(slotIndex))"
                @position="(position) => worksheet.setPosition(slotAddress(slotIndex), position)"
                @drop="handleDrop"
              />
            </ul>
          </div>
        </section>
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
