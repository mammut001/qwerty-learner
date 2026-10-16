import { isAnalyticsEnabled } from '@/utils/analytics'
import type React from 'react'
import { useState } from 'react'
import IconGithub from '~icons/simple-icons/github'

const Footer: React.FC = () => {
  const showAnalyticsNotice = isAnalyticsEnabled()
  const [noticesOpen, setNoticesOpen] = useState(false)

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
        <button
          type="button"
          onClick={() => setNoticesOpen((open) => !open)}
          aria-expanded={noticesOpen}
          aria-controls="footer-notices"
          className="cursor-pointer whitespace-nowrap bg-transparent p-0 font-[inherit] text-xs text-[inherit] hover:text-indigo-500"
        >
          TCF Canada 法语备考
        </button>
      </div>
      <div id="footer-notices" hidden={!noticesOpen} className="flex w-full flex-col items-center gap-1.5">
        <p className="max-w-2xl text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          词库和题目尚未经法语母语者逐条校对，发现错误欢迎通过页面上的「报告问题」告诉我们。
        </p>
        <p className="max-w-2xl text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          离线词典数据来自{' '}
          <a href="https://en.wiktionary.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500">
            英文
          </a>
          ／
          <a href="https://zh.wiktionary.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500">
            中文
          </a>
          ／
          <a href="https://fr.wiktionary.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500">
            法文维基词典
          </a>
          ，由{' '}
          <a href="https://kaikki.org" target="_blank" rel="noreferrer" className="hover:text-indigo-500">
            Kaikki / Wiktextract
          </a>{' '}
          提取，按{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="hover:text-indigo-500">
            CC BY-SA 4.0
          </a>{' '}
          分享。部分发音来自 Lingua Libre / Wikimedia Commons 的真人录音（CC BY-SA）。{' '}
          <a
            href="https://github.com/mammut001/qwerty-learner/blob/master/public/lexicon/LICENSE.md"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-500"
          >
            数据来源与修改说明
          </a>
        </p>
        {showAnalyticsNotice && (
          <p
            className="max-w-2xl text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500"
            data-testid="analytics-privacy-notice"
          >
            本站使用自托管的 Umami 统计访问情况（页面、停留时间、大致地区、设备类型），不使用
            Cookie，不记录姓名、邮箱或答题内容，数据保存在本站服务器，不提供给第三方。浏览器开启&ldquo;请勿跟踪&rdquo;时不统计。
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 whitespace-nowrap">
          <a
            href="https://github.com/RealKai42/qwerty-learner"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-500"
          >
            基于 Qwerty Learner
          </a>
          <span className="select-none rounded bg-slate-200 px-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Build <span className="select-all">{LATEST_COMMIT_HASH}</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
