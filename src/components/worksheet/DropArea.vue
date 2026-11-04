<script setup lang="ts">
import {
	type DnDEndEvent,
	type ExternalAccept,
	makeDroppable,
} from '@vue-dnd-kit/core'
import { type Component, toRef, useTemplateRef } from 'vue'
import type { DropTarget } from '@/lib/worksheet'

const props = defineProps<{
	target: DropTarget
	external?: ExternalAccept
	as?: string
	overlay?: Component
}>()
const emit = defineEmits<{ drop: [event: DnDEndEvent] }>()

const { isOver } = makeDroppable(useTemplateRef<HTMLElement>('area'), {
	data: () => props.target,
	external: () => props.external,
	overOverlay: toRef(props, 'overlay'),
	onDrop: (event) => emit('drop', event),
})
</script>

<template>
  <component :is="as ?? 'div'" ref="area" :data-over="isOver">
    <slot />
  </component>
</template>
