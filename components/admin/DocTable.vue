<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">Title</th>
          <th class="px-4 py-3">Uploader</th>
          <th class="px-4 py-3">Course</th>
          <th class="px-4 py-3">Visibility</th>
          <th class="px-4 py-3">Approval</th>
          <th class="px-4 py-3">Questions</th>
          <th class="px-4 py-3">Count</th>
          <th class="px-4 py-3">Created</th>
          <th class="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 text-slate-800">
        <tr v-for="doc in docs" :key="doc.id" class="hover:bg-slate-50">
          <td class="px-4 py-3 font-medium">{{ doc.title }}</td>
          <td class="px-4 py-3">
            <div class="font-medium">{{ doc.uploader_name || '—' }}</div>
            <div class="text-xs text-slate-500">{{ doc.uploader_email || '' }}</div>
          </td>
          <td class="px-4 py-3">{{ doc.course_code || '—' }}</td>
          <td class="px-4 py-3"><StatusBadge :status="doc.visibility" type="visibility" /></td>
          <td class="px-4 py-3"><StatusBadge :status="doc.approval_status" type="approval" /></td>
          <td class="px-4 py-3"><StatusBadge :status="doc.question_status" type="question" /></td>
          <td class="px-4 py-3">{{ doc.question_count }}</td>
          <td class="px-4 py-3 text-slate-500">{{ formatDate(doc.created_at) }}</td>
          <td class="px-4 py-3">
            <DocRowActions
              @view="$emit('view', doc)"
              @approve="$emit('approve', doc)"
              @archive="$emit('archive', doc)"
              @generate="$emit('generate', doc)"
            />
          </td>
        </tr>
        <tr v-if="!docs.length">
          <td colspan="9" class="px-4 py-6 text-center text-slate-500">No documents found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { AdminDocumentListItem } from '~/types/admin'

withDefaults(defineProps<{ docs: AdminDocumentListItem[] }>(), {
  docs: () => [],
})

defineEmits<{
  (e: 'view', doc: AdminDocumentListItem): void
  (e: 'approve', doc: AdminDocumentListItem): void
  (e: 'archive', doc: AdminDocumentListItem): void
  (e: 'generate', doc: AdminDocumentListItem): void
}>()

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}
</script>
