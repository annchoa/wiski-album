<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type ColorScheme, colorSchemes } from '@/lib/colorSchemes'
import { type CoverElementId, illustrationKeyOf } from '@/lib/cover'
import {
	type Illustration,
	illustrations,
	illustrationUrl,
} from '@/lib/illustrations'
import { typefaces } from '@/lib/typefaces'

const props = defineProps<{
	selected: CoverElementId | null
	colorScheme: ColorScheme
	// The Typeface and the words of the selected text.
	typefaceName: string
	selectedText: string
}>()
defineEmits<{
	selectColorScheme: [colorScheme: ColorScheme]
	selectTypeface: [name: string]
	selectIllustration: [illustration: Illustration]
	done: []
}>()

// The Tool menu items, in order. Each one shows one list.
const lists = ['colors', 'typefaces', 'illustrations'] as const
type List = (typeof lists)[number]

// Selecting an element opens the list that edits it. Clearing the selection
// keeps the list the user was on.
function listOfSelected(selected: CoverElementId | null): List | null {
	if (selected === null) return null
	return illustrationKeyOf(selected) !== null ? 'illustrations' : 'typefaces'
}

const isTextSelected = computed(
	() => listOfSelected(props.selected) === 'typefaces',
)

// The default Title, "Mi destino favorito", is 19 characters long: a longer
// sample would not fit in a row.
const longestSample = 19

const sample = computed(() => {
	const words = props.selectedText.trim()
	if (!isTextSelected.value || words === '') return null
	return words.length > longestSample
		? `${words.slice(0, longestSample)}…`
		: words
})

const list = ref<List>(listOfSelected(props.selected) ?? 'colors')
watch(
	() => props.selected,
	(selected) => {
		list.value = listOfSelected(selected) ?? list.value
	},
)

function isCurrentColorScheme(candidate: ColorScheme) {
	return (
		candidate.background === props.colorScheme.background &&
		candidate.textColor === props.colorScheme.textColor
	)
}
</script>

<template>
  <div class="flex h-full w-[408px] shrink-0 flex-col bg-white">
    <div role="tablist" class="flex h-12 shrink-0 gap-2 border-b border-neutral-200 px-4">
      <button
        v-for="item in lists"
        :key="item"
        type="button"
        role="tab"
        :aria-selected="list === item"
        class="border-b-2 border-transparent px-3 text-sm text-neutral-500 aria-selected:border-neutral-950 aria-selected:font-semibold aria-selected:text-neutral-950"
        @click="list = item"
      >
        {{ $t(`editor.cover.${item}`) }}
      </button>
    </div>

    <ul
      class="min-h-0 flex-1 content-start gap-4 overflow-y-auto p-4"
      :class="list === 'typefaces' ? 'flex flex-col' : 'grid grid-cols-2'"
    >
      <template v-if="list === 'colors'">
        <li v-for="(candidate, index) in colorSchemes" :key="candidate.background + candidate.textColor">
          <button
            type="button"
            :aria-label="$t('editor.cover.colorScheme', { number: index + 1 })"
            :aria-pressed="isCurrentColorScheme(candidate)"
            :style="{ backgroundColor: candidate.background, color: candidate.textColor }"
            class="flex h-28 w-full items-center justify-center rounded-xl border border-neutral-200 text-[40px] font-semibold aria-pressed:border-2 aria-pressed:border-neutral-950"
            @click="$emit('selectColorScheme', candidate)"
          >
            Aa
          </button>
        </li>
      </template>

      <template v-else-if="list === 'typefaces'">
        <li v-for="typeface in typefaces" :key="typeface.name">
          <button
            type="button"
            :aria-label="typeface.name"
            :aria-pressed="typeface.name === typefaceName"
            :disabled="!isTextSelected"
            :style="{ fontFamily: `'${typeface.name}'` }"
            class="flex h-14 w-full items-center rounded-lg border border-neutral-200 bg-white px-4 text-[22px] aria-pressed:border-2 aria-pressed:border-neutral-950 disabled:opacity-40"
            @click="$emit('selectTypeface', typeface.name)"
          >
            {{ sample ?? $t('editor.cover.selectText') }}
          </button>
        </li>
      </template>

      <template v-else>
        <li v-for="(illustration, index) in illustrations" :key="illustration.id">
          <button
            type="button"
            :aria-label="$t('editor.cover.illustration', { number: index + 1 })"
            class="flex h-[140px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400"
            @click="$emit('selectIllustration', illustration)"
          >
            <img :src="illustrationUrl(illustration.id)" alt="" class="size-full object-contain p-3" />
          </button>
        </li>
      </template>
    </ul>

    <div class="flex h-[72px] shrink-0 items-center px-4">
      <button
        type="button"
        class="h-10 w-full rounded-lg bg-neutral-950 text-sm font-semibold text-neutral-50"
        @click="$emit('done')"
      >
        {{ $t('editor.cover.done') }}
      </button>
    </div>
  </div>
</template>
