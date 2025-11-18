<template>
  <main class="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
    <!-- Header -->
    <section class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
        Library
      </p>
      <h1 class="text-3xl font-bold tracking-tight">
        All your PDFs
      </h1>
      <p class="text-sm text-slate-400">
        Course packs from your department plus your private uploads, all ready for Ask and Quick Drill.
      </p>
    </section>

    <!-- Filters / controls -->
    <section class="space-y-3">
      <!-- Source tabs -->
      <div class="flex items-center justify-between gap-2">
        <div class="inline-flex rounded-full border border-white/10 bg-slate-900/80 p-1 text-[11px]">
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="sourceTab === 'course'
              ? 'bg-white text-slate-900'
              : 'text-slate-400'"
            @click="sourceTab = 'course'"
          >
            Course Library ({{ courseDocsCount }})
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold uppercase tracking-[0.16em] transition"
            :class="sourceTab === 'personal'
              ? 'bg-white text-slate-900'
              : 'text-slate-400'"
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
      <Card class="space-y-3 bg-slate-950/80">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <!-- Search -->
          <label class="flex flex-1 items-center gap-2 text-xs text-slate-400">
            <span class="whitespace-nowrap">Search</span>
            <input
              v-model="search"
              type="text"
              placeholder="e.g. ANA 203 Embryology handout"
              class="h-8 flex-1 rounded-full border border-white/10 bg-transparent px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
            />
          </label>

          <!-- Status filter -->
          <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="rounded-full border px-2.5 py-1 transition"
              :class="statusFilter === option.value
                ? 'border-amber-300 bg-amber-200/10 text-amber-200'
                : 'border-white/10 text-slate-400 hover:border-amber-300 hover:text-amber-200'"
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
            class="h-8 flex-1 rounded-full border border-white/10 bg-transparent px-3 text-xs text-slate-100 focus:border-amber-300 focus:outline-none"
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
          <span class="font-semibold text-slate-200">{{ filteredDocs.length }}</span>
          of
          <span class="font-semibold text-slate-200">{{ baseDocs.length }}</span>
          doc(s).
        </p>
      </Card>
    </section>

    <!-- Status legend -->
    <section class="flex flex-wrap gap-3 text-[10px] text-slate-500">
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-emerald-400" /> Ready (Ask + Drill enabled)
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-amber-300" /> Processing (wait a bit)
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full bg-rose-400" /> Failed (tap Retry ingest)
      </span>
    </section>

    <!-- Docs list -->
    <section class="space-y-3">
      <!-- Loading skeleton -->
      <div v-if="docsLoading" class="space-y-3">
        <Card
          v-for="n in 3"
          :key="n"
          class="h-[88px] animate-pulse bg-slate-900/80"
        />
      </div>

      <!-- Empty states -->
      <div v-else-if="!baseDocs.length" class="space-y-3">
        <Card class="space-y-2 bg-slate-950/80">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
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
        <Card class="space-y-2 bg-slate-950/80">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            No matches
          </p>
          <p class="text-sm text-slate-200">
            No documents match your current search and filters. Try clearing some filters.
          </p>
        </Card>
      </div>

      <!-- Actual docs list -->
      <div v-else class="space-y-3">
        <Card
          v-for="doc in filteredDocs"
          :key="doc.id"
          class="space-y-2 bg-slate-950/80"
        >
          <!-- Top row: title + status -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ doc.title }}
              </p>
              <div class="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span v-if="doc.course" class="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-amber-200">
                  {{ doc.course }}
                </span>
                <span class="inline-flex items-center rounded-full px-2.5 py-1" :class="statusBadgeClass(doc)">
                  {{ statusLabel(doc) }}
                </span>
                <span v-if="(doc as any).pages_count" class="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1">
                  {{ (doc as any).pages_count }} page(s)
                </span>
              </div>
            </div>

            <!-- Ready tag -->
            <div v-if="doc.status === 'ready'" class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
              Ready
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
              @click="openDoc(doc)"
            >
              Open
            </button>

            <NuxtLink
              :to="{ path: '/ask', query: { doc: doc.id } }"
              class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
            >
              Ask from this doc
            </NuxtLink>

            <NuxtLink
              :to="{ path: '/drill', query: { doc: doc.id } }"
              class="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
            >
              Drill this doc
            </NuxtLink>

            <button
              v-if="doc.status === 'failed' || doc.status === 'processing'"
              type="button"
              class="rounded-full border border-rose-400/50 px-2.5 py-1 text-rose-200 transition hover:border-rose-300"
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
  (library.documents as DocumentRow[]).filter((doc) => !!doc.course)
)

const personalDocs = computed<DocumentRow[]>(() =>
  (library.documents as DocumentRow[]).filter((doc) => !doc.course)
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
  sourceTab.value === 'course' ? courseDocs.value : personalDocs.value
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

    const haystack = [
      doc.title || '',
      doc.course || '',
      (doc as any).kind || '',
    ]
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
    return 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/40'
  }
  if (s === 'processing') {
    return 'bg-amber-500/10 text-amber-200 border border-amber-400/40'
  }
  if (s === 'failed') {
    return 'bg-rose-500/10 text-rose-200 border border-rose-400/40'
  }
  return 'bg-slate-900 text-slate-300 border border-white/10'
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
