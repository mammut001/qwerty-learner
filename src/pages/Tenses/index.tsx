import React from 'react'
import { useParams, NavLink } from 'react-router-dom'
import Layout from '@/components/Layout'
import { getLessonById } from '@/resources/tenses/data'
import TensesOverview from './TensesOverview'
import TenseLessonDetail from './TenseLessonDetail'
import IconArrowLeft from '~icons/tabler/arrow-left'

export default function TensesPage() {
  const { lessonId } = useParams<{ lessonId?: string }>()

  const lesson = lessonId ? getLessonById(lessonId) : undefined

  return (
    <Layout>
      <div className="w-full max-w-7xl px-4 py-6 sm:px-8 space-y-6">
        {lessonId ? (
          lesson ? (
            <TenseLessonDetail lesson={lesson} />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs dark:border-gray-800 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                未找到指定的时态专题
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                该时态 ID「{lessonId}」不存在或链接已失效。
              </p>
              <div className="mt-5">
                <NavLink
                  to="/tenses"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                >
                  <IconArrowLeft className="h-4 w-4" /> 返回时态专题总览
                </NavLink>
              </div>
            </div>
          )
        ) : (
          <TensesOverview />
        )}
      </div>
    </Layout>
  )
}
