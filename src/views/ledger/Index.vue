<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLedgers, createLedger, updateLedger, deleteLedger, type Ledger, type CreateLedgerParams, type UpdateLedgerParams } from '@/api/ledger'
import { getCurrentFamily, type Family } from '@/api/family'

const ledgers = ref<Ledger[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建账本')
const editId = ref<number | null>(null)
const family = ref<Family | null>(null)
const linkToFamily = ref(false)
const originalFamilyId = ref<number | null>(null)

const form = ref<CreateLedgerParams & UpdateLedgerParams>({
  name: '',
  icon: '',
  description: '',
  familyId: undefined,
  isPublic: 1
})

const hasFamily = computed(() => !!family.value)

// 账本图标选项
const iconOptions = ['📔', '📕', '📗', '📘', '📙', '💰', '💳', '🏠', '🚗', '🍔', '🛒', '✈️', '🎮', '💊', '📚', '🎁']

const fetchLedgers = async () => {
  loading.value = true
  try {
    const res = await getLedgers()
    ledgers.value = res.data || []
  } finally {
    loading.value = false
  }
}

const fetchFamily = async () => {
  try {
    const res = await getCurrentFamily()
    family.value = res.data
  } catch {
    family.value = null
  }
}

const handleCreate = () => {
  editId.value = null
  dialogTitle.value = '创建账本'
  form.value = { name: '', icon: '📔', description: '', familyId: undefined, isPublic: 1 }
  linkToFamily.value = false
  originalFamilyId.value = null
  dialogVisible.value = true
}

const handleEdit = (row: Ledger) => {
  editId.value = row.id
  dialogTitle.value = '编辑账本'
  form.value = {
    name: row.name,
    icon: row.icon || '📔',
    description: row.description || '',
    familyId: row.familyId,
    isPublic: row.isPublic
  }
  linkToFamily.value = !!row.familyId
  originalFamilyId.value = row.familyId || null
  dialogVisible.value = true
}

const handleDelete = async (row: Ledger) => {
  try {
    await ElMessageBox.confirm(`确定要删除账本"${row.name}"吗？删除后数据无法恢复`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteLedger(row.id)
    ElMessage.success('删除成功')
    fetchLedgers()
  } catch {
    // 取消删除
  }
}

const handleLinkFamilyChange = (value: boolean) => {
  if (value && family.value) {
    form.value.familyId = family.value.id
  } else {
    form.value.familyId = null
  }
}

const handleSubmit = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入账本名称')
    return
  }

  try {
    if (editId.value) {
      // 编辑模式
      const params: UpdateLedgerParams = {
        name: form.value.name,
        icon: form.value.icon,
        description: form.value.description,
        isPublic: form.value.isPublic
      }

      if (linkToFamily.value && family.value) {
        // 关联到家庭
        params.familyId = family.value.id
      } else if (originalFamilyId.value && !linkToFamily.value) {
        // 原来有关联，现在取消关联
        params.unlinkFamily = true
      }

      await updateLedger(editId.value, params)
      ElMessage.success('更新成功')
    } else {
      // 创建模式
      const params: CreateLedgerParams = {
        name: form.value.name,
        icon: form.value.icon,
        description: form.value.description,
        isPublic: form.value.isPublic
      }

      if (linkToFamily.value && family.value) {
        params.familyId = family.value.id
      }

      await createLedger(params)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchLedgers()
  } catch (error) {
    // 错误已在拦截器处理
  }
}

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  fetchLedgers()
  fetchFamily()
})
</script>

