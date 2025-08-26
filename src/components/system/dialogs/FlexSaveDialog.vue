<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    @closeAction="closeDialog"
    :selfFunc="true"
    :boxWidth="'500px'"
    :full-screen="false"
    :title="isEdit ? '保存设计' : '另存为'"
    @merge="handleSave"
  >
    <div class="save-container">
      <el-form
        :model="saveForm"
        :rules="saveRules"
        ref="saveFormRef"
        label-width="100px"
      >
        <el-form-item label="设计名称" prop="name">
          <el-input
            v-model="saveForm.name"
            placeholder="请输入设计名称"
            :disabled="isSaving"
          />
        </el-form-item>

        <el-form-item label="设计描述" prop="description">
          <el-input
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请描述该设计的用途和特点（可选）"
            :disabled="isSaving"
          />
        </el-form-item>

        <el-form-item label="保存类型" prop="saveType" v-if="!isEdit">
          <el-radio-group v-model="saveForm.saveType" :disabled="isSaving">
            <el-radio value="new">新建设计</el-radio>
            <el-radio value="template">保存为模板</el-radio>
            <el-radio value="copy">复制现有设计</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分类标签" prop="category">
          <el-select
            v-model="saveForm.category"
            placeholder="选择分类"
            :disabled="isSaving"
            style="width: 100%"
            allowCreate
            filterable
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in saveForm.tags"
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
            + 添加标签
          </el-button>
        </el-form-item>

        <el-form-item label="权限设置">
          <el-checkbox-group
            v-model="saveForm.permissions"
            :disabled="isSaving"
          >
            <el-checkbox value="public">公开访问</el-checkbox>
            <el-checkbox value="editable">允许编辑</el-checkbox>
            <el-checkbox value="downloadable">允许下载</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <!-- 设计预览信息 -->
      <div class="design-summary">
        <el-divider content-position="center">设计信息</el-divider>
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

      <!-- 快速保存选项 -->
      <div class="quick-save-options" v-if="!isEdit">
        <el-divider content-position="center">快速保存</el-divider>
        <div class="quick-actions">
          <el-button
            size="small"
            @click="quickSave('draft')"
            :disabled="isSaving"
          >
            <star-horse-icon icon-class="save" />
            保存草稿
          </el-button>
          <el-button
            size="small"
            @click="quickSave('template')"
            :disabled="isSaving"
            type="primary"
          >
            <star-horse-icon icon-class="template" />
            快速模板
          </el-button>
          <el-button
            size="small"
            @click="quickSave('auto')"
            :disabled="isSaving"
          >
            <star-horse-icon icon-class="auto" />
            自动命名
          </el-button>
        </div>
      </div>

      <!-- 保存成功提示 -->
      <div v-if="saveResult" class="save-result">
        <el-alert
          title="保存成功！"
          type="success"
          :closable="false"
          show-icon
        />
        <div class="result-info">
          <p><strong>设计ID：</strong>{{ saveResult.id }}</p>
          <p>
            <strong>保存时间：</strong>{{ formatDate(saveResult.updatedAt) }}
          </p>
        </div>
        <div class="result-actions">
          <el-button size="small" @click="continueEdit"> 继续编辑 </el-button>
          <el-button size="small" type="primary" @click="viewSaved">
            查看保存的设计
          </el-button>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from "vue";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { saveFlexDesign, type FlexDesignData } from "@/api/flexDesign";
import { piniaInstance, success, error, uuid } from "star-horse-lowcode";

interface Props {
  dialogVisible: boolean;
  designName?: string;
  designDescription?: string;
  designId?: string;
  isEdit?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  closeDialog: [];
  saved: [result: FlexDesignData];
}>();

const flexDesign = useFlexDesignStore(piniaInstance);
const saveFormRef = ref();
const InputRef = ref();

const saveForm = reactive({
  name: "",
  description: "",
  saveType: "new" as "new" | "template" | "copy",
  category: "",
  tags: [] as string[],
  permissions: ["public"] as string[],
});

