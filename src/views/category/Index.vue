<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Close } from '@element-plus/icons-vue'
import { getCategories, createCategory, updateCategory, deleteCategory, type Category, type CreateCategoryParams } from '@/api/category'

const categories = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const editId = ref<number | null>(null)

// 查询参数
const queryParams = ref({
  type: undefined as number | undefined
})

const form = ref<CreateCategoryParams>({
  name: '',
  type: 1, // 1:收入 2:支出
  icon: '',
  parentId: 0,
  sort: 0
})

// 分类类型选项
const typeOptions = [
  { label: '收入分类', value: 1 },
  { label: '支出分类', value: 2 }
]

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories(queryParams.value.type)
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  fetchCategories()
}

// 重置
const handleReset = () => {
  queryParams.value.type = undefined
  fetchCategories()
}

// 打开添加对话框
const handleCreate = (type: number) => {
  editId.value = null
  dialogTitle.value = type === 1 ? '添加收入分类' : '添加支出分类'
  form.value = {
    name: '',
    type,
    icon: '',
    parentId: 0,
    sort: 0
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row: Category) => {
  editId.value = row.id
  dialogTitle.value = row.type === 1 ? '编辑收入分类' : '编辑支出分类'
  form.value = {
    name: row.name,
    type: row.type,
    icon: row.icon || '',
    parentId: row.parentId,
    sort: row.sort
  }
  dialogVisible.value = true
}

// 删除分类
const handleDelete = async (row: Category) => {
  if (row.isSystem) {
    ElMessage.warning('系统分类不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？删除后数据无法恢复`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch {
    // 取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.name || form.value.name.trim() === '') {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    if (editId.value) {
      await updateCategory(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createCategory(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchCategories()
  } catch {
    // 错误已在拦截器处理
  }
}

// 获取分类类型文字
const getTypeText = (type: number) => {
  return type === 1 ? '收入' : '支出'
}

// 获取分类类型标签样式
const getTypeTagType = (type: number) => {
  return type === 1 ? 'success' : 'danger'
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="category-page">
    <!-- 查询条件 -->
    <div class="card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="分类类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 150px" @change="handleQuery">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
        分类列表
        <div class="header-actions">
          <el-button type="success" @click="handleCreate(1)">
            <el-icon><Plus /></el-icon>添加收入分类
          </el-button>
          <el-button type="danger" @click="handleCreate(2)">
            <el-icon><Plus /></el-icon>添加支出分类
          </el-button>
        </div>
      </div>

      <el-table :data="categories" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" width="200" />
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <span v-if="row.icon" class="category-icon">{{ row.icon }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="isSystem" label="系统分类" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isSystem" type="info">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :disabled="row.isSystem"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button
              type="danger"
              link
              :disabled="row.isSystem"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && categories.length === 0" description="暂无分类数据" />
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" class="category-dialog">
      <template #header>
        <div class="dialog-header">
          <span>{{ dialogTitle }}</span>
          <el-button class="close-btn" @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类类型" required>
          <el-radio-group v-model="form.type" :disabled="!!editId">
            <el-radio :label="1">收入</el-radio>
            <el-radio :label="2">支出</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="请输入图标emoji或字符" maxlength="5" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
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
.category-page {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .category-icon {
    font-size: 20px;
  }
}

.category-dialog {
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    transition: all 0.3s;

    &:hover {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
      transform: rotate(90deg);
    }

    .el-icon {
      font-size: 18px;
    }
  }
}
</style>
