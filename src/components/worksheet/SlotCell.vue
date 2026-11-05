<script setup lang="ts">
import { Plus, RotateCcw, ZoomIn, ZoomOut } from '@lucide/vue'
import {
	type DnDEndEvent,
	makeDraggable,
	makeDroppable,
} from '@vue-dnd-kit/core'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import type { Photo, SlotAddress, SlotView } from '@/lib/worksheet'

const props = defineProps<{
	photo: Photo | null
	address: SlotAddress
	view: SlotView
}>()
const emit = defineEmits<{
	drop: [event: DnDEndEvent]
	zoom: [zoom: number]
	reset: []
	position: [position: SlotView['position']]
}>()

makeDraggable(useTemplateRef<HTMLElement>('handle'), {
	data: () => ({
		kind: 'slot',
		address: props.address,
		photo: props.photo,
	}),
	label: () => props.photo?.name,
	disabled: () => props.photo === null,
})
const cell = useTemplateRef<HTMLElement>('cell')
const { isOver } = makeDroppable(cell, {
	data: () => ({ kind: 'slot', address: props.address }),
	onDrop: (event) => emit('drop', event),
})

const isEditing = ref(false)
onKeyStroke('Escape', () => {
	isEditing.value = false
})
onClickOutside(cell, () => {
	isEditing.value = false
})
const zoomStep = 0.25
const moveStep = 0.05
const arrowMoves = {
	ArrowRight: { x: -moveStep, y: 0 },
	ArrowLeft: { x: moveStep, y: 0 },
	ArrowUp: { x: 0, y: moveStep },
	ArrowDown: { x: 0, y: -moveStep },
}
for (const [key, move] of Object.entries(arrowMoves)) {
	onKeyStroke(key, () => {
		if (!isEditing.value) return
		const { x, y } = props.view.position
		emit('position', { x: x + move.x, y: y + move.y })
	})
}
const keyZooms = { '+': zoomStep, '-': -zoomStep }
for (const [key, change] of Object.entries(keyZooms)) {
	onKeyStroke(key, () => {
		if (isEditing.value) emit('zoom', props.view.zoom + change)
	})
}
const controls = [
	{
		label: 'editor.slotEditing.zoomOut',
		icon: ZoomOut,
		run: () => emit('zoom', props.view.zoom - zoomStep),
	},
	{
		label: 'editor.slotEditing.zoomIn',
		icon: ZoomIn,
		run: () => emit('zoom', props.view.zoom + zoomStep),
	},
	{
		label: 'editor.slotEditing.reset',
		icon: RotateCcw,
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

const stateClasses = computed(() =>
	props.photo
		? 'cursor-grab bg-neutral-300'
		: 'border border-dashed border-neutral-400 bg-neutral-50 text-neutral-400',
)
</script>

<template>
  <li ref="cell" :data-over="isOver" class="group relative min-h-0 min-w-0" @dblclick="isEditing = photo !== null">
    <div
      ref="handle"
      class="flex h-full w-full items-center justify-center overflow-hidden outline-none group-data-[over=true]:bg-neutral-200 group-data-[over=true]:ring-2 group-data-[over=true]:ring-neutral-900 group-data-[over=true]:ring-inset"
      :class="stateClasses"
    >
      <img v-if="photo" :src="photo.url" :alt="photo.name" class="h-full w-full object-cover" :style="photoStyle" draggable="false" />
      <Plus v-else aria-hidden="true" class="size-6" />
    </div>
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
