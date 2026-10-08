import type { ReactNode } from 'react'

/** Controls that used to sit in the sticky header. They stay in the page so that bar's height does not change. */
export default function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto flex w-full justify-center px-4 pt-3 sm:px-10 lg:justify-end">
      <div className="my-card relative flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 whitespace-nowrap rounded-2xl bg-white/90 px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 dark:bg-gray-900/80">
        {children}
      </div>
    </div>
  )
}
