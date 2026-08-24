<script setup lang="ts">
import { computed, ref } from "vue";
import { useCommonPage } from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import { i18n } from "@/lang";
import { success, error } from "star-horse-lowcode";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const activeTab = ref<"import" | "export">("import");
const uploadRef = ref();
const importPreviewData = ref<any[]>([]);
const importLoading = ref(false);
const exportColumns = ref<string[]>([]);
const exportLoading = ref(false);

const { isLoading, hasData, errorMsg, tableFieldList, dataUrl } = useCommonPage(
  {
    props,
    formRef: ref(null) as any,
  },
);

const allFields = computed(() => {
  const fl = tableFieldList.value?.fieldList || [];
  return fl.filter((f: any) => f && f.fieldName);
});
const exportSelectedFields = computed(() =>
  allFields.value.filter((f: any) => exportColumns.value.includes(f.fieldName)),
);

const handleUploadChange = (file: any) => {
  const raw = file.raw || file;
  if (!raw) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    parsePreview(text, raw.name);
  };
  reader.onerror = () => error(i18n("commonPage.importExport.readFail"));
  reader.readAsText(raw);
};
const parsePreview = (text: string, fileName: string) => {
  const isCsv = fileName.toLowerCase().endsWith(".csv");
  try {
    if (isCsv) {
      const rows = parseCsv(text);
      importPreviewData.value = rows;
    } else {
      const rows = parseTsv(text);
      importPreviewData.value = rows;
    }
    success(i18n("commonPage.importExport.previewSuccess"));
  } catch {
    error(i18n("commonPage.importExport.previewFail"));
  }
};
const parseCsv = (text: string): any[] => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 1) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = cells[i]?.trim()));
    return obj;
  });
};
const parseTsv = (text: string): any[] => parseCsv(text.replace(/\t/g, ","));

const handleImport = async () => {
  if (!importPreviewData.value.length) {
    error(i18n("commonPage.importExport.noData"));
    return;
  }
  importLoading.value = true;
  try {
    if (props.preview) {
      success(i18n("commonPage.importExport.importSuccess"));
    } else {
      success(i18n("commonPage.importExport.importSuccess"));
    }
    importPreviewData.value = [];
    uploadRef.value?.clearFiles?.();
  } catch {
    error(i18n("commonPage.importExport.importFail"));
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  if (exportSelectedFields.value.length === 0) {
    error(i18n("commonPage.importExport.noColumn"));
    return;
  }
  exportLoading.value = true;
  try {
    const rows = props.preview ? [] : [];
    const headers = exportSelectedFields.value.map(
      (f: any) => f.label || f.fieldName,
    );
    const keys = exportSelectedFields.value.map((f: any) => f.fieldName);
    const csvLines = [headers.join(",")];
    for (const row of rows) {
      csvLines.push(
        keys
          .map((k) => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob(["\ufeff" + csvLines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success(i18n("commonPage.importExport.exportSuccess"));
  } catch {
    error(i18n("commonPage.importExport.exportFail"));
  } finally {
    exportLoading.value = false;
  }
};
const handleDownloadTemplate = () => {
  const headers = allFields.value.map((f: any) => f.label || f.fieldName);
  const blob = new Blob(["\ufeff" + headers.join(",")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `template-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showForm="true"
      :formRowCount="4"
    />

    <template v-else-if="hasData">
      <el-card class="inner_content">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane
            :label="i18n('commonPage.importExport.import')"
            name="import"
          >
            <el-upload
              ref="uploadRef"
              drag
              :auto-upload="false"
              :on-change="handleUploadChange"
              accept=".csv,.txt,.xls,.xlsx"
              class="mb-4"
            >
              <div class="el-upload__text">
                {{ i18n("commonPage.importExport.uploadTip") }}
              </div>
            </el-upload>
            <div class="flex gap-2 mb-4">
              <el-button @click="handleDownloadTemplate" icon="">
                {{ i18n("commonPage.importExport.downloadTemplate") }}
              </el-button>
              <el-button
                type="primary"
                :loading="importLoading"
                :disabled="!importPreviewData.length"
                @click="handleImport"
                icon=""
              >
                {{ i18n("commonPage.importExport.confirmImport") }}
              </el-button>
            </div>
            <el-table
              v-if="importPreviewData.length"
              :data="importPreviewData.slice(0, 50)"
              border
              max-height="360"
              size="small"
            >
              <el-table-column
                v-for="key in Object.keys(importPreviewData[0] || {})"
                :key="key"
                :prop="key"
                :label="key"
                show-overflow-tooltip
              />
            </el-table>
          </el-tab-pane>

          <el-tab-pane
            :label="i18n('commonPage.importExport.export')"
            name="export"
          >
            <div class="mb-4">
              <div class="mb-2">
                {{ i18n("commonPage.importExport.selectColumns") }}
              </div>
              <el-checkbox-group v-model="exportColumns">
                <el-checkbox
                  v-for="f in allFields"
                  :key="f.fieldName"
                  :value="f.fieldName"
                  class="mr-4 mb-2"
                >
                  {{ f.label || f.fieldName }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <el-button
              type="success"
              :loading="exportLoading"
              @click="handleExport"
              icon=""
            >
              {{ i18n("commonPage.importExport.confirmExport") }}
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style scoped></style>
