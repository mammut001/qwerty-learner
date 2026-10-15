import { currentChapterAtom, currentDictIdAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { NavLink } from 'react-router-dom'

/** Desktop entry to 点选模式 from the typing page, opening the dictionary and chapter that are already selected. */
export function TapModeLink() {
  const dictId = useAtomValue(currentDictIdAtom)
  const chapter = useAtomValue(currentChapterAtom)
  return (
    <NavLink
      to={`/tap?dict=${encodeURIComponent(dictId)}&chapter=${chapter}`}
      title="不用键盘，看词或听音点选答案"
      className="block rounded-lg px-3 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
    >
      点选模式
    </NavLink>
  )
}
