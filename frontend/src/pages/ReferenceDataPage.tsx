import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { useFetch } from '../hooks/useFetch'
import { useConfirm } from '../components/ConfirmContext'
import { useToast } from '../components/ToastContext'
import { Spinner, ErrorBanner, EmptyState } from '../components/Status'
import { Button, Card, Chip, Input, LinkButton, PageHeader } from '../components/ui'
import type { JabatanDto, LocationDto, ShipDto } from '../api/types'

type Tab = 'ships' | 'jabatans' | 'locations'

function ShipsTab() {
  const { data: ships, loading, error, reload } = useFetch(() => api.get<ShipDto[]>('/ships'))
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  async function add() {
    if (!name.trim()) {
      setNameError('Ship name is required.')
      return
    }
    setNameError(undefined)
    setBusy(true)
    try {
      await api.post('/ships', { shipName: name })
      setName('')
      toast.success('Ship added.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add ship.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (!(await confirm({ title: 'Delete ship?', message: 'This will delete the ship.', tone: 'danger', confirmLabel: 'Delete Ship' })))
      return
    try {
      await api.delete(`/ships/${id}`)
      toast.success('Ship deleted.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete ship.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 max-w-md items-start">
        <div className="flex-1">
          <Input
            id="ship-name"
            value={name}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ship name"
          />
        </div>
        <Button onClick={add} disabled={busy}>
          {busy ? 'Adding...' : 'Add'}
        </Button>
      </div>
      {loading && <Spinner label="Loading ships..." />}
      {error && <ErrorBanner message={error} />}
      {ships && ships.length === 0 && <EmptyState message="No ships yet." />}
      {ships && ships.length > 0 && (
        <ul className="divide-y divide-neutral-100">
          {ships.map((s) => (
            <li key={s.id} className="py-2.5 flex justify-between text-sm">
              <span className="text-neutral-700">{s.shipName}</span>
              <LinkButton tone="danger" onClick={() => remove(s.id)}>
                Delete
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function JabatansTab() {
  const { data: jabatans, loading, error, reload } = useFetch(() => api.get<JabatanDto[]>('/jabatans'))
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  async function add() {
    if (!name.trim()) {
      setNameError('Jabatan name is required.')
      return
    }
    setNameError(undefined)
    setBusy(true)
    try {
      await api.post('/jabatans', { namaJabatan: name })
      setName('')
      toast.success('Jabatan added.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add jabatan.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (!(await confirm({ title: 'Delete jabatan?', message: 'This will delete the jabatan.', tone: 'danger', confirmLabel: 'Delete Jabatan' })))
      return
    try {
      await api.delete(`/jabatans/${id}`)
      toast.success('Jabatan deleted.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete jabatan.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 max-w-md items-start">
        <div className="flex-1">
          <Input
            id="jabatan-name"
            value={name}
            error={nameError}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jabatan name"
          />
        </div>
        <Button onClick={add} disabled={busy}>
          {busy ? 'Adding...' : 'Add'}
        </Button>
      </div>
      {loading && <Spinner label="Loading jabatan..." />}
      {error && <ErrorBanner message={error} />}
      {jabatans && jabatans.length === 0 && <EmptyState message="No jabatan yet." />}
      {jabatans && jabatans.length > 0 && (
        <ul className="divide-y divide-neutral-100">
          {jabatans.map((j) => (
            <li key={j.id} className="py-2.5 flex justify-between text-sm">
              <span className="text-neutral-700">{j.namaJabatan}</span>
              <LinkButton tone="danger" onClick={() => remove(j.id)}>
                Delete
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LocationsTab() {
  const { data: locations, loading, error, reload } = useFetch(() => api.get<LocationDto[]>('/locations'))
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; address?: string }>({})
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  async function add() {
    const errors: { name?: string; address?: string } = {}
    if (!name.trim()) errors.name = 'Location name is required.'
    if (!address.trim()) errors.address = 'Address is required.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setBusy(true)
    try {
      await api.post('/locations', { locationName: name, locationAddress: address, imageUrl: imageUrl.trim() || null })
      setName('')
      setAddress('')
      setImageUrl('')
      setFieldErrors({})
      toast.success('Location added.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add location.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (
      !(await confirm({ title: 'Delete location?', message: 'This will delete the location.', tone: 'danger', confirmLabel: 'Delete Location' }))
    )
      return
    try {
      await api.delete(`/locations/${id}`)
      toast.success('Location deleted.')
      reload()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete location.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 max-w-lg flex-wrap items-start">
        <div className="flex-1 min-w-[10rem]">
          <Input
            id="location-name"
            value={name}
            error={fieldErrors.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Location name"
          />
        </div>
        <div className="flex-1 min-w-[10rem]">
          <Input
            id="location-address"
            value={address}
            error={fieldErrors.address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
        <div className="flex-1 min-w-[10rem]">
          <Input
            id="location-image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
          />
        </div>
        <Button onClick={add} disabled={busy}>
          {busy ? 'Adding...' : 'Add'}
        </Button>
      </div>
      {loading && <Spinner label="Loading locations..." />}
      {error && <ErrorBanner message={error} />}
      {locations && locations.length === 0 && <EmptyState message="No locations yet." />}
      {locations && locations.length > 0 && (
        <ul className="divide-y divide-neutral-100">
          {locations.map((l) => (
            <li key={l.id} className="py-2.5 flex justify-between items-center text-sm gap-3">
              <span className="flex items-center gap-2 min-w-0 text-neutral-700">
                {l.imageUrl && (
                  <img src={l.imageUrl} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
                )}
                <span className="truncate">
                  {l.locationName} <span className="text-neutral-400">— {l.locationAddress}</span>
                </span>
              </span>
              <LinkButton tone="danger" onClick={() => remove(l.id)}>
                Delete
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ReferenceDataPage() {
  const [tab, setTab] = useState<Tab>('locations')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'locations', label: 'Locations' },
    { key: 'ships', label: 'Ships' },
    { key: 'jabatans', label: 'Jabatan' },
  ]

  return (
    <div>
      <PageHeader title="Reference Data" />

      <div className="flex gap-1.5 mb-4">
        {tabs.map((t) => (
          <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <Card>
        {tab === 'locations' && <LocationsTab />}
        {tab === 'ships' && <ShipsTab />}
        {tab === 'jabatans' && <JabatansTab />}
      </Card>
    </div>
  )
}
