<script setup lang="ts">
import { i18n } from "@/lang";
import { relationDataField } from "@/components/system/items/utils/ItemPreps.js";
import { createApiLinkageConfig } from "@/components/system/items/utils/ApiLinkageConfig";
import { PageFieldInfo, SelectOption } from "star-horse-lowcode";
import { nextTick, PropType, reactive, ref } from "vue";

defineOptions({ name: "UnifiedLinkageComp" });

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  model: {
    type: String,
    default: "simple",
  },
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});

// ─── Enable state ───
const enabled = ref<boolean>(!!props.formProps?.dataRelation || !!props.formProps?.apiLinkage);

// ─── Active tab ───
const activeTab = ref<string>("visibility");

// ─── Form refs ───
const visibilityFormRef = ref();
const apiFillFormRef = ref();

// ─── Visibility Rule field config (reuses relationDataField which has its own event selector) ───
const visibilityField = reactive<PageFieldInfo | any>(relationDataField(props.formProps, props.model));

// ─── API Auto-fill field config (uses ApiLinkageConfig tabs) ───
// createApiLinkageConfig returns a FieldInfo (with tabList), wrap it inside fieldList
const apiFillConfig = createApiLinkageConfig(props.formFields);
const apiFillField = reactive<PageFieldInfo | any>({ fieldList: [apiFillConfig] });

// ─── Transform helpers: flat auth fields ↔ backend authInfo Map ───

/**
 * Transform frontend flat auth fields to backend ApiLinkagePo structure:
 * - basicUsername/basicPassword → authInfo: {username, password}
 * - bearerToken → authInfo: {token}
 * - customHeaders (JSON string) → authInfo: parsed map
 * - headers (JSON string) → parsed map
 */
const transformToBackend = (data: any) => {
  if (!data) return data;
  const authType = data.authType || "none";

  // Build authInfo map from flat fields
  if (authType === "basic") {
    data.authInfo = {
      username: data.basicUsername || "",
      password: data.basicPassword || "",
    };
  } else if (authType === "bearer") {
    data.authInfo = { token: data.bearerToken || "" };
  } else if (authType === "custom") {
    // customHeaders might be a JSON string or already an object
    let customMap: any = {};
    if (typeof data.customHeaders === "string") {
      try { customMap = JSON.parse(data.customHeaders); } catch (_) { /* ignore */ }
    } else if (data.customHeaders && typeof data.customHeaders === "object") {
      customMap = data.customHeaders;
    }
    data.authInfo = customMap;
  } else {
    data.authInfo = null;
  }

  // Parse headers field (non-auth custom headers) to Map
  if (data.headers) {
    if (typeof data.headers === "string") {
      try { data.headers = JSON.parse(data.headers); } catch (_) { /* keep as-is */ }
    }
  }

  // Remove UI-only flat fields not in backend PO
  delete data.basicUsername;
  delete data.basicPassword;
  delete data.bearerToken;
  delete data.customHeaders;

  return data;
};

/**
 * Transform backend authInfo map back to frontend flat fields for UI display
 */
const transformFromBackend = (data: any) => {
  if (!data) return data;
  const authType = data.authType || "none";
  const authInfo = data.authInfo;

  if (authType === "basic" && authInfo) {
    data.basicUsername = authInfo.username || "";
    data.basicPassword = authInfo.password || "";
  } else if (authType === "bearer" && authInfo) {
    data.bearerToken = authInfo.token || "";
  } else if (authType === "custom" && authInfo) {
    data.customHeaders = typeof authInfo === "object" ? JSON.stringify(authInfo) : authInfo;
  }

  return data;
};

// ─── Public API ───
const setFormData = (data: any) => {
  nextTick(() => {
    // Restore enable state
    enabled.value = !!(data?.dataRelation || data?.apiLinkage);
    // Set visibility rule data
    if (data?.dataRelation) {
      nextTick(() => visibilityFormRef.value?.setFormData(data.dataRelation));
    }
    // Set API linkage data (restore flat auth fields from authInfo)
    if (data?.apiLinkage) {
      const restored = transformFromBackend({ ...data.apiLinkage });
      nextTick(() => apiFillFormRef.value?.setFormData(restored));
    }
  });
};

const getFormData = () => {
  return {
    dataRelation: visibilityFormRef.value?.getFormData(),
    apiLinkage: apiFillFormRef.value?.getFormData(),
  };
};

const submitValid = async () => {
  if (!enabled.value) {
    // Disabled: clear linkage data
    if (props.formProps) {
      delete props.formProps["dataRelation"];
      delete props.formProps["apiLinkage"];
    }
    return true;
  }

  // Save visibility rule (always, regardless of active tab)
  const visibilityStarForm = visibilityFormRef.value?.$refs?.starHorseFormRef;
  if (visibilityStarForm) {
    let flag = false;
    await visibilityStarForm.validate((res: boolean) => { flag = res; });
    if (!flag) { activeTab.value = "visibility"; return false; }
  }
  const visibilityData = visibilityFormRef.value?.getFormData();
  if (visibilityData && props.formProps) {
    props.formProps["dataRelation"] = visibilityData.value ?? visibilityData;
  }

  // Save API auto-fill (always, regardless of active tab)
  const apiStarForm = apiFillFormRef.value?.$refs?.starHorseFormRef;
  if (apiStarForm) {
    let flag = false;
    await apiStarForm.validate((res: boolean) => { flag = res; });
    if (!flag) { activeTab.value = "apiFill"; return false; }
  }
  const apiData = apiFillFormRef.value?.getFormData();
  if (apiData && props.formProps) {
    const raw = apiData.value ?? apiData;
    // Transform flat auth fields → backend authInfo map
    props.formProps["apiLinkage"] = transformToBackend({ ...raw });
  }

  return true;
};

defineExpose({ submitValid, setFormData, getFormData });
</script>

<template>
  <div class="unified-linkage">
    <!-- Enable Toggle -->
   
      <el-tabs v-model="activeTab" class="linkage-tabs">
        <!-- Visibility Rule Tab -->
        <el-tab-pane name="visibility">
          <template #label>
            <el-icon style="margin-right: 4px"><View /></el-icon>
            {{ i18n('dyform.unified.linkage.tab.visibility') }}
          </template>
          <div class="tab-content">
            <star-horse-form :fieldList="visibilityField" ref="visibilityFormRef" />
          </div>
        </el-tab-pane>

        <!-- API Auto-fill Tab -->
        <el-tab-pane name="apiFill">
          <template #label>
            <el-icon style="margin-right: 4px"><Connection /></el-icon>
            {{ i18n('dyform.unified.linkage.tab.apiFill') }}
          </template>
          <div class="tab-content">
            <star-horse-form :fieldList="apiFillField" ref="apiFillFormRef" />
          </div>
        </el-tab-pane>
      </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.unified-linkage { width: 100%; }
.linkage-toggle {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  .toggle-desc { margin-top: 6px; font-size: 12px; color: var(--el-text-color-secondary); }
}
.linkage-tabs { margin-bottom: 0; }
.tab-content { min-height: 200px; padding-top: 8px; }
</style>
