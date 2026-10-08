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
  { to: '/placement-test', label: '定级测试' },
  { to: '/levels', label: '等级课程' },
  { to: '/typing', label: '单词跟打' },
  { to: '/word-lists', label: '我的词表' },
  { to: '/dictionary', label: '查词' },
  { to: '/grammar-session', label: '语法' },
  { to: '/conjugation', label: '动词变位' },
  { to: '/error-book', label: '错题本' },
  { to: '/analysis', label: '统计' },
]

const examItems = [
  { to: '/tcf', label: '总览', code: 'NCLC 7', detail: '四项差距' },
  { to: '/tcf-listening', label: '听力', code: 'CO', detail: '35 分钟 · 39 题' },
  { to: '/tcf-reading', label: '阅读', code: 'CE', detail: '60 分钟 · 39 题' },
  { to: '/tcf-writing', label: '写作', code: 'EE', detail: '60 分钟 · 3 任务' },
  { to: '/tcf-speaking', label: '口语', code: 'EO', detail: '12 分钟 · 3 任务' },
  { to: '/echelle', label: '能力量表', code: 'EQ', detail: '魁北克 12 级 · 对照 NCLC' },
]

const navItemClass = (isActive: boolean) =>
  `flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium no-underline transition-all duration-200 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
    isActive
      ? 'bg-white text-indigo-700 shadow-[0_1px_2px_rgba(17,24,39,0.08),0_0_0_1px_rgba(99,102,241,0.14)] dark:bg-white/10 dark:text-white dark:shadow-none'
      : 'text-gray-600 hover:bg-white/70 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
  }`

const Header: React.FC<PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation()
  const isExamActive = pathname.startsWith('/tcf') || pathname.startsWith('/echelle')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="container z-20 mx-auto w-full px-4 py-4 sm:px-10">
      <div className="flex w-full items-center justify-between gap-3">
        <NavLink className="group flex shrink-0 items-center gap-3 whitespace-nowrap no-underline hover:no-underline" to="/study-plan">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_1px_2px_rgba(17,24,39,0.06),0_0_0_1px_rgba(17,24,39,0.05),0_8px_20px_-8px_rgba(79,70,229,0.45)] transition-transform duration-200 group-hover:-translate-y-px dark:bg-white/[0.06] dark:shadow-none dark:ring-1 dark:ring-white/10 sm:h-11 sm:w-11">
            <img src={logo} className="h-7 w-7 sm:h-8 sm:w-8" alt="Qwerty Français Logo" />
          </span>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-6 tracking-tight text-gray-950 dark:text-white sm:text-xl">
              Qwerty{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-300 dark:to-violet-300">
                Français
              </span>
            </h1>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              TCF Canada · Studio
            </span>
          </div>
        </NavLink>
        <button
          type="button"
          className="rounded-full p-2 text-gray-600 ring-1 ring-gray-200/80 hover:bg-white hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-300 dark:ring-white/10 dark:hover:bg-white/[0.06] lg:hidden"
          aria-label={menuOpen ? '收起导航' : '展开导航'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((old) => !old)}
        >
          {menuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
        <nav
          className="hidden items-center justify-end gap-0.5 rounded-full bg-gray-900/[0.035] p-1 ring-1 ring-inset ring-gray-900/[0.05] backdrop-blur-md dark:bg-white/[0.04] dark:ring-white/[0.06] lg:flex"
          aria-label="主导航"
        >
          {navItems.slice(0, 5).map((item) => (
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
              <Menu.Items className="absolute left-1/2 z-30 mt-3 w-64 -translate-x-1/2 rounded-2xl bg-white/95 p-1.5 shadow-[0_24px_48px_-16px_rgba(30,27,75,0.25)] ring-1 ring-gray-900/[0.06] backdrop-blur-xl focus:outline-none dark:bg-gray-900/95 dark:ring-white/10">
                <div className="px-3 pb-1.5 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  TCF Canada 模考
                </div>
                {examItems.map((item) => (
                  <Menu.Item key={item.to}>
                    {({ active }) => (
                      <NavLink
                        to={item.to}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm no-underline transition-colors hover:no-underline ${
                          active || pathname === item.to
                            ? 'bg-indigo-50/80 text-indigo-700 dark:bg-white/[0.06] dark:text-white'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900/[0.04] font-mono text-[11px] font-semibold text-gray-500 dark:bg-white/[0.06] dark:text-gray-300">
                          {item.code === 'NCLC 7' ? '∑' : item.code}
                        </span>
                        <span className="flex flex-1 items-baseline justify-between gap-2">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-[11px] text-gray-400">{item.detail}</span>
                        </span>
                      </NavLink>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
          {navItems.slice(4).map((item) => (
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
          className="my-card mt-3 grid grid-cols-2 gap-1 rounded-3xl bg-white/90 p-2 backdrop-blur-xl dark:bg-gray-900/90 sm:grid-cols-3 lg:hidden"
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `${navItemClass(isActive)} justify-center py-2.5`}>
              {item.label}
            </NavLink>
          ))}
          {examItems.map((item) => (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `${navItemClass(isActive)} justify-center py-2.5`}>
              模考 · {item.label}
              <span className="text-xs opacity-70">{item.code}</span>
            </NavLink>
          ))}
        </nav>
      )}
      {children && (
        <div className="mt-3 flex justify-center lg:justify-end">
          <div className="my-card flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 whitespace-nowrap rounded-2xl bg-white/90 px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 dark:bg-gray-900/80">
            {children}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
