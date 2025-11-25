<template>
  <div class="p-6 space-y-6">
    <header>
      <h1 class="text-2xl font-semibold">Documents</h1>
      <p class="text-sm text-gray-500">
        Showing data from /api/admin/library.
      </p>
    </header>

    <!-- Simple filters (client-side only) -->
    <section class="rounded-xl bg-white shadow-sm p-4 flex flex-wrap gap-4">
      <div class="flex flex-col">
        <label class="text-xs font-medium text-gray-500 mb-1">Approval</label>
        <select v-model="filters.approval" class="border rounded-md px-3 py-1 text-sm">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-xs font-medium text-gray-500 mb-1">Questions</label>
        <select v-model="filters.question" class="border rounded-md px-3 py-1 text-sm">
          <option value="all">All</option>
          <option value="none">None</option>
          <option value="pending_admin">Pending admin</option>
          <option value="has_questions">Has questions</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-xs font-medium text-gray-500 mb-1">Visibility</label>
        <select v-model="filters.visibility" class="border rounded-md px-3 py-1 text-sm">
          <option value="all">All</option>
          <option value="personal">Personal</option>
          <option value="course">Course</option>
        </select>
      </div>

      <div class="flex-1 flex flex-col min-w-[200px]">
        <label class="text-xs font-medium text-gray-500 mb-1">Search</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Title, course code…"
          class="border rounded-md px-3 py-1 text-sm w-full"
        />
      </div>
    </section>

    <!-- Table -->
    <section class="rounded-xl bg-white shadow-sm overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Title</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Visibility</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Approval</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Question status</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Questions</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Course</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Created</th>
          </tr>
        </thead>

        <tbody v-if="!pending && filteredDocs.length">
          <tr
            v-for="doc in filteredDocs"
            :key="doc.id"
            class="border-b last:border-b-0 hover:bg-gray-50"
          >
            <td class="px-4 py-2">
              <div class="font-medium text-gray-900">{{ doc.title }}</div>
              <div class="text-[10px] text-gray-500 break-all">
                {{ doc.id }}
              </div>
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ doc.visibility }}
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ doc.approval_status }}
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ doc.question_status }}
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ doc.question_count }}
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ doc.course_code || '—' }}
            </td>
            <td class="px-4 py-2 text-xs text-gray-700">
              {{ formatDate(doc.created_at) }}
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="pending">
          <tr>
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">
              Loading…
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">
              No documents found.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Debug: raw JSON from API so we can SEE it -->
    <section class="mt-4">
      <h2 class="text-sm font-semibold text-gray-600 mb-1">
        Debug: raw response from /api/admin/library
      </h2>
      <pre class="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto max-h-64">
{{ docs }}
      </pre>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

type AdminDoc = {
  id: string
  title: string
  visibility: string
  approval_status: string
  question_status: string
  question_count: number
  course_code: string | null
  created_at: string
  size_bytes: number | null
}

// 1) Fetch once, no params
const { data, pending, error } = await useAsyncData<AdminDoc[]>(
  'admin-docs',
  () => $fetch('/api/admin/library'),
)

// 2) Normalised ref of docs
const docs = computed(() => data.value || [])

// Small console log so you can see it in DevTools
watchEffect(() => {
  // comment this out later if it's noisy
  console.log('admin docs data:', docs.value)
})

// 3) Client-side filters
const filters = reactive({
  approval: 'all',
  question: 'all',
  visibility: 'all',
  search: '',
})

const filteredDocs = computed<AdminDoc[]>(() => {
  let list = docs.value

  if (filters.approval !== 'all') {
    list = list.filter((d) => d.approval_status === filters.approval)
  }
  if (filters.question !== 'all') {
    list = list.filter((d) => d.question_status === filters.question)
  }
  if (filters.visibility !== 'all') {
    list = list.filter((d) => d.visibility === filters.visibility)
  }
  if (filters.search.trim()) {
    const term = filters.search.trim().toLowerCase()
    list = list.filter((d) => {
      return (
        d.title.toLowerCase().includes(term) ||
        (d.course_code && d.course_code.toLowerCase().includes(term))
      )
    })
  }

  return list
})

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString()
}
</script>
