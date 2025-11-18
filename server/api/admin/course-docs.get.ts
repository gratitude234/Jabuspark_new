import { serverSupabaseUser } from '#supabase/server'
import { createServiceClient } from '~/server/utils/supabase'
import { requireTutorOrAdminRole } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required.' })
  }

  const supabase = createServiceClient()
  await requireTutorOrAdminRole(supabase, user.id)

  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, user_id, title, course, doc_type, visibility, status, approval_status, created_at')
    .eq('visibility', 'course')
    .neq('status', 'failed')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const uploaderIds = Array.from(
    new Set((docs || []).map((doc) => doc.user_id).filter((id): id is string => Boolean(id))),
  )

  const profileMap = new Map<string, { full_name: string | null; email: string | null }>()
  if (uploaderIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', uploaderIds)
    if (profilesError) {
      throw createError({ statusCode: 500, statusMessage: profilesError.message })
    }
    profiles?.forEach((profile) => {
      profileMap.set(profile.id, { full_name: profile.full_name, email: profile.email })
    })
  }

  const payload = (docs || []).map((doc) => {
    const uploader = profileMap.get(doc.user_id) || { full_name: null, email: null }
    return {
      id: doc.id,
      title: doc.title,
      course: doc.course,
      doc_type: doc.doc_type,
      visibility: doc.visibility,
      status: doc.status,
      approval_status: doc.approval_status,
      uploader_name: uploader.full_name,
      uploader_email: uploader.email,
      created_at: doc.created_at,
    }
  })

  return { docs: payload }
})
