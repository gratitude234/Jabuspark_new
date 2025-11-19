<template>
  <main
    class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-background px-4 pb-24 pt-6 text-slate-50"
  >
    <!-- Header + context -->
    <section
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="space-y-3">
        <NuxtLink
          to="/library"
          class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-primary-soft"
        >
          ← Library
        </NuxtLink>

        <div class="space-y-1">
          <p
            class="inline-flex items-center gap-1 rounded-full bg-primary-soft/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
            Reader
          </p>
          <h1 class="text-2xl font-semibold leading-tight sm:text-3xl">
            {{ doc?.title || 'Document' }}
          </h1>
          <p class="text-xs text-slate-400">
            Scroll the PDF, pick a page, then ask questions or drill from this
            handout.
          </p>
        </div>

        <div class="flex flex-wrap gap-2 text-[11px] text-slate-400">
          <span
            v-if="doc?.course"
            class="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-primary-soft"
          >
            {{ doc.course }}
          </span>

          <span
            v-if="doc?.status"
            class="inline-flex items-center rounded-full px-2.5 py-1"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>

          <span
            v-if="pages.length"
            class="inline-flex items-center rounded-full bg-background px-2.5 py-1"
          >
            {{ pages.length }} page(s)
          </span>
        </div>
      </div>

      <!-- Primary actions -->
      <div
        class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      >
        <Button
          class="w-full bg-primary text-background hover:bg-primary/90 sm:w-auto"
          :disabled="!doc"
          @click="askAboutPage"
        >
          Ask about this page
        </Button>
        <Button
          class="w-full border border-borderSubtle bg-surface text-slate-100 hover:border-accent hover:bg-accent/10 sm:w-auto"
          :disabled="!doc"
          @click="drillThisDoc"
        >
          Start MCQ drill
        </Button>
      </div>
    </section>

    <!-- PDF preview -->
    <section class="space-y-3">
      <Card
        class="overflow-hidden border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
      >
        <div class="h-[480px] w-full">
          <!-- Loading skeleton -->
          <div
            v-if="loading"
            class="h-full w-full animate-pulse rounded-2xl bg-surface/70"
          />

          <!-- Error -->
          <div
            v-else-if="error"
            class="flex h-full items-center justify-center p-6 text-center text-sm text-danger"
          >
            {{ error }}
          </div>

          <!-- Iframe preview -->
          <iframe
            v-else-if="pdfUrl"
            :src="pdfUrl"
            class="h-full w-full rounded-2xl border-0 bg-background"
            title="PDF preview"
          ></iframe>

          <!-- Fallback -->
          <div
            v-else
            class="flex h-full items-center justify-center p-6 text-center text-sm text-slate-400"
          >
            No preview available for this document.
          </div>
        </div>
      </Card>

      <!-- Page selector -->
      <div v-if="pages.length" class="flex flex-wrap gap-2">
        <button
          v-for="page in pages"
          :key="page"
          type="button"
          class="rounded-full border px-3 py-1 text-xs transition"
          :class="
            page === currentPage
              ? 'border-primary bg-primary/10 text-primary-soft shadow-sm shadow-primary/40'
              : 'border-borderSubtle text-slate-400 hover:border-primary hover:text-primary-soft'
          "
          @click="setPage(page)"
        >
          p{{ page }}
        </button>
      </div>
      <p v-else class="text-xs text-slate-500">
        Page navigation will appear once this document finishes processing.
      </p>
    </section>

    <!-- Helper tips -->
    <section class="space-y-2">
      <Card
        class="space-y-3 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          How to use this view
        </p>
        <ul class="list-disc space-y-1 pl-5 text-sm text-slate-200">
          <li>
            Use the page chips to tell JabuSpark which part of the handout
            you’re focused on.
          </li>
          <li>
            <span class="font-semibold">“Ask about this page”</span> opens the
            Ask screen with this doc and page pre-selected.
          </li>
          <li>
            <span class="font-semibold">“Start MCQ drill”</span> jumps into
            Quick Drill using this document as a source.
          </li>
        </ul>
      </Card>
    </section>
  </main>
</template>

<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import type { DocumentRow } from '~/types/models'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const library = useLibrary()

const doc = ref<DocumentRow | null>(null)
const pdfUrl = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

const currentPage = ref(Number(route.query.page) || 1)

const pages = computed(() => {
  const total = (doc.value as any)?.pages_count || 1
  return Array.from({ length: total }, (_, i) => i + 1)
})

const statusLabel = computed(() => {
  const status = (doc.value as any)?.status
  if (!status) return ''
  if (status === 'ready') return 'Ready'
  if (status === 'processing') return 'Processing'
  if (status === 'failed') return 'Failed'
  return String(status)
})

const statusBadgeClass = computed(() => {
  const status = (doc.value as any)?.status
  if (status === 'ready') {
    return 'bg-success/10 text-success border border-success/50'
  }
  if (status === 'processing') {
    return 'bg-warning/10 text-warning border border-warning/50'
  }
  if (status === 'failed') {
    return 'bg-danger/10 text-danger border border-danger/50'
  }
  return 'bg-background text-slate-300 border border-borderSubtle'
})

onMounted(async () => {
  await fetchDoc()
})

watch(
  () => route.query.page,
  (value) => {
    if (!value) return
    const page = Number(value)
    if (!Number.isNaN(page)) currentPage.value = page
  },
)

// Save reader session whenever page changes
watch(currentPage, (page) => {
  if (!doc.value) return
  library.saveSession({
    id: doc.value.id,
    docId: doc.value.id,
    page,
    mode: 'reader',
    metadata: { docId: doc.value.id, page, title: doc.value.title },
  })
})

async function fetchDoc() {
  loading.value = true
  error.value = null
  pdfUrl.value = ''

  const { data, error: err } = await client
    .from('documents')
    .select('*')
    .eq('id', route.params.docId)
    .single()

  if (err) {
    error.value = err.message || 'Failed to load document.'
    loading.value = false
    return
  }

  doc.value = data as DocumentRow

  try {
    const storagePath = (doc.value as any).storage_path
    if (!storagePath) {
      error.value = 'No file attached to this document.'
      loading.value = false
      return
    }

    // 10-minute signed URL
    const { data: signed, error: signedErr } = await client.storage
      .from('docs')
      .createSignedUrl(storagePath, 60 * 10)

    if (signedErr) {
      error.value = signedErr.message || 'Could not generate preview URL.'
    } else {
      pdfUrl.value = signed?.signedUrl || ''
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to prepare PDF preview.'
  } finally {
    loading.value = false
  }
}

function setPage(page: number) {
  currentPage.value = page
  router.replace({ path: route.path, query: { ...route.query, page } })
}

function askAboutPage() {
  if (!doc.value) return
  router.push({
    path: '/ask',
    query: { doc: doc.value.id, page: currentPage.value },
  })
}

function drillThisDoc() {
  if (!doc.value) return
  router.push({
    path: '/drill',
    query: { doc: doc.value.id },
  })
}
</script>
