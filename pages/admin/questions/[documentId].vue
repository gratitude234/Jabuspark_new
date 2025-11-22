<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-amber-300">Question Builder</p>
        <h1 class="text-2xl font-semibold text-white">{{ document?.title || 'Loading…' }}</h1>
        <p class="text-sm text-slate-300">
          {{ documentSubtitle }}
        </p>
      </div>
      <NuxtLink
        to="/admin/questions"
        class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-amber-300/60 hover:text-amber-200"
      >
        Back to documents
      </NuxtLink>
    </header>

    <div
      v-if="docError"
      class="rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100"
    >
      {{ docError }}
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
      <div class="space-y-4">
        <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">{{ editingId ? 'Edit question' : 'Add new question' }}</h2>
            <span v-if="saving" class="text-xs text-slate-400">Saving…</span>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit(false)">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Question stem</label>
              <textarea
                v-model="form.stem"
                class="mt-1 w-full rounded-xl border border-borderSubtle bg-slate-950/70 p-3 text-sm text-white focus:border-amber-300 focus:outline-none"
                rows="3"
                placeholder="Enter the question prompt"
                required
              />
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div v-for="(option, idx) in form.options" :key="idx" class="space-y-1">
                <label class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Option {{ String.fromCharCode(65 + idx) }}</span>
                  <span class="text-[10px] text-slate-500">Correct?
                    <input
                      v-model.number="form.correctIndex"
                      type="radio"
                      :value="idx"
                      class="ml-1 h-3.5 w-3.5 border border-slate-600 bg-slate-800 text-amber-400 focus:ring-amber-300"
                    /></span>
                </label>
                <input
                  v-model="form.options[idx]"
                  type="text"
                  class="w-full rounded-xl border border-borderSubtle bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                  :placeholder="`Option ${String.fromCharCode(65 + idx)}`"
                />
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Difficulty</label>
                <select
                  v-model="form.difficulty"
                  class="mt-1 w-full rounded-xl border border-borderSubtle bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                >
                  <option value="">Mixed/unspecified</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Page hint</label>
                <input
                  v-model="form.pageHint"
                  type="number"
                  min="1"
                  class="mt-1 w-full rounded-xl border border-borderSubtle bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                  placeholder="Optional page number"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Explanation</label>
              <textarea
                v-model="form.explanation"
                class="mt-1 w-full rounded-xl border border-borderSubtle bg-slate-950/70 p-3 text-sm text-white focus:border-amber-300 focus:outline-none"
                rows="3"
                placeholder="Optional explanation for the correct answer"
              />
            </div>

            <div class="flex flex-wrap gap-3">
              <Button
                type="submit"
                class="bg-amber-400 text-slate-900 hover:bg-amber-300"
                :disabled="saving"
              >
                {{ editingId ? 'Save changes' : 'Save question' }}
              </Button>
              <Button
                type="button"
                class="border border-white/10 bg-white/5 text-white hover:border-amber-300/60 hover:text-amber-200"
                :disabled="saving"
                @click="handleSubmit(true)"
              >
                Save &amp; add another
              </Button>
              <Button
                v-if="editingId"
                type="button"
                class="border border-white/10 bg-transparent text-white hover:border-slate-400 hover:text-white"
                :disabled="saving"
                @click="resetForm"
              >
                Cancel edit
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Existing questions</h2>
          <span class="text-xs text-slate-400">{{ questions.length }} total</span>
        </div>

        <div v-if="questionsLoading" class="py-4 text-sm text-slate-400">Loading questions...</div>
        <div v-else-if="!questions.length" class="py-4 text-sm text-slate-300">No questions yet.</div>
        <ul v-else class="space-y-3">
          <li
            v-for="question in questions"
            :key="question.id"
            class="rounded-xl border border-white/5 bg-slate-950/70 p-4 text-sm text-slate-100"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold">{{ question.stem }}</p>
                <p v-if="question.difficulty" class="text-xs text-slate-400">Difficulty: {{ question.difficulty }}</p>
                <p v-if="question.page_hint" class="text-xs text-slate-400">Page {{ question.page_hint }}</p>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <button class="rounded-lg bg-white/10 px-2 py-1" @click="startEdit(question)">
                  Edit
                </button>
                <button
                  class="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-100 hover:bg-rose-500/30"
                  @click="deleteQuestion(question.id)"
                >
                  Delete
                </button>
              </div>
            </div>
            <div class="mt-2 space-y-1 text-xs text-slate-200">
              <div v-for="(option, idx) in question.options" :key="idx" class="flex items-start gap-2">
                <span
                  class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border"
                  :class="idx === question.correct_index ? 'border-emerald-400 text-emerald-200' : 'border-slate-600 text-slate-400'"
                >
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span>{{ option }}</span>
              </div>
            </div>
            <p v-if="question.explanation" class="mt-2 text-xs text-slate-300">
              {{ question.explanation }}
            </p>
          </li>
        </ul>
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

