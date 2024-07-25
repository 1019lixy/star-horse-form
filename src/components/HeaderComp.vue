<script lang="ts" setup name="Header">
import {computed, nextTick, onMounted, provide, reactive, ref, unref} from "vue"
import {Config} from "@/api/settings.ts"
import {postRequest, trim, userLogout} from "@/api/star_horse";
import {confirm, error, success, warning} from "@/utils/message";
import {DialogProps} from "@/components/types/DialogProps";
import {ApiUrls} from "@/components/types/ApiUrls";
import {getCustomerInfo, getCustomerParam, getUserInfo} from "@/utils/auth";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ElTable} from "element-plus";
import {closeLoad, filterTree, load} from "@/api/sh_api";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import StarHorseTableComp from "@/components/comp/StarHorseTableComp.vue";
import {getLang, setLang} from "@/theme/localStorge.ts";
import {LangType} from "@/theme/theme.ts";
import {i18n} from "../lang";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {UserInfo} from "@/store/UserInfoStore.ts";
const userInfoStore = UserInfo(piniaInstance);
const shortcutMenuList = ref<Array<any>>([]);
let systemName = Config.title;
let userInfo = getUserInfo();
let permissionMenuList = ref<Array<any>>([]);
let multipleSelection = ref<Array<any>>([]);
const shortcutMultipleTable = ref<InstanceType<typeof ElTable>>();
const dataForm = ref<any>({});
provide("dataForm", dataForm);
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/dictinfoEntity/pageList",
  mergeUrl: "/system-config/system/dictinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/dictinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/dictinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/dictinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/dictinfoEntity/getById",
  deleteUrl: "/system-config/system/dictinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/dictinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/dictinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/dictinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/dictinfoEntity/importData",
  uploadUrl: "",
  condition: [getCustomerParam()]
};
let configStore = GlobalConfig(piniaInstance);
const emits = defineEmits(["changeLang"]);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: -1,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [{
      label: "工号", fieldName: "employeeNo", type: "input",
      formShow: true, disabled: "Y",
    },
      {
        label: "用户名", fieldName: "username", type: "input",
        formShow: true, disabled: "Y",
      }],
    {
      label: "联系电话", fieldName: "phone", type: "input",
      formShow: true,
    },
    {
      label: "原始密码", fieldName: "oldPassword", type: "password",
      required: true, formShow: true,
    },
    {
      label: "新密码", fieldName: "password", type: "password",
      required: true, formShow: true,
    },
    {
      label: "确认密码", fieldName: "rePassword", type: "password",
      required: true, formShow: true,
    }
  ],
  //阻止初始化时自动加载列表数据
  stopAutoLoad: true,
});
const rules = {
  phone: [{
    type: 'string',
    message: '手机格式不正确',
    trigger: "change",
    // 自定义验证手机号格式
    validator(rule: any, value: any, callback: Function) {
      const reg = new RegExp(/1\d{10}/)
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
  },],
  oldPassword: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  password: [{required: true, message: "必填项不能为空", trigger: "blur"},
    {min: 6, max: 14, message: '密码长度为6 - 14位'}
  ],
  rePassword: [{required: true, message: "必填项不能为空", trigger: "blur"},
    {min: 6, max: 14, message: '确认密码长度为6 - 14位'},
    {
      trigger: "blur",
      validator(rule: any, value: any, callback: Function) {
        if (value != dataForm['password']) {
          callback(new Error("2次密码不一致"));
        } else {
          callback();
        }
      }
    }
  ],
};
const initData = async () => {
  await loadShortMenu();
  changeLang(getLang(), true);
};
onMounted(() => {
  initData();
});
/**
 * 权限弹窗
 */
const permissionEdit = () => {
  dialogProps.dialogTitle = "个人权限";
  dialogProps.batchEditVisible = true;
};
/**
 * 个人信息弹窗
 */
const modifyInfo = () => {
  dialogProps.dialogTitle = "更新个人信息";
  dialogProps.editVisible = true;
  resetForm();
};
const doModifyUserInfo = () => {
  postRequest("/system-config/system/usersAuditEntity/refreshInvalidPassword/" + dataForm.username +
      "/" + dataForm.password + "/" + (dataForm.oldPassword || "0") + "/" + dataForm.phone, {}).then(res => {
    let redata = res.data;
    if (redata.code != 0) {
      warning(redata.cnMessage);
      return;
    }
    success(redata.cnMessage);
    dialogProps.editVisible = false;
  });
};
/**
 * 重置表单
 */
const resetForm = () => {
  dataForm.value = {};
  dataForm.value["username"] = userInfo?.username;
  dataForm.value["employeeNo"] = userInfo?.employeeNo;
};
const loginOut = () => {
  confirm("是否确认退出系统?").then((res: boolean) => {
    if (res) {
      userInfoStore.logout();
      userLogout(userInfo || {});
    }
  });
};
const operSearch = () => {
}
const loadShortMenu = async () => {
  let param: any = [];
  await postRequest("/system-config/system/shortcutMenu/currentUserShortcut", param).then(res => {
    shortcutMenuList.value = res?.data?.data;
  }).catch(err => {
    console.log(err);
  })
};
const handleSelectionChange = (val: any) => {
  let flag = false;
  for (let i in val) {
    let item = val[i];
    if (item["children"] && item["children"].length > 0) {
      flag = true;
      shortcutMultipleTable.value.toggleRowSelection(item, false);
    }
  }
  if (flag) {
    warning("非叶子节点不能选择");
    return;
  }
  if (val.length > 10) {
    warning("最多只能设置10个快捷菜单");
    return;
  }
  multipleSelection.value = val;
};
/**
 * 递归函数，查找已设置为快捷菜单的数据
 *
 * @param path
 * @param datas
 */
const recallFun = (path: string, datas: any): any => {
  let reitem: any = {};
  for (let key in datas) {
    let item = datas[key];
    if (trim(item.path) == trim(path)) {
      reitem = item;
      break;
    }
    if (Object.keys(item.children).length > 0) {
      reitem = recallFun(path, item.children);
      if (Object.keys(reitem).length > 0) {
        break;
      }
    }
  }
  return reitem;
};
const reverseDataList = ref<Array<any>>([]);
const addShortcutMenu = async () => {
  let datas = userInfoStore.getPermissionMenus;
  reverseDataList.value = [];
  permissionMenuList.value = datas;
  dialogProps.bakeVisible1 = true;
  dialogProps.dialogTitle = "设置快捷菜单";
  /**
   * 坑，或者说是自己知识储备不足，dialog 是懒加载的，在dialog 打开前是获取不到Ref的，
   * 因此需要先打开Dialog 后再对表格选中问题进行处理
   */
  //在手动设置选中前,一定要先做清除选中,否则会出现很多重复被选中的情况
  await nextTick(async () => {
    // shortcutMultipleTable.value!.clearSelection();
    unref(shortcutMenuList).forEach((item: any) => {
      let fdata = recallFun(item.menuPath, datas);
      if (fdata) {
        reverseDataList.value.push(fdata);
      }
    });
  });
};
const batchMerge = () => {
  let selectedRows = shortcutMultipleTable.value!.multipleSelection;
  if (selectedRows.length > 10) {
    warning("快捷菜单最多只能设置10个");
    return
  }
  let dataList: Array<any> = [];
  selectedRows.forEach((item: any) => {
    dataList.push({
      idUsersinfo: userInfo?.idUsersinfo,
      menuName: item.meta.title,
      menuPath: item.path
    });
  });
  load("数据提交中");
  postRequest(`/system-config/system/shortcutMenu/mergeBatch/${userInfo.idUsersinfo}`, dataList).then(res => {
    success(res.data.cnMessage);
    dialogProps.bakeVisible1 = false;
    loadShortMenu();
  }).catch(err => {
    error(err);
  }).finally(() => {
    closeLoad();
  })
};
const shortcutReset = () => {
  shortcutMultipleTable.value!.clearSelection();
};
let curLangName = ref("中文");
const handleLanguageChanged = (lang: LangType) => {
  changeLang(lang, false);
  window.location.reload();
};
const changeLang = (lang: LangType, isInit: boolean) => {
  curLangName.value = lang == LangType.ZH_CN ? "中文" : "English";
  setLang(lang);
  emits("changeLang", lang, isInit);
}
const fieldList = ref<PageFieldInfo>({
  fieldList: [{
    label: "菜单名称",
    tableShow: true,
    fieldName: "meta.title"
  }, {
    label: "菜单路径",
    tableShow: true,
    fieldName: "path"
  }],
  stopAutoLoad: true
});
const dataFormat = (name: string, val: any, row: any) => {
  if (name == "meta.title") {
    return row["meta"]["title"];
  }
  return val;
};
const search = ref<String>();
const filterTableData = computed(() => filterTree(search.value, permissionMenuList.value));
let shortcutVisible = computed(() => configStore.configFormInfo.shortCutMenus || "Y");
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps"
                     @merge="doModifyUserInfo"
                     @resetForm="resetForm" :self-func="true">
    <star-horse-form v-model:data-form="dataForm" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.batchEditVisible" :dialogProps="dialogProps" :self-func="true">
    该功能建设中。。。。
  </star-horse-dialog>
  <star-horse-dialog :title="'编辑快捷菜单'" :dialog-props="dialogProps" :dialog-visible="dialogProps.bakeVisible1"
                     :self-func="true" @merge="batchMerge" @resetForm="shortcutReset">
    <el-input style="width: 15%;" v-model="search" size="small" placeholder="请输入关键字" clearable>
      <template #suffix>
        <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
      </template>
    </el-input>
    <star-horse-table-comp ref="shortcutMultipleTable" :field-list="fieldList" primaryKey="meta.title"
                           :compUrl="dataUrl" height="400px" :disableAction="true" :showPageBar="false"
                           :dataFormat="dataFormat"
                           :allowSelectParent="false" :expand="true" :reverseDataList="reverseDataList"
                           :tableDataList="filterTableData"/>
  </star-horse-dialog>
  <div class="header">
    <div :title="systemName" class="logo">
      <img :src="getCustomerInfo()?.logo" height="70"/>
      <!-- <star-horse-icon icon-class="star" style="vertical-align:middle;color: #e3e9f2;"/>
       <star-horse-icon icon-class="horse" style="vertical-align:middle;color: #e3e9f2;font-size: 22px"/>-->
    </div>
    <div class="header-left">
      <star-horse-hmenu/>
    </div>
    <div class="header-right">
      <div class="user-info">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <star-horse-icon icon-class="user-circle" size="30px" cursor="pointer"
                             style="vertical-align:middle;color: var(--star-horse-white);"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <span>{{ userInfo.name }}</span>
                <p>({{ userInfo.username }})</p>
              </el-dropdown-item>
              <el-dropdown-item divided class="clearfix" @click="permissionEdit">
                <star-horse-icon icon-class="sys-authority" color="var(--star-horse-style)"/>
                {{ i18n("main.header.authority") }}
              </el-dropdown-item>
              <el-dropdown-item class="clearfix" @click="modifyInfo">
                <star-horse-icon icon-class="user-edit" color="var(--star-horse-style)"/>
                {{ i18n("main.header.userEdit") }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="loginOut" class="clearfix">
                <star-horse-icon icon-class="login_out" style="vertical-align: middle;color:#f56c6c;"/>
                {{ i18n("main.header.logout") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown class="lang" @command="handleLanguageChanged">
          <span class="el-dropdown-link">{{ curLangName }}<star-horse-icon icon-class="arrow-down"
                                                                           style="color:var(--star-horse-white)"/></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh_cn">中文</el-dropdown-item>
              <el-dropdown-item command="en_us">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
  <div style="clear: both"></div>
  <div class="shortcut" v-if="shortcutVisible=='Y'">
    <div class="shortcut_ul">
      <template v-for="(item, index) in shortcutMenuList">
        <span>
          <el-tooltip :content="item.menuName">
            <router-link :to="{ path: item.menuPath }">
               <el-icon class="star-icon" style="color: var(--star-horse-white);font-size:18px">
          <component :is="item.menuIcon||'document'"/>
        </el-icon>
              {{
                item["menuName"]
              }}</router-link>
          </el-tooltip>
        </span>
        <span style=" display:flex;height:100%;width: 1px;cursor: none;color: #ffd04b"
              v-if="index < shortcutMenuList.length - 1">|</span>
      </template>
      <span @click="addShortcutMenu">
        <el-tooltip content="添加快捷菜单">
          <star-horse-icon icon-class="add" style="color: var(--star-horse-white);"/>
        </el-tooltip>
      </span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.el-avatar {
  margin-top: -10px;
}
.el-icon {
  font-size: 22px;
  margin: 3px auto;
}
.header {
  height: 50px;
  width: 100%;
  background: var(--star-horse-style);
  /*padding: 16px 36px 15px 30px;*/
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  box-sizing: border-box;
  flex-direction: row;
  .header-left {
    height: 100%;
    flex: 1;
    ul {
      list-style: none;
      display: flex;
      flex-direction: row;
      height: 100%;
      margin-left: 0;
      padding-left: 0;
      li {
        span {
          color: var(--star-horse-white);
        }
      }
    }
  }
  .header-right {
    width: 150px;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    text-align: right;
    .user-info {
      width: inherit;
      height: 100%;
      text-align: right;
      cursor: pointer;
      display: flex;
      flex-direction: row-reverse;
      vertical-align: middle;
      align-items: center;
      .lang {
        align-items: center;
        justify-content: center;
        vertical-align: middle;
      }
      .el-dropdown-link {
        color: var(--star-horse-white);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.el-dropdown-menu > .el-dropdown-menu__item:first-child {
  border-bottom: 1px solid silver;
}
.shortcut {
  height: 30px;
  background: var(--star-horse-style);;
  -webkit-box-shadow: 0 2px 10px 0 var(--star-horse-shadow-rgba);
  box-shadow: 0 2px 10px 0 var(--star-horse-shadow-rgba);
  border-top: 1px solid rgba($color: #fff, $alpha: .2);
  box-sizing: border-box;
  .shortcut_ul {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    text-align: left;
    align-items: center;
    margin-left: 0px;
    padding-left: 0px;
    span {
      display: flex;
      justify-content: center;
      align-items: center;
      vertical-align: middle;
      font-size: 13px;
      cursor: pointer;
      color: var(--star-horse-white);
      margin-left: 15px;
      text-align: center;
      height: 100%;
      a {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        font-size: 13px;
        cursor: pointer;
        margin-top: 0;
        padding-top: 0;
        color: var(--star-horse-white);
        text-align: center;
        height: 100%;
      }
      &:last-child {
        font-size: 14px;
        color: var(--star-horse-white);
        box-shadow: 0 2px 10px 0 var(--star-horse-shadow-rgba);
        box-sizing: border-box;
      }
    }
  }
}
:deep(.el-table__cell) {
  padding: 0;
}
:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}
</style>
