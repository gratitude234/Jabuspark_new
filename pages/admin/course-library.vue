<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Header -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          JabuSpark Admin
        </p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">
          Course Library Console
        </h1>
        <p class="mt-1 text-sm text-slate-400">
          Review, approve, or archive official course packs uploaded for Nursing 200L.
        </p>
      </div>

      <div class="flex flex-col items-end gap-1">
        <span
          class="inline-flex items-center rounded-full border border-rose-300/60 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200"
        >
          Admin Only
        </span>
        <p class="text-[11px] text-slate-500">
          {{ roleLabel }}
        </p>
      </div>
    </header>

    <!-- Access guard -->
    <section v-if="profileLoaded && !isAdmin" class="space-y-3">
      <Card class="space-y-3 bg-slate-950/80">
        <p class="text-sm font-semibold text-rose-200">
          You don’t have access to this page.
        </p>
        <p class="text-sm text-slate-300">
          Only <span class="font-semibold">tutors</span> and
          <span class="font-semibold">admins</span> can manage the Course Library.
        </p>
        <p class="text-[11px] text-slate-500">
          If you’re a course rep and think you should have access, contact the JabuSpark admin.
        </p>
        <div class="flex flex-wrap gap-2 text-[11px]">
          <NuxtLink
            to="/"
            class="rounded-full border border-white/15 px-3 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
          >
            Back to home
          </NuxtLink>
          <NuxtLink
            to="/me"
            class="rounded-full border border-white/15 px-3 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
          >
            View my profile
          </NuxtLink>
        </div>
      </Card>
    </section>

    <!-- Main admin content -->
    <section v-else class="space-y-4">
      <!-- Info card -->
      <Card class="space-y-3 bg-slate-950/80">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              How this works
            </p>
            <p class="text-sm text-slate-200">
              Course reps can upload <span class="font-semibold">course packs</span>
              (official handouts, past questions, schemes) tagged to a course.
              You review them here before they appear in the Course Library.
            </p>
          </div>
          <div class="text-right text-[11px] text-slate-500">
            <p>Total docs: <span class="font-semibold text-slate-100">{{ totalDocs }}</span></p>
            <p>Pending: <span class="font-semibold text-amber-200">{{ pendingCount }}</span></p>
            <p>Approved: <span class="font-semibold text-emerald-200">{{ approvedCount }}</span></p>
          </div>
        </div>

        <ul class="flex flex-wrap gap-2 text-[11px] text-slate-400">
          <li class="flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-amber-300" /> Pending review
          </li>
          <li class="flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-emerald-400" /> Approved
          </li>
          <li class="flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-slate-500" /> Archived / hidden
          </li>
        </ul>

        <p class="text-[11px] text-amber-200/90">
          Course packs listed here update live from Supabase. Approvals instantly unlock them for every JabuSpark student.
        </p>
      </Card>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-2">
        <div
          v-for="n in 3"
          :key="n"
          class="h-[96px] animate-pulse rounded-2xl bg-slate-900/70"
        />
      </div>

      <!-- Course groups -->
      <div v-else-if="courseGroups.length" class="space-y-4">
        <Card
          v-for="group in courseGroups"
          :key="group.course"
          class="space-y-3 bg-slate-950/80"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ group.course }}
              </p>
              <p class="text-[11px] text-slate-400">
                {{ group.docs.length }} doc(s) ·
                {{ group.approvedCount }} approved ·
                {{ group.pendingCount }} pending
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="doc in group.docs"
              :key="doc.id"
              class="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <!-- Left: title & meta -->
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-100">
                  {{ doc.title }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ doc.type }} · Uploaded by
                  <span class="font-semibold">{{ doc.uploaderName }}</span>
                  <span class="text-slate-500">({{ doc.uploaderEmail }})</span>
                </p>
                <p class="text-[11px] text-slate-500">
                  {{ niceDate(doc.createdAt) }} · Status:
                  <span
                    :class="[
                      'font-semibold',
                      doc.approvalStatus === 'pending'
                        ? 'text-amber-200'
                        : doc.approvalStatus === 'approved'
                          ? 'text-emerald-200'
                          : 'text-slate-400'
                    ]"
                  >
                    {{ doc.approvalStatusLabel }}
                  </span>
                </p>
              </div>

              <!-- Right: actions -->
              <div class="flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  class="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400"
                >
                  {{ doc.visibility === 'course' ? 'Course pack' : 'Personal' }}
                </span>

                <button
                  type="button"
                  class="rounded-full border border-white/15 px-3 py-1 text-slate-200 transition hover:border-emerald-300 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="doc.approvalStatus === 'approved'"
                  @click="approveDoc(doc)"
                >
                  Approve
                </button>
                <button
                  type="button"
                  class="rounded-full border border-white/15 px-3 py-1 text-slate-200 transition hover:border-rose-300 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="doc.approvalStatus === 'archived'"
                  @click="archiveDoc(doc)"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Empty state -->
      <section v-else class="space-y-3">
        <Card class="space-y-3 bg-slate-950/80">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            No course docs yet
          </p>
          <p class="text-sm text-slate-200">
            Once course reps start uploading official packs with
            <span class="font-semibold">visibility = "course"</span>, they’ll appear here
            grouped by course.
          </p>
          <p class="text-[11px] text-slate-500">
            You’ll then be able to review, approve, or archive them before students see them in
            the Course Library.
          </p>
        </Card>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import Card from '~/components/Card.vue'
