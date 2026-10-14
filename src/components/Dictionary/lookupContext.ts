import { createContext } from 'react'

export type LookupController = {
  active: string | null
  /** True while rendering the open dictionary card, so clicks retarget it instead of owning it. */
  inPopover: boolean
  open: (word: string, trigger: HTMLButtonElement, ownerId: string | null) => void
  dismissIfOwner: (ownerId: string) => void
}

export const LookupContext = createContext<LookupController | null>(null)
