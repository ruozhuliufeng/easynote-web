<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { updateUserInfo, updatePassword } from '@/api/user'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()

// 个人信息表单
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  nickname: userStore.userInfo?.nickname || '',
  phone: userStore.userInfo?.phone || '',
  avatar: userStore.userInfo?.avatar || ''
})
const profileLoading = ref(false)

// 修改密码表单
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleUpdateProfile = async () => {
  profileLoading.value = true
  try {
    const res = await updateUserInfo(profileForm)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      // 更新store中的用户信息
      await userStore.getUserInfo()
    }
  } finally {
    profileLoading.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        const res = await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 清空表单
          passwordForm.oldPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''
          // 退出登录
          setTimeout(() => {
            userStore.logout()
          }, 1500)
        }
      } finally {
        passwordLoading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="setting-page">
    <!-- 个人信息 -->
    <div class="card">
      <div class="card-title">个人信息</div>
      <el-form ref="profileFormRef" :model="profileForm" label-width="80px" style="max-width: 500px">
        <el-form-item label="用户名">
          <el-input :value="userStore.userInfo?.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="profileLoading" @click="handleUpdateProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 修改密码 -->
    <div class="card">
      <div class="card-title">修改密码</div>
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" style="max-width: 500px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="passwordLoading" @click="handleUpdatePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 关于 -->
    <div class="card">
      <div class="card-title">关于</div>
      <div class="about-info">
        <p><strong>简记 EasyNote</strong></p>
        <p>版本：1.0.0</p>
        <p>一款简洁的个人/家庭记账应用</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-page {
  .about-info {
    color: #606266;
    line-height: 2;

    p {
      margin: 0;
    }
  }
}
</style>
