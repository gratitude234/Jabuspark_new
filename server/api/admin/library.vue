<script setup lang="ts">
const scope = ref<'all' | 'personal' | 'course'>('all')

const { data, pending, error, refresh } = useFetch(() => '/api/admin/library', {
  query: { scope: scope.value },
})

const documents = computed(() => data.value?.documents ?? [])

watch(scope, () => {
  refresh()
})
</script>

<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Library</h1>

      <select v-model="scope" class="bg-slate-800 rounded px-3 py-1 text-sm">
        <option value="all">All docs</option>
        <option value="personal">Personal uploads</option>
        <option value="course">Course packs</option>
      </select>
    </div>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Failed to load: {{ error.message }}</div>

    <table v-else class="w-full text-sm">
      <thead class="text-slate-400 text-left">
        <tr>
          <th class="py-2">Title</th>
          <th class="py-2">Visibility</th>
          <th class="py-2">Status</th>
          <th class="py-2">Approval</th>
          <th class="py-2">Created</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="doc in documents"
          :key="doc.id"
          class="border-t border-slate-800 hover:bg-slate-900"
        >
          <td class="py-2">{{ doc.title }}</td>
          <td class="py-2 capitalize">{{ doc.visibility }}</td>
          <td class="py-2">{{ doc.status }}</td>
          <td class="py-2 capitalize">{{ doc.approval_status }}</td>
          <td class="py-2">
            {{ new Date(doc.created_at).toLocaleDateString() }}
          </td>
        </tr>
      </tbody>
    </table>
  </AdminLayout>
</template>
