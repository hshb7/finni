import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), 'MM/dd/yyyy')
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), 'MM/dd/yyyy h:mm a')
}

export function toDatetimeLocal(isoString: string): string {
  return format(parseISO(isoString), "yyyy-MM-dd'T'HH:mm")
}

export function formatRelativeTime(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true })
}

export function formatPhone(phone: string | null): string {
  if (!phone) return '--'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}
