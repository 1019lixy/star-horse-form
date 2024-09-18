<script setup lang="ts" name="StarHorseButtonList">
import {computed, onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {download} from "@/api/star_horse";
import {error} from "@/utils/message";
import {DialogProps} from "../types/DialogProps";
import {BtnAuth} from "@/components/types/BtnAuth";
import {getToken} from "@/utils/auth";
import Help from "@/components/help.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {useButtonPermission} from "@/store/ButtonPermissionStore.ts";
import {useRoute} from "vue-router";
import {UserFuncInfo} from "@/components/types/PageFieldInfo";

const props = defineProps({
  dialogProps: {type: Object as PropType<DialogProps>, required: true},
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  selfBtnFunc: {type: Array as PropType<BtnAuth[]>, default: null},
  viewFlag: {type: Boolean, default: false},
  //自定义按钮
  extandBtns: {type: Array as PropType<UserFuncInfo[]>},
  //与检查方法
  preValidFunc: {type: Object, default: {}}
});
const emits = defineEmits([
  "upload",
  "uploadProcess",
  "uploadError",
  "uploadSuccess",
  "btnOperation",
  "tableCompFunc"
]);
let route = useRoute();
let configStore = GlobalConfig(piniaInstance);
let pagePermission = useButtonPermission();
let compSize = computed(() => configStore.configFormInfo?.buttonSize || "default");
let showType = computed(() => configStore.configFormInfo?.buttonShowType || "dropdown");
let permissions = ref<any>({});
const dataForm = ref<any>({});
const tableCompFunc = (funcName: string) => {
  emits("tableCompFunc", funcName);
};
const btnOperation = (funcName: string) => {
  let data: any = props.selfBtnFunc && props.selfBtnFunc.find((item) => item.btnName == funcName);
  //检查前置条件
  if (props.preValidFunc && props.preValidFunc[funcName]) {
    let result = props.preValidFunc[funcName]();
    if (!result) {
      return;
    }
  }
  if (data) {
    data["exec"]();
  } else {
    //？表示判断是否为空 ！表示断言not null
    if (funcName == "add") {
      //  dataForm.value = {};
      props.dialogProps!.ids = -1;
      props.dialogProps!.editVisible = true;
      props.dialogProps!.dialogTitle = "新增数据";
    } else if (funcName == "batchAdd") {
      props.dialogProps!.batchEditVisible = true;
      props.dialogProps!.batchDialogTitle = "批量新增数据";
    } else {
      console.log("未知条件");
    }
  }
};
/**
 * 刷新数据
 * @param file
 * @param fileList
 */
const downloadTemplate = () => {
  download(props.compUrl!.downloadTemplateUrl!, {}).catch((err) => {
    error("接口不存在或网络异常:" + err);
  });
};
const upload = (file: any, fileList: any) => {
  emits("upload", file, fileList);
};
const beforeUpload = (_file: any, _fileList: any) => {
  //load("数据导入中");
};
/**
 * 上传过程
 */
const uploadProcess = (_event: any, _file: any, _fileList: any) => {
};
/**
 * 上传失败
 */
const uploadError = (_err: any, _file: any, _fileList: any) => {
  // closeLoad();
  tableCompFunc("refresh");
};
/**
 * 上传成功
 */
const uploadSuccess = (_response: any, _file: any, _fileList: any) => {
  //closeLoad();
  tableCompFunc("refresh");
};
const checkSelfBtn = (btn: string) => {
  if (!props.selfBtnFunc) {
    return true;
  }
  let fdata = props.selfBtnFunc.find(item => item.btnName == btn);
  if (fdata) {
    return false;
  }
  return true;
}
const setFormData = (val: any) => {
  dataForm.value = {...val};
}
const init = async () => {
  permissions.value = await pagePermission.addRoute(route);
};
onMounted(() => {
  init();
});
defineExpose({
  setFormData
})
</script>
<style lang="scss" scoped>
:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset;
}

.el-menu {
  background: none;
  border-bottom: none;
}

:deep(.el-sub-menu) {
  background: none;
}

