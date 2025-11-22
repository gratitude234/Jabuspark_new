<template>
  <div class="space-y-8">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total Users" :value="formatNumber(stats.totalUsers)" />
      <KpiCard label="Total Admins" :value="formatNumber(stats.totalAdmins)" />
      <KpiCard label="Ask Tutor Logs" :value="formatNumber(stats.totalAskTutorLogs)" />
      <KpiCard label="Open Reports" :value="formatNumber(stats.openReports)" />
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Recent Ask Tutor Activity</h2>
          <span class="text-xs text-slate-400">Last 5</span>
        </div>
        <div v-if="loading" class="py-6 text-sm text-slate-400">Loading...</div>
        <div v-else-if="error" class="rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
          {{ error }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left text-slate-400">
              <tr>
                <th class="px-2 py-2">User</th>
                <th class="px-2 py-2">Course</th>
                <th class="px-2 py-2">Level</th>
                <th class="px-2 py-2">Context</th>
                <th class="px-2 py-2">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="log in recentAskTutor" :key="log.id" class="text-slate-200">
                <td class="px-2 py-2">
                  {{ userDisplay(log.user_id) }}
                </td>
                <td class="px-2 py-2">{{ log.course_code || '—' }}</td>
                <td class="px-2 py-2">{{ log.level || '—' }}</td>
                <td class="px-2 py-2">
                  <span
                    class="rounded-full px-2 py-1 text-xs"
                    :class="log.used_context ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-700 text-slate-300'"
                  >
                    {{ log.used_context ? 'Used context' : 'No context' }}
                  </span>
                </td>
                <td class="px-2 py-2 text-slate-400">
                  {{ formatDate(log.created_at) }}
                </td>
              </tr>
              <tr v-if="recentAskTutor.length === 0">
                <td colspan="5" class="px-2 py-4 text-center text-slate-400">No activity yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Latest Reports</h2>
          <span class="text-xs text-slate-400">Last 5</span>
        </div>
        <div v-if="loading" class="py-6 text-sm text-slate-400">Loading...</div>
        <div v-else-if="error" class="rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
          {{ error }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="text-left text-slate-400">
              <tr>
                <th class="px-2 py-2">Type</th>
                <th class="px-2 py-2">Reason</th>
                <th class="px-2 py-2">Status</th>
                <th class="px-2 py-2">Reporter</th>
                <th class="px-2 py-2">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="report in recentReports" :key="report.id" class="text-slate-200">
                <td class="px-2 py-2 capitalize">{{ report.content_type || '—' }}</td>
                <td class="px-2 py-2 text-slate-300">
                  {{ truncate(report.reason, 70) }}
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
              <tr v-if="recentReports.length === 0">
                <td colspan="5" class="px-2 py-4 text-center text-slate-400">No reports yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'Dashboard',
})

import KpiCard from '~/components/admin/KpiCard.vue'

const client = useSupabaseClient()

const loading = ref(true)
const error = ref<string | null>(null)
const stats = reactive({
  totalUsers: 0,
  totalAdmins: 0,
  totalAskTutorLogs: 0,
  openReports: 0,
})

const recentAskTutor = ref<any[]>([])
const recentReports = ref<any[]>([])
const profileMap = ref<Record<string, { full_name: string | null; email: string | null }>>({})

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value || 0)
}

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

async function fetchCounts() {
  const [{ count: totalUsers, error: usersError }, { count: totalAdmins, error: adminsError }] =
    await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }),
      client
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .in('role', ['admin', 'super_admin']),
    ])

  const [{ count: tutorCount, error: tutorError }, { count: openReports, error: openError }] =
    await Promise.all([
      client.from('ask_tutor_logs').select('id', { count: 'exact', head: true }),
      client
        .from('content_reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
    ])

  if (usersError || adminsError || tutorError || openError) {
    throw usersError || adminsError || tutorError || openError
  }

  stats.totalUsers = totalUsers || 0
  stats.totalAdmins = totalAdmins || 0
  stats.totalAskTutorLogs = tutorCount || 0
  stats.openReports = openReports || 0
}

async function fetchRecent() {
  const { data: tutorLogs, error: tutorError } = await client
    .from('ask_tutor_logs')
    .select('id, user_id, course_code, level, used_context, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: reports, error: reportsError } = await client
    .from('content_reports')
    .select('id, reporter_id, content_type, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (tutorError || reportsError) throw tutorError || reportsError

  recentAskTutor.value = tutorLogs || []
  recentReports.value = reports || []

  const ids = [
    ...new Set([
      ...recentAskTutor.value.map((item) => item.user_id).filter(Boolean),
      ...recentReports.value.map((item) => item.reporter_id).filter(Boolean),
    ]),
  ]

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
}

async function load() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([fetchCounts(), fetchRecent()])
  } catch (err: any) {
    console.error('Failed to load admin dashboard', err)
    error.value = err?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
