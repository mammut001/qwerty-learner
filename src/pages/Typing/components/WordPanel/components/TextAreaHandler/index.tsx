import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import type { FormEvent } from 'react'
import { useCallback, useContext, useEffect, useRef } from 'react'

export default function TextAreaHandler({
  updateInput,
  onInputConflict,
}: {
  updateInput: (updateObj: WordUpdateAction) => void
  onInputConflict: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  useEffect(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
    } else {
      textareaRef.current.blur()
    }
  }, [state.isTyping])

  const onInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent
    if (nativeEvent.isComposing) return
    // Ordinary typos are not extension conflicts. Report only evidence that a
    // plain insertText event was externally rewritten; not paste/composition.
    if (
      nativeEvent.inputType === 'insertText' &&
      typeof nativeEvent.data === 'string' &&
      e.currentTarget.value !== nativeEvent.data
    ) {
      e.currentTarget.value = ''
      onInputConflict()
      return
    }
    // Paste events may have null data; the textarea still contains the inserted text.
    const text = nativeEvent.data ?? e.currentTarget.value
    if (text) updateInput({ type: 'add', value: text, event: e })
    e.currentTarget.value = ''
  }

  const onBlur = useCallback(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
    }
  }, [state.isTyping])

  return (
    <textarea
      className="pointer-events-none absolute left-0 top-0 m-0 h-0 w-0 resize-none appearance-none overflow-hidden border-0 p-0 caret-transparent opacity-0 focus:outline-none"
      ref={textareaRef}
      autoFocus
      spellCheck="false"
      onInput={onInput}
      onBlur={onBlur}
    ></textarea>
  )
}
