/// <reference types="vite/client" />
declare const REACT_APP_DEPLOY_ENV: string
declare const LATEST_COMMIT_HASH: string

interface ImportMetaEnv {
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_UMAMI_WEBSITE_ID?: string
  readonly VITE_STUDY_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
