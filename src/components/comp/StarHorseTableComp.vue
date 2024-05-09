<script lang="ts" setup name="StarHorseTableComp">
import { ApiUrls } from "@/components/types/ApiUrls";
import {
  inject,
  onMounted,
  PropType,
  reactive,
  Ref,
  ref,
  unref,
  watch,
} from "vue";
import { download, postRequest } from "@/api/star_horse";
import { PageProps } from "@/components/types/PageProps";
import {
  closeLoad,
  commonParseCodeToName,
  deleteByIds,
  load,
  loadPagePermission,
} from "@/api/sh_api";
import { SearchParams } from "@/components/types/Params";
import Sortable from "sortablejs";
import { DialogProps } from "../types/DialogProps";
import { BtnAuth } from "@/components/types/BtnAuth";
import { error, warning } from "@/utils/message";
import { OrderByInfo } from "@/components/types/PageFieldInfo";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {DynamicForm} from "@/store/DynamicFormStore";
import piniaInstance from "@/store";

const dynamicForm = DynamicForm(piniaInstance);
const props = defineProps({
  //url地址
  compUrl: { type: Object as PropType<ApiUrls>, required: true },
  //主键
  primaryKey: { type: String, required: true },
  //列名
  fieldList: { type: Object, required: true },
  //是否显示批量属性
  showBatchField: { type: Boolean, default: false },
  //格式化方法
  dataFormat: { type: Function, default: null },
  //按钮大小
  compSize: { type: String, default: "small" },
  //自定义按钮事件
  selfBtnFunc: { type: Array as PropType<BtnAuth[]>, default: null },
  //禁用事件
  disableAction: { type: Boolean, default: false },
  //弹窗模式
  dialogInput: { type: Boolean, default: false },
  //默认表格高度
  height: { type: String, default: "100%" },
  //过滤条件
  filterCondition: { type: Array as PropType<SearchParams>, default: [] },

  //是否显示分页条
  showPageBar: { type: Boolean, default: true },
  //数据列表
  tableDataList: { type: Array, default: [] },
  //回显数据列表
  reverseDataList: { type: Array, default: [] },
  //是否运行选择父级节点
  allowSelectParent: { type: Boolean, default: true },
  //默认是否展开所有子节点
  expand: { type: Boolean, default: false },
  //标题
  title: { type: String },
  //按钮操作权限
  selfPermission: {
    type: Object,
    default: () => {
      return { view: true };
    },
  },
});
const emits = defineEmits(["selectItem"]);
const multipleSelection = ref<any>([]);
const starHorseTableCompRef = ref();
let pageInfo = reactive<PageProps>({
  pageSize: 20,
  currentPage: 1,
  totalData: 0,
  totalPage: 0,
  dataList: [],
});

const searchForm = inject("searchForm") as Ref;
let searchFields = reactive<Array<SearchParams>>([]);
let defaultSearchFields = reactive<Array<SearchParams>>([]);
let orderBys = reactive<Array<OrderByInfo>>([]);

let permissions = ref({});
let dialogProps = inject("dialogProps") as DialogProps;
let toolFields = reactive<Array<any>>([]);
const tableCompFunc = (func: any) => {
  if (func == "refresh") {
    loadByPage();
  } else if (func == "batch_delete") {
    batchDelete();
  } else if (func == "exportData") {
    exportData();
  } else if (func == "exec") {
  }
};
const exportData = () => {
  load("数据处理中");
  let ids = getIds();
  let params = [];
  if (ids.length > 0) {
    params.push({
      propertyName: props.primaryKey,
      operation: "in",
      value: ids,
    });
  } else {
    params = searchFields;
  }
  let defaultcond = props.compUrl?.condition;
  if (defaultcond && defaultcond.length > 0) {
    params.push(...defaultcond);
  }
  let condition = {
    fieldList: params,
  };
  if (props.fieldList?.orderBy) {
    condition["orderBy"] = props.fieldList.orderBy;
  }
  download(props.compUrl!.exportAllUrl, condition)
    .catch((err) => {
      error("接口不存在或网络异常:" + err);
    })
    .finally(() => {
      closeLoad();
    });
};
const getIds = () => {
  let selectDatas = unref(multipleSelection);
  let ids: any = [];
  for (let key in selectDatas) {
    let temp = selectDatas[key];
    ids.push(temp[props.primaryKey]);
  }
  return ids;
};
/**
 * 批量删除
 */
const batchDelete = async () => {
  load("数据处理中");
  await deleteById(getIds());
  closeLoad();
};
/**
 * 创建查询条件
 * @param formData
 */
const createCreateParams = (formData: SearchParams[]) => {
  searchFields = formData;
  loadByPage();
};

