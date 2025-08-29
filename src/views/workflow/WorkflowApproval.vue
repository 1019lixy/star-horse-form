<script setup lang="ts">
import { onMounted, provide, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
  UserFuncInfo,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

// API configuration for flow-engine
const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/approval");

// Table field configuration
const tableFieldList = reactive({
  fieldList: [
    {
      label: i18n("workflow.process.name"),
      fieldName: "processName",
      searchVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.process.category"),
      fieldName: "category",
      searchVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.status"),
      fieldName: "status",
      searchVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",
      listVisible: true,
    },
    {
      label: i18n("system.created.date"),
      fieldName: "createdDate",
      listVisible: true,
    },
    {
      label: i18n("workflow.version.number"),
      fieldName: "version",
      listVisible: true,
    },
  ],
});

// Search form configuration
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("workflow.process.name"),
      fieldName: "processName",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("workflow.process.category"),
      fieldName: "category",
      type: "select",
      matchType: "eq",
      defaultVisible: true,
      preps: {
        values: ref([]),
      },
    },
    {
      label: i18n("system.status"),
      fieldName: "status",
      type: "select",
      matchType: "eq",
      defaultVisible: true,
      preps: {
        values: ref([
          { name: i18n("home.unreceived"), value: "pending" },
          { name: i18n("home.processing"), value: "processing" },
          { name: i18n("home.completed"), value: "completed" },
        ]),
      },
    },
  ],
});

const router = useRouter();
const primaryKey = "id";
const workflowApprovalRef = ref();
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

// Extended buttons for workflow operations
const extendBtns: UserFuncInfo[] = [
  {
    icon: "view",
    btnName: i18n("workflow.view"),
    authority: "view",
    funcName: (row: any) => {
      // View workflow details
      router.push({ 
        path: "/workflow/approval/detail", 
        query: { id: row.id, isView: "Y" } 
      });
    },
  },
  {
    icon: "edit",
    btnName: i18n("workflow.edit"),
    authority: "edit",
    funcName: (row: any) => {
      // Edit workflow
      router.push({ 
        path: "/workflow/approval/edit", 
        query: { id: row.id } 
      });
    },
  },
  {
    authority: "exec",
    funcName: (row: any) => {
      // Start workflow
      console.log("Start workflow:", row);
    },
    btnName: i18n("home.instructions1"),
  },
  {
    authority: "approve",
    funcName: (row: any) => {
      // Approve workflow
      console.log("Approve workflow:", row);
    },
    btnName: i18n("flow.designer.addNode.approve"),
  },
];

// Handle item selection
const selectItemFun = (item: any) => {
  console.log("Selected item:", item);
};

// Add button functionality
const addBtnFunc: UserFuncInfo[] = [
  {
    icon: "add",
    btnName: i18n("workflow.add"),
    authority: "add",
    funcName: () => {
      router.push({ path: "/workflow/approval/create" });
    },
  },
];

// Format data for display
const dataFormat = (name: string, cellValue: any): any => {
  if (name === "status") {
    switch (cellValue) {
      case "pending":
        return i18n("home.unreceived");
      case "processing":
        return i18n("home.processing");
      case "completed":
        return i18n("home.completed");
      default:
        return cellValue;
    }
  }
  return cellValue;
};

// Initialize component
const init = async () => {
  // Load any required initialization data
  console.log("Initializing workflow approval component");
};

onMounted(async () => {
  await init();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => workflowApprovalRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="workflowApprovalRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :extendBtns="extendBtns"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
      />
    </el-card>
  </div>
</template>

<style lang="scss" scoped></style>