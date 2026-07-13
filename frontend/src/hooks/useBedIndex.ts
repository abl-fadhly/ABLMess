import { useMemo } from 'react'
import { api } from '../api/client'
import { useFetch } from './useFetch'
import type { BedDto, RoomDto } from '../api/types'

export interface BedInfo {
  bedName: string
  roomId: number
  roomName: string
}

export function useBedIndex(rooms: RoomDto[] | null) {
  const { data: bedLists } = useFetch(async () => {
    if (!rooms || rooms.length === 0) return []
    return Promise.all(rooms.map((r) => api.get<BedDto[]>(`/rooms/${r.id}/beds/list`)))
  }, [rooms?.map((r) => r.id).join(',')])

  return useMemo(() => {
    const index = new Map<number, BedInfo>()
    if (!bedLists || !rooms) return index
    const roomNameById = new Map(rooms.map((r) => [r.id, r.roomName]))
    bedLists.flat().forEach((bed) => {
      index.set(bed.id, { bedName: bed.bedName, roomId: bed.roomId, roomName: roomNameById.get(bed.roomId) ?? `#${bed.roomId}` })
    })
    return index
  }, [bedLists, rooms])
}
