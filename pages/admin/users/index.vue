<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-white">Users</h1>
          <p class="text-sm text-slate-400">Manage students and admins across JabuSpark.</p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Search name or email"
            class="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none sm:w-64"
          />
          <select
            v-model="roleFilter"
            class="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          >
            <option value="all">All roles</option>
            <option v-for="role in roles" :key="role" :value="role" class="bg-slate-900">
              {{ role }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-400">
            <tr>
              <th class="px-2 py-2">Name</th>
              <th class="px-2 py-2">Email</th>
              <th class="px-2 py-2">Level</th>
              <th class="px-2 py-2">Department</th>
              <th class="px-2 py-2">Role</th>
              <th class="px-2 py-2">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="user in users"
              :key="user.id"
              class="cursor-pointer text-slate-200 hover:bg-white/5"
              @click="openUser(user)"
            >
              <td class="px-2 py-2 font-medium">{{ user.full_name || '—' }}</td>
              <td class="px-2 py-2 text-slate-300">{{ user.email }}</td>
              <td class="px-2 py-2">{{ user.level || '—' }}</td>
              <td class="px-2 py-2">{{ user.department || '—' }}</td>
              <td class="px-2 py-2 capitalize">{{ user.role || 'student' }}</td>
              <td class="px-2 py-2 text-slate-400">{{ formatDate(user.created_at) }}</td>
            </tr>
            <tr v-if="!loading && users.length === 0">
              <td colspan="6" class="px-2 py-4 text-center text-slate-400">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="error" class="mt-3 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
        {{ error }}
      </div>

      <div class="mt-4 flex items-center justify-between text-sm text-slate-400">
        <div>Page {{ page }} / {{ totalPages || 1 }}</div>
        <div class="flex gap-2">
          <button
            class="rounded-lg border border-white/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page === 1 || loading"
            @click="prevPage"
          >
            Previous
          </button>
          <button
            class="rounded-lg border border-white/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="page >= totalPages || loading"
            @click="nextPage"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <Transition name="fade">
      <div
        v-if="selectedUser"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur"
        @click.self="closeDrawer"
      >
        <div
          class="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/5 bg-slate-900/95 p-6 shadow-2xl shadow-black/40"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">User Detail</h3>
            <button class="text-sm text-slate-400 hover:text-white" @click="closeDrawer">Close</button>
          </div>
          <div class="mt-4 space-y-3 text-sm text-slate-200">
            <div>
              <p class="text-slate-400">Name</p>
              <p class="font-medium">{{ selectedUser.full_name || '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400">Email</p>
              <p class="font-medium">{{ selectedUser.email }}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-slate-400">Level</p>
                <p class="font-medium">{{ selectedUser.level || '—' }}</p>
              </div>
              <div>
                <p class="text-slate-400">Department</p>
                <p class="font-medium">{{ selectedUser.department || '—' }}</p>
              </div>
            </div>
            <div>
              <p class="text-slate-400">Role</p>
              <select
                v-model="selectedRole"
                class="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
              >
                <option v-for="role in roles" :key="role" :value="role" class="bg-slate-900">
                  {{ role }}
                </option>
              </select>
            </div>
            <div>
              <p class="text-slate-400">Joined</p>
              <p class="font-medium">{{ formatDate(selectedUser.created_at) }}</p>
            </div>
          </div>
          <div v-if="drawerError" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-xs text-rose-100">
            {{ drawerError }}
          </div>
          <div class="mt-5 flex gap-2">
            <button
              class="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="savingRole"
              @click="saveRole"
            >
              {{ savingRole ? 'Saving...' : 'Save role' }}
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
  title: 'Users',
})

import type { Profile } from '~/types/models'

const client = useSupabaseClient()
const { profile: adminProfile } = useCurrentProfile()

const users = ref<Profile[]>([])
const error = ref<string | null>(null)
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = 20
const searchTerm = ref('')
const roleFilter = ref<'all' | Profile['role']>('all')

const selectedUser = ref<Profile | null>(null)
const selectedRole = ref<Profile['role']>('student')
const drawerError = ref<string | null>(null)
const savingRole = ref(false)

const roles: Profile['role'][] = [
  'student',
  'content_admin',
  'moderator',
  'tutor',
  'admin',
  'super_admin',
]

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function prevPage() {
  if (page.value > 1) {
    page.value -= 1
    fetchUsers()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value += 1
    fetchUsers()
  }
}

function buildSearchQuery(query: any) {
  const term = searchTerm.value.trim()
  if (term) {
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
  }
  if (roleFilter.value !== 'all') {
    query = query.eq('role', roleFilter.value)
  }
  return query
}

async function fetchUsers() {
  loading.value = true
  error.value = null
  const from = (page.value - 1) * pageSize
  const to = from + pageSize - 1

  try {
    let query = client
      .from('profiles')
      .select('id, full_name, email, level, department, role, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })

    query = buildSearchQuery(query)

    const { data, error: fetchError, count } = await query.range(from, to)
    if (fetchError) throw fetchError

    users.value = (data as Profile[]) || []
    total.value = count || 0
  } catch (err: any) {
    console.error('Failed to fetch users', err)
    error.value = err?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function triggerFetchDebounced() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUsers()
  }, 300)
}

watch([searchTerm, roleFilter], () => {
  page.value = 1
  triggerFetchDebounced()
})

function openUser(user: Profile) {
  selectedUser.value = user
  selectedRole.value = user.role || 'student'
  drawerError.value = null
}

function closeDrawer() {
  selectedUser.value = null
  drawerError.value = null
}

async function saveRole() {
  if (!selectedUser.value) return
  const user = selectedUser.value
  const newRole = selectedRole.value
  const oldRole = user.role
  if (oldRole === newRole) {
    drawerError.value = 'Role unchanged.'
    return
  }

  savingRole.value = true
  drawerError.value = null

  try {
    const { error: updateError } = await client
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Log admin action
    if (adminProfile.value?.id) {
      await client.from('admin_action_logs').insert({
        actor_id: adminProfile.value.id,
        target_user_id: user.id,
        action: 'SET_ROLE',
        meta: { old_role: oldRole, new_role: newRole },
      })
    }

    selectedUser.value = { ...user, role: newRole }
    users.value = users.value.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
  } catch (err: any) {
    console.error('Failed to update role', err)
    drawerError.value = err?.message || 'Failed to update role'
  } finally {
    savingRole.value = false
  }
}

onMounted(fetchUsers)
</script>
