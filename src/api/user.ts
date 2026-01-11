import { get, post, put } from '@/utils/request'

// 类型定义
export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  confirmPassword: string
  phone?: string
  nickname?: string
}

export interface UserInfo {
  id: number
  username: string
  phone?: string
  avatar?: string
  nickname: string
  email?: string
  status: number
  familyId?: number
  familyName?: string
  createTime: string
}

export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  userInfo: UserInfo
}

export interface UpdateUserParams {
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
}

export interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 登录
export function login(params: LoginParams) {
  return post<LoginResult>('/auth/login', params)
}

// 注册
export function register(params: RegisterParams) {
  return post<LoginResult>('/auth/register', params)
}

// 登出
export function logout() {
  return post<void>('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser() {
  return get<UserInfo>('/user/current')
}

// 更新用户信息
export function updateUser(params: UpdateUserParams) {
  return put<UserInfo>('/user/current', params)
}

// 修改密码
export function updatePassword(params: UpdatePasswordParams) {
  return put<void>('/user/password', params)
}

// 更新用户信息 (别名)
export function updateUserInfo(params: UpdateUserParams) {
  return put<UserInfo>('/user/current', params)
}
