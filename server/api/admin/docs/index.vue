<!-- file: pages/admin/docs/index.vue -->
<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Documents</h1>
        <p class="text-sm text-gray-500">Review uploads and generate exam-style questions.</p>
      </div>
    </header>

    <!-- Filters -->
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
            <th class="px-4 py-2 text-left font-medium text-gray-500">Uploader</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Course</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Approval</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Questions</th>
            <th class="px-4 py-2 text-left font-medium text-gray-500">Created</th>
            <th class="px-4 py-2 text-right font-medium text-gray-500">Actions</th>
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
              <div class="text-xs text-gray-500">{{ doc.visibility }}</div>
            </td>

            <td class="px-4 py-2">
              <div class="text-gray-900 text-sm">
                {{ doc.uploader_name || '—' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ doc.uploader_email || '—' }}
              </div>
            </td>

            <td class="px-4 py-2 text-sm text-gray-700">
              {{ doc.course_code || '—' }}
            </td>

            <td class="px-4 py-2 text-sm">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="badgeClass(doc.approval_status)"
              >
                {{ doc.approval_status }}
              </span>
            </td>

            <td class="px-4 py-2 text-sm">
              <div class="flex flex-col gap-1">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="badgeClass(doc.question_status)"
                >
                  {{ doc.question_status }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ doc.question_count }} questions
                </span>
              </div>
            </td>

            <td class="px-4 py-2 text-xs text-gray-600">
              {{ formatDate(doc.created_at) }}
            </td>

            <td class="px-4 py-2">
              <div class="flex justify-end gap-2">
                <button
                  class="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
                  @click="goToDoc(doc.id)"
                >
                  View
                </button>
                <button
                  class="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  :disabled="doc.question_status === 'has_questions' || generatingId === doc.id"
                  @click="onGenerate(doc.id)"
                >
                  <span v-if="generatingId === doc.id">Generating…</span>
                  <span v-else>Generate</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="pending">
          <tr>
            <td colspan="7" class="px-4 py-6 text-center text-sm text-gray-500">
              Loading documents…
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'], // keep if you have it
  layout: 'admin',       // keep if you have an admin layout
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
  uploader_name: string | null
  uploader_email: string | null
}

const router = useRouter()

const filters = reactive({
  approval: 'all',
  question: 'all',
  visibility: 'all',
  search: '',
})

const {
  data: docs,
  pending,
  error,
  refresh,
} = await useAsyncData<AdminDoc[]>('admin-docs', () =>
  $fetch('/api/admin/library'),
)

// 🚨 filter on the client, not in the API
const filteredDocs = computed<AdminDoc[]>(() => {
  let list = docs.value || []

  if (filters.approval !== 'all') {
    list = list.filter(d => d.approval_status === filters.approval)
  }

  if (filters.question !== 'all') {
    list = list.filter(d => d.question_status === filters.question)
  }

  if (filters.visibility !== 'all') {
    list = list.filter(d => d.visibility === filters.visibility)
  }

  if (filters.search.trim()) {
    const term = filters.search.trim().toLowerCase()
    list = list.filter(d => {
      const inTitle = d.title?.toLowerCase().includes(term)
      const inCourse = d.course_code?.toLowerCase().includes(term)
      const inUploader =
        d.uploader_name?.toLowerCase().includes(term) ||
        d.uploader_email?.toLowerCase().includes(term)
      return inTitle || inCourse || inUploader
    })
  }

  return list
})

const generatingId = ref<string | null>(null)

const goToDoc = (id: string) => {
  router.push(`/admin/docs/${id}`)
}

const onGenerate = async (id: string) => {
  try {
    generatingId.value = id
    await $fetch(`/api/admin/docs/${id}/generate-questions`, {
      method: 'POST',
    })
    await refresh()
  } catch (err) {
    console.error('Failed to generate questions', err)
  } finally {
    generatingId.value = null
  }
}

const badgeClass = (status: string) => {
  switch (status) {
    case 'approved':
    case 'has_questions':
      return 'bg-green-100 text-green-700'
    case 'pending':
    case 'pending_admin':
      return 'bg-yellow-100 text-yellow-700'
    case 'archived':
    case 'none':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString()
}
</script>
