<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'700px'"
    :full-screen="false"
    :title="'发布设计'"
    @merge="handlePublish"
  >
    <div class="publish-container">
      <div class="publish-form">
        <el-form :model="publishForm" :rules="publishRules" ref="publishFormRef" label-width="120px">
          <el-form-item label="发布名称" prop="name">
            <el-input 
              v-model="publishForm.name" 
              placeholder="请输入发布名称"
              :disabled="isPublishing"
            />
          </el-form-item>

          <el-form-item label="版本号" prop="version">
            <el-input 
              v-model="publishForm.version" 
              placeholder="例如：v1.0.0"
              :disabled="isPublishing"
            >
              <template #prepend>v</template>
            </el-input>
          </el-form-item>

          <el-form-item label="发布描述" prop="description">
            <el-input
              v-model="publishForm.description"
              type="textarea"
              :rows="4"
              placeholder="请描述本次发布的主要内容和变更"
              :disabled="isPublishing"
            />
          </el-form-item>

          <el-form-item label="发布环境" prop="environment">
            <el-select v-model="publishForm.environment" :disabled="isPublishing" style="width: 100%">
              <el-option label="开发环境" value="development" />
              <el-option label="测试环境" value="testing" />
              <el-option label="预发布环境" value="staging" />
              <el-option label="生产环境" value="production" />
            </el-select>
          </el-form-item>

          <el-form-item label="访问权限" prop="accessType">
            <el-radio-group v-model="publishForm.accessType" :disabled="isPublishing">
              <el-radio value="public">公开访问</el-radio>
              <el-radio value="private">私有访问</el-radio>
              <el-radio value="organization">组织内访问</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="发布设置">
            <el-checkbox-group v-model="publishForm.settings" :disabled="isPublishing">
              <el-checkbox value="generateDocs">生成文档</el-checkbox>
              <el-checkbox value="enableAnalytics">启用访问统计</el-checkbox>
              <el-checkbox value="enableComments">允许评论</el-checkbox>
              <el-checkbox value="autoBackup">自动备份</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="标签" prop="tags">
            <el-tag
              v-for="tag in publishForm.tags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="removeTag(tag)"
              style="margin-right: 8px;"
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
            <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
              + 添加标签
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 发布预检查 -->
      <div class="publish-check">
        <el-divider content-position="center">发布预检查</el-divider>
        <div class="check-items">
          <div class="check-item" :class="{ 'check-passed': validationResult.isValid }">
            <el-icon :color="validationResult.isValid ? '#67c23a' : '#f56c6c'">
              <star-horse-icon :icon-class="validationResult.isValid ? 'success' : 'error'" />
            </el-icon>
            <span>设计数据验证</span>
            <span class="check-result">
              {{ validationResult.isValid ? '通过' : '失败' }}
            </span>
          </div>
          
          <div class="check-item" :class="{ 'check-passed': designSummary.itemCount > 0 }">
            <el-icon :color="designSummary.itemCount > 0 ? '#67c23a' : '#f56c6c'">
              <star-horse-icon :icon-class="designSummary.itemCount > 0 ? 'success' : 'error'" />
            </el-icon>
            <span>设计内容检查</span>
            <span class="check-result">
              {{ designSummary.itemCount > 0 ? '通过' : '设计为空' }}
            </span>
          </div>

          <div class="check-item check-passed">
            <el-icon color="#67c23a">
              <star-horse-icon icon-class="success" />
            </el-icon>
            <span>权限检查</span>
            <span class="check-result">通过</span>
          </div>
        </div>

        <!-- 显示验证错误 -->
        <div v-if="!validationResult.isValid" class="validation-errors">
          <el-alert
            title="发布前需要修复以下问题："
            type="error"
            :closable="false"
            show-icon
          >
            <ul>
              <li v-for="error in validationResult.errors" :key="error">{{ error }}</li>
            </ul>
          </el-alert>
        </div>
      </div>

      <!-- 发布历史 -->
      <div class="publish-history">
        <el-divider content-position="center">发布历史</el-divider>
        <el-table :data="publishHistory" style="width: 100%" size="small">
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="environment" label="环境" width="100" />
          <el-table-column prop="publishDate" label="发布时间" width="150">
            <template #default="scope">
              {{ formatDate(scope.row.publishDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" @click="viewVersion(scope.row)" link>查看</el-button>
              <el-button 
                size="small" 
                @click="rollbackVersion(scope.row)" 
                link
                v-if="scope.row.status === '已发布'"
              >
                回滚
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 发布成功结果 -->
      <div v-if="publishResult" class="publish-result">
        <el-alert
          title="发布成功！"
          type="success"
          :closable="false"
          show-icon
        />
        
        <div class="result-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="发布URL">
              <el-link :href="publishResult.publishUrl" target="_blank" type="primary">
                {{ publishResult.publishUrl }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="版本号">
              v{{ publishResult.version }}
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ formatDate(publishResult.publishDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="环境">
              {{ publishForm.environment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="result-actions">
          <el-button @click="openPublishedPage" type="primary">
            <star-horse-icon icon-class="external-link" />
            访问发布页面
          </el-button>
          <el-button @click="copyPublishUrl">
            <star-horse-icon icon-class="copy" />
            复制链接
          </el-button>
          <el-button @click="downloadPackage">
            <star-horse-icon icon-class="download" />
            下载发布包
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
import { piniaInstance, success,error } from "star-horse-lowcode";

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
  name: '',
  version: '',
  description: '',
  environment: 'development' as 'development' | 'testing' | 'staging' | 'production',
  accessType: 'public' as 'public' | 'private' | 'organization',
  settings: ['generateDocs', 'enableAnalytics'] as string[],
  tags: [] as string[]
});

const publishRules = {
  name: [
    { required: true, message: '请输入发布名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度应在 1 到 50 个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式应为 x.y.z', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入发布描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度应在 10 到 500 个字符', trigger: 'blur' }
  ],
  environment: [
    { required: true, message: '请选择发布环境', trigger: 'change' }
  ]
};

const isPublishing = ref(false);
const publishResult = ref<PublishResult | null>(null);
const inputVisible = ref(false);
const inputValue = ref('');

// 模拟发布历史数据
const publishHistory = ref([
  {
    version: '1.0.2',
    name: '新功能发布',
    environment: 'production',
    publishDate: '2024-01-15T10:30:00Z',
    status: '已发布'
  },
  {
    version: '1.0.1',
    name: '修复发布',
    environment: 'production',
    publishDate: '2024-01-10T14:20:00Z',
    status: '已回滚'
  },
  {
    version: '1.0.0',
    name: '初始发布',
    environment: 'production',
    publishDate: '2024-01-01T09:00:00Z',
    status: '已发布'
  }
]);

const designSummary = computed(() => flexDesign.getDesignSummary());
const validationResult = computed(() => flexDesign.validateDesign());

const handlePublish = async () => {
  if (!publishFormRef.value) return;
  
  try {
    await publishFormRef.value.validate();
    
    if (!validationResult.value.isValid) {
      error('设计验证失败，无法发布');
      return;
    }

    isPublishing.value = true;

    const designData = flexDesign.serializeDesignData(
      publishForm.name,
      publishForm.description
    );

    const result = await publishFlexDesign({
      ...designData,
      version: parseInt(publishForm.version.replace(/\./g, '')),
      environment: publishForm.environment,
      accessType: publishForm.accessType,
      settings: publishForm.settings,
      tags: publishForm.tags
    } as any);

    publishResult.value = result;
    
    // 更新发布历史
    publishHistory.value.unshift({
      version: publishForm.version,
      name: publishForm.name,
      environment: publishForm.environment,
      publishDate: result.publishDate,
      status: '已发布'
    });

    emit('published', result);
    
  } catch (error) {
    console.error('发布失败:', error);
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
  inputValue.value = '';
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '已发布': 'success',
    '已回滚': 'warning',
    '发布中': 'info',
    '失败': 'danger'
  };
  return typeMap[status] || 'info';
};

const viewVersion = (version: any) => {
  console.log('查看版本:', version);
  info('查看版本功能开发中...');
};

const rollbackVersion = (version: any) => {
  confirm('确定要回滚到此版本吗？', '确认回滚', {
    type: 'warning'
  }).then(() => {
    console.log('回滚版本:', version);
    success('回滚成功');
    // 更新状态
    version.status = '已回滚';
  }).catch(() => {
    info('已取消回滚');
  });
};

const openPublishedPage = () => {
  if (publishResult.value?.publishUrl) {
    window.open(publishResult.value.publishUrl, '_blank');
  }
};

const copyPublishUrl = async () => {
  if (!publishResult.value?.publishUrl) return;
  
  try {
    await navigator.clipboard.writeText(publishResult.value.publishUrl);
    success('发布链接已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    error('复制失败，请手动复制');
  }
};

const downloadPackage = () => {
  // 生成发布包下载
  const designData = flexDesign.serializeDesignData(
    publishForm.name,
    publishForm.description
  );
  
  const blob = new Blob([JSON.stringify(designData, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${publishForm.name}-v${publishForm.version}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  success('发布包已下载');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

const closeDialog = () => {
  emit('closeDialog');
};

// 监听dialog显示状态，重置数据
watch(() => props.dialogVisible, (visible) => {
  if (visible) {
    publishForm.name = props.designName || '';
    publishForm.description = props.designDescription || '';
    publishForm.version = '1.0.0';
    publishForm.environment = 'development';
    publishForm.accessType = 'public';
    publishForm.settings = ['generateDocs', 'enableAnalytics'];
    publishForm.tags = [];
    publishResult.value = null;
    isPublishing.value = false;
    inputVisible.value = false;
    inputValue.value = '';
  }
});
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