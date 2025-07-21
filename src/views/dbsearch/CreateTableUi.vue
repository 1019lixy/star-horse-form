<script setup lang="ts">
import {onMounted, provide, reactive, ref} from 'vue';
import {initDbList} from '@/views/dbsearch/utils/DbSearchUtils';
import {apiInstance, ApiUrls, BatchFieldInfo, SelectOption,} from 'star-horse-lowcode';

const dataUrl: ApiUrls = apiInstance('userdb-manage', 'dbsearch/dbinfoEntity');
let dbList = ref<SelectOption[]>([]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: '数据库信息',
      fieldName: 'dbconfigId',
      type: 'select',
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        values: dbList,
      },
    },
    {
      label: '表名',
      fieldName: 'tableName',

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '描述',
      fieldName: 'comment',
      type: 'textarea',
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const columnFieldList = reactive<BatchFieldInfo>({
  batchName: 'column',
  fieldList: [
    {
      label: '名称',
      fieldName: 'name',

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '类型',
      fieldName: 'type',

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '长度',
      fieldName: 'length',

      formVisible: true,
      listVisible: true,
    },
    {
      label: '允许为空',
      fieldName: 'allowNull',
      type: 'switch',
      defaultValue: 'Y',
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: 'Y',
        inactiveValue: 'N',
      },
    },
    {
      label: '是否主键',
      fieldName: 'isPrimaryKey',
      type: 'switch',
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: 'Y',
        inactiveValue: 'N',
      },
    },
    {
      label: '备注',
      fieldName: 'comment',

      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const indexFieldList = reactive<BatchFieldInfo>({
  batchName: 'index',
  fieldList: [
    {
      label: '表名',
      fieldName: 'tableName',

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '描述',
      fieldName: 'comment',

      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const primaryKey = 'idDbinfo';
const dataForm = ref({
  columns: [],
  index: [],
});
provide('dataForm', dataForm);
type Option =
  | {
      label: string;
      value: string | number | boolean;
      disabled?: boolean;
      [key: string]: any;
    }
  | string
  | number
  | boolean
  | undefined;
let segmentValue = ref('basic');
let options = ref<Array<Option>>([
  {
    label: '基础信息',
    value: 'basic',
    icon: 'document',
  },
  {
    label: '列名',
    value: 'column',
    icon: 'document',
  },
  {
    label: '索引',
    value: 'index',
    icon: 'document',
  },
]);
const init = async () => {
  dbList.value = await initDbList();
};
onMounted(() => {
  init();
});
</script>
<template>
  <el-card class="inner_content">
    <div class="table-type">
      <el-segmented v-model="segmentValue" :options="options">
        <template #default="{ item }">
          <div class="table-segment">
            <div>
              <star-horse-icon
                :icon-class="item.icon"
                :size="'20px'"
                color="var(--star-horse-white)"
              />
              {{ item.label }}
            </div>
          </div>
        </template>
      </el-segmented>
    </div>
    <star-horse-form
      v-model:data-form="dataForm"
      v-if="segmentValue == 'basic'"
      :primaryKey="primaryKey"
      :fieldList="tableFieldList"
      :compUrl="dataUrl"
    />
    <star-horse-form-table
      v-if="segmentValue == 'column'"
      :item="columnFieldList"
      v-model:dataForm="dataForm"
    />
    <star-horse-form-table
      v-if="segmentValue == 'index'"
      :item="indexFieldList"
      v-model:dataForm="dataForm"
    />
  </el-card>
</template>
<style scoped lang="scss">
.table-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;
}

.table-type {
  width: 200px;
}
</style>
