import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface FamilyMember {
  id: number
  userId: number
  username: string
  nickname: string
  avatar?: string
  role: number
  roleName: string
  joinTime: string
  totalIncome?: number
  totalExpense?: number
  balance?: number
}

export interface Family {
  id: number
  name: string
  description?: string
  ownerId: number
  ownerNickname: string
  inviteCode: string
  memberCount: number
  members: FamilyMember[]
  createTime: string
}

export interface CreateFamilyParams {
  name: string
  description?: string
}

export interface UpdateFamilyParams {
  name?: string
  description?: string
}

export interface JoinFamilyParams {
  inviteCode: string
}

export interface SendInviteParams {
  keyword: string
}

// 获取当前用户家庭
export function getCurrentFamily() {
  return get<Family>('/family/current')
}

// 创建家庭
export function createFamily(params: CreateFamilyParams) {
  return post<Family>('/family', params)
}

// 更新家庭
export function updateFamily(params: UpdateFamilyParams) {
  return put<Family>('/family', params)
}

// 加入家庭
export function joinFamily(params: JoinFamilyParams) {
  return post<Family>('/family/join', params)
}

// 退出家庭
export function leaveFamily() {
  return post<void>('/family/leave')
}

// 移除成员 (userId作为参数)
export function removeMember(userId: number) {
  return del<void>(`/family/member/${userId}`)
}

// 解散家庭
export function dissolveFamily() {
  return del<void>('/family')
}

// 刷新邀请码
export function refreshInviteCode() {
  return post<string>('/family/refresh-invite-code')
}

// 发送家庭邀请
export function sendInvite(params: SendInviteParams) {
  return post<void>('/family/invite', params)
}

// 获取家庭成员列表
export function getFamilyMembers(familyId: number) {
  return get<FamilyMember[]>(`/family/${familyId}/members`)
}

// 移除家庭成员 (别名，使用userId)
export function removeFamilyMember(userId: number) {
  return del<void>(`/family/member/${userId}`)
}
