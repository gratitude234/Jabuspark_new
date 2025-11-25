export interface AdminDocumentListItem {
  id: string
  title: string
  visibility: string
  approval_status: string
  question_status: string
  question_count: number
  course_code: string | null
  created_at: string
  size_bytes: number | null
  uploader_name: string | null
  uploader_email: string | null
}

export interface AdminDocumentDetail extends AdminDocumentListItem {
  user_id: string | null
  course_id: string | null
  storage_path: string
  level: string | null
  faculty: string | null
  department: string | null
}

export interface AdminQuestion {
  id: string
  stem: string
  options: string[]
  correct: number
  explanation: string | null
  difficulty: string | null
  topic_tags: string[]
  created_at: string
}
