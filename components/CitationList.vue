<template>
  <div class="mt-3 space-y-2">
    <p class="text-xs uppercase tracking-wide text-slate-400">Citations</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cite in citations"
        :key="cite.docId + '-' + cite.page + cite.span"
        class="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1 text-xs text-amber-100"
        @click="goToDoc(cite)"
      >
        {{ cite.docTitle || 'Doc' }} · p.{{ cite.page }}
      </button>
    </div>
    <p v-if="citations.length === 0" class="text-sm text-slate-500">No supporting spans found.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  citations: Array<{
    docId: string
    docTitle?: string
    page: number
    span?: string
  }>
}>()

const router = useRouter()

function goToDoc(cite: (typeof props.citations)[number]) {
  router.push({ path: `/reader/${cite.docId}`, query: { page: cite.page } })
}
</script>
