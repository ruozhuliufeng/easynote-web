<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLedgers, type Ledger } from '@/api/ledger'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const ledgers = ref<Ledger[]>([])
const loading = ref(false)

// 统计数据
const totalIncome = computed(() =>
  ledgers.value.reduce((sum, l) => sum + (l.totalIncome || 0), 0)
)
const totalExpense = computed(() =>
  ledgers.value.reduce((sum, l) => sum + (l.totalExpense || 0), 0)
)
const totalBalance = computed(() => totalIncome.value - totalExpense.value)

// 获取当前日期信息
const dateInfo = computed(() => {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekday: weekdays[now.getDay()]
  }
})

// 快捷操作
const quickActions = [
  { icon: '💰', title: '记录收入', desc: '添加收入记录', path: '/income', color: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
  { icon: '🛒', title: '记录支出', desc: '添加支出记录', path: '/expense', color: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { icon: '📚', title: '管理账本', desc: '查看所有账本', path: '/ledger', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { icon: '👨‍👩‍👧‍👦', title: '家庭管理', desc: '管理家庭成员', path: '/family', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLedgers()
    if (res.code === 200) {
      ledgers.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

const formatMoney = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="home-page">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>今天也要好好记账哦~ ✨</h1>
          <p class="motivational">每一笔记录，都是对美好生活的用心经营</p>
        </div>
        <div class="date-display">
          <div class="date-main">{{ dateInfo.day }}</div>
          <div class="date-sub">
            <span class="month">{{ dateInfo.month }}月</span>
            <span class="weekday">{{ dateInfo.weekday }}</span>
          </div>
        </div>
      </div>
      <!-- 装饰元素 -->
      <div class="decoration decoration-1">💫</div>
      <div class="decoration decoration-2">🌸</div>
      <div class="decoration decoration-3">✨</div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <div class="stat-card income">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-label">总收入</div>
          <div class="stat-value">¥ {{ formatMoney(totalIncome) }}</div>
        </div>
        <div class="stat-wave"></div>
      </div>
      <div class="stat-card expense">
        <div class="stat-icon">📉</div>
        <div class="stat-info">
          <div class="stat-label">总支出</div>
          <div class="stat-value">¥ {{ formatMoney(totalExpense) }}</div>
        </div>
        <div class="stat-wave"></div>
      </div>
      <div class="stat-card balance">
        <div class="stat-icon">💎</div>
        <div class="stat-info">
          <div class="stat-label">结余</div>
          <div class="stat-value">¥ {{ formatMoney(totalBalance) }}</div>
        </div>
        <div class="stat-wave"></div>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="card quick-section">
      <div class="card-title">
        <span>快捷操作</span>
        <span class="title-emoji">🚀</span>
      </div>
      <div class="quick-actions">
        <div
          v-for="action in quickActions"
          :key="action.path"
          class="quick-action-card"
          :style="{ '--action-bg': action.color }"
          @click="router.push(action.path)"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-info">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.desc }}</div>
          </div>
          <div class="action-arrow">→</div>
        </div>
      </div>
    </div>

    <!-- 账本列表 -->
    <div class="card ledger-section">
      <div class="card-title">
        <span>我的账本</span>
        <el-button type="primary" size="small" round @click="router.push('/ledger')">
          查看全部 →
        </el-button>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="ledgers.length === 0" class="empty-state">
        <div class="empty-icon">📒</div>
        <p class="empty-text">还没有账本呢，创建一个开始记账吧~</p>
        <el-button type="primary" round @click="router.push('/ledger')">
          创建账本
        </el-button>
      </div>

      <div v-else class="ledger-list">
        <div
          v-for="ledger in ledgers.slice(0, 4)"
          :key="ledger.id"
          class="ledger-item"
        >
          <div class="ledger-icon">
            {{ ledger.isFamilyLedger ? '👨‍👩‍👧‍👦' : '📔' }}
          </div>
          <div class="ledger-info">
            <div class="ledger-name">{{ ledger.name }}</div>
            <div class="ledger-type">
              <el-tag :type="ledger.isFamilyLedger ? 'warning' : 'info'" size="small" round>
                {{ ledger.isFamilyLedger ? '家庭账本' : '个人账本' }}
              </el-tag>
            </div>
          </div>
          <div class="ledger-stats">
            <div class="ledger-stat income">
              <span class="label">收入</span>
              <span class="value">+{{ formatMoney(ledger.totalIncome || 0) }}</span>
            </div>
            <div class="ledger-stat expense">
              <span class="label">支出</span>
              <span class="value">-{{ formatMoney(ledger.totalExpense || 0) }}</span>
            </div>
            <div class="ledger-stat balance" :class="{ positive: (ledger.balance || 0) >= 0, negative: (ledger.balance || 0) < 0 }">
              <span class="label">结余</span>
              <span class="value">{{ formatMoney(ledger.balance || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 温馨提示 -->
    <div class="tips-section">
      <div class="tip-card">
        <span class="tip-icon">💡</span>
        <span class="tip-text">小贴士：坚持记账是理财的第一步，每天花几分钟记录，一年后会有惊喜哦~</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 24px;
  padding: 32px 40px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .welcome-text {
    h1 {
      color: #fff;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .motivational {
      color: rgba(255, 255, 255, 0.85);
      font-size: 15px;
    }
  }

  .date-display {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 16px 24px;

    .date-main {
      font-size: 48px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }

    .date-sub {
      display: flex;
      flex-direction: column;
      gap: 4px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
  }

  .decoration {
    position: absolute;
    font-size: 24px;
    animation: float 3s ease-in-out infinite;
    opacity: 0.6;

    &.decoration-1 {
      top: 20%;
      right: 30%;
      animation-delay: 0s;
    }

    &.decoration-2 {
      bottom: 20%;
      right: 20%;
      animation-delay: 1s;
    }

    &.decoration-3 {
      top: 30%;
      right: 15%;
      animation-delay: 2s;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(10deg); }
  }
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  .stat-card {
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.8);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;
      z-index: 1;

      .stat-label {
        font-size: 13px;
        color: #7f8c8d;
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        font-family: 'DIN Alternate', 'Courier New', monospace;
      }
    }

    .stat-wave {
      position: absolute;
      bottom: -30%;
      right: -20%;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      opacity: 0.1;
    }

    &.income {
      .stat-icon { background: rgba(86, 171, 47, 0.1); }
      .stat-value { color: #56ab2f; }
      .stat-wave { background: #56ab2f; }
    }

    &.expense {
      .stat-icon { background: rgba(255, 107, 107, 0.1); }
      .stat-value { color: #ff6b6b; }
      .stat-wave { background: #ff6b6b; }
    }

    &.balance {
      .stat-icon { background: rgba(102, 126, 234, 0.1); }
      .stat-value { color: #667eea; }
      .stat-wave { background: #667eea; }
    }
  }
}

/* 快捷操作 */
.quick-section {
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;

    .title-emoji {
      font-size: 18px;
    }
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .quick-action-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(102, 126, 234, 0.1);

    &:hover {
      background: var(--action-bg);
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);

      .action-icon {
        transform: scale(1.2);
      }

      .action-info {
        .action-title, .action-desc {
          color: #fff;
        }
      }

      .action-arrow {
        color: #fff;
        transform: translateX(4px);
      }
    }

    .action-icon {
      font-size: 36px;
      transition: transform 0.3s ease;
    }

    .action-info {
      flex: 1;

      .action-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
        transition: color 0.3s ease;
      }

      .action-desc {
        font-size: 13px;
        color: #7f8c8d;
        transition: color 0.3s ease;
      }
    }

    .action-arrow {
      font-size: 20px;
      color: #bdc3c7;
      transition: all 0.3s ease;
    }
  }
}

/* 账本列表 */
.ledger-section {
  .loading-state {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .empty-text {
      color: #7f8c8d;
      margin-bottom: 20px;
    }
  }

  .ledger-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ledger-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(240, 147, 251, 0.03));
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.08);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(240, 147, 251, 0.08));
      transform: translateX(8px);
    }

    .ledger-icon {
      font-size: 32px;
    }

    .ledger-info {
      flex: 1;

      .ledger-name {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 6px;
      }
    }

    .ledger-stats {
      display: flex;
      gap: 24px;

      .ledger-stat {
        text-align: right;

        .label {
          font-size: 12px;
          color: #7f8c8d;
          display: block;
          margin-bottom: 2px;
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          font-family: 'DIN Alternate', 'Courier New', monospace;
        }

        &.income .value { color: #56ab2f; }
        &.expense .value { color: #ff6b6b; }
        &.balance.positive .value { color: #56ab2f; }
        &.balance.negative .value { color: #ff6b6b; }
      }
    }
  }
}

/* 温馨提示 */
.tips-section {
  .tip-card {
    background: linear-gradient(135deg, rgba(254, 202, 87, 0.15), rgba(255, 107, 107, 0.1));
    border-radius: 16px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px dashed rgba(254, 202, 87, 0.5);

    .tip-icon {
      font-size: 24px;
    }

    .tip-text {
      color: #7f8c8d;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-banner {
    padding: 24px;

    .welcome-content {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .welcome-text h1 {
      font-size: 22px;
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .quick-section .quick-actions {
    grid-template-columns: 1fr;
  }

  .ledger-item {
    flex-direction: column;
    align-items: flex-start;

    .ledger-stats {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
