<script setup lang="ts">
import type { Photo } from '@/lib/worksheet'

defineProps<{ photo: Photo | undefined }>()
</script>

<template>
  <img v-if="photo" :src="photo.url" :alt="photo.name" draggable="false" class="size-full rounded-md object-cover" />
</template>
