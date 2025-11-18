<template>
  <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Header -->
    <header class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
        Ask
      </p>
      <h1 class="text-3xl font-bold tracking-tight">
        Source-true study chat
      </h1>
      <p class="text-sm text-slate-400">
        Pick ready docs, ask a question, and get answers that always point back to your PDF pages.
      </p>
    </header>

    <!-- Scope + doc selection -->
    <Card class="space-y-4">
      <!-- Scope toggles -->
      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <button
          class="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
          :class="scope === 'all'
            ? 'border-amber-300 bg-amber-200/10 text-amber-200'
            : 'border-white/10 text-slate-400'"
          @click="setScope('all')"
        >
          All ready docs ({{ readyDocs.length }})
        </button>
        <button
          class="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
          :class="scope === 'selected'
            ? 'border-amber-300 bg-amber-200/10 text-amber-200'
            : 'border-white/10 text-slate-400'"
          @click="setScope('selected')"
        >
          Focused set
        </button>

        <span v-if="!readyDocs.length" class="text-[11px] text-rose-200">
          Upload and ingest at least one doc before asking.
        </span>
      </div>

      <!-- Focused selection list -->
      <div v-if="scope === 'selected' && readyDocs.length" class="space-y-2">
        <label
          v-for="doc in readyDocs"
          :key="doc.id"
          class="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200"
        >
          <span class="truncate pr-3">
            {{ doc.title }}
            <span v-if="doc.course" class="text-[11px] text-slate-500">
              · {{ doc.course }}
            </span>
          </span>
          <input
            v-model="selectedDocs"
            type="checkbox"
            :value="doc.id"
            class="h-4 w-4 rounded border-slate-500 bg-transparent"
          />
        </label>
      </div>

      <p v-else-if="scope === 'selected' && !readyDocs.length" class="text-xs text-slate-500">
        No ready docs yet. Once a PDF finishes processing, it appears here.
      </p>

      <!-- Active docs pills -->
      <div
        v-if="activeDocs.length"
        class="flex flex-wrap gap-2 rounded-xl bg-slate-950/60 p-3"
      >
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Using
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="doc in activeDocs"
            :key="doc.id"
            class="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] text-slate-200"
          >
            {{ doc.title }}
          </span>
        </div>
      </div>

      <p v-else class="text-[11px] text-slate-500">
        No doc selected yet. JabuSpark works best when it can ground answers in at least one uploaded handout.
      </p>

      <!-- Page hint from reader -->
      <p v-if="focusedPage" class="text-[11px] text-slate-500">
        Focused on page {{ focusedPage }} (from reader). The answer will still use the whole document today;
        later we can narrow to this page in the backend.
      </p>
    </Card>

    <!-- Question composer -->
    <section class="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Your question
        </p>
        <div class="flex flex-wrap justify-end gap-1">
          <button
            v-for="preset in presets"
            :key="preset.label"
            class="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
            type="button"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <textarea
        v-model="question"
        rows="3"
        class="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
        :placeholder="placeholder"
      />

      <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>
          {{ activeDocIds.length }} doc(s) selected
        </span>

        <div class="flex items-center gap-3">
          <span v-if="readyDocs.length" class="hidden text-[11px] text-slate-500 sm:inline">
            Answers are grounded to your PDFs and come with citations.
          </span>
          <Button :disabled="loading || !canAsk" @click="submitQuestion">
            {{ loading ? 'Thinking…' : 'Ask JabuSpark' }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="!history.length" class="space-y-3">
      <Card class="space-y-3 bg-slate-950/70">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          No asks yet
        </p>
        <p class="text-sm text-slate-200">
          Once you upload a PDF and it becomes <span class="font-semibold text-emerald-300">Ready</span>,
          you can start asking exam-style questions like:
        </p>
        <ul class="list-disc space-y-1 pl-5 text-sm text-slate-200">
          <li>“Summarise the stages of the clotting cascade in bullet points.”</li>
          <li>“Explain the differences between meiosis I and meiosis II for exams.”</li>
          <li>“Generate a short note on cardiac output regulation, strictly from my handout.”</li>
        </ul>
        <p class="text-[11px] text-slate-500">
          JabuSpark will always reference your docs and show where each answer came from.
        </p>
      </Card>
    </section>

    <!-- History -->
    <section
      v-else
      class="space-y-4"
    >
      <!-- History toolbar -->
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <p class="uppercase tracking-[0.16em]">
          History
        </p>
        <button
          type="button"
          class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-rose-300 hover:text-rose-200"
          @click="clearHistory"
        >
          Clear history
        </button>
      </div>

      <article
        v-for="entry in history"
        :key="entry.id"
        class="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4"
      >
        <!-- Question -->
        <div class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            You
          </p>
          <p class="text-sm font-medium text-white">
            {{ entry.question }}
          </p>
        </div>

        <!-- Answer -->
        <div class="space-y-2 rounded-2xl border border-white/5 bg-slate-950/50 p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              JabuSpark
            </p>
            <p class="text-[11px] text-slate-400">
              Confidence {{ Math.round(entry.confidence * 100) }}%
            </p>
          </div>

          <!-- Docs used for this answer -->
          <div
            v-if="entry.docTitles && entry.docTitles.length"
            class="mt-1 flex flex-wrap gap-1"
          >
            <span
              v-for="title in entry.docTitles"
              :key="title"
              class="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300"
            >
              {{ title }}
            </span>
          </div>

          <p class="whitespace-pre-line text-sm leading-relaxed text-slate-100">
            {{ entry.answer }}
          </p>

          <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
            <CitationList :citations="entry.sources" />

            <div class="flex flex-wrap gap-2 text-[11px]">
              <button
                class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
                type="button"
                @click="copyAnswer(entry.answer)"
              >
                Copy answer
              </button>
              <button
                class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
                type="button"
                @click="askFollowUp(entry)"
              >
                Ask follow-up
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import CitationList from '~/components/CitationList.vue'
import type { DocumentRow } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

interface AskEntry {
  id: string
  question: string
  answer: string
  confidence: number
  sources: any[]
  docIds: string[]
  docTitles: string[]
}

type Scope = 'all' | 'selected'

const HISTORY_KEY = 'jabuspark:ask:history'

const library = useLibrary()
const route = useRoute()
const toasts = useToasts()

// Same filter as Drill: personal + approved course docs, and only READY
const readyDocs = computed<DocumentRow[]>(() =>
  library.documents.filter((doc) => {
    if (doc.status !== 'ready') return false

    const visibility = doc.visibility ?? 'personal'
    const approval = doc.approval_status ?? 'pending'

    if (visibility === 'personal') return true
    if (visibility === 'course' && approval === 'approved') return true

    return false
  })
)

const scope = ref<Scope>('all')
const selectedDocs = ref<string[]>([])
const question = ref('')
const loading = ref(false)
const history = ref<AskEntry[]>([])
const focusedPage = ref<number | null>(null)
const presetApplied = ref(false)

const activeDocIds = computed<string[]>(() => {
  if (scope.value === 'all') return readyDocs.value.map((doc) => doc.id)
  return selectedDocs.value
})

const activeDocs = computed<DocumentRow[]>(() =>
  readyDocs.value.filter((doc) => activeDocIds.value.includes(doc.id))
)

const canAsk = computed(
  () =>
    Boolean(question.value.trim()) &&
    activeDocIds.value.length > 0 &&
    readyDocs.value.length > 0
)

const placeholder = computed(
  () =>
    'e.g. Summarise the clotting cascade stages as an exam-ready short note.'
)

const presets = [
  {
    label: 'Summarise topic',
    template:
      'Summarise this topic into exam-ready bullet points, strictly from my handout.',
  },
  {
    label: 'Explain like exam notes',
    template:
      'Explain this concept in clear, structured exam notes with headings and subpoints.',
  },
  {
    label: 'Likely exam question',
    template:
      'Predict a likely exam question from this section and give a model answer.',
  },
]

onMounted(async () => {
  await library.loadDocuments()
  applyRoutePreset()
  loadHistory()
})

// Re-run preset once docs arrive
watch(
  () => readyDocs.value.length,
  () => {
    if (!presetApplied.value) {
      applyRoutePreset()
    }
    if (
      scope.value === 'selected' &&
      !selectedDocs.value.length &&
      readyDocs.value.length
    ) {
      selectedDocs.value = [readyDocs.value[0].id]
    }
  }
)

watch(
  () => history.value,
  (next) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  },
  { deep: true }
)

