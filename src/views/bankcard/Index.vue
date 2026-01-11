<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBankCards, createBankCard, updateBankCard, deleteBankCard, type BankCard, type CreateBankCardParams } from '@/api/bankcard'

const bankCards = ref<BankCard[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加银行卡')
const editId = ref<number | null>(null)

const form = ref<CreateBankCardParams>({
  cardNumber: '',
  bankName: '',
  cardType: 1,
  balance: 0,
  creditLimit: undefined,
  remark: ''
})

// 常用银行列表
const banks = [
  '中国工商银行', '中国建设银行', '中国农业银行', '中国银行',
  '交通银行', '招商银行', '中国邮政储蓄银行', '浦发银行',
  '中信银行', '光大银行', '华夏银行', '民生银行',
  '兴业银行', '平安银行', '广发银行', '其他'
]

const fetchBankCards = async () => {
  loading.value = true
  try {
    const res = await getBankCards()
    if (res.code === 200) {
      bankCards.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  editId.value = null
  dialogTitle.value = '添加银行卡'
  form.value = {
    cardNumber: '',
    bankName: '',
    cardType: 1,
    balance: 0,
    creditLimit: undefined,
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: BankCard) => {
  editId.value = row.id
  dialogTitle.value = '编辑银行卡'
  form.value = {
    cardNumber: row.cardNumber,
    bankName: row.bankName,
    cardType: row.cardType,
    balance: row.balance,
    creditLimit: row.creditLimit,
    remark: row.remark || ''
  }
  dialogVisible.value = true
}

const handleDelete = async (row: BankCard) => {
  try {
    await ElMessageBox.confirm(`确定要删除银行卡"${row.bankName}(${row.cardNumber.slice(-4)})"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteBankCard(row.id)
    ElMessage.success('删除成功')
    fetchBankCards()
  } catch {
    // 取消删除
  }
}

const handleSubmit = async () => {
  if (!form.value.cardNumber) {
    ElMessage.warning('请输入卡号')
    return
  }
  if (!form.value.bankName) {
    ElMessage.warning('请选择或输入银行名称')
    return
  }

  try {
    if (editId.value) {
      await updateBankCard(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createBankCard(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchBankCards()
  } catch {
    // 错误已在拦截器处理
  }
}

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatCardNumber = (cardNumber: string) => {
  // 只显示后4位
  return `**** **** **** ${cardNumber.slice(-4)}`
}

const getCardTypeText = (type: number) => {
  return type === 1 ? '储蓄卡' : '信用卡'
}

const getCardTypeTag = (type: number) => {
  return type === 1 ? 'success' : 'warning'
}

onMounted(() => {
  fetchBankCards()
})
</script>

<template>
  <div class="bankcard-page">
    <div class="card">
      <div class="card-title">
        银行卡管理
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>添加银行卡
        </el-button>
      </div>

      <!-- 银行卡列表 -->
      <div class="card-list" v-loading="loading">
        <div v-for="card in bankCards" :key="card.id" class="bank-card" :class="{ credit: card.cardType === 2 }">
          <div class="card-header">
            <span class="bank-name">{{ card.bankName }}</span>
            <el-tag :type="getCardTypeTag(card.cardType)" size="small">{{ getCardTypeText(card.cardType) }}</el-tag>
          </div>
          <div class="card-number">{{ formatCardNumber(card.cardNumber) }}</div>
          <div class="card-info">
            <div class="balance">
              <span class="label">余额</span>
              <span class="value" :class="{ negative: card.balance < 0 }">¥ {{ formatMoney(card.balance) }}</span>
            </div>
            <div v-if="card.cardType === 2 && card.creditLimit" class="credit-limit">
              <span class="label">额度</span>
              <span class="value">¥ {{ formatMoney(card.creditLimit) }}</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button type="primary" link size="small" @click="handleEdit(card)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(card)">删除</el-button>
          </div>
        </div>

        <el-empty v-if="bankCards.length === 0 && !loading" description="暂无银行卡">
          <el-button type="primary" @click="handleCreate">添加银行卡</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="银行名称" required>
          <el-select v-model="form.bankName" filterable allow-create placeholder="请选择或输入银行" style="width: 100%">
            <el-option v-for="bank in banks" :key="bank" :label="bank" :value="bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡号" required>
          <el-input v-model="form.cardNumber" placeholder="请输入银行卡号" maxlength="20" />
        </el-form-item>
        <el-form-item label="卡片类型" required>
          <el-radio-group v-model="form.cardType">
            <el-radio :label="1">储蓄卡</el-radio>
            <el-radio :label="2">信用卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当前余额">
          <el-input-number v-model="form.balance" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="form.cardType === 2" label="信用额度">
          <el-input-number v-model="form.creditLimit" :min="0" :precision="2" placeholder="请输入信用额度" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="2" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.bankcard-page {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-top: 10px;
  }

  .bank-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    position: relative;
    min-height: 180px;
    display: flex;
    flex-direction: column;

    &.credit {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .bank-name {
        font-size: 18px;
        font-weight: 500;
      }
    }

    .card-number {
      font-size: 20px;
      font-family: monospace;
      letter-spacing: 2px;
      margin-bottom: 20px;
    }

    .card-info {
      display: flex;
      gap: 30px;
      margin-bottom: 15px;

      .balance, .credit-limit {
        .label {
          font-size: 12px;
          opacity: 0.8;
          display: block;
          margin-bottom: 4px;
        }

        .value {
          font-size: 18px;
          font-weight: 500;

          &.negative {
            color: #ffd666;
          }
        }
      }
    }

    .card-actions {
      margin-top: auto;
      display: flex;
      gap: 10px;

      .el-button {
        color: rgba(255, 255, 255, 0.9);

        &:hover {
          color: #fff;
        }
      }
    }
  }
}
</style>
