import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { usePatients } from '@/hooks/use-patients'
import { useRecentAppointments, useCareGaps } from '@/hooks/use-stats'

import {
  ActivityIcon,
  BellIcon,
  HomeIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UsersIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'

import LogoSvg from '@/assets/svg/logo'
import MenuTrigger from '@/components/layout/MenuTrigger'
import SearchDialog from '@/components/layout/SearchDialog'
import ThemeToggle from '@/components/layout/ThemeToggle'
import ActivityDialog from '@/components/layout/ActivityDialog'
import NotificationDropdown from '@/components/layout/NotificationDropdown'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import SidebarUserDropdown from '@/components/layout/SidebarUserDropdown'

type NavItem = {
  icon: typeof HomeIcon
  label: string
  to: string
}

const navItems: NavItem[] = [
  { icon: HomeIcon, label: 'Dashboard', to: '/' },
  { icon: UsersIcon, label: 'Patients', to: '/patients' },
]

const AppShell = () => {
  const { data: recentData } = usePatients({ page: 1, page_size: 4, sort_by: 'created_at', sort_order: 'desc' })
  const { data: appointmentsData } = useRecentAppointments()
  const { data: careGapsData } = useCareGaps()
  const hasNotifications = (appointmentsData?.upcoming?.length ?? 0) > 0 || (careGapsData?.total_count ?? 0) > 0
  const recentPatients = (recentData?.items ?? []).map(p => ({
    name: `${p.first_name} ${p.last_name}`,
    initials: `${p.first_name[0]}${p.last_name[0]}`,
    to: `/patients/${p.id}`,
  }))
  return (
    <div className='bg-muted before:bg-primary relative flex min-h-dvh w-full before:fixed before:inset-x-0 before:top-0 before:h-105'>
      <SidebarProvider
        style={
          {
            '--sidebar': 'var(--card)',
            '--sidebar-width': '17.5rem',
            '--sidebar-width-icon': '3.5rem'
          } as CSSProperties
        }
      >
        <Sidebar
          variant='floating'
          collapsible='icon'
          className='p-6 pr-0 [&>[data-slot=sidebar-inner]]:group-data-[variant=floating]:rounded-xl'
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size='lg' className='gap-2.5 !bg-transparent [&>svg]:size-8' asChild>
                  <NavLink to='/'>
                    <LogoSvg className='[&_rect]:fill-sidebar [&_rect:first-child]:fill-primary' />
                    <span className='text-xl font-semibold'>Finni Health</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(item => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Recent Patients</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentPatients.map(patient => (
                    <SidebarMenuItem key={patient.name}>
                      <SidebarMenuButton asChild>
                        <NavLink to={patient.to}>
                          <Avatar className='size-6 transition-[width,height] duration-200 [[data-state=collapsed]_&]:size-4'>
                            <AvatarFallback className='text-xs'>
                              {patient.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{patient.name}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarUserDropdown />
          </SidebarFooter>
        </Sidebar>
        <div className='z-1 flex flex-1 flex-col py-6'>
          <header className='text-primary-foreground'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6'>
              <div className='flex items-center gap-4'>
                <MenuTrigger
                  variant='outline'
                  className='!bg-primary-foreground !border-primary-foreground !text-primary shadow-none'
                />
                <div className='hidden sm:flex sm:flex-col sm:items-start'>
                  <p className='text-lg font-semibold'>Welcome back</p>
                  <p className='text-primary-foreground/50 md:max-lg:hidden'>Patient Management Dashboard</p>
                </div>
              </div>
              <SearchDialog
                className='hidden xl:block'
                trigger={
                  <Button variant='ghost' className='!bg-transparent p-0 font-normal'>
                    <div className='!bg-primary-foreground/20 text-primary-foreground hover:!bg-primary-foreground/25 flex min-w-55 items-center gap-1.5 rounded-md px-3 py-2 text-sm'>
                      <SearchIcon />
                      <span>Type to search...</span>
                    </div>
                  </Button>
                }
              />
              <div className='flex items-center gap-1.5'>
                <SearchDialog
                  className='block xl:hidden'
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <SearchIcon />
                      <span className='sr-only'>Search</span>
                    </Button>
                  }
                />
                <ThemeToggle
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <SunIcon className='block dark:hidden' />
                      <MoonIcon className='hidden dark:block' />
                    </Button>
                  }
                />
                <ActivityDialog
                  trigger={
                    <Button variant='ghost' size='icon'>
                      <ActivityIcon />
                    </Button>
                  }
                />
                <NotificationDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='relative'>
                      <BellIcon />
                      {hasNotifications && (
                        <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                      )}
                    </Button>
                  }
                />
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5'>
                      <Avatar className='size-9.5 rounded-md'>
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default AppShell
