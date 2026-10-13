import type { WordUpdateAction } from '../InputHandler'
import InputHandler from '../InputHandler'
import Letter from './Letter'
import Notation from './Notation'
import { TipAlert } from './TipAlert'
import style from './index.module.css'
import { initialWordState } from './type'
import type { WordState } from './type'
import Tooltip from '@/components/Tooltip'
import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { EXPLICIT_SPACE } from '@/constants'
import useKeySounds from '@/hooks/useKeySounds'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import {
  currentChapterAtom,
  currentDictInfoAtom,
  isIgnoreCaseAtom,
  isShowAnswerOnHoverAtom,
  isTextSelectableAtom,
  pronunciationIsOpenAtom,
  wordDictationConfigAtom,
} from '@/store'
import type { Word } from '@/typings'
import { CTRL, getUtcStringForMixpanel } from '@/utils'
import { useSaveWordRecord } from '@/utils/db'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useImmer } from 'use-immer'

const vowelLetters = 'AEIOU'
const frenchVowelLetters = 'AEIOUYŒÆ'

export default function WordComponent({ word, onFinish }: { word: Word; onFinish: () => void }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const [wordState, setWordState] = useImmer<WordState>(structuredClone(initialWordState))

  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const isIgnoreCase = useAtomValue(isIgnoreCaseAtom)
  const isShowAnswerOnHover = useAtomValue(isShowAnswerOnHoverAtom)
  const saveWordRecord = useSaveWordRecord()
  // const wordLogUploader = useMixPanelWordLogUploader(state)
  const [playKeySound, playBeepSound, playHintSound] = useKeySounds()
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)
  const [isHoveringWord, setIsHoveringWord] = useState(false)
  const currentLanguage = useAtomValue(currentDictInfoAtom).language
  const currentLanguageCategory = useAtomValue(currentDictInfoAtom).languageCategory
  const currentChapter = useAtomValue(currentChapterAtom)

  const [showTipAlert, setShowTipAlert] = useState(false)
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)

  useEffect(() => {
    // run only when word changes
    let headword = ''
    try {
      const name = currentLanguage === 'fr' ? word.name.normalize('NFC') : word.name
      headword = name.replace(new RegExp(' ', 'g'), EXPLICIT_SPACE)
      headword = headword.replace(new RegExp('…', 'g'), '..')
    } catch (e) {
      console.error('word.name is not a string', word)
      headword = ''
    }

    const newWordState = structuredClone(initialWordState)
    newWordState.displayWord = headword
    newWordState.letterStates = new Array(headword.length).fill('normal')
    newWordState.startTime = getUtcStringForMixpanel()
    newWordState.randomLetterVisible = headword.split('').map(() => Math.random() > 0.4)
    setWordState(newWordState)
  }, [word, currentLanguage, setWordState])

  const updateInput = useCallback(
    (updateAction: WordUpdateAction) => {
      switch (updateAction.type) {
        case 'add':
          if (wordState.hasWrong) return

          if (updateAction.value.includes(' ')) updateAction.event?.preventDefault()
          setWordState((draft) => {
            const value = currentLanguage === 'fr' ? updateAction.value.normalize('NFC') : updateAction.value
            draft.inputWord += value.replace(/ /g, EXPLICIT_SPACE)
          })
          break

        default:
          console.warn('unknown update type', updateAction)
      }
    },
    [wordState.hasWrong, currentLanguage, setWordState],
  )

  const handleHoverWord = useCallback((checked: boolean) => {
    setIsHoveringWord(checked)
  }, [])

  useHotkeys(
    'tab',
    () => {
      handleHoverWord(true)
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys(
    'tab',
    () => {
      handleHoverWord(false)
    },
    { enableOnFormTags: true, keyup: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+j',
    () => {
      if (state.isTyping) {
        wordPronunciationIconRef.current?.play()
      }
    },
    [state.isTyping],
    { enableOnFormTags: true, preventDefault: true },
  )

  useEffect(() => {
    if (wordState.inputWord.length === 0 && state.isTyping) {
      wordPronunciationIconRef.current?.play && wordPronunciationIconRef.current?.play()
    }
  }, [state.isTyping, wordState.inputWord.length, wordPronunciationIconRef.current?.play])

  const getLetterVisible = useCallback(
    (index: number) => {
      if (wordState.letterStates[index] === 'correct' || (isShowAnswerOnHover && isHoveringWord)) return true

      if (wordDictationConfig.isOpen) {
        if (wordDictationConfig.type === 'hideAll') return false

        const letter = wordState.displayWord[index]
        const isVowel =
          currentLanguage === 'fr'
            ? frenchVowelLetters.includes(
                letter
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toUpperCase(),
              )
            : vowelLetters.includes(letter.toUpperCase())
        if (wordDictationConfig.type === 'hideVowel') {
          return !isVowel
        }
        if (wordDictationConfig.type === 'hideConsonant') {
          return isVowel
        }
        if (wordDictationConfig.type === 'randomHide') {
          return wordState.randomLetterVisible[index]
        }
      }
      return true
    },
    [
      currentLanguage,
      isHoveringWord,
      isShowAnswerOnHover,
      wordDictationConfig.isOpen,
      wordDictationConfig.type,
      wordState.displayWord,
      wordState.letterStates,
      wordState.randomLetterVisible,
    ],
  )

  useEffect(() => {
    const inputLength = wordState.inputWord.length
    if (wordState.hasWrong || inputLength === 0 || wordState.displayWord.length === 0) {
      return
    }

    const start = wordState.letterStates.findIndex((letter) => letter !== 'correct')
    if (start < 0 || wordState.isFinished) return
    const end = Math.min(inputLength, wordState.displayWord.length)
    let errorIndex = -1
    for (let index = start; index < end; index += 1) {
      const input = wordState.inputWord[index]
      const expected = wordState.displayWord[index]
      const sameFrenchApostrophe = currentLanguage === 'fr' && /['’]/.test(input) && /['’]/.test(expected)
      if (!sameFrenchApostrophe && (isIgnoreCase ? input.toLowerCase() !== expected.toLowerCase() : input !== expected)) {
        errorIndex = index
        break
      }
    }
    // An oversized batch must not turn an incorrect pasted word into a successful answer.
    const overflow = errorIndex < 0 && inputLength > wordState.displayWord.length
    if (overflow) errorIndex = end - 1
    const correctEnd = errorIndex < 0 ? end : errorIndex
    const correctCount = Math.max(0, correctEnd - start)
    const finished = errorIndex < 0 && end === wordState.displayWord.length
    const inputChar = overflow ? wordState.inputWord[end] : errorIndex >= 0 ? wordState.inputWord[errorIndex] : ''

    setWordState((draft) => {
      for (let index = start; index < correctEnd; index += 1) {
        draft.letterStates[index] = 'correct'
        draft.letterTimeArray.push(Date.now())
      }
      draft.correctCount += correctCount
      if (errorIndex >= 0) {
        draft.letterStates[errorIndex] = 'wrong'
        draft.hasWrong = true
        draft.hasMadeInputWrong = true
        draft.wrongCount += 1
        draft.letterTimeArray = []
        draft.letterMistake[errorIndex] = [...(draft.letterMistake[errorIndex] ?? []), inputChar]
      } else if (finished) {
        draft.isFinished = true
        draft.endTime = getUtcStringForMixpanel()
      }
    })

    for (let index = 0; index < correctCount; index += 1) {
      dispatch({ type: TypingStateActionType.REPORT_CORRECT_WORD })
    }
    if (errorIndex >= 0) {
      playBeepSound()
      dispatch({
        type: TypingStateActionType.REPORT_WRONG_WORD,
        payload: { letterMistake: { [errorIndex]: [inputChar] } },
      })
      if (currentChapter === 0 && state.chapterData.index === 0 && wordState.wrongCount >= 3) {
        setShowTipAlert(true)
      }
    } else if (finished) {
      playHintSound()
    } else {
      playKeySound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.inputWord])

  useEffect(() => {
    if (wordState.hasWrong) {
      const timer = setTimeout(() => {
        setWordState((state) => {
          state.inputWord = ''
          state.letterStates = new Array(state.letterStates.length).fill('normal')
          state.hasWrong = false
        })
      }, 300)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [wordState.hasWrong, setWordState])

  useEffect(() => {
    if (wordState.isFinished) {
      dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: true })

      // wordLogUploader({
      //   headword: word.name,
      //   timeStart: wordState.startTime,
      //   timeEnd: wordState.endTime,
      //   countInput: wordState.correctCount + wordState.wrongCount,
      //   countCorrect: wordState.correctCount,
      //   countTypo: wordState.wrongCount,
      // })
      saveWordRecord({
        word: word.name,
        wrongCount: wordState.wrongCount,
        letterTimeArray: wordState.letterTimeArray,
        letterMistake: wordState.letterMistake,
      })

      onFinish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordState.isFinished])

  useEffect(() => {
    if (wordState.wrongCount >= 4) {
      dispatch({ type: TypingStateActionType.SET_IS_SKIP, payload: true })
    }
  }, [wordState.wrongCount, dispatch])

  return (
    <>
      <InputHandler updateInput={updateInput} />
      <div
        lang={currentLanguageCategory !== 'code' ? currentLanguageCategory : 'en'}
        className="flex flex-col items-center justify-center pb-1 pt-4"
      >
        {['romaji', 'hapin'].includes(currentLanguage) && word.notation && <Notation notation={word.notation} />}
        <div
          className={`tooltip-info relative w-fit bg-transparent p-0 leading-normal shadow-none dark:bg-transparent ${
            wordDictationConfig.isOpen ? 'tooltip' : ''
          }`}
          data-tip="按 Tab 快捷键显示完整单词"
        >
          <div
            onMouseEnter={() => handleHoverWord(true)}
            onMouseLeave={() => handleHoverWord(false)}
            className={`flex items-center ${isTextSelectable && 'select-all'} justify-center ${wordState.hasWrong ? style.wrong : ''}`}
          >
            {wordState.displayWord.split('').map((t, index) => {
              return <Letter key={`${index}-${t}`} letter={t} visible={getLetterVisible(index)} state={wordState.letterStates[index]} />
            })}
          </div>
          {pronunciationIsOpen && (
            <div className="absolute -right-12 top-1/2 h-9 w-9 -translate-y-1/2 transform ">
              <Tooltip content={`快捷键${CTRL} + J`}>
                <WordPronunciationIcon word={word} lang={currentLanguage} ref={wordPronunciationIconRef} className="h-full w-full" />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      {currentLanguage === 'fr' && state.isTyping && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <span className="mr-1 text-xs text-gray-400">法语字符</span>
          {['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'ô', 'ö', 'î', 'ï', 'ç', 'œ', 'æ'].map((char) => (
            <button
              key={char}
              type="button"
              className="min-w-8 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600 transition hover:bg-indigo-100 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onMouseDown={(event) => {
                event.preventDefault()
                updateInput({ type: 'add', value: char })
              }}
              aria-label={`输入法语字符 ${char}`}
            >
              {char}
            </button>
          ))}
        </div>
      )}
      <TipAlert className="fixed bottom-10 right-3" show={showTipAlert} setShow={setShowTipAlert} />
    </>
  )
}
