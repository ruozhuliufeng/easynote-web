<script setup lang="ts">
import { useThemeStore, PRESET_COLORS } from '@/store/modules/theme'
import { ref, onMounted, watch } from 'vue'
import { Sunny, Moon, Check, Brush } from '@element-plus/icons-vue'

const themeStore = useThemeStore()
const colorDropdownVisible = ref(false)
const customColor = ref(themeStore.primaryColor)

// 预设颜色
const presetColors = PRESET_COLORS

// 监听主题色变化，更新自定义颜色选择器
watch(() => themeStore.primaryColor, (newColor) => {
  customColor.value = newColor
  console.log('Primary color changed to:', newColor)
})

// 切换主题模式
const handleToggleTheme = () => {
  themeStore.toggleMode()
  console.log('Theme toggled to:', themeStore.mode)
}

// 选择预设颜色
const handleSelectColor = (color: string) => {
  console.log('Selected preset color:', color)
  themeStore.setPrimaryColor(color)
  colorDropdownVisible.value = false
}

// 应用自定义颜色
const handleApplyCustomColor = (color: string) => {
  if (color) {
    console.log('Applied custom color:', color)
    themeStore.setPrimaryColor(color)
    colorDropdownVisible.value = false
  }
}

// 初始化
onMounted(() => {
  console.log('ThemeToggle mounted')
  console.log('Current mode:', themeStore.mode)
  console.log('Current primaryColor:', themeStore.primaryColor)
})
</script>

<template>
  <div class="theme-toggle-container">
    <!-- 主题模式切换按钮 -->
    <el-tooltip :content="themeStore.mode === 'light' ? '切换到深色模式' : '切换到浅色模式'" placement="bottom">
      <div class="theme-btn" @click="handleToggleTheme">
        <el-icon class="theme-icon">
          <Sunny v-if="themeStore.mode === 'light'" />
          <Moon v-else />
        </el-icon>
      </div>
    </el-tooltip>

    <!-- 主题色选择器 -->
    <el-dropdown v-model:visible="colorDropdownVisible" trigger="click" placement="bottom-end">
      <el-tooltip content="主题色" placement="bottom">
        <div class="theme-btn color-btn" :style="{ backgroundColor: themeStore.primaryColor }">
          <el-icon class="color-icon"><Brush /></el-icon>
        </div>
      </el-tooltip>

      <template #dropdown>
        <el-dropdown-menu class="color-dropdown-menu">
          <div class="color-picker-wrapper">
            <div class="section-title">预设颜色</div>
            <div class="color-grid">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-item"
                :class="{ active: themeStore.primaryColor === color }"
                :style="{ backgroundColor: color }"
                @click="handleSelectColor(color)"
              >
                <el-icon v-if="themeStore.primaryColor === color" class="check-icon">
                  <Check />
                </el-icon>
              </div>
            </div>

            <div class="section-title" style="margin-top: 20px;">自定义颜色</div>
            <div class="custom-color-wrapper">
              <el-color-picker
                v-model="customColor"
                show-alpha
                size="default"
                @change="handleApplyCustomColor"
              />
              <el-button type="primary" size="small" @click="colorDropdownVisible = false">
                关闭
              </el-button>
            </div>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;

  .theme-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(102, 126, 234, 0.08);
    position: relative;

    &:hover {
      background: rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }

    .theme-icon {
      font-size: 20px;
      color: #667eea;
    }

    &.color-btn {
      padding: 0;
      border: 2px solid transparent;
      transition: all 0.3s;
      overflow: hidden;

      .color-icon {
        color: #fff;
        font-size: 20px;
        z-index: 1;
        mix-blend-mode: difference;
        filter: brightness(2);
      }

      &:hover {
        border-color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.color-picker-wrapper {
  padding: 16px;
  min-width: 260px;

  .section-title {
    font-size: 14px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;

    .color-item {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border: 2px solid transparent;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(1.05);
      }

      &.active {
        border-color: #409eff;
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
      }

      .check-icon {
        color: #fff;
        font-size: 20px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        font-weight: bold;
      }
    }
  }

  .custom-color-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
  }
}

// 暗色模式样式
.dark {
  .color-picker-wrapper {
    .section-title {
      color: #ccc;
    }

    .color-item {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
    }
  }
}
</style>

<style lang="scss">
.color-dropdown-menu {
  padding: 0 !important;
  border: none !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;

  .el-dropdown-menu__item {
    padding: 0 !important;

    &:hover {
      background: transparent !important;
    }
  }

  .el-color-picker {
    &:hover {
      .el-color-picker__trigger {
        transform: scale(1.05);
      }
    }
  }
}
</style>
