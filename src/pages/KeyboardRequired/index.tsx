import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { NavLink } from 'react-router-dom'
import IconKeyboard from '~icons/tabler/keyboard'

const alternatives = [
  { to: '/study-plan', label: '学习计划', detail: '今日任务与 26 周路线' },
  { to: '/tcf-reading', label: '阅读模考', detail: '39 题 · 60 分钟' },
  { to: '/tcf-listening', label: '听力模考', detail: '39 题 · 35 分钟' },
  { to: '/grammar-session', label: '语法专题', detail: '5 个专题 · 先选再解释' },
  { to: '/conjugation', label: '动词变位', detail: '30 个核心动词' },
  { to: '/error-book', label: '错题本', detail: '词汇 · 语法 · 变位' },
]

// Typing practice needs a physical keyboard, so small screens get pointed at what does work on a phone.
export default function KeyboardRequiredPage() {
  return (
    <Layout>
      <Header />
      <main className="w-full flex-1 overflow-y-auto px-4 pb-6">
        <section className="my-card mx-auto max-w-md rounded-3xl bg-white p-6 dark:bg-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50">
            <IconKeyboard className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">单词跟打需要键盘</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            跟打练习和词库选择是为实体键盘设计的。请在电脑上打开，或给平板接上键盘并把窗口拉宽。手机上可以先做下面这些：
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {alternatives.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-gray-200 p-4 no-underline transition hover:border-indigo-300 hover:no-underline dark:border-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.detail}</div>
              </NavLink>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  )
}
