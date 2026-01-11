<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import { getUnreadCount } from '@/api/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapsed = ref(false)
const unreadCount = ref(0)
let unreadTimer: ReturnType<typeof setInterval> | null = null

// 菜单项配置 - 添加图标颜色
const menuItems = [
  { path: '/home', title: '首页', icon: 'HomeFilled', color: '#667eea' },
  { path: '/ledger', title: '账本管理', icon: 'Notebook', color: '#f093fb' },
  { path: '/income', title: '收入管理', icon: 'TrendCharts', color: '#56ab2f' },
  { path: '/expense', title: '支出管理', icon: 'ShoppingCart', color: '#ff6b6b' },
  { path: '/family', title: '家庭管理', icon: 'UserFilled', color: '#feca57' },
  { path: '/bankcard', title: '银行卡管理', icon: 'CreditCard', color: '#4facfe' },
  { path: '/setting', title: '个人设置', icon: 'Setting', color: '#a8e6cf' }
]

const activeMenu = computed(() => route.path)

// 获取问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

// 加载未读消息数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data || 0
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

// 跳转到消息页面
const goToMessage = () => {
  router.push('/message')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await userStore.doLogout()
  } catch {
    // 取消退出
  }
}

onMounted(() => {
  loadUnreadCount()
  // 每30秒刷新一次未读数量
  unreadTimer = setInterval(loadUnreadCount, 30000)
})

onUnmounted(() => {
  if (unreadTimer) {
    clearInterval(unreadTimer)
  }
})
</script>

<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="layout-sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo区域 -->
      <div class="logo">
        <div class="logo-icon">
          <span>📝</span>
        </div>
        <transition name="fade">
          <span v-if="!isCollapsed" class="logo-text">简记</span>
        </transition>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="rgba(255,255,255,0.85)"
        active-text-color="#ffffff"
        router
        class="sidebar-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>

      <!-- 底部装饰 -->
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="version-info">v1.0.0</div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="layout-main">
      <!-- 顶部导航 -->
      <div class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <div class="greeting-text">
            <span class="greeting">{{ greeting }}，</span>
            <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
            <span class="wave">👋</span>
          </div>
        </div>
        <div class="header-right">
          <!-- 消息图标 -->
          <div class="header-action" @click="goToMessage">
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
              <el-icon class="action-icon"><Bell /></el-icon>
            </el-badge>
          </div>

          <!-- 用户信息 -->
          <el-dropdown>
            <div class="user-dropdown">
              <el-avatar :size="40" :src="userStore.userInfo?.avatar" class="user-avatar">
                {{ (userStore.userInfo?.nickname || userStore.userInfo?.username || '?').charAt(0) }}
              </el-avatar>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/setting')">
                  <el-icon><Setting /></el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-sidebar {
  .logo {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;

    .logo-icon {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .logo-text {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 2px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
  }

  .sidebar-menu {
    border-right: none;
    padding: 20px 12px;
    position: relative;
    z-index: 1;

    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      margin-bottom: 8px;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        transform: translateX(4px);
      }

      &.is-active {
        background: rgba(255, 255, 255, 0.25) !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: #fff;
          border-radius: 0 4px 4px 0;
        }
      }

      .el-icon {
        font-size: 20px;
      }
    }
  }

  .sidebar-footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1;

    .version-info {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }
  }
}

.layout-header {
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-btn {
      font-size: 22px;
      cursor: pointer;
      color: #667eea;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.3s;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        transform: scale(1.1);
      }
    }

    .greeting-text {
      font-size: 16px;
      color: #2c3e50;

      .greeting {
        color: #7f8c8d;
      }

      .username {
        font-weight: 600;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .wave {
        display: inline-block;
        margin-left: 8px;
        animation: wave 1.5s ease-in-out infinite;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-action {
      padding: 10px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      background: rgba(102, 126, 234, 0.08);

      &:hover {
        background: rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);
      }

      .action-icon {
        font-size: 22px;
        color: #667eea;
      }
    }

    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 6px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s;
      background: rgba(102, 126, 234, 0.08);

      &:hover {
        background: rgba(102, 126, 234, 0.15);
      }

      .user-avatar {
        border: 2px solid rgba(102, 126, 234, 0.3);
      }

      .dropdown-arrow {
        color: #667eea;
        font-size: 14px;
      }
    }
  }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
