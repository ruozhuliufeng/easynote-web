<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMessageList,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  acceptFamilyInvite,
  rejectFamilyInvite
} from '@/api/message'
import type { MessageVO } from '@/api/message'

const loading = ref(false)
const messageList = ref<MessageVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filterStatus = ref<number | undefined>(undefined)
const unreadCount = ref(0)

// 获取消息表情图标
const getMessageEmoji = (type: number) => {
  switch (type) {
    case 1: return '📢' // 系统通知
    case 2: return '👨‍👩‍👧‍👦' // 家庭邀请
    default: return '💌'
  }
}

// 获取消息类型样式
const getMessageTypeClass = (type: number) => {
  switch (type) {
    case 1: return 'system'
    case 2: return 'family'
    default: return 'other'
  }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  } else if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前'
  } else {
    return date.toLocaleDateString()
  }
}

// 加载消息列表
const loadMessages = async () => {
  loading.value = true
  try {
    const res = await getMessageList(currentPage.value, pageSize.value, filterStatus.value)
    messageList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

// 标记单条消息已读
const handleMarkRead = async (message: MessageVO) => {
  try {
    await markAsRead(message.id)
    ElMessage.success('已标记为已读')
    loadMessages()
    loadUnreadCount()
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

// 标记全部已读
const handleMarkAllRead = async () => {
  try {
    await markAllAsRead()
    ElMessage.success('已全部标记为已读')
    loadMessages()
    loadUnreadCount()
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

// 删除消息
const handleDelete = async (message: MessageVO) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteMessage(message.id)
    ElMessage.success('删除成功')
    loadMessages()
    loadUnreadCount()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete message:', error)
    }
  }
}

// 接受家庭邀请
const handleAccept = async (message: MessageVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要接受邀请加入家庭「${message.extraData?.familyName}」吗？`,
      '💌 接受邀请',
      {
        confirmButtonText: '加入家庭',
        cancelButtonText: '再想想',
        type: 'info'
      }
    )
    await acceptFamilyInvite(message.id)
    ElMessage.success('欢迎加入新家庭~')
    loadMessages()
    loadUnreadCount()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to accept invite:', error)
    }
  }
}

// 拒绝家庭邀请
const handleReject = async (message: MessageVO) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个邀请吗？', '拒绝邀请', {
      confirmButtonText: '确定拒绝',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await rejectFamilyInvite(message.id)
    ElMessage.success('已拒绝邀请')
    loadMessages()
    loadUnreadCount()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to reject invite:', error)
    }
  }
}

// 筛选变化
const handleFilterChange = (status: number | undefined) => {
  filterStatus.value = status
  currentPage.value = 1
  loadMessages()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadMessages()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadMessages()
}

onMounted(() => {
  loadMessages()
  loadUnreadCount()
})
</script>

<template>
  <div class="message-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">💌</div>
        <div class="header-info">
          <h1>消息中心</h1>
          <p>查看系统通知和家庭邀请，不错过任何重要消息</p>
        </div>
      </div>
      <el-button
        v-if="unreadCount > 0"
        type="primary"
        round
        size="large"
        @click="handleMarkAllRead"
      >
        ✨ 全部已读
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <div
          class="filter-tab"
          :class="{ active: filterStatus === undefined }"
          @click="handleFilterChange(undefined)"
        >
          <span class="tab-icon">📬</span>
          <span class="tab-label">全部消息</span>
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 0 }"
          @click="handleFilterChange(0)"
        >
          <span class="tab-icon">🔔</span>
          <span class="tab-label">未读</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 1 }"
          @click="handleFilterChange(1)"
        >
          <span class="tab-icon">✅</span>
          <span class="tab-label">已读</span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-loading="loading">
      <!-- 空状态 -->
      <div v-if="messageList.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无消息</h3>
        <p>目前没有新的消息通知哦~</p>
      </div>

      <!-- 消息卡片列表 -->
      <div v-else class="messages-container">
        <div
          v-for="message in messageList"
          :key="message.id"
          class="message-card"
          :class="[
            getMessageTypeClass(message.type),
            { unread: message.status === 0 }
          ]"
        >
          <!-- 未读指示器 -->
          <div v-if="message.status === 0" class="unread-indicator"></div>

          <div class="message-main">
            <div class="message-avatar" :class="getMessageTypeClass(message.type)">
              {{ getMessageEmoji(message.type) }}
            </div>

            <div class="message-body">
              <div class="message-header">
                <span class="message-title">{{ message.title }}</span>
                <el-tag
                  :type="message.type === 2 ? 'warning' : 'info'"
                  size="small"
                  round
                >
                  {{ message.typeName }}
                </el-tag>
              </div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-meta">
                <span class="message-time">
                  <span class="time-icon">🕐</span>
                  {{ formatTime(message.createTime) }}
                </span>
                <span v-if="message.status === 0" class="status-tag unread">
                  <span class="dot"></span>
                  未读
                </span>
                <span v-else class="status-tag read">已读</span>
              </div>
            </div>
          </div>

          <div class="message-actions">
            <!-- 家庭邀请的操作按钮 -->
            <template v-if="message.type === 2 && message.status === 0">
              <el-button type="primary" round @click="handleAccept(message)">
                🎉 接受邀请
              </el-button>
              <el-button round @click="handleReject(message)">
                婉拒
              </el-button>
            </template>

            <!-- 其他消息的操作按钮 -->
            <template v-else>
              <el-button
                v-if="message.status === 0"
                type="primary"
                text
                @click="handleMarkRead(message)"
              >
                ✓ 标记已读
              </el-button>
              <el-button type="danger" text @click="handleDelete(message)">
                🗑️ 删除
              </el-button>
            </template>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 温馨提示 -->
    <div class="tips-section">
      <div class="tip-card">
        <span class="tip-icon">💡</span>
        <span class="tip-text">家庭邀请消息请及时处理，邀请码可能会过期哦~</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-page {
  max-width: 1000px;
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

/* 筛选栏 */
.filter-section {
  margin-bottom: 20px;

  .filter-tabs {
    display: flex;
    gap: 12px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .filter-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: rgba(102, 126, 234, 0.08);
    }

    &.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;

      .tab-label {
        color: #fff;
      }

      .unread-badge {
        background: #fff;
        color: #667eea;
      }
    }

    .tab-icon {
      font-size: 18px;
    }

    .tab-label {
      font-weight: 500;
      color: #2c3e50;
    }

    .unread-badge {
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }
  }
}

/* 消息列表 */
.message-list {
  min-height: 400px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  }

  &.unread {
    border-left: 4px solid #667eea;
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), rgba(255, 255, 255, 0.95));
  }

  &.family {
    &.unread {
      border-left-color: #feca57;
      background: linear-gradient(90deg, rgba(254, 202, 87, 0.08), rgba(255, 255, 255, 0.95));
    }
  }

  .unread-indicator {
    position: absolute;
    top: 24px;
    left: 0;
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  &.family .unread-indicator {
    background: #feca57;
  }

  .message-main {
    display: flex;
    gap: 16px;
  }

  .message-avatar {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    flex-shrink: 0;

    &.system {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
    }

    &.family {
      background: linear-gradient(135deg, rgba(254, 202, 87, 0.2), rgba(255, 107, 107, 0.15));
    }

    &.other {
      background: linear-gradient(135deg, rgba(168, 230, 207, 0.2), rgba(102, 126, 234, 0.1));
    }
  }

  .message-body {
    flex: 1;
    min-width: 0;

    .message-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .message-title {
        font-size: 17px;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .message-content {
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .message-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;

      .message-time {
        color: #bdc3c7;
        display: flex;
        align-items: center;
        gap: 4px;

        .time-icon {
          font-size: 14px;
        }
      }

      .status-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        &.unread {
          color: #667eea;

          .dot {
            width: 6px;
            height: 6px;
            background: #667eea;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          }
        }

        &.read {
          color: #bdc3c7;
        }
      }
    }
  }

  .message-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed rgba(102, 126, 234, 0.15);
    justify-content: flex-end;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    animation: bounce 2s ease-in-out infinite;
  }

  h3 {
    font-size: 22px;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  p {
    color: #7f8c8d;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 分页 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* 温馨提示 */
.tips-section {
  margin-top: 24px;

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
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    padding: 24px;

    .header-content {
      flex-direction: column;
    }
  }

  .filter-tabs {
    flex-direction: column;
  }

  .message-card {
    padding: 16px;

    .message-main {
      flex-direction: column;
    }

    .message-actions {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
