<script setup lang="ts">
import { makeDraggable } from '@vue-dnd-kit/core'
import { useTemplateRef } from 'vue'
import type { Photo } from '@/lib/worksheet'

const props = defineProps<{ photo: Photo; highlighted?: boolean }>()

makeDraggable(useTemplateRef<HTMLElement>('handle'), {
	data: () => ({
		kind: 'asset-panel',
		photoId: props.photo.id,
		photo: props.photo,
	}),
	label: () => props.photo.name,
})
</script>

<template>
  <li :data-photo-id="photo.id" class="animate-in zoom-in-50 fade-in duration-500">
    <div
      ref="handle"
      class="cursor-grab outline-none"
      :class="{ 'animate-grow-shrink': highlighted }"
    >
      <img :src="photo.url" :alt="photo.name" class="block w-full" draggable="false" />
    </div>
  </li>
</template>
