<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-white">Feature Flags</h1>
          <p class="text-sm text-slate-400">Toggle experiments and beta features.</p>
        </div>
        <button
          class="text-sm text-amber-200 hover:text-amber-100"
          :disabled="loadingFlags"
          @click="loadFlags"
        >
          Refresh
        </button>
      </div>
      <div v-if="flagsError" class="mb-3 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
        {{ flagsError }}
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-left text-slate-400">
            <tr>
              <th class="px-2 py-2">Label</th>
              <th class="px-2 py-2">Key</th>
              <th class="px-2 py-2">State</th>
              <th class="px-2 py-2">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="flag in featureFlags" :key="flag.id" class="text-slate-200">
              <td class="px-2 py-2 font-medium">{{ flag.label || '—' }}</td>
              <td class="px-2 py-2 text-slate-400">{{ flag.key }}</td>
              <td class="px-2 py-2">
                <select
                  v-model="flag.state"
                  class="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-300 focus:outline-none"
                  :disabled="updatingFlagId === flag.id"
                  @change="updateFlag(flag)"
                >
                  <option value="off" class="bg-slate-900">off</option>
                  <option value="beta" class="bg-slate-900">beta</option>
                  <option value="on" class="bg-slate-900">on</option>
                </select>
              </td>
              <td class="px-2 py-2 text-slate-300">{{ flag.description || '—' }}</td>
            </tr>
            <tr v-if="!loadingFlags && featureFlags.length === 0">
              <td colspan="4" class="px-2 py-4 text-center text-slate-400">No feature flags found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-sm shadow-black/20">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">App Settings</h2>
          <p class="text-sm text-slate-400">Read-only view for app_settings.</p>
        </div>
        <button
          class="text-sm text-amber-200 hover:text-amber-100"
          :disabled="loadingSettings"
          @click="loadSettings"
        >
          Refresh
        </button>
      </div>
      <div v-if="settingsError" class="mb-3 rounded-lg border border-rose-500/30 bg-rose-900/30 px-3 py-2 text-sm text-rose-100">
        {{ settingsError }}
      </div>
      <div class="space-y-3">
        <div
          v-for="setting in appSettings"
          :key="setting.key"
          class="rounded-lg border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-slate-100"
        >
          <div class="flex items-center justify-between">
            <p class="font-semibold">{{ setting.key }}</p>
            <p class="text-xs text-slate-400">{{ formatDate(setting.updated_at) }}</p>
          </div>
          <pre class="mt-2 overflow-x-auto rounded bg-slate-800 px-3 py-2 text-xs text-slate-200">
{{ prettyJson(setting.value) }}
          </pre>
        </div>
        <p v-if="!loadingSettings && appSettings.length === 0" class="text-sm text-slate-400">
          No settings found.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'Settings',
})

const client = useSupabaseClient()

const featureFlags = ref<any[]>([])
const loadingFlags = ref(false)
const flagsError = ref<string | null>(null)
const updatingFlagId = ref<number | null>(null)

const appSettings = ref<any[]>([])
const loadingSettings = ref(false)
const settingsError = ref<string | null>(null)

function prettyJson(value: any) {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return String(value ?? '')
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

async function loadFlags() {
  loadingFlags.value = true
  flagsError.value = null
  try {
    const { data, error } = await client
      .from('feature_flags')
      .select('id, key, label, description, state, config')
      .order('key')
    if (error) throw error
    featureFlags.value = data || []
  } catch (err: any) {
    console.error('Failed to load feature flags', err)
    flagsError.value = err?.message || 'Failed to load feature flags'
  } finally {
    loadingFlags.value = false
  }
}

async function updateFlag(flag: any) {
  updatingFlagId.value = flag.id
  try {
    const { error } = await client
      .from('feature_flags')
      .update({ state: flag.state, label: flag.label, description: flag.description })
      .eq('id', flag.id)
    if (error) throw error
  } catch (err: any) {
    console.error('Failed to update feature flag', err)
    flagsError.value = err?.message || 'Failed to update feature flag'
  } finally {
    updatingFlagId.value = null
  }
}

async function loadSettings() {
  loadingSettings.value = true
  settingsError.value = null
  try {
    const { data, error } = await client
      .from('app_settings')
      .select('key, value, updated_at')
      .order('key')
    if (error) throw error
    appSettings.value = data || []
  } catch (err: any) {
    console.error('Failed to load app settings', err)
    settingsError.value = err?.message || 'Failed to load settings'
  } finally {
    loadingSettings.value = false
  }
}

onMounted(() => {
  loadFlags()
  loadSettings()
})
</script>
