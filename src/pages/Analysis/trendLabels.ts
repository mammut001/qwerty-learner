export type TrendLabelScale = 'daily' | 'weekly' | 'monthly'

/**
 * Category-axis label for a trend bucket. `startDate` is the bucket's first day as 'YYYY-MM-DD'
 * (monthly buckets: 'YYYY-MM-01'). Works on the string itself, so no Date/timezone parsing is involved.
 */
export const trendCategoryLabel = (scale: TrendLabelScale, startDate: string): string => {
  const [year, month, day] = startDate.split('-')
  if (scale === 'monthly') return `${year}-${month}`
  if (scale === 'weekly') return `${month}/${day} 周`
  return `${month}/${day}`
}
