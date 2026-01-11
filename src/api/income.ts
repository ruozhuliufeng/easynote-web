import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface Income {
  id: number
  ledgerId: number
  ledgerName: string
  userId: number
  userNickname: string
  amount: number
  categoryId: number
  categoryName: string
  categoryIcon: string
  source?: string
  remark?: string
  incomeDate: string
  bankCardId?: number
  bankCardName?: string
  createTime: string
}

export interface CreateIncomeParams {
  ledgerId: number
  amount: number
  categoryId: number
  source?: string
  remark?: string
  incomeDate: string
  bankCardId?: number
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// 获取收入列表
export function getIncomeList(ledgerId: number, pageNum: number = 1, pageSize: number = 20) {
  return get<PageResult<Income>>('/income', { ledgerId, pageNum, pageSize })
}

// 获取收入详情
export function getIncomeDetail(id: number) {
  return get<Income>(`/income/${id}`)
}

// 创建收入
export function createIncome(params: CreateIncomeParams) {
  return post<Income>('/income', params)
}

// 更新收入
export function updateIncome(id: number, params: CreateIncomeParams) {
  return put<Income>(`/income/${id}`, params)
}

// 删除收入
export function deleteIncome(id: number) {
  return del<void>(`/income/${id}`)
}

// 查询参数类型
export interface IncomeQueryParams {
  ledgerId?: number
  categoryId?: number
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

// 获取收入列表 (别名)
export function getIncomes(params?: IncomeQueryParams) {
  return get<PageResult<Income>>('/income', params)
}
