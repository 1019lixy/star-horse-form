<script lang="ts" setup name="StarHorseFormList">
import {inject, nextTick, onMounted, PropType, ref, ShallowReactive} from 'vue'
import {ApiUrls} from "@/components/types/ApiUrls";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {rowClassName} from "@/api/sh_api";
import {error, success, warning} from "@/utils/message";
import {download} from "@/api/star_horse";
import {getToken} from "@/utils/auth";
import Sortable from "sortablejs";
import Help from "@/components/help.vue";
import {ModelRef} from "vue-demi";
import {uuid} from "@/api/system.ts";
import UTableColumn from "@/components/comp/items/UTableColumn.vue";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {Config} from "@/api/settings.ts";

let importDialogVisible = ref<boolean>(false);
let rowDialogVisible = ref<boolean>(false);
const rowDataFormRef = ref();
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object, required: true},
  defaultValues: {type: Object, default: {}},
  batchName: {type: String, default: "batchDataList"},
  primaryKey: {type: String},
  initRows: {type: Number, default: 1},
  importInfo: {type: Object},
  title: {type: String, default: ""},
  helpMsg: {type: String, default: ""},
  rules: {type: Object},
  staticColumn: {type: String, default: "N"},
  size: {type: String, default: Config.compSize},
  isView: {type: Boolean, default: false},
  subFlag: {type: Boolean, default: false},
});
const emits = defineEmits(["addRow", "removeRow"]);
const dataForm: ModelRef<any> = defineModel("dataForm");
const formFields = inject("formFields") as ShallowReactive<any>;
const loading = ref(null);
const starHorseFormListRef = ref(null);

const handleAddDetails = (row: any, type: number) => {
  if (props.staticColumn == "Y" && type != 2) {
    dynamicHandleAddForm(row, "add");
  } else {
    dynamicHandleAddRow(row, type);
  }
}
let currentRow = ref<any>({});
/**
 * 编辑当前行的数据
 * @param row
 * @param type
 */
const dynamicHandleAddForm = async (row: any, type: string) => {
  currentRow.value = row;
  rowDialogVisible.value = true;
  await nextTick();
  rowDataFormRef.value.setFormData(row);
}
const mergeData = async () => {
  let flag = false;
  await rowDataFormRef.value.$refs.starHorseFormRef.validate(res => flag = res);
  if (!flag) {
    return;
  }
  let formData = rowDataFormRef.value.getFormData().value;
  if (formData.xh) {
    dataForm.value[props.batchName][formData.xh - 1] = formData;
  } else {
    dataForm.value[props.batchName].push(formData);
  }
  closeAction();
}
const closeAction = () => {
  rowDialogVisible.value = false;
}
/**
 * 动态添加行
 * @param row
 * @param type
 */
const dynamicHandleAddRow = (row: any, type: number) => {
  if (!dataForm.value[props.batchName]) {
    dataForm.value[props.batchName] = [];
  }
  if (type === 1) {
    let obj = JSON.parse(JSON.stringify(props.defaultValues || {}));
    obj["_uuid"] = uuid();
    dataForm.value[props.batchName].push(obj);
    emits("addRow", row);
  } else {
    let index = row.xh - 1;
    formFields && formFields[props.batchName].splice(index, 1);
    dataForm.value[props.batchName].splice(index, 1);
    emits("removeRow", row);
  }
  //将事件传出去
  let fieldList = props.fieldList;
  for (let ind in fieldList) {
    let temp = fieldList[ind];
    if (temp.actions) {
      temp.actions(dataForm, "oper");
    }
  }
};
const getRowIdentity = (row: any) => {
  return row[props.primaryKey!];
}
//批量操作
const excelOperation = () => {
  importDialogVisible.value = true;
};
/**
 * 下载模板
 */
const downloadTemplate = () => {
  download(props.importInfo!.downloadTemplateUrl, {}).catch((err) => {
    error("接口不存在或网络异常:" + err);
  });
};
/**
 * 上传失败
 * @param _err err
 * @param _file file
 * @param _fileList fileList
 */
const uploadError = (_err: any, _file: any, _fileList: any) => {
  warning("导入数据失败");
};
/**
 * 上传成功
 */
