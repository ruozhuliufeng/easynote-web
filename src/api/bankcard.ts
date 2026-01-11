import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface BankCard {
  id: number
  bankName: string
  cardType: number // 1:储蓄卡 2:信用卡
  cardTypeName: string
  cardNoSuffix: string
  creditLimit?: number
  remark?: string
  status: number
  createTime: string
}

export interface CreateBankCardParams {
  bankName: string
  cardType: number
  cardNoSuffix: string
  creditLimit?: number
  remark?: string
}

// 获取银行卡列表
export function getBankCards() {
  return get<BankCard[]>('/bank-card')
}

// 创建银行卡
export function createBankCard(params: CreateBankCardParams) {
  return post<BankCard>('/bank-card', params)
}

// 更新银行卡
export function updateBankCard(id: number, params: CreateBankCardParams) {
  return put<BankCard>(`/bank-card/${id}`, params)
}

// 删除银行卡
export function deleteBankCard(id: number) {
  return del<void>(`/bank-card/${id}`)
}
