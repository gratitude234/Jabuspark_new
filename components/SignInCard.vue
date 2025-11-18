<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
    <h2 class="text-lg font-semibold">Sign in</h2>
    <p class="mt-1 text-sm text-slate-400">Enter your email to get a magic-link.</p>

    <form class="mt-4 space-y-3" @submit.prevent="submit">
      <input
        v-model="email"
        type="email"
        required
        placeholder="you@example.com"
        class="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none"
      />
      <button
        type="submit"
        class="w-full rounded-xl bg-amber-300/90 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:bg-amber-300/40"
        :disabled="submitting || !email"
      >
        {{ submitting ? 'Sending link…' : 'Send magic link' }}
      </button>
    </form>

    <p v-if="message" class="mt-3 text-sm text-emerald-300">{{ message }}</p>
    <p v-if="error" class="mt-3 text-sm text-rose-300">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth()
const email = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  if (!email.value || submitting.value) return
  message.value = ''
  error.value = ''
  submitting.value = true
  try {
    await auth.signIn(email.value)
    message.value = 'Check your email for the login link.'
    email.value = ''
  } catch (err: any) {
    error.value = err?.message || 'Could not send the magic link.'
  } finally {
    submitting.value = false
  }
}
</script>
