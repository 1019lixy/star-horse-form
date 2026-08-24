<script setup lang="ts">
import { ref } from "vue";
import { apiInstance } from "star-horse-lowcode";
import { useCommonPage } from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import { i18n } from "@/lang";
import { success } from "star-horse-lowcode";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const printFormRef = ref();
const printTime = ref(new Date().toLocaleString());
const printTitle = ref("");

const { isLoading, hasData, errorMsg, tableFieldList, dataFormat, dataUrl } =
  useCommonPage({
    props,
    formRef: printFormRef,
    defaultDataUrl: apiInstance("userdb-manage", "consumer/api"),
  });

const buildPrintTitle = () => {
  const list = props.compList as any[];
  const first = list?.[0];
  printTitle.value =
    first?.preps?.printTitle ||
    first?.formName ||
    i18n("commonPage.print.title");
};
buildPrintTitle();

const handlePrint = () => {
  window.print();
  success(i18n("commonPage.print.success"));
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showPreview="true"
      :previewRowCount="8"
    />

    <template v-else-if="hasData">
      <div class="print-toolbar no-print">
        <el-button type="primary" @click="handlePrint">
          {{ i18n("commonPage.print.print") }}
        </el-button>
      </div>

      <el-card class="inner_content print-area">
        <div class="print-document">
          <div class="print-header">
            <h2 class="print-title">{{ printTitle }}</h2>
            <div class="print-meta">
              <span>{{ i18n("commonPage.print.time") }}: {{ printTime }}</span>
            </div>
          </div>

          <div class="print-body">
            <star-horse-data-view
              :field-list="tableFieldList"
              :dataFormat="dataFormat"
              :preview="preview"
              :compUrl="dataUrl"
              :dynamicForm="true"
            />
          </div>

          <div class="print-footer">
            <div class="sign-area">
              <span>{{ i18n("commonPage.print.signer") }}: ____________</span>
              <span>{{ i18n("commonPage.print.date") }}: ____________</span>
            </div>
          </div>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style lang="scss" scoped>
.print-toolbar {
  padding: 8px 0;
  margin-bottom: 8px;
}
.print-document {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.print-header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 16px;
  margin-bottom: 24px;
}
.print-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}
.print-meta {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}
.print-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #ddd;
}
.sign-area {
  display: flex;
  justify-content: space-around;
  font-size: 14px;
}

@media print {
  .no-print {
    display: none !important;
  }
  .print-area {
    border: none !important;
    box-shadow: none !important;
  }
  .print-document {
    max-width: 100%;
    padding: 0;
  }
}
</style>
