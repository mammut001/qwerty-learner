import { LookupContext } from './lookupContext'
import { Fragment, useContext, useEffect, useId, useMemo } from 'react'

const WORD = /([A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+)*)/

/** French text split into words that open the shared dictionary popover. */
export default function FrenchWords({ text, className, lang }: { text: string; className?: string; lang?: string }) {
  const tokens = useMemo(() => text.split(WORD), [text])
  const ownerId = useId()
  const lookup = useContext(LookupContext)
  const active = lookup?.active ?? null
  const inPopover = lookup?.inPopover ?? false
  const dismissIfOwner = lookup?.dismissIfOwner
  const open = lookup?.open

  useEffect(() => {
    // Depend on the stable dismiss function, not the context object. The object changes
    // whenever the open word changes, and a cleanup then would close the popover we just opened.
    if (!dismissIfOwner || inPopover) return
    return () => dismissIfOwner(ownerId)
  }, [text, ownerId, inPopover, dismissIfOwner])

  return (
    <span className={className} lang={lang}>
      {tokens.map((token, index) =>
        index % 2 === 1 ? (
          <button
            key={index}
            type="button"
            aria-expanded={active === token}
            onClick={(event) => open?.(token, event.currentTarget, inPopover ? null : ownerId)}
            className={`cursor-pointer rounded text-inherit decoration-indigo-300 decoration-dotted underline-offset-4 hover:bg-indigo-100 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-indigo-900/50 ${
              active === token ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''
            }`}
          >
            {token}
          </button>
        ) : (
          <Fragment key={index}>{token}</Fragment>
        ),
      )}
    </span>
  )
}
