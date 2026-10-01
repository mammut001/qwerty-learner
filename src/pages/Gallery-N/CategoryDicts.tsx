import DictionaryComponent from './DictionaryWithoutCover'
import type { Dictionary } from '@/typings'

type Props = {
  category: string
  dictionaries: Dictionary[]
}

export default function DictionaryGroup({ category, dictionaries }: Props) {
  const totalWords = dictionaries.reduce((sum, dict) => sum + dict.length, 0)

  return (
    <section className="w-full">
      <div className="mb-6 flex items-end justify-between pr-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{category}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {dictionaries.length} 个词库 · {totalWords} 个学习项
          </p>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-8 px-1 pb-4 sm:grid-cols-1 md:grid-cols-2 dic3:grid-cols-3 dic4:grid-cols-4">
        {dictionaries.map((dict) => (
          <DictionaryComponent key={dict.id} dictionary={dict} />
        ))}
      </div>
    </section>
  )
}
