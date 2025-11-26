import { computed } from 'vue'
import type { DocumentRow } from '~/types/models'

type LibraryStore = ReturnType<
  typeof import('~/stores/useLibrary')['useLibrary']
>

/**
 * Filters the library documents to include only docs that:
 * - are fully ingested (status = 'ready')
 * - have MCQs ready (question_status = 'ready' and question_count > 0)
 * - and, if course docs, are approved.
 */
export function useReadyDocs(library: LibraryStore) {
  return computed<DocumentRow[]>(() =>
    library.documents.filter((doc) => {
      if (!doc) return false

      // 1) Ingestion must be complete
      if (doc.status !== 'ready') return false

      // 2) MCQs must be ready
      const questionStatus = (doc as any).question_status ?? 'none'
      if (questionStatus !== 'ready') return false

      // Optional: also require at least 1 question
      const questionCount = (doc as any).question_count ?? 0
      if (questionCount <= 0) return false

      // 3) Visibility / approval rules
      const visibility = doc.visibility ?? 'personal'

      // Personal docs: once ready + MCQs, they’re good
      if (!visibility || visibility === 'personal') return true

      // Course docs: also need approval
      if (visibility === 'course') {
        const approval = (doc as any).approval_status ?? 'pending'
        return approval === 'approved'
      }

      return false
    }),
  )
}
