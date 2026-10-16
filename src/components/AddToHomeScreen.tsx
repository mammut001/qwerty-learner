import { type InstallHintKind, detectInstallHint } from '@/utils/installHint'
import { getPwaInstallState, installStudyPwa, subscribePwaInstallState } from '@/services/pwa'
import { useEffect, useState } from 'react'
import IconDots from '~icons/tabler/dots'
import IconShare from '~icons/tabler/share'
import IconSquarePlus from '~icons/tabler/square-plus'

const DISMISS_KEY = 'qf-add-to-home-dismissed-at'
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000
const PHONE_QUERY = '(max-width: 640px)'

function isDismissed() {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY))
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_MS
  } catch {
    return false
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // Storage may be blocked (private mode); the card will simply show again next visit.
  }
}

function isStandalone() {
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

/** Dismissible card asking phone visitors to add the site to their home screen. */
export default function AddToHomeScreen() {
  const [canInstall, setCanInstall] = useState(() => getPwaInstallState().canInstall)
  const [hidden, setHidden] = useState(() => isDismissed())
  const [message, setMessage] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(PHONE_QUERY).matches)
  const [standalone, setStandalone] = useState(() => isStandalone())

  useEffect(() => {
    const unsubscribe = subscribePwaInstallState((next) => setCanInstall(next.canInstall))
    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY)
    const onChange = () => setIsMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onInstalled = () => setStandalone(true)
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  const hint: InstallHintKind | null = detectInstallHint(window.navigator.userAgent, { standalone, canInstall, isMobile })
  if (hidden || !hint) return null

  const dismiss = () => {
    rememberDismissal()
    setHidden(true)
  }

  const install = async () => {
    const accepted = await installStudyPwa()
    if (accepted) {
      setStandalone(true)
    } else {
      setMessage('当前浏览器暂未提供安装提示，可以用上面的方法手动添加。')
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/30">
      <h2 className="font-semibold text-gray-900 dark:text-white">把 Qwerty Français 放到手机桌面</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">像 App 一样一键打开，每天刷一章。</p>

      {hint === 'android-prompt' && (
        <button type="button" onClick={install} className="ui-btn-primary mt-3 h-11 w-full">
          添加到主屏幕
        </button>
      )}

      {hint === 'ios-safari' && (
        <ol className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 dark:bg-white/10 dark:text-indigo-300">
              <IconShare className="h-4 w-4" aria-hidden />
            </span>
            <span>1. 点底部的「分享」按钮</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 dark:bg-white/10 dark:text-indigo-300">
              <IconSquarePlus className="h-4 w-4" aria-hidden />
            </span>
            <span>2. 选择「添加到主屏幕」</span>
          </li>
        </ol>
      )}

      {hint === 'in-app' && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
          <IconDots className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          <span>请先点右上角 ··· 选择「在浏览器打开」，再添加到主屏幕。</span>
        </p>
      )}

      {message && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{message}</p>}

      <div className="mt-3 text-right">
        <button
          type="button"
          onClick={dismiss}
          className="text-sm text-gray-500 underline-offset-4 hover:underline dark:text-gray-400"
        >
          以后再说
        </button>
      </div>
    </section>
  )
}
