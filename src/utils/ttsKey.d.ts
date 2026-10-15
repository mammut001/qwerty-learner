export type TtsAccent = 'fr-CA' | 'fr-FR'

export declare const TTS_VERSION: string
export declare const TTS_VOICES: Record<TtsAccent, string>
export declare const DEFAULT_ACCENT: TtsAccent
export declare const TTS_BASE_URL: string

export declare function speakableText(name: string): string
export declare function computeTtsKey(voice: string, text: string): string
export declare function computeTtsObjectPath(accent: TtsAccent, key: string): string
export declare function computeTtsAudioUrl(base: string, accent: TtsAccent, key: string): string