const uploadSuccess = (response: any, _file: any, _fileList: any) => {
  if (response.code != 0) {
    warning("数据解析异常");
    return;
  }
  success("导入成功");
  dataForm.value[props.batchName] = response.data;
  importDialogVisible.value = false;
};
let currentItem = ref<any>({});
const selectData = (item: any) => {
  currentItem.value = item;
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
        const {oldIndex, newIndex} = event;
        if (oldIndex === newIndex) {
          return
        }
      },
    });
  }
};
const init = async () => {
  // console.log(Object.keys(dataForm.value), props.batchName);
  if (!Object.keys(dataForm.value).includes(props.batchName)) {
    dataForm.value[props.batchName] = [];
  }
  /**
   * 如果列表为空得情况才初始化行数
   */
  if (props.staticColumn == 'N') {
    if (dataForm.value[props.batchName]?.length == 0) {
      for (let i = 0; i < props.initRows; i++) {
        handleAddDetails(null, 1);
      }
    }
  }
  moveColumn();
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog :title="'编辑数据'" :dialogVisible="rowDialogVisible"
                     :boxWidth="'60%'"
                     :selfFunc="true"
                     @merge="mergeData"
                     @closeAction="closeAction">
    <star-horse-form :fieldList="{fieldList:fieldList}" ref="rowDataFormRef"/>
  </star-horse-dialog>
  <star-horse-dialog v-if="!subFlag" :title="'导入文件'" :dialogVisible="importDialogVisible"
                     :boxWidth="'30%'"
                     :isView="true"
                     :draggable="false"
                     @closeAction="importDialogVisible=false">
    <el-card>
      <el-upload
          :auto-upload="true"
          :on-error="uploadError"
          :on-success="uploadSuccess"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :action="importInfo!.importDataUrl"
          :headers="{ token: getToken() }"
          class="upload"
          name="file"
          drag
      >
        <el-icon class="el-icon--upload">
          <upload-filled/>
        </el-icon>
        <div class="el-upload__text">
          拖拽文件到这里 or
          <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xls/xlsx 文件类型
            <el-button @click="downloadTemplate" title="" :size="size" link v-if=
                "importInfo?.downloadTemplateUrl">
              <star-horse-icon icon-class="download" color="var(--star-horse-white)" size="12px"/>
              <el-tooltip content="下载模板">下载模板</el-tooltip>
            </el-button>
          </div>
        </template>
      </el-upload>
    </el-card>
  </star-horse-dialog>
  <div class="form-list">
    <div
        v-if="!subFlag"
        class="dynamic-tools"
    >
      <div class="tb_title">
        <star-horse-icon icon-class="info" size="14px"/>
        {{ title }}
        <help v-if="helpMsg" :message="helpMsg" :width="400"/>
      </div>
      <div style="display: flex;align-items: center;flex-direction: row-reverse">
        <ul class="inner_button" v-if="!isView">
          <li v-if="importInfo?.importDataUrl">
            <el-button @click="excelOperation" title="" link :size="size">
              <star-horse-icon icon-class="upload" color="var(--star-horse-style)" size="12px"/>
              <el-tooltip content="导入Excel">导入Excel</el-tooltip>
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <el-table
        v-loading="loading"
        :data="dataForm[batchName]"
        fit
        border
        sortable
        :size="size"
        :row-key="getRowIdentity"
        :strip="true"
        :highlight-current-row="true"
        :row-class-name="rowClassName"
        ref="starHorseFormListRef"
        class="sh-columns"
        :stripe="true"
        :header-cell-style="{'background':'#f2f2f2',
      'color': '#707070',
      'font-size':'12px',
      'background-image': '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))'
      }"
        :cell-style="{'font-size':'12px'}"
    >
      <el-table-column
          type="selection"
          fixed="left"
          width="50"
          align="center"
          v-if="false"
      />
      <el-table-column
          label="序号"
          align="center"
          prop="xh"
          width="50"
      />
      <el-table-column prop="" label="排序" width="60" v-if="staticColumn=='N'">
        <template #default="scope">
          <el-tag class="move" style="cursor: move"
                  @mousedown="selectData(scope.row)">
            <el-icon style="cursor: move">
              <Sort/>
            </el-icon>
          </el-tag>
        </template>
      </el-table-column>
      <template v-for="item in fieldList">
        <template v-if="Array.isArray(item)">
          <UTableColumn :item="temp" v-for="temp in item" :size="size" :rules="rules" :batchName="batchName"
                        :primaryKey="primaryKey" :staticColumn="staticColumn"/>
        </template>
        <template v-else-if="item.formShow">
          <UTableColumn :item="item" :size="size" :rules="rules" :batchName="batchName"
                        :primaryKey="primaryKey" :staticColumn="staticColumn"/>
        </template>

      </template>
      <el-table-column fixed="right" label="操作" width="80">
        <template #default="scope" v-if="!isView">
          <star-horse-icon icon-class="edit" v-if="staticColumn=='Y'"
                           @click="dynamicHandleAddForm(scope.row,'edit')" title="编辑"/>
          <star-horse-icon icon-class="delete" @click="handleAddDetails(scope.row, 2)" title="删除当前行"
                           color="#f56c6c"/>

        </template>
      </el-table-column>
    </el-table>
    <div class="add-row" v-if="!isView" @click="handleAddDetails(null, 1)">
      <star-horse-icon icon-class="plus" color="var(--star-horse-style)"/>
      {{ staticColumn == 'Y' ? "添加数据" : "加一行" }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-table__cell) {
  padding: 0;
}

.dynamic-tools {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  height: 20px;
  border-bottom: var(--star-horse-style) 1px solid;
}

.form-list {
  display: flex;
  flex-direction: column;
  width: 99%;
  margin: 0 auto;
  flex: 1;
  height: 100%;
  overflow: hidden;

  .inner_button {
    margin-bottom: 5px;
  }

  .el-table {
    flex: 1;
  }
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}

:deep(.el-form-item) {
  font-size: 11px;
  margin-bottom: 1px;
}

:deep(.el-input__inner ), :deep(el-select) {
  height: 25px;
  font-size: 12px;
}

:deep(.el-select) {
  line-height: 25px;
}
</style>
