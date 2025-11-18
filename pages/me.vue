<template>
  <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Header -->
    <section class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
        Me
      </p>
      <h1 class="text-3xl font-bold tracking-tight">
        My study profile
      </h1>
      <p class="text-sm text-slate-400">
        See your drill stats and set simple goals for your 200L Nursing exam sprint.
      </p>
    </section>

    <!-- Not signed in -->
    <section v-if="!auth.isLoggedIn">
      <SignInCard />
    </section>

    <!-- Signed in -->
    <section v-else class="space-y-5">
      <!-- Profile card -->
      <Card class="space-y-3 bg-slate-950/80">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200/20 text-base font-semibold text-amber-100"
          >
            {{ avatarInitials }}
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold">
              {{ auth.profile?.full_name || auth.user?.email }}
            </p>
            <p class="text-[11px] text-slate-400">
              {{ auth.user?.email }}
            </p>
            <p class="text-[11px] text-slate-500">
              {{ cohortLabel }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Stats grid -->
      <section class="grid gap-3 sm:grid-cols-3">
        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Drills taken
          </p>
          <p class="text-2xl font-bold">
            {{ stats.drills }}
          </p>
          <p class="text-[11px] text-slate-500">
            Completed sessions
          </p>
        </Card>

        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Avg accuracy
          </p>
          <p class="text-2xl font-bold">
            {{ stats.accuracy }}%
          </p>
          <p class="text-[11px] text-slate-500">
            Across all drills
          </p>
        </Card>

        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Best accuracy
          </p>
          <p class="text-2xl font-bold">
            {{ stats.bestAccuracy }}%
          </p>
          <p class="text-[11px] text-slate-500">
            Top performance
          </p>
        </Card>
      </section>

      <!-- Simple goals (local only for now) -->
      <section class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Goals
        </p>
        <Card class="space-y-3 bg-slate-950/80">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm text-slate-200">
              <span class="text-xs text-slate-500">Main exam date</span>
              <input
                v-model="goals.examDate"
                type="date"
                class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
              />
              <span class="text-[11px] text-slate-500">
                Used only on this device for now.
              </span>
            </label>

            <label class="flex flex-col gap-1 text-sm text-slate-200">
              <span class="text-xs text-slate-500">Daily question target</span>
              <input
                v-model.number="goals.dailyQuestions"
                type="number"
                min="5"
                max="200"
                class="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
              />
              <span class="text-[11px] text-slate-500">
                How many MCQs you aim to answer each day.
              </span>
            </label>
          </div>

          <p v-if="goalsSummary" class="text-xs text-slate-400">
            {{ goalsSummary }}
          </p>
        </Card>
      </section>

      <!-- Activity placeholder (future community + sessions) -->
      <section class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Activity (coming soon)
        </p>
        <Card class="space-y-2 bg-slate-950/80">
          <p class="text-sm text-slate-200">
            Soon you’ll see a timeline of your recent drills, Ask sessions, and community answers here.
          </p>
          <ul class="list-disc space-y-1 pl-5 text-[12px] text-slate-300">
            <li>Last few drills with scores and courses.</li>
            <li>Ask questions you’ve asked recently.</li>
            <li>Community replies and upvotes (when community launches).</li>
          </ul>
        </Card>
      </section>

      <!-- Sign out -->
      <section>
        <Button class="bg-slate-800 text-white hover:bg-slate-700" @click="signOut">
          Sign out
        </Button>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import SignInCard from '~/components/SignInCard.vue'

const auth = useAuth()
const client = useSupabaseClient()

const stats = reactive({
  drills: 0,
  accuracy: 0,
  bestAccuracy: 0,
})

const GOALS_KEY = 'jabuspark:me:goals'

const goals = reactive<{
  examDate: string
  dailyQuestions: number
}>({
  examDate: '',
  dailyQuestions: 20,
})

const cohortLabel = computed(() => 'Nursing · 200 Level')

// Avatar initials
const avatarInitials = computed(() => {
  const name = auth.profile?.full_name || auth.user?.email || ''
  if (!name) return 'JS'
  const parts = name.split('@')[0].split(/[.\s_]+/).filter(Boolean)
  if (!parts.length) return 'JS'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
})

const goalsSummary = computed(() => {
  const parts: string[] = []
  if (goals.examDate) {
    parts.push(`Working towards ${goals.examDate}`)
  }
  if (goals.dailyQuestions) {
    parts.push(`aiming for ${goals.dailyQuestions} MCQs/day`)
  }
  return parts.length ? parts.join(' · ') : ''
})

onMounted(async () => {
  await auth.init()
  if (auth.user) await fetchStats()
  loadGoals()
})

watch(
  () => auth.user?.id,
  async (next, prev) => {
    if (next && next !== prev) {
      await fetchStats()
    } else if (!next) {
      stats.drills = 0
      stats.accuracy = 0
      stats.bestAccuracy = 0
    }
  }
)

watch(
  () => goals,
  () => {
    saveGoals()
  },
  { deep: true }
)

async function fetchStats() {
  if (!auth.user) return
  const { data } = await client
    .from('drills')
    .select('score, accuracy')
    .eq('user_id', auth.user.id)

  stats.drills = data?.length || 0

  if (data && data.length) {
    const accuracies = data.map((row) => row.accuracy || 0)
    const avg =
      accuracies.reduce((sum, a) => sum + a, 0) / (accuracies.length || 1)
    stats.accuracy = Math.round(avg)
    stats.bestAccuracy = Math.round(Math.max(...accuracies))
  } else {
    stats.accuracy = 0
    stats.bestAccuracy = 0
  }
}

function loadGoals() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(GOALS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.examDate === 'string') goals.examDate = parsed.examDate
      if (typeof parsed.dailyQuestions === 'number')
        goals.dailyQuestions = parsed.dailyQuestions
    }
  } catch {
    // ignore
  }
}

function saveGoals() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      GOALS_KEY,
      JSON.stringify({
        examDate: goals.examDate,
        dailyQuestions: goals.dailyQuestions,
      })
    )
  } catch {
    // ignore
  }
}

async function signOut() {
  await auth.signOut()
}
</script>
