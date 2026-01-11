<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCurrentFamily,
  createFamily,
  updateFamily,
  joinFamily,
  leaveFamily,
  getFamilyMembers,
  removeFamilyMember,
  refreshInviteCode,
  sendInvite,
  type Family,
  type FamilyMember
} from '@/api/family'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const family = ref<Family | null>(null)
const members = ref<FamilyMember[]>([])
const loading = ref(false)

// 弹窗状态
const createDialogVisible = ref(false)
const createForm = ref({ name: '', description: '' })
const editDialogVisible = ref(false)
const editForm = ref({ name: '', description: '' })
const joinDialogVisible = ref(false)
const inviteCode = ref('')
const inviteDialogVisible = ref(false)
const inviteKeyword = ref('')
const memberDetailVisible = ref(false)
const selectedMember = ref<FamilyMember | null>(null)

// 权限判断
const isOwner = computed(() => {
  if (!family.value || !userStore.userInfo?.id) return false
  return family.value.ownerId === userStore.userInfo.id
})

const isAdmin = computed(() => {
  if (!family.value || !userStore.userInfo?.id) return false
  const member = members.value.find(m => m.userId === userStore.userInfo?.id)
  return member ? member.role >= 1 : false
})

// 数据加载
const fetchFamily = async () => {
  loading.value = true
  try {
    const res = await getCurrentFamily()
    family.value = res.data
    if (res.data) {
      fetchMembers()
    }
  } catch {
    family.value = null
  } finally {
    loading.value = false
  }
}

const fetchMembers = async () => {
  if (!family.value) return
  try {
    const res = await getFamilyMembers(family.value.id)
    members.value = res.data || []
  } catch {
    members.value = []
  }
}

// 创建家庭
const handleCreateFamily = () => {
  createForm.value = { name: '', description: '' }
  createDialogVisible.value = true
}

const submitCreateFamily = async () => {
  if (!createForm.value.name) {
    ElMessage.warning('请输入家庭名称')
    return
  }
  try {
    await createFamily(createForm.value)
    ElMessage.success('创建成功！欢迎加入温馨的家~')
    createDialogVisible.value = false
    fetchFamily()
  } catch {}
}

// 编辑家庭
const handleEditFamily = () => {
  if (!family.value) return
  editForm.value = {
    name: family.value.name,
    description: family.value.description || ''
  }
  editDialogVisible.value = true
}

const submitEditFamily = async () => {
  if (!family.value || !editForm.value.name) {
    ElMessage.warning('请输入家庭名称')
    return
  }
  try {
    await updateFamily(editForm.value)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchFamily()
  } catch {}
}

// 加入家庭
const handleJoinFamily = () => {
  inviteCode.value = ''
  joinDialogVisible.value = true
}

const submitJoinFamily = async () => {
  if (!inviteCode.value) {
    ElMessage.warning('请输入邀请码')
    return
  }
  try {
    await joinFamily({ inviteCode: inviteCode.value })
    ElMessage.success('加入成功！欢迎来到新家~')
    joinDialogVisible.value = false
    fetchFamily()
  } catch {}
}

