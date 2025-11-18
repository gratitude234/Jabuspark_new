<template>
  <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Top bar -->
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          JabuSpark
        </p>
        <p class="mt-1 text-[11px] text-slate-500">
          {{ cohortLabel }}
        </p>
      </div>

      <!-- Avatar / sign-in -->
      <ClientOnly>
        <template #fallback>
          <div class="h-8 w-8 rounded-full bg-slate-800" />
        </template>
        <div v-if="auth.isLoggedIn" class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/15 text-xs font-semibold text-amber-100"
          >
            {{ avatarInitials }}
          </div>
        </div>
        <NuxtLink
          v-else
          to="/me"
          class="rounded-full border border-amber-300/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-200 hover:bg-amber-200/10"
        >
          Sign in
        </NuxtLink>
      </ClientOnly>
    </header>

    <!-- Hero -->
    <section class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
        Exam sprint ready
      </p>
      <h1 class="text-3xl font-bold tracking-tight">
        Your 200L Nursing study hub
      </h1>
      <p class="text-sm text-slate-300">
        Ask, drill, and discuss official course materials plus your own notes — all in one place.
      </p>
    </section>

    <!-- Resume + stats -->
    <section class="space-y-3">
      <!-- Resume last session -->
      <Card
        v-if="showResume"
        class="cursor-pointer bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-lg shadow-amber-500/10 transition hover:shadow-amber-400/30"
        @click="resumeSession"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
              Last session
            </p>
            <p class="text-lg font-semibold">
              {{ resumeTitle }}
            </p>
            <p class="text-xs text-slate-300">
              {{ resumeSubtitle }}
            </p>
            <p class="text-[11px] text-emerald-300/80">
              Tap to continue exactly where you stopped.
            </p>
          </div>
          <div class="rounded-xl bg-emerald-400/10 px-3 py-2 text-right text-[11px] text-emerald-100">
            <p class="font-semibold uppercase tracking-[0.16em]">
              Resume
            </p>
            <p class="text-[11px] text-emerald-200/90">
              Study flow
            </p>
          </div>
        </div>
      </Card>

      <!-- Quick stats -->
      <div class="grid gap-3 sm:grid-cols-3">
        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Docs
          </p>
          <p class="text-xl font-semibold">
            {{ docsCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            Total accessible
          </p>
        </Card>
        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Ready
          </p>
          <p class="text-xl font-semibold">
            {{ readyDocsCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            Ingested for Ask + Drill
          </p>
        </Card>
        <Card class="space-y-1">
          <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Courses
          </p>
          <p class="text-xl font-semibold">
            {{ courseCount }}
          </p>
          <p class="text-[11px] text-slate-500">
            With course docs
          </p>
        </Card>
      </div>
    </section>

    <!-- Primary flows -->
    <section class="grid gap-3 md:grid-cols-3">
      <!-- Upload personal / course doc -->
      <ClientOnly>
        <template #fallback>
          <div
            class="rounded-2xl border border-dashed border-amber-200/40 bg-slate-900/60 p-4 text-left text-sm text-slate-400"
          >
            Checking sign-in status…
          </div>
        </template>

        <div
          v-if="canUpload"
          class="flex flex-col gap-3 rounded-2xl border border-dashed border-amber-200/50 bg-slate-950/70 p-4 text-left text-sm"
        >
          <button
            class="w-full rounded-xl border border-transparent bg-transparent text-left transition hover:border-amber-200/50 hover:bg-slate-900/60"
            :disabled="uploading"
            @click="selectFile('personal')"
          >
            <div class="space-y-1">
              <p class="text-base font-semibold">
                {{ uploading && uploadMode === 'personal' ? 'Uploading…' : 'Upload personal PDF' }}
              </p>
              <p class="text-[11px] text-slate-400">
                Handouts, notes, extra material
              </p>
            </div>
            <p
              v-if="uploading && uploadMode === 'personal'"
              class="mt-2 text-[11px] text-amber-200"
            >
              Hold on – we’ll start processing in the background.
            </p>
            <p v-else class="mt-2 text-[11px] text-amber-200/80">
              Private to your account only.
            </p>
          </button>

          <button
            v-if="isCourseRep"
            class="w-full rounded-xl border border-transparent bg-transparent text-left transition hover:border-emerald-200/60 hover:bg-slate-900/60"
            :disabled="uploading"
            @click="selectFile('course')"
          >
            <div class="space-y-1">
              <p class="text-base font-semibold text-emerald-100">
                {{ uploading && uploadMode === 'course' ? 'Uploading…' : 'Upload course pack' }}
              </p>
              <p class="text-[11px] text-slate-400">
                Official handouts, schemes, past questions
              </p>
            </div>
            <p
              v-if="uploading && uploadMode === 'course'"
              class="mt-2 text-[11px] text-emerald-200"
            >
              Sending to Course Library reviewers…
            </p>
            <p v-else class="mt-2 text-[11px] text-emerald-200/80">
              Visible to everyone after tutor/admin approval.
            </p>
          </button>
        </div>

        <NuxtLink
          v-else
          to="/me"
          class="flex flex-col justify-between rounded-2xl border border-dashed border-amber-200/40 bg-slate-950/70 p-4 text-left text-sm transition hover:border-amber-200/70"
        >
          <div class="space-y-1">
            <p class="text-base font-semibold">
              Sign in to upload
            </p>
            <p class="text-[11px] text-slate-400">
              Tap to get a magic link to your JABU email.
            </p>
          </div>
          <p class="mt-2 text-[11px] text-amber-200/80">
            Your personal docs stay private.
          </p>
        </NuxtLink>
      </ClientOnly>

      <!-- Quick Drill -->
      <NuxtLink
        to="/drill"
        class="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left text-sm transition hover:border-amber-200/60 hover:bg-slate-900"
      >
        <div class="space-y-1">
          <p class="text-base font-semibold">
            Quick Drill
          </p>
          <p class="text-[11px] text-slate-400">
            MCQs from your docs · instant marking
          </p>
        </div>
        <p class="mt-2 text-[11px] text-slate-300">
          Perfect for pre-exam sprints.
        </p>
      </NuxtLink>

      <!-- Ask -->
      <NuxtLink
        to="/ask"
        class="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left text-sm transition hover:border-amber-200/60 hover:bg-slate-900"
      >
        <div class="space-y-1">
          <p class="text-base font-semibold">
            Ask
          </p>
          <p class="text-[11px] text-slate-400">
            Source-true Q&A with citations
          </p>
        </div>
        <p class="mt-2 text-[11px] text-slate-300">
          Great for clarifying tricky handout pages.
        </p>
      </NuxtLink>
    </section>

    <!-- Docs: Course Library vs My Docs -->
    <section class="space-y-3">
      <!-- Tab control -->
      <div class="flex items-center justify-between gap-2">
        <div class="inline-flex rounded-full border border-white/10 bg-slate-900/80 p-1 text-[11px]">
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="docTab === 'course'
              ? 'bg-white text-slate-900'
              : 'text-slate-400'"
            @click="docTab = 'course'"
          >
            Course Library
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="docTab === 'personal'
              ? 'bg-white text-slate-900'
              : 'text-slate-400'"
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
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Course Library – Nursing 200L
          </p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="docsLoading" class="mt-2 space-y-2">
          <div
            v-for="n in 3"
            :key="n"
            class="h-[76px] animate-pulse rounded-2xl bg-slate-900/70"
          />
        </div>

        <!-- Groups by course -->
        <div v-else-if="courseGroups.length" class="space-y-3">
          <Card
            v-for="group in courseGroups"
            :key="group.course"
            class="space-y-3 bg-slate-950/70"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-100">
                  {{ group.course }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ group.docs.length }} doc(s) ·
                  {{ group.readyCount }} ready for AI
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 text-[11px]">
              <NuxtLink
                v-if="group.firstReadyId"
                :to="{ path: '/ask', query: { doc: group.firstReadyId } }"
                class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
              >
                Ask from this course
              </NuxtLink>
              <button
                v-else
                type="button"
                class="cursor-not-allowed rounded-full border border-white/10 px-2.5 py-1 text-slate-500"
              >
                Ingest docs to enable Ask
              </button>

              <NuxtLink
                :to="{ path: '/drill', query: { course: group.course } }"
                class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
              >
                Drill this course
              </NuxtLink>
            </div>
          </Card>
        </div>

        <!-- Empty course library -->
        <div v-else class="space-y-2">
          <Card class="space-y-3 bg-slate-950/70">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              No course packs yet
            </p>
            <p class="text-sm text-slate-200">
              When your course rep or tutor uploads official handouts for the department,
              they’ll appear here as shared course packs.
            </p>
            <p class="text-[11px] text-slate-500">
              For now, you can still upload your own PDFs and use Ask + Quick Drill.
            </p>
          </Card>
        </div>
      </div>

      <!-- MY DOCS VIEW -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            My Docs (Private)
          </p>
          <div class="flex items-center gap-2 text-[10px] text-slate-500">
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-400" /> Ready
            </span>
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-amber-300" /> Processing
            </span>
            <span class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-rose-400" /> Failed
            </span>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="docsLoading" class="mt-2 space-y-2">
          <div
            v-for="n in 3"
            :key="n"
            class="h-[64px] animate-pulse rounded-2xl bg-slate-900/70"
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
                ? 'Upload your first PDF to start drilling and asking questions.'
                : 'Sign in to upload your PDFs and turn them into drills.'
            }}
          </p>
        </ClientOnly>
      </div>
    </section>

    <!-- Community preview -->
    <section class="space-y-2">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Community – Nursing 200L
      </p>
      <Card class="space-y-3 bg-slate-950/70">
        <p class="text-sm text-slate-200">
          Soon, you’ll be able to discuss tricky topics with classmates right inside JabuSpark.
          Think “Explain gastrulation like I’m 100L” or “Is Orem’s theory in this exam?”.
        </p>
        <ul class="list-disc space-y-1 pl-5 text-[12px] text-slate-300">
          <li>Course spaces per course (ANA 203, NSC 201, BCH 201…)</li>
          <li>Threads attached to Ask answers and Drill questions</li>
          <li>Rep / tutor badges for trusted explanations</li>
        </ul>
        <p class="text-[11px] text-amber-200/90">
          Design-first now — backend hooks for community can plug in later.
        </p>
      </Card>
    </section>

    <!-- Onboarding card for total first-timers -->
    <section v-if="showOnboarding" class="space-y-2">
      <Card class="space-y-3 border-dashed border-amber-200/40 bg-slate-950/80">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          New to JabuSpark?
        </p>
        <ol class="space-y-2 text-sm text-slate-200">
          <li>
            <span class="font-semibold text-amber-200">1.</span>
            Upload one course PDF (e.g. ANA 203 Embryology handout).
          </li>
          <li>
            <span class="font-semibold text-amber-200">2.</span>
            Wait until its status shows as
            <span class="font-semibold text-emerald-300">Ready</span>.
          </li>
          <li>
            <span class="font-semibold text-amber-200">3.</span>
            Use <span class="font-semibold">Ask</span> for explanations
            or <span class="font-semibold">Quick Drill</span> for MCQs.
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

const docsCount = computed(() => personalDocs.value.length + courseDocs.value.length)
const readyDocsCount = computed(() => readyDocs.value.length)
const showReadyDocsHint = computed(() => !docsLoading.value && readyDocsCount.value === 0)

const showOnboarding = computed(
  () => !docsLoading.value && docsCount.value === 0 && courseCount.value === 0,
)

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

const showResume = computed(() => !!library.lastSession && !sessionLoading.value)

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
  const mode = session.mode
  const metadata = session.metadata || {}

  if (mode === 'reader' && session.page) {
    return `Back to page ${session.page}`
  }

  if (mode === 'ask') {
    const raw = metadata.question ? String(metadata.question) : ''
    const preview = raw.slice(0, 60)
    if (!raw) return 'Continue your last Ask chat.'
    return `Last question: “${preview}${raw.length > 60 ? '…' : ''}”`
  }

  if (mode === 'drill') {
    const count = metadata.count || 10
    return `MCQ drill · ${count} question(s)`
  }

  return 'Jump back into your last study session.'
})

onMounted(async () => {
  try {
    await auth.init()
  } catch (err: any) {
    toasts.error(err?.message || 'Failed to initialise auth')
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

function selectFile(mode: 'personal' | 'course' = 'personal') {
  uploadMode.value = mode
  // open file dialog directly from the button click (user gesture)
  fileInput.value?.click()
}

async function handleUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    uploading.value = true

    if (uploadMode.value === 'course') {
      // ask for course code AFTER file selection
      const input = window.prompt('Enter course code (e.g. ANA 203):') || ''
      const trimmed = input.trim()

      if (!trimmed) {
        toasts.error('Course code is required for course library upload.')
        return
      }

      uploadCourse.value = trimmed

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

    await library.loadDocuments()
  } catch (error: any) {
    toasts.error(error?.message || 'Upload failed')
  } finally {
    uploading.value = false
    target.value = ''
    uploadMode.value = 'personal'
    uploadCourse.value = null
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
    router.push({
      path: `/reader/${session.docId}`,
      query: session.page ? { page: session.page } : {},
    })
  }
}

function openDoc(doc: any) {
  router.push(`/reader/${doc.id}