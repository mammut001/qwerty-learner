import purple from './purple.json'
import useWindowSize from '@/hooks/useWindowSize'
import { isOpenDarkModeAtom } from '@/store'
import { LineChart } from 'echarts/charts'
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

echarts.registerTheme('purple', purple)
echarts.use([GridComponent, TitleComponent, TooltipComponent, LineChart, CanvasRenderer])

interface LineChartsProps {
  title: string
  data: [string, number][]
  name: string
  suffix?: string
  target?: number
  targetLabel?: string
}

const LineCharts: FC<LineChartsProps> = ({ data, title, suffix, name, target, targetLabel }) => {
  const [isOpenDarkMode] = useAtom(isOpenDarkModeAtom)

  const chartRef = useRef<HTMLDivElement>(null)

  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    let chart = echarts.getInstanceByDom(chartRef.current)
    chart?.dispose()

    chart = echarts.init(chartRef.current, isOpenDarkMode ? 'purple' : 'light')

    const option = {
      tooltip: { trigger: 'axis' },
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '10%',
      },
      xAxis: {
        type: 'time',
        axisPointer: {
          label: {
            formatter: function (params: { seriesData: [{ data: [string, number] }] }) {
              return params.seriesData[0].data[0]
            },
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => value + (suffix || '') },
      },
      series: [
        {
          name,
          type: 'line',
          smooth: true,
          data: data,
          emphasis: { focus: 'series' },
        },
        ...(target === undefined || data.length === 0
          ? []
          : [{
              name: targetLabel ?? '目标',
              type: 'line',
              symbol: 'none',
              data: data.length === 1
                ? [
                    [new Date(new Date(data[0][0]).getTime() - 12 * 60 * 60 * 1000).toISOString(), target],
                    [new Date(new Date(data[0][0]).getTime() + 12 * 60 * 60 * 1000).toISOString(), target],
                  ]
                : [
                    [data[0][0], target],
                    [data[data.length - 1][0], target],
                  ],
              lineStyle: { type: 'dashed', width: 2 },
              tooltip: { show: false },
            }]),
      ],
    }

    chart.setOption(option)
  }, [data, title, suffix, name, target, targetLabel, isOpenDarkMode])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.getInstanceByDom(chartRef.current)
    chart?.resize()
  }, [width, height, chartRef])

  return (
    <div className="flex h-full flex-col">
      <div className="text-center text-xl font-bold text-gray-600	dark:text-white">{title}</div>
      <div style={{ width: '100%', height: '100%' }} ref={chartRef} className="line-chart flex-grow"></div>
    </div>
  )
}

export default LineCharts
