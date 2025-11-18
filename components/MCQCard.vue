<template>
  <div class="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
    <p class="font-semibold">{{ question.stem }}</p>
    <div class="space-y-2">
      <button
        v-for="(option, idx) in options"
        :key="idx"
        class="w-full rounded-xl border px-3 py-3 text-left text-sm transition"
        :class="optionClass(idx)"
        @click="$emit('select', idx)"
      >
        <span class="font-medium">{{ labels[idx] }}.</span>
        <span class="ml-2">{{ option }}</span>
      </button>
    </div>
    <p v-if="showFeedback" class="text-sm text-amber-200">{{ feedbackText }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  question: {
    id: string
    stem: string
    options?: string[]
    correct: number
    explanation?: string
  }
  selected?: number | null
  showFeedback?: boolean
}>()

const labels = ['A', 'B', 'C', 'D']
const options = computed(() => props.question.options || [])

const feedbackText = computed(() => {
  if (!props.showFeedback || props.selected == null) return ''
  const correct = props.selected === props.question.correct
  const prefix = correct ? 'Correct.' : 'Try again.'
  return `${prefix} ${props.question.explanation || ''}`.trim()
})

function optionClass(idx: number) {
  if (!props.showFeedback) {
    return props.selected === idx
      ? 'border-amber-300 bg-amber-200/20'
      : 'border-white/10 hover:border-amber-200/60'
  }
  if (idx === props.question.correct) {
    return 'border-green-400 bg-green-500/10'
  }
  if (props.selected === idx) {
    return 'border-rose-400 bg-rose-500/10'
  }
  return 'border-white/10 opacity-60'
}
</script>
