import { TypingContext, TypingStateActionType } from '../../store'
import Tooltip from '@/components/Tooltip'
import { randomConfigAtom } from '@/store'
import { autoUpdate, offset, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export default function StartButton({ isLoading }: { isLoading: boolean }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const randomConfig = useAtomValue(randomConfigAtom)

  // Keep a start request made while the chapter is still loading. The toolbar
  // mounts before the async word list arrives, so ignoring Enter here leaves
  // the practice input unfocused even after the chapter appears.
  const pendingStart = useRef(false)
  const onToggleIsTyping = useCallback(() => {
    if (isLoading) {
      pendingStart.current = true
      return
    }
    pendingStart.current = false
    dispatch({ type: TypingStateActionType.TOGGLE_IS_TYPING })
  }, [isLoading, dispatch])

  useEffect(() => {
    if (isLoading || !pendingStart.current) return
    pendingStart.current = false
    if (!state.isFinished && !state.isTyping) {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: true })
    }
  }, [isLoading, state.isFinished, state.isTyping, dispatch])

  const onClickRestart = useCallback(() => {
    dispatch({ type: TypingStateActionType.REPEAT_CHAPTER, shouldShuffle: randomConfig.isOpen })
  }, [dispatch, randomConfig.isOpen])

  useHotkeys(
    'enter',
    onToggleIsTyping,
    {
      enabled: !state.isFinished,
      enableOnFormTags: true,
      preventDefault: true,
      ignoreEventWhen: (event) => event.target instanceof Element && Boolean(event.target.closest('button, a, [role="button"]')),
    },
    [onToggleIsTyping],
  )

  const [isShowReStartButton, setIsShowReStartButton] = useState(false)
  const { refs, context } = useFloating({
    open: isShowReStartButton,
    onOpenChange: setIsShowReStartButton,
    whileElementsMounted: autoUpdate,
    middleware: [offset(5)],
  })
  const hoverButton = useHover(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hoverButton])

  return (
    <Tooltip content={`${state.isTyping ? '暂停' : '开始'} （Enter）`} className="box-content h-7 w-8 px-6 py-1">
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`${
          state.isTyping
            ? 'bg-gray-400 shadow-gray-200 dark:bg-gray-600  dark:shadow-none'
            : 'bg-indigo-600 shadow-indigo-300 dark:shadow-indigo-500/60'
        } ${
          isShowReStartButton ? 'h-20' : 'h-auto'
        } flex-column absolute left-0 top-0 w-20 rounded-lg shadow-lg transition-colors duration-200`}
      >
        <button
          className={`${
            state.isTyping ? 'bg-gray-400  dark:bg-gray-700 dark:hover:bg-gray-500' : 'bg-indigo-600'
          } my-btn-primary w-20 whitespace-nowrap px-0 shadow`}
          type="button"
          onClick={onToggleIsTyping}
          aria-label={state.isTyping ? '暂停' : '开始'}
        >
          <span className="font-medium">{state.isTyping ? '暂停' : '开始'}</span>
        </button>
        {isShowReStartButton && (
          <div className="absolute bottom-0 flex w-20 justify-center" ref={refs.setFloating} {...getFloatingProps()}>
            <button
              className={`${
                state.isTyping ? 'bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 ' : 'bg-indigo-600 '
              } my-btn-primary mb-1 mt-1 w-18 whitespace-nowrap px-0 transition-colors duration-200`}
              type="button"
              onClick={onClickRestart}
              aria-label={'重新开始'}
            >
              重来
            </button>
          </div>
        )}
      </div>
    </Tooltip>
  )
}
