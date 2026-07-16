<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.gatewayConfig')"
    boxWidth="700px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <div class="gateway-config">
      <el-alert type="info" :closable="false" class="config-tip">
        <template #title>
          <div class="tip-content">
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>{{ i18n('rule.dialog.gatewayConfigTip') }}</span>
          </div>
        </template>
      </el-alert>

      <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
        <el-form-item :label="i18n('rule.lbl.gatewayName')" prop="name">
          <el-input v-model="formData.name" :placeholder="i18n('rule.ph.enterGatewayName')" />
        </el-form-item>
        <el-form-item :label="i18n('rule.lbl.gatewayType')">
          <el-radio-group v-model="formData.gatewayType" :disabled="gatewayTypeDisabled">
            <el-radio-button label="XOR">{{ i18n('rule.dialog.exclusiveGateway') }}</el-radio-button>
            <el-radio-button label="OR">{{ i18n('rule.dialog.inclusiveGateway') }}</el-radio-button>
          </el-radio-group>
          <span v-if="gatewayTypeDisabled" class="type-tip">{{ i18n('rule.dialog.gatewayTypeCannotChange') }}</span>
        </el-form-item>
        <el-form-item :label="i18n('rule.lbl.branchList')">
          <div class="branch-list">
            <div v-if="formData.branches.length === 0" class="empty-tip">
              <el-icon :size="32">
                <InfoFilled />
              </el-icon>
              <p>{{ i18n('rule.dialog.noBranches') }}</p>
              <p class="hint">{{ i18n('rule.dialog.drawLineToCreateBranch') }}</p>
            </div>
            <div v-for="(branch, index) in formData.branches" :key="branch.id" class="branch-item">
              <div class="branch-header">
                <div class="branch-index">{{ index + 1 }}</div>
                <el-input v-model="branch.label" :placeholder="i18n('rule.ph.branchLabel')" class="branch-label-input" />
                <el-button type="danger" link @click="removeBranch(index)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
              <div class="branch-body">
                <el-input
                  v-model="branch.condition"
                  type="textarea"
                  :rows="2"
                  :placeholder="i18n('rule.ph.conditionExpression')"
                  class="condition-input"
                />
                <div class="branch-meta">
                  <el-tag v-if="branch.condition === 'default'" type="warning" size="small">{{ i18n('rule.dialog.defaultBranch') }}</el-tag>
                  <el-tag v-else type="success" size="small">{{ i18n('rule.dialog.conditionBranch') }}</el-tag>
                  <span class="target-info" v-if="branch.targetNodeId">
                    → {{ i18n('rule.dialog.targetNode') }}: {{ branch.targetNodeId }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Delete, InfoFilled } from "@element-plus/icons-vue";
import { i18n } from '@/lang';

const props = defineProps<{
  visible: boolean
  gateway: any
}>();
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const emit = defineEmits<{
  (e: "close"): void
  (e: "save", gateway: any): void
}>();

const formRef = ref<FormInstance>();

const defaultFormData = () => ({
  name: "",
  gatewayType: "XOR",
  branches: [] as any[]
});

const formData = reactive<any>(defaultFormData());

const rules = reactive<FormRules>({
  name: [{ required: true, message: i18n('rule.ph.enterGatewayName'), trigger: "blur" }]
});

const gatewayTypeDisabled = computed(() => {
  return props.gateway && props.gateway.gatewayType === "XOR";
});

watch(() => props.visible, (val) => {
  if (val) {
    if (props.gateway) {
      formData.name = props.gateway.name || "";
      formData.gatewayType = props.gateway.gatewayType || "XOR";
      formData.branches = props.gateway.branches
        ? JSON.parse(JSON.stringify(props.gateway.branches))
        : [];
    } else {
      Object.assign(formData, defaultFormData());
    }
    formRef.value?.clearValidate();
  }
});

const removeBranch = (index: number) => {
  formData.branches.splice(index, 1);
};

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (!valid) return;
    emit("save", JSON.parse(JSON.stringify(formData)));
  });
};
</script>

<style scoped lang="scss">
.gateway-config {
  .config-tip {
    margin-bottom: 16px;

    .tip-content {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
  }

  .type-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #9ca3af;
  }

  .branch-list {
    width: 100%;

    .empty-tip {
      padding: 32px 0;
      text-align: center;
      color: #9ca3af;

      p {
        margin: 8px 0 0;
        font-size: 13px;
      }

      .hint {
        font-size: 12px;
        color: #cbd5e1;
      }
    }

    .branch-item {
      margin-bottom: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #a78bfa;
        background: #f5f3ff;
      }

      .branch-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-bottom: 1px solid #e5e7eb;

        .branch-index {
          width: 24px;
          height: 24px;
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

        .branch-label-input {
          flex: 1;
        }
      }

      .branch-body {
        padding: 12px;

        .condition-input {
          margin-bottom: 8px;

          :deep(.el-textarea__inner) {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
          }
        }

        .branch-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          .target-info {
            font-size: 11px;
            color: #64748b;
            font-family: 'Consolas', 'Monaco', monospace;
          }
        }
      }
    }
  }
}
</style>
