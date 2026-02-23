import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { PatientStatus } from '@/lib/constants'
import { PATIENT_STATUSES } from '@/lib/constants'
import type { SortColumn } from '@/lib/constants'
import { usePatients } from '@/hooks/use-patients'
import { patientKeys } from '@/lib/query-keys'
import * as api from '@/lib/api'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate, formatPhone } from '@/lib/format'
import { StatusBadge } from '@/components/patients/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'

const PAGE_SIZE = 10

interface SortableColumn {
  label: string
  sortKey: SortColumn
}

const sortableColumns: SortableColumn[] = [
  { label: 'Name', sortKey: 'last_name' },
  { label: 'DOB', sortKey: 'date_of_birth' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Created', sortKey: 'created_at' },
]

function SortIcon({ column, sortBy, sortOrder }: { column: SortColumn; sortBy: SortColumn; sortOrder: 'asc' | 'desc' }) {
  if (column !== sortBy) return <ArrowUpDown className='ml-1 size-3.5 text-muted-foreground/50' />
  return sortOrder === 'asc'
    ? <ArrowUp className='ml-1 size-3.5' />
    : <ArrowDown className='ml-1 size-3.5' />
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
}

export function PatientTable() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortColumn>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isPlaceholderData } = usePatients({
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  // Prefetch the next page so clicking "Next" is instant
  useEffect(() => {
    if (data && page < (data.total_pages ?? 0)) {
      const nextParams = {
        page: page + 1,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      }
      queryClient.prefetchQuery({
        queryKey: patientKeys.list(nextParams),
        queryFn: () => api.getPatients(nextParams),
        staleTime: 30_000,
      })
    }
  }, [data, page, debouncedSearch, statusFilter, sortBy, sortOrder, queryClient])

  const totalPages = data?.total_pages ?? 0
  const total = data?.total ?? 0
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, total)

  function prefetchPatient(id: string) {
    queryClient.prefetchQuery({
      queryKey: patientKeys.detail(id),
      queryFn: () => api.getPatient(id),
      staleTime: 30_000,
    })
  }

  function handleSort(column: SortColumn) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as PatientStatus | 'all')
    setPage(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Toolbar */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='relative max-w-sm flex-1'>
              <Search className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search patients...'
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                {PATIENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => navigate('/patients/new')}>
            <Plus />
            Add Patient
          </Button>
        </div>

        {/* Table */}
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <Table>
            <TableHeader>
              <TableRow>
                {sortableColumns.map((col) => (
                  <TableHead key={col.sortKey}>
                    <button
                      type='button'
                      className='inline-flex items-center hover:text-foreground'
                      onClick={() => handleSort(col.sortKey)}
                    >
                      {col.label}
                      <SortIcon column={col.sortKey} sortBy={sortBy} sortOrder={sortOrder} />
                    </button>
                  </TableHead>
                ))}
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className='h-5 w-24' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className='cursor-pointer'
                    onMouseEnter={() => prefetchPatient(patient.id)}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell className='font-medium'>
                      {patient.last_name}, {patient.first_name}
                    </TableCell>
                    <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                    <TableCell>
                      <StatusBadge status={patient.status} />
                    </TableCell>
                    <TableCell>{formatDate(patient.created_at)}</TableCell>
                    <TableCell>{patient.city}, {patient.state}</TableCell>
                    <TableCell>{formatPhone(patient.phone)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Showing {startItem}-{endItem} of {total}
            </p>
            <Pagination className='mx-0 w-auto'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setPage(p)}
                        className='cursor-pointer'
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
