// server/api/docs/upload.post.ts
import { createError, readMultipartFormData } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  // 1) Require logged-in user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  // 2) Parse multipart/form-data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data received' })
  }

  const filePart = formData.find(
    (part) => part.type === 'file' && part.name === 'file',
  )

  if (!filePart || !filePart.filename || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file upload' })
  }

  const metaPart = formData.find(
    (part) => part.type === 'field' && part.name === 'meta',
  )

  let options: any = {}
  if (metaPart) {
    try {
      options = JSON.parse(metaPart.data.toString('utf8'))
    } catch {
      // ignore parse errors, will fall back to defaults
    }
  }

  const {
    visibility = 'personal',
    course = null,
    docType = null,
    courseCode = course,
    level = null,
    faculty = null,
    department = null,
    isPublic = false,
  } = options

  const approvalStatus = visibility === 'course' ? 'pending' : 'approved'

  const supabase = await serverSupabaseClient(event)

  // 3) Build storage path + docId
  const docId = uuidv4()
  const ext = (filePart.filename.split('.').pop() || 'pdf').toLowerCase()
  const path = `user/${user.id}/${docId}.${ext}`

  // 4) Upload to Supabase Storage (server → Supabase, not browser)
  const { error: storageError } = await supabase.storage
    .from('docs')
    .upload(path, filePart.data, {
      upsert: true,
      contentType: filePart.type || 'application/pdf',
    })

  if (storageError) {
    console.error('[api/docs/upload] storage error', storageError)
    throw createError({
      statusCode: 500,
      statusMessage: storageError.message || 'Storage upload failed',
    })
  }

  // 5) Insert document row
  const { data: inserted, error: insertError } = await supabase
    .from('documents')
    .insert({
      id: docId,
      user_id: user.id,
      title: filePart.filename.replace(/\.pdf$/i, ''),
      course,
      course_code: courseCode,
      kind: null,
      doc_type: docType,
      storage_path: path,
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
    console.error('[api/docs/upload] insert error', insertError)
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message || 'Insert failed',
    })
  }

  // 6) Kick off ingest in the background (no await so the response returns fast)
  //    Nuxt's $fetch works server-side with relative URLs.
  //    If you prefer, you can ignore errors here; ingest handler already updates status.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  $fetch('/api/rag/ingest', {
    method: 'POST',
    body: { docId },
  }).catch((err) => {
    console.error('[api/docs/upload] failed to trigger ingest', docId, err)
  })

  // 7) Respond to client
  return {
    success: true,
    doc: inserted,
    docId,
  }
})
