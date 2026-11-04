<script setup lang="ts">
import type { OverlayProps } from '@vue-dnd-kit/core'
import type { Photo } from '@/lib/worksheet'
import DraggedThumb from './DraggedThumb.vue'

const props = defineProps<OverlayProps>()
const photo = (props.active.data as { photo?: Photo }).photo
</script>

<!-- Shrinks the dragged photo so the asset panel stays visible underneath. -->
<template>
  <div class="flex h-full w-full items-center justify-center">
    <div class="size-20 animate-in zoom-in-[3] fade-in duration-200 shadow-lg">
      <DraggedThumb :photo="photo" />
    </div>
  </div>
</template>
