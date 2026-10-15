// Path mapping for the self-hosted pronunciation mirror.
// The sync script (scripts/sync-voice-mirror.mjs) writes files to disk using these paths,
// and the client builds same-origin URLs from them under VOICE_MIRROR_PATH.
// Pure JS with no dependencies so it runs identically in Node and the browser.

export const VOICE_MIRROR_PATH = '/voice-audio'

/**
 * Relative path of a TTS clip, same layout as the GCS bucket.
 * @param {string} accent e.g. 'fr-CA' or 'fr-FR'
 * @param {string} key 16-hex TTS key
 * @returns {string} `v1/<accent>/<key>.mp3`
 */
export function mirrorTtsPath(accent, key) {
  return `v1/${accent}/${key}.mp3`
}

/**
 * File name for a Lingua Libre override: the URL-decoded last path segment of the audio URL.
 * @param {string | null | undefined} audioUrl
 * @returns {string | null}
 */
export function mirrorOverrideFileName(audioUrl) {
  if (!audioUrl) return null
  const withoutQuery = String(audioUrl).split(/[?#]/)[0]
  const segments = withoutQuery.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  if (!last) return null
  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}

/**
 * URL-safe relative path of a Lingua Libre override, for building a URL.
 * @param {string | null | undefined} audioUrl
 * @returns {string | null} `ll/<encodeURIComponent(fileName)>`
 */
export function mirrorOverridePath(audioUrl) {
  const fileName = mirrorOverrideFileName(audioUrl)
  if (!fileName) return null
  return `ll/${encodeURIComponent(fileName)}`
}