const saveRules = {
  name: [
    { required: true, message: "请输入设计名称", trigger: "blur" },
    {
      min: 1,
      max: 50,
      message: "名称长度应在 1 到 50 个字符",
      trigger: "blur",
    },
  ],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

const categoryOptions = ref([
  { label: "页面布局", value: "layout" },
  { label: "表单设计", value: "form" },
  { label: "数据展示", value: "display" },
  { label: "导航菜单", value: "navigation" },
  { label: "卡片组件", value: "card" },
  { label: "自定义组件", value: "custom" },
]);

const isSaving = ref(false);
const saveResult = ref<FlexDesignData | null>(null);
const inputVisible = ref(false);
const inputValue = ref("");

const designSummary = computed(() => flexDesign.getDesignSummary());

const handleSave = async () => {
  if (!saveFormRef.value) return;

  try {
    await saveFormRef.value.validate();

    isSaving.value = true;

    const designData = flexDesign.serializeDesignData(
      saveForm.name,
      saveForm.description,
    );

    const saveData: FlexDesignData = {
      ...designData,
      id: props.isEdit ? props.designId : undefined,
      category: saveForm.category,
      tags: saveForm.tags,
      permissions: saveForm.permissions,
      saveType: saveForm.saveType,
    } as any;

    const result = await saveFlexDesign(saveData);
    saveResult.value = result;
    emit("saved", result);
  } catch (error) {
    console.error("保存失败:", error);
  } finally {
    isSaving.value = false;
  }
};

const quickSave = async (type: "draft" | "template" | "auto") => {
  try {
    isSaving.value = true;

    let name = "";
    let description = "";
    let category = "";

    switch (type) {
      case "draft":
        name = `草稿_${formatDate(new Date().toISOString(), "short")}`;
        description = "自动保存的草稿";
        category = "draft";
        break;
      case "template":
        name = `模板_${designSummary.value.itemCount}元素`;
        description = `包含${designSummary.value.itemCount}个元素的布局模板`;
        category = "template";
        break;
      case "auto":
        name = `设计_${uuid().substring(0, 8)}`;
        description = "自动生成的设计";
        category = "layout";
        break;
    }

    const designData = flexDesign.serializeDesignData(name, description);
    const saveData: FlexDesignData = {
      ...designData,
      category,
      tags: [type],
      permissions: ["public"],
    };

    const result = await saveFlexDesign(saveData);
    saveResult.value = result;
    emit("saved", result);
  } catch (error) {
    console.error("快速保存失败:", error);
  } finally {
    isSaving.value = false;
  }
};

const removeTag = (tag: string) => {
  saveForm.tags.splice(saveForm.tags.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value?.input?.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value && !saveForm.tags.includes(inputValue.value)) {
    saveForm.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const continueEdit = () => {
  emit("closeDialog");
};

const viewSaved = () => {
  if (saveResult.value) {
    success("查看功能开发中...");
    // 这里可以跳转到设计列表或详情页
  }
  emit("closeDialog");
};

const formatDate = (dateString: string, format: "full" | "short" = "full") => {
  const date = new Date(dateString);
  if (format === "short") {
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString("zh-CN");
};

const closeDialog = () => {
  emit("closeDialog");
};

// 监听dialog显示状态，重置数据
watch(
  () => props.dialogVisible,
  (visible) => {
    if (visible) {
      saveForm.name = props.designName || "";
      saveForm.description = props.designDescription || "";
      saveForm.saveType = "new";
      saveForm.category = "layout";
      saveForm.tags = [];
      saveForm.permissions = ["public"];
      saveResult.value = null;
      isSaving.value = false;
      inputVisible.value = false;
      inputValue.value = "";
    }
  },
);
</script>

<style lang="scss" scoped>
.save-container {
  max-height: 70vh;
  overflow-y: auto;
}

.design-summary {
  margin: 20px 0;
}

.quick-save-options {
  margin: 20px 0;

  .quick-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}

.save-result {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;

  .result-info {
    margin: 16px 0;

    p {
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
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
</style>
