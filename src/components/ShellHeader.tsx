import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const ShellHeaderHiddenContext = createContext(false)
const SetShellHeaderHiddenContext = createContext<((hidden: boolean) => void) | null>(null)

export function ShellHeaderProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false)
  return (
    <SetShellHeaderHiddenContext.Provider value={setHidden}>
      <ShellHeaderHiddenContext.Provider value={hidden}>{children}</ShellHeaderHiddenContext.Provider>
    </SetShellHeaderHiddenContext.Provider>
  )
}

export function useShellHeaderHidden() {
  return useContext(ShellHeaderHiddenContext)
}

/** Hide the shared shell header for an in-progress exam, and show it again when that screen leaves. */
export function useHideShellHeader(hidden: boolean) {
  const setHidden = useContext(SetShellHeaderHiddenContext)
  useEffect(() => {
    if (!setHidden) return
    setHidden(hidden)
    return () => setHidden(false)
  }, [hidden, setHidden])
}
