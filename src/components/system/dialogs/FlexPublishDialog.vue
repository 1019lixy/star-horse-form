<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'700px'"
    :full-screen="false"
    :title="i18n('system.flex.publishDialog.title')"
    @merge="handlePublish"
  >
    <div class="publish-container">
      <div class="publish-form">
        <el-form
          :model="publishForm"
          :rules="publishRules"
          ref="publishFormRef"
          label-width="120px"
        >
          <el-form-item :label="i18n('system.flex.publishDialog.label.name')" prop="name">
            <el-input
              v-model="publishForm.name"
              :placeholder="i18n('system.flex.publishDialog.placeholder.name')"
              :disabled="isPublishing"
            />
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.version')" prop="version">
            <el-input
              v-model="publishForm.version"
              :placeholder="i18n('system.flex.publishDialog.placeholder.version')"
              :disabled="isPublishing"
            >
              <template #prepend>v</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.description')" prop="description">
            <el-input
              v-model="publishForm.description"
              type="textarea"
              :rows="4"
              :placeholder="i18n('system.flex.publishDialog.placeholder.description')"
              :disabled="isPublishing"
            />
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.environment')" prop="environment">
            <el-select
              v-model="publishForm.environment"
              :disabled="isPublishing"
              style="width: 100%"
            >
              <el-option :label="i18n('system.flex.publishDialog.environment.development')" value="development" />
              <el-option :label="i18n('system.flex.publishDialog.environment.testing')" value="testing" />
              <el-option :label="i18n('system.flex.publishDialog.environment.staging')" value="staging" />
              <el-option :label="i18n('system.flex.publishDialog.environment.production')" value="production" />
            </el-select>
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.accessType')" prop="accessType">
            <el-radio-group
              v-model="publishForm.accessType"
              :disabled="isPublishing"
            >
              <el-radio value="public">{{ i18n('system.flex.publishDialog.accessType.public') }}</el-radio>
              <el-radio value="private">{{ i18n('system.flex.publishDialog.accessType.private') }}</el-radio>
              <el-radio value="organization">{{ i18n('system.flex.publishDialog.accessType.organization') }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.settings')">
            <el-checkbox-group
              v-model="publishForm.settings"
              :disabled="isPublishing"
            >
              <el-checkbox value="generateDocs">{{ i18n('system.flex.publishDialog.setting.generateDocs') }}</el-checkbox>
              <el-checkbox value="enableAnalytics">{{ i18n('system.flex.publishDialog.setting.enableAnalytics') }}</el-checkbox>
              <el-checkbox value="enableComments">{{ i18n('system.flex.publishDialog.setting.enableComments') }}</el-checkbox>
              <el-checkbox value="autoBackup">{{ i18n('system.flex.publishDialog.setting.autoBackup') }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item :label="i18n('system.flex.publishDialog.label.tags')" prop="tags">
            <el-tag
              v-for="tag in publishForm.tags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="removeTag(tag)"
              style="margin-right: 8px"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="ml-1 w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              class="button-new-tag ml-1"
              size="small"
              @click="showInput"
            >
              {{ i18n('system.flex.publishDialog.button.addTag') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 发布预检查 -->
      <div class="publish-check">
        <el-divider content-position="center">{{ i18n('system.flex.publishDialog.title.preCheck') }}</el-divider>
        <div class="check-items">
          <div
            class="check-item"
            :class="{ 'check-passed': validationResult.isValid }"
          >
            <el-icon :color="validationResult.isValid ? '#67c23a' : '#f56c6c'">
              <star-horse-icon
                :icon-class="validationResult.isValid ? 'success' : 'error'"
              />
            </el-icon>
            <span>{{ i18n('system.flex.publishDialog.check.designValidation') }}</span>
            <span class="check-result">
              {{ validationResult.isValid ? i18n('system.flex.publishDialog.check.passed') : i18n('system.flex.publishDialog.check.failed') }}
            </span>
          </div>

          <div
            class="check-item"
            :class="{ 'check-passed': designSummary.itemCount > 0 }"
          >
            <el-icon
              :color="designSummary.itemCount > 0 ? '#67c23a' : '#f56c6c'"
            >
              <star-horse-icon
                :icon-class="designSummary.itemCount > 0 ? 'success' : 'error'"
              />
            </el-icon>
            <span>{{ i18n('system.flex.publishDialog.check.designContent') }}</span>
            <span class="check-result">
              {{ designSummary.itemCount > 0 ? i18n('system.flex.publishDialog.check.passed') : i18n('system.flex.publishDialog.check.designEmpty') }}
            </span>
          </div>

          <div class="check-item check-passed">
            <el-icon color="#67c23a">
              <star-horse-icon icon-class="success" />
            </el-icon>
            <span>{{ i18n('system.flex.publishDialog.check.permission') }}</span>
            <span class="check-result">{{ i18n('system.flex.publishDialog.check.passed') }}</span>
          </div>
        </div>

        <!-- 显示验证错误 -->
        <div v-if="!validationResult.isValid" class="validation-errors">
          <el-alert
            :title="i18n('system.flex.publishDialog.title.validationErrors')"
            type="error"
            :closable="false"
            show-icon
          >
            <ul>
              <li v-for="error in validationResult.errors" :key="error">
                {{ error }}
              </li>
            </ul>
          </el-alert>
        </div>
      </div>

      <!-- 发布历史 -->
      <div class="publish-history">
        <el-divider content-position="center">{{ i18n('system.flex.publishDialog.title.history') }}</el-divider>
        <el-table :data="publishHistory" style="width: 100%" size="small">
          <el-table-column prop="version" :label="i18n('system.flex.publishDialog.table.column.version')" width="100" />
          <el-table-column prop="name" :label="i18n('system.flex.publishDialog.table.column.name')" />
          <el-table-column prop="environment" :label="i18n('system.flex.publishDialog.table.column.environment')" width="100" />
          <el-table-column prop="publishDate" :label="i18n('system.flex.publishDialog.table.column.publishDate')" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.publishDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="i18n('system.flex.publishDialog.table.column.status')" width="80">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="i18n('system.flex.publishDialog.table.column.actions')" width="120">
            <template #default="scope">
              <el-button size="small" @click="viewVersion(scope.row)" link
                >{{ i18n('system.flex.publishDialog.table.button.view') }}</el-button
              >
              <el-button
                size="small"
                @click="rollbackVersion(scope.row)"
                link
                v-if="scope.row.status === '已发布'"
              >
                {{ i18n('system.flex.publishDialog.table.button.rollback') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 发布成功结果 -->
      <div v-if="publishResult" class="publish-result">
        <el-alert
          :title="i18n('system.flex.publishDialog.title.success')"
          type="success"
          :closable="false"
          show-icon
        />

        <div class="result-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item :label="i18n('system.flex.publishDialog.result.label.url')">
              <el-link
                :href="publishResult.publishUrl"
                target="_blank"
                type="primary"
              >
                {{ publishResult.publishUrl }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item :label="i18n('system.flex.publishDialog.result.label.version')">
              v{{ publishResult.version }}
            </el-descriptions-item>
            <el-descriptions-item :label="i18n('system.flex.publishDialog.result.label.publishDate')">
              {{ formatDate(publishResult.publishDate) }}
            </el-descriptions-item>
            <el-descriptions-item :label="i18n('system.flex.publishDialog.result.label.environment')">
              {{ publishForm.environment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="result-actions">
          <el-button @click="openPublishedPage" type="primary">
            <star-horse-icon icon-class="external-link" />
            {{ i18n('system.flex.publishDialog.result.button.visit') }}
          </el-button>
          <el-button @click="copyPublishUrl">
            <star-horse-icon icon-class="copy" />
            {{ i18n('system.flex.publishDialog.result.button.copyUrl') }}
          </el-button>
          <el-button @click="downloadPackage">
            <star-horse-icon icon-class="download" />
            {{ i18n('system.flex.publishDialog.result.button.download') }}
          </el-button>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { publishFlexDesign, type PublishResult } from "@/api/flexDesign";
import {
  piniaInstance,
  success,
  error,
  warning,
  operationConfirm,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  published: [result: PublishResult];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);
const publishFormRef = ref();
const InputRef = ref();

const publishForm = reactive({
  name: "",
  version: "",
  description: "",
  environment: "development" as
    | "development"
    | "testing"
    | "staging"
    | "production",
  accessType: "public" as "public" | "private" | "organization",
  settings: ["generateDocs", "enableAnalytics"] as string[],
  tags: [] as string[],
});

const publishRules = {
  name: [
    { required: true, message: i18n('system.flex.publishDialog.rule.nameRequired'), trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "名称长度应在 1 到 50 个字符",
      trigger: "blur",
    },
  ],
  version: [
    { required: true, message: i18n('system.flex.publishDialog.rule.versionRequired'), trigger: "blur" },
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: i18n('system.flex.publishDialog.rule.versionFormat'),
      trigger: "blur",
    },
  ],
  description: [
    { required: true, message: i18n('system.flex.publishDialog.rule.descriptionRequired'), trigger: "blur" },
    {
      min: 10,
      max: 500,
      message: "描述长度应在 10 到 500 个字符",
      trigger: "blur",
    },
  ],
  environment: [
    { required: true, message: i18n('system.flex.publishDialog.rule.environmentRequired'), trigger: "change" },
  ],
};

const isPublishing = ref(false);
const publishResult = ref<PublishResult | null>(null);
const inputVisible = ref(false);
const inputValue = ref("");

// 模拟发布历史数据
const publishHistory = ref([
  {
    version: "1.0.2",
    name: "新功能发布",
    environment: "production",
    publishDate: "2024-01-15T10:30:00Z",
    status: "已发布",
  },
  {
    version: "1.0.1",
    name: "修复发布",
    environment: "production",
    publishDate: "2024-01-10T14:20:00Z",
    status: "已回滚",
  },
  {
    version: "1.0.0",
    name: "初始发布",
    environment: "production",
    publishDate: "2024-01-01T09:00:00Z",
    status: "已发布",
  },
]);

const designSummary = computed(() => flexDesign.getDesignSummary());
const validationResult = computed(() => flexDesign.validateDesign());

const handlePublish = async () => {
  if (!publishFormRef.value) return;

  try {
    await publishFormRef.value.validate();

    if (!validationResult.value.isValid) {
      error(i18n('system.flex.publishDialog.message.validationFailed'));
      return;
    }

    isPublishing.value = true;

    const designData = flexDesign.serializeDesignData(
      publishForm.name,
      publishForm.description,
    );

    const result = await publishFlexDesign({
      ...designData,
      version: parseInt(publishForm.version.replace(/\./g, "")),
      environment: publishForm.environment,
      accessType: publishForm.accessType,
      settings: publishForm.settings,
      tags: publishForm.tags,
    } as any);

    publishResult.value = result;

    // 更新发布历史
    publishHistory.value.unshift({
      version: publishForm.version,
      name: publishForm.name,
      environment: publishForm.environment,
      publishDate: result.publishDate,
      status: "已发布",
    });

    emit("published", result);
  } catch (error) {
    console.error("Publish failed:", error);
  } finally {
    isPublishing.value = false;
  }
};

const removeTag = (tag: string) => {
  publishForm.tags.splice(publishForm.tags.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value?.input?.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && !publishForm.tags.includes(inputValue.value)) {
    publishForm.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [i18n('system.flex.publishDialog.status.published')]: "success",
    [i18n('system.flex.publishDialog.status.rolledBack')]: "warning",
    [i18n('system.flex.publishDialog.status.publishing')]: "info",
    [i18n('system.flex.publishDialog.status.failed')]: "danger",
  };
  return typeMap[status] || "info";
};

const viewVersion = (version: any) => {
  console.log("查看版本:", version);
  warning("查看版本功能开发中...");
};

const rollbackVersion = (version: any) => {
  operationConfirm(i18n('system.flex.publishDialog.message.rollbackConfirm'))
    .then(() => {
      console.log("回滚版本:", version);
      success(i18n('system.flex.publishDialog.message.rollbackSuccess'));
      // 更新状态
      version.status = "已回滚";
    })
    .catch(() => {
      warning(i18n('system.flex.publishDialog.message.rollbackCancelled'));
    });
};

const openPublishedPage = () => {
  if (publishResult.value?.publishUrl) {
    window.open(publishResult.value.publishUrl, "_blank");
  }
};

const copyPublishUrl = async () => {
  if (!publishResult.value?.publishUrl) return;

  try {
    await navigator.clipboard.writeText(publishResult.value.publishUrl);
    success(i18n('system.flex.publishDialog.message.urlCopied'));
  } catch (e) {
    console.error("Copy failed:", e);
    error(i18n('system.flex.publishDialog.message.copyFailed'));
  }
};

const downloadPackage = () => {
  // 生成发布包下载
  const designData = flexDesign.serializeDesignData(
    publishForm.name,
    publishForm.description,
  );

  const blob = new Blob([JSON.stringify(designData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${publishForm.name}-v${publishForm.version}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  success(i18n('system.flex.publishDialog.message.packageDownloaded'));
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

const closeDialog = () => {
  emit("closeDialog");
};

// 监听dialog显示状态，重置数据
watch(
  () => props.dialogVisible,
  (visible) => {
    if (visible) {
      publishForm.name = props.designName || "";
      publishForm.description = props.designDescription || "";
      publishForm.version = "1.0.0";
      publishForm.environment = "development";
      publishForm.accessType = "public";
      publishForm.settings = ["generateDocs", "enableAnalytics"];
      publishForm.tags = [];
      publishResult.value = null;
      isPublishing.value = false;
      inputVisible.value = false;
      inputValue.value = "";
    }
  },
);
</script>

<style lang="scss" scoped>
.publish-container {
  max-height: 70vh;
  overflow-y: auto;
}

.publish-form {
  margin-bottom: 20px;
}

.publish-check {
  margin: 20px 0;

  .check-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 6px;
    border-left: 4px solid #f56c6c;

    &.check-passed {
      border-left-color: #67c23a;
      background: #f0f9ff;
    }

    span:first-of-type {
      flex: 1;
      font-weight: 500;
    }

    .check-result {
      font-size: 14px;
      color: #666;
    }
  }

  .validation-errors {
    margin-top: 16px;

    ul {
      margin: 8px 0 0 0;
      padding-left: 20px;

      li {
        color: #f56c6c;
        font-size: 12px;
      }
    }
  }
}

.publish-history {
  margin: 20px 0;
}

.publish-result {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;

  .result-info {
    margin: 16px 0;
  }

  .result-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-alert) {
  margin-bottom: 16px;
}

:deep(.el-table) {
  margin-top: 16px;
}
</style>
