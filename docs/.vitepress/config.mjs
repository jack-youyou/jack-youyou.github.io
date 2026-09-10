import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// docs 目录的绝对路径（config.mjs 位于 docs/.vitepress/ 下）
const docsDir = fileURLToPath(new URL('..', import.meta.url))

// 标题：frontmatter 的 title > 首个 # 标题 > 文件名
function title(file, fallback) {
  const c = fs.readFileSync(file, 'utf-8')
  const m = c.match(/^title:\s*(.+)$/m) || c.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : fallback
}

// 把一个目录整理成一个侧边栏分组（跳过 index.md）
function group(dir, text, prefix) {
  const items = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .map((f) => ({ text: title(path.join(dir, f), path.basename(f, '.md')), link: `${prefix}/${path.basename(f, '.md')}` }))
  return items.length ? { text, items, collapsed: false } : null
}

// 自动扫描 docs 目录生成侧边栏
function autoSidebar() {
  const groups = fs.readdirSync(docsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '.vitepress')
    .map((d) => group(path.join(docsDir, d.name), d.name[0].toUpperCase() + d.name.slice(1), `/${d.name}`))
  groups.push(group(docsDir, '文章', ''))
  return groups.filter(Boolean)
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jack的博客",
  description: "Jack的分享",
  base: '/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: 'Qt', link: '/qt/' }
    ],

    sidebar: autoSidebar(),

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    // ]
  }
})
