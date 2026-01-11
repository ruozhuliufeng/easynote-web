<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLedger, type Ledger } from '@/api/ledger'

const route = useRoute()
const router = useRouter()
const ledger = ref<Ledger | null>(null)
const loading = ref(false)

const fetchLedger = async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.push('/ledger')
    return
  }

  loading.value = true
  try {
    const res = await getLedger(id)
    if (res.code === 200) {
      ledger.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  fetchLedger()
})
</script>

<template>
  <div class="ledger-detail" v-loading="loading">
    <div v-if="ledger" class="card">
      <div class="card-title">{{ ledger.name }}</div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="账本类型">
          <el-tag :type="ledger.isFamilyLedger ? 'warning' : 'info'">
            {{ ledger.isFamilyLedger ? '家庭账本' : '个人账本' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="公开状态">
          {{ ledger.isPublic ? '公开' : '私有' }}
        </el-descriptions-item>
        <el-descriptions-item label="总收入">
          <span style="color: #67C23A">¥ {{ formatMoney(ledger.totalIncome) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="总支出">
          <span style="color: #F56C6C">¥ {{ formatMoney(ledger.totalExpense) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="结余" :span="2">
          <span :style="{ color: ledger.balance >= 0 ? '#67C23A' : '#F56C6C', fontSize: '18px', fontWeight: 'bold' }">
            ¥ {{ formatMoney(ledger.balance) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ ledger.description || '暂无描述' }}
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px">
        <el-button @click="router.push('/ledger')">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ledger-detail {
  .card-title {
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