// 退出家庭
const handleLeaveFamily = async () => {
  try {
    await ElMessageBox.confirm('确定要退出当前家庭吗？退出后将无法查看家庭共享的账本', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await leaveFamily()
    ElMessage.success('已退出家庭')
    family.value = null
    members.value = []
  } catch {}
}

// 移除成员
const handleRemoveMember = async (member: FamilyMember) => {
  if (!family.value) return
  try {
    await ElMessageBox.confirm(`确定要移除成员"${member.nickname || member.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await removeFamilyMember(member.userId)
    ElMessage.success('移除成功')
    fetchMembers()
  } catch {}
}

// 邀请码操作
const copyInviteCode = () => {
  if (!family.value?.inviteCode) return
  navigator.clipboard.writeText(family.value.inviteCode)
  ElMessage.success('邀请码已复制')
}

const handleRefreshInviteCode = async () => {
  try {
    await ElMessageBox.confirm('刷新后旧的邀请码将失效，确定要刷新吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await refreshInviteCode()
    if (family.value) {
      family.value.inviteCode = res.data
    }
    ElMessage.success('邀请码已刷新')
  } catch {}
}

// 邀请成员
const handleInviteMember = () => {
  inviteKeyword.value = ''
  inviteDialogVisible.value = true
}

const submitInvite = async () => {
  if (!inviteKeyword.value) {
    ElMessage.warning('请输入手机号或用户名')
    return
  }
  try {
    await sendInvite({ keyword: inviteKeyword.value })
    ElMessage.success('邀请已发送')
    inviteDialogVisible.value = false
  } catch {}
}

// 查看成员详情
const handleViewMember = (member: FamilyMember) => {
  selectedMember.value = member
  memberDetailVisible.value = true
}

// 工具函数
const getRoleName = (role: number) => {
  switch (role) {
    case 2: return '创建者'
    case 1: return '管理员'
    default: return '成员'
  }
}

const getRoleIcon = (role: number) => {
  switch (role) {
    case 2: return '👑'
    case 1: return '⭐'
    default: return '👤'
  }
}

const formatMoney = (value: number | undefined) => {
  if (value === undefined || value === null) return '0.00'
  return value.toFixed(2)
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return '-'
  }
}

onMounted(() => {
  fetchFamily()
})
</script>

<template>
  <div class="family-page" v-loading="loading">
    <!-- 无家庭状态 -->
    <div v-if="!family" class="no-family-state">
      <div class="empty-illustration">
        <div class="house-icon">🏠</div>
        <div class="hearts">
          <span class="heart heart-1">💕</span>
          <span class="heart heart-2">💗</span>
          <span class="heart heart-3">💖</span>
        </div>
      </div>
      <h2 class="empty-title">开启你的家庭记账之旅</h2>
      <p class="empty-desc">创建或加入一个家庭，和家人一起管理财务，让生活更有规划~</p>
      <div class="action-buttons">
        <el-button type="primary" size="large" round @click="handleCreateFamily">
          <span>🏡</span> 创建家庭
        </el-button>
        <el-button size="large" round @click="handleJoinFamily">
          <span>🎫</span> 使用邀请码加入
        </el-button>
      </div>
    </div>

    <!-- 有家庭状态 -->
    <template v-else>
      <!-- 家庭信息卡片 -->
      <div class="family-header-card">
        <div class="family-banner">
          <div class="banner-content">
            <div class="family-icon">🏡</div>
            <div class="family-info">
              <h1 class="family-name">{{ family.name }}</h1>
              <p class="family-desc">{{ family.description || '温馨的家，幸福的开始~' }}</p>
            </div>
          </div>
          <div class="banner-actions" v-if="isOwner">
            <el-button type="primary" round @click="handleEditFamily">
              ✏️ 编辑
            </el-button>
          </div>
          <div class="banner-actions" v-else>
            <el-button type="danger" round @click="handleLeaveFamily">
              退出家庭
            </el-button>
          </div>
          <!-- 装饰元素 -->
          <div class="decoration d1">✨</div>
          <div class="decoration d2">🌸</div>
        </div>

        <!-- 邀请码区域 -->
        <div class="invite-section">
          <div class="invite-label">
            <span class="label-icon">🎫</span>
            <span>家庭邀请码</span>
          </div>
          <div class="invite-code-box">
            <span class="invite-code">{{ family.inviteCode }}</span>
            <div class="invite-actions">
              <el-button type="primary" text @click="copyInviteCode">复制</el-button>
              <el-button v-if="isOwner" type="warning" text @click="handleRefreshInviteCode">刷新</el-button>
            </div>
          </div>
          <p class="invite-tip">分享邀请码给家人，一起开启幸福记账生活</p>
        </div>
      </div>

      <!-- 成员列表 -->
      <div class="card members-card">
        <div class="card-title">
          <span>👨‍👩‍👧‍👦 家庭成员</span>
          <div class="title-actions">
            <span class="member-count">{{ members.length }} 人</span>
            <el-button v-if="isAdmin" type="primary" round size="small" @click="handleInviteMember">
              ➕ 邀请成员
            </el-button>
          </div>
        </div>

        <div class="members-grid">
          <div
            v-for="member in members"
            :key="member.id"
            class="member-card"
            :class="{ owner: member.role === 2, admin: member.role === 1 }"
            @click="handleViewMember(member)"
          >
            <div class="member-avatar">
              <el-avatar :size="56">
                {{ (member.nickname || member.username || '?').charAt(0) }}
              </el-avatar>
              <span class="role-badge">{{ getRoleIcon(member.role) }}</span>
            </div>
            <div class="member-info">
              <div class="member-name">{{ member.nickname || member.username }}</div>
              <el-tag
                :type="member.role === 2 ? 'warning' : member.role === 1 ? 'success' : 'info'"
                size="small"
                round
              >
                {{ member.roleName || getRoleName(member.role) }}
              </el-tag>
            </div>
            <div class="member-stats">
              <div class="stat-row">
                <span class="stat-label">收入</span>
                <span class="stat-value income">+{{ formatMoney(member.totalIncome) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">支出</span>
                <span class="stat-value expense">-{{ formatMoney(member.totalExpense) }}</span>
              </div>
              <div class="stat-row balance">
                <span class="stat-label">结余</span>
                <span
                  class="stat-value"
                  :class="{ positive: (member.balance || 0) >= 0, negative: (member.balance || 0) < 0 }"
                >
                  {{ (member.balance || 0) >= 0 ? '+' : '' }}{{ formatMoney(member.balance) }}
                </span>
              </div>
            </div>
            <div class="member-actions" v-if="isOwner && member.role !== 2">
              <el-button type="danger" text size="small" @click.stop="handleRemoveMember(member)">
                移除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 创建家庭弹窗 -->
    <el-dialog v-model="createDialogVisible" title="🏡 创建家庭" width="450px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="家庭名称" required>
          <el-input v-model="createForm.name" placeholder="给你的家起个温馨的名字吧~" maxlength="20" />
        </el-form-item>
        <el-form-item label="家庭描述">
          <el-input v-model="createForm.description" type="textarea" placeholder="描述一下你们的小家（选填）" :rows="3" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" round @click="submitCreateFamily">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑家庭弹窗 -->
    <el-dialog v-model="editDialogVisible" title="✏️ 编辑家庭" width="450px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="家庭名称" required>
          <el-input v-model="editForm.name" placeholder="家庭名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="家庭描述">
          <el-input v-model="editForm.description" type="textarea" placeholder="家庭描述" :rows="3" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" round @click="submitEditFamily">保存</el-button>
      </template>
    </el-dialog>

    <!-- 加入家庭弹窗 -->
    <el-dialog v-model="joinDialogVisible" title="🎫 加入家庭" width="450px">
      <el-form label-width="80px">
        <el-form-item label="邀请码" required>
          <el-input v-model="inviteCode" placeholder="请输入家庭邀请码" maxlength="20" />
        </el-form-item>
        <el-form-item>
          <el-text type="info" size="small">
            💡 向家人索取邀请码即可加入
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="joinDialogVisible = false">取消</el-button>
        <el-button type="primary" round @click="submitJoinFamily">加入</el-button>
      </template>
    </el-dialog>

    <!-- 邀请成员弹窗 -->
    <el-dialog v-model="inviteDialogVisible" title="➕ 邀请成员" width="450px">
      <el-form label-width="100px">
        <el-form-item label="手机号/用户名" required>
          <el-input v-model="inviteKeyword" placeholder="请输入对方的手机号或用户名" />
        </el-form-item>
        <el-form-item>
          <el-text type="info" size="small">
            💌 邀请发送后，对方将在消息中心收到邀请通知
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" round @click="submitInvite">发送邀请</el-button>
      </template>
    </el-dialog>

    <!-- 成员详情弹窗 -->
    <el-dialog v-model="memberDetailVisible" title="👤 成员详情" width="480px">
      <template v-if="selectedMember">
        <div class="member-detail-content">
          <div class="detail-header">
            <el-avatar :size="80">
              {{ (selectedMember.nickname || selectedMember.username || '?').charAt(0) }}
            </el-avatar>
            <div class="detail-info">
              <h3>{{ selectedMember.nickname || selectedMember.username }}</h3>
              <el-tag
                :type="selectedMember.role === 2 ? 'warning' : selectedMember.role === 1 ? 'success' : 'info'"
                round
              >
                {{ getRoleIcon(selectedMember.role) }} {{ selectedMember.roleName || getRoleName(selectedMember.role) }}
              </el-tag>
            </div>
          </div>

          <div class="detail-stats">
            <div class="stat-card income">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-label">总收入</div>
                <div class="stat-value">+{{ formatMoney(selectedMember.totalIncome) }}</div>
              </div>
            </div>
            <div class="stat-card expense">
              <div class="stat-icon">📉</div>
              <div class="stat-info">
                <div class="stat-label">总支出</div>
                <div class="stat-value">-{{ formatMoney(selectedMember.totalExpense) }}</div>
              </div>
            </div>
            <div class="stat-card balance">
              <div class="stat-icon">💎</div>
              <div class="stat-info">
                <div class="stat-label">结余</div>
                <div class="stat-value" :class="{ positive: (selectedMember.balance || 0) >= 0, negative: (selectedMember.balance || 0) < 0 }">
                  {{ (selectedMember.balance || 0) >= 0 ? '+' : '' }}{{ formatMoney(selectedMember.balance) }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">📅 加入时间</span>
              <span class="meta-value">{{ formatDateTime(selectedMember.joinTime) }}</span>
            </div>
          </div>

          <div class="detail-tip">
            💡 以上数据统计自该成员在家庭关联账本中的收支记录
          </div>
        </div>
      </template>
      <template #footer>
        <el-button type="primary" round @click="memberDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.family-page {
  max-width: 1000px;
  margin: 0 auto;
}

/* 无家庭状态 */
.no-family-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  .empty-illustration {
    position: relative;
    margin-bottom: 24px;

    .house-icon {
      font-size: 80px;
      animation: bounce 2s ease-in-out infinite;
    }

    .hearts {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);

      .heart {
        position: absolute;
        font-size: 20px;
        animation: float-up 3s ease-in-out infinite;

        &.heart-1 { left: -30px; animation-delay: 0s; }
        &.heart-2 { left: 0; animation-delay: 1s; }
        &.heart-3 { left: 30px; animation-delay: 2s; }
      }
    }
  }

  .empty-title {
    font-size: 24px;
    color: #2c3e50;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .empty-desc {
    color: #7f8c8d;
    margin-bottom: 32px;
    font-size: 15px;
  }

  .action-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;

    .el-button {
      padding: 12px 28px;
      font-size: 15px;

      span {
        margin-right: 8px;
      }
    }
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-up {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-30px); }
}

/* 家庭信息卡片 */
.family-header-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  .family-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    padding: 32px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .banner-content {
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 1;

      .family-icon {
        font-size: 56px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .family-info {
        .family-name {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .family-desc {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
        }
      }
    }

    .banner-actions {
      z-index: 1;
    }

    .decoration {
      position: absolute;
      font-size: 24px;
      opacity: 0.6;
      animation: float 3s ease-in-out infinite;

      &.d1 { top: 20px; right: 100px; }
      &.d2 { bottom: 20px; right: 50px; animation-delay: 1.5s; }
    }
  }

  .invite-section {
    padding: 24px 32px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));

    .invite-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #7f8c8d;
      margin-bottom: 12px;

      .label-icon {
        font-size: 18px;
      }
    }

    .invite-code-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      padding: 16px 20px;
      border-radius: 12px;
      border: 2px dashed rgba(102, 126, 234, 0.3);
      margin-bottom: 8px;

      .invite-code {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 4px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: 'Courier New', monospace;
      }
    }

    .invite-tip {
      font-size: 12px;
      color: #bdc3c7;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}

/* 成员卡片 */
.members-card {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .member-count {
        color: #7f8c8d;
        font-size: 14px;
      }
    }
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .member-card {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(240, 147, 251, 0.03));
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(102, 126, 234, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
      border-color: rgba(102, 126, 234, 0.3);
    }

    &.owner {
      border-color: rgba(254, 202, 87, 0.5);
      background: linear-gradient(135deg, rgba(254, 202, 87, 0.08), rgba(255, 107, 107, 0.05));
    }

    .member-avatar {
      position: relative;
      display: inline-block;
      margin-bottom: 12px;

      .role-badge {
        position: absolute;
        bottom: -4px;
        right: -4px;
        font-size: 18px;
      }
    }

    .member-info {
      margin-bottom: 16px;

      .member-name {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
      }
    }

    .member-stats {
      .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;

        .stat-label {
          color: #7f8c8d;
        }

        .stat-value {
          font-weight: 600;
          font-family: 'DIN Alternate', 'Courier New', monospace;

          &.income { color: #56ab2f; }
          &.expense { color: #ff6b6b; }
          &.positive { color: #56ab2f; }
          &.negative { color: #ff6b6b; }
        }

        &.balance {
          padding-top: 8px;
          border-top: 1px dashed rgba(102, 126, 234, 0.2);
        }
      }
    }

    .member-actions {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }
}

/* 成员详情 */
.member-detail-content {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;

    .detail-info {
      h3 {
        font-size: 22px;
        margin-bottom: 8px;
        color: #2c3e50;
      }
    }
  }

  .detail-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;

    .stat-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      text-align: center;

      .stat-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
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

  .detail-meta {
    margin-bottom: 16px;

    .meta-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;

      .meta-label {
        color: #7f8c8d;
      }

      .meta-value {
        color: #2c3e50;
        font-weight: 500;
      }
    }
  }

  .detail-tip {
    text-align: center;
    font-size: 13px;
    color: #bdc3c7;
    padding: 12px;
    background: rgba(254, 202, 87, 0.1);
    border-radius: 8px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .family-header-card .family-banner {
    flex-direction: column;
    gap: 20px;
    text-align: center;

    .banner-content {
      flex-direction: column;
    }
  }

  .members-grid {
    grid-template-columns: 1fr !important;
  }

  .detail-stats {
    grid-template-columns: 1fr !important;
  }
}
</style>
