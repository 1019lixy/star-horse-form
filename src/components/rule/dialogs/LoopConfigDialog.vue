<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.loopNodeConfig')"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="110px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.collectionVarName')" prop="collectionVar">
        <el-input v-model="formData.collectionVar" :placeholder="i18n('rule.ph.collectionVarNameExample')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.currentItemVarName')" prop="itemVar">
        <el-input v-model="formData.itemVar" :placeholder="i18n('rule.ph.currentItemVarNameDefault')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.indexVarName')" prop="indexVar">
        <el-input v-model="formData.indexVar" :placeholder="i18n('rule.ph.indexVarNameDefault')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.actionsInLoop')">
        <div class="action-block">
          <div v-if="!formData.actions || formData.actions.length === 0" class="empty-tip">
            <el-icon class="empty-icon"><InfoFilled /></el-icon>
            <span>{{ i18n('rule.dialog.noActionsInLoop') }}</span>
          </div>
          <div v-else class="action-list">
            <div v-for="(action, index) in formData.actions" :key="index" class="action-item">
              <span class="action-index">{{ index + 1 }}</span>
              <span class="action-text">{{ getActionDesc(action) }}</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.description')">
        <div class="help-block">
          {{ i18n('rule.dialog.loopNodeHelpText') }}
        </div>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { i18n } from '@/lang'

const props = defineProps<{
  visible: boolean
  config: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', config: any): void
}>()
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  collectionVar: '',
  itemVar: 'item',
  indexVar: 'index',
  actions: [] as any[]
})

const formData = reactive<any>(defaultFormData())

const rules = reactive<FormRules>({
  collectionVar: [{ required: true, message: i18n('rule.ph.enterCollectionVarName'), trigger: 'blur' }],
  itemVar: [{ required: true, message: i18n('rule.ph.enterCurrentItemVarName'), trigger: 'blur' }],
  indexVar: [{ required: true, message: i18n('rule.ph.enterIndexVarName'), trigger: 'blur' }]
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
  if (!action) return i18n('rule.dialog.unknownAction')
  if (action.actionType) {
    return `${action.actionType}${action.targetField ? ' -> ' + action.targetField : ''}`
  }
  return action.label || action.name || i18n('rule.dialog.action')
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
