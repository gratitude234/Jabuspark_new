<template>
  <main
    class="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 bg-background px-4 pb-24 pt-6 text-slate-50"
  >
    <!-- Header -->
    <header class="space-y-2">
      <p
        class="inline-flex items-center gap-1 rounded-full bg-primary-soft/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
        Quick Drill
      </p>
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        Practice exam-style MCQs
      </h1>
      <p class="text-sm text-slate-300">
        Select docs that already have MCQs, choose how many questions you want,
        and practice with instant feedback and a countdown.
      </p>
    </header>

    <!-- Config card -->
    <Card
      class="space-y-4 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
    >
      <!-- Docs selection -->
      <div>
        <div class="flex items-center justify-between gap-2">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Docs
          </p>
          <div
            v-if="readyDocs.length"
            class="flex items-center gap-2 text-[11px] text-slate-400"
          >
            <button
              type="button"
              class="underline-offset-2 hover:text-primary hover:underline"
              @click="selectAllDocs"
            >
              Select all
            </button>
            <span>·</span>
            <button
              type="button"
              class="underline-offset-2 hover:text-accent hover:underline"
              @click="clearSelectedDocs"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="mt-2 space-y-2">
          <label
            v-for="doc in readyDocs"
            :key="doc.id"
            class="flex items-center justify-between rounded-xl border border-borderSubtle bg-surface/90 px-3 py-2 text-sm text-slate-200"
          >
            <div class="truncate pr-3">
              <p class="truncate">
                {{ doc.title }}
              </p>
              <p v-if="doc.course" class="text-[11px] text-slate-400">
                {{ doc.course }}
              </p>
              <p
                v-else-if="doc.visibility === 'course'"
                class="text-[11px] text-slate-400"
              >
                Course pack
              </p>
            </div>
            <input
              v-model="selectedDocs"
              type="checkbox"
              :value="doc.id"
              class="h-4 w-4 rounded border-borderSubtle bg-background text-primary focus:ring-primary"
            />
          </label>

          <p v-if="!readyDocs.length" class="text-xs text-slate-500">
            Once at least one course pack has been ingested and MCQs added by
            your tutor/admin, it will appear here as
            <span class="font-semibold text-success">Ready</span> for drill.
          </p>
        </div>

        <!-- Route preset hint -->
        <p v-if="coursePresetLabel" class="mt-1 text-[11px] text-slate-500">
          Docs pre-selected for
          <span class="font-semibold text-primary">{{ coursePresetLabel }}</span
          >.
        </p>
      </div>

      <!-- Count + duration -->
      <div class="flex flex-wrap gap-4">
        <label
          class="flex min-w-[130px] flex-1 flex-col text-sm text-slate-200"
        >
          <span class="text-xs text-slate-400">Number of questions</span>
          <input
            v-model.number="count"
            type="number"
            min="5"
            max="50"
            class="mt-1 rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <span class="mt-1 text-[11px] text-slate-500">
            Recommended: 10–20 for quick sprints.
          </span>
        </label>
        <label
          class="flex min-w-[130px] flex-1 flex-col text-sm text-slate-200"
        >
          <span class="text-xs text-slate-400">Countdown (min)</span>
          <input
            v-model.number="duration"
            type="number"
            min="5"
            max="120"
            class="mt-1 rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <span class="mt-1 text-[11px] text-slate-500">
            Timer starts when questions load.
          </span>
        </label>
      </div>

      <!-- Difficulty -->
      <div class="space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          Difficulty
        </p>
        <div
          class="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
        >
          <button
            v-for="option in difficultyOptions"
            :key="option.value"
            type="button"
            class="rounded-full border px-3 py-1 transition"
            :class="
              difficulty === option.value
                ? 'border-primary bg-primary text-background shadow-sm shadow-primary/40'
                : 'border-borderSubtle text-slate-400 hover:border-primary/60 hover:text-primary-soft'
            "
            @click="difficulty = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="text-[11px] text-slate-500">
          Easy leans conceptual, hard mirrors exam trick questions, mixed keeps
          things balanced.
        </p>
      </div>

      <!-- Mode -->
      <div class="space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          Mode
        </p>
        <div
          class="inline-flex rounded-full border border-borderSubtle bg-background p-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
        >
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="
              mode.value === 'normal'
                ? 'bg-primary text-background shadow-sm shadow-primary/40'
                : 'text-slate-400 hover:text-primary-soft'
            "
            @click="mode.value = 'normal'"
          >
            Normal
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 transition"
            :class="
              mode.value === 'review'
                ? 'bg-accent text-background shadow-sm shadow-accent/40'
                : 'text-slate-400 hover:text-accent'
            "
            @click="mode.value = 'review'"
          >
            Review mistakes
          </button>
        </div>
        <p class="text-[11px] text-slate-500">
          Review mode pulls questions you missed before. Keep a doc selected to
          focus.
        </p>
      </div>

      <!-- Start button -->
      <Button
        class="w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-60"
        :disabled="loading || !readyDocs.length"
        @click="startDrill"
      >
        {{ loading ? 'Loading questions…' : 'Start drill' }}
      </Button>
      <p v-if="loadError" class="mt-2 text-xs text-amber-200">
        {{ loadError }}
      </p>
    </Card>

    <!-- Leaderboard -->
    <Card
      class="space-y-2 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
    >
      <div class="flex items-center justify-between text-xs text-slate-400">
        <p class="font-semibold uppercase tracking-[0.14em]">Leaderboard</p>
        <span class="text-[11px]">Last 7 days</span>
      </div>
      <div v-if="!leaderboard.length" class="text-[11px] text-slate-500">
        No attempts recorded yet.
      </div>
      <div v-else class="space-y-1 text-[12px] text-slate-200">
        <div
          v-for="(entry, idx) in leaderboard"
          :key="entry.userId"
          class="flex items-center justify-between rounded-lg border border-borderSubtle bg-background px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-500">#{{ idx + 1 }}</span>
            <div>
              <p class="text-sm font-semibold">
                {{ entry.name || 'Anonymous' }}
              </p>
              <p class="text-[11px] text-slate-500">
                {{ entry.total }} questions
              </p>
            </div>
          </div>
          <p class="text-sm font-semibold text-success">
            {{ entry.accuracy }}%
          </p>
        </div>
      </div>
    </Card>

    <!-- Active drill -->
    <section v-if="questions.length" class="space-y-4">
      <!-- Progress + timer -->
      <Card
        class="space-y-2 border border-borderSubtle bg-surface/95 text-[11px]"
      >
        <div class="flex items-center justify-between text-slate-400">
          <p>
            Answered
            <span class="font-semibold text-slate-100">
              {{ answeredCount }}
            </span>
            /
            <span class="font-semibold text-slate-100">
              {{ questions.length }}
            </span>
          </p>
          <div v-if="timerVisible" class="flex items-center gap-2">
            <span class="text-slate-500">Time left</span>
            <span
              class="rounded-full bg-background px-2.5 py-1 font-mono text-[11px]"
              :class="{
                'text-success': timeRemaining > 60,
                'text-warning':
                  timeRemaining <= 60 && timeRemaining > 15,
                'text-danger': timeRemaining <= 15,
              }"
            >
              {{ formattedTime }}
            </span>
          </div>
        </div>

        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-borderSubtle/60">
          <div
            class="h-full bg-accent transition-all"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </Card>

      <!-- Questions list -->
      <MCQCard
        v-for="question in questions"
        :key="question.id"
        :question="question"
        :selected="responses[question.id] ?? null"
        :show-feedback="submitted"
        @select="(idx) => selectOption(question.id, idx)"
      />

      <!-- Actions -->
      <div class="flex flex-wrap gap-3">
        <Button
          v-if="!submitted"
          class="bg-primary text-background hover:bg-primary/90 disabled:opacity-60"
          :disabled="!canSubmit"
          @click="submitDrill()"
        >
          Reveal answers
        </Button>
        <Button
          v-else
          class="bg-surface text-slate-100 hover:bg-background"
          @click="resetDrill"
        >
          Run another drill
        </Button>
        <Button
          v-if="redoAvailable"
          class="border border-accent/60 bg-transparent text-accent hover:border-accent hover:bg-accent/10"
          @click="redoMissed"
        >
          Drill missed only
        </Button>
      </div>

      <!-- Results summary -->
      <Card
        v-if="submitted"
        class="space-y-2 border border-borderSubtle bg-surface/95"
      >
        <p class="text-lg font-semibold">
          Score {{ score }} / {{ questions.length }}
        </p>
        <p class="text-sm text-slate-300">
          Accuracy {{ accuracy }}%
        </p>
        <p
          v-if="missedQuestions.length"
          class="text-xs text-danger/90"
        >
          Review these prompts:
          {{ missedQuestions.join(' · ') }}
        </p>
        <p v-else class="text-xs text-success">
          Strong performance — you answered everything correctly.
        </p>
      </Card>
    </section>

    <!-- Empty state -->
    <p v-else class="text-sm text-slate-400">
      No drill yet. Pick one or more ready docs (with MCQs), set your question
      count, then tap
      <span class="font-semibold text-primary">“Start drill”</span>.
    </p>
  </main>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import MCQCard from '~/components/MCQCard.vue'
