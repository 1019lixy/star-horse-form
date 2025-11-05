<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'600px'"
    :full-screen="false"
    :title="i18n('system.flex.shareDialog.title')"
    @merge="handleShare"
  >
    <div class="share-container">
      <div class="share-form">
        <el-form
          :model="shareForm"
          :rules="shareRules"
          ref="shareFormRef"
          label-width="100px"
        >
          <el-form-item
            :label="i18n('system.flex.shareDialog.label.name')"
            prop="name"
          >
            <el-input
              v-model="shareForm.name"
              :placeholder="i18n('system.flex.shareDialog.placeholder.name')"
              :disabled="isSharing"
            />
          </el-form-item>

          <el-form-item
            :label="i18n('system.flex.shareDialog.label.description')"
            prop="description"
          >
            <el-input
              v-model="shareForm.description"
              type="textarea"
              :rows="3"
              :placeholder="
                i18n('system.flex.shareDialog.placeholder.description')
              "
              :disabled="isSharing"
            />
          </el-form-item>

          <el-form-item
            :label="i18n('system.flex.shareDialog.label.expiryDays')"
            prop="expiryDays"
          >
            <el-select
              v-model="shareForm.expiryDays"
              :disabled="isSharing"
              style="width: 100%"
            >
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.1')"
                :value="1"
              />
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.3')"
                :value="3"
              />
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.7')"
                :value="7"
              />
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.15')"
                :value="15"
              />
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.30')"
                :value="30"
              />
              <el-option
                :label="i18n('system.flex.shareDialog.expiryDays.0')"
                :value="0"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            :label="i18n('system.flex.shareDialog.label.accessLevel')"
          >
            <el-radio-group
              v-model="shareForm.accessLevel"
              :disabled="isSharing"
            >
              <el-radio value="public">{{
                i18n("system.flex.shareDialog.accessLevel.public")
              }}</el-radio>
              <el-radio value="protected">{{
                i18n("system.flex.shareDialog.accessLevel.protected")
              }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            :label="i18n('system.flex.shareDialog.label.password')"
            prop="password"
            v-if="shareForm.accessLevel === 'protected'"
          >
            <el-input
              v-model="shareForm.password"
              type="password"
              :placeholder="
                i18n('system.flex.shareDialog.placeholder.password')
              "
              :disabled="isSharing"
              show-password
            />
          </el-form-item>

          <el-form-item
            :label="i18n('system.flex.shareDialog.label.permissions')"
          >
            <el-checkbox-group
              v-model="shareForm.permissions"
              :disabled="isSharing"
            >
              <el-checkbox value="view">{{
                i18n("system.flex.shareDialog.permission.view")
              }}</el-checkbox>
              <el-checkbox value="copy">{{
                i18n("system.flex.shareDialog.permission.copy")
              }}</el-checkbox>
              <el-checkbox value="download">{{
                i18n("system.flex.shareDialog.permission.download")
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分享成功后显示结果 -->
      <div v-if="shareResult || true" class="share-result">
        <el-alert
          :title="i18n('system.flex.shareDialog.title.success')"
          type="success"
          :closable="false"
          show-icon
        />

        <div class="share-info">
          <div class="info-item">
            <label>{{ i18n("system.flex.shareDialog.label.shareUrl") }}</label>
            <div class="link-container">
              <el-input
                v-model="shareResult.shareUrl"
                readonly
                class="share-link"
              />
              <el-button @click="copyLink" type="primary" size="small">
                <star-horse-icon icon-class="copy" />
                {{ i18n("system.flex.shareDialog.button.copyLink") }}
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <label>{{ i18n("system.flex.shareDialog.label.shareCode") }}</label>
            <div class="code-container">
              <el-tag size="large" type="success">{{
                shareResult.shareCode
              }}</el-tag>
              <el-button @click="copyCode" size="small" link>
                <star-horse-icon icon-class="copy" />
                {{ i18n("system.flex.shareDialog.button.copy") }}
              </el-button>
            </div>
          </div>

          <div class="info-item" v-if="shareResult.expiryDate">
            <label>{{
              i18n("system.flex.shareDialog.label.expiryDate")
            }}</label>
            <span>{{ formatDate(shareResult.expiryDate) }}</span>
          </div>
        </div>

        <div class="share-actions">
          <el-button @click="openPreview" type="primary">
            <star-horse-icon icon-class="preview" />
            {{ i18n("system.flex.shareDialog.button.preview") }}
          </el-button>
          <el-button @click="generateQRCode">
            <star-horse-icon icon-class="qrcode" />
            {{ i18n("system.flex.shareDialog.button.generateQRCode") }}
          </el-button>
          <el-button @click="shareToSocial">
            <star-horse-icon icon-class="share" />
            {{ i18n("system.flex.shareDialog.button.share") }}
          </el-button>
        </div>
      </div>

      <!-- 二维码显示 -->
      <div v-if="showQRCode" class="qr-code-section">
        <el-divider content-position="center">{{
          i18n("system.flex.shareDialog.title.qrCode")
        }}</el-divider>
        <div class="qr-code-container">
          <div ref="qrCodeRef" class="qr-code"></div>
          <p>{{ i18n("system.flex.shareDialog.qrCode.message") }}</p>
          <el-button @click="downloadQRCode" size="small">
            <star-horse-icon icon-class="download" />
            {{ i18n("system.flex.shareDialog.button.downloadQRCode") }}
          </el-button>
        </div>
      </div>

      <!-- 设计预览 -->
      <div class="design-preview">
        <el-divider content-position="center">{{
          i18n("system.flex.shareDialog.title.preview")
        }}</el-divider>
        <div class="preview-summary">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item
              :label="i18n('system.flex.shareDialog.label.itemCount')"
            >
              {{ designSummary.itemCount }}
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('system.flex.shareDialog.label.compCount')"
            >
              {{ designSummary.compCount }}
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('system.flex.shareDialog.label.containerDirection')"
            >
              {{ designSummary.containerDirection }}
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('system.flex.shareDialog.label.createTime')"
            >
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
import { piniaInstance, success, error } from "star-horse-lowcode";
import QRCode from "qrcode";
import { i18n } from "@/lang";

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
  name: "",
  description: "",
  expiryDays: 7,
  accessLevel: "public" as "public" | "protected",
  password: "",
  permissions: ["view", "copy"] as string[],
});

const shareRules = {
  name: [
    {
      required: true,
      message: i18n("system.flex.shareDialog.rule.nameRequired"),
      trigger: "blur",
    },
    {
      min: 1,
      max: 50,
      message: "名称长度应在 1 到 50 个字符",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: i18n("system.flex.shareDialog.rule.passwordRequired"),
      trigger: "blur",
      validator: (_rule: any, value: string, callback: Function) => {
        if (shareForm.accessLevel === "protected" && !value) {
          callback(
            new Error(i18n("system.flex.shareDialog.rule.passwordProtected")),
          );
        } else if (value && value.length < 4) {
          callback(
            new Error(i18n("system.flex.shareDialog.rule.passwordLength")),
          );
        } else {
          callback();
        }
      },
    },
  ],
};

const isSharing = ref(false);
const shareResult = ref<ShareResult>({
  shareCode: "ABC123",
  shareUrl: "http://example.com",
  expiryDate: "15",
});
const showQRCode = ref(false);

const designSummary = computed(() => flexDesign.getDesignSummary());

const handleShare = async () => {
  if (!shareFormRef.value) return;

  try {
    await shareFormRef.value.validate();
    isSharing.value = true;

    const designData = flexDesign.serializeDesignData(
      shareForm.name,
      shareForm.description,
    );

    const result = await shareFlexDesign(
      {
        ...designData,
        accessLevel: shareForm.accessLevel,
        password: shareForm.password,
        permissions: shareForm.permissions,
      } as any,
      shareForm.expiryDays,
    );

    shareResult.value = result;
    emit("shared", result);
  } catch (error) {
    console.error("Share failed:", error);
  } finally {
    isSharing.value = false;
  }
};

const copyLink = async () => {
  if (!shareResult.value?.shareUrl) return;

  try {
    await navigator.clipboard.writeText(shareResult.value.shareUrl);
    success(i18n("system.flex.shareDialog.message.shareSuccess"));
  } catch (e) {
    console.error("Copy failed:", e);
    error(i18n("system.flex.shareDialog.message.copyFailed"));
  }
};

const copyCode = async () => {
  if (!shareResult.value?.shareCode) return;

  try {
    await navigator.clipboard.writeText(shareResult.value.shareCode);
    success(i18n("system.flex.shareDialog.message.codeSuccess"));
  } catch (e) {
    console.error("Copy failed:", e);
    error(i18n("system.flex.shareDialog.message.copyFailed"));
  }
};

const openPreview = () => {
  if (shareResult.value?.shareUrl) {
    window.open(shareResult.value.shareUrl, "_blank");
  }
};

const generateQRCode = async () => {
  if (!shareResult.value?.shareUrl) return;

  try {
    showQRCode.value = true;
    await nextTick();

    const canvas = await QRCode.toCanvas(
      qrCodeRef.value,
      shareResult.value.shareUrl,
      {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
    );

    success(i18n("system.flex.shareDialog.message.qrCodeSuccess"));
  } catch (e) {
    console.error("Failed to generate QR code:", e);
    error(i18n("system.flex.shareDialog.message.qrCodeFailed"));
  }
};

const downloadQRCode = () => {
  const canvas = qrCodeRef.value?.querySelector("canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = `${shareForm.name}-qrcode.png`;
  link.href = canvas.toDataURL();
  link.click();
  success(i18n("system.flex.shareDialog.message.qrCodeDownloaded"));
};

const shareToSocial = () => {
  if (!shareResult.value?.shareUrl) return;

  const text = `查看我的设计：${shareForm.name}`;
  const url = shareResult.value.shareUrl;

  // 可以集成各种社交媒体分享
  const shareData = {
    title: shareForm.name,
    text: text,
    url: url,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    // 降级处理，复制到剪贴板
    const shareText = `${text}\n${url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      success(i18n("system.flex.shareDialog.message.shareContentCopied"));
    });
  }
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
      shareForm.name = props.designName || "";
      shareForm.description = props.designDescription || "";
      shareForm.expiryDays = 7;
      shareForm.accessLevel = "public";
      shareForm.password = "";
      shareForm.permissions = ["view", "copy"];
      // shareResult.value = {};
      showQRCode.value = false;
      isSharing.value = false;
    }
  },
);
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
