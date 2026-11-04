<script setup lang="ts">
import { Plus } from '@lucide/vue'
import {
	type DnDEndEvent,
	makeDraggable,
	makeDroppable,
} from '@vue-dnd-kit/core'
import { computed, useTemplateRef } from 'vue'
import type { Photo, SlotAddress } from '@/lib/worksheet'

const props = defineProps<{ photo: Photo | null; address: SlotAddress }>()
const emit = defineEmits<{ drop: [event: DnDEndEvent] }>()

makeDraggable(useTemplateRef<HTMLElement>('handle'), {
	data: () => ({
		kind: 'slot',
		address: props.address,
		photo: props.photo,
	}),
	label: () => props.photo?.name,
	disabled: () => props.photo === null,
})
const { isOver } = makeDroppable(useTemplateRef<HTMLElement>('cell'), {
	data: () => ({ kind: 'slot', address: props.address }),
	onDrop: (event) => emit('drop', event),
})

const stateClasses = computed(() =>
	props.photo
		? 'cursor-grab bg-neutral-300'
		: 'border border-dashed border-neutral-400 bg-neutral-50 text-neutral-400',
)
</script>

<template>
  <li ref="cell" :data-over="isOver" class="group min-h-0 min-w-0">
    <div
      ref="handle"
      class="flex h-full w-full items-center justify-center overflow-hidden outline-none group-data-[over=true]:bg-neutral-200 group-data-[over=true]:ring-2 group-data-[over=true]:ring-neutral-900 group-data-[over=true]:ring-inset"
      :class="stateClasses"
    >
      <img v-if="photo" :src="photo.url" :alt="photo.name" class="h-full w-full object-cover" draggable="false" />
      <Plus v-else aria-hidden="true" class="size-6" />
    </div>
  </li>
</template>
