import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { Spinner, ErrorBanner } from './Status'
import { Button, Input, Label, Modal } from './ui'
import type { UserDto } from '../api/types'

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { data: user, loading, error } = useFetch(() => api.get<UserDto>('/users/me'))
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setPhone(user.phone)
      setEmail(user.email)
    }
  }, [user])

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileMessage(null)
    setSavingProfile(true)
    try {
      await api.put('/users/me', { firstName, lastName, phone, email })
      setProfileMessage('Profile updated.')
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    setSavingPassword(true)
    try {
      await api.put('/users/me/password', { currentPassword, newPassword })
      setPasswordMessage('Password changed.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Modal title="Profile" onClose={onClose}>
      {loading && <Spinner label="Loading profile..." />}
      {error && <ErrorBanner message={error} />}

      {user && (
        <div className="space-y-6">
          <form onSubmit={saveProfile} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">My Details</h3>
            {profileError && <ErrorBanner message={profileError} />}
            {profileMessage && <p className="text-sm text-success-dark">{profileMessage}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="profile-first">First name</Label>
                <Input id="profile-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="profile-last">Last name</Label>
                <Input id="profile-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="profile-phone">Phone</Label>
              <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save'}
            </Button>
          </form>

          <form onSubmit={changePassword} className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Change Password</h3>
            {passwordError && <ErrorBanner message={passwordError} />}
            {passwordMessage && <p className="text-sm text-success-dark">{passwordMessage}</p>}
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>
      )}
    </Modal>
  )
}
