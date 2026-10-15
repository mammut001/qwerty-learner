import Layout from '@/components/Layout'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Layout>
      <section data-testid="not-found-page" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-6xl font-bold text-indigo-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">页面不存在</h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">链接可能已失效，请检查地址，或返回首页继续学习。</p>
        <Link to="/" className="ui-btn-primary mt-6 px-5 py-2">返回首页</Link>
      </section>
    </Layout>
  )
}
