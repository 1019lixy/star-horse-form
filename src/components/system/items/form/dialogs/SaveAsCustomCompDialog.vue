<script setup lang="ts">
import {i18n} from "@/lang";
import {error, StarHorseIcon, warning} from "star-horse-lowcode";
import {computed, ref} from "vue";
import {FormConfig} from "@/components/types";
import {type CustomCompStorageMode, saveCurrentCompAsCustom,} from "@/api/custom_component_api";
import {ALL_ICONS, COMMON_ICONS,} from "@/components/system/items/form/composables/customCompIcons";

defineOptions({ name: "SaveAsCustomCompDialog" });

const props = defineProps<{
  /** 当前选中组件数据 */
  currentComp: any;
  optional: FormConfig;
}>();

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const dialogVisible = ref(false);
const saveLoading = ref(false);
const saveForm = ref<{
  compName: string;
  compIcon: string;
  description: string;
  storageMode: CustomCompStorageMode;
  isShared: boolean;
}>({
  compName: "",
  compIcon: "",
  description: "",
  storageMode: "local",
  isShared: false,
});

// 图标搜索关键字
const iconSearchKey = ref("");
// 是否展开全部图标
const showAllIcons = ref(false);

// 根据搜索+展开状态过滤图标列表
const displayIcons = computed(() => {
  const key = iconSearchKey.value.trim().toLowerCase();
  if (key) {
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(key));
  }
  return showAllIcons.value ? ALL_ICONS : COMMON_ICONS;
});

const currentItemType = computed(() => props.currentComp?.itemType || "");
const currentCompType = computed(
  () => props.currentComp?.compType || "formItem",
);

const open = () => {
  if (!props.currentComp) {
    warning(i18n("dyform.customComp.noSelection"));
    return;
  }
  // 默认名称: 基于组件类型
  const baseName =
    props.currentComp?.preps?.label ||
    props.currentComp?.preps?.itemNameLabel ||
    currentItemType.value;
  saveForm.value = {
    compName: baseName + "-" + i18n("dyform.customComp.suffix"),
    compIcon: "",
    description: "",
    storageMode: "local",
    isShared: false,
  };
  iconSearchKey.value = "";
  showAllIcons.value = false;
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const handleSave = async () => {
  if (!saveForm.value.compName?.trim()) {
    warning(i18n("dyform.customComp.name.required"));
    return;
  }
  if (!props.currentComp?.preps) {
    warning(i18n("dyform.customComp.save.emptyPreps"));
    return;
  }
  saveLoading.value = true;
  try {
    const ok = await saveCurrentCompAsCustom({
      compName: saveForm.value.compName,
      compIcon: saveForm.value.compIcon || "component",
      description: saveForm.value.description,
      baseItemType: currentItemType.value,
      baseCompType: currentCompType.value,
      preps: props.currentComp.preps,
      storageMode: saveForm.value.storageMode,
      isShared:
        saveForm.value.storageMode === "db" ? saveForm.value.isShared : false,
    });
    if (ok) {
      dialogVisible.value = false;
      emit("saved");
    }
  } catch (_) {
    error(i18n("dyform.customComp.save.failed"));
  } finally {
    saveLoading.value = false;
  }
};

defineExpose({ open, close });
</script>

<template>
  <star-horse-panel
    v-model="dialogVisible"
    :title="i18n('dyform.customComp.save.title')"
    :userAction="true"
    @merge="handleSave"
    @closeAction="close"
    boxWidth="40%"
  >
    <el-form label-position="top">
      <el-form-item :label="i18n('dyform.customComp.storageMode')">
        <el-radio-group v-model="saveForm.storageMode">
          <el-radio value="local">{{
            i18n("dyform.customComp.storageMode.local")
          }}</el-radio>
          <el-radio value="db">{{
            i18n("dyform.customComp.storageMode.db")
          }}</el-radio>
        </el-radio-group>
        <div class="storage-tip">
          {{
            saveForm.storageMode === "local"
              ? i18n("dyform.customComp.storageMode.local.tip")
              : i18n("dyform.customComp.storageMode.db.tip")
          }}
        </div>
      </el-form-item>
      <el-form-item
        v-if="saveForm.storageMode === 'db'"
        :label="i18n('dyform.customComp.share')"
      >
        <el-switch v-model="saveForm.isShared" />
        <span class="share-tip">
          {{
            saveForm.isShared
              ? i18n("dyform.customComp.share.on.tip")
              : i18n("dyform.customComp.share.off.tip")
          }}
        </span>
      </el-form-item>
      <el-form-item :label="i18n('dyform.customComp.baseType')">
        <el-tag type="info">{{ currentItemType }}</el-tag>
        <span
          style="
            margin-left: 8px;
            color: var(--el-text-color-secondary);
            font-size: 12px;
          "
        >
          {{ i18n("dyform.customComp.baseType.desc") }}
        </span>
      </el-form-item>
      <el-form-item :label="i18n('dyform.customComp.name')" required>
        <el-input
          v-model="saveForm.compName"
          :placeholder="i18n('dyform.customComp.name.placeholder')"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.customComp.icon')">
        <el-input
          v-model="iconSearchKey"
          :placeholder="i18n('dyform.customComp.icon.search')"
          clearable
          size="small"
          style="margin-bottom: 8px"
        >
          <template #prefix>
            <star-horse-icon icon-class="search" size="14px" />
          </template>
        </el-input>
        <div class="icon-picker">
          <div
            v-for="icon in displayIcons"
            :key="icon"
            :class="['icon-item', { active: saveForm.compIcon === icon }]"
            :title="icon"
            @click="saveForm.compIcon = saveForm.compIcon === icon ? '' : icon"
          >
            <star-horse-icon :icon-class="icon" size="20px" />
          </div>
        </div>
        <div class="icon-footer">
          <span class="icon-tip">{{
            saveForm.compIcon
              ? saveForm.compIcon
              : i18n("dyform.customComp.icon.default")
          }}</span>
          <el-button
            v-if="!iconSearchKey"
            link
            type="primary"
            size="small"
            @click="showAllIcons = !showAllIcons"
          >
            {{
              showAllIcons
                ? i18n("dyform.customComp.icon.collapse")
                : i18n("dyform.customComp.icon.expand")
            }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item :label="i18n('dyform.customComp.description')">
        <el-input
          v-model="saveForm.description"
          :placeholder="i18n('dyform.customComp.description.placeholder')"
          type="textarea"
          :rows="2"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </star-horse-panel>
</template>

<style scoped lang="scss">
.storage-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.share-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  :deep(.star-horse-icon) {
    color: var(--el-text-color-regular);
  }

  &:hover {
    border-color: var(--star-horse-style);
    background: var(--el-color-primary-light-9);

    :deep(.star-horse-icon) {
      color: var(--star-horse-style);
    }
  }

  &.active {
    border-color: var(--star-horse-style);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 1px var(--star-horse-style);

    :deep(.star-horse-icon) {
      color: var(--star-horse-style);
    }
  }
}

.icon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 4px;
}

.icon-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
