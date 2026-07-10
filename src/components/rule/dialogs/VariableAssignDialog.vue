<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="变量赋值配置"
    boxWidth="720px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" size="default" ref="formRef" label-position="top">
      <div class="assign-toolbar">
        <span class="toolbar-title">赋值列表</span>
        <el-button type="primary" plain  @click="addAssignment">
          <el-icon><Plus /></el-icon>
          添加赋值
        </el-button>
      </div>
      <el-table :data="formData.assignments" border style="width: 100%" empty-text="暂无赋值项，请点击上方按钮添加">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="变量名" width="160">
          <template #default="{ row }">
            <el-input v-model="row.variableName" placeholder="变量名"  />
          </template>
        </el-table-column>
        <el-table-column label="值类型" width="130">
          <template #default="{ row }">
            <el-select v-model="row.valueType"  style="width: 100%">
              <el-option label="常量" value="CONSTANT" />
              <el-option label="变量" value="VARIABLE" />
              <el-option label="表达式" value="EXPRESSION" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="值" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.value" placeholder="请输入值"  />
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="140">
          <template #default="{ row }">
            <el-input v-model="row.description" placeholder="说明(可选)"  />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link  @click="removeAssignment($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  assignments: any[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', assignments: any[]): void
}>()

const formRef = ref<FormInstance>()

const formData = reactive<{ assignments: any[] }>({
  assignments: []
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.assignments && props.assignments.length > 0) {
      formData.assignments = JSON.parse(JSON.stringify(props.assignments))
    } else {
      formData.assignments = []
    }
  }
})

const addAssignment = () => {
  formData.assignments.push({
    variableName: '',
    valueType: 'CONSTANT',
    value: '',
    description: ''
  })
}

const removeAssignment = (index: number) => {
  formData.assignments.splice(index, 1)
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (formData.assignments.length === 0) {
    ElMessage.warning('请至少添加一条赋值项')
    return
  }
  const invalid = formData.assignments.find((item: any) => !item.variableName || !item.variableName.trim())
  if (invalid) {
    ElMessage.warning('变量名不能为空')
    return
  }
  const noValue = formData.assignments.find((item: any) => !item.value && item.value !== 0)
  if (noValue) {
    ElMessage.warning('请填写所有赋值项的值')
    return
  }
  emit('save', JSON.parse(JSON.stringify(formData.assignments)))
}
</script>

<style scoped lang="scss">
.assign-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .toolbar-title {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }
}
</style>
