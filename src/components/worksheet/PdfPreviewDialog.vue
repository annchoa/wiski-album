<script setup lang="ts">
import {
	PhCaretLeft,
	PhCaretRight,
	PhDownloadSimple,
	PhX,
} from '@phosphor-icons/vue'
import { onKeyStroke } from '@vueuse/core'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
} from 'reka-ui'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { facingPages } from '@/lib/facingPages'
import { makeQuickPreview } from '@/lib/makeQuickPreview'
import type { Product } from '@/lib/products'
import type { LoadedPdf } from '@/lib/renderPdf'
import type { Page, PositionAndZoom, SlotAddress } from '@/lib/worksheet'

const props = defineProps<{
	open: boolean
	product: Product
	pages: Page[]
	positionAndZoom: (address: SlotAddress) => PositionAndZoom
}>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()

const { t } = useI18n()

const pageWidthPx = 340

const status = ref<'building' | 'ready' | 'error'>('building')
const bytes = ref<Uint8Array | null>(null)
let pdf: LoadedPdf | null = null
// Each build gets a number, so a build the user already closed does not show up late.
let latestBuild = 0

const facing = ref(0)
const facingList = computed(() => facingPages(props.pages.length))
const shown = computed(() => facingList.value[facing.value])
const canvases: (HTMLCanvasElement | null)[] = [null, null]

const position = computed(() => {
	const numbers = [shown.value?.left, shown.value?.right]
		.filter((index) => index !== null && index !== undefined)
		.map((index) => index + 1)
	return t('editor.pdfPreview.position', {
		pages: numbers.join('-'),
		total: props.pages.length,
	})
})

function release() {
	latestBuild++
	pdf?.destroy()
	pdf = null
	bytes.value = null
}

async function build() {
	const thisBuild = ++latestBuild
	status.value = 'building'
	facing.value = 0
	try {
		const made = await makeQuickPreview({
			product: props.product,
			pages: props.pages,
			positionAndZoom: props.positionAndZoom,
			notice: t('editor.quickPreview.notice'),
		})
		const { loadPdf } = await import('@/lib/renderPdf')
		const loaded = await loadPdf(made)
		if (thisBuild !== latestBuild) return loaded.destroy()
		pdf = loaded
		bytes.value = made
		status.value = 'ready'
	} catch {
		if (thisBuild === latestBuild) status.value = 'error'
	}
}

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) build()
		else release()
	},
	{ immediate: true },
)

watch([status, facing], async () => {
	if (status.value !== 'ready') return
	await nextTick()
	const sides = [shown.value?.left, shown.value?.right]
	for (const [side, index] of sides.entries()) {
		const canvas = canvases[side]
		if (index !== null && index !== undefined && canvas) {
			await pdf?.renderPage(index, canvas, pageWidthPx)
		}
	}
})

const canGoBack = computed(() => facing.value > 0)
const canGoForward = computed(() => facing.value < facingList.value.length - 1)

function previous() {
	if (canGoBack.value) facing.value--
}

function next() {
	if (canGoForward.value) facing.value++
}

onKeyStroke('ArrowLeft', () => {
	if (props.open) previous()
})
onKeyStroke('ArrowRight', () => {
	if (props.open) next()
})

function download() {
	if (!bytes.value) return
	const url = URL.createObjectURL(
		new Blob([bytes.value as BlobPart], { type: 'application/pdf' }),
	)
	const link = document.createElement('a')
	link.href = url
	link.download = `wiski-${props.product.id}-quick-preview.pdf`
	link.click()
	URL.revokeObjectURL(url)
}

const controlClass =
	'flex size-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white'
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-30 bg-neutral-950/50" />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-40 flex max-h-[95vh] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.16)]"
      >
        <div class="flex items-start justify-between gap-6">
          <div>
            <DialogTitle class="text-lg font-semibold">{{ $t('editor.pdfPreview.title') }}</DialogTitle>
            <DialogDescription class="mt-1 text-sm text-neutral-500">{{ $t('editor.quickPreview.notice') }}</DialogDescription>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              :aria-label="$t('editor.pdfPreview.download')"
              :title="$t('editor.pdfPreview.download')"
              :disabled="status !== 'ready'"
              :class="controlClass"
              @click="download"
            >
              <PhDownloadSimple aria-hidden="true" class="size-5" />
            </button>
            <DialogClose
              :aria-label="$t('editor.pdfPreview.close')"
              :title="$t('editor.pdfPreview.close')"
              :class="controlClass"
            >
              <PhX aria-hidden="true" class="size-5" />
            </DialogClose>
          </div>
        </div>

        <p v-if="status === 'building'" role="status" class="py-24 text-center text-sm text-neutral-500">
          {{ $t('editor.pdfPreview.building') }}
        </p>
        <p v-else-if="status === 'error'" role="alert" class="py-24 text-center text-sm text-neutral-500">
          {{ $t('editor.pdfPreview.error') }}
        </p>
        <div v-else class="flex items-center justify-center gap-4">
          <button
            type="button"
            :aria-label="$t('editor.pdfPreview.previous')"
            :title="$t('editor.pdfPreview.previous')"
            :disabled="!canGoBack"
            :class="controlClass"
            @click="previous"
          >
            <PhCaretLeft aria-hidden="true" class="size-5" />
          </button>
          <div class="flex min-h-0 items-center gap-1 bg-neutral-100 p-2">
            <template v-for="(pageIndex, side) in [shown?.left ?? null, shown?.right ?? null]" :key="side">
              <canvas
                v-if="pageIndex !== null"
                :ref="(element) => (canvases[side] = element as HTMLCanvasElement | null)"
                role="img"
                :aria-label="$t('editor.pdfPreview.page', { number: pageIndex + 1 })"
                class="bg-white"
              />
              <div v-else aria-hidden="true" :style="{ width: `${pageWidthPx}px` }" />
            </template>
          </div>
          <button
            type="button"
            :aria-label="$t('editor.pdfPreview.next')"
            :title="$t('editor.pdfPreview.next')"
            :disabled="!canGoForward"
            :class="controlClass"
            @click="next"
          >
            <PhCaretRight aria-hidden="true" class="size-5" />
          </button>
        </div>

        <p v-if="status === 'ready'" class="text-center text-sm font-medium text-neutral-700">{{ position }}</p>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
