export type InstallHintKind = 'android-prompt' | 'ios-safari' | 'in-app'

export interface InstallHintContext {
  /** Already running as an installed app (display-mode standalone or iOS navigator.standalone). */
  standalone: boolean
  /** The browser has offered an install prompt that can be triggered from the page. */
  canInstall: boolean
  /** Narrow, phone-sized viewport. */
  isMobile: boolean
}

const IN_APP_BROWSER = /MicroMessenger|xhsdiscover|XiaoHongShu|Weibo|QQ\//i
const IOS_DEVICE = /iPhone|iPad|iPod/i

/**
 * Decides which "add to home screen" hint, if any, a visitor should see.
 * Returns null on desktop, when already installed, or when no hint applies.
 */
export function detectInstallHint(ua: string, { standalone, canInstall, isMobile }: InstallHintContext): InstallHintKind | null {
  if (standalone || !isMobile) return null
  // In-app browsers never offer an install prompt, so check them before anything else.
  if (IN_APP_BROWSER.test(ua)) return 'in-app'
  if (canInstall) return 'android-prompt'
  if (IOS_DEVICE.test(ua)) return 'ios-safari'
  return null
}
