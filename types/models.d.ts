export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed' | (string & {})

export interface DocumentRow {
  id: string
  user_id: string
  title: string
  course: string | null
  course_code?: string | null
  kind: string | null
  storage_path: string
  pages_count: number | null
  chunks_count: number | null
  visibility?: 'personal' | 'course' | (string & {}) | null
  approval_status?: 'pending' | 'approved' | 'archived' | 'rejected' | (string & {}) | null
  doc_type?: string | null
  level?: string | null
  faculty?: string | null
  department?: string | null
  is_public?: boolean | null
  status: DocumentStatus
  error_message: string | null
  size_bytes: number | null
  last_opened?: string | null
  created_at: string
  updated_at: string
}

export interface DrillQuestion {
  id: string
  stem: string
  options: string[]
  correct: number
  explanation?: string | null
  docId?: string | null
  topic?: string | null
  sectionId?: string | null
  answerExplanation?: string | null
  citations?: { docId: string; page: number; span: string }[]
}

export interface DrillSession {
  id: string
  user_id: string
  metadata: Record<string, any>
  score: number | null
  accuracy: number | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  matric_no: string | null
  faculty: string | null
  department: string | null
  level: string | null
  role: 'student' | 'rep' | 'tutor' | 'admin'
  created_at?: string | null
}
