<script setup lang="ts">
import {nextTick, provide, ref, watch} from "vue";
import {analysisCompDatas, convertCompToAppComps, dialogPreps,} from "star-horse-lowcode";
import {DEFAULT_BTN_PERMISSIONS, useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const masterTableRef = ref();
const masterFormRef = ref();
const detailTableRef = ref();
const detailFormRef = ref();
const currentMasterRow = ref<any>(null);
const detailFieldList = ref<any>({ fieldList: [], stopAutoLoad: true });
const detailLoading = ref(false);

const {
  isLoading,
  hasData,
  errorMsg,
  primaryKey,
  rules,
  relationTables,
  tableFieldList,
  searchFormData,
  dataUrl,
  extBtns,
  dialogProps,
  onFormDataLoaded,
  handleBeforeSubmit,
  dataFormat,
  dataRecall,
  deleteVisible,
  deleteLoading,
  handleDelete,
  confirmDelete,
} = useCommonPage({
  props,
  formRef: masterFormRef,
  tableRef: masterTableRef,
  autoLoad: true,
});

const detailDialogProps = dialogPreps();
provide("detailDialogProps", detailDialogProps);

const splitPercent = ref(45);
const dragging = ref(false);
const onSplitStart = (e: MouseEvent) => {
  e.preventDefault();
  dragging.value = true;
  let startY = e.clientY;
  const container = (e.currentTarget as HTMLElement)
    .parentElement as HTMLElement;
  const totalH = container.getBoundingClientRect().height;
  const onMove = (ev: MouseEvent) => {
    const delta = ev.clientY - startY;
    splitPercent.value = Math.min(
      80,
      Math.max(20, splitPercent.value + (delta / totalH) * 100),
    );
    startY = ev.clientY;
  };
  const onUp = () => {
    dragging.value = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
};

const loadDetailFields = () => {
  const list = props.compList as any[];
  if (list && list.length > 1) {
    detailFieldList.value = analysisCompDatas([list[1]]);
    if (props.currentPageClass == "main-design-phone") {
      detailFieldList.value = convertCompToAppComps(detailFieldList.value);
    }
  }
};
loadDetailFields();

const handleMasterRowChange = (row: any) => {
  currentMasterRow.value = row;
  if (!row) return;
  nextTick(() => {
    detailTableRef.value?.createSearchParams?.({
      parentId: row[primaryKey.value],
    });
  });
};
const detailDataRecall = (formData: any, result: any) => {
  if (props.preview) {
    detailTableRef.value?.assignStaticData?.(formData);
  } else {
    detailTableRef.value?.loadByPage?.();
  }
};
const detailDataFormat = (name: string, cellValue: any) => cellValue;

watch(
  () => props.compList,
  () => loadDetailFields(),
  { deep: true },
);
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showSearch="true"
      :showHeader="true"
      :showTable="true"
      :tableRowCount="4"
    />

    <template v-else-if="hasData">
      <star-horse-panel
        :isShowBtnContinue="true"
        v-model="dialogProps.editVisible"
      >
        <star-horse-form
          @refresh="dataRecall"
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :compUrl="dataUrl"
          :preview="preview"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="masterFormRef"
          :globalCondition="relationTables"
          :dynamicForm="true"
        />
      </star-horse-panel>
      <star-horse-panel v-model="dialogProps.viewVisible" :source="3">
        <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :preview="preview"
          :globalCondition="relationTables"
          :dynamicForm="true"
          :compUrl="dataUrl"
        />
      </star-horse-panel>

      <el-card
        class="inner_content flex-1 overflow-hidden flex flex-col"
        body-class="flex-1 overflow-hidden flex flex-col"
      >
        <div class="split-container flex-1 overflow-hidden flex flex-col">
          <div
            class="split-pane overflow-hidden flex flex-col"
            :style="{ height: splitPercent + '%' }"
          >
            <div class="section-title">
              {{ i18n("commonPage.masterDetail.master") }}
            </div>
            <div
              class="search-content"
              v-if="searchFormData.searchItemList?.length > 0"
            >
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => masterTableRef?.createSearchParams(data)
                  "
                  :formData="{ fieldList: tableFieldList.searchItemList }"
                  :preview="preview"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <div class="flex-1 overflow-auto">
              <star-horse-table-comp
                ref="masterTableRef"
                :fieldList="tableFieldList"
                :primaryKey="primaryKey"
                :globalConfig="relationTables"
                :isDynamic="true"
                :preview="preview"
                :extendBtns="extBtns"
                :compUrl="dataUrl"
                :btnPermissions="DEFAULT_BTN_PERMISSIONS"
                :showBatchField="true"
                :dataFormat="dataFormat"
                @currentChange="handleMasterRowChange"
              />
            </div>
          </div>

          <div
            class="split-divider"
            :class="{ dragging }"
            @mousedown="onSplitStart"
          />

          <div
            class="split-pane overflow-hidden flex flex-col"
            :style="{ height: 100 - splitPercent + '%' }"
            v-if="detailFieldList.fieldList?.length > 0"
          >
            <div class="section-title">
              {{ i18n("commonPage.masterDetail.detail") }}
            </div>
            <el-empty
              v-if="!currentMasterRow"
              :description="i18n('commonPage.masterDetail.selectMaster')"
              size="small"
            />
            <template v-else>
              <star-horse-panel
                :isShowBtnContinue="true"
                v-model="detailDialogProps.editVisible"
              >
                <star-horse-form
                  @refresh="detailDataRecall"
                  :compUrl="dataUrl"
                  :preview="preview"
                  :fieldList="detailFieldList"
                  :primary-key="primaryKey"
                  ref="detailFormRef"
                  :dynamicForm="true"
                />
              </star-horse-panel>
              <div class="flex-1 overflow-auto">
                <star-horse-table-comp
                  ref="detailTableRef"
                  :fieldList="detailFieldList"
                  :primaryKey="primaryKey"
                  :isDynamic="true"
                  :preview="preview"
                  :compUrl="dataUrl"
                  :btnPermissions="DEFAULT_BTN_PERMISSIONS"
                  :showBatchField="true"
                  :dataFormat="detailDataFormat"
                />
              </div>
            </template>
          </div>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />

    <el-dialog
      v-model="deleteVisible"
      :title="i18n('commonPage.delete.title')"
      width="420px"
    >
      <span>{{ i18n("commonPage.delete.confirm") }}</span>
      <template #footer>
        <el-button @click="deleteVisible = false">{{
          i18n("commonPage.delete.cancel")
        }}</el-button>
        <el-button
          type="danger"
          :loading="deleteLoading"
          @click="confirmDelete()"
        >
          {{ i18n("commonPage.delete.ok") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.section-title {
  font-weight: 600;
  padding: 4px 0;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
  margin-bottom: 8px;
}
.split-container {
  gap: 0;
}
.split-pane {
  min-height: 0;
  padding: 4px 0;
}
.split-divider {
  height: 6px;
  flex-shrink: 0;
  cursor: row-resize;
  background: var(--el-border-color);
  transition: background 0.2s;
  &:hover,
  &.dragging {
    background: var(--el-color-primary);
  }
}
</style>
