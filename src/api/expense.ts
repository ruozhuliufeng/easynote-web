import { get, post, put, del } from '@/utils/request'

// 类型定义
export interface Expense {
  id: number
  ledgerId: number
  ledgerName: string
  userId: number
  userNickname: string
  amount: number
  categoryId: number
  categoryName: string
  categoryIcon: string
  purpose?: string
  remark?: string
  expenseDate: string
  bankCardId?: number
  bankCardName?: string
  createTime: string
}

export interface CreateExpenseParams {
  ledgerId: number
  amount: number
  categoryId: number
  purpose?: string
  remark?: string
  expenseDate: string
  bankCardId?: number
}

export interface PageResult<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// 获取支出列表
export function getExpenseList(ledgerId: number, pageNum: number = 1, pageSize: number = 20) {
  return get<PageResult<Expense>>('/expense', { ledgerId, pageNum, pageSize })
}

// 获取支出详情
export function getExpenseDetail(id: number) {
  return get<Expense>(`/expense/${id}`)
}

// 创建支出
export function createExpense(params: CreateExpenseParams) {
  return post<Expense>('/expense', params)
}

// 更新支出
export function updateExpense(id: number, params: CreateExpenseParams) {
  return put<Expense>(`/expense/${id}`, params)
}

// 删除支出
export function deleteExpense(id: number) {
  return del<void>(`/expense/${id}`)
}

// 查询参数类型
export interface ExpenseQueryParams {
  ledgerId?: number
  categoryId?: number
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

// 获取支出列表 (别名)
export function getExpenses(params?: ExpenseQueryParams) {
  return get<PageResult<Expense>>('/expense', params)
}