.el-menu--horizontal {
  height: 30px;
}
</style>
<template>
  <ul class="inner_button" v-if="showType=='line'&&Object.keys(permissions||{}).length>0">
    <li v-if="permissions?.add&&!viewFlag&&checkSelfBtn('add')">
      <el-button @click="btnOperation('add')" title=""
                 style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
        <star-horse-icon icon-class="plus" color="var(--star-horse-white)"/>
        <el-tooltip content="新增">新增</el-tooltip>
      </el-button>
    </li>
    <template v-if="selfBtnFunc&&selfBtnFunc.length>0">
      <template v-for="item in selfBtnFunc">
        <li>
          <template v-if="item.children&&item.children.length>0">
            <el-dropdown :size="compSize" split-button
                         style="background: var(--star-horse-style);color: var(--star-horse-white)"
                         placement="top-start">
              <star-horse-icon :icon-class="item.icon" color="var(--star-horse-white)"/>
              {{ item.labelName }}
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="sitem in item.children">
                    <el-button @click="sitem.exec!(sitem.btnName)" link title=""
                               style="background: var(--star-horse-style);color: var(--star-horse-white)"
                               :size="compSize">
                      <star-horse-icon :icon-class="sitem.icon||'default'"/>
                      {{ sitem.labelName }}
                    </el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <el-button v-else @click="item.exec!()" title=""
                     style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
            <star-horse-icon :icon-class="item.icon||'default'" color="var(--star-horse-white)"/>
            <el-tooltip :content="item.labelName">{{ item.labelName }}</el-tooltip>
          </el-button>
        </li>
      </template>
    </template>
    <li v-if="permissions?.download&&!viewFlag&&checkSelfBtn('download')">
      <el-button @click="downloadTemplate" title=""
                 style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
        <star-horse-icon icon-class="download" color="var(--star-horse-white)"/>
        <el-tooltip content="下载模板">下载模板</el-tooltip>
      </el-button>
    </li>
    <li v-if="permissions?.execution&&checkSelfBtn('exec')">
      <el-button @click="tableCompFunc('exec')" title=""
                 style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
        <star-horse-icon icon-class="run" color="var(--star-horse-white)"/>
        <el-tooltip content="执行">执行</el-tooltip>
      </el-button>
    </li>
    <li v-if="permissions?.upload&&!viewFlag&&checkSelfBtn('upload')">
      <el-upload
          :auto-upload="true"
          :on-change="upload"
          :on-error="uploadError"
          :on-progress="uploadProcess"
          :on-success="uploadSuccess"
          :show-file-list="false"
          accept=".xls,.xlsx"
          :before-upload="beforeUpload"
          :action="compUrl.importUrl"
          :headers="{ token: getToken() }"
          class="upload"
          name="file"
      >
        <el-button title="" style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
          <star-horse-icon icon-class="excel-upload" color="var(--star-horse-white)"/>
          <el-tooltip content="导入">导入</el-tooltip>
        </el-button>
      </el-upload>
    </li>
    <li v-if="permissions?.export&&checkSelfBtn('exportData')">
      <el-button @click="tableCompFunc('exportData')" title=""
                 style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
        <star-horse-icon icon-class="excel-export" color="var(--star-horse-white)"/>
        <el-tooltip content="导出">导出</el-tooltip>
      </el-button>
      <help message="如果选择了数据，则按选择数据导出;没有选择数据，则根据查询条件导出" style="font-size: 16px"/>
    </li>
    <li v-if="permissions?.batchDelete&&!viewFlag&&checkSelfBtn('batch_delete')">
      <el-button @click="tableCompFunc('batch_delete')" title="" type="danger" :size="compSize">
        <star-horse-icon icon-class="batch_delete1" color="var(--star-horse-white)"/>
        <el-tooltip content="批量删除">批量删除</el-tooltip>
      </el-button>
    </li>
  </ul>
  <el-menu mode="horizontal" :ellipsis="false" v-if="showType=='dropdown'&&Object.keys(permissions||{}).length>0">
    <el-sub-menu index="1">
      <template #title> 操作</template>
      <el-menu-item index="1-1" v-if="permissions?.add&&!viewFlag&&checkSelfBtn('add')" @click="btnOperation('add')">
        <star-horse-icon icon-class="plus" style="color: var(--star-horse-style)" size="14px"/>
        新增
      </el-menu-item>
      <template v-if="selfBtnFunc&&selfBtnFunc.length>0">
        <template v-for="(item,ain) in selfBtnFunc">
          <template v-if="item.children&&item.children.length>0">
            <el-sub-menu :index="'2-'+ain">
              <template #title>
                {{ item.labelName }}
              </template>
              <el-menu-item :index="'3-'+ain+'-'+index" v-for="(sitem,index) in item.children"
                            @click="sitem.exec!(sitem.btnName)">
                <star-horse-icon :icon-class="sitem.icon||'default'" style="color: var(--star-horse-style)"
                />
                {{ sitem.labelName }}
              </el-menu-item>
            </el-sub-menu>
          </template>
          <el-menu-item :index="'2-'+ain" v-else @click="item.exec!(item.btnName)">
            <star-horse-icon :icon-class="item.icon||'default'" style="color: var(--star-horse-style)"/>
            {{ item.labelName }}
          </el-menu-item>
        </template>
      </template>
      <el-menu-item index="1-2" v-if="permissions?.download&&!viewFlag&&checkSelfBtn('download')"
                    @click="downloadTemplate">
        <star-horse-icon icon-class="download" style="color: var(--star-horse-style)"/>
        下载模板
      </el-menu-item>
      <el-menu-item index="1-3" v-if="permissions?.execution&&checkSelfBtn('exec')"
                    @click="tableCompFunc('exec')">
        <star-horse-icon icon-class="run" style="color: var(--star-horse-style)"/>
        执行
      </el-menu-item>
      <el-menu-item index="1-4" v-if="permissions?.upload&&!viewFlag&&checkSelfBtn('upload')">
        <el-upload
            :auto-upload="true"
            :on-change="upload"
            :on-error="uploadError"
            :on-progress="uploadProcess"
            :on-success="uploadSuccess"
            :show-file-list="false"
            accept=".xls,.xlsx"
            :before-upload="beforeUpload"
            :action="compUrl.importUrl"
            :headers="{ token: getToken() }"
            class="upload"

            name="file"
        >
          <star-horse-icon icon-class="excel-upload" style="color: var(--star-horse-style)"/>
          导入
        </el-upload>
      </el-menu-item>
      <el-menu-item index="1-5" v-if="permissions?.export&&checkSelfBtn('exportData')"
                    @click="tableCompFunc('exportData')">
        <star-horse-icon icon-class="excel-export" style="color: var(--star-horse-style)"/>
        导出
        <help message="
        如果选择了数据，则按选择数据导出;
        没有选择数据，则根据查询条件导出"/>
      </el-menu-item>
      <el-menu-item index="1-6" v-if="permissions?.batchDelete&&!viewFlag&&checkSelfBtn('batch_delete')"
                    @click="tableCompFunc('batch_delete')">
        <star-horse-icon icon-class="batch_delete1" style="color: var(--star-horse-style)"/>
        批量删除
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
