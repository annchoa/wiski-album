<script setup lang="ts">
import { PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue'
import { useTemplateRef, watch } from 'vue'
import { slotsInThumbnailPanel } from '@/components/worksheet/templateSlots'
import {
	isEmpty,
	type Page,
	type PositionAndZoom,
	type SlotAddress,
} from '@/lib/worksheet'

const props = defineProps<{
	pages: Page[]
	current: number
	// CSS aspect ratio of one Page, e.g. `20 / 28`.
	aspectRatio: string
	positionAndZoom: (address: SlotAddress) => PositionAndZoom
}>()
defineEmits<{
	select: [page: number]
	previous: []
	next: []
}>()

function photoStyle(address: SlotAddress) {
	const { position, zoom } = props.positionAndZoom(address)
	const focus = `${position.x * 100}% ${position.y * 100}%`
	return {
		objectPosition: focus,
		transformOrigin: focus,
		transform: `scale(${zoom})`,
	}
}

// The strip scrolls sideways, so a Page picked with the arrows may be out of sight.
const thumbnails = useTemplateRef<HTMLElement>('thumbnails')
watch(
	() => props.current,
	() => {
		thumbnails.value
			?.querySelector('[aria-current="page"]')
			?.scrollIntoView?.({ inline: 'center', block: 'nearest' })
	},
	{ flush: 'post' },
)
</script>

<template>
  <div role="group" :aria-label="$t('editor.thumbnailPanel.label')" class="flex min-w-0 items-start gap-3">
    <button
      type="button"
      :aria-label="$t('editor.previousPage')"
      :title="$t('editor.previousPage')"
      :disabled="current === 0"
      class="mt-2.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
      @click="$emit('previous')"
    >
      <PhCaretLeft aria-hidden="true" class="size-4" />
    </button>

    <ol ref="thumbnails" class="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none]">
      <li v-for="(page, index) in pages" :key="index" class="shrink-0">
        <button
          type="button"
          :aria-current="index === current ? 'page' : undefined"
          :aria-label="$t(isEmpty(page) ? 'editor.thumbnailPanel.emptyPage' : 'editor.thumbnailPanel.page', { number: index + 1 })"
          class="flex flex-col items-center gap-1"
          @click="$emit('select', index)"
        >
          <span
            aria-hidden="true"
            class="grid h-[52px] overflow-hidden rounded bg-white"
            :class="[slotsInThumbnailPanel(page.templateId, page.margins), index === current ? 'border-2 border-neutral-950' : 'border border-neutral-200']"
            :style="{ aspectRatio }"
          >
            <span v-for="(photo, slot) in page.slots" :key="slot" class="min-h-0 min-w-0 overflow-hidden" :class="photo ? 'bg-neutral-300' : 'bg-neutral-200'">
              <img v-if="photo" :src="photo.url" alt="" class="h-full w-full object-cover" :style="photoStyle({ page: index, slot })" draggable="false" />
            </span>
          </span>
          <span aria-hidden="true" class="text-[11px]" :class="index === current ? 'font-semibold text-neutral-950' : 'font-medium text-neutral-500'">{{ index + 1 }}</span>
        </button>
      </li>
    </ol>

    <button
      type="button"
      :aria-label="$t('editor.nextPage')"
      :title="$t('editor.nextPage')"
      :disabled="current === pages.length - 1"
      class="mt-2.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white disabled:opacity-40"
      @click="$emit('next')"
    >
      <PhCaretRight aria-hidden="true" class="size-4" />
    </button>
  </div>
</template>
