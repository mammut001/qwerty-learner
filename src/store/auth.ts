import type { AuthStatus } from '@/services/auth'
import { atom } from 'jotai'

export const authStatusAtom = atom<AuthStatus | null>(null)
