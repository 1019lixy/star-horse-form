<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'600px'"
    :full-screen="false"
    :title="'分享设计'"
    @merge="handleShare"
  >
    <div class="share-container">
      <div class="share-form">
        <el-form :model="shareForm" :rules="shareRules" ref="shareFormRef" label-width="100px">
          <el-form-item label="设计名称" prop="name">
            <el-input 
              v-model="shareForm.name" 
              placeholder="请输入设计名称"
              :disabled="isSharing"
            />
          </el-form-item>

          <el-form-item label="设计描述" prop="description">
            <el-input
              v-model="shareForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入设计描述（可选）"
              :disabled="isSharing"
            />
          </el-form-item>

          <el-form-item label="有效期" prop="expiryDays">
            <el-select v-model="shareForm.expiryDays" :disabled="isSharing" style="width: 100%">
              <el-option label="1天" :value="1" />
              <el-option label="3天" :value="3" />
              <el-option label="7天" :value="7" />
              <el-option label="15天" :value="15" />
              <el-option label="30天" :value="30" />
              <el-option label="永久" :value="0" />
            </el-select>
          </el-form-item>

          <el-form-item label="访问权限">
            <el-radio-group v-model="shareForm.accessLevel" :disabled="isSharing">
              <el-radio value="public">公开访问</el-radio>
              <el-radio value="protected">需要密码</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item 
            label="访问密码" 
            prop="password" 
            v-if="shareForm.accessLevel === 'protected'"
          >
            <el-input
              v-model="shareForm.password"
              type="password"
              placeholder="请设置访问密码"
              :disabled="isSharing"
              show-password
            />
          </el-form-item>

          <el-form-item label="分享权限">
            <el-checkbox-group v-model="shareForm.permissions" :disabled="isSharing">
              <el-checkbox value="view">查看</el-checkbox>
              <el-checkbox value="copy">复制</el-checkbox>
              <el-checkbox value="download">下载</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分享成功后显示结果 -->
      <div v-if="shareResult" class="share-result">
        <el-alert
          title="分享成功！"
          type="success"
          :closable="false"
          show-icon
        />
        
        <div class="share-info">
          <div class="info-item">
            <label>分享链接：</label>
            <div class="link-container">
              <el-input 
                v-model="shareResult.shareUrl" 
                readonly 
                class="share-link"
              />
              <el-button @click="copyLink" type="primary" size="small">
                <star-horse-icon icon-class="copy" />
                复制链接
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <label>分享码：</label>
            <div class="code-container">
              <el-tag size="large" type="success">{{ shareResult.shareCode }}</el-tag>
              <el-button @click="copyCode" size="small" link>
                <star-horse-icon icon-class="copy" />
                复制
              </el-button>
            </div>
          </div>

          <div class="info-item" v-if="shareResult.expiryDate">
            <label>过期时间：</label>
            <span>{{ formatDate(shareResult.expiryDate) }}</span>
          </div>
        </div>

        <div class="share-actions">
          <el-button @click="openPreview" type="primary">
            <star-horse-icon icon-class="preview" />
            预览分享页面
          </el-button>
          <el-button @click="generateQRCode">
            <star-horse-icon icon-class="qrcode" />
            生成二维码
          </el-button>
          <el-button @click="shareToSocial">
            <star-horse-icon icon-class="share" />
            社交分享
          </el-button>
        </div>
      </div>

      <!-- 二维码显示 -->
      <div v-if="showQRCode" class="qr-code-section">
        <el-divider content-position="center">分享二维码</el-divider>
        <div class="qr-code-container">
          <div ref="qrCodeRef" class="qr-code"></div>
          <p>扫码访问分享页面</p>
          <el-button @click="downloadQRCode" size="small">
            <star-horse-icon icon-class="download" />
            下载二维码
          </el-button>
        </div>
      </div>

      <!-- 设计预览 -->
      <div class="design-preview">
        <el-divider content-position="center">设计预览</el-divider>
        <div class="preview-summary">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="元素数量">
              {{ designSummary.itemCount }}
            </el-descriptions-item>
            <el-descriptions-item label="组件数量">
              {{ designSummary.compCount }}
            </el-descriptions-item>
            <el-descriptions-item label="容器方向">
              {{ designSummary.containerDirection }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(new Date().toISOString()) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { shareFlexDesign, type ShareResult } from "@/api/flexDesign";
import { piniaInstance, success,error } from "star-horse-lowcode";
import QRCode from "qrcode";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  shared: [result: ShareResult];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);
const shareFormRef = ref();
const qrCodeRef = ref<HTMLElement>();