import { useReadyDocs } from '~/composables/useReadyDocs'
import type { DrillQuestion, DocumentRow } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

const library = useLibrary()
const toasts = useToasts()
const route = useRoute()

// Base "ready for AI" docs (from composable)
const baseReadyDocs = useReadyDocs(library)

/**
 * MCQ-ready docs used for Quick Drill:
 * - doc.status === 'ready'           (ingestion done)
 * - doc.question_status === 'ready'  (MCQs generated)
 * - if course pack: visibility='course' and approval_status='approved'
 * - if personal: visibility='personal' (for when you re-enable it later)
 */
const readyDocs = computed<DocumentRow[]>(() =>
  (baseReadyDocs.value as DocumentRow[]).filter((doc: any) => {
    if (doc.status !== 'ready') return false
    if (doc.question_status !== 'ready') return false

    if (doc.visibility === 'course') {
      return (doc.approval_status ?? 'pending') === 'approved'
    }

    if (!doc.visibility || doc.visibility === 'personal') {
      return true
    }

    return false
  }),
)

const difficulty = ref<'easy' | 'mixed' | 'hard'>('mixed')
const difficultyOptions: Array<{
  label: string
  value: 'easy' | 'mixed' | 'hard'
}> = [
  { label: 'Easy', value: 'easy' },
  { label: 'Mixed', value: 'mixed' },
  { label: 'Hard', value: 'hard' },
]

