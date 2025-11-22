<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-white">Reports</h1>
          <p class="text-sm text-slate-400">Review content reports and update their status.</p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <select
            v-model="statusFilter"
            class="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option v-for="status in statuses" :key="status" :value="status" class="bg-slate-900">
              {{ status }}
            </option>
          </select>
          <select
            v-model="typeFilter"
            class="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          >
            <option value="all">All types</option>
            <option v-for="type in contentTypes" :key="type" :value="type" class="bg-slate-900 capitalize">
              {{ type }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-400">
            <tr>
              <th class="px-2 py-2">Type</th>
              <th class="px-2 py-2">Reason</th>
              <th class="px-2 py-2">Status</th>
              <th class="px-2 py-2">Reporter</th>
              <th class="px-2 py-2">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="report in reports"
              :key="report.id"
              class="cursor-pointer text-slate-200 hover:bg-white/5"
              @click="openReport(report)"
            >
              <td class="px-2 py-2 capitalize">{{ report.content_type || '—' }}</td>
              <td class="px-2 py-2 text-slate-300">
                {{ truncate(report.reason, 80) }}
              </td>
              <td class="px-2 py-2">
                <span
                  class="rounded-full px-2 py-1 text-xs capitalize"
                  :class="statusClass(report.status)"
                >
                  {{ report.status }}
                </span>
              </td>
              <td class="px-2 py-2">{{ userDisplay(report.reporter_id) }}</td>
              <td class="px-2 py-2 text-slate-400">{{ formatDate(report.created_at) }}</td>
            </tr>
            <tr v-if="!loading && reports.length === 0">
              <td colspan="5" class="px-2 py-4 text-center text-slate-400">No reports found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="error" class="mt-3 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
        {{ error }}
      </div>
    </div>

    <!-- Drawer -->
    <Transition name="fade">
      <div
        v-if="selectedReport"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur"
        @click.self="closeDrawer"
      >
        <div
          class="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto border-l border-white/5 bg-slate-900/95 p-6 shadow-2xl shadow-black/40"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-white">Report Detail</h3>
              <p class="text-xs text-slate-400">ID: {{ selectedReport.id }}</p>
            </div>
            <button class="text-sm text-slate-400 hover:text-white" @click="closeDrawer">Close</button>
          </div>

          <div class="mt-4 space-y-3 text-sm text-slate-200">
            <div>
              <p class="text-slate-400">Type</p>
              <p class="font-medium capitalize">{{ selectedReport.content_type || '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Reason</p>
              <p class="font-medium whitespace-pre-line">{{ selectedReport.reason || '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Extra details</p>
              <pre class="mt-1 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 overflow-x-auto">
{{ prettyMeta(selectedReport.extra_details) }}
              </pre>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-slate-400">Reporter</p>
                <p class="font-medium">{{ userDisplay(selectedReport.reporter_id) }}</p>
              </div>
              <div>
                <p class="text-slate-400">Created at</p>
                <p class="font-medium">{{ formatDate(selectedReport.created_at) }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-slate-400">Status</p>
                <select
                  v-model="selectedStatus"
                  class="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                >
                  <option v-for="status in statuses" :key="status" :value="status" class="bg-slate-900">
                    {{ status }}
                  </option>
                </select>
              </div>
              <div>
                <p class="text-slate-400">Resolution notes</p>
                <textarea
                  v-model="resolutionNotes"
                  rows="3"
                  class="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                  placeholder="Add context or resolution..."
                ></textarea>
              </div>
            </div>
          </div>

          <div v-if="drawerError" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-xs text-rose-100">
            {{ drawerError }}
          </div>

          <div class="mt-5 flex gap-2">
            <button
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="saving"
              @click="saveReport"
            >
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
            <button
              class="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200"
              @click="closeDrawer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'Reports',
})

const client = useSupabaseClient()
const { profile: adminProfile } = useCurrentProfile()

const reports = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const statusFilter = ref<'all' | string>('all')
const typeFilter = ref<'all' | string>('all')

const selectedReport = ref<any | null>(null)
const selectedStatus = ref<string>('open')
const resolutionNotes = ref<string>('')
const drawerError = ref<string | null>(null)
const saving = ref(false)

const statuses = ['open', 'in_review', 'resolved', 'dismissed']
const contentTypes = ['document', 'question', 'ask_tutor_answer']

const profileMap = ref<Record<string, { full_name: string | null; email: string | null }>>({})

function truncate(str: string | null, max = 80) {
  if (!str) return '—'
  return str.length > max ? `${str.slice(0, max)}…` : str
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function statusClass(status: string | null) {
  const base = 'bg-white/10 text-white'
  if (status === 'open') return 'bg-amber-400/15 text-amber-200'
  if (status === 'in_review') return 'bg-blue-400/15 text-blue-200'
  if (status === 'resolved') return 'bg-emerald-400/15 text-emerald-200'
  if (status === 'dismissed') return 'bg-slate-600 text-slate-100'
  return base
}

function userDisplay(id?: string | null) {
  if (!id) return '—'
  const entry = profileMap.value[id]
  if (!entry) return id.slice(0, 6)
  return entry.full_name || entry.email || id.slice(0, 6)
}

function prettyMeta(meta: any) {
  try {
    return JSON.stringify(meta ?? {}, null, 2)
  } catch {
    return String(meta ?? '')
  }
}

async function fetchReports() {
  loading.value = true
  error.value = null
  try {
    let query = client
      .from('content_reports')
      .select('id, reporter_id, content_type, reason, status, created_at, extra_details, resolved_by, resolved_at, resolution_notes')
      .order('created_at', { ascending: false })
      .limit(50)

    if (statusFilter.value !== 'all') {
      query = query.eq('status', statusFilter.value)
    }
    if (typeFilter.value !== 'all') {
      query = query.eq('content_type', typeFilter.value)
    }

    const { data, error: fetchError } = await query
    if (fetchError) throw fetchError

    reports.value = data || []

    const ids = [...new Set(reports.value.map((r) => r.reporter_id).filter(Boolean))]
    if (ids.length) {
      const { data: profiles, error: profileError } = await client
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids as string[])
      if (profileError) throw profileError
      profileMap.value = (profiles || []).reduce((map, p) => {
        map[p.id] = { full_name: p.full_name, email: p.email }
        return map
      }, {} as Record<string, { full_name: string | null; email: string | null }>)
    } else {
      profileMap.value = {}
    }
  } catch (err: any) {
    console.error('Failed to fetch reports', err)
    error.value = err?.message || 'Failed to load reports'
  } finally {
    loading.value = false
  }
}

watch([statusFilter, typeFilter], fetchReports)

function openReport(report: any) {
  selectedReport.value = report
  selectedStatus.value = report.status || 'open'
  resolutionNotes.value = report.resolution_notes || ''
  drawerError.value = null
}

function closeDrawer() {
  selectedReport.value = null
  drawerError.value = null
}

async function saveReport() {
  if (!selectedReport.value) return
  if (!adminProfile.value?.id) {
    drawerError.value = 'Admin profile not loaded.'
    return
  }

  saving.value = true
  drawerError.value = null

  const updates: Record<string, any> = {
    status: selectedStatus.value,
    resolution_notes: resolutionNotes.value,
  }

  const prevStatus = selectedReport.value.status
  const closing =
    (prevStatus === 'open' || prevStatus === 'in_review') &&
    (selectedStatus.value === 'resolved' || selectedStatus.value === 'dismissed')

  if (closing) {
    updates.resolved_by = adminProfile.value.id
    updates.resolved_at = new Date().toISOString()
  }

  try {
    const { error: updateError } = await client
      .from('content_reports')
      .update(updates)
      .eq('id', selectedReport.value.id)

    if (updateError) throw updateError

    reports.value = reports.value.map((r) =>
      r.id === selectedReport.value.id ? { ...r, ...updates } : r,
    )
    selectedReport.value = { ...selectedReport.value, ...updates }
  } catch (err: any) {
    console.error('Failed to update report', err)
    drawerError.value = err?.message || 'Failed to update report'
  } finally {
    saving.value = false
  }
}

onMounted(fetchReports)
</script>
