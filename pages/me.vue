<template>
  <main
    class="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 bg-background px-4 pb-24 pt-6 text-slate-50"
  >
    <!-- Header -->
    <section class="space-y-2">
      <p
        class="inline-flex items-center gap-1 rounded-full bg-primary-soft/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
        Me
      </p>

      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        <span v-if="!auth.isLoggedIn">Sign in to JabuSpark</span>
        <span v-else>My study profile</span>
      </h1>

      <p class="text-sm text-slate-300">
        <span v-if="!auth.isLoggedIn">
          Sign in to save your docs, generate MCQs, and track drills for your
          department and level.
        </span>
        <span v-else>
          See your drill stats and set simple goals for your current exam
          sprint.
        </span>
      </p>
    </section>

    <!-- Not signed in -->
    <section v-if="!auth.isLoggedIn">
      <SignInCard />
    </section>

    <!-- Signed in -->
    <section v-else class="space-y-5">
      <!-- Profile card -->
      <Card
        class="space-y-3 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
      >
        <div class="flex items-center gap-3">
          <!-- Avatar + upload -->
          <div class="relative">
            <label
              for="avatar-upload"
              class="group block h-12 w-12 cursor-pointer overflow-hidden rounded-full bg-primary-soft/20"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Profile picture"
                class="h-12 w-12 object-cover transition group-hover:brightness-110"
              />
              <div
                v-else
                class="flex h-12 w-12 items-center justify-center text-base font-semibold text-primary"
              >
                {{ avatarInitials }}
              </div>

              <div
                class="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 text-[10px] text-slate-100 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"
              >
                <span class="mb-1 rounded-full bg-black/60 px-2 py-0.5">
                  Change
                </span>
              </div>
            </label>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarSelected"
            />
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

            <p class="text-[11px] text-slate-500">
              <span v-if="isUploadingAvatar">Uploading photo…</span>
              <span v-else>Tap your avatar to update your photo.</span>
            </p>
            <p v-if="avatarError" class="text-[11px] text-rose-300">
              {{ avatarError }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Stats grid -->
      <section class="grid gap-3 sm:grid-cols-3">
        <Card
          class="space-y-1 border border-borderSubtle bg-surface/90 shadow-sm shadow-background/30"
        >
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

        <Card
          class="space-y-1 border border-borderSubtle bg-surface/90 shadow-sm shadow-background/30"
        >
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Avg accuracy
          </p>
          <p class="text-2xl font-bold text-success">
            {{ stats.accuracy }}%
          </p>
          <p class="text-[11px] text-slate-500">
            Across all drills
          </p>
        </Card>

        <Card
          class="space-y-1 border border-borderSubtle bg-surface/90 shadow-sm shadow-background/30"
        >
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Best accuracy
          </p>
          <p class="text-2xl font-bold text-primary-soft">
            {{ stats.bestAccuracy }}%
          </p>
          <p class="text-[11px] text-slate-500">
            Top performance
          </p>
        </Card>
      </section>

      <p v-if="statsMessage" class="text-xs text-slate-400">
        {{ statsMessage }}
      </p>

      <!-- Simple goals (local only for now) -->
      <section class="space-y-3">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          Goals
        </p>
        <Card
          class="space-y-3 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm text-slate-200">
              <span class="text-xs text-slate-500">Main exam date</span>
              <input
                v-model="goals.examDate"
                type="date"
                class="rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
              <span class="text-[11px] text-slate-500">
                Used only on this device for now.
              </span>
            </label>

            <label class="flex flex-col gap-1 text-sm text-slate-200">
              <span class="text-xs text-slate-500">
                Daily question target
              </span>
              <input
                v-model.number="goals.dailyQuestions"
                type="number"
                min="5"
                max="200"
                class="rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
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

        <p v-if="goalsProgress" class="text-xs text-slate-400">
          {{ goalsProgress.daysLeft }} day(s) left &middot; at
          {{ goals.dailyQuestions }} MCQs/day you can answer about
          {{ goalsProgress.projectedQuestions }} questions before the exam.
        </p>
      </section>

      <!-- Activity placeholder (future community + sessions) -->
      <section class="space-y-3">
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          Activity (coming soon)
        </p>
        <Card
          class="space-y-2 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
        >
          <p class="text-sm text-slate-200">
            Soon you’ll see a timeline of your recent drills, Ask sessions, and
            community answers here.
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
        <Button
          class="border border-borderSubtle bg-surface text-slate-100 hover:border-danger hover:bg-danger/10"
          @click="signOut"
        >
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
import { getAvatarInitials } from '~/utils/avatar'

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

// Dynamic cohort label from profile
const cohortLabel = computed(() => {
  const dept = auth.profile?.department as string | undefined
  const level = auth.profile?.level as string | number | undefined

  if (dept && level) {
    return `${dept} · ${level} Level`
  }
  if (dept) {
    return dept
  }
  return 'Set your department and level'
})

// Avatar
const avatarUrl = computed(
  () => (auth.profile?.avatar_url as string | undefined) || '',
)

const avatarInitials = computed(() =>
  getAvatarInitials(auth.profile?.full_name || auth.user?.email),
)

const isUploadingAvatar = ref(false)
const avatarError = ref<string | null>(null)

async function onAvatarSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  avatarError.value = null

  if (!file) return

  if (!auth.user) {
    avatarError.value = 'Please sign in first.'
    target.value = ''
    return
  }

  // 2 MB limit
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    avatarError.value = 'Image too large. Please use a file under 2 MB.'
    target.value = ''
    return
  }

  isUploadingAvatar.value = true

  try {
    const bucket = 'avatars' // must match Supabase bucket name
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const filePath = `${auth.user.id}/${Date.now()}.${ext}`

    console.log('[avatar] uploading to', bucket, filePath)

    // 1) Upload to storage
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('[avatar] upload error', uploadError)
      throw uploadError
    }

    // 2) Get public URL
    const {
      data: { publicUrl },
    } = client.storage.from(bucket).getPublicUrl(filePath)

    console.log('[avatar] public url', publicUrl)

    // 3) Save to profiles
    const { error: updateError } = await client
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', auth.user.id)

    if (updateError) {
      console.error('[avatar] profile update error', updateError)
      throw updateError
    }

    // 4) Update local profile so UI reacts immediately
    if (auth.profile) {
      auth.profile.avatar_url = publicUrl
    }

    avatarError.value = null
  } catch (err: any) {
    console.error('[avatar] failed:', err)
    avatarError.value =
      err?.message || 'Could not upload photo. Please try again.'
  } finally {
    isUploadingAvatar.value = false
    // reset input so selecting same file again still triggers change
    target.value = ''
  }
}

// Goals + stats
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

const statsMessage = computed(() => {
  if (stats.drills === 0) {
    return 'No drills yet – run your first Quick Drill from the home page.'
  }
  if (stats.accuracy < 50) {
    return "You're just getting started. Focus on reviewing questions you miss."
  }
  if (stats.accuracy < 75) {
    return 'Solid base. Keep drilling and aim to push your average higher.'
  }
  return 'Strong performance. Maintain consistency with your daily target.'
})

const goalsProgress = computed(() => {
  if (!goals.examDate) return null
  const target = new Date(goals.examDate)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (daysLeft <= 0) return null
  const daily = Number(goals.dailyQuestions) || 0
  const projectedQuestions = daily > 0 ? daily * daysLeft : 0
  return { daysLeft, projectedQuestions }
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
  },
)

watch(goals, saveGoals, { deep: true })

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
      }),
    )
  } catch {
    // ignore
  }
}

async function signOut() {
  await auth.signOut()
}
</script>
