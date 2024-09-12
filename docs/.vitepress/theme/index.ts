import BlogTheme from '@sugarat/theme'

// 自定义样式重载
import './style.scss'

// 自定义主题色
// import './user-theme.css'
function useGoogleAnalytics(id) {
    if (process.env.NODE_ENV === 'production' && id && typeof window !== 'undefined') {
      // 避免重複加載
      if (window.dataLayer && window.gtag) {
        return
      }
  
      // 插入 Google Analytics script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      script.async = true
      document.head.appendChild(script)
  
      // 初始化 gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        dataLayer.push(arguments)
      }
  
      window.gtag('js', new Date())
      
      window.gtag('config', id, {
        cookie_flags: 'SameSite=None;Secure',
        cookie_domain: 'auto'
      })
  
      console.log('Google Analytics 初始化成功')
    }
  }
export default {
    ...BlogTheme,
    enhanceApp({ app, router, siteData }) {
        if (typeof window !== 'undefined') {
          const themeConfig = siteData.value.themeConfig
          if (themeConfig && themeConfig.googleAnalyticsId) {
            useGoogleAnalytics(themeConfig.googleAnalyticsId)
          } else {
            // 如果沒有設置，則會在 console 中顯示警告
            console.warn('Google Analytics ID 未在配置中設置或無法讀取')
            console.log('themeConfig:', themeConfig)
          }
        }
      }
}
