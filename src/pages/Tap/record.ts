import { recordVocabularyProgress } from '@/services/studyPlanSync'
import { db } from '@/utils/db'
import { WordRecord } from '@/utils/db/record'

export type TapAnswerInput = {
  word: string
  dict: string
  chapter: number
  durationMs: number
  correct: boolean
}

/**
 * Saves one 点选模式 answer the way typing saves a word: the synced vocabulary log (same call as typing, tagged
 * mode 'tap') and the local word record that feeds 错题本 and the local stats. A failed local write does not stop the sync.
 */
export function recordTapAnswer({ word, dict, chapter, durationMs, correct }: TapAnswerInput) {
  const timing = Math.max(0, Math.min(86400000, Math.round(durationMs)))
  const wrongCount = correct ? 0 : 1
  const wordRecord = new WordRecord(word, dict, chapter, [timing], wrongCount, {})
  wordRecord.mode = 'tap'

  void db.wordRecords.add(wordRecord).catch((error: unknown) => {
    console.error(error)
  })

  try {
    recordVocabularyProgress({
      word: wordRecord.word,
      dict: wordRecord.dict,
      chapter: wordRecord.chapter,
      timeStamp: wordRecord.timeStamp,
      durationMs: wordRecord.timing.reduce((total, value) => total + value, 0),
      wrongCount: wordRecord.wrongCount,
      wrongKeys: [],
      mode: 'tap',
    })
  } catch {
    // IndexedDB and the sync queue keep the answer; a later sync retries it.
  }
}
