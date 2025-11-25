<!-- file: pages/admin/docs/[id].vue -->
<template>
  <div class="p-6 space-y-6" v-if="doc">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">{{ doc.title }}</h1>
        <p class="text-sm text-gray-500">
          {{ doc.visibility }} · {{ doc.course_code || 'No course' }}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          class="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-100"
          @click="goBack"
        >
          Back to documents
        </button>
        <button
          class="px-3 py-1 text-xs rounded-full bg-green-600 text-white hover:bg-green-700"
          :disabled="doc.approval_status === 'approved'"
          @click="onApprove"
        >
          Approve
        </button>
        <button
          class="px-3 py-1 text-xs rounded-full bg-gray-700 text-white hover:bg-gray-800"
          @click="onArchive"
        >
          Archive
        </button>
        <button
          class="px-3 py-1 text-xs rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          :disabled="generating"
          @click="onGenerate"
        >
          <span v-if="generating">Generating…</span>
          <span v-else>Generate questions</span>
        </button>
      </div>
    </header>

    <!-- Doc meta -->
    <section class="rounded-xl bg-white shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <div class="text-xs font-medium text-gray-500">Approval</div>
        <div class="mt-1 text-sm">{{ doc.approval_status }}</div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500">Question status</div>
        <div class="mt-1 text-sm">
          {{ doc.question_status }} ({{ doc.question_count }} total)
        </div>
      </div>
      <div>
        <div class="text-xs font-medium text-gray-500">Uploaded</div>
        <div class="mt-1 text-sm">
          {{ formatDate(doc.created_at) }}
        </div>
      </div>
    </section>

    <!-- Questions -->
    <section class="rounded-xl bg-white shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-lg">Questions</h2>
        <p class="text-xs text-gray-500">
          {{ questions?.length || 0 }} questions
        </p>
      </div>

      <div v-if="qPending" class="text-sm text-gray-500">
        Loading questions…
      </div>

      <div v-else-if="!questions?.length" class="text-sm text-gray-500">
        No questions yet. Click “Generate questions” above to create some.
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="(q, index) in questions"
          :key="q.id"
          class="border rounded-lg p-3"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="font-medium text-sm">
              Q{{ index + 1 }}. {{ q.stem }}
            </div>
            <span
              v-if="q.difficulty"
              class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
            >
              {{ q.difficulty }}
            </span>
          </div>
          <ol class="mt-2 list-decimal list-inside text-sm space-y-1">
            <li v-for="(opt, i) in q.options" :key="i">
              <span
                :class="{
                  'font-semibold text-green-700':
                    i === q.correct,
                }"
              >
                {{ opt }}
              </span>
            </li>
          </ol>
          <p v-if="q.explanation" class="mt-2 text-xs text-gray-500">
            Explanation: {{ q.explanation }}
          </p>
        </li>
      </ul>
    </section>
  </div>

  <div v-else class="p-6 text-sm text-gray-500">
    Loading document…
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

type AdminDocDetail = {
  id: string
  title: string
  visibility: string
  approval_status: string
  question_status: string
  question_count: number
  course_code: string | null
  created_at: string
}

type AdminQuestion = {
  id: string
  stem: string
  options: string[]
  correct: number
  explanation: string | null
  difficulty: string | null
  topic_tags: string[]
  created_at: string
}

const route = useRoute()
const router = useRouter()

const id = computed(() => route.params.id as string)

const {
  data: doc,
  pending: docPending,
  refresh: refreshDoc,
} = await useAsyncData<AdminDocDetail | null>(
  () => `/api/admin/docs/${id.value}`,
  () => $fetch(`/api/admin/docs/${id.value}`),
)

const {
  data: questions,
  pending: qPending,
  refresh: refreshQuestions,
} = await useAsyncData<AdminQuestion[]>(
  () => `/api/admin/docs/${id.value}/questions`,
  () => $fetch(`/api/admin/docs/${id.value}/questions`),
)

const generating = ref(false)

const goBack = () => {
  router.push('/admin/docs')
}

const onGenerate = async () => {
  try {
    generating.value = true
    await $fetch(`/api/admin/docs/${id.value}/generate-questions`, {
      method: 'POST',
    })
    await Promise.all([refreshDoc(), refreshQuestions()])
  } catch (err) {
    console.error('Failed to generate questions', err)
  } finally {
    generating.value = false
  }
}

const onApprove = async () => {
  try {
    await $fetch(`/api/admin/docs/${id.value}/approve`, { method: 'POST' })
    await refreshDoc()
  } catch (err) {
    console.error('Failed to approve document', err)
  }
}

const onArchive = async () => {
  try {
    await $fetch(`/api/admin/docs/${id.value}/archive`, { method: 'POST' })
    await refreshDoc()
  } catch (err) {
    console.error('Failed to archive document', err)
  }
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString()
}
</script>
