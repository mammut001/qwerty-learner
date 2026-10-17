import type { IntensiveQuestion, IntensiveSentence, IntensiveVocab, Passage } from '@/resources/intensiveListening'
import type { IntensiveListeningManifest, SentenceSegment } from '@/services/intensiveListeningAudio'

export type { Passage, IntensiveSentence, IntensiveVocab, IntensiveQuestion, IntensiveListeningManifest, SentenceSegment }

export type IntensiveLevelFilter = 'ALL' | 'B1' | 'B2'

export interface IntensiveProgressRecord {
  completedPassages: string[]
}
