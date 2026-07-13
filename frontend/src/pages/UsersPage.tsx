import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Badge, Button, Card, Input, LinkButton, Modal, PageHeader, Select, Table, Td, Th, Tr } from '../components/ui'
import type { Gender, JabatanDto, ShipDto, UserDto, UserType } from '../api/types'

interface UserFormState {
  firstName: string
  lastName: string
  gender: Gender
  shipId: number | ''
  jabatanId: number | ''
  phone: string
  userType: UserType
  email: string
  password: string
}

const emptyForm: UserFormState = {
  firstName: '',
  lastName: '',
  gender: 'Male',
  shipId: '',
  jabatanId: '',
  phone: '',
  userType: 'Crew',
  email: '',
  password: '',
}

const roleTone: Record<UserType, 'primary' | 'secondary' | 'neutral'> = {
  Admin: 'primary',
  GS: 'secondary',
  Crew: 'neutral',
}

function UserModal({
  initial,
  ships,
  jabatans,
  onClose,
  onSave,
}: {
  initial: UserDto | null
  ships: ShipDto[]
  jabatans: JabatanDto[]
  onClose: () => void
  onSave: (form: UserFormState) => Promise<void>
}) {
  const [form, setForm] = useState<UserFormState>(
    initial
      ? {
          firstName: initial.firstName,
          lastName: initial.lastName,
          gender: initial.gender,
          shipId: initial.shipId ?? '',
          jabatanId: initial.jabatanId ?? '',
          phone: initial.phone,
          userType: initial.userType,
          email: initial.email,
          password: '',
        }
      : emptyForm,
  )
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormState, string>>>({})
  const [saving, setSaving] = useState(false)

  function validate(): Partial<Record<keyof UserFormState, string>> {
    const errors: Partial<Record<keyof UserFormState, string>> = {}
    if (!form.firstName.trim()) errors.firstName = 'First name is required.'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
    if (!initial && !form.password) errors.password = 'Password is required.'
    else if (!initial && form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
    return errors
  }

  async function submit() {
    setError(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={initial ? 'Edit User' : 'Add User'} onClose={onClose}>
        {error && <ErrorBanner message={error} />}

        <div className="grid grid-cols-2 gap-2">
          <Input
            id="user-first-name"
            placeholder="First name"
            value={form.firstName}
            error={fieldErrors.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Input
            id="user-last-name"
            placeholder="Last name"
            value={form.lastName}
            error={fieldErrors.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <Input
          id="user-email"
          placeholder="Email"
          type="email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          id="user-phone"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
          <Select value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value as UserType })}>
            <option value="Crew">Crew</option>
            <option value="GS">GS</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={form.shipId}
            onChange={(e) => setForm({ ...form, shipId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">No ship</option>
            {ships.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shipName}
              </option>
            ))}
          </Select>
          <Select
            value={form.jabatanId}
            onChange={(e) => setForm({ ...form, jabatanId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">No jabatan</option>
            {jabatans.map((j) => (
              <option key={j.id} value={j.id}>
                {j.namaJabatan}
              </option>
            ))}
          </Select>
        </div>

        {!initial && (
          <Input
            id="user-password"
            placeholder="Password"
            type="password"
            value={form.password}
            error={fieldErrors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
    </Modal>
  )
}

export function UsersPage() {
  const { data: users, loading, error, reload: load } = useFetch(() => api.get<UserDto[]>('/users'))
  const { data: ships } = useFetch(() => api.get<ShipDto[]>('/ships'))
  const { data: jabatans } = useFetch(() => api.get<JabatanDto[]>('/jabatans'))
  const [editing, setEditing] = useState<UserDto | 'new' | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  async function save(form: UserFormState) {
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender,
      shipId: form.shipId === '' ? null : form.shipId,
      jabatanId: form.jabatanId === '' ? null : form.jabatanId,
      phone: form.phone,
      userType: form.userType,
      email: form.email,
    }

    if (editing && editing !== 'new') {
      await api.put(`/users/${editing.id}`, payload)
      toast.success('User updated.')
    } else {
      await api.post('/users', { ...payload, password: form.password })
      toast.success('User added.')
    }
    setEditing(null)
    load()
  }

  async function remove(id: number) {
    if (!(await confirm({ title: 'Delete user?', message: 'This will permanently delete the user account.', tone: 'danger', confirmLabel: 'Delete User' })))
      return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted.')
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete user.')
    }
  }

  async function resetPassword(id: number) {
    const newPassword = prompt('New password for this user:')
    if (!newPassword) return
    try {
      await api.post(`/users/${id}/reset-password`, { newPassword })
      toast.success('Password reset.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to reset password.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        action={<Button onClick={() => setEditing('new')}>Add User</Button>}
      />

      <Card>
        {loading && <Spinner label="Loading users..." />}
        {error && <ErrorBanner message={error} />}
        {users && users.length === 0 && <EmptyState message="No users yet." />}
        {users && users.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Type</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium text-neutral-900">
                    {u.firstName} {u.lastName}
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <Badge tone={roleTone[u.userType]}>{u.userType}</Badge>
                  </Td>
                  <Td>
                    {u.userType === 'Admin' ? (
                      <span className="text-xs text-neutral-400">Protected account</span>
                    ) : (
                      <div className="flex gap-3">
                        <LinkButton onClick={() => setEditing(u)}>Edit</LinkButton>
                        <LinkButton onClick={() => resetPassword(u.id)}>Reset Password</LinkButton>
                        <LinkButton tone="danger" onClick={() => remove(u.id)}>
                          Delete
                        </LinkButton>
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {editing && (
        <UserModal
          initial={editing === 'new' ? null : editing}
          ships={ships ?? []}
          jabatans={jabatans ?? []}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}
