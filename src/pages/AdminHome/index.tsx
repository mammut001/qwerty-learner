import Layout from '@/components/Layout'
import { NavLink } from 'react-router-dom'

export default function AdminHomePage() {
  return (
    <Layout>
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">管理员控制台</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">仅持有有效管理员令牌的用户可以访问。</p>
        <nav aria-label="管理员导航" className="mt-6 flex flex-wrap gap-3">
          <NavLink className="ui-btn-secondary px-4 py-2" to="/admin/placement">定级看板</NavLink>
          <NavLink className="ui-btn-secondary px-4 py-2" to="/admin/users">用户管理</NavLink>
          <NavLink className="ui-btn-secondary px-4 py-2" to="/admin/recalls">机经审核</NavLink>
        </nav>
      </section>
    </Layout>
  )
}
