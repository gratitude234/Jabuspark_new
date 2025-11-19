import { computed } from 'vue'
import type { DocumentRow } from '~/types/models'

type LibraryStore = ReturnType<typeof import('~/stores/useLibrary')['useLibrary']>

/**
 * Filters the library documents to include only ready personal docs and approved course docs.
 */
export function useReadyDocs(library: LibraryStore) {
  return computed<DocumentRow[]>(() =>
    library.documents.filter((doc) => {
      if (!doc || doc.status !== 'ready') return false

      const visibility = doc.visibility ?? 'personal'
      if (!visibility || visibility === 'personal') return true

      if (visibility === 'course') {
        const approval = doc.approval_status ?? 'pending'
        return approval === 'approved'
      }

      return false
    }),
  )
}