const selectedDocs = ref<string[]>([])
const count = ref(10)
const duration = ref(15)
const mode = ref<'normal' | 'review'>('normal')
const loading = ref(false)
const loadError = ref<string | null>(null)
const questions = ref<DrillQuestion[]>([])
const responses = reactive<Record<string, number | null>>({})
const submitted = ref(false)
const score = ref(0)
const accuracy = ref(0)
const missedQuestions = ref<string[]>([])
const currentDrillId = ref<string | null>(null)
const leaderboard = ref<
  {
    userId: string
    name: string | null
    total: number
    correct: number
    accuracy: number
  }[]
>([])

// Timer
const timeRemaining = ref<number>(0)
const timerId = ref<ReturnType<typeof setInterval> | null>(null)

// Route preset metadata
const presetApplied = ref(false)
const coursePresetLabel = ref<string | null>(null)

const answeredCount = computed(
  () => Object.values(responses).filter((value) => value !== null).length,
)

const canSubmit = computed(
  () =>
    questions.value.length > 0 &&
    Object.values(responses).every((value) => value !== null),
)

const redoAvailable = computed(
  () =>
    submitted.value &&
    questions.value.some(
      (question) => responses[question.id] !== question.correct,
    ),
)

const progressPercent = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((answeredCount.value / questions.value.length) * 100)
})

const timerVisible = computed(
  () =>
    questions.value.length > 0 &&
    !submitted.value &&
    timeRemaining.value > 0,
)

const formattedTime = computed(() => {
  const total = timeRemaining.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
})

onMounted(async () => {
  await library.loadDocuments()
  applyRoutePreset()
  await fetchLeaderboard()
})

watch(
  () => readyDocs.value.length,
  () => {
    if (!presetApplied.value) {
      applyRoutePreset()
    }
  },
)

watch(
  () => selectedDocs.value.join(','),
  () => {
    fetchLeaderboard()
  },
)

onBeforeUnmount(() => {
  clearTimer()
})

function applyRoutePreset() {
  if (presetApplied.value) return
  presetApplied.value = true

  const course = route.query.course ? String(route.query.course) : null
  const docId = route.query.doc ? String(route.query.doc) : null

  if (course) {
    const docsForCourse = readyDocs.value.filter((d) => d.course === course)
    if (docsForCourse.length) {
      selectedDocs.value = docsForCourse.map((d) => d.id)
      coursePresetLabel.value = course
      return
    }
  }

  if (docId) {
    const exists = readyDocs.value.find((d) => d.id === docId)
    if (exists) {
      selectedDocs.value = [docId]
      coursePresetLabel.value = exists.course || null
    }
  }
}

function selectAllDocs() {
  selectedDocs.value = readyDocs.value.map((doc) => doc.id)
}

function clearSelectedDocs() {
  selectedDocs.value = []
  coursePresetLabel.value = null
}

function startTimer() {
  clearTimer()
  if (duration.value <= 0) return
  timeRemaining.value = duration.value * 60
  timerId.value = setInterval(() => {
    if (timeRemaining.value <= 1) {
      timeRemaining.value = 0
      clearTimer()
      if (!submitted.value) {
        submitDrill(true)
      }
    } else {
      timeRemaining.value -= 1
    }
  }, 1000)
}

