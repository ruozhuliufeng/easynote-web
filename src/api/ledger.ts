import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface Ledger {
  id: number
  userId: number
  userNickname: string
  familyId?: number
  familyName?: string
  name: string
  icon?: string
  description?: string
  isPublic: number
  isFamilyLedger: boolean
  totalIncome: number
  totalExpense: number
  balance: number
  status: number
  createTime: string
}

export interface CreateLedgerParams {
  name: string
  icon?: string
  description?: string
  familyId?: number
  isPublic?: number
}

export interface UpdateLedgerParams {
  name?: string
  icon?: string
  description?: string
  familyId?: number | null
  unlinkFamily?: boolean
  isPublic?: number
}

// 获取账本列表
export function getLedgers() {
  return get<Ledger[]>('/ledger/my')
}

// 获取账本详情
export function getLedgerDetail(id: number) {
  return get<Ledger>(`/ledger/${id}`)
}

// 创建账本
export function createLedger(params: CreateLedgerParams) {
  return post<Ledger>('/ledger', params)
}

// 更新账本
export function updateLedger(id: number, params: UpdateLedgerParams) {
  return put<Ledger>(`/ledger/${id}`, params)
}

// 删除账本
export function deleteLedger(id: number) {
  return del<void>(`/ledger/${id}`)
}

// 获取账本详情 (别名)
export function getLedger(id: number) {
  return get<Ledger>(`/ledger/${id}`)
}
