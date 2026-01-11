<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExpenses, createExpense, updateExpense, deleteExpense, type Expense, type CreateExpenseParams, type ExpenseQueryParams } from '@/api/expense'
import { getLedgers, type Ledger } from '@/api/ledger'
import { getCategories, type Category } from '@/api/category'
import { getBankCards, type BankCard } from '@/api/bankcard'

const expenses = ref<Expense[]>([])
const ledgers = ref<Ledger[]>([])
const categories = ref<Category[]>([])
const bankCards = ref<BankCard[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('记录支出')
const editId = ref<number | null>(null)
const total = ref(0)

const queryParams = ref<ExpenseQueryParams>({
  ledgerId: undefined,
  categoryId: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  size: 10
})

const dateRange = ref<[string, string] | null>(null)

const form = ref<CreateExpenseParams>({
  ledgerId: undefined as unknown as number,
  categoryId: undefined,
  bankCardId: undefined,
  amount: 0,
  purpose: '',
  remark: '',
  expenseDate: new Date().toISOString().split('T')[0]
})

// 支出分类
const expenseCategories = computed(() =>
  categories.value.filter(c => c.type === 2)
)

const fetchExpenses = async () => {
  loading.value = true
  try {
    const params = { ...queryParams.value }
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await getExpenses(params)
    if (res.code === 200) {
      expenses.value = res.data?.records || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

const fetchLedgers = async () => {
  const res = await getLedgers()
  if (res.code === 200) {
    ledgers.value = res.data || []
  }
}

const fetchCategories = async () => {
  const res = await getCategories()
  if (res.code === 200) {
    categories.value = res.data || []
  }
}

const fetchBankCards = async () => {
  const res = await getBankCards()
  if (res.code === 200) {
    bankCards.value = res.data || []
  }
}

const handleQuery = () => {
  queryParams.value.page = 1
  fetchExpenses()
}

const handleReset = () => {
  queryParams.value = {
    ledgerId: undefined,
    categoryId: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    size: 10
  }
  dateRange.value = null
  fetchExpenses()
}

const handleCreate = () => {
  editId.value = null
  dialogTitle.value = '记录支出'
  form.value = {
    ledgerId: ledgers.value[0]?.id as number,
    categoryId: undefined,
    bankCardId: undefined,
    amount: 0,
    purpose: '',
    remark: '',
    expenseDate: new Date().toISOString().split('T')[0]
  }
  dialogVisible.value = true
}

const handleEdit = (row: Expense) => {
  editId.value = row.id
  dialogTitle.value = '编辑支出'
  form.value = {
    ledgerId: row.ledgerId,
    categoryId: row.categoryId,
    bankCardId: row.bankCardId,
    amount: row.amount,
    purpose: row.purpose || '',
    remark: row.remark || '',
    expenseDate: row.expenseDate
  }
  dialogVisible.value = true
}

const handleDelete = async (row: Expense) => {
  try {
    await ElMessageBox.confirm('确定要删除这条支出记录吗？删除后数据无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteExpense(row.id)
    ElMessage.success('删除成功')
    fetchExpenses()
  } catch {
    // 取消删除
  }
}

const handleSubmit = async () => {
  if (!form.value.ledgerId) {
    ElMessage.warning('请选择账本')
    return
  }
  if (!form.value.amount || form.value.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  try {
    if (editId.value) {
      await updateExpense(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createExpense(form.value)
      ElMessage.success('记录成功')
    }
    dialogVisible.value = false
    fetchExpenses()
  } catch {
    // 错误已在拦截器处理
  }
}

const handlePageChange = (page: number) => {
  queryParams.value.page = page
  fetchExpenses()
}

const handleSizeChange = (size: number) => {
  queryParams.value.size = size
  queryParams.value.page = 1
  fetchExpenses()
}

const formatMoney = (value: number) => {
  return (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getCategoryName = (categoryId: number | undefined) => {
  if (!categoryId) return '-'
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || '-'
}

const getLedgerName = (ledgerId: number) => {
  const ledger = ledgers.value.find(l => l.id === ledgerId)
  return ledger?.name || '-'
}

const getBankCardName = (bankCardId: number | undefined) => {
  if (!bankCardId) return '-'
  const card = bankCards.value.find(c => c.id === bankCardId)
  return card ? `${card.bankName}(${card.cardNumber.slice(-4)})` : '-'
}

onMounted(() => {
  fetchExpenses()
  fetchLedgers()
  fetchCategories()
  fetchBankCards()
})
</script>

<template>
  <div class="expense-page">
    <!-- 查询条件 -->
    <div class="card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="账本">
          <el-select v-model="queryParams.ledgerId" placeholder="全部账本" clearable style="width: 150px">
            <el-option v-for="item in ledgers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部分类" clearable style="width: 150px">
            <el-option v-for="item in expenseCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据列表 -->
    <div class="card">
      <div class="card-title">
        支出记录
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>记录支出
        </el-button>
      </div>

      <el-table :data="expenses" v-loading="loading" style="width: 100%">
        <el-table-column prop="expenseDate" label="日期" width="120" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span style="color: #F56C6C; font-weight: 500">¥ {{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="账本" width="120">
          <template #default="{ row }">
            {{ getLedgerName(row.ledgerId) }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" show-overflow-tooltip />
        <el-table-column label="付款账户" width="150">
          <template #default="{ row }">
            {{ getBankCardName(row.bankCardId) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="账本" required>
          <el-select v-model="form.ledgerId" placeholder="请选择账本" style="width: 100%">
            <el-option v-for="item in ledgers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" required>
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支出日期" required>
          <el-date-picker v-model="form.expenseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option v-for="item in expenseCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用途">
          <el-input v-model="form.purpose" placeholder="如：餐饮、交通等" maxlength="50" />
        </el-form-item>
        <el-form-item label="付款账户">
          <el-select v-model="form.bankCardId" placeholder="请选择付款账户" clearable style="width: 100%">
            <el-option
              v-for="item in bankCards"
              :key="item.id"
              :label="`${item.bankName}(${item.cardNumber.slice(-4)})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="2" maxlength="200" />
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
.expense-page {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