function applyRoutePreset() {
  if (presetApplied.value) return
  presetApplied.value = true

  const presetDoc = route.query.doc ? String(route.query.doc) : null

  const rawPage = route.query.page ? Number(route.query.page) : NaN
  if (!Number.isNaN(rawPage) && rawPage > 0) {
    focusedPage.value = rawPage
  }

  if (presetDoc) {
    const exists = readyDocs.value.find((d) => d.id === presetDoc)
    if (exists) {
      scope.value = 'selected'
      selectedDocs.value = [presetDoc]
    }
  }
}

function loadHistory() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        history.value = parsed
      }
    }
  } catch {
    // ignore
  }
}

function clearHistory() {
  history.value = []
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(HISTORY_KEY)
    } catch {
      // ignore
    }
  }
}

function setScope(next: Scope) {
  scope.value = next
  if (next === 'selected' && !selectedDocs.value.length && readyDocs.value.length) {
    selectedDocs.value = [readyDocs.value[0].id]
  }
}

function applyPreset(preset: { label: string; template: string }) {
  if (!question.value.trim()) {
    question.value = preset.template
  } else {
    question.value = `${question.value.trim()}\n\n${preset.template}`
  }
}

async function submitQuestion() {
  const prompt = question.value.trim()
  if (!prompt || !activeDocIds.value.length) {
    toasts.error('Type a question and ensure at least one ready document is selected.')
    return
  }

  loading.value = true
  try {
    const response: any = await $fetch('/api/ask', {
      method: 'POST',
      body: { question: prompt, docIds: activeDocIds.value },
    })

    const entry: AskEntry = {
      id:
        response.sessionId ||
        (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now())),
      question: prompt,
      answer: response.answer,
      confidence: response.confidence ?? 0,
      sources: response.citations || [],
      docIds: [...activeDocIds.value],
      docTitles: activeDocs.value.map((d) => d.title),
    }

    history.value = [entry, ...history.value]

    library.saveSession({
      id: entry.id,
      mode: 'ask',
      metadata: {
        question: prompt,
        docIds: activeDocIds.value,
        page: focusedPage.value ?? undefined,
      },
    })

    question.value = ''
  } catch (error: any) {
    toasts.error(error?.statusMessage || error?.message || 'Ask failed')
  } finally {
    loading.value = false
  }
}

function copyAnswer(answer: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(answer).then(
      () => toasts.success('Answer copied to clipboard.'),
      () => toasts.error('Could not copy answer.')
    )
  }
}

function askFollowUp(entry: AskEntry) {
  question.value = `Follow-up to: "${entry.question}"\n\n`
}
</script>