<template>
  <div class="ledger-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">📚</div>
        <div class="header-info">
          <h1>账本管理</h1>
          <p>管理你的个人和家庭账本，让每一笔收支都清晰明了</p>
        </div>
      </div>
      <el-button type="primary" round size="large" @click="handleCreate">
        ➕ 创建账本
      </el-button>
    </div>

    <!-- 账本列表 -->
    <div class="ledger-grid" v-loading="loading">
      <div
        v-for="ledger in ledgers"
        :key="ledger.id"
        class="ledger-card"
        :class="{ family: ledger.familyId }"
      >
        <div class="ledger-header">
          <div class="ledger-icon">{{ ledger.icon || '📔' }}</div>
          <div class="ledger-type">
            <el-tag :type="ledger.familyId ? 'warning' : 'info'" size="small" round>
              {{ ledger.familyId ? '👨‍👩‍👧‍👦 家庭' : '👤 个人' }}
            </el-tag>
          </div>
        </div>

        <div class="ledger-body">
          <h3 class="ledger-name">{{ ledger.name }}</h3>
          <p class="ledger-desc">{{ ledger.description || '暂无描述' }}</p>
          <p class="ledger-family" v-if="ledger.familyName">
            <span class="family-icon">🏠</span>
            {{ ledger.familyName }}
          </p>
        </div>

        <div class="ledger-stats">
          <div class="stat-item income">
            <span class="stat-label">收入</span>
            <span class="stat-value">+{{ formatMoney(ledger.totalIncome) }}</span>
          </div>
          <div class="stat-item expense">
            <span class="stat-label">支出</span>
            <span class="stat-value">-{{ formatMoney(ledger.totalExpense) }}</span>
          </div>
          <div class="stat-item balance">
            <span class="stat-label">结余</span>
            <span class="stat-value" :class="{ positive: ledger.balance >= 0, negative: ledger.balance < 0 }">
              {{ formatMoney(ledger.balance) }}
            </span>
          </div>
        </div>

        <div class="ledger-actions">
          <el-button type="primary" text @click="handleEdit(ledger)">✏️ 编辑</el-button>
          <el-button type="danger" text @click="handleDelete(ledger)">🗑️ 删除</el-button>
        </div>
      </div>

      <!-- 创建新账本卡片 -->
      <div class="ledger-card create-card" @click="handleCreate">
        <div class="create-content">
          <div class="create-icon">➕</div>
          <span class="create-text">创建新账本</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="ledgers.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📒</div>
      <h3>还没有账本呢</h3>
      <p>创建你的第一个账本，开始记录生活中的每一笔收支吧~</p>
      <el-button type="primary" round size="large" @click="handleCreate">
        ➕ 创建第一个账本
      </el-button>
    </div>

    <!-- 创建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="账本图标">
          <div class="icon-selector">
            <div
              v-for="icon in iconOptions"
              :key="icon"
              class="icon-option"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label="账本名称" required>
          <el-input v-model="form.name" placeholder="给账本起个名字吧~" maxlength="20" />
        </el-form-item>
        <el-form-item label="账本描述">
          <el-input v-model="form.description" type="textarea" placeholder="简单描述一下这个账本的用途（选填）" :rows="3" maxlength="100" />
        </el-form-item>
        <el-form-item label="关联家庭" v-if="hasFamily">
          <div class="family-link-section">
            <el-switch v-model="linkToFamily" @change="handleLinkFamilyChange" />
            <span class="family-name" v-if="family">{{ family.name }}</span>
          </div>
          <div class="link-tip">
            <el-text type="info" size="small">
              {{ linkToFamily ? '💡 账本将计入家庭统计，家庭成员可见' : '💡 账本仅为个人账本' }}
            </el-text>
          </div>
        </el-form-item>
        <el-form-item v-if="!hasFamily && !editId">
          <div class="no-family-tip">
            <span>💡</span>
            <el-text type="info" size="small">
              加入家庭后可将账本关联到家庭哦~
            </el-text>
          </div>
        </el-form-item>
        <el-form-item label="公开设置" v-if="linkToFamily">
          <el-radio-group v-model="form.isPublic">
            <el-radio :label="1">
              <span>👁️ 公开（家庭成员可见）</span>
            </el-radio>
            <el-radio :label="0">
              <span>🔒 私有（仅自己可见）</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" round @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.ledger-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 24px;
  padding: 32px 40px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);

  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;

    .header-icon {
      font-size: 48px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-info {
      h1 {
        color: #fff;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      p {
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
      }
    }
  }
}

/* 账本网格 */
.ledger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.ledger-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  }

  &.family {
    border-color: rgba(254, 202, 87, 0.5);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 202, 87, 0.05));
  }

  &.create-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    cursor: pointer;
    border: 2px dashed rgba(102, 126, 234, 0.3);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(240, 147, 251, 0.03));

    &:hover {
      border-color: rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(240, 147, 251, 0.08));
    }

    .create-content {
      text-align: center;

      .create-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .create-text {
        color: #667eea;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .ledger-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .ledger-icon {
      font-size: 40px;
    }
  }

  .ledger-body {
    margin-bottom: 20px;

    .ledger-name {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .ledger-desc {
      font-size: 13px;
      color: #7f8c8d;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .ledger-family {
      font-size: 13px;
      color: #667eea;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .ledger-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
    border-radius: 12px;
    margin-bottom: 16px;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 16px;
        font-weight: 700;
        font-family: 'DIN Alternate', 'Courier New', monospace;
      }

      &.income .stat-value { color: #56ab2f; }
      &.expense .stat-value { color: #ff6b6b; }
      &.balance .stat-value {
        &.positive { color: #56ab2f; }
        &.negative { color: #ff6b6b; }
      }
    }
  }

  .ledger-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 22px;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 24px;
  }
}

/* 图标选择器 */
.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .icon-option {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border-radius: 12px;
    cursor: pointer;
    border: 2px solid transparent;
    background: #f8f9fa;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    &.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.15);
    }
  }
}

/* 家庭关联区域 */
.family-link-section {
  display: flex;
  align-items: center;
  gap: 12px;

  .family-name {
    color: #667eea;
    font-weight: 500;
  }
}

.link-tip {
  margin-top: 8px;
}

.no-family-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(254, 202, 87, 0.1);
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;

    .header-content {
      flex-direction: column;
    }
  }

  .ledger-grid {
    grid-template-columns: 1fr;
  }
}
</style>
