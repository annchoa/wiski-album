<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { applyDiscount } from '@/lib/pricing'
import { products } from '@/lib/products'

const { locale } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="border-b">
      <div class="mx-auto flex h-14 w-full max-w-[1248px] items-center justify-between px-6">
        <span class="text-xl font-bold">wiski</span>
        <NativeSelect v-model="locale" :aria-label="$t('language.label')">
          <NativeSelectOption value="es">ES</NativeSelectOption>
          <NativeSelectOption value="en">EN</NativeSelectOption>
        </NativeSelect>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-[1248px] flex-1 flex-col items-center gap-6 px-6 py-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="text-[40px] leading-tight font-bold tracking-tight">{{ $t('home.heading') }}</h1>
        <p class="text-lg text-muted-foreground">{{ $t('home.subheading') }}</p>
      </div>

      <div class="grid w-full max-w-[920px] grid-cols-1 gap-12 md:grid-cols-2">
        <Card
          v-for="product in products"
          :key="product.id"
          role="article"
          :aria-labelledby="`product-${product.id}`"
          class="gap-3 p-5"
        >
          <div class="flex h-[clamp(120px,20vh,240px)] items-center justify-center rounded-lg bg-muted">
            <!-- Placeholder: replace with the real photobook image -->
            <div
              class="h-[80%] rounded-sm bg-neutral-300"
              :style="{ aspectRatio: `${product.widthCm} / ${product.heightCm}` }"
            />
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <h2 :id="`product-${product.id}`" class="text-xl font-semibold">
              {{ $t(`products.${product.id}.name`) }}
            </h2>
            <div class="flex items-center gap-3">
              <s class="text-xl text-muted-foreground">${{ product.price }}</s>
              <strong class="text-[30px] leading-none font-bold">
                ${{ applyDiscount(product.price, product.discountPercent) }}
              </strong>
              <Badge class="h-6 px-3 text-sm">-{{ product.discountPercent }}%</Badge>
            </div>
          </div>

          <p class="text-base text-muted-foreground">
            {{ $t(`products.${product.id}.description`) }}
          </p>

          <ul class="flex flex-col gap-1 text-base font-semibold">
            <li>{{ $t('specs.size', { width: product.widthCm, height: product.heightCm }) }}</li>
            <li>{{ $t(`specs.cover.${product.cover}`) }}</li>
            <li>{{ $t('specs.pages', { count: product.pages }) }}</li>
          </ul>

          <Button as-child size="lg" class="mt-auto w-full">
            <RouterLink :to="`/worksheet/wiski-${product.id}`">
              {{ $t('home.create', { name: $t(`products.${product.id}.name`) }) }}
            </RouterLink>
          </Button>
        </Card>
      </div>
    </main>

    <footer class="border-t">
      <div class="mx-auto flex h-12 w-full max-w-[1248px] items-center px-6 text-sm text-muted-foreground">
        © {{ year }} wiski
      </div>
    </footer>
  </div>
</template>
