import { get, post, del } from '@/utils/request'

// 类型定义
export interface Category {
  id: number
  name: string
  type: number // 1:收入 2:支出
  icon?: string
  parentId: number
  sort: number
  isSystem: boolean
  children?: Category[]
}

export interface CreateCategoryParams {
  name: string
  type: number
  icon?: string
  parentId?: number
  sort?: number
}

// 获取分类列表
export function getCategories(type?: number) {
  return get<Category[]>('/category', { type })
}

// 创建分类
export function createCategory(params: CreateCategoryParams) {
  return post<Category>('/category', params)
}

// 删除分类
export function deleteCategory(id: number) {
  return del<void>(`/category/${id}`)
}

// 更新分类
export function updateCategory(id: number, params: CreateCategoryParams) {
  return post<Category>(`/category/${id}`, params)
}
