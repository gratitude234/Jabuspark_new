<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex flex-col text-sm">
          <label class="text-xs font-semibold text-slate-500">Approval</label>
          <select v-model="filters.approval_status" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div class="flex flex-col text-sm">
          <label class="text-xs font-semibold text-slate-500">Questions</label>
          <select v-model="filters.question_status" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="none">None</option>
            <option value="pending_admin">Pending admin</option>
            <option value="has_questions">Has questions</option>
          </select>
        </div>
        <div class="flex flex-col text-sm">
          <label class="text-xs font-semibold text-slate-500">Visibility</label>
          <select v-model="filters.visibility" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="personal">Personal</option>
            <option value="course">Course</option>
          </select>
        </div>
        <div class="flex flex-1 flex-col text-sm">
          <label class="text-xs font-semibold text-slate-500">Search</label>
          <input
            v-model="filters.search"
            type="search"
            placeholder="Title, course code, uploader..."
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>

    <DocTable
      :docs="docs || []"
      @view="onView"
      @approve="(doc) => handleAction('approve', doc)"
      @archive="(doc) => handleAction('archive', doc)"
      @generate="(doc) => handleAction('generate', doc)"
    />

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
import type { AdminDocumentListItem } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
  title: 'Documents',
})

const filters = reactive({
  approval_status: '',
  question_status: '',
  visibility: '',
  search: '',
})

const { data: docs, refresh } = useAsyncData<AdminDocumentListItem[]>(
  'admin-docs',
  () =>
    $fetch('/api/admin/library', {
      params: { ...filters },
    }),
  { watch: [() => ({ ...filters })] },
)

const confirm = reactive(initialConfirmState())

function initialConfirmState() {
  return { show: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: null as null | (() => void) }
}

function onView(doc: AdminDocumentListItem) {
  navigateTo(`/admin/docs/${doc.id}`)
}

async function handleAction(action: 'approve' | 'archive' | 'generate', doc: AdminDocumentListItem) {
  if (action === 'archive') {
    Object.assign(confirm, {
      show: true,
      title: 'Archive document',
      message: 'Are you sure you want to archive this document?',
      confirmLabel: 'Archive',
      onConfirm: async () => {
        await $fetch(`/api/admin/docs/${doc.id}/archive`, { method: 'POST' })
        Object.assign(confirm, initialConfirmState())
        refresh()
      },
    })
    return
  }

  if (action === 'generate') {
    Object.assign(confirm, {
      show: true,
      title: 'Generate questions',
      message: 'Send this PDF to the AI service and create questions? This may take a moment.',
      confirmLabel: 'Generate',
      onConfirm: async () => {
        await $fetch(`/api/admin/docs/${doc.id}/generate-questions`, { method: 'POST' })
        Object.assign(confirm, initialConfirmState())
        refresh()
      },
    })
    return
  }

  await $fetch(`/api/admin/docs/${doc.id}/approve`, { method: 'POST' })
  refresh()
}
</script>
