<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="循环节点配置"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="110px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="集合变量名" prop="collectionVar">
        <el-input v-model="formData.collectionVar" placeholder="要遍历的集合变量名，如：items" />
      </el-form-item>
      <el-form-item label="当前项变量名" prop="itemVar">
        <el-input v-model="formData.itemVar" placeholder="当前项变量名，默认 item" />
      </el-form-item>
      <el-form-item label="索引变量名" prop="indexVar">
        <el-input v-model="formData.indexVar" placeholder="索引变量名，默认 index" />
      </el-form-item>
      <el-form-item label="循环内动作">
        <div class="action-block">
          <div v-if="!formData.actions || formData.actions.length === 0" class="empty-tip">
            <el-icon class="empty-icon"><InfoFilled /></el-icon>
            <span>暂无动作，请在循环节点内添加并配置动作</span>
          </div>
          <div v-else class="action-list">
            <div v-for="(action, index) in formData.actions" :key="index" class="action-item">
              <span class="action-index">{{ index + 1 }}</span>
              <span class="action-text">{{ getActionDesc(action) }}</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="说明">
        <div class="help-block">
          循环节点会遍历集合变量中的每一项，将当前项存入「当前项变量名」，索引存入「索引变量名」，依次执行循环内的动作。请在画布中向循环节点内部添加动作节点。
        </div>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  config: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', config: any): void
}>()

const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  collectionVar: '',
  itemVar: 'item',
  indexVar: 'index',
  actions: [] as any[]
})

const formData = reactive<any>(defaultFormData())

const rules = reactive<FormRules>({
  collectionVar: [{ required: true, message: '请输入集合变量名', trigger: 'blur' }],
  itemVar: [{ required: true, message: '请输入当前项变量名', trigger: 'blur' }],
  indexVar: [{ required: true, message: '请输入索引变量名', trigger: 'blur' }]
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.config) {
      formData.collectionVar = props.config.collectionVar || ''
      formData.itemVar = props.config.itemVar || 'item'
      formData.indexVar = props.config.indexVar || 'index'
      formData.actions = props.config.actions ? JSON.parse(JSON.stringify(props.config.actions)) : []
    } else {
      Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
  }
})

const getActionDesc = (action: any) => {
  if (!action) return '未知动作'
  if (action.actionType) {
    return `${action.actionType}${action.targetField ? ' -> ' + action.targetField : ''}`
  }
  return action.label || action.name || '动作'
}

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('save', {
      collectionVar: formData.collectionVar,
      itemVar: formData.itemVar,
      indexVar: formData.indexVar,
      actions: formData.actions
    })
  })
}
</script>

<style scoped lang="scss">
.action-block {
  width: 100%;
  padding: 8px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  min-height: 40px;

  .empty-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 0;
    color: #9ca3af;
    font-size: 12px;

    .empty-icon {
      font-size: 14px;
    }
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 12px;

      .action-index {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #f97316;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }

      .action-text {
        color: #374151;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.help-block {
  width: 100%;
  padding: 10px 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  font-size: 12px;
  color: #9a3412;
  line-height: 1.6;
}
</style>
