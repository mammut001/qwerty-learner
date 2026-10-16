import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectInstallHint } from './installHint'

const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36'
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const WECHAT_IOS = `${IPHONE_SAFARI} MicroMessenger/8.0.49(0x18003131) NetType/WIFI Language/zh_CN`
const XHS_ANDROID = `${ANDROID_CHROME} xhsdiscover`
const DESKTOP_CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

const mobile = { standalone: false, canInstall: false, isMobile: true }

test('Android Chrome with a pending install prompt gets the one-tap prompt', () => {
  assert.equal(detectInstallHint(ANDROID_CHROME, { ...mobile, canInstall: true }), 'android-prompt')
})

test('iPhone Safari gets the manual share-sheet steps', () => {
  assert.equal(detectInstallHint(IPHONE_SAFARI, mobile), 'ios-safari')
})

test('WeChat and Xiaohongshu in-app browsers are told to open in a real browser', () => {
  assert.equal(detectInstallHint(WECHAT_IOS, mobile), 'in-app')
  assert.equal(detectInstallHint(XHS_ANDROID, { ...mobile, canInstall: true }), 'in-app')
})

test('an already installed app shows no hint', () => {
  assert.equal(detectInstallHint(IPHONE_SAFARI, { ...mobile, standalone: true }), null)
  assert.equal(detectInstallHint(ANDROID_CHROME, { ...mobile, standalone: true, canInstall: true }), null)
})

test('desktop and wide viewports show no hint', () => {
  assert.equal(detectInstallHint(DESKTOP_CHROME, { ...mobile, isMobile: false, canInstall: true }), null)
  assert.equal(detectInstallHint(IPHONE_SAFARI, { ...mobile, isMobile: false }), null)
})

test('unknown mobile browsers without an install prompt show no hint', () => {
  assert.equal(detectInstallHint(ANDROID_CHROME, mobile), null)
})