import Button from '~/components/Button.vue'
import type { DocumentRow, ManualQuestion } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

const route = useRoute()
const client = useSupabaseClient()
const toasts = useToasts()

const documentId = computed(() => String(route.params.documentId))
const document = ref<DocumentRow | null>(null)
const docError = ref<string | null>(null)
const questions = ref<ManualQuestion[]>([])
const questionsLoading = ref(true)
const saving = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  stem: '',
  options: ['', '', '', ''] as string[],
  correctIndex: 0,
  explanation: '',
  difficulty: '',
  pageHint: '' as string | number,
})

const documentSubtitle = computed(() => {
  if (!document.value) return 'Fetching document metadata...'
  const parts = [document.value.course || null, document.value.course_code || null, document.value.level || null].filter(Boolean)
  const meta = parts.join(' · ')
  const created = document.value.created_at ? new Date(document.value.created_at).toLocaleDateString() : ''
  return meta ? `${meta} • Added ${created}` : created ? `Added ${created}` : ''
})

function normalizeOptions(values: string[]) {
  return values.map((opt) => opt?.trim()).filter((opt) => !!opt)
}

function resetForm() {
  form.stem = ''
  form.options = ['', '', '', '']
  form.correctIndex = 0
  form.explanation = ''
  form.difficulty = ''
  form.pageHint = ''
  editingId.value = null
}

async function fetchDocument() {
  docError.value = null
  try {
    const { data, error } = await client
      .from('documents')
      .select('id, title, course, course_code, level, created_at')
      .eq('id', documentId.value)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      docError.value = 'Document not found.'
      return
    }
    document.value = data as DocumentRow
  } catch (err: any) {
    console.error('Failed to load document', err)
    docError.value = err?.message || 'Failed to load document.'
  }
}

async function fetchQuestions() {
  questionsLoading.value = true
  try {
    const data = await $fetch<ManualQuestion[]>('/api/admin/questions', {
      method: 'GET',
      query: { documentId: documentId.value },
    })
    questions.value = (data || []).map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
    }))
  } catch (err: any) {
    console.error('Failed to load questions', err)
    toasts.error(err?.statusMessage || err?.message || 'Failed to load questions')
  } finally {
    questionsLoading.value = false
  }
}

async function handleSubmit(addAnother: boolean) {
  if (!document.value) return

  const options = normalizeOptions(form.options)
  if (!form.stem.trim()) {
    toasts.error('Question stem is required')
    return
  }
  if (!options.length) {
    toasts.error('Add at least one option')
    return
  }
  if (form.correctIndex < 0 || form.correctIndex >= options.length) {
    toasts.error('Correct option is out of range')
    return
  }

  saving.value = true
  try {
    const payload = {
      documentId: document.value.id,
      stem: form.stem,
      options,
      correctIndex: form.correctIndex,
      explanation: form.explanation || null,
      difficulty: form.difficulty || null,
      pageHint: form.pageHint ? Number(form.pageHint) : null,
    }

    let saved: ManualQuestion | null = null
    if (editingId.value) {
      saved = await $fetch<ManualQuestion>(`/api/admin/questions/${editingId.value}`, {
        method: 'PUT',
        body: payload,
      })
      questions.value = questions.value.map((q) => (q.id === saved?.id ? { ...q, ...saved } : q))
      toasts.success('Question updated')
    } else {
      saved = await $fetch<ManualQuestion>('/api/admin/questions', {
        method: 'POST',
        body: payload,
      })
      if (saved) questions.value.push(saved)
      toasts.success('Question added')
    }

    if (addAnother) {
      resetForm()
    } else if (saved) {
      startEdit(saved)
    }
  } catch (err: any) {
    console.error('Failed to save question', err)
    toasts.error(err?.statusMessage || err?.message || 'Failed to save question')
  } finally {
    saving.value = false
  }
}

function startEdit(question: ManualQuestion) {
  editingId.value = question.id
  form.stem = question.stem
  form.options = [...question.options]
  form.correctIndex = question.correct_index ?? 0
  form.explanation = question.explanation || ''
  form.difficulty = (question.difficulty as string) || ''
  form.pageHint = question.page_hint ?? ''
}

async function deleteQuestion(id: string) {
  if (!id) return
  try {
    await $fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    questions.value = questions.value.filter((q) => q.id !== id)
    if (editingId.value === id) resetForm()
    toasts.success('Question deleted')
  } catch (err: any) {
    console.error('Failed to delete question', err)
    toasts.error(err?.statusMessage || err?.message || 'Failed to delete question')
  }
}

onMounted(async () => {
  await Promise.all([fetchDocument(), fetchQuestions()])
})
</script>