const init = async () => {
  const { permission } = await loadPagePermission();
  if (Object.keys(permission).length == 0) {
    permissions.value = { ...props.selfPermission };
  } else {
    permissions.value = permission;
  }
  //是否初始化时自动加载列表数据开关
  if (!props.fieldList["stopAutoLoad"]) {
    loadByPage();
  } else {
    pageInfo.dataList = props.tableDataList;
    starHorseTableCompRef.value!.clearSelection();
    //如果有需要回显的数据则需要选中
    if (props.reverseDataList && props.reverseDataList.length > 0) {
      //在手动设置选中前,一定要先做清除选中,否则会出现很多重复被选中的情况
      // await nextTick(async () => {
      props.reverseDataList.forEach((item: any) => {
        starHorseTableCompRef.value!.toggleRowSelection(item, true);
      });
      // });
    }
  }
  moveColumn();
  reCreateData();
};
//监听外面传入数据的变化
watch(
  () => props.tableDataList,
  (val) => {
    if (props.fieldList["stopAutoLoad"]) {
      pageInfo.dataList = val;
    }
  },
  { deep: true, immediate: false }
);
const assignData = (dataList: Array<any>) => {
  for (let key in dataList) {
    let temp: any = dataList[key];
    if (temp instanceof Array) {
      toolFields.push(...temp);
    } else if (temp.tabList?.length > 0) {
      for (let skey in temp.tabList) {
        let stemp=temp.tabList[skey];
        if(stemp["fieldList"]){
          toolFields.push(...stemp["fieldList"]);
        }
      }
    } else {
      toolFields.push(temp);
    }
  }
};
const reCreateData = () => {
  toolFields = [];
  let tempList = props.fieldList["fieldList"];
  if (tempList) {
    assignData(tempList);
  }
};

const moveColumn = () => {
  const tbody = document.querySelector(
    ".sh-columns .el-table__body-wrapper tbody"
  ) as HTMLElement | null;
  if (tbody) {
    Sortable.create(tbody, {
      handle: ".move",
      animation: 200,
      ghostClass: "ghost",
      onEnd(event: any) {
        const { oldIndex, newIndex } = event;
        //删除并获取当前行
        const currRow = props.fieldList?.fieldList.splice(oldIndex, 1)[0];
        //再拖动结束位置插入当前行
        props.fieldList?.fieldList.splice(newIndex, 0, currRow);
      },
    });
  }
};
onMounted(() => {
  init();
});

const editData = (row: any, column: any, evt: any) => {
  let id = getRowIdentity(row);
  dynamicForm.setDataId(id);
  dynamicForm.setSelectData(row);
  if (!props.dialogInput) {
    viewById(id);
  } else {
    emits("selectItem", row);
  }
};

/**
 * 检查是否可以选择父节点
 * @param val
 */
const checkParent = (val: any) => {
  if (props.allowSelectParent) {
    return true;
  }
  let flag = false;
  for (let i in val) {
    let item = val[i];
    if (item["children"] && item["children"].length > 0) {
      flag = true;
      starHorseTableCompRef.value.toggleRowSelection(item, false);
    }
  }
  if (flag) {
    warning("非叶子节点不能选择");
    return false;
  }
  return true;
};
const handleSelectionChange = (val: any) => {
  if (!checkParent(val)) {
    return;
  }
  //如果是弹出选择，只能选择一条数据
  if (props.dialogInput) {
    if (val.length <= 1) {
      multipleSelection.value = val;
    } else {
      let ids = multipleSelection.value.map(
        (item: any) => item[props.primaryKey]
      ) as Array<any>;
      let datas = val.filter(
        (item: any) => !ids.includes(item[props.primaryKey])
      );
      starHorseTableCompRef.value.toggleRowSelection(
        multipleSelection.value[0]
      );
      multipleSelection.value = datas;
    }
  } else {
    multipleSelection.value = val;
  }
};
const getRowIdentity = (row: any) => {
  let arr = props.primaryKey?.split(".");
  if (arr?.length > 1) {
    let temp = row;
    for (let i in arr) {
      temp = temp[arr[i]];
    }
    return temp;
  }
  return props.primaryKey ? row[props.primaryKey] : "";
};
const dataFormat = (row: any, column: any, cellValue: any, index: number) => {
  cellValue = commonParseCodeToName(column.property, cellValue);
  return null == props.dataFormat
    ? cellValue
    : props.dataFormat(column.property, cellValue, row);
};
const tbCommonFun = (name: string, param: any) => {
  let data =
    props.selfBtnFunc && props.selfBtnFunc.find((item) => item.btnName == name);
  if (data) {
    data["exec"](param);
  } else {
    if (name == "view") {
      viewById(param[props.primaryKey]);
    } else if (name == "edit") {
      editById(param[props.primaryKey]);
    } else if (name == "delete") {
      deleteById(param[props.primaryKey]);
    }
  }
};
const viewById = (id: any) => {
  dialogProps!.viewVisible = true;
  dialogProps!.ids = id;
};
const editById = (id: any) => {
  dialogProps!.editVisible = true;
  dialogProps!.ids = id;
};
const deleteById = async (id: any) => {
  let flag = await deleteByIds(
    props.compUrl?.deleteUrl,
    id instanceof Array ? id : [id]
  );
  if (flag) {
    loadByPage();
  }
};
const parseSearchData = () => {};
const pageSizeClick = (pageSize: number) => {
  pageInfo.pageSize = pageSize;
  loadByPage();
};
const pageChangeClick = (currentPage: number) => {
  pageInfo.currentPage = currentPage;
  loadByPage();
};
//弹出选择框属性名称
const inputFieldName = ref<String>("");
//弹窗选择框属性值
const inputFieldVal = ref<any>();

