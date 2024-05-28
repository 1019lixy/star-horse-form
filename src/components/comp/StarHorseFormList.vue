<script lang="ts" setup name="StarHorseFormList">
import {inject, onMounted, Ref, ref, reactive, PropType} from 'vue'
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import ShTableListColumn from "@/components/comp/ShTableListColumn.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {batchFieldDefaultValues, rowClassName} from "@/api/sh_api";
import {error, success, warning} from "@/utils/message";
import {download} from "@/api/star_horse";
import {getToken} from "@/utils/auth";

let importDialogVisible = ref<Boolean>(false);
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  fieldList: {type: Object, required: true},
  defaultValues: {type: Object, default: {}},
  batchName: {type: String, default: "batchDataList"},
  primaryKey: {type: String, required: true},
  initRows: {type: Number, default: 1},
  importInfo: {type: Object},
  title: {type: String, default: ""},
  rules: {type: Object, required: true},
  isView: {type: Boolean, default: false},
  subFlag: {type: Boolean, default: false},
});
// const dataForm = inject('dataForm') as Ref;

const dataForm = defineModel("dataForm") as Ref;
const formFields = inject("formFields") as reactive<Object>;
onMounted(() => {
  init();
});
const loading = ref(null);
const starHorseFormListRef = ref(null);
const init = async () => {
  if (!Object.keys(dataForm.value).includes(props.batchName)) {
    dataForm.value[props.batchName] = [];
  }
  /**
   * 如果列表为空得情况才初始化行数
   */
  if (dataForm.value[props.batchName].length == 0) {
    for (let i = 0; i < props.initRows; i++) {
      handleAddDetails(null, 1);
    }
  }


};
const handleAddDetails = (row: any, type: number) => {
  if (!dataForm.value[props.batchName]) {
    dataForm.value[props.batchName] = [];
  }
  if (type === 1) {
    let obj = JSON.parse(JSON.stringify(props.defaultValues || {}));
    dataForm.value[props.batchName].push(obj)
  } else {
    let index = row.xh - 1;
    formFields && formFields[props.batchName].splice(index, 1);
    dataForm.value[props.batchName].splice(index, 1)
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
  return row[props.primaryKey];
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
 * @param err
 * @param file
 * @param fileList
 */
const uploadError = (err, file, fileList) => {
  warning("导入数据失败");
};
/**
 * 上传成功
 */
const uploadSuccess = (response: any, file, fileList) => {
  if (response.code != 0) {
    warning("数据解析异常");
    return;
  }
  success("导入成功");
  dataForm.value[props.batchName] = response.data;
  importDialogVisible.value = false;

};
</script>
<template>
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
            <el-button @click="downloadTemplate" title="" size="small" link v-if=
                "importInfo?.downloadTemplateUrl">
              <star-horse-icon icon-class="download" color="#ffffff" size="12px"/>
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
        style="display:flex;justify-content:space-between;width: 100%;border-bottom:  var(--star-horse-style) 1px solid"
    >
      <div class="tb_title">
        <star-horse-icon icon-class="info" size="14px"/>
        {{ title }}
      </div>
      <div style="display: flex;align-items: center;flex-direction: row-reverse">
        <ul class="inner_button" v-if="!isView">
          <li v-if="importInfo?.importDataUrl">
            <el-button @click="excelOperation" title="" type="primary" size="small">
              <star-horse-icon icon-class="upload" color="var(--star-horse-style)" size="12px"/>
              <el-tooltip content="导入Excel">导入Excel</el-tooltip>
            </el-button>
          </li>
          <li>
            <el-button @click="handleAddDetails(null, 1)" title="" type="text" size="small">
              <star-horse-icon icon-class="add" color="var(--star-horse-style)" size="12px"/>
              <el-tooltip content="添加">添加</el-tooltip>
            </el-button>
          </li>
        </ul>
      </div>
    </div>
    <el-table
        v-loading="loading"
        :data="dataForm[batchName]"
        fit=true
        border
        :row-key="getRowIdentity"
        :strip="true"
        :highlight-current-row="true"
        :row-class-name="rowClassName"
        ref="starHorseFormListRef"

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
      <template v-for="item in fieldList">
        <el-table-column
            :prop="item.fieldName"
            :label="item.label"
            sortable
            :min-width="item.minWidth||Config.defaultColumnWidth + 'px'"
            v-if="item.formShow">
          <template #default="scope">
            <template v-if="item.batchFieldList?.length>0" v-for="sitem in  item.batchFieldList">
              <star-horse-form-list
                  style="min-height:100px"
                  v-model:dataForm="scope.row"
                  :compUrl="sitem['compUrl']"
                  :primaryKey="sitem['primaryKey']"
                  :batchName="sitem['batchName']"
                  :initRows="sitem['initRows']"
                  :subFlag="true"
                  :defaultValues="batchFieldDefaultValues(sitem)"
                  :field-list="sitem['fieldList']"
                  :rules="sitem['rules']||rules"
              />
            </template>
            <template v-else>
              <sh-table-list-column :primaryKey="primaryKey" :batchName="batchName"
                                    :data-form="scope.row"
                                    :rules="rules" :item="item"
                                    :index="scope.$index"/>
            </template>
          </template>
        </el-table-column>
      </template>
      <el-table-column fixed="right" label="操作" width="120">

        <template #default="scope" v-if="!isView">
          <el-button
              v-if="dataForm[batchName]?.length == scope.row['xh']"
              @click="handleAddDetails(scope.row, 1)"
              link
              size="small"
              type="primary">
            <el-tooltip content="添加一行">添加</el-tooltip>
          </el-button>
          <el-button
              @click="handleAddDetails(scope.row, 2)"
              link
              size="small"
              type="danger">
            <el-tooltip content="删除当前行">删除</el-tooltip>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-table__cell) {
  padding: 0;
}

.form-list {
  display: flex;
  flex-direction: column;

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
  width: 100%;
}

:deep(.el-input__inner ), :deep(el-select) {
  height: 25px;
  font-size: 12px;
}

:deep(.el-select) {
  line-height: 25px;
}
</style>