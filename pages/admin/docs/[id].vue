<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-500">Document</p>
        <h1 class="text-2xl font-semibold text-slate-900">{{ doc?.title }}</h1>
      </div>
      <div class="flex flex-wrap gap-2 text-sm">
        <button
          class="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700"
          @click="() => triggerAction('approve')"
        >
          Approve
        </button>
        <button
          class="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white shadow hover:bg-slate-800"
          @click="() => triggerAction('generate')"
        >
          Generate questions
        </button>
        <button
          class="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white shadow hover:bg-rose-700"
          @click="() => triggerAction('archive')"
        >
          Archive
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap gap-6 text-sm text-slate-700">
        <div class="space-y-2">
          <p><span class="font-semibold">Uploader:</span> {{ doc?.uploader_name || '—' }}</p>
          <p><span class="font-semibold">Email:</span> {{ doc?.uploader_email || '—' }}</p>
          <p><span class="font-semibold">Visibility:</span> <StatusBadge :status="doc?.visibility || ''" type="visibility" /></p>
          <p><span class="font-semibold">Created:</span> {{ formatDate(doc?.created_at) }}</p>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold">Course code:</span> {{ doc?.course_code || '—' }}</p>
          <p><span class="font-semibold">Level:</span> {{ doc?.level || '—' }}</p>
          <p><span class="font-semibold">Faculty:</span> {{ doc?.faculty || '—' }}</p>
          <p><span class="font-semibold">Department:</span> {{ doc?.department || '—' }}</p>
        </div>
        <div class="space-y-2">
          <p><span class="font-semibold">Approval:</span> <StatusBadge :status="doc?.approval_status || ''" type="approval" /></p>
          <p><span class="font-semibold">Questions:</span> <StatusBadge :status="doc?.question_status || ''" type="question" /></p>
          <p><span class="font-semibold">Question count:</span> {{ doc?.question_count ?? 0 }}</p>
          <p><span class="font-semibold">Size:</span> {{ formatBytes(doc?.size_bytes) }}</p>
        </div>
      </div>
      <div v-if="downloadUrl" class="mt-4">
        <a :href="downloadUrl" target="_blank" class="text-sm font-semibold text-slate-900 underline">Open PDF</a>
      </div>
    </div>

    <div>
      <div class="flex border-b border-slate-200 text-sm font-semibold text-slate-700">
        <button
          class="px-4 py-2"
          :class="tab === 'overview' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'"
          @click="tab = 'overview'"
        >
          Overview
        </button>
        <button
          class="px-4 py-2"
          :class="tab === 'questions' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500'"
          @click="tab = 'questions'"
        >
          Questions
        </button>
      </div>

      <div v-if="tab === 'overview'" class="space-y-4 py-4">
        <p class="text-sm text-slate-700">
          Use the buttons above to approve the document, archive it, or send it to the AI question generator.
        </p>
      </div>

      <div v-else class="space-y-4 py-4">
        <div v-if="pendingQuestions" class="text-sm text-slate-500">Loading questions...</div>
        <div v-else-if="!questions?.length" class="text-sm text-slate-500">No questions yet.</div>
        <div v-else class="space-y-3">
          <div v-for="question in questions" :key="question.id" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold text-slate-900">{{ question.stem }}</p>
              <span class="text-xs font-semibold text-slate-500">{{ question.difficulty || '—' }}</span>
            </div>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li v-for="(option, idx) in question.options" :key="idx">
                <span :class="idx === question.correct ? 'font-semibold text-emerald-700' : ''">{{ option }}</span>
              </li>
            </ul>
            <p class="mt-2 text-sm text-slate-600">Explanation: {{ question.explanation || '—' }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in question.topic_tags || []"
                :key="tag"
                class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :confirm-label="confirm.confirmLabel"
      @confirm="confirm.onConfirm?.()"
      @cancel="Object.assign(confirm, initialConfirmState())"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminDocumentDetail, AdminQuestion } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
  title: 'Document',
})

const route = useRoute()
const supabase = useSupabaseClient()
const docId = computed(() => route.params.id as string)
const tab = ref<'overview' | 'questions'>('overview')
const downloadUrl = ref('')

const { data: doc, refresh: refreshDoc } = useAsyncData<AdminDocumentDetail>(
  () => `admin-doc-${docId.value}`,
  () => $fetch(`/api/admin/docs/${docId.value}`),
  { watch: [docId] },
)

const { data: questions, refresh: refreshQuestions, pending: pendingQuestions } = useAsyncData<AdminQuestion[]>(
  () => `admin-doc-questions-${docId.value}`,
  () => $fetch(`/api/admin/docs/${docId.value}/questions`),
  { watch: [docId] },
)

watchEffect(async () => {
  if (!process.client) return
  if (doc.value?.storage_path) {
    const { data } = await supabase.storage.from('docs').createSignedUrl(doc.value.storage_path, 3600)
    downloadUrl.value = data?.signedUrl || ''
  }
})

const confirm = reactive(initialConfirmState())

function initialConfirmState() {
  return { show: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: null as null | (() => void) }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return '—'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function triggerAction(action: 'approve' | 'archive' | 'generate') {
  if (action === 'archive') {
    Object.assign(confirm, {
      show: true,
      title: 'Archive document',
      message: 'Are you sure you want to archive this document?',
      confirmLabel: 'Archive',
      onConfirm: async () => {
        await $fetch(`/api/admin/docs/${docId.value}/archive`, { method: 'POST' })
        Object.assign(confirm, initialConfirmState())
        await refreshDoc()
        await refreshQuestions()
      },
    })
    return
  }

  if (action === 'generate') {
    Object.assign(confirm, {
      show: true,
      title: 'Generate questions',
      message: 'Send this PDF to the AI service and create questions?',
      confirmLabel: 'Generate',
      onConfirm: async () => {
        await $fetch(`/api/admin/docs/${docId.value}/generate-questions`, { method: 'POST' })
        Object.assign(confirm, initialConfirmState())
        await refreshDoc()
        await refreshQuestions()
        tab.value = 'questions'
      },
    })
    return
  }

  $fetch(`/api/admin/docs/${docId.value}/approve`, { method: 'POST' }).then(async () => {
    await refreshDoc()
  })
}
</script>
