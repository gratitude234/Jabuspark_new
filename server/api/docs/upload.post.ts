// server/api/docs/upload.post.ts
import { createError, readMultipartFormData } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { randomUUID } from 'crypto'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  // --- 1) Parse multipart form data ---
  const form = await readMultipartFormData(event)

  if (!form) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No form data received',
    })
  }

  const getField = (name: string) =>
    form.find((p) => p.name === name)?.data?.toString('utf8') ?? ''

  const filePart = form.find((p) => p.name === 'file')

  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing file field in upload',
    })
  }

  const visibility =
    (getField('visibility') as 'personal' | 'course') || 'personal'
  const course = getField('course') || null
  const docType = getField('docType') || null
  const courseCode = getField('courseCode') || course
  const level = getField('level') || null
  const faculty = getField('faculty') || null
  const department = getField('department') || null
  const isPublic = getField('isPublic') === 'true'

  // Course docs must be reviewed; personal docs are "approved" by default
  const approvalStatus = visibility === 'course' ? 'pending' : 'approved'

  const docId = randomUUID()

  // --- 2) Build storage path ---
  const ext =
    path.extname(filePart.filename || '').replace('.', '').toLowerCase() ||
    'pdf'
  const storagePath = `user/${user.id}/${docId}.${ext}`

  // --- 3) Upload to Supabase Storage ---
  const { error: storageError } = await supabase.storage
    .from('docs')
    .upload(storagePath, filePart.data, {
      upsert: true,
      contentType: filePart.type || 'application/pdf',
    })

  if (storageError) {
    throw createError({
      statusCode: 400,
      statusMessage: `Storage upload failed: ${storageError.message}`,
    })
  }

  // --- 4) Insert document row ---
  const baseTitle = filePart.filename.replace(/\.pdf$/i, '')

  const { error: insertError } = await supabase
    .from('documents')
    .insert({
      id: docId,
      user_id: user.id,
      title: baseTitle,
      course,
      course_code: courseCode,
      kind: null,
      doc_type: docType,
      storage_path: storagePath,
      pages_count: null,
      chunks_count: null,
      visibility,
      approval_status: approvalStatus,
      level,
      faculty,
      department,
      is_public: isPublic,
      status: 'uploading',
      error_message: null,
      size_bytes: filePart.data.length,
      // waiting for admin to add MCQs
      question_status: 'pending_admin',
      question_count: 0,
    })
    .select()
    .single()

  if (insertError) {
    throw createError({
      statusCode: 400,
      statusMessage: `DB insert failed: ${insertError.message}`,
    })
  }

  // You can either trigger ingest here, or keep doing it from the client.
  // For now we'll just respond; your store already calls /api/rag/ingest.

  return {
    success: true,
    docId,
  }
})
