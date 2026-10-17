import { ROUTE_SEO } from './src/resources/routeSeo'
import { renderRouteHtml, resolveRelativeIconLinks } from './scripts/route-meta.mjs'
import react from '@vitejs/plugin-react'
import { promises as fs } from 'fs'
import { getLastCommit } from 'git-last-commit'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'

function staticRouteMetaPlugin(): PluginOption {
  let resolvedBase = '/'
  let resolvedOutDir = 'build'

  return {
    name: 'static-route-meta',
    configResolved(config) {
      resolvedBase = config.base
      resolvedOutDir = config.build.outDir || 'build'
    },
    transformIndexHtml(html) {
      return resolveRelativeIconLinks(html, resolvedBase)
    },
    async closeBundle() {
      // ONLY when the resolved base is absolute ('/')
      if (resolvedBase !== '/') {
        return
      }

      const outDirAbs = path.resolve(__dirname, resolvedOutDir)
      const indexPath = path.resolve(outDirAbs, 'index.html')
      let baseHtml: string
      try {
        baseHtml = await fs.readFile(indexPath, 'utf-8')
      } catch {
        return
      }

      for (const route of ROUTE_SEO) {
        const transformedHtml = renderRouteHtml(baseHtml, route, ROUTE_SEO, resolvedBase)
        if (route.path === '/') {
          await fs.writeFile(indexPath, transformedHtml, 'utf-8')
        } else {
          const routeDir = path.resolve(outDirAbs, route.path.replace(/^\/+/, ''))
          await fs.mkdir(routeDir, { recursive: true })
          await fs.writeFile(path.resolve(routeDir, 'index.html'), transformedHtml, 'utf-8')
        }
      }
    },
  }
}

const chunkForDependency = (id: string) => {
  if (!id.includes('node_modules')) return undefined
  if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react-core'
  if (/node_modules\/(echarts|zrender)\//.test(id)) return 'charts'
  if (/node_modules\/(@radix-ui|@headlessui|@floating-ui)\//.test(id)) return 'ui-kit'
  if (/node_modules\/(dexie|dexie-react-hooks|dexie-export-import)\//.test(id)) return 'storage'
  return undefined
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const latestCommitHash =
    process.env.BUILD_COMMIT_SHA?.trim() ||
    (await new Promise<string>((resolve) => {
      return getLastCommit((err, commit) => resolve(err ? 'unknown' : commit.shortHash))
    }))
  return {
    server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
    plugins: [
      react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
      visualizer() as PluginOption,
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        customCollections: {
          'my-icons': {
            xiaohongshu: () => fs.readFile('./src/assets/xiaohongshu.svg', 'utf-8'),
          },
        },
      }),
      staticRouteMetaPlugin(),
    ],
    build: {
      minify: true,
      outDir: 'build',
      sourcemap: false,
      // Keep Vite's chunk map out of the root so it cannot overwrite public/manifest.json (the PWA manifest).
      manifest: '.vite/manifest.json',
      rollupOptions: {
        output: {
          manualChunks: chunkForDependency,
        },
      },
    },
    esbuild: {
      drop: mode === 'development' ? [] : ['console', 'debugger'],
    },
    define: {
      REACT_APP_DEPLOY_ENV: JSON.stringify(process.env.REACT_APP_DEPLOY_ENV),
      LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)')),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  }
})
