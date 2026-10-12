import type React from 'react'
import IconGithub from '~icons/simple-icons/github'
import { isAnalyticsEnabled } from '@/utils/analytics'

const Footer: React.FC = () => {
  const showAnalyticsNotice = isAnalyticsEnabled()

  return (
    <footer className="mb-2 mt-4 flex w-full shrink-0 flex-col items-center justify-center gap-1.5 px-4 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex flex-wrap items-center justify-center gap-3 whitespace-nowrap">
        <a
          href="https://github.com/mammut001/qwerty-learner"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-indigo-500"
          aria-label="打开本项目 GitHub 仓库"
        >
          <IconGithub fontSize={14} />
          <span>Qwerty Français</span>
        </a>
        <span>·</span>
        <span>TCF Canada 法语备考</span>
        <span className="hidden sm:inline">·</span>
        <a
          href="https://github.com/RealKai42/qwerty-learner"
          target="_blank"
          rel="noreferrer"
          className="hidden hover:text-indigo-500 sm:inline"
        >
          基于 Qwerty Learner
        </a>
        <span className="hidden select-none rounded bg-slate-200 px-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:inline">
          Build <span className="select-all">{LATEST_COMMIT_HASH}</span>
        </span>
      </div>
      {showAnalyticsNotice && (
        <p className="max-w-2xl text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500" data-testid="analytics-privacy-notice">
          本站使用自托管的 Umami 统计访问情况（页面、停留时间、大致地区、设备类型），不使用 Cookie，不记录姓名、邮箱或答题内容，数据保存在本站服务器，不提供给第三方。浏览器开启&ldquo;请勿跟踪&rdquo;时不统计。
        </p>
      )}
    </footer>
  )
}

export default Footer
