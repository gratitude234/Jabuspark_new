// file: server/api/docs/upload.post.ts
import { createError, readMultipartFormData } from 'h3'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const form = await readMultipartFormData(event)
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: 'No form data' })
  }

  const filePart = form.find((p) => p.name === 'file')
  const metaPart = form.find((p) => p.name === 'meta')

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }

  if (filePart.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `File too large. Max ${(MAX_BYTES / (1024 * 1024)).toFixed(
        1,
      )} MB`,
    })
  }

  const meta = metaPart?.data
    ? JSON.parse(metaPart.data.toString('utf8'))
    : {}

  const supabase = await serverSupabaseClient(event)

  // generate IDs / path however you like
  const ext = (filePart.filename?.split('.').pop() || 'pdf').toLowerCase()
  const docId = crypto.randomUUID()
  const path = `user/${user.id}/${docId}.${ext}`

  // 1) upload to storage
  const { error: storageError } = await supabase.storage
    .from('docs')
    .upload(path, filePart.data, {
      contentType: filePart.type || 'application/pdf',
      upsert: true,
    })

  if (storageError) {
    throw createError({
      statusCode: 500,
      statusMessage: storageError.message || 'Storage upload failed',
    })
  }

  // decide visibility + approval status
  const visibility: 'personal' | 'course' =
    meta.visibility === 'course' ? 'course' : 'personal'

  // personal docs can be auto-approved; course docs stay pending for admin
  const approvalStatus =
    visibility === 'personal' ? 'approved' : 'pending'

  // 2) insert document row
  const { error: insertError } = await supabase
    .from('documents')
    .insert({
      id: docId,
      user_id: user.id,
      title: filePart.filename?.replace(/\.pdf$/i, '') || 'Untitled',
      storage_path: path,
      
      visibility,
      approval_status: approvalStatus,

      course: meta.course ?? null,
      course_code: meta.courseCode ?? meta.course ?? null,
      doc_type: meta.docType ?? null,
      level: meta.level ?? null,
      faculty: meta.faculty ?? null,
      department: meta.department ?? null,
      is_public: meta.isPublic ?? false,

      status: 'uploading',
      error_message: null,
      size_bytes: filePart.data.length,

      // question pipeline flags
      // start with "none" = no MCQs yet
      question_status: 'none',
      question_count: 0,
    })
    .select()
    .single()

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage:
        insertError.message || 'Failed to create document row',
    })
  }

  return {
    ok: true,
    docId,
  }
})
