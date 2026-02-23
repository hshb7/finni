import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import {
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Undo2Icon,
  LoaderIcon,
} from 'lucide-react'

import { usePatients } from '@/hooks/use-patients'
import { useDebounce } from '@/hooks/use-debounce'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  className?: string
}

const SearchDialog = ({ defaultOpen = false, trigger, className }: Props) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(defaultOpen)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const isSearching = debouncedSearch.length >= 2

  const { data: recentData, isLoading: recentLoading } = usePatients({
    page_size: 5,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const { data: searchData, isLoading: searchLoading } = usePatients(
    isSearching ? { search: debouncedSearch, page_size: 5 } : {},
  )

  const patients = isSearching ? searchData?.items : recentData?.items
  const loading = isSearching ? searchLoading : recentLoading

  function selectPatient(id: string) {
    navigate(`/patients/${id}`)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className={className}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
        <CommandInput
          placeholder='Search patients, appointments...'
          value={search}
          onValueChange={setSearch}
          className='text-base [svg:has(+&)]:size-5 [svg:has(+&)]:opacity-100'
        />

        <CommandList className='max-h-[65vh]'>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup
            heading='Quick Actions'
            className='[&_[cmdk-group-heading]]:text-muted-foreground !px-4 !py-6 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase'
          >
            <CommandItem onSelect={() => { navigate('/patients'); setOpen(false); setSearch('') }} className='!py-1.5 text-base'>
              <UsersIcon className='text-foreground !size-4.5' />
              <span>View All Patients</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup
            heading={isSearching ? 'Search Results' : 'Recent Patients'}
            className='[&_[cmdk-group-heading]]:text-muted-foreground !px-4 !py-6 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:uppercase'
          >
            {loading ? (
              <div className='text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm'>
                <LoaderIcon className='size-4 animate-spin' />
                <span>Loading...</span>
              </div>
            ) : (
              patients?.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.first_name} ${p.last_name}`}
                  onSelect={() => selectPatient(p.id)}
                  className='gap-3 !py-1.5 text-base'
                >
                  <Avatar className='size-9.5 avatar-pfp'>
                    <AvatarImage src={p.avatar_url ?? undefined} alt={`${p.first_name} ${p.last_name}`} />
                    <AvatarFallback>{p.first_name[0]}{p.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className='flex w-full flex-col items-start'>
                    <span className='font-medium'>{p.first_name} {p.last_name}</span>
                    <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                      <span className={`size-2 rounded-full bg-status-${p.status.toLowerCase()}`} />
                      <span className={`text-status-${p.status.toLowerCase()}`}>{p.status}</span>
                      {p.city && p.state && (
                        <span>&middot; {p.city}, {p.state}</span>
                      )}
                    </span>
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>

        <CommandSeparator />

        <div className='text-muted-foreground flex flex-wrap items-center gap-4 p-6'>
          <div className='flex flex-1 items-center gap-2'>
            <kbd className='rounded border px-1 text-sm'>esc</kbd>
            <span>To close</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-5 items-center justify-center rounded border'>
              <Undo2Icon className='size-4' />
            </div>
            <span>To Select</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex size-5 items-center justify-center rounded border'>
              <ArrowUpIcon className='size-4' />
            </div>
            <div className='flex size-5 items-center justify-center rounded border'>
              <ArrowDownIcon className='size-4' />
            </div>
            <span>To Navigate</span>
          </div>
        </div>
      </CommandDialog>
    </div>
  )
}

export default SearchDialog
