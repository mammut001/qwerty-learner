import { db } from '@/utils/db'
import type { IChapterRecord } from '@/utils/db/record'
import { useEffect, useState } from 'react'

export function useDictStats(dictID: string, isStartLoad: boolean, chapterCount: number) {
  const [dictStats, setDictStats] = useState<IDictStats | null>(null)

  useEffect(() => {
    let cancelled = false
    setDictStats(null)
    if (!isStartLoad) return
    void getDictStats(dictID, chapterCount)
      .then((stats) => {
        if (!cancelled) setDictStats(stats)
      })
      .catch(() => {
        if (!cancelled) setDictStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [dictID, isStartLoad, chapterCount])

  return dictStats
}

interface IDictStats {
  exercisedChapterCount: number
}

async function getDictStats(dict: string, chapterCount: number): Promise<IDictStats> {
  const records: IChapterRecord[] = await db.chapterRecords.where({ dict }).toArray()
  const chapters = records
    .map(({ chapter }) => chapter)
    .filter(
      (chapter): chapter is number => typeof chapter === 'number' && Number.isInteger(chapter) && chapter >= 0 && chapter < chapterCount,
    )
  const exercisedChapterCount = new Set(chapters).size

  return { exercisedChapterCount }
}
