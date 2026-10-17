import { createContext, useContext } from 'react'

export type LookupController = {
  active: string | null
  /** True while rendering the open dictionary card, so clicks retarget it instead of owning it. */
  inPopover: boolean
  open: (word: string, trigger?: HTMLElement | null, ownerId?: string | null) => void
  dismissIfOwner: (ownerId: string) => void
}

export const LookupContext = createContext<LookupController | null>(null)

export const useLookup = () => useContext(LookupContext)
