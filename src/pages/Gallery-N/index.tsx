import DictionaryGroup from './CategoryDicts'
import { LanguageTabSwitcher } from './LanguageTabSwitcher'
import Layout from '@/components/Layout'
import { dictionaries } from '@/resources/dictionary'
import { getLearningProgress } from '@/services/studyPlanSync'
import { currentDictInfoAtom } from '@/store'
import { customDictionariesAtom, findDictionary } from '@/store/customDict'
import type { Dictionary, LanguageCategoryType } from '@/typings'
import groupBy from '@/utils/groupBy'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtomValue } from 'jotai'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import type { Updater } from 'use-immer'
import { useImmer } from 'use-immer'
import IconX from '~icons/tabler/x'

export type GalleryState = {
  currentLanguageTab: LanguageCategoryType
}

const initialGalleryState: GalleryState = {
  currentLanguageTab: 'fr',
}

export const GalleryContext = createContext<{
  state: GalleryState
  setState: Updater<GalleryState>
} | null>(null)

export default function GalleryPage() {
  const [galleryState, setGalleryState] = useImmer<GalleryState>(initialGalleryState)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const customDictionaries = useAtomValue(customDictionariesAtom)
  const targetDictionary = findDictionary(searchParams.get('dict'), customDictionaries)
  const [placementDictIds, setPlacementDictIds] = useState<string[]>([])

  useEffect(() => {
    void getLearningProgress()
      .then((learning) => setPlacementDictIds(learning.placement?.latest?.recommendations.vocabularyDictIds ?? []))
      .catch(() => undefined)
  }, [])

  const groupedByCategory = useMemo(() => {
    const currentLanguageCategoryDicts = [...customDictionaries, ...dictionaries].filter(
      (dict) => dict.languageCategory === galleryState.currentLanguageTab,
    )
    return Object.entries(groupBy(currentLanguageCategoryDicts, (dict) => dict.category))
  }, [customDictionaries, galleryState.currentLanguageTab])

  const onBack = useCallback(() => {
    navigate('/typing')
  }, [navigate])

  useHotkeys('enter,esc', onBack, { preventDefault: true })

  useEffect(() => {
    if (currentDictInfo) {
      setGalleryState((state) => {
        state.currentLanguageTab = currentDictInfo.languageCategory
      })
    }
  }, [currentDictInfo, setGalleryState])

  useEffect(() => {
    if (targetDictionary) {
      setGalleryState((state) => {
        state.currentLanguageTab = targetDictionary.languageCategory
      })
    }
  }, [setGalleryState, targetDictionary])

  return (
    <Layout>
      <GalleryContext.Provider value={{ state: galleryState, setState: setGalleryState }}>
        <div className="relative mb-auto mt-auto flex w-full flex-1 flex-col overflow-y-auto pl-20">
          <IconX className="absolute right-20 top-10 mr-2 h-7 w-7 cursor-pointer text-gray-400" onClick={onBack} />
          <div className="mt-20 flex w-full flex-1 flex-col items-center justify-center overflow-y-auto">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="flex h-20 w-full items-center justify-between pb-6 pr-20">
                <LanguageTabSwitcher />
                <div className="flex gap-2">
                  <NavLink
                    to="/placement-test"
                    data-testid="gallery-placement-link"
                    className="rounded-xl bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200"
                  >
                    定级测试
                  </NavLink>
                  <NavLink
                    to="/word-lists"
                    data-testid="gallery-word-lists"
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
                  >
                    ＋ 我的词表
                  </NavLink>
                  <NavLink
                    to="/study-plan"
                    className="rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:bg-gray-800 dark:text-green-300 dark:hover:bg-gray-700"
                  >
                    学习计划
                  </NavLink>
                  <NavLink
                    to="/grammar-session"
                    className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-300 dark:hover:bg-gray-700"
                  >
                    30 分钟语法
                  </NavLink>
                  <NavLink
                    to="/conjugation"
                    className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
                  >
                    Conjugaison · 动词变位
                  </NavLink>
                </div>
              </div>
              {placementDictIds.length > 0 && (
                <div
                  data-testid="gallery-placement-hint"
                  className="mb-6 mr-20 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
                >
                  定级推荐词库已高亮；26 周大纲仍按学习计划日历推进，词库区按你的 CEFR 水平优先展示。
                </div>
              )}
              <ScrollArea.Root className="flex-1 overflow-y-auto">
                <ScrollArea.Viewport className="h-full w-full ">
                  <div className="mr-4 flex flex-1 flex-col items-start justify-start gap-14 overflow-y-auto">
                    {groupedByCategory.map(([category, categoryDictionaries]) => (
                      <DictionaryGroup
                        key={category}
                        category={category}
                        dictionaries={categoryDictionaries}
                        targetDictionaryId={targetDictionary?.id}
                        placementRecommendedDictIds={placementDictIds}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center pb-10 pt-24 text-xs text-gray-500">
                    <p>词库按 TCF Canada 学习场景整理；当前按 A1-A2 → 语法专项 → B1 → B2 → TCF 专项组织，建议按顺序推进。</p>
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
              </ScrollArea.Root>
              {/* todo: 增加导航 */}
              {/* <div className="mt-20 h-40 w-40 text-center ">
                <CategoryNavigation />
              </div> */}
            </div>
          </div>
        </div>
      </GalleryContext.Provider>
    </Layout>
  )
}
