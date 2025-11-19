<template>
  <main class="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-16 pt-10">
    <Card class="space-y-5 bg-slate-950/70">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Onboarding
        </p>
        <h1 class="text-3xl font-bold tracking-tight">
          Set up your study profile
        </h1>
        <p class="text-sm text-slate-400">
          Pick your department and level so JabuSpark can tune drills to your exams.
        </p>
      </div>

      <div v-if="!user" class="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
        Sign in to continue. Once you are authenticated, you can update your study profile here.
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1 text-sm">
          <label class="text-xs text-slate-400">Full name</label>
          <input
            v-model.trim="form.full_name"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
            placeholder="e.g. Adaeze Okonkwo"
          />
          <p v-if="errors.full_name" class="text-[11px] text-rose-300">
            {{ errors.full_name }}
          </p>
        </div>

        <div class="space-y-1 text-sm">
          <label class="text-xs text-slate-400">Matric number</label>
          <input
            v-model.trim="form.matric_no"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
            placeholder="e.g. JABU/20/1234"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1 text-sm">
            <label class="text-xs text-slate-400">Faculty</label>
            <select
              v-model="form.faculty"
              class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
            >
              <option value="" class="bg-slate-900">Select faculty</option>
              <option v-for="option in facultyOptions" :key="option" :value="option" class="bg-slate-900">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="space-y-1 text-sm">
            <label class="text-xs text-slate-400">Department</label>
            <select
              v-model="form.department"
              class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
            >
              <option value="" class="bg-slate-900">Select department</option>
              <option
                v-for="option in departmentOptions"
                :key="option"
                :value="option"
                class="bg-slate-900"
              >
                {{ option }}
              </option>
            </select>
            <p v-if="errors.department" class="text-[11px] text-rose-300">
              {{ errors.department }}
            </p>
          </div>
        </div>

        <div class="space-y-1 text-sm">
          <label class="text-xs text-slate-400">Level</label>
          <select
            v-model="form.level"
            class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
          >
            <option value="" class="bg-slate-900">Select level</option>
            <option v-for="levelOption in levelOptions" :key="levelOption" :value="levelOption" class="bg-slate-900">
              {{ levelOption }} Level
            </option>
          </select>
          <p v-if="errors.level" class="text-[11px] text-rose-300">
            {{ errors.level }}
          </p>
        </div>

        <p v-if="profileError" class="text-xs text-rose-300">
          {{ profileError }}
        </p>

        <Button
          type="submit"
          class="w-full"
          :disabled="saving || isLoading"
        >
          {{ saving ? 'Saving…' : 'Save profile' }}
        </Button>
      </form>
    </Card>
  </main>
</template>


<script setup lang="ts">
import Button from '~/components/Button.vue'
import Card from '~/components/Card.vue'
import { useToasts } from '~/stores/useToasts'

const router = useRouter()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const toasts = useToasts()

// you can still have a useProfile composable, but we won't rely on upsertProfile here
const { profile, isLoading, error: profileError, refreshProfile } = useProfile()

const facultyOptions = [
  'College of Agriculture and Natural Sciences',
  'College of Environmental Sciences',
  'College of Health Sciences',
  'College of Humanities and Social Sciences',
  'College of Law',
  'College of Management Sciences',
  'College of Postgraduate Studies',
]

const departmentOptions = [
  // College of Health Sciences
  'Nursing',
  'Medical Laboratory Science',

  // College of Agriculture and Natural Sciences
  'Agricultural Economics',
  'Animal Science',
  'Biochemistry',
  'Biological Sciences',
  'Chemical Sciences',
  'Computer Science',
  'Crop Science',
  'Food Science and Technology',
  'Hotel Management and Tourism',
  'Physical Sciences',

  // College of Environmental Sciences
  'Architecture',
  'Building',
  'Estate Management',
  'Quantity Surveying',

  // College of Humanities and Social Sciences
  'Economics',
  'English',
  'History and International Studies',
  'International Relations',
  'Mass Communication',
  'Political Science',
  'Public Administration',
  'Religious Studies',

  // College of Law
  'Law',

  // College of Management Sciences
  'Accounting',
  'Actuarial Science and Insurance',
  'Business Administration',
  'Entrepreneurship',
  'Industrial Relations and Human Resource Management',

  // Fallback
  'Other',
]

const levelOptions = ['100', '200', '300', '400', '500']

const form = reactive({
  full_name: '',
  matric_no: '',
  faculty: '',
  department: '',
  level: '',
})

const errors = reactive<Record<string, string>>({})
const saving = ref(false)

// preload from profile when it’s available
watch(
  profile,
  (value) => {
    if (!value) return
    form.full_name = value.full_name || ''
    form.matric_no = value.matric_no || ''
    form.faculty = value.faculty || ''
    form.department = value.department || ''
    form.level = value.level || ''
  },
  { immediate: true },
)

onMounted(() => {
  if (!profile.value && user.value) {
    refreshProfile()
  }
})

function validate() {
  errors.full_name = form.full_name ? '' : 'Full name is required.'
  errors.department = form.department ? '' : 'Select a department.'
  errors.level = form.level ? '' : 'Select a level.'

  return !errors.full_name && !errors.department && !errors.level
}

async function handleSubmit() {
  if (!validate() || !user.value) return

  saving.value = true

  try {
    const payload = {
      id: user.value.id, // IMPORTANT for RLS
      email: user.value.email,
      full_name: form.full_name,
      matric_no: form.matric_no,
      faculty: form.faculty,
      department: form.department,
      level: form.level,
    }

    const { error } = await supabase.from('profiles').upsert(payload)

    if (error) {
      console.error('profiles upsert error:', error)
      throw error
    }

    // refresh local profile cache
    await refreshProfile()

    toasts.success('Profile updated.')
    await router.push('/')
  } catch (err) {
    console.error('Onboarding save failed:', err)
    toasts.error('Could not save your profile. Try again.')
  } finally {
    saving.value = false
  }
}
</script>
