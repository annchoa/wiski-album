<script setup lang="ts">
import type { OverlayProps } from '@vue-dnd-kit/core'
import type { Photo } from '@/lib/worksheet'
import DraggedThumb from './DraggedThumb.vue'

const props = defineProps<OverlayProps>()
const photo = (props.active.data as { photo?: Photo }).photo
</script>

<!-- Floats a small, pulsing photo above the trash: the trash stays visible and the photo reads as "about to be deleted". -->
<template>
  <div class="flex h-full w-full items-center justify-center">
    <div class="-translate-y-12 animate-pulse">
      <div class="size-12 animate-in zoom-in-[4] fade-in duration-200 rounded-md shadow-lg ring-2 ring-red-500">
        <DraggedThumb :photo="photo" />
      </div>
    </div>
  </div>
</template>
