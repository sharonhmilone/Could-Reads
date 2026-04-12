import type { BookStatus } from '@/lib/types'

const statusConfig: Record<BookStatus, { label: string; className: string }> = {
  'want-to-read': { label: 'Want to Read', className: 'stamp-want' },
  reading:        { label: 'Reading',      className: 'stamp-reading' },
  done:           { label: 'Done!',        className: 'stamp-done' },
  skipped:        { label: 'Skipped',      className: 'stamp-skipped' },
}

interface BookStatusBadgeProps {
  status: BookStatus
}

export function BookStatusBadge({ status }: BookStatusBadgeProps) {
  const { label, className } = statusConfig[status]
  return <span className={className}>{label}</span>
}