function clearTimer() {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
}

async function fetchLeaderboard() {
  try {
    const doc = readyDocs.value.find((d) =>
      selectedDocs.value.includes(d.id),
    )
    const courseId = (doc as any)?.course_id || null
    const query = courseId ? { courseId } : undefined

    const data = await $fetch<typeof leaderboard.value>('/api/leaderboard', {
      query,
    })
    leaderboard.value = data || []
  } catch (err) {
    console.warn('Failed to load leaderboard', err)
  }
}

async function startDrill() {
  loadError.value = null

  if (!readyDocs.value.length) {
    const message =
      'No docs with MCQs yet. Once a course pack is Ready with questions, it will show up here.'
    loadError.value = message
    toasts.error(message)
    return
  }

  if (count.value < 5 || count.value > 50) {
    const message = 'Pick between 5 and 50 questions.'
    loadError.value = message
    toasts.error(message)
    return
  }

  if (duration.value < 5 || duration.value > 120) {
    const message = 'Countdown should be between 5 and 120 minutes.'
    loadError.value = message
    toasts.error(message)
    return
  }

  loading.value = true
  submitted.value = false
  missedQuestions.value = []
  questions.value = []
  score.value = 0
  accuracy.value = 0
  Object.keys(responses).forEach((key) => delete responses[key])
  clearTimer()

  try {
    const docIds =
      selectedDocs.value.length > 0
        ? selectedDocs.value
        : readyDocs.value.map((doc) => doc.id)

    const endpoint =
      mode.value === 'review' ? '/api/drill/review' : '/api/drill'
    const body: any =
      mode.value === 'review'
        ? { docId: docIds[0] || null, limit: count.value }
        : { docIds, count: count.value, difficulty: difficulty.value }

    const payload: any = await $fetch(endpoint, {
      method: 'POST',
      body,
    })

    questions.value = payload.questions || []
    currentDrillId.value = payload.sessionId || null

    questions.value.forEach((q) => {
      responses[q.id] = null
    })

    library.saveSession({
      id: payload.sessionId,
      mode: 'drill',
      metadata: {
        docIds,
        count: count.value,
        duration: duration.value,
        difficulty: difficulty.value,
      },
    })

    if (!questions.value.length) {
      const message =
        'No questions available yet for these docs. Your tutor/admin may still be adding MCQs.'
      loadError.value = message
      toasts.error(message)
      return
    }

    loadError.value = null
    startTimer()
  } catch (error: any) {
    const message =
      error?.statusMessage || error?.message || 'Drill failed to load'
    loadError.value = message
    toasts.error(message)
  } finally {
    loading.value = false
  }
}

function selectOption(id: string, idx: number) {
  if (submitted.value) return
  responses[id] = idx
}

async function submitDrill(auto = false) {
  if (!questions.value.length) return
  if (submitted.value) return

  submitted.value = true
  clearTimer()

  let correct = 0
  const misses: string[] = []

  questions.value.forEach((q) => {
    if (responses[q.id] === q.correct) {
      correct += 1
    } else {
      misses.push(q.stem.slice(0, 50))
    }
  })

  score.value = correct
  accuracy.value = Number(
    ((correct / questions.value.length) * 100).toFixed(0),
  )
  missedQuestions.value = misses.slice(0, 3)

  if (currentDrillId.value) {
    try {
      const attempts = questions.value.map((q) => ({

        questionId: q.id,
        choiceIndex: responses[q.id] ?? -1,
      }))

      await $fetch('/api/drill/attempts', {
        method: 'POST',
        body: {
          sessionId: currentDrillId.value,
          attempts,
          completed: true,
        },
      })
    } catch (err) {
      console.warn('Failed to log drill attempts', err)
    }
  }

  if (auto) {
    toasts.error('Time is up — answers revealed.')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function redoMissed() {
  if (!submitted.value) return
  const missed = questions.value.filter(
    (question) => responses[question.id] !== question.correct,
  )
  if (!missed.length) return

  questions.value = missed
  submitted.value = false
  score.value = 0
  accuracy.value = 0
  missedQuestions.value = []
  currentDrillId.value = null

  Object.keys(responses).forEach((key) => delete responses[key])
  questions.value.forEach((question) => {
    responses[question.id] = null
  })

  clearTimer()
  startTimer()
  toasts.success('Loaded missed questions for another round.')
}

function resetDrill() {
  questions.value = []
  submitted.value = false
  Object.keys(responses).forEach((key) => delete responses[key])
  score.value = 0
  accuracy.value = 0
  missedQuestions.value = []
  currentDrillId.value = null
  clearTimer()
  timeRemaining.value = 0
}
</script>
