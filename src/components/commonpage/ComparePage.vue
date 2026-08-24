<script setup lang="ts">
import { computed, ref } from "vue";
import { useCommonPage } from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import { i18n } from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const oldData = ref<any>({});
const newData = ref<any>({});
const oldLabel = ref(i18n("commonPage.compare.old"));
const newLabel = ref(i18n("commonPage.compare.new"));
const onlyDiff = ref(false);

const { isLoading, hasData, errorMsg, tableFieldList, dataFormat } =
  useCommonPage({
    props,
    formRef: ref(null) as any,
  });

const buildCompareData = () => {
  const list = props.compList as any[];
  const cmpComp = list?.find((c: any) => c?.preps?.compareData);
  const cmp = cmpComp?.preps?.compareData || {};
  oldData.value = cmp.old || {};
  newData.value = cmp.new || {};
  oldLabel.value = cmp.oldLabel || i18n("commonPage.compare.old");
  newLabel.value = cmp.newLabel || i18n("commonPage.compare.new");
};
buildCompareData();

const compareFields = computed(() => {
  const fl = tableFieldList.value?.fieldList || [];
  const fields = fl
    .filter((f: any) => f && f.fieldName)
    .map((f: any) => {
      const ov = oldData.value[f.fieldName];
      const nv = newData.value[f.fieldName];
      return {
        ...f,
        oldValue: ov,
        newValue: nv,
        oldDisplay: dataFormat(f.fieldName, ov, oldData.value),
        newDisplay: dataFormat(f.fieldName, nv, newData.value),
        changed: String(ov) !== String(nv),
      };
    });
  return onlyDiff.value ? fields.filter((f: any) => f.changed) : fields;
});
const diffCount = computed(
  () => compareFields.value.filter((f: any) => f.changed).length,
);
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showPreview="true"
      :previewRowCount="6"
    />

    <template v-else-if="hasData">
      <el-card class="inner_content">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{
              i18n("commonPage.compare.title")
            }}</span>
            <div class="flex items-center gap-3">
              <span class="text-sm" style="color: var(--el-color-danger)">
                {{ i18n("commonPage.compare.diffCount") }}: {{ diffCount }}
              </span>
              <el-switch
                v-model="onlyDiff"
                :active-text="i18n('commonPage.compare.onlyDiff')"
              />
            </div>
          </div>
        </template>

        <el-row :gutter="16">
          <el-col :span="12">
            <div class="compare-col">
              <div class="compare-header">{{ oldLabel }}</div>
              <div
                v-for="f in compareFields"
                :key="f.fieldName"
                class="compare-row"
                :class="{ diff: f.changed }"
              >
                <span class="compare-label">{{ f.label || f.fieldName }}</span>
                <span class="compare-value">{{ f.oldDisplay ?? "--" }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="compare-col">
              <div class="compare-header">{{ newLabel }}</div>
              <div
                v-for="f in compareFields"
                :key="f.fieldName"
                class="compare-row"
                :class="{ diff: f.changed }"
              >
                <span class="compare-label">{{ f.label || f.fieldName }}</span>
                <span class="compare-value">{{ f.newDisplay ?? "--" }}</span>
                <el-tag
                  v-if="f.changed"
                  type="danger"
                  size="small"
                  class="ml-1"
                >
                  {{ i18n("commonPage.compare.changed") }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style lang="scss" scoped>
.compare-col {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}
.compare-header {
  background: var(--el-fill-color-light);
  padding: 10px 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.compare-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
  &.diff {
    background: var(--el-color-danger-light-9);
  }
}
.compare-label {
  width: 120px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.compare-value {
  flex: 1;
  word-break: break-all;
}
</style>
