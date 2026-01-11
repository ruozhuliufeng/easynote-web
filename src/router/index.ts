import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'ledger',
        name: 'Ledger',
        component: () => import('@/views/ledger/Index.vue'),
        meta: { title: '账本管理', icon: 'Notebook' }
      },
      {
        path: 'ledger/:id',
        name: 'LedgerDetail',
        component: () => import('@/views/ledger/Detail.vue'),
        meta: { title: '账本详情', hidden: true }
      },
      {
        path: 'income',
        name: 'Income',
        component: () => import('@/views/income/Index.vue'),
        meta: { title: '收入管理', icon: 'TrendCharts' }
      },
      {
        path: 'expense',
        name: 'Expense',
        component: () => import('@/views/expense/Index.vue'),
        meta: { title: '支出管理', icon: 'ShoppingCart' }
      },
      {
        path: 'family',
        name: 'Family',
        component: () => import('@/views/family/Index.vue'),
        meta: { title: '家庭管理', icon: 'UserFilled' }
      },
      {
        path: 'bankcard',
        name: 'BankCard',
        component: () => import('@/views/bankcard/Index.vue'),
        meta: { title: '银行卡管理', icon: 'CreditCard' }
      },
      {
        path: 'message',
        name: 'Message',
        component: () => import('@/views/message/Index.vue'),
        meta: { title: '消息通知', icon: 'Bell', hidden: true }
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/setting/Index.vue'),
        meta: { title: '个人设置', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/auth/NotFound.vue'),
    meta: { title: '404', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '简记'} - EasyNote`

  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Register') && userStore.isLoggedIn) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
