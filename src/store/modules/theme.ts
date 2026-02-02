import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'
export type PrimaryColor = string

// 预定义主题色
export const PRESET_COLORS = [
  '#667eea', // 紫色
  '#f093fb', // 粉色
  '#56ab2f', // 绿色
  '#ff6b6b', // 红色
  '#feca57', // 黄色
  '#4facfe', // 蓝色
  '#a8e6cf', // 青色
  '#fa709a', // 玫红
  '#fee140', // 金色
  '#00d2ff'  // 天蓝
]

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('themeMode') as ThemeMode) || 'light')
  const primaryColor = ref<PrimaryColor>(localStorage.getItem('primaryColor') || PRESET_COLORS[0])

  // 监听主题模式变化
  watch(mode, (newMode) => {
    localStorage.setItem('themeMode', newMode)
    applyMode(newMode)
  }, { immediate: true })

  // 监听主题色变化
  watch(primaryColor, (newColor) => {
    localStorage.setItem('primaryColor', newColor)
    applyPrimaryColor(newColor)
  }, { immediate: true })

  // 应用主题模式
  function applyMode(newMode: ThemeMode) {
    const html = document.documentElement
    if (newMode === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // 应用主题色
  function applyPrimaryColor(color: string) {
    document.documentElement.style.setProperty('--el-color-primary', color)

    // 生成不同深浅的颜色变体
    const lighterColor = adjustColor(color, 40)
    const darkerColor = adjustColor(color, -20)

    document.documentElement.style.setProperty('--el-color-primary-light-3', lighterColor)
    document.documentElement.style.setProperty('--el-color-primary-light-5', lighterColor)
    document.documentElement.style.setProperty('--el-color-primary-light-7', adjustColor(color, 60))
    document.documentElement.style.setProperty('--el-color-primary-light-8', adjustColor(color, 70))
    document.documentElement.style.setProperty('--el-color-primary-light-9', adjustColor(color, 80))
    document.documentElement.style.setProperty('--el-color-primary-dark-2', darkerColor)
  }

  // 颜色亮度调整函数
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
  }

  // 切换主题模式
  function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  // 设置主题模式
  function setMode(newMode: ThemeMode) {
    mode.value = newMode
  }

  // 设置主题色
  function setPrimaryColor(color: string) {
    primaryColor.value = color
  }

  return {
    mode,
    primaryColor,
    toggleMode,
    setMode,
    setPrimaryColor
  }
})
