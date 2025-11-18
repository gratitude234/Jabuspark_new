<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p class="text-base font-semibold">{{ doc.title }}</p>
      <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-slate-400">{{ pagesLabel }} · {{ formattedSize }}</span>
        <span :class="statusBadge" class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          {{ statusLabel }}
        </span>
      </div>
      <p v-if="doc.last_opened" class="text-xs text-slate-500">
        Last · {{ new Date(doc.last_opened).toLocaleDateString() }}
      </p>
      <p v-if="doc.status === 'failed' && doc.error_message" class="mt-2 text-xs text-rose-300">
        {{ doc.error_message }}
      </p>
    </div>
    <div class="flex flex-col gap-2 text-xs md:text-sm">
      <button
        class="rounded-lg border px-3 py-2 transition"
        :class="doc.status === 'ready' ? 'border-amber-200 text-amber-200' : 'border-white/10 text-slate-500'"
        :disabled="doc.status !== 'ready'"
        @click="$emit('resume', doc)"
      >
        {{ doc.status === 'ready' ? 'Open' : 'Waiting' }}
      </button>
      <button
        v-if="doc.status === 'failed'"
        class="rounded-lg border border-rose-200/60 px-3 py-2 text-rose-100"
        @click="$emit('retry', doc)"
      >
        Retry ingest
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocumentRow } from '~/types/models'

const props = defineProps<{
  doc: DocumentRow
}>()

const pagesLabel = computed(() => {
  if (!props.doc.pages_count) return 'Pages -'
  return `${props.doc.pages_count} pages`
})

const formattedSize = computed(() => {
  if (!props.doc.size_bytes) return 'Unknown'
  const kb = props.doc.size_bytes / 1024
  return `${kb.toFixed(1)} KB`
})

const statusLabel = computed(() => {
  if (props.doc.status === 'uploading') return 'Uploading'
  if (props.doc.status === 'ready') return 'Ready'
  if (props.doc.status === 'processing') return 'Processing'
  if (props.doc.status === 'failed') return 'Failed'
  return 'Unknown'
})

const statusBadge = computed(() => {
  if (props.doc.status === 'uploading') {
    return 'bg-slate-800 text-slate-200 border border-white/10'
  }
  if (props.doc.status === 'ready') return 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30'
  if (props.doc.status === 'processing') return 'bg-amber-400/10 text-amber-200 border border-amber-300/40'
  if (props.doc.status === 'failed') return 'bg-rose-500/10 text-rose-200 border border-rose-400/30'
  return 'bg-slate-800 text-slate-300 border border-white/5'
})
</script>
