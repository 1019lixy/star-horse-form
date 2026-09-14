<script setup lang="ts">
import {ref} from "vue";
import {DEFAULT_BTN_PERMISSIONS, useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const treeTableRef = ref();
const treeFormRef = ref();
const treeData = ref<any[]>([]);
const currentTreeNode = ref<any>(null);
const treeFilterText = ref("");
const treeProps = { children: "children", label: "label" };
const categoryDialogVisible = ref(false);
const categoryForm = ref<any>({ label: "" });
const categoryParentNode = ref<any>(null);
const categoryIsEdit = ref(false);

const {
  isLoading,
  hasData,
  errorMsg,
  primaryKey,
  rules,
  relationTables,
  tableFieldList,
  searchFormData,
  apiEndpoints,
  extBtns,
  dialogProps,
  onFormDataLoaded,
  handleBeforeSubmit,
  dataFormat,
  dataRecall,
  loadFormData,
  deleteVisible,
  deleteLoading,
  handleDelete,
  confirmDelete,
} = useCommonPage({
  props,
  formRef: treeFormRef,
  tableRef: treeTableRef,
  autoLoad: true,
});

const refreshTree = () => {
  const list = props.compList as any[];
  const treeNode = list?.find((c: any) => c?.preps?.treeData || c?.treeData);
  treeData.value = treeNode?.preps?.treeData || treeNode?.treeData || [];
};
refreshTree();

const handleNodeClick = (node: any) => {
  currentTreeNode.value = node;
  treeTableRef.value?.createSearchParams?.({ parentId: node.id });
};
const handleTreeNodeAdd = (parent?: any) => {
  categoryIsEdit.value = false;
  categoryParentNode.value = parent || null;
  categoryForm.value = { label: "" };
  categoryDialogVisible.value = true;
};
const handleTreeNodeEdit = (node: any) => {
  categoryIsEdit.value = true;
  categoryParentNode.value = node;
  categoryForm.value = { label: node.label, id: node.id };
  categoryDialogVisible.value = true;
};
const saveCategory = () => {
  if (!categoryForm.value.label) return;
  if (categoryIsEdit.value) {
    categoryParentNode.value.label = categoryForm.value.label;
  } else {
    const newNode = {
      id: Date.now(),
      label: categoryForm.value.label,
      children: [],
    };
    if (categoryParentNode.value) {
      if (!categoryParentNode.value.children)
        categoryParentNode.value.children = [];
      categoryParentNode.value.children.push(newNode);
    } else {
      treeData.value.push(newNode);
    }
  }
  categoryDialogVisible.value = false;
};
const handleTreeNodeDelete = (node: any) => {
  const remove = (list: any[]) => {
    const idx = list.findIndex((n: any) => n.id === node.id);
    if (idx >= 0) {
      list.splice(idx, 1);
      return true;
    }
    return list.some((n: any) => n.children && remove(n.children));
  };
  remove(treeData.value);
};
const filterTreeNode = (value: string, data: any) => {
  if (!value) return true;
  return (data.label || "").includes(value);
};
const dataRecallTree = (formData: any, result: any) => {
  dataRecall(formData, result);
  refreshTree();
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showTable="true"
      :tableRowCount="5"
    />

    <template v-else-if="hasData">
      <star-horse-panel
        :isShowBtnContinue="true"
        v-model="dialogProps.editVisible"
      >
        <star-horse-form
          @refresh="dataRecallTree"
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :apiEndpoints="apiEndpoints"
          :preview="preview"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="treeFormRef"
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
          :apiEndpoints="apiEndpoints"
        />
      </star-horse-panel>

      <div class="flex flex-1 overflow-hidden gap-2">
        <el-card class="tree-side w-64 shrink-0 overflow-auto">
          <template #header>
            <div class="flex items-center justify-between">
              <span>{{ i18n("commonPage.tree.title") }}</span>
              <el-button
                size="small"
                type="primary"
                link
                @click="handleTreeNodeAdd()"
              >
                {{ i18n("commonPage.tree.add") }}
              </el-button>
            </div>
          </template>
          <el-input
            v-model="treeFilterText"
            :placeholder="i18n('commonPage.tree.filter')"
            clearable
            size="small"
            class="mb-2"
          />
          <el-empty
            v-if="!treeData.length"
            :description="i18n('commonPage.tree.empty')"
            size="small"
          />
          <el-tree
            v-else
            :data="treeData"
            :props="treeProps"
            :filter-node-method="filterTreeNode"
            :current-node-key="currentTreeNode?.id"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
            ref="treeRef"
          >
            <template #default="{ node, data }">
              <div class="tree-node-row">
                <span class="tree-node-label">{{ node.label }}</span>
                <span class="tree-node-ops">
                  <el-button
                    size="small"
                    link
                    type="primary"
                    @click.stop="handleTreeNodeAdd(data)"
                    >+</el-button
                  >
                  <el-button
                    size="small"
                    link
                    type="warning"
                    @click.stop="handleTreeNodeEdit(data)"
                    >✎</el-button
                  >
                  <el-button
                    size="small"
                    link
                    type="danger"
                    @click.stop="handleTreeNodeDelete(data)"
                    >×</el-button
                  >
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>

        <el-card class="inner_content flex-1 overflow-hidden">
          <div
            class="search-content"
            v-if="searchFormData.searchItemList?.length > 0"
          >
            <div class="search_btn">
              <star-horse-search-comp
                @searchData="
                  (data: any) => treeTableRef?.createSearchParams(data)
                "
                :formData="{ fieldList: tableFieldList.searchItemList }"
                :preview="preview"
                :apiEndpoints="apiEndpoints"
              />
            </div>
          </div>
          <star-horse-table-comp
            ref="treeTableRef"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :globalConfig="relationTables"
            :isDynamic="true"
            :preview="preview"
            :extendBtns="extBtns"
            :apiEndpoints="apiEndpoints"
            :btnPermissions="DEFAULT_BTN_PERMISSIONS"
            :showBatchField="true"
            :dataFormat="dataFormat"
          />
        </el-card>
      </div>
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

    <el-dialog
      v-model="categoryDialogVisible"
      :title="
        categoryIsEdit
          ? i18n('commonPage.tree.editNode')
          : i18n('commonPage.tree.addNode')
      "
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item :label="i18n('commonPage.tree.nodeLabel')">
          <el-input
            v-model="categoryForm.label"
            :placeholder="i18n('commonPage.tree.nodeLabelPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">{{
          i18n("commonPage.delete.cancel")
        }}</el-button>
        <el-button type="primary" @click="saveCategory">{{
          i18n("commonPage.delete.ok")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.tree-side {
  min-height: 0;
}
.tree-node-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
  .tree-node-ops {
    display: none;
  }
  &:hover .tree-node-ops {
    display: inline-flex;
  }
}
</style>