const shareForm = reactive({
  name: '',
  description: '',
  expiryDays: 7,
  accessLevel: 'public' as 'public' | 'protected',
  password: '',
  permissions: ['view', 'copy'] as string[]
});

const shareRules = {
  name: [
    { required: true, message: '请输入设计名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度应在 1 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { 
      required: true, 
      message: '请设置访问密码', 
      trigger: 'blur',
      validator: (_rule: any, value: string, callback: Function) => {
        if (shareForm.accessLevel === 'protected' && !value) {
          callback(new Error('保护模式下必须设置密码'));
        } else if (value && value.length < 4) {
          callback(new Error('密码长度至少4个字符'));
        } else {
          callback();
        }
      }
    }
  ]
};

const isSharing = ref(false);
const shareResult = ref<ShareResult | null>(null);
const showQRCode = ref(false);

const designSummary = computed(() => flexDesign.getDesignSummary());

const handleShare = async () => {
  if (!shareFormRef.value) return;
  
  try {
    await shareFormRef.value.validate();
    isSharing.value = true;

    const designData = flexDesign.serializeDesignData(
      shareForm.name,
      shareForm.description
    );

    const result = await shareFlexDesign({
      ...designData,
      accessLevel: shareForm.accessLevel,
      password: shareForm.password,
      permissions: shareForm.permissions
    } as any, shareForm.expiryDays);

    shareResult.value = result;
    emit('shared', result);
    
  } catch (error) {
    console.error('分享失败:', error);
  } finally {
    isSharing.value = false;
  }
};

const copyLink = async () => {
  if (!shareResult.value?.shareUrl) return;
  
  try {
    await navigator.clipboard.writeText(shareResult.value.shareUrl);
    success('分享链接已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    error('复制失败，请手动复制');
  }
};

const copyCode = async () => {
  if (!shareResult.value?.shareCode) return;
  
  try {
    await navigator.clipboard.writeText(shareResult.value.shareCode);
    success('分享码已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    error('复制失败，请手动复制');
  }
};

const openPreview = () => {
  if (shareResult.value?.shareUrl) {
    window.open(shareResult.value.shareUrl, '_blank');
  }
};

const generateQRCode = async () => {
  if (!shareResult.value?.shareUrl || !qrCodeRef.value) return;
  
  try {
    showQRCode.value = true;
    await nextTick();
    
    const canvas = await QRCode.toCanvas(qrCodeRef.value, shareResult.value.shareUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    success('二维码生成成功');
  } catch (error) {
    console.error('生成二维码失败:', error);
    error('生成二维码失败');
  }
};

const downloadQRCode = () => {
  const canvas = qrCodeRef.value?.querySelector('canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = `${shareForm.name}-qrcode.png`;
  link.href = canvas.toDataURL();
  link.click();
  success('二维码已下载');
};

const shareToSocial = () => {
  if (!shareResult.value?.shareUrl) return;
  
  const text = `查看我的设计：${shareForm.name}`;
  const url = shareResult.value.shareUrl;
  
  // 可以集成各种社交媒体分享
  const shareData = {
    title: shareForm.name,
    text: text,
    url: url
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    // 降级处理，复制到剪贴板
    const shareText = `${text}\n${url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      success('分享内容已复制到剪贴板');
    });
  }
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
    shareForm.name = props.designName || '';
    shareForm.description = props.designDescription || '';
    shareForm.expiryDays = 7;
    shareForm.accessLevel = 'public';
    shareForm.password = '';
    shareForm.permissions = ['view', 'copy'];
    shareResult.value = null;
    showQRCode.value = false;
    isSharing.value = false;
  }
});
</script>

<style lang="scss" scoped>
.share-container {
  max-height: 70vh;
  overflow-y: auto;
}

.share-form {
  margin-bottom: 20px;
}

.share-result {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;

  .share-info {
    margin: 16px 0;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      label {
        width: 80px;
        font-weight: 600;
        color: #333;
      }

      .link-container {
        display: flex;
        flex: 1;
        gap: 8px;

        .share-link {
          flex: 1;
        }
      }

      .code-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .share-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
  }
}

.qr-code-section {
  margin-top: 20px;

  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .qr-code {
      display: flex;
      justify-content: center;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.design-preview {
  margin-top: 20px;

  .preview-summary {
    margin-top: 16px;
  }
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-alert) {
  margin-bottom: 16px;
}
</style>