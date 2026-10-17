import { passageTitle, titleForPath } from '@/resources/routeSeo'
import { useEffect } from 'react'

export { titleForPath, passageTitle }

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
