<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="网关分支配置"
    boxWidth="640px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="网关名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入网关名称" />
      </el-form-item>
      <el-form-item label="网关类型">
        <el-radio-group v-model="formData.gatewayType" :disabled="gatewayTypeDisabled">
          <el-radio-button label="XOR">排他网关 (XOR)</el-radio-button>
          <el-radio-button label="OR">包容网关 (OR)</el-radio-button>
        </el-radio-group>
        <span v-if="gatewayTypeDisabled" class="type-tip">排他网关类型不可更改</span>
      </el-form-item>
      <el-form-item label="默认分支">
        <el-select v-model="formData.defaultBranchId" placeholder="选择默认分支(所有条件不满足时走该分支)" clearable style="width: 100%">
          <el-option
            v-for="branch in formData.branches"
            :key="branch.id"
            :label="branch.label"
            :value="branch.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分支列表">
        <div class="branch-list">
          <div v-if="formData.branches.length === 0" class="empty-tip">
            暂无分支，请点击下方按钮添加
          </div>
          <div v-for="(branch, index) in formData.branches" :key="branch.id" class="branch-item">
            <div class="branch-index">{{ index + 1 }}</div>
            <el-input v-model="branch.label" placeholder="分支标签名" class="branch-input" />
            <span class="branch-cond-count">
              条件数：{{ branch.conditions ? branch.conditions.length : 0 }}
            </span>
            <el-button type="danger" link  @click="removeBranch(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" plain  @click="addBranch" class="add-btn">
            <el-icon><Plus /></el-icon>
            添加分支
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  gateway: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', gateway: any): void
}>()

const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  name: '',
  gatewayType: 'XOR',
  branches: [] as any[],
  defaultBranchId: ''
})

const formData = reactive<any>(defaultFormData())

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入网关名称', trigger: 'blur' }]
})

const gatewayTypeDisabled = computed(() => {
  return props.gateway && props.gateway.gatewayType === 'XOR'
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.gateway) {
      formData.name = props.gateway.name || ''
      formData.gatewayType = props.gateway.gatewayType || 'XOR'
      formData.branches = props.gateway.branches
        ? JSON.parse(JSON.stringify(props.gateway.branches))
        : []
      formData.defaultBranchId = props.gateway.defaultBranchId || ''
    } else {
      Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
  }
})

const addBranch = () => {
  formData.branches.push({
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    label: `分支${formData.branches.length + 1}`,
    conditions: [],
    logic: 'AND'
  })
}

const removeBranch = (index: number) => {
  const removedId = formData.branches[index].id
  formData.branches.splice(index, 1)
  if (formData.defaultBranchId === removedId) {
    formData.defaultBranchId = ''
  }
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    if (formData.branches.length === 0) {
      ElMessage.warning('请至少添加一个分支')
      return
    }
    const emptyLabel = formData.branches.find((b: any) => !b.label || !b.label.trim())
    if (emptyLabel) {
      ElMessage.warning('分支标签名不能为空')
      return
    }
    emit('save', JSON.parse(JSON.stringify(formData)))
  })
}
</script>

<style scoped lang="scss">
.type-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #9ca3af;
}

.branch-list {
  width: 100%;

  .empty-tip {
    padding: 16px 0;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
  }

  .branch-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    transition: all 0.2s;

    &:hover {
      border-color: #a78bfa;
      background: #f5f3ff;
    }

    .branch-index {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #7c3aed;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .branch-input {
      flex: 1;
    }

    .branch-cond-count {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
    }
  }

  .add-btn {
    width: 100%;
    margin-top: 4px;
  }
}
</style>