/**
 * 分页显示数据
 */
const loadByPage = () => {
  load("数据加载中");
  let searchTemp = JSON.parse(JSON.stringify(searchFields)) || [];
  let orderByTemp = JSON.parse(JSON.stringify(orderBys)) || [];

  if (props.filterCondition) {
    searchTemp.push(...props.filterCondition);
  }
  if (props.orderBy) {
    orderByTemp.push(...props.orderBy);
  }
  if (defaultSearchFields.length > 0) {
    searchTemp.push(...defaultSearchFields);
  }
  let condition = props.compUrl?.condition;
  if (condition && condition.length > 0) {
    searchTemp.push(...condition);
  }
  postRequest(props.compUrl?.loadByPageUrl, {
    currentPage: pageInfo.currentPage,
    pageSize: pageInfo.pageSize,
    fieldList: searchTemp,
    orderBy: orderByTemp,
  })
    .then((res) => {
      let redata = res.data.data;
      pageInfo.dataList = redata?.dataList;
      if (props.dialogInput) {
        filterData();
      }
      pageInfo.totalPage = redata.totalPages;
      pageInfo.totalData = redata.totalDatas;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      closeLoad();
    });
};
const filterData = () => {
  if (pageInfo.dataList && inputFieldName.value && inputFieldVal.value) {
    let row = pageInfo.dataList.find(
      (item: any) => item[inputFieldName.value] == inputFieldVal.value
    );
    if (row) {
      multipleSelection.value.push(row);
      starHorseTableCompRef.value.toggleRowSelection(row, true);
    }
  }
};
const setDataInfo = (fieldName: string, val: any) => {
  multipleSelection.value = [];
  inputFieldName.value = fieldName;
  inputFieldVal.value = val;
  filterData();
};
/**
 * 单选选择行
 * @param row
 * @param column
 * @param evt
 */
const selectRow = (row: any, column: any, evt: any) => {
  if (!checkParent(row)) {
    return;
  }
  if (multipleSelection.value.length > 0) {
    for (let valueElement of multipleSelection.value) {
      starHorseTableCompRef.value.toggleRowSelection(valueElement);
    }
  }
  const selected = multipleSelection.value.some(
    (item: any) => item[props.primaryKey] === row[props.primaryKey]
  );
  if (!selected) {
    multipleSelection.value.push(row);
    starHorseTableCompRef.value.toggleRowSelection(row);
  } else {
    const finArr = multipleSelection.value.filter((item: any) => {
      return item[props.primaryKey] !== row[props.primaryKey];
    });
    multipleSelection.value = finArr;
    starHorseTableCompRef.value.toggleRowSelection(row, false);
  }
  dynamicForm.setSelectData(row);
  emits("selectItem", row);
};
/**
 * 动态改变条件并
 * @param cond
 */
