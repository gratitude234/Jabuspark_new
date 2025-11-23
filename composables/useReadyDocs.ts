import { computed } from 'vue'
import type { DocumentRow } from '~/types/models'

type LibraryStore = ReturnType<
  typeof import('~/stores/useLibrary')['useLibrary']
>

/**
 * Filters the library documents to include only docs that:
 * - are fully ingested (status = 'ready')
 * - have admin-created MCQs (question_status = 'has_questions')
 * - and, if course docs, are approved.
 */
export function useReadyDocs(library: LibraryStore) {
  return computed<DocumentRow[]>(() =>
    library.documents.filter((doc) => {
      if (!doc) return false

      // 1) Ingestion must be complete
      if (doc.status !== 'ready') return false

      // 2) Admin must have added questions
      const questionStatus = (doc as any).question_status ?? 'none'
      if (questionStatus !== 'has_questions') return false

      // 3) Visibility / approval rules
      const visibility = doc.visibility ?? 'personal'

      // Personal docs: once ready + has_questions, they’re good
      if (!visibility || visibility === 'personal') return true

      // Course docs: also need approval
      if (visibility === 'course') {
        const approval = doc.approval_status ?? 'pending'
        return approval === 'approved'
      }

      return false
    }),
  )
}
