<template>
  <button
    :type="type"
    v-bind="$attrs"
    class="inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ type?: 'button' | 'submit' | 'reset' }>(),
  { type: 'button' }
)
</script>
