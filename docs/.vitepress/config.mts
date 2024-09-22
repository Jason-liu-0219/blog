import { defineConfig } from 'vitepress'

// 导入主题的配置
import { blogTheme } from './blog-theme'

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// 如果项目名已经为 name.github.io 域名，则不需要修改！
const base = process.env.GITHUB_ACTIONS === 'true'
  ? '/'
  : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  base,
  lang: 'zh-cn',
  title: '傑森部落格',
  description: '前端(Vue),後端(Node.js),雲端(Aws)學習筆記',
  lastUpdated: true,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目錄'
    },
    // 默认文案修改
    returnToTopLabel: '回到最上方',
    sidebarMenuLabel: '相關文章',
    lastUpdatedText: '上次更新於',

    // 设置logo
    logo: '/avatar.jpg',
    // editLink: {
    //   pattern:
    //     'https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path',
    //   text: '去 GitHub 上编辑内容'
    // },
    nav: [
      { text: '首頁', link: '/' },
      {
        text: '網頁前端', items: [
          {
            text: '實作篇', link: '/frontend/canvasBar.html' ,
          },
          {
            text: 'Canvas', link: '/frontend/canvas/01.html'
          },
          {
            text: 'Cypress', link: '/frontend/cypress/01.html'
          },
          {
            text: '設計模式', link: '/frontend/pattern/solid.html'
          }
        ]
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: ''
      }
    ],
    googleAnalyticsId:'G-JLVF9F9YYC'
  }
})
