import type { LowConfidenceWord, SpeechMetrics } from '@/services/studyPlanSync'

const INTELLIGIBILITY_META = {
  clear: {
    label: '清晰',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    desc: '识别置信度高，语流表达清晰',
  },
  'mostly-clear': {
    label: '基本清晰',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    desc: '大部分词汇清晰，个别词汇可能发音含糊',
  },
  unclear: {
    label: '不清晰',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    desc: '平均置信度偏低，建议放慢语速并注意发音咬字',
  },
} as const

export function renderHighlightedTranscript(text: string, lowConfidenceWords?: LowConfidenceWord[]) {
  if (!lowConfidenceWords || lowConfidenceWords.length === 0) {
    return <span>{text}</span>
  }
  const lowSet = new Set(
    lowConfidenceWords.map((item) => item.word.toLowerCase().replace(/^[.,!?;:'"«»()]+|[.,!?;:'"«»()]+$/g, '')),
  )

  const tokens = text.split(/(\s+|[.,!?;:«»()]+)/)
  return (
    <>
      {tokens.map((token, index) => {
        const clean = token.toLowerCase().replace(/^[.,!?;:'"«»()]+|[.,!?;:'"«»()]+$/g, '')
        if (clean && lowSet.has(clean)) {
          return (
            <span
              key={index}
              className="inline-block rounded bg-amber-100 px-1 py-0.2 text-amber-900 underline decoration-amber-500 decoration-wavy cursor-help font-medium dark:bg-amber-900/40 dark:text-amber-200"
              title="识别不确定，可能是发音不清"
              data-testid="low-confidence-word"
            >
              {token}
            </span>
          )
        }
        return <span key={index}>{token}</span>
      })}
    </>
  )
}

type Props = {
  metrics: SpeechMetrics
  transcript?: string
  title?: string
  compact?: boolean
}

export default function SpeechMetricsCard({ metrics, transcript, title = '口语声学测量指标', compact = false }: Props) {
  const meta = INTELLIGIBILITY_META[metrics.intelligibility] ?? INTELLIGIBILITY_META['mostly-clear']

  return (
    <div
      data-testid="speech-metrics-card"
      className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/20"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2 dark:border-indigo-900/60">
        <span className="font-semibold text-indigo-950 dark:text-indigo-200">{title}</span>
        <span
          data-testid="intelligibility-badge"
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${meta.badgeClass}`}
        >
          清晰度：{meta.label}
        </span>
      </div>

      <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <div className="rounded-lg bg-white/80 p-2.5 shadow-sm dark:bg-white/[0.04]">
          <div className="text-gray-500 dark:text-gray-400">语速</div>
          <div className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-white" data-testid="metric-wpm">
            {metrics.wordsPerMinute} <span className="text-xs font-normal text-gray-500">词/分</span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">发音语速 {metrics.articulationRate} · 共 {metrics.wordCount} 词</div>
        </div>

        <div className="rounded-lg bg-white/80 p-2.5 shadow-sm dark:bg-white/[0.04]">
          <div className="text-gray-500 dark:text-gray-400">停顿</div>
          <div className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-white" data-testid="metric-pauses">
            {metrics.pauseCount} <span className="text-xs font-normal text-gray-500">次</span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            长停顿 {metrics.longPauseCount} 次 · 最长 {metrics.longestPauseSeconds}s
          </div>
        </div>

        <div className="rounded-lg bg-white/80 p-2.5 shadow-sm dark:bg-white/[0.04]">
          <div className="text-gray-500 dark:text-gray-400">填充词</div>
          <div className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-white" data-testid="metric-fillers">
            {metrics.fillerCount} <span className="text-xs font-normal text-gray-500">次</span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">语气停顿词（euh / hum 等）</div>
        </div>

        <div className="rounded-lg bg-white/80 p-2.5 shadow-sm dark:bg-white/[0.04]">
          <div className="text-gray-500 dark:text-gray-400">识别置信度</div>
          <div className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-white" data-testid="metric-confidence">
            {Math.round(metrics.meanConfidence * 100)}%
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">不确定词比例 {Math.round(metrics.lowConfidenceRatio * 100)}%</div>
        </div>
      </div>

      {transcript && (
        <div className="mt-3 rounded-lg bg-white/90 p-3 leading-relaxed text-gray-800 shadow-sm dark:bg-white/[0.04] dark:text-gray-200">
          <div className="mb-1 text-[11px] font-medium text-gray-500">转写文本（黄色波浪线为识别不确定词汇）：</div>
          <p data-testid="highlighted-transcript">{renderHighlightedTranscript(transcript, metrics.lowConfidenceWords)}</p>
        </div>
      )}

      {metrics.lowConfidenceWords.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300">
          <span className="font-medium">识别不确定词汇 (置信度 &lt; 60%)：</span>
          {metrics.lowConfidenceWords.map((item, idx) => (
            <span
              key={idx}
              className="inline-block rounded bg-amber-100/90 px-1.5 py-0.5 dark:bg-amber-900/50"
              title="识别不确定，可能是发音不清"
            >
              {item.word} ({Math.round(item.confidence * 100)}%)
            </span>
          ))}
        </div>
      )}

      {(metrics.pauseRatio >= 0.4 || metrics.longestPauseSeconds >= 5) && (
        <div
          data-testid="speech-unrecognised-gap-warning"
          className="mt-2.5 rounded bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          有较长时间未识别到语音，可能是停顿或发音未被识别
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-gray-500 dark:text-gray-400">
        💡 提示：清晰度基于语音识别置信度估算，作为口语清晰度参考，非音素级发音评分。
      </p>
    </div>
  )
}
