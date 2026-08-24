<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {i18n} from "@/lang";

defineOptions({ name: "AllPropsOverviewPanel" });

const props = withDefaults(
  defineProps<{
    formProps?: Record<string, any>;
    compSize?: "large" | "small" | "default";
  }>(),
  {
    formProps: () => ({}),
    compSize: "default",
  },
);

const searchKeyword = ref("");
const newProp = reactive({ key: "", value: "" });
const showAddForm = ref(false);

const userDefinePreps = computed<Record<string, any>>(() => {
  if (
    !props.formProps.userDefinePreps ||
    typeof props.formProps.userDefinePreps !== "object"
  ) {
    props.formProps.userDefinePreps = {};
  }
  return props.formProps.userDefinePreps;
});

interface PropItem {
  key: string;
  value: any;
  fieldType: string;
}

const propItems = computed<PropItem[]>(() => {
  const udp = userDefinePreps.value;
  return Object.keys(udp).map((key) => {
    const val = udp[key];
    let fieldType = "input";
    if (typeof val === "boolean") fieldType = "switch";
    else if (typeof val === "number") fieldType = "number";
    return { key, value: val, fieldType };
  });
});

const filteredItems = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return propItems.value;
  return propItems.value.filter((item) => item.key.toLowerCase().includes(kw));
});

const addCustomProp = () => {
  const key = newProp.key.trim();
  if (!key || key in userDefinePreps.value) return;
  let val: any = newProp.value;
  if (val === "true") val = true;
  else if (val === "false") val = false;
  else if (val !== "" && !isNaN(Number(val))) val = Number(val);
  userDefinePreps.value[key] = val;
  props.formProps[key] = val;
  newProp.key = "";
  newProp.value = "";
  showAddForm.value = false;
};

const removeProp = (key: string) => {
  delete userDefinePreps.value[key];
  delete props.formProps[key];
};

watch(
  () => userDefinePreps.value,
  (udp) => {
    if (!udp || typeof udp !== "object") return;
    Object.keys(udp).forEach((key) => {
      props.formProps[key] = udp[key];
    });
  },
  { deep: true },
);
</script>

<template>
  <div class="all-props-overview">
    <div class="overview-header">
      <el-input
        v-model="searchKeyword"
        :placeholder="i18n('dyform.propPanel.searchPlaceholder')"
        clearable
        :size="compSize"
        prefix-icon="Search"
        class="overview-search"
      />
      <el-button
        type="primary"
        plain
        :size="compSize"
        @click="showAddForm = !showAddForm"
        icon="Plus"
      >
        {{ i18n("dyform.propPanel.addProp") }}
      </el-button>
    </div>

    <div v-if="showAddForm" class="add-prop-form">
      <el-input
        v-model="newProp.key"
        :placeholder="i18n('dyform.propPanel.propKey')"
        :size="compSize"
        class="add-prop-input"
      />
      <el-input
        v-model="newProp.value"
        :placeholder="i18n('dyform.propPanel.propValue')"
        :size="compSize"
        class="add-prop-input"
      />
      <el-button
        type="primary"
        :size="compSize"
        @click="addCustomProp"
        icon="Check"
      >
        {{ i18n("form.confirm") }}
      </el-button>
      <el-button
        :size="compSize"
        @click="
          showAddForm = false;
          newProp.key = '';
          newProp.value = '';
        "
      >
        {{ i18n("form.cancel") }}
      </el-button>
    </div>

    <el-scrollbar class="overview-scrollbar">
      <div class="overview-body">
        <el-descriptions
          v-if="filteredItems.length"
          border
          :column="1"
          direction="horizontal"
          label-width="160px"
        >
          <el-descriptions-item v-for="item in filteredItems" :key="item.key">
            <template #label>
              <label class="prop-label">
                {{ item.key }}
                <el-button
                  text
                  type="danger"
                  icon="Delete"
                  :size="compSize"
                  class="remove-prop-btn"
                  @click="removeProp(item.key)"
                />
              </label>
            </template>
            <el-input
              v-if="item.fieldType === 'input'"
              v-model="userDefinePreps[item.key]"
              :size="compSize"
            />
            <el-input-number
              v-else-if="item.fieldType === 'number'"
              v-model="userDefinePreps[item.key]"
              :size="compSize"
              controls-position="right"
              style="width: 100%"
            />
            <el-switch
              v-else-if="item.fieldType === 'switch'"
              v-model="userDefinePreps[item.key]"
            />
            <span v-else>{{ userDefinePreps[item.key] }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <el-empty
          v-else
          :description="i18n('dyform.propPanel.noProps')"
          :image-size="60"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.all-props-overview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fb;
  flex-shrink: 0;
}

.overview-search {
  flex: 1;
}

.add-prop-form {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.add-prop-input {
  flex: 1;
}

.overview-scrollbar {
  flex: 1;
  overflow: hidden;
}

.overview-body {
  padding: 16px;
}

.prop-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.remove-prop-btn {
  padding: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  background: #f5f7fa;
}

:deep(.el-descriptions__content) {
  padding: 8px 12px;
}
</style>
