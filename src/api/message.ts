import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface MessageVO {
  id: number
  userId: number
  title: string
  content?: string
  type: number
  typeName: string
  status: number
  statusName: string
  extraData?: Record<string, any>
  createTime: string
}

export interface MessagePageResult {
  records: MessageVO[]
  total: number
  size: number
  current: number
  pages: number
}

// 获取消息列表
export function getMessageList(pageNum: number = 1, pageSize: number = 10, status?: number) {
  const params: Record<string, any> = { pageNum, pageSize }
  if (status !== undefined) {
    params.status = status
  }
  return get<MessagePageResult>('/message/list', params)
}

// 获取未读消息数量
export function getUnreadCount() {
  return get<number>('/message/unread-count')
}

// 标记消息为已读
export function markAsRead(id: number) {
  return put<void>(`/message/${id}/read`)
}

// 标记所有消息为已读
export function markAllAsRead() {
  return put<void>('/message/read-all')
}

// 删除消息
export function deleteMessage(id: number) {
  return del<void>(`/message/${id}`)
}

// 接受家庭邀请
export function acceptFamilyInvite(id: number) {
  return post<void>(`/message/${id}/accept`)
}

// 拒绝家庭邀请
export function rejectFamilyInvite(id: number) {
  return post<void>(`/message/${id}/reject`)
}
