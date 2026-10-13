<script setup lang="ts" name="FormInfoPanel">
import {computed} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";

const designForm = getDesignFormStore();
const formInfo = computed(() => designForm.formInfo);

const labelPositionOptions = [
  {label: i18n("dyform.props.labelPosition.top"), value: "top"},
  {label: i18n("dyform.props.labelPosition.left"), value: "left"},
  {label: i18n("dyform.props.labelPosition.right"), value: "right"},
];
const sizeOptions = [
  {label: i18n("dyform.props.size.large"), value: "large"},
  {label: i18n("dyform.props.size.default"), value: "default"},
  {label: i18n("dyform.props.size.small"), value: "small"},
];

const applyColumnsToAll = () => {
  const cols = formInfo.value["columns"] ?? 3;
  designForm.applyColumnsToAllShells(cols);
};
</script>
<template>
  <el-descriptions :column="1" border size="small" class="form-info-desc">
    <el-descriptions-item :label="i18n('dyform.toolbar.columns')">
      <div class="flex items-center gap-2">
        <el-select v-model="formInfo['columns']" size="small" style="width: 80px">
          <el-option :value="1" label="1" />
          <el-option :value="2" label="2" />
          <el-option :value="3" label="3" />
          <el-option :value="4" label="4" />
        </el-select>
        <el-button size="small" type="primary" plain @click="applyColumnsToAll">
          {{ i18n("dyform.toolbar.applyColumns") }}
        </el-button>
      </div>
    </el-descriptions-item>
    <el-descriptions-item :label="i18n('dyform.props.labelPosition')">
      <el-select
        v-model="formInfo['labelPosition']"
        size="small"
        :options="labelPositionOptions"
        style="width: 100%"
      />
    </el-descriptions-item>
    <el-descriptions-item :label="i18n('dyform.props.labelWidth')">
      <el-input
        v-model="formInfo['labelWidth']"
        size="small"
        :placeholder="i18n('dyform.props.labelWidth.placeholder')"
      />
    </el-descriptions-item>
    <el-descriptions-item :label="i18n('dyform.props.size')">
      <el-select
        v-model="formInfo['size']"
        size="small"
        :options="sizeOptions"
        style="width: 100%"
      />
    </el-descriptions-item>
    <el-descriptions-item :label="i18n('dyform.props.disabled')">
      <el-switch
        v-model="formInfo['disabled']"
        active-value="Y"
        inactive-value="N"
      />
    </el-descriptions-item>
    <el-descriptions-item :label="i18n('dyform.props.hideRequiredAsterisk')">
      <el-switch
        v-model="formInfo['hideRequiredAsterisk']"
        active-value="Y"
        inactive-value="N"
      />
    </el-descriptions-item>
  </el-descriptions>
</template>
<style lang="scss" scoped>
.form-info-desc {
  width: 100%;

  :deep(.el-descriptions__label) {
    width: 100px;
    font-size: 13px;
    color: #606266;
  }

  :deep(.el-descriptions__content) {
    font-size: 13px;
  }
}
</style>