<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-amber-300">Question Builder</p>
        <h1 class="text-2xl font-semibold text-white">Documents</h1>
        <p class="text-sm text-slate-300">Select a document to add or edit manual MCQs.</p>
      </div>
      <NuxtLink
        to="/admin"
        class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-amber-300/60 hover:text-amber-200"
      >
        Back to dashboard
      </NuxtLink>
    </header>

    <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">Uploaded documents</h2>
        <span class="text-xs text-slate-400">{{ documents.length }} total</span>
      </div>

      <div v-if="loading" class="py-6 text-sm text-slate-400">Loading documents...</div>
      <div v-else-if="error" class="rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
        {{ error }}
      </div>
      <div v-else-if="!documents.length" class="py-6 text-sm text-slate-300">
        No documents found yet.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-400">
            <tr>
              <th class="px-2 py-2">Title</th>
              <th class="px-2 py-2">Course</th>
              <th class="px-2 py-2">Level</th>
              <th class="px-2 py-2">Questions</th>
              <th class="px-2 py-2">Status</th>
              <th class="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="doc in documents" :key="doc.id" class="text-slate-100">
              <td class="px-2 py-3">
                <div class="font-semibold">{{ doc.title }}</div>
                <div class="text-xs text-slate-400">{{ formatDate(doc.created_at) }}</div>
              </td>
              <td class="px-2 py-3 text-slate-200">
                <div class="font-medium">{{ doc.course || '—' }}</div>
                <div class="text-xs text-slate-400">{{ doc.course_code || '—' }}</div>
              </td>
              <td class="px-2 py-3 text-slate-200">{{ doc.level || '—' }}</td>
              <td class="px-2 py-3 text-slate-200">{{ questionCount(doc.id) }}</td>
              <td class="px-2 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="statusClass(questionCount(doc.id))"
                >
                  {{ statusLabel(questionCount(doc.id)) }}
                </span>
              </td>
              <td class="px-2 py-3 text-right">
                <NuxtLink
                  class="rounded-lg bg-amber-400/90 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-amber-300"
                  :to="`/admin/questions/${doc.id}`"
                >
                  Add questions
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
  title: 'Questions',
})

import type { DocumentRow } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

const client = useSupabaseClient()
const toasts = useToasts()

const documents = ref<DocumentRow[]>([])
const counts = ref<Record<string, number>>({})
const loading = ref(true)
const error = ref<string | null>(null)

function questionCount(docId: string) {
  return counts.value[docId] ?? 0
}

function statusLabel(count: number) {
  if (count === 0) return 'No questions'
  if (count < 10) return 'In progress'
  return 'Ready'
}

function statusClass(count: number) {
  if (count === 0) return 'bg-slate-700 text-slate-200'
  if (count < 10) return 'bg-amber-400/15 text-amber-200'
  return 'bg-emerald-500/15 text-emerald-200'
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

async function fetchDocuments() {
  loading.value = true
  error.value = null
  try {
    const { data, error: docError } = await client
      .from('documents')
      .select('id, title, course, course_code, level, created_at')
      .eq('status', 'ready')
      .order('created_at', { ascending: false })

    if (docError) throw docError
    documents.value = (data as DocumentRow[]) || []

    const { data: questionRows, error: countError } = await client
      .from('questions')
      .select('document_id, count:id')
      .group('document_id')

    if (countError) throw countError

    const map: Record<string, number> = {}
    for (const row of questionRows || []) {
      const docId = (row as any).document_id as string
      const count = Number((row as any).count) || 0
      map[docId] = count
    }
    counts.value = map
  } catch (err: any) {
    console.error('Failed to load documents or counts', err)
    const message = err?.message || 'Failed to load documents'
    error.value = message
    toasts.error(message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>
