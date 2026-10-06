import type React from 'react'
import IconGithub from '~icons/simple-icons/github'

const Footer: React.FC = () => {
  return (
    <footer className="mb-1 mt-3 flex w-full shrink-0 items-center justify-center gap-3 whitespace-nowrap px-4 text-xs text-gray-500 dark:text-gray-400">
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
    </footer>
  )
}

export default Footer
