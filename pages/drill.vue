<template>
  <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Header -->
    <header class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
        Quick Drill
      </p>
      <h1 class="text-3xl font-bold tracking-tight">
        Generate exam-style MCQs
      </h1>
      <p class="text-sm text-slate-400">
        Select ready docs, choose how many questions you want, and practice with instant feedback and a countdown.
      </p>
    </header>

    <!-- Config card -->
    <Card class="space-y-4">
      <!-- Docs selection -->
      <div>
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Docs
          </p>
          <div
            v-if="readyDocs.length"
            class="flex items-center gap-2 text-[11px] text-slate-400"
          >
            <button
              type="button"
              class="underline-offset-2 hover:underline"
              @click="selectAllDocs"
            >
              Select all
            </button>
            <span>·</span>
            <button
              type="button"
              class="underline-offset-2 hover:underline"
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
            class="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200"
          >
            <div class="truncate pr-3">
              <p class="truncate">
                {{ doc.title }}
              </p>
              <p v-if="doc.course" class="text-[11px] text-slate-500">
                {{ doc.course }}
              </p>
              <p
                v-else-if="doc.visibility === 'course'"
                class="text-[11px] text-slate-500"
              >
                Course pack
              </p>
            </div>
            <input
              v-model="selectedDocs"
              type="checkbox"
              :value="doc.id"
              class="h-4 w-4 rounded border-slate-500 bg-transparent"
            />
          </label>

          <p v-if="!readyDocs.length" class="text-xs text-slate-500">
            Upload and ingest at least one PDF to start drilling. Once a doc is
            <span class="font-semibold text-emerald-300">Ready</span>, it will appear here.
          </p>
        </div>

        <!-- Route preset hint -->
        <p v-if="coursePresetLabel" class="mt-1 text-[11px] text-slate-500">
          Docs pre-selected for <span class="font-semibold">{{ coursePresetLabel }}</span>.
        </p>
      </div>

      <!-- Count + duration -->
      <div class="flex flex-wrap gap-4">
        <label class="flex min-w-[130px] flex-1 flex-col text-sm text-slate-300">
          <span class="text-xs text-slate-500">Number of questions</span>
          <input
            v-model.number="count"
            type="number"
            min="5"
            max="50"
            class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
          />
          <span class="mt-1 text-[11px] text-slate-500">
            Recommended: 10–20 for quick sprints.
          </span>
        </label>
        <label class="flex min-w-[130px] flex-1 flex-col text-sm text-slate-300">
          <span class="text-xs text-slate-500">Countdown (min)</span>
          <input
            v-model.number="duration"
            type="number"
            min="5"
            max="120"
            class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
          />
          <span class="mt-1 text-[11px] text-slate-500">
            Timer starts when questions load.
          </span>
        </label>
      </div>

      <Button :disabled="loading || !readyDocs.length" @click="startDrill">
        {{ loading ? 'Generating…' : 'Start drill' }}
      </Button>
    </Card>

    <!-- Active drill -->
    <section v-if="questions.length" class="space-y-4">
      <!-- Progress + timer -->
      <Card class="space-y-2 bg-slate-950/70">
        <div class="flex items-center justify-between text-[11px] text-slate-400">
          <p>
            Answered
            <span class="font-semibold text-slate-100">{{ answeredCount }}</span>
            /
            <span class="font-semibold text-slate-100">{{ questions.length }}</span>
          </p>
          <div v-if="timerVisible" class="flex items-center gap-2">
            <span class="text-slate-500">Time left</span>
            <span
              class="rounded-full bg-slate-900 px-2.5 py-1 font-mono text-[11px]"
              :class="{
                'text-emerald-300': timeRemaining > 60,
                'text-amber-300': timeRemaining <= 60 && timeRemaining > 15,
                'text-rose-300': timeRemaining <= 15
              }"
            >
              {{ formattedTime }}
            </span>
          </div>
        </div>

        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full bg-amber-300 transition-all"
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
          :disabled="!canSubmit"
          @click="submitDrill()"
        >
          Reveal answers
        </Button>
        <Button
          v-else
          class="bg-slate-800 text-white hover:bg-slate-700"
          @click="resetDrill"
        >
          Run another drill
        </Button>
      </div>

      <!-- Results summary -->
      <Card v-if="submitted" class="space-y-2 bg-slate-950/70">
        <p class="text-lg font-semibold">
          Score {{ score }} / {{ questions.length }}
        </p>
        <p class="text-sm text-slate-400">
          Accuracy {{ accuracy }}%
        </p>
        <p v-if="missedQuestions.length" class="text-xs text-rose-200">
          Review these prompts:
          {{ missedQuestions.join(' · ') }}
        </p>
        <p v-else class="text-xs text-emerald-300">
          Strong performance — you answered everything correctly.
        </p>
      </Card>
    </section>

    <!-- Empty state -->
    <p
      v-else
      class="text-sm text-slate-500"
    >
      No drill yet. Pick one or more ready docs, set your question count, then tap
      <span class="font-semibold">“Start drill”</span>.
    </p>
  </main>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import MCQCard from '~/components/MCQCard.vue'
