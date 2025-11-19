export function getAvatarInitials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) return 'JS'
  const source = nameOrEmail.split('@')[0] || ''
  const parts = source.split(/[.\s_]+/).filter(Boolean)
  if (!parts.length) return 'JS'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}
