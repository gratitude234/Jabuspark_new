<template>
  <main
    class="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 bg-background px-4 pb-28 pt-6 text-slate-50"
  >
    <!-- Top bar / app header -->
    <header
      class="flex items-center justify-between rounded-2xl border border-borderSubtle/70 bg-surface/80 px-3 py-2 backdrop-blur"
    >
      <div>
        <p
          class="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
        >
          JabuSpark
        </p>
        <p
          class="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-soft/10 px-2 py-0.5 text-[10px] font-medium text-primary"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
          {{ cohortLabel }}
        </p>
      </div>

      <!-- Avatar / sign-in -->
      <ClientOnly>
        <template #fallback>
          <div class="h-8 w-8 rounded-full bg-surface" />
        </template>

        <div v-if="auth.isLoggedIn" class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft/20 text-xs font-semibold text-primary"
          >
            {{ avatarInitials }}
          </div>
        </div>

        <NuxtLink
          v-else
          to="/me"
          class="rounded-full border border-accent/70 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent transition hover:border-accent hover:bg-accent hover:text-background"
        >
          Sign in
        </NuxtLink>
      </ClientOnly>
    </header>

    <!-- Hero + last session -->
    <section
      class="space-y-4 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/deep via-background to-background p-4 shadow-lg shadow-primary/30"
    >
      <!-- Hero copy -->
      <div class="space-y-2">
        <p
          class="inline-flex items-center gap-1 rounded-full bg-primary-soft/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-soft"
        >
          Exam sprint mode
        </p>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          {{ heroTitle }}
        </h1>
        <p class="text-xs text-slate-200 sm:text-sm">
          Upload handouts, get MCQs created, and chat with your notes &mdash;
          all tuned for JABU exams.
        </p>
      </div>

      <!-- Resume chip -->
      <Card
        v-if="showResume"
        class="cursor-pointer border border-primary-soft/40 bg-surface/80 text-sm shadow-md shadow-primary/20 transition hover:border-accent hover:shadow-accent/40"
        @click="resumeSession"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-soft"
            >
              Continue studying
            </p>
            <p class="text-sm font-semibold">
              {{ resumeTitle }}
            </p>
            <p class="text-[11px] text-slate-300">
              {{ resumeSubtitle }}
            </p>
          </div>
          <div
            class="rounded-xl bg-accent/10 px-3 py-2 text-right text-[11px] text-accent"
          >
            <p class="font-semibold uppercase tracking-[0.16em]">
              Resume
            </p>
            <p class="text-[11px] text-accent/90">
              Study flow
            </p>
          </div>
        </div>
      </Card>

      <!-- If no resume, show a soft hint -->
      <p v-else class="text-[11px] text-slate-300">
        No active session yet. Upload a PDF or start a Quick Drill to begin.
      </p>
    </section>

    <!-- Snapshot stats -->
    <section class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          Your snapshot
        </p>
        <p class="text-[11px] text-slate-500">
          Built around your docs and courses.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <Card class="space-y-1 border border-borderSubtle bg-surface/90">
          <p
            class="text-[11px] uppercase tracking-[0.16em] text-slate-400"
          >
            Docs
          </p>
          <p class="text-xl font-semibold">
            {{ docsCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            Handouts & notes you’ve uploaded.
          </p>
        </Card>

        <Card class="space-y-1 border border-borderSubtle bg-surface/90">
          <p
            class="text-[11px] uppercase tracking-[0.16em] text-slate-400"
          >
            Ready
          </p>
          <p class="text-xl font-semibold text-success">
            {{ readyDocsCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            Docs ready for Ask + Quick Drill (with MCQs added).
          </p>
        </Card>

        <Card class="space-y-1 border border-borderSubtle bg-surface/90">
          <p
            class="text-[11px] uppercase tracking-[0.16em] text-slate-400"
          >
            Courses
          </p>
          <p class="text-xl font-semibold">
            {{ courseCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            Courses with shared packs.
          </p>
        </Card>
      </div>

      <p
        v-if="showReadyDocsHint"
        class="text-[11px] text-warning/90"
      >
        Upload your first PDF and wait for MCQs to be added to unlock Ask +
        Quick Drill.
      </p>
    </section>

    <!-- Courses tailored to profile -->
    <section class="space-y-3">
      <p
        class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
      >
        Courses for your track
      </p>

      <Card
        v-if="!profileComplete"
        class="space-y-2 border border-borderSubtle bg-surface/80 text-sm text-slate-300"
      >
        Complete your study profile to see department-specific courses and shared packs.
      </Card>

      <div v-else class="space-y-2">
        <div v-if="coursesLoading" class="space-y-2">
          <div
            v-for="n in 3"
            :key="n"
            class="h-[60px] animate-pulse rounded-2xl bg-slate-900/40"
          />
        </div>

        <div v-else-if="courses.length" class="space-y-2">
          <Card
            v-for="course in courses"
            :key="course.id"
            class="flex items-center justify-between border border-borderSubtle bg-surface/90"
          >
            <div>
              <p class="text-sm font-semibold text-slate-100">
                {{ course.code }}
              </p>
              <p class="text-xs text-slate-400">
                {{ course.title }}
              </p>
            </div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Course
            </span>
          </Card>
        </div>

        <Card v-else class="space-y-1 border border-borderSubtle bg-surface/90">
          <p class="text-sm font-semibold text-slate-100">
            No courses yet
          </p>
          <p class="text-xs text-slate-400">
            We couldn’t find courses for {{ cohortLabel }}. Check back later.
          </p>
        </Card>

        <p v-if="coursesError" class="text-[11px] text-rose-300">
          {{ coursesError }}
        </p>
      </div>
    </section>

    <!-- Primary actions: Upload / Drill / Ask -->
    <section class="space-y-3">
      <p
        class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
      >
        What do you want to do?
      </p>

      <div class="grid gap-3 md:grid-cols-3">
        <!-- Upload personal / course doc -->
        <ClientOnly>
          <template #fallback>
            <div
              class="rounded-2xl border border-dashed border-borderSubtle bg-surface/80 p-4 text-left text-sm text-slate-400"
            >
              Checking sign-in status…
            </div>
          </template>

          <div
            v-if="canUpload"
            class="flex flex-col gap-3 rounded-2xl border border-dashed border-borderSubtle bg-surface/90 p-4 text-left text-sm"
          >
            <button
              class="w-full rounded-xl border border-borderSubtle/60 bg-surface/80 px-3 py-2 text-left transition hover:border-primary hover:bg-background"
              :disabled="uploading"
              @click="selectFile('personal')"
            >
              <div class="space-y-1">
                <p class="text-base font-semibold">
                  {{
                    uploading && uploadMode === 'personal'
                      ? 'Uploading…'
                      : 'Upload personal PDF'
                  }}
                </p>
                <p class="text-[11px] text-slate-400">
                  Handouts, notes, extra material
                </p>
              </div>
              <p
                v-if="uploading && uploadMode === 'personal'"
                class="mt-2 text-[11px] text-primary-soft"
              >
                Hold on &mdash; we’ll start processing in the background.
              </p>
              <p
                v-else
                class="mt-2 text-[11px] text-slate-400"
              >
                Private to your account only.
              </p>
            </button>

            <button
              v-if="isCourseRep"
              class="w-full rounded-xl border border-borderSubtle/60 bg-background px-3 py-2 text-left transition hover:border-accent hover:bg-accent/10"
              :disabled="uploading"
              @click="selectFile('course')"
            >
              <div class="space-y-1">
                <p class="text-base font-semibold text-accent">
                  {{
                    uploading && uploadMode === 'course'
                      ? 'Uploading…'
                      : 'Upload course pack'
                  }}
                </p>
                <p class="text-[11px] text-slate-400">
                  Official handouts, schemes, past questions
                </p>
              </div>
              <p
                v-if="uploading && uploadMode === 'course'"
                class="mt-2 text-[11px] text-accent"
              >
                Sending to Course Library reviewers…
              </p>
              <p
                v-else
                class="mt-2 text-[11px] text-accent/90"
              >
                Visible to everyone after tutor/admin approval.
              </p>
            </button>
          </div>

          <NuxtLink
            v-else
            to="/me"
            class="flex flex-col justify-between rounded-2xl border border-dashed border-borderSubtle bg-surface/90 p-4 text-left text-sm transition hover:border-accent hover:bg-accent/5"
          >
            <div class="space-y-1">
              <p class="text-base font-semibold">
                Sign in to upload
              </p>
              <p class="text-[11px] text-slate-400">
                Tap to get a magic link to your JABU email.
              </p>
            </div>
            <p class="mt-2 text-[11px] text-slate-400">
              Your personal docs stay private.
            </p>
          </NuxtLink>
        </ClientOnly>

        <!-- Quick Drill -->
        <NuxtLink
          to="/drill"
          class="flex flex-col justify-between rounded-2xl border border-borderSubtle bg-surface/90 p-4 text-left text-sm shadow-sm shadow-background/40 transition hover:border-accent hover:bg-accent/10 hover:shadow-accent/30"
        >
          <div class="space-y-1">
            <p class="text-base font-semibold">
              Quick Drill
            </p>
            <p class="text-[11px] text-slate-400">
              MCQs from your docs · instant marking (after MCQs are added).
            </p>
          </div>
          <p class="mt-2 text-[11px] text-accent/90">
            Perfect for pre-exam sprints.
          </p>
        </NuxtLink>

        <!-- Ask -->
        <NuxtLink
          to="/ask"
          class="flex flex-col justify-between rounded-2xl border border-borderSubtle bg-surface/90 p-4 text-left text-sm shadow-sm shadow-background/40 transition hover:border-primary hover:bg-primary/10 hover:shadow-primary/30"
        >
          <div class="space-y-1">
            <p class="text-base font-semibold">
              Ask
            </p>
            <p class="text-[11px] text-slate-400">
              Source-true Q&amp;A with citations.
            </p>
          </div>
          <p class="mt-2 text-[11px] text-primary-soft">
            Great for clarifying tricky handout pages.
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Docs: Course Library vs My Docs -->
    <section class="space-y-3">
      <!-- Tab control -->
      <div class="flex items-center justify-between gap-2">
        <div
          class="inline-flex rounded-full border border-borderSubtle bg-surface/90 p-1 text-[11px]"
        >
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="
              docTab === 'course'
                ? 'bg-primary text-white shadow-sm shadow-primary/40'
                : 'text-slate-400'
            "
            @click="docTab = 'course'"
          >
            Course Library
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="
              docTab === 'personal'
                ? 'bg-primary text-white shadow-sm shadow-primary/40'
                : 'text-slate-400'
            "
            @click="docTab = 'personal'"
          >
            My Docs
          </button>
        </div>

        <p class="hidden text-[11px] text-slate-500 sm:inline">
          Shared course packs vs your private uploads.
        </p>
      </div>

      <!-- COURSE LIBRARY VIEW -->
      <div v-if="docTab === 'course'" class="space-y-3">
        <div class="flex items-center justify-between">
          <p
            class="text-xs uppercase tracking-[0.18em] text-slate-500"
          >
            Course Library &mdash; Nursing 200L
          </p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="docsLoading" class="mt-2 space-y-2">
          <div
            v-for="n in 3"
            :key="n"
            class="h-[76px] animate-pulse rounded-2xl bg-surface/80"
          />
        </div>

        <!-- Groups by course -->
        <div v-else-if="courseGroups.length" class="space-y-3">
          <Card
            v-for="group in courseGroups"
            :key="group.course"
            class="space-y-3 border border-borderSubtle bg-surface/95"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-100">
                  {{ group.course }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ group.docs.length }} doc(s) &middot;
                  <span class="text-success">
                    {{ group.readyCount }} ready
                  </span>
                  for AI (Ask + Reader)
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 text-[11px]">
              <NuxtLink
                v-if="group.firstReadyId"
                :to="{ path: '/ask', query: { doc: group.firstReadyId } }"
                class="rounded-full border border-primary/60 bg-primary/10 px-2.5 py-1 text-primary-soft transition hover:border-primary hover:bg-primary hover:text-background"
              >
                Ask from this course
              </NuxtLink>

              <button
                v-else
                type="button"
                class="cursor-not-allowed rounded-full border border-borderSubtle px-2.5 py-1 text-slate-500"
              >
                Ingest docs to enable Ask
              </button>

              <NuxtLink
                :to="{ path: '/drill', query: { course: group.course } }"
                class="rounded-full border border-borderSubtle px-2.5 py-1 text-slate-200 transition hover:border-accent hover:text-accent"
              >
                Drill this course
              </NuxtLink>
              <NuxtLink
                :to="{ path: '/reader', query: { course: group.course } }"
                class="rounded-full border border-borderSubtle px-2.5 py-1 text-slate-200 transition hover:border-primary hover:text-primary-soft"
              >
                Browse course docs
              </NuxtLink>
            </div>
          </Card>
        </div>

        <!-- Empty course library -->
        <div v-else class="space-y-2">
          <Card class="space-y-3 border border-borderSubtle bg-surface/95">
            <p
              class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
            >
              No course packs yet
            </p>
            <p class="text-sm text-slate-200">
              When your course rep or tutor uploads official handouts for the
              department, they’ll appear here as shared course packs.
            </p>
            <p class="text-[11px] text-slate-500">
              For now, you can still upload your own PDFs and use Ask +
              (once MCQs are added) Quick Drill.
            </p>
          </Card>
        </div>
      </div>

      <!-- MY DOCS VIEW -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between">
          <p
            class="text-xs uppercase tracking-[0.18em] text-slate-500"
          >
            My Docs (Private)
          </p>
          <div
            class="flex items-center gap-2 text-[10px] text-slate-500"
          >
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-success" /> Ready
            </span>
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-warning" /> Processing
            </span>
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-danger" /> Failed
            </span>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="docsLoading" class="mt-2 space-y-2">
          <div
            v-for="n in 3"
            :key="n"
            class="h-[64px] animate-pulse rounded-2xl bg-surface/80"
          />
        </div>

        <!-- Personal docs list -->
        <div v-else-if="personalDocs.length" class="mt-2 space-y-2">
          <DocItem
            v-for="doc in personalDocs"
            :key="doc.id"
            :doc="doc"
            @resume="openDoc"
            @retry="retryDoc"
          />
        </div>

        <!-- Empty state -->
        <ClientOnly v-else>
          <template #fallback>
            <p class="mt-4 text-sm text-slate-500">
              Loading docs…
            </p>
          </template>
          <p class="mt-4 text-sm text-slate-500">
            {{
              canUpload
                ? 'Upload your first PDF to start asking questions. Quick Drill will unlock once MCQs are added.'
                : 'Sign in to upload your PDFs and turn them into drills.'
            }}
          </p>
        </ClientOnly>
      </div>
    </section>

    <!-- Community preview -->
    <section class="space-y-2">
      <p
        class="text-xs uppercase tracking-[0.18em] text-slate-500"
      >
        Community – Nursing 200L
      </p>
      <Card class="space-y-3 border border-borderSubtle bg-surface/95">
        <p class="text-sm text-slate-200">
          Soon, you’ll be able to discuss tricky topics with classmates right
          inside JabuSpark. Think &ldquo;Explain gastrulation like I’m 100L&rdquo;
          or &ldquo;Is Orem’s theory in this exam?&rdquo;.
        </p>
        <ul class="list-disc space-y-1 pl-5 text-[12px] text-slate-300">
          <li>Course spaces per course (ANA 203, NSC 201, BCH 201…)</li>
          <li>Threads attached to Ask answers and Drill questions</li>
          <li>Rep / tutor badges for trusted explanations</li>
        </ul>
        <p class="text-[11px] text-accent/90">
          Design-first now — backend hooks for community can plug in later.
        </p>
      </Card>
    </section>

    <!-- Onboarding card for total first-timers -->
    <section v-if="showOnboarding" class="space-y-2">
      <Card
        class="space-y-3 border border-dashed border-accent/60 bg-surface/95"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          New to JabuSpark?
        </p>
        <ol class="space-y-2 text-sm text-slate-200">
          <li>
            <span class="font-semibold text-accent">1.</span>
            Upload one course PDF (e.g. ANA 203 Embryology handout).
          </li>
          <li>
            <span class="font-semibold text-accent">2.</span>
            Wait until its status shows
            <span class="font-semibold text-success">Ready</span> and MCQs have
            been added.
          </li>
          <li>
            <span class="font-semibold text-accent">3.</span>
            Use <span class="font-semibold">Ask</span> for explanations or
            <span class="font-semibold">Quick Drill</span> for MCQs.
          </li>
        </ol>
        <p class="text-[11px] text-slate-500">
          You can always come back later — your docs and sessions stay saved.
        </p>
      </Card>
    </section>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="application/pdf"
      class="hidden"
      @change="handleUpload"
    />
  </main>
</template>

<script setup lang="ts">
import Card from '~/components/Card.vue'
import DocItem from '~/components/DocItem.vue'
import { useReadyDocs } from '~/composables/useReadyDocs'
import { useToasts } from '~/stores/useToasts'
import type { DocumentRow } from '~/types/models'
import { getAvatarInitials } from '~/utils/avatar'

const auth = useAuth()
const library = useLibrary()
const router = useRouter()
const toasts = useToasts()
const readyDocs = useReadyDocs(library)
const supabase = useSupabaseClient()
const { profile, isLoading: profileLoading, refreshProfile: refreshProfileStore } = useProfile()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const docsLoading = ref(true)
const sessionLoading = ref(true)
const docTab = ref<'course' | 'personal'>('course')
const uploadMode = ref<'personal' | 'course'>('personal')
const uploadCourse = ref<string | null>(null)
const LAST_COURSE_KEY = 'jabuspark:lastCourse'

const canUpload = computed(() => auth.isLoggedIn)

const isCourseRep = computed(() => {
  const role = ((auth.profile as any)?.role as string) || 'student'
  return role === 'rep' || role === 'tutor' || role === 'admin'
})

const courseDocs = computed<DocumentRow[]>(() =>
  (library.documents as DocumentRow[]).filter(
    (doc) =>
      doc.visibility === 'course' &&
      !!doc.course &&
      doc.status !== 'failed' &&
      (doc.approval_status ?? 'pending') === 'approved',
  ),
)

const courseGroups = computed(() => {
  const map = new Map<string, DocumentRow[]>()

  courseDocs.value.forEach((doc) => {
    const courseName = doc.course || ''
    if (!courseName) return
    if (!map.has(courseName)) map.set(courseName, [])
    map.get(courseName)!.push(doc)
  })

  return Array.from(map.entries()).map(([course, docs]) => {
    const ready = docs.filter((d) => d.status === 'ready')
    return {
      course,
      docs,
      readyCount: ready.length,
      firstReadyId: ready[0]?.id ?? null,
    }
  })
})

const courseCount = computed(() => courseGroups.value.length)

const personalDocs = computed<DocumentRow[]>(() =>
  (library.documents as DocumentRow[]).filter(
    (doc) =>
      (!doc.visibility || doc.visibility === 'personal') &&
      doc.status !== 'failed',
  ),
)

const docsCount = computed(
  () => personalDocs.value.length + courseDocs.value.length,
)
const readyDocsCount = computed(() => readyDocs.value.length)
const showReadyDocsHint = computed(
  () => !docsLoading.value && readyDocsCount.value === 0,
)
const profileComplete = computed(
  () =>
    Boolean(
      profile.value?.department?.trim()?.length &&
        profile.value?.level?.trim()?.length,
    ),
)

const showOnboarding = computed(
  () => !docsLoading.value && docsCount.value === 0 && courseCount.value === 0,
)

const cohortLabel = computed(() => {
  if (profileComplete.value) {
    return `${profile.value!.department} · ${profile.value!.level} Level`
  }
  return 'Complete your study profile'
})

const heroTitle = computed(() => {
  if (profileComplete.value) {
    return `Your ${profile.value!.department} ${profile.value!.level}L study hub`
  }
  return 'Your study hub'
})

// Avatar initials
const avatarInitials = computed(() =>
  getAvatarInitials(auth.profile?.full_name || auth.user?.email),
)

const showResume = computed(
  () => !!library.lastSession && !sessionLoading.value,
)

// Resume card text
const resumeTitle = computed(() => {
  const session: any = library.lastSession
  if (!session) return ''
  if (session.mode === 'ask') return 'Resume Ask session'
  if (session.mode === 'drill') return 'Resume Quick Drill'
  if (session.mode === 'reader') return 'Resume Reader'
  return 'Resume where you stopped'
})

const resumeSubtitle = computed(() => {
  const session: any = library.lastSession
  if (!session) return ''
  const metadata = session.metadata || {}

  if (session.mode === 'ask') {
    const raw =
      typeof metadata.question === 'string' ? metadata.question.trim() : ''
    if (!raw) return 'Continue your last Ask chat.'
    const preview = raw.slice(0, 60)
    const suffix = raw.length > 60 ? '...' : ''
    return `Last question: "${preview}${suffix}"`
  }

  if (session.mode === 'drill') {
    const count = Number(metadata.count) || 10
    const base = `MCQ drill · ${count} question(s)`
    const courseLabel =
      typeof metadata.course === 'string' && metadata.course.trim().length
        ? metadata.course
        : ''
    return courseLabel ? `${base} · ${courseLabel}` : base
  }

  if (session.mode === 'reader') {
    const pageNumber = session.page || metadata.page
    if (pageNumber) {
      return `Back to page ${pageNumber}`
    }
    return 'Jump back into your last study session.'
  }

  return 'Jump back into your last study session.'
})

interface CourseRow {
  id: string
  code: string
  title: string
}

const courses = ref<CourseRow[]>([])
const coursesLoading = ref(false)
const coursesError = ref<string | null>(null)

onMounted(async () => {
  try {
    await auth.init()
  } catch (err: any) {
    toasts.error(err?.message || 'Failed to initialise auth')
  }

  if (!profile.value && !profileLoading.value && auth.isLoggedIn) {
    await refreshProfileStore()
  }

  try {
    docsLoading.value = true
    await library.loadDocuments()
  } catch (err: any) {
    toasts.error(err?.message || 'Failed to load documents')
  } finally {
    docsLoading.value = false
  }

  try {
    sessionLoading.value = true
    await library.fetchLastSession()
  } catch {
    // non-fatal
  } finally {
    sessionLoading.value = false
  }
})

watch(
  () => [profile.value?.department, profile.value?.level],
  () => {
    loadCourses()
  },
  { immediate: true },
)

function selectFile(mode: 'personal' | 'course' = 'personal') {
  console.log('[home] selectFile', { mode })
  uploadMode.value = mode
  // open file dialog directly from the button click (user gesture)
  fileInput.value?.click()
}

async function handleUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  console.log('[home] handleUpload change event', {
    hasFile: !!file,
    uploadMode: uploadMode.value,
  })
  if (!file) return

  try {
    uploading.value = true
    console.log('[home] starting upload via store', {
      name: file.name,
      size: file.size,
      type: file.type,
      mode: uploadMode.value,
    })

    if (uploadMode.value === 'course') {
      const defaultCourse =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(LAST_COURSE_KEY) || ''
          : ''
      let input: string | null = ''
      if (typeof window !== 'undefined') {
        input =
          window.prompt('Enter course code (e.g. ANA 203):', defaultCourse) ??
          null
      }
      if (!input) {
        toasts.error('Course code is required for course library upload.')
        return
      }
      const trimmed = input.trim()
      if (!trimmed) {
        toasts.error('Course code is required for course library upload.')
        return
      }

      uploadCourse.value = trimmed
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_COURSE_KEY, trimmed)
      }

      await library.uploadDocument(file, {
        visibility: 'course',
        course: uploadCourse.value,
        docType: 'Lecture handout',
      })
      toasts.success('Course pack uploaded. It will appear after approval.')
    } else {
      await library.uploadDocument(file, {
        visibility: 'personal',
        course: null,
      })
      toasts.success('Upload received. Processing will start shortly.')
    }

    console.log('[home] upload finished OK, reloading docs')
    await library.loadDocuments()
  } catch (error: any) {
    console.error('[home] upload failed', error)
    toasts.error(error?.message || 'Upload failed')
  } finally {
    uploading.value = false
    target.value = ''
    uploadMode.value = 'personal'
    uploadCourse.value = null
    console.log('[home] upload cleanup done')
  }
}

function resumeSession() {
  const session: any = library.lastSession
  if (!session) return

  if (session.mode === 'ask') {
    router.push('/ask')
  } else if (session.mode === 'drill') {
    router.push('/drill')
  } else if (session.mode === 'reader' && session.docId) {
    const targetPage = session.page || session.metadata?.page
    router.push({
      path: `/reader/${session.docId}`,
      query: targetPage ? { page: targetPage } : {},
    })
  }
}

function openDoc(doc: any) {
  router.push(`/reader/${doc.id}`)
}

async function retryDoc(doc: any) {
  try {
    await library.retryIngest(doc)
    toasts.success('Retry started. Check back in a bit.')
  } catch (error: any) {
    toasts.error(error?.message || 'Retry failed')
  }
}

async function loadCourses() {
  const department = profile.value?.department
  const level = profile.value?.level

  if (!department || !level) {
    courses.value = []
    return
  }

  coursesLoading.value = true
  coursesError.value = null

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, code, title')
      .eq('department', department)
      .eq('level', level)
      .order('code', { ascending: true })

    if (error) throw error
    courses.value = (data as CourseRow[]) || []
  } catch (err: any) {
    console.error('Failed to load courses', err)
    coursesError.value = err?.message || 'Could not load courses.'
  } finally {
    coursesLoading.value = false
  }
}
</script>