import { useToasts } from '~/stores/useToasts'

interface AdminCourseDoc {
  id: string
  title: string
  course: string
  type: string
  visibility: 'personal' | 'course'
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  approvalStatus: 'pending' | 'approved' | 'archived'
  approvalStatusLabel: string
  uploaderName: string
  uploaderEmail: string
  createdAt: string
}

const auth = useAuth()
const toasts = useToasts()

const profileLoaded = ref(false)
const loading = ref(true)

const docs = ref<AdminCourseDoc[]>([])

async function loadDocs() {
  if (!isAdmin.value) {
    loading.value = false
    docs.value = []
    return
  }

  loading.value = true
  try {
    const response: any = await $fetch('/api/admin/course-docs')
    docs.value = (response.docs || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      course: row.course,
      type: row.doc_type || 'Course pack',
      visibility: 'course',
      status: row.status,
      approvalStatus: row.approval_status,
      approvalStatusLabel:
        row.approval_status === 'approved'
          ? 'Approved & visible'
          : row.approval_status === 'archived'
            ? 'Archived / hidden'
            : 'Pending review',
      uploaderName: row.uploader_name || 'Unknown',
      uploaderEmail: row.uploader_email || '',
      createdAt: row.created_at,
    }))
  } catch (err: any) {
    toasts.error(err?.statusMessage || err?.message || 'Failed to load course docs')
  } finally {
    loading.value = false
  }
}




// Group course docs by course
const courseGroups = computed(() => {
  const map = new Map<string, AdminCourseDoc[]>()

  docs.value.forEach((doc) => {
    if (doc.visibility !== 'course') return
    if (!map.has(doc.course)) map.set(doc.course, [])
    map.get(doc.course)!.push(doc)
  })

  return Array.from(map.entries()).map(([course, list]) => {
    const approvedCount = list.filter((d) => d.approvalStatus === 'approved').length
    const pendingCount = list.filter((d) => d.approvalStatus === 'pending').length

    return {
      course,
      docs: list,
      approvedCount,
      pendingCount,
    }
  })
})

const totalDocs = computed(() => docs.value.length)
const pendingCount = computed(
  () => docs.value.filter((d) => d.approvalStatus === 'pending').length
)
const approvedCount = computed(
  () => docs.value.filter((d) => d.approvalStatus === 'approved').length
)

const roleLabel = computed(() => {
  const role = ((auth.profile as any)?.role as string) || 'student'
  return `Role: ${role}`
})

const isAdmin = computed(() => {
  const role = ((auth.profile as any)?.role as string) || 'student'
  return role === 'admin' || role === 'tutor'
})

onMounted(async () => {
  try {
    await auth.init()
  } catch (err: any) {
    toasts.error(err?.message || 'Failed to load profile')
  } finally {
    profileLoaded.value = true
  }

  if (isAdmin.value) {
    await loadDocs()
  } else {
    loading.value = false
  }
})

watch(
  () => isAdmin.value,
  (value) => {
    if (!profileLoaded.value) return
    if (value) {
      loadDocs()
    } else {
      docs.value = []
      loading.value = false
    }
  },
)


async function approveDoc(doc: AdminCourseDoc) {
  if (doc.approvalStatus === 'approved') return
  try {
    await $fetch('/api/admin/course-docs/approve', {
      method: 'POST',
      body: { id: doc.id },
    })
    doc.approvalStatus = 'approved'
    doc.approvalStatusLabel = 'Approved & visible'
    toasts.success(`Approved "${doc.title}" for ${doc.course}.`)
  } catch (err: any) {
    toasts.error(err?.statusMessage || err?.message || 'Failed to approve document')
  }
}

async function archiveDoc(doc: AdminCourseDoc) {
  if (doc.approvalStatus === 'archived') return
  try {
    await $fetch('/api/admin/course-docs/archive', {
      method: 'POST',
      body: { id: doc.id },
    })
    doc.approvalStatus = 'archived'
    doc.approvalStatusLabel = 'Archived / hidden'
    toasts.success(`Archived "${doc.title}" for ${doc.course}.`)
  } catch (err: any) {
    toasts.error(err?.statusMessage || err?.message || 'Failed to archive document')
  }
}

function niceDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
