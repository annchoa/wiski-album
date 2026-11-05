<script setup lang="ts">
import {
	PhArrowCounterClockwise,
	PhMagnifyingGlassMinus,
	PhMagnifyingGlassPlus,
	PhPlus,
	PhWarning,
} from '@phosphor-icons/vue'
import {
	type DnDEndEvent,
	makeDraggable,
	makeDroppable,
} from '@vue-dnd-kit/core'
import { onClickOutside, onKeyStroke, useElementSize } from '@vueuse/core'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { positionAfterDrag } from '@/lib/dragPosition'
import type { Point } from '@/lib/geometry'
import { effectiveResolution, isLowResolution } from '@/lib/resolution'
import type { Photo, SlotAddress, SlotView } from '@/lib/worksheet'

const props = withDefaults(
	defineProps<{
		photo: Photo | null
		address: SlotAddress
		view: SlotView
		// How many cm one pixel of the page is; 0 while the page has no size yet.
		cmPerPixel?: number
	}>(),
	{ cmPerPixel: 0 },
)
const emit = defineEmits<{
	drop: [event: DnDEndEvent]
	zoom: [zoom: number]
	reset: []
	position: [position: Point]
}>()

const isEditing = ref(false)
function leaveEditing() {
	isEditing.value = false
}
makeDraggable(useTemplateRef<HTMLElement>('handle'), {
	data: () => ({
		kind: 'slot',
		address: props.address,
		photo: props.photo,
	}),
	label: () => props.photo?.name,
	// While editing, a drag moves the photo inside the slot instead of the slot's photo.
	disabled: () => props.photo === null || isEditing.value,
})
const cell = useTemplateRef<HTMLElement>('cell')
const { isOver } = makeDroppable(cell, {
	data: () => ({ kind: 'slot', address: props.address }),
	onDrop: (event) => emit('drop', event),
})

const { width: slotWidth, height: slotHeight } = useElementSize(
	cell,
	undefined,
	{ box: 'border-box' },
)
const lowResolution = computed(() => {
	if (!props.photo) return null
	const resolution = effectiveResolution({
		photo: props.photo,
		slotCm: {
			width: slotWidth.value * props.cmPerPixel,
			height: slotHeight.value * props.cmPerPixel,
		},
		zoom: props.view.zoom,
	})
	return resolution !== null && isLowResolution(resolution)
		? Math.round(resolution)
		: null
})

watch(() => props.photo, leaveEditing)
onKeyStroke('Escape', leaveEditing)
onClickOutside(cell, leaveEditing)

const zoomStep = 0.25
const moveStep = 0.05
const zoomPerWheelDelta = 0.0025

function zoomBy(change: number) {
	emit('zoom', props.view.zoom + change)
}

function moveBy(dx: number, dy: number) {
	const { x, y } = props.view.position
	emit('position', { x: x + dx, y: y + dy })
}

// Position says which part of the photo shows, so moving the photo one way moves it the other.
const keyActions: Record<string, () => void> = {
	ArrowRight: () => moveBy(-moveStep, 0),
	ArrowLeft: () => moveBy(moveStep, 0),
	ArrowUp: () => moveBy(0, moveStep),
	ArrowDown: () => moveBy(0, -moveStep),
	'+': () => zoomBy(zoomStep),
	'-': () => zoomBy(-zoomStep),
}
for (const [key, action] of Object.entries(keyActions)) {
	onKeyStroke(key, () => {
		if (isEditing.value) action()
	})
}

function zoomWithWheel(event: WheelEvent) {
	if (!isEditing.value) return
	event.preventDefault()
	zoomBy(-event.deltaY * zoomPerWheelDelta)
}

let lastPointer: Point | null = null

function startPanning(event: PointerEvent) {
	if (!isEditing.value) return
	lastPointer = { x: event.clientX, y: event.clientY }
	// happy-dom has no pointer capture; browsers do.
	const handle = event.currentTarget as HTMLElement
	handle.setPointerCapture?.(event.pointerId)
}

function pan(event: PointerEvent) {
	if (!lastPointer || !props.photo) return
	emit(
		'position',
		positionAfterDrag({
			position: props.view.position,
			zoom: props.view.zoom,
			photo: props.photo,
			slotPx: { width: slotWidth.value, height: slotHeight.value },
			drag: {
				x: event.clientX - lastPointer.x,
				y: event.clientY - lastPointer.y,
			},
		}),
	)
	lastPointer = { x: event.clientX, y: event.clientY }
}

function stopPanning() {
	lastPointer = null
}

const controls = [
	{
		label: 'editor.slotEditing.zoomOut',
		icon: PhMagnifyingGlassMinus,
		run: () => zoomBy(-zoomStep),
	},
	{
		label: 'editor.slotEditing.zoomIn',
		icon: PhMagnifyingGlassPlus,
		run: () => zoomBy(zoomStep),
	},
	{
		label: 'editor.slotEditing.reset',
		icon: PhArrowCounterClockwise,
		run: () => emit('reset'),
	},
]

const photoStyle = computed(() => {
	const { position, zoom } = props.view
	const focus = `${position.x * 100}% ${position.y * 100}%`
	return {
		objectPosition: focus,
		transformOrigin: focus,
		transform: `scale(${zoom})`,
	}
})

const stateClasses = computed(() => {
	if (!props.photo) {
		return 'border border-dashed border-neutral-400 bg-neutral-50 text-neutral-400'
	}
	// While editing, the open hand closes as the photo is dragged inside the slot.
	return isEditing.value
		? 'cursor-grab bg-neutral-300 active:cursor-grabbing'
		: 'cursor-grab bg-neutral-300'
})
</script>

<template>
  <li ref="cell" :data-over="isOver" class="group relative min-h-0 min-w-0" @dblclick="isEditing = photo !== null" @wheel="zoomWithWheel">
    <div
      ref="handle"
      class="flex h-full w-full items-center justify-center overflow-hidden outline-none group-data-[over=true]:bg-neutral-200 group-data-[over=true]:ring-2 group-data-[over=true]:ring-neutral-900 group-data-[over=true]:ring-inset"
      :class="stateClasses"
      @pointerdown="startPanning"
      @pointermove="pan"
      @pointerup="stopPanning"
      @pointercancel="stopPanning"
    >
      <img v-if="photo" :src="photo.url" :alt="photo.name" class="h-full w-full object-cover" :style="photoStyle" draggable="false" />
      <PhPlus v-else aria-hidden="true" class="size-6" />
    </div>
    <span
      v-if="lowResolution !== null"
      role="img"
      :aria-label="$t('editor.lowResolution', { ppp: lowResolution })"
      :title="$t('editor.lowResolution', { ppp: lowResolution })"
      class="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-800"
    >
      <PhWarning aria-hidden="true" class="size-4" />
    </span>
    <div v-if="isEditing" aria-hidden="true" class="pointer-events-none absolute inset-0 ring-2 ring-neutral-900 ring-inset" />
    <div
      v-if="isEditing"
      class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-neutral-200 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
    >
      <button
        v-for="control in controls"
        :key="control.label"
        type="button"
        :aria-label="$t(control.label)"
        :title="$t(control.label)"
        class="group/control flex size-8 cursor-pointer items-center justify-center rounded-full outline-none transition-[background-color,transform] duration-150 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 active:scale-95 motion-reduce:transition-none"
        @click="control.run"
      >
        <component :is="control.icon" aria-hidden="true" class="size-4 transition-transform duration-150 group-hover/control:scale-115 motion-reduce:transition-none" />
      </button>
    </div>
  </li>
</template>
