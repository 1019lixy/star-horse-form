<script setup lang="ts">
import {ref} from "vue";
import {useCommonPage, DEFAULT_BTN_PERMISSIONS} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview: {type: Boolean, default: false},
  compList: {type: Array, required: true},
});

const treeTableRef = ref();
const treeFormRef = ref();
const treeData = ref<any[]>([]);
const currentTreeNode = ref<any>(null);
const treeFilterText = ref("");
const treeProps = {children: "children", label: "label"};

const {
  isLoading, hasData, errorMsg, primaryKey, rules, relationTables,
  tableFieldList, searchFormData, dataUrl, extBtns, dialogProps,
  onFormDataLoaded, handleBeforeSubmit, dataFormat, dataRecall,
  loadFormData, deleteVisible, deleteLoading, handleDelete, confirmDelete,
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
  treeTableRef.value?.createSearchParams?.({parentId: node.id});
};
const handleTreeNodeAdd = () => {
  dialogProps.editVisible = true;
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
    <CommonSkeleton v-if="isLoading" :showHeader="true" :showTable="true" :tableRowCount="5"/>

    <template v-else-if="hasData">
      <star-horse-panel :isShowBtnContinue="true" v-model="dialogProps.editVisible">
        <star-horse-form
            @refresh="dataRecallTree"
            @dataLoaded="onFormDataLoaded"
            @beforeSubmit="handleBeforeSubmit"
            :compUrl="dataUrl"
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
            :compUrl="dataUrl"
        />
      </star-horse-panel>

      <div class="flex flex-1 overflow-hidden gap-2">
        <el-card class="tree-side w-64 shrink-0 overflow-auto">
          <template #header>
            <div class="flex items-center justify-between">
              <span>{{ i18n("commonPage.tree.title") }}</span>
              <el-button size="small" type="primary" link @click="handleTreeNodeAdd">
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
          <el-empty v-if="!treeData.length" :description="i18n('commonPage.tree.empty')" size="small"/>
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
          />
        </el-card>

        <el-card class="inner_content flex-1 overflow-hidden">
          <div class="search-content" v-if="searchFormData.searchItemList?.length > 0">
            <div class="search_btn">
              <star-horse-search-comp
                  @searchData="(data: any) => treeTableRef?.createSearchParams(data)"
                  :formData="{fieldList: tableFieldList.searchItemList}"
                  :preview="preview"
                  :compUrl="dataUrl"
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
              :compUrl="dataUrl"
              :btnPermissions="DEFAULT_BTN_PERMISSIONS"
              :showBatchField="true"
              :dataFormat="dataFormat"
          />
        </el-card>
      </div>
    </template>

    <el-empty :content="errorMsg" v-else/>

    <el-dialog v-model="deleteVisible" :title="i18n('commonPage.delete.title')" width="420px">
      <span>{{ i18n("commonPage.delete.confirm") }}</span>
      <template #footer>
        <el-button @click="deleteVisible = false">{{ i18n("commonPage.delete.cancel") }}</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="confirmDelete()">
          {{ i18n("commonPage.delete.ok") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.tree-side {
  min-height: 0;
}
</style>