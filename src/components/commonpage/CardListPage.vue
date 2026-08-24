<script setup lang="ts">
import {computed, ref} from "vue";
import {DEFAULT_BTN_PERMISSIONS, useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const cardTableRef = ref();
const cardFormRef = ref();
const viewMode = ref<"card" | "table">("card");
const cardData = ref<any[]>([]);
const cardPage = ref(1);
const cardPageSize = ref(12);

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
  formRef: cardFormRef,
  tableRef: cardTableRef,
  autoLoad: true,
});

const displayFields = computed(() => {
  const fl = tableFieldList.value?.fieldList || [];
  return fl.filter((f: any) => f && f.fieldName).slice(0, 4);
});

const refreshCardData = () => {
  const ref = cardTableRef.value;
  if (!ref) return;
  const data = ref.getTableData?.() || ref.tableData || ref.$data || [];
  cardData.value = Array.isArray(data) ? data : [];
};
const handleCardClick = (row: any) => {
  dialogProps.viewVisible = true;
};
const handleCardEdit = (row: any) => {
  dialogProps.editVisible = true;
};
const handleCardDelete = (row: any) => {
  handleDelete(row);
};
const pagedCardData = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize.value;
  return cardData.value.slice(start, start + cardPageSize.value);
});
const cardTotal = computed(() => cardData.value.length);
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
          @refresh="
            (f: any, r: any) => {
              dataRecall(f, r);
              refreshCardData();
            }
          "
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :compUrl="dataUrl"
          :preview="preview"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="cardFormRef"
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

      <el-card class="inner_content">
        <div class="flex items-center justify-between mb-3">
          <div
            class="search-content"
            v-if="searchFormData.searchItemList?.length > 0"
          >
            <div class="search_btn">
              <star-horse-search-comp
                @searchData="
                  (data: any) => {
                    cardTableRef?.createSearchParams(data);
                    refreshCardData();
                  }
                "
                :formData="{ fieldList: tableFieldList.searchItemList }"
                :preview="preview"
                :compUrl="dataUrl"
              />
            </div>
          </div>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card">{{
              i18n("commonPage.cardList.cardView")
            }}</el-radio-button>
            <el-radio-button value="table">{{
              i18n("commonPage.cardList.tableView")
            }}</el-radio-button>
          </el-radio-group>
        </div>

        <div v-show="viewMode === 'card'">
          <el-empty
            v-if="!pagedCardData.length"
            :description="i18n('commonPage.cardList.empty')"
          />
          <el-row v-else :gutter="16">
            <el-col
              v-for="row in pagedCardData"
              :key="row[primaryKey] || row.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              class="mb-4"
            >
              <el-card
                shadow="hover"
                class="card-item"
                @click="handleCardClick(row)"
              >
                <div class="card-fields">
                  <div
                    v-for="f in displayFields"
                    :key="f.fieldName"
                    class="card-field"
                  >
                    <span class="card-label">{{ f.label }}:</span>
                    <span class="card-value">{{
                      dataFormat(f.fieldName, row[f.fieldName], row)
                    }}</span>
                  </div>
                </div>
                <div class="card-actions" @click.stop>
                  <el-button
                    size="small"
                    type="primary"
                    link
                    @click="handleCardEdit(row)"
                  >
                    {{ i18n("commonPage.cardList.edit") }}
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    link
                    @click="handleCardDelete(row)"
                  >
                    {{ i18n("commonPage.cardList.delete") }}
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-pagination
            v-if="cardTotal > cardPageSize"
            v-model:current-page="cardPage"
            :page-size="cardPageSize"
            :total="cardTotal"
            layout="prev, pager, next, total"
            class="mt-4 justify-center"
          />
        </div>

        <div v-show="viewMode === 'table'">
          <star-horse-table-comp
            ref="cardTableRef"
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
          @click="
            confirmDelete();
            refreshCardData();
          "
        >
          {{ i18n("commonPage.delete.ok") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.card-item {
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}
.card-fields {
  min-height: 80px;
}
.card-field {
  display: flex;
  margin-bottom: 6px;
  font-size: 13px;
}
.card-label {
  color: var(--el-text-color-secondary);
  width: 80px;
  flex-shrink: 0;
}
.card-value {
  color: var(--el-text-color-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-actions {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