import type { DrillQuestion, DocumentRow } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

const library = useLibrary()
const toasts = useToasts()
const supabase = useSupabaseClient()
const route = useRoute()

// Only personal docs + approved course docs, and only READY ones
const readyDocs = computed<DocumentRow[]>(() =>
  library.documents.filter((doc) => {
    if (doc.status !== 'ready') return false

    const visibility = doc.visibility ?? 'personal'
    const approval = doc.approval_status ?? 'pending'

    // personal (no visibility set or explicitly 'personal')
    if (visibility === 'personal') return true

    // course docs must be approved to be usable
    if (visibility === 'course' && approval === 'approved') return true

    return false
  })
)

const selectedDocs = ref<string[]>([])
const count = ref(10)
const duration = ref(15)
const loading = ref(false)
const questions = ref<DrillQuestion[]>([])
const responses = reactive<Record<string, number | null>>({})
const submitted = ref(false)
const score = ref(0)
const accuracy = ref(0)
const missedQuestions = ref<string[]>([])
const currentDrillId = ref<string | null>(null)

// Timer
const timeRemaining = ref<number>(0)
const timerId = ref<ReturnType<typeof setInterval> | null>(null)

// Route preset metadata
const presetApplied = ref(false)
const coursePresetLabel = ref<string | null>(null)

const answeredCount = computed(() =>
  Object.values(responses).filter((value) => value !== null).length
)

const canSubmit = computed(
  () =>
    questions.value.length > 0 &&
    Object.values(responses).every((value) => value !== null)
)

const progressPercent = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((answeredCount.value / questions.value.length) * 100)
})

const timerVisible = computed(
  () => questions.value.length > 0 && !submitted.value && timeRemaining.value > 0
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
})

watch(
  () => readyDocs.value.length,
  () => {
    if (!presetApplied.value) {
      applyRoutePreset()
    }
  }
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

async function startDrill() {
  if (!readyDocs.value.length) {
    toasts.error('Upload and ingest a PDF first.')
    return
  }

  if (count.value < 5 || count.value > 50) {
    toasts.error('Pick between 5 and 50 questions.')
    return
  }

  if (duration.value < 5 || duration.value > 120) {
    toasts.error('Countdown should be between 5 and 120 minutes.')
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

    const payload: any = await $fetch('/api/drill', {
      method: 'POST',
      body: { docIds, count: count.value },
    })

    questions.value = payload.questions || []
    currentDrillId.value = payload.sessionId || null

    questions.value.forEach((q) => {
      responses[q.id] = null
    })

    library.saveSession({
      id: payload.sessionId,
      mode: 'drill',
      metadata: { docIds, count: count.value, duration: duration.value },
    })

    if (questions.value.length) {
      startTimer()
    }
  } catch (error: any) {
    toasts.error(error?.statusMessage || error?.message || 'Drill failed')
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
  accuracy.value = Number(((correct / questions.value.length) * 100).toFixed(0))
  missedQuestions.value = misses.slice(0, 3)

  if (currentDrillId.value) {
    try {
      await supabase
        .from('drills')
        .update({ score: correct, accuracy: accuracy.value })
        .eq('id', currentDrillId.value)
    } catch {
      // non-fatal
    }
  }

  if (auto) {
    toasts.error('Time is up — answers revealed.')
  }
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
