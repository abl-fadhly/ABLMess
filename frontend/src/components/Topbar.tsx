import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Menu, MenuItem } from './ui'
import { Icon, iconPaths } from './icons'
import { ProfileModal } from './ProfileModal'

export function Topbar() {
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="h-16 flex items-center justify-end gap-2 px-4 sm:px-8 border-b border-neutral-200 bg-surface shrink-0">
      <Menu
        width="w-64"
        trigger={
          <span className="h-9 w-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors">
            <Icon path={iconPaths.bell} className="h-5 w-5" />
          </span>
        }
      >
        <div className="px-3 py-6 text-center text-sm text-neutral-400">No new notifications</div>
      </Menu>

      <Menu
        trigger={
          <span className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-100 transition-colors">
            <Avatar name={fullName} photoUrl={user.photoUrl} size="sm" />
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-sm font-medium text-neutral-900">{fullName}</span>
              <span className="block text-xs text-neutral-500">{user.userType}</span>
            </span>
            <Icon path={iconPaths.chevronDown} className="h-4 w-4 text-neutral-400 shrink-0" />
          </span>
        }
      >
        <MenuItem onClick={() => setShowProfile(true)} className="flex items-center gap-2">
          <Icon path={iconPaths.user} className="h-4 w-4 text-neutral-400" />
          Profile
        </MenuItem>
        <MenuItem onClick={logout} className="flex items-center gap-2 text-error-dark">
          <Icon path={iconPaths.logout} className="h-4 w-4" />
          Log out
        </MenuItem>
      </Menu>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}
