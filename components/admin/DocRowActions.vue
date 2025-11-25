<template>
  <div class="flex flex-wrap gap-2 text-sm">
    <button
      class="rounded-lg border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-100"
      @click="$emit('view')"
    >
      View
    </button>
    <button
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700 hover:bg-emerald-100"
      @click="$emit('approve')"
    >
      Approve
    </button>
    <button
      class="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200"
      @click="$emit('generate')"
    >
      Generate
    </button>
    <button
      class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-700 hover:bg-rose-100"
      @click="$emit('archive')"
    >
      Archive
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'view'): void
  (e: 'approve'): void
  (e: 'archive'): void
  (e: 'generate'): void
}>()
</script>
