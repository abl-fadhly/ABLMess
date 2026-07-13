import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-secondary-50 text-secondary-700'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`

const mobileNavItemClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium ${
    isActive
      ? 'bg-secondary-50 text-secondary-700'
      : 'text-neutral-600 bg-neutral-50'
  }`

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

const icons = {
  dashboard: 'M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  requests: 'M4 4a2 2 0 012-2h6.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm6 4a1 1 0 100-2 1 1 0 000 2zm-1 3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM7 8a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1z',
  bookings: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z',
  rooms: 'M10 2a1 1 0 011 1v1.323l3.954 1.582A1 1 0 0116 6.83V17a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1V6.83a1 1 0 01.546-.891L9 4.323V3a1 1 0 011-1z',
  users: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM1.615 16.428a9 9 0 0114.77 0A.75.75 0 0115.75 17H2.25a.75.75 0 01-.635-.572zM17.615 17H15.75a2.25 2.25 0 00-.176-.867 10.98 10.98 0 00-2.94-4.061A6 6 0 0117.615 17z',
  reference: 'M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zm2 3h8a1 1 0 110 2H6a1 1 0 010-2zm0 4h8a1 1 0 110 2H6a1 1 0 010-2zm0 4h4a1 1 0 110 2H6a1 1 0 010-2z',
  logs: 'M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H4zm4 8a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zm-3 0a1 1 0 011-1h.01a1 1 0 010 2H6a1 1 0 01-1-1zm7-3a1 1 0 100 2h.01a1 1 0 100-2H12zM5 13a1 1 0 000 2h6a1 1 0 100-2H5z',
  profile: 'M10 2a4 4 0 100 8 4 4 0 000-8zM3 18a7 7 0 0114 0 1 1 0 01-1 1H4a1 1 0 01-1-1z',
}

export function Layout() {
  const { user, logout } = useAuth()
  const isStaff = user?.userType === 'Admin' || user?.userType === 'GS'

  const staffLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/requests', label: 'Requests', icon: icons.requests },
    { to: '/bookings', label: 'Bookings', icon: icons.bookings },
    { to: '/rooms', label: 'Rooms', icon: icons.rooms },
    { to: '/users', label: 'Users', icon: icons.users },
    { to: '/logs', label: 'Logs', icon: icons.logs },
    { to: '/reference-data', label: 'Reference Data', icon: icons.reference },
  ]

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : ''

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-surface sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-neutral-200">
          <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-bold text-neutral-900 tracking-tight">ABLMess</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {isStaff &&
            staffLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={navItemClass}>
                <Icon path={l.icon} />
                {l.label}
              </NavLink>
            ))}
          {user?.userType === 'Crew' && (
            <NavLink to="/my-requests" className={navItemClass}>
              <Icon path={icons.requests} />
              My Requests
            </NavLink>
          )}
          <NavLink to="/profile" className={navItemClass}>
            <Icon path={icons.profile} />
            Profile
          </NavLink>
        </nav>
        <div className="p-3 border-t border-neutral-200">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-neutral-500">{user?.userType}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-1 text-left px-2 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-surface border-b border-neutral-200">
          <div className="h-14 flex items-center justify-between px-4">
            <span className="font-bold text-neutral-900">ABLMess</span>
            <div className="flex items-center gap-3">
              <button onClick={logout} className="text-sm text-neutral-500">
                Log out
              </button>
            </div>
          </div>
          <nav className="flex gap-1 px-3 pb-2 overflow-x-auto">
            {isStaff &&
              staffLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={mobileNavItemClass}>
                  {l.label}
                </NavLink>
              ))}
            {user?.userType === 'Crew' && (
              <NavLink to="/my-requests" className={mobileNavItemClass}>
                My Requests
              </NavLink>
            )}
            <NavLink to="/profile" className={mobileNavItemClass}>
              Profile
            </NavLink>
          </nav>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
