<template>
  <div class="space-y-8">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Pending approvals" :value="data?.pendingApproval ?? 0" />
      <StatCard label="Waiting for questions" :value="data?.pendingQuestions ?? 0" />
      <StatCard label="Docs with questions" :value="data?.hasQuestions ?? 0" />
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Recent documents</h2>
      <NuxtLink
        to="/admin/docs"
        class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
      >
        Go to Document Queue
      </NuxtLink>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Uploader</th>
            <th class="px-4 py-3">Course</th>
            <th class="px-4 py-3">Approval</th>
            <th class="px-4 py-3">Questions</th>
            <th class="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-slate-800">
          <tr v-for="doc in data?.recentDocs || []" :key="doc.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium">{{ doc.title }}</td>
            <td class="px-4 py-3">
              <div class="font-medium">{{ doc.uploader_name || '—' }}</div>
              <div class="text-xs text-slate-500">{{ doc.uploader_email || '' }}</div>
            </td>
            <td class="px-4 py-3">{{ doc.course_code || '—' }}</td>
            <td class="px-4 py-3"><StatusBadge :status="doc.approval_status" type="approval" /></td>
            <td class="px-4 py-3"><StatusBadge :status="doc.question_status" type="question" /></td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(doc.created_at) }}</td>
          </tr>
          <tr v-if="!data?.recentDocs?.length">
            <td colspan="6" class="px-4 py-6 text-center text-slate-500">No documents yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
  title: 'Dashboard',
})

const { data, error } = useAsyncData('admin-dashboard', () => $fetch('/api/admin/dashboard'))

watchEffect(() => {
  if (error.value) {
    console.error('Failed to load admin dashboard', error.value)
  }
})

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}
</script>
