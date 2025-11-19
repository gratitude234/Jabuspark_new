<template>
  <Card
    class="w-full max-w-md space-y-4 border border-borderSubtle bg-surface/95 shadow-sm shadow-background/40"
  >
    <!-- Tabs -->
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition
               duration-150 ease-out"
        :class="mode === 'signin'
          ? 'bg-primary-soft/15 text-slate-50'
          : 'bg-background/60 text-slate-400 hover:text-slate-100'"
        @click="mode = 'signin'"
      >
        Sign in
      </button>
      <button
        type="button"
        class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition
               duration-150 ease-out"
        :class="mode === 'signup'
          ? 'bg-primary-soft/15 text-slate-50'
          : 'bg-background/60 text-slate-400 hover:text-slate-100'"
        @click="mode = 'signup'"
      >
        Create account
      </button>
    </div>

    <!-- Heading & copy -->
    <div class="space-y-1">
      <h2 class="text-lg font-semibold">
        {{ mode === 'signin' ? 'Sign in' : 'Create your JabuSpark account' }}
      </h2>
      <p class="text-sm text-slate-400">
        {{ copy }}
      </p>
    </div>

    <!-- Form -->
    <form class="space-y-3" @submit.prevent="handleSubmit">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-300">
          School email
        </label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="you@example.com"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-300">
          Password
        </label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          minlength="6"
          class="w-full rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="At least 6 characters"
        />
      </div>

      <div v-if="isSignUp" class="space-y-1">
        <label class="text-xs font-medium text-slate-300">
          Confirm password
        </label>
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          class="w-full rounded-xl border border-borderSubtle bg-background px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
          placeholder="Repeat your password"
        />
      </div>

      <!-- Error / info -->
      <p v-if="error" class="text-xs text-danger">
        {{ error }}
      </p>
      <p v-if="message && !error" class="text-xs text-success">
        {{ message }}
      </p>

      <!-- Submit button -->
      <button
        type="submit"
        class="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
      >
        <span v-if="!loading">
          {{ mode === 'signin' ? 'Sign in' : 'Create account' }}
        </span>
        <span v-else>
          {{ mode === 'signin' ? 'Signing in…' : 'Creating account…' }}
        </span>
      </button>

      <p class="pt-1 text-[11px] text-slate-500">
        By continuing, you agree to use JabuSpark responsibly for your JABU
        coursework.
      </p>
    </form>
  </Card>
</template>

<script setup lang="ts">
import Card from '~/components/Card.vue'

const supabase = useSupabaseClient()
const router = useRouter()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const message = ref<string | null>(null)

const isSignUp = computed(() => mode.value === 'signup')

const copy = computed(() => {
  if (isSignUp.value) {
    return 'Create an account with your email and password. We’ll personalize drills to your department and level after you sign in.'
  }
  return 'Use your email and password to get back to your docs, drills, and study profile.'
})

async function handleSubmit() {
  error.value = null
  message.value = null
  loading.value = true

  try {
    if (isSignUp.value) {
      if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters.'
        return
      }
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.'
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
      })

      if (signUpError) {
        throw signUpError
      }

      // If email confirmation is ON, they may need to check inbox.
      message.value =
        'Account created. Check your email if confirmation is required, then continue into JabuSpark.'
      // Optionally send them to onboarding/home:
      // await router.push('/onboarding')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value,
      })

      if (signInError) {
        throw signInError
      }

      // Successful login – go to home (or /onboarding later)
      await router.push('/')
    }
  } catch (err: any) {
    console.error(err)
    error.value =
      err?.message || 'Something went wrong. Please try again in a moment.'
  } finally {
    loading.value = false
  }
}
</script>