const setCondition = (cond: SearchParams[], orderBy: OrderByInfo[]) => {
  defaultSearchFields = cond;
  orderBys = orderBy || [];
  loadByPage();
};
//导出方法和变量
defineExpose({
  init,
  //查询
  createCreateParams,
  loadByPage,
  getIds,
  multipleSelection,
  setDataInfo,
  setCondition,
  //按钮事件
  tableCompFunc,
});
</script>
<template>
  <div
    class="d-f j-c-s-b"
    style="width: 100%;border-bottom:  var(--star-horse-style); 1px solid"
    v-if="!dialogInput"
  >
    <div class="tb_title">
      <star-horse-icon icon-class="info" size="14px" />
      {{ title }}
    </div>
    <div class="d-f a-i-c a-i-c f-d-r-r">
      <el-button @click="loadByPage" link title="" size="small" type="primary">
        <star-horse-icon icon-class="refresh" size="16px" />
        <el-tooltip content="刷新">刷新</el-tooltip>
      </el-button>
      <el-popover trigger="click" :width="340" placement="left-end">
        <template #reference>
          <el-icon class="star-page-icon" style="cursor: pointer">
            <el-tooltip content="显示/隐藏列">
              <Tools />
            </el-tooltip>
          </el-icon>
        </template>
        <el-table
          class="sh-columns"
          ref="table"
          :data="toolFields"
          :strip="true"
          :fit="true"
          :highlight-current-row="true"
          max-height="400px"
          row-key="prop"
          style="width: 100%"
          border
        >
          <el-table-column prop="" label="排序" width="60">
            <el-tag class="move" style="cursor: move">
              <el-icon style="cursor: move">
                <Sort />
              </el-icon>
            </el-tag>
          </el-table-column>
          <el-table-column
            prop="label"
            label="列名"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <el-tag round :effect="scope.row.tableShow ? 'dark' : 'light'">
                {{ scope.row.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tableShow" label="显示/隐藏" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.tableShow"
                size="small"
                :active-value="true"
                :inactive-value="false"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-popover>
    </div>
  </div>

  <el-table
    ref="starHorseTableCompRef"
    :data="pageInfo.dataList"
    @selection-change="handleSelectionChange"
    @row-click="selectRow"
    @row-dblclick="editData"
    :row-key="getRowIdentity"
    :stripe="true"
    :fit="true"
    :height="height"
    :highlight-current-row="true"
    :default-expand-all="expand"
    :row-style="{
      height: '30px',
    }"
    :cell-style="{
      height: '30px',
      'font-size': '12px',
    }"
    :header-cell-style="{
      background: '#f2f2f2',
      color: '#707070',
      'font-size': '13px',
      'background-image':
        '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))',
    }"
    border
  >
    <el-table-column
      type="selection"
      align="center"
      fixed="left"
      :reserve-selection="true"
    >
    </el-table-column>
    <template v-for="item in fieldList['fieldList']">
      <template v-if="item instanceof Array">
        <star-horse-table-column
          :data-format="dataFormat"
          :cellEditable="fieldList['tableCellEditabled']"
          :item="sitem"
          :compUrl="compUrl"
          v-for="sitem in item"
        />
      </template>
      <template v-else-if="item.tabList?.length > 0">
        <star-horse-table-column
          :data-format="dataFormat"
          :cellEditable="fieldList['tableCellEditabled']"
          :item="sitem"
          :compUrl="compUrl"
          v-for="sitem in item.tabList.fieldList"
        />
      </template>
      <star-horse-table-column
        v-else
        :compUrl="compUrl"
        :cellEditable="fieldList['tableCellEditabled']"
        :data-format="dataFormat"
        :item="item"
      />
    </template>
    <template v-if="showBatchField" v-for="item in fieldList['batchFieldList']">
      <star-horse-table-column :data-format="dataFormat" :item="item" />
    </template>
    <el-table-column
      v-if="!disableAction"
      fixed="right"
      label="操作"
      width="180px"
    >
      <template #default="scope">
        <el-button
          v-if="permissions['edit']"
          @click="tbCommonFun('edit', scope.row)"
          link
          title=""
          type="primary"
          :size="compSize"
        >
          <el-tooltip content="编辑">编辑</el-tooltip>
        </el-button>
        <el-button
          v-if="permissions['view']"
          @click="tbCommonFun('view', scope.row)"
          link
          title=""
          type="primary"
          :size="compSize"
        >
          <el-tooltip content="查看">查看</el-tooltip>
        </el-button>
        <slot name="extend" :rowData="scope.row" />
        <template
          v-if="
            fieldList['userTableFuncs'] &&
            fieldList['userTableFuncs'].length > 0
          "
        >
          <el-button
            v-for="auth in fieldList['userTableFuncs']"
            :v-if="permissions[auth.authority]"
            @click="auth.funcName(scope.row)"
            link
            title=""
            type="primary"
            :size="compSize"
          >
            <el-tooltip :content="auth.btnName">{{ auth.btnName }}</el-tooltip>
          </el-button>
        </template>

        <el-button
          v-if="permissions['delete']"
          @click="tbCommonFun('delete', scope.row)"
          link
          title=""
          type="danger"
          :size="compSize"
        >
          <el-tooltip content="删除">删除</el-tooltip>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-if="showPageBar"
    :total="pageInfo.totalData"
    @current-change="pageChangeClick"
    @size-change="pageSizeClick"
    :small="true"
    layout="total, sizes, prev, pager, next, jumper"
    v-model:currentPage="pageInfo.currentPage"
    v-model:page-size="pageInfo.pageSize"
    v-model:pageCount="pageInfo.totalPage"
  />
</template>
<style lang="scss" scoped>
.warning-row {
  background: #8f8f8f;
}

:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}

.tb_title {
  flex: 1;
  color: var(--star-horse-style);
}
</style>
