import logo from '@/assets/logo.svg'
import { Menu, Transition } from '@headlessui/react'
import type { PropsWithChildren } from 'react'
import type React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconMenu from '~icons/tabler/menu-2'
import IconX from '~icons/tabler/x'

const navItems = [
  { to: '/study-plan', label: '学习计划' },
  { to: '/typing', label: '单词跟打' },
  { to: '/word-lists', label: '我的词表' },
  { to: '/grammar-session', label: '语法' },
  { to: '/conjugation', label: '动词变位' },
  { to: '/error-book', label: '错题本' },
  { to: '/analysis', label: '统计' },
]

const examItems = [
  { to: '/tcf-listening', label: '听力', code: 'CO', detail: '35 分钟 · 39 题' },
  { to: '/tcf-reading', label: '阅读', code: 'CE', detail: '60 分钟 · 39 题' },
  { to: '/tcf-writing', label: '写作', code: 'EE', detail: '60 分钟 · 3 任务' },
  { to: '/tcf-speaking', label: '口语', code: 'EO', detail: '12 分钟 · 3 任务' },
]

const navItemClass = (isActive: boolean) =>
  `flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-colors duration-200 hover:no-underline focus:outline-none ${
    isActive
      ? 'bg-indigo-500 text-white'
      : 'text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
  }`

const Header: React.FC<PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation()
  const isExamActive = examItems.some((item) => pathname.startsWith(item.to))
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="container z-20 mx-auto w-full px-4 py-4 sm:px-10">
      <div className="flex w-full items-center justify-between gap-3">
        <NavLink className="flex shrink-0 items-center whitespace-nowrap text-indigo-500 no-underline hover:no-underline" to="/study-plan">
          <img src={logo} className="mr-3 h-9 w-9 sm:h-11 sm:w-11" alt="Qwerty Français Logo" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7 sm:text-2xl">Qwerty Français</h1>
            <span className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">TCF Canada</span>
          </div>
        </NavLink>
        <button
          type="button"
          className="rounded-lg p-2 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
          aria-label={menuOpen ? '收起导航' : '展开导航'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((old) => !old)}
        >
          {menuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
        <nav className="hidden items-center justify-end gap-1 lg:flex" aria-label="主导航">
          {navItems.slice(0, 3).map((item) => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => navItemClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
          <Menu as="div" className="relative">
            <Menu.Button
              className={navItemClass(isExamActive)}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === ' ') event.preventDefault()
              }}
            >
              TCF 模考
              <IconChevronDown className="h-4 w-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 -translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Menu.Items className="absolute left-1/2 z-30 mt-2 w-56 -translate-x-1/2 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/10">
                {examItems.map((item) => (
                  <Menu.Item key={item.to}>
                    {({ active }) => (
                      <NavLink
                        to={item.to}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm no-underline hover:no-underline ${
                          active || pathname.startsWith(item.to)
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <span className="font-medium">
                          {item.label}
                          <span className="ml-1.5 text-xs font-normal text-gray-400">{item.code}</span>
                        </span>
                        <span className="text-xs text-gray-400">{item.detail}</span>
                      </NavLink>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
          {navItems.slice(3).map((item) => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => navItemClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="主导航"
          className="my-card mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-white p-2 dark:bg-gray-800 sm:grid-cols-3 lg:hidden"
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `${navItemClass(isActive)} justify-center py-2.5`}>
              {item.label}
            </NavLink>
          ))}
          {examItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${navItemClass(isActive)} justify-center py-2.5`}>
              模考 · {item.label}
              <span className="text-xs opacity-70">{item.code}</span>
            </NavLink>
          ))}
        </nav>
      )}
      {children && (
        <div className="mt-3 flex justify-center lg:justify-end">
          <div className="my-card flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 transition-colors duration-300 dark:bg-gray-800">
            {children}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
