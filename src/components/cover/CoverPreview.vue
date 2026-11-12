<script setup lang="ts">
import { PhTrash } from '@phosphor-icons/vue'
import {
	useElementSize,
	useEventListener,
	useResizeObserver,
} from '@vueuse/core'
import { computed, nextTick, ref, shallowReactive, useTemplateRef } from 'vue'
import {
	type CoverElementId,
	type createCover,
	illustrationElementId,
	illustrationKeyOf,
} from '@/lib/cover'
import type { Point } from '@/lib/geometry'
import { type Box, dragHandle, type Handle, handles } from '@/lib/handles'
import { illustrationUrl } from '@/lib/illustrations'
import { titleWeight } from '@/lib/typefaces'

type TextId = 'title' | 'dateLine'

const props = defineProps<{
	cover: ReturnType<typeof createCover>
	// The height of the sheet as a fraction of its width.
	sheetHeight: number
}>()

const textIds: TextId[] = ['title', 'dateLine']

const sheet = useTemplateRef<HTMLElement>('sheet')
const { width: sheetWidthPx } = useElementSize(sheet, undefined, {
	box: 'border-box',
})

// The browser wraps the lines, so the model learns the height from here.
const textElements = shallowReactive(new Map<TextId, HTMLElement>())
function rememberTextElement(id: TextId, element: unknown) {
	if (element instanceof HTMLElement) textElements.set(id, element)
	else textElements.delete(id)
}
// A text changes height when the sheet, its width, its letters or its Typeface change.
useResizeObserver(
	computed(() => [sheet.value, ...textElements.values()]),
	() => reportTextHeights(),
)
function reportTextHeights() {
	if (sheetWidthPx.value === 0) return
	for (const [id, element] of textElements) {
		props.cover.setTextHeight(id, element.offsetHeight / sheetWidthPx.value)
	}
}

function boxStyle(box: { x: number; y: number; width: number }) {
	return {
		left: `${box.x * 100}%`,
		top: `${(box.y / props.sheetHeight) * 100}%`,
		width: `${box.width * 100}%`,
	}
}

// Container query units: 1cqw is 1% of the sheet width, so letters scale with it.
function textStyle(id: TextId) {
	const text = props.cover[id]
	if (!text) return {}
	return {
		...boxStyle(text),
		fontSize: `${text.fontSize * 100}cqw`,
		fontFamily: `'${text.typeface}'`,
		// The Title is bold in the design; the Date line is regular.
		fontWeight: id === 'title' ? titleWeight(text.typeface) : 400,
		color: props.cover.colorScheme.textColor,
	}
}

const selectedBox = computed(() => {
	const { selected } = props.cover
	if (selected === null) return null
	const element = props.cover.elementOf(selected)
	if (!element) return null
	return {
		style: {
			...boxStyle(element),
			height: `${(element.height / props.sheetHeight) * 100}%`,
		},
		isText: selected === 'title' || selected === 'dateLine',
	}
})

function select(id: CoverElementId) {
	props.cover.select(id)
}

const editing = ref<TextId | null>(null)
const draft = ref('')
async function startEditing(id: TextId) {
	const text = props.cover[id]
	if (!text) return
	draft.value = text.text
	editing.value = id
	await nextTick()
	sheet.value?.querySelector('textarea')?.focus()
}
function finishEditing() {
	if (editing.value) props.cover.setText(editing.value, draft.value)
	editing.value = null
}

// A drag in progress: the box as it was when the drag began, and where the pointer was.
interface Gesture {
	id: CoverElementId
	// `null` moves the element; a Handle resizes it.
	handle: Handle | null
	pointerStart: Point
	boxStart: Box
}
const gesture = ref<Gesture | null>(null)

function startGesture(
	id: CoverElementId,
	handle: Handle | null,
	event: PointerEvent,
) {
	const element = props.cover.elementOf(id)
	if (!element) return
	select(id)
	// `pointerdown.prevent` stops the browser from focusing the sheet, and the
	// Delete key only reaches the sheet while it has the focus.
	sheet.value?.focus()
	gesture.value = {
		id,
		handle,
		pointerStart: { x: event.clientX, y: event.clientY },
		boxStart: {
			x: element.x,
			y: element.y,
			width: element.width,
			height: element.height,
		},
	}
}

useEventListener(window, 'pointermove', (event: PointerEvent) => {
	const drag = gesture.value
	if (!drag || sheetWidthPx.value === 0) return
	// Sizes are fractions of the sheet width, on both axes.
	const delta = {
		x: (event.clientX - drag.pointerStart.x) / sheetWidthPx.value,
		y: (event.clientY - drag.pointerStart.y) / sheetWidthPx.value,
	}
	applyGesture(drag, delta)
})
// A drag that ends away from where it began makes the browser click the sheet,
// which would deselect the element the user was dragging.
let justDragged = false
useEventListener(window, ['pointerup', 'pointercancel'], () => {
	if (!gesture.value) return
	gesture.value = null
	justDragged = true
	setTimeout(() => {
		justDragged = false
	})
})
function onSheetClick() {
	if (!justDragged) props.cover.select(null)
}

