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
        Library
      </p>
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        All your PDFs
      </h1>
      <p class="text-sm text-slate-300">
        Course packs from your department plus your private uploads, all ready
        for Ask and Quick Drill.
      </p>
    </section>

    <!-- Filters / controls -->
    <section class="space-y-3">
      <!-- Source tabs -->
      <div class="flex items-center justify-between gap-2">
        <div
          class="inline-flex rounded-full border border-borderSubtle bg-surface/90 p-1 text-[11px]"
        >
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="
              sourceTab === 'course'
                ? 'bg-primary text-background shadow-sm shadow-primary/40'
                : 'text-slate-400 hover:text-primary-soft'
            "
            @click="sourceTab = 'course'"
          >
            Course Library ({{ courseDocsCount }})
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="
              sourceTab === 'personal'
                ? 'bg-primary text-background shadow-sm shadow-primary/40'
                : 'text-slate-400 hover:text-primary-soft'
            "
            @click="sourceTab = 'personal'"
          >
            My Docs ({{ personalDocsCount }})
          </button>
        </div>

        <p class="hidden text-[11px] text-slate-500 sm:inline">
          Filter by status or course to narrow things down.
        </p>
      </div>

      <!-- Search + status + course filter -->
      <Card
        class="space-y-3 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Search -->
          <label
            class="flex flex-1 items-center gap-2 text-xs text-slate-400"
          >
            <span class="whitespace-nowrap">Search</span>
            <input
              v-model="search"
              type="text"
              placeholder="e.g. ANA 203 Embryology handout"
              class="h-9 flex-1 rounded-full border border-borderSubtle bg-background px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </label>

          <!-- Status filter -->
          <div
            class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400"
          >
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="rounded-full border px-2.5 py-1 transition"
              :class="
                statusFilter === option.value
                  ? 'border-primary bg-primary/10 text-primary-soft'
                  : 'border-borderSubtle text-slate-400 hover:border-primary hover:text-primary-soft'
              "
              @click="statusFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Course filter (only for course tab) -->
        <div
          v-if="sourceTab === 'course'"
          class="flex items-center gap-2 text-xs text-slate-400"
        >
          <span class="whitespace-nowrap">Course</span>
          <select
            v-model="courseFilter"
            class="h-9 flex-1 rounded-full border border-borderSubtle bg-background px-3 text-xs text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">
              All courses
            </option>
            <option
              v-for="c in courseOptions"
              :key="c"
              :value="c"
            >
              {{ c }}
            </option>
          </select>
        </div>

        <!-- Summary line -->
        <p class="text-[11px] text-slate-500">
          Showing
          <span class="font-semibold text-slate-200">
            {{ filteredDocs.length }}
          </span>
          of
          <span class="font-semibold text-slate-200">
            {{ baseDocs.length }}
          </span>
          doc(s).
        </p>
      </Card>
    </section>

    <!-- Status legend -->
    <section class="flex flex-wrap gap-3 text-[10px] text-slate-500">
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-success" />
        Ready (Ask + Drill enabled)
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-warning" />
        Processing (wait a bit)
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-danger" />
        Failed (tap Retry ingest)
      </span>
    </section>

    <!-- Docs list -->
    <section class="space-y-3">
      <!-- Loading skeleton -->
      <div v-if="docsLoading" class="space-y-3">
        <Card
          v-for="n in 3"
          :key="n"
          class="h-[88px] animate-pulse border border-borderSubtle bg-surface/80"
        />
      </div>

      <!-- Empty states -->
      <div v-else-if="!baseDocs.length" class="space-y-3">
        <Card class="space-y-2 border border-borderSubtle bg-surface/95">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            No docs yet
          </p>
          <p class="text-sm text-slate-200">
            {{
              sourceTab === 'course'
                ? 'When your course rep or tutor uploads official handouts, they will appear here as shared course packs.'
                : 'Upload your own handouts, notes, or PDFs from the Home screen to populate your private library.'
            }}
          </p>
        </Card>
      </div>

      <div v-else-if="!filteredDocs.length" class="space-y-3">
        <Card class="space-y-2 border border-borderSubtle bg-surface/95">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            No matches
          </p>
          <p class="text-sm text-slate-200">
            No documents match your current search and filters. Try clearing
            some filters.
          </p>
        </Card>
      </div>

      <!-- Actual docs list -->
      <div v-else class="space-y-3">
        <Card
          v-for="doc in filteredDocs"
          :key="doc.id"
          class="space-y-2 border border-borderSubtle bg-surface/95"
        >
          <!-- Top row: title + status -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ doc.title }}
              </p>
              <div class="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span
                  v-if="doc.course"
                  class="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-primary-soft"
                >
                  {{ doc.course }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1"
                  :class="statusBadgeClass(doc)"
                >
                  {{ statusLabel(doc) }}
                </span>
                <span
                  v-if="(doc as any).pages_count"
                  class="inline-flex items-center rounded-full bg-background px-2.5 py-1"
                >
                  {{ (doc as any).pages_count }} page(s)
                </span>
              </div>
            </div>

            <!-- Ready tag -->
            <div
              v-if="doc.status === 'ready'"
              class="rounded-full bg-success/10 px-2.5 py-1 text-[11px] text-success"
            >
              Ready
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              class="rounded-full border border-borderSubtle px-2.5 py-1 text-slate-200 transition hover:border-primary hover:text-primary-soft"
              @click="openDoc(doc)"
            >
              Open
            </button>

            <NuxtLink
              :to="{ path: '/ask', query: { doc: doc.id } }"
              class="rounded-full border border-borderSubtle px-2.5 py-1 text-slate-200 transition hover:border-primary hover:text-primary-soft"
            >
              Ask from this doc
            </NuxtLink>

            <NuxtLink
              :to="{ path: '/drill', query: { doc: doc.id } }"
              class="rounded-full border border-borderSubtle px-2.5 py-1 text-slate-200 transition hover:border-accent hover:text-accent"
            >
              Drill this doc
            </NuxtLink>

            <button
              v-if="doc.status === 'failed' || doc.status === 'processing'"
              type="button"
              class="rounded-full border border-danger/60 px-2.5 py-1 text-danger transition hover:border-danger"
              @click="retryDoc(doc)"
            >
              Retry ingest
            </button>
          </div>
        </Card>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import Card from '~/components/Card.vue'
import type { DocumentRow } from '~/types/models'
import { useToasts } from '~/stores/useToasts'

const library = useLibrary()
const router = useRouter()
const toasts = useToasts()

const docsLoading = ref(true)

const sourceTab = ref<'course' | 'personal'>('course')
const search = ref('')
const statusFilter = ref<'all' | 'ready' | 'processing' | 'failed'>('all')
const courseFilter = ref<'all' | string>('all')

const statusOptions = [
  { value: 'all' as const, label: 'All' },
  { value: 'ready' as const, label: 'Ready' },
  { value: 'processing' as const, label: 'Processing' },
  { value: 'failed' as const, label: 'Failed' },
]

onMounted(async () => {
  try {
    docsLoading.value = true
    await library.loadDocuments()
  } catch (err: any) {
    toasts.error(err?.message || 'Failed to load documents.')
  } finally {
    docsLoading.value = false
  }
})

// Base splits
const courseDocs = computed<DocumentRow[]>(() =>
  (library.documents as DocumentRow[]).filter((doc) => !!doc.course),
)

const personalDocs = computed<DocumentRow[]>(() =>
  (library.documents as DocumentRow[]).filter((doc) => !doc.course),
)

const courseDocsCount = computed(() => courseDocs.value.length)
const personalDocsCount = computed(() => personalDocs.value.length)

// Course options for filter
const courseOptions = computed<string[]>(() => {
  const set = new Set<string>()
  courseDocs.value.forEach((doc) => {
    if (doc.course) set.add(doc.course)
  })
  return Array.from(set).sort()
})

// Docs for current tab (before search/filters)
const baseDocs = computed<DocumentRow[]>(() =>
  sourceTab.value === 'course' ? courseDocs.value : personalDocs.value,
)

// Filtered docs
const filteredDocs = computed<DocumentRow[]>(() => {
  const term = search.value.trim().toLowerCase()

  return baseDocs.value.filter((doc) => {
    // Status filter
    if (statusFilter.value !== 'all' && doc.status !== statusFilter.value) {
      return false
    }

    // Course filter (only on course tab)
    if (
      sourceTab.value === 'course' &&
      courseFilter.value !== 'all' &&
      doc.course !== courseFilter.value
    ) {
      return false
    }

    // Search filter
    if (!term) return true

    const haystack = [doc.title || '', doc.course || '', (doc as any).kind || '']
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
})

// Status helpers (for per-doc badge)
function statusLabel(doc: DocumentRow): string {
  const s = (doc as any).status
  if (!s) return ''
  if (s === 'ready') return 'Ready'
  if (s === 'processing') return 'Processing'
  if (s === 'failed') return 'Failed'
  return String(s)
}

function statusBadgeClass(doc: DocumentRow): string {
  const s = (doc as any).status
  if (s === 'ready') {
    return 'bg-success/10 text-success border border-success/50'
  }
  if (s === 'processing') {
    return 'bg-warning/10 text-warning border border-warning/50'
  }
  if (s === 'failed') {
    return 'bg-danger/10 text-danger border border-danger/50'
  }
  return 'bg-background text-slate-300 border border-borderSubtle'
}

// Actions
function openDoc(doc: DocumentRow) {
  router.push(`/reader/${doc.id}`)
}

async function retryDoc(doc: DocumentRow) {
  try {
    await library.retryIngest(doc)
    toasts.success('Retry started. Check back in a bit.')
    await library.loadDocuments()
  } catch (err: any) {
    toasts.error(err?.message || 'Retry failed.')
  }
}
</script>