function applyGesture(drag: Gesture, delta: Point) {
	const { cover } = props
	if (drag.handle === null) {
		cover.moveTo(drag.id, {
			x: drag.boxStart.x + delta.x,
			y: drag.boxStart.y + delta.y,
		})
	} else if (illustrationKeyOf(drag.id) !== null) {
		const box = dragHandle(drag.boxStart, drag.handle, delta, {
			lockProportion: true,
		})
		cover.scaleIllustration(illustrationKeyOf(drag.id) as number, box)
	} else if (drag.id !== 'title' && drag.id !== 'dateLine') {
		return
	} else if (drag.handle.length === 2) {
		cover.scaleText(drag.id, dragHandle(drag.boxStart, drag.handle, delta))
	} else {
		cover.resizeTextWidth(
			drag.id,
			dragHandle(drag.boxStart, drag.handle, delta),
		)
	}
}

// Where a Handle sits on the Selection box, and which way its cursor points.
const handleLook: Record<
	Handle,
	{ left: string; top: string; cursor: string }
> = {
	nw: { left: '0%', top: '0%', cursor: 'nwse-resize' },
	n: { left: '50%', top: '0%', cursor: 'ns-resize' },
	ne: { left: '100%', top: '0%', cursor: 'nesw-resize' },
	w: { left: '0%', top: '50%', cursor: 'ew-resize' },
	e: { left: '100%', top: '50%', cursor: 'ew-resize' },
	sw: { left: '0%', top: '100%', cursor: 'nesw-resize' },
	s: { left: '50%', top: '100%', cursor: 'ns-resize' },
	se: { left: '100%', top: '100%', cursor: 'nwse-resize' },
}
// A text has no height to drag, so it has no top or bottom side Handle.
const handlesOfSelected = computed(() =>
	selectedBox.value?.isText
		? handles.filter((handle) => handle !== 'n' && handle !== 's')
		: handles,
)

function onKeydown(event: KeyboardEvent) {
	if (editing.value) return
	if (event.key === 'Delete' || event.key === 'Backspace') {
		props.cover.deleteSelected()
	}
}
</script>

<template>
  <div
    ref="sheet"
    role="group"
    tabindex="0"
    :aria-label="$t('editor.cover.preview')"
    :style="{
      aspectRatio: `1 / ${sheetHeight}`,
      backgroundColor: cover.colorScheme.background,
      containerType: 'inline-size',
    }"
    class="relative h-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] focus-visible:outline-none"
    @click="onSheetClick"
    @keydown="onKeydown"
  >
    <!-- Only the elements are clipped at the sheet edge: the Selection box can stick out of it. -->
    <div class="absolute inset-0 overflow-hidden">
    <template v-for="id in textIds" :key="id">
      <template v-if="cover[id]">
        <textarea
          v-if="editing === id"
          v-model="draft"
          :aria-label="$t('editor.cover.editText')"
          :style="textStyle(id)"
          class="absolute resize-none overflow-hidden bg-transparent text-center leading-tight outline-none"
          rows="1"
          @click.stop
          @blur="finishEditing"
          @keydown.esc="($event.target as HTMLElement).blur()"
        />
        <div
          v-else
          :ref="(element) => rememberTextElement(id, element)"
          :style="textStyle(id)"
          class="absolute cursor-move text-center leading-tight whitespace-pre-wrap"
          @pointerdown.prevent="startGesture(id, null, $event)"
          @click.stop="select(id)"
          @dblclick.stop="startEditing(id)"
        >
          {{ cover[id]?.text }}
        </div>
      </template>
    </template>

    <div
      v-for="illustration in cover.illustrations"
      :key="illustration.key"
      :style="{ ...boxStyle(illustration), height: `${(illustration.height / sheetHeight) * 100}%` }"
      class="absolute cursor-move"
      @pointerdown.prevent="startGesture(illustrationElementId(illustration.key), null, $event)"
      @click.stop="select(illustrationElementId(illustration.key))"
    >
      <img
        :src="illustrationUrl(illustration.id)"
        :alt="$t('editor.cover.illustrationLabel')"
        draggable="false"
        class="size-full object-contain select-none"
      />
    </div>
    </div>

    <div
      v-if="selectedBox"
      role="group"
      :aria-label="$t('editor.cover.selectionBox')"
      :style="selectedBox.style"
      class="pointer-events-none absolute -m-2 box-content border-[1.5px] border-blue-500 p-2"
    >
      <span
        v-for="handle in handlesOfSelected"
        :key="handle"
        aria-hidden="true"
        :style="{ left: handleLook[handle].left, top: handleLook[handle].top, cursor: handleLook[handle].cursor }"
        class="pointer-events-auto absolute size-2.5 -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-blue-500 bg-white"
        :class="handle.length === 2 ? 'rounded-xs' : 'rounded-full'"
        @pointerdown.stop.prevent="cover.selected && startGesture(cover.selected, handle, $event)"
      />
      <button
        type="button"
        :aria-label="$t('editor.cover.delete')"
        :title="$t('editor.cover.delete')"
        class="pointer-events-auto absolute top-[calc(100%+12px)] right-0 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-950 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        @click.stop="cover.deleteSelected()"
      >
        <PhTrash aria-hidden="true" class="size-4" />
      </button>
    </div>
  </div>
</template>
