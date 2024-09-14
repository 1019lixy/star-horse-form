<script lang="ts" setup name="Header">
import {computed, nextTick, onMounted, reactive, ref, unref} from "vue"
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
import {userInfoStore} from "@/store/UserInfoStore.ts";
// import {configInfo} from "@/items/sh_design.ts";
import {toggleDark} from "@/api/system.ts";
import {Moon, Sunny} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";

const userStore = userInfoStore(piniaInstance);
const shortcutMenuList = ref<Array<any>>([]);
let systemName = Config.title;
let userInfo = getUserInfo();
let permissionMenuList = ref<Array<any>>([]);
const shortcutMultipleTable = ref<InstanceType<typeof ElTable>>();
let currentTab = ref<string>("message");
let editUserinfoRef = ref();
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
let router = useRouter();
const emits = defineEmits(["changeLang", "layoutConfig"]);
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
const layoutConfig = () => {
  emits("layoutConfig");
};
/**
 * 个人信息弹窗
 */
const modifyInfo = () => {
  // dialogProps.dialogTitle = "更新个人信息";
  // dialogProps.editVisible = true;
  // resetForm();
  router.push("/userCenter");
};

const loginOut = () => {
  confirm("是否确认退出系统?").then((res: boolean) => {
    if (res) {
      userStore.logout();
      userLogout(userInfo || {});
    }
  });
};

const loadShortMenu = async () => {
  let param: any = [];
  await postRequest("/system-config/system/shortcutMenu/currentUserShortcut", param).then(res => {
    shortcutMenuList.value = res?.data?.data;
  }).catch(err => {
    console.log(err);
  })
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
  let datas = userStore.getPermissionMenus;
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
  let selectedRows = shortcutMultipleTable.value!.multipleSelection!.value;
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
const search = ref<string>();
let theme = ref<string>("light");
const filterTableData = computed(() => filterTree(search.value, permissionMenuList.value));
let configInfo = computed(() => configStore.configFormInfo);
</script>
<template>
  <star-horse-dialog :title="'编辑快捷菜单'" :dialog-props="dialogProps" :dialog-visible="dialogProps.bakeVisible1"
                     :self-func="true" @merge="batchMerge" @resetForm="shortcutReset">
    <el-input style="width: 50%;" v-model="search" :size="configInfo.inputSize||'default'" placeholder="请输入关键字"
              clearable>
      <template #append>
        <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
      </template>
    </el-input>
    <star-horse-table-comp ref="shortcutMultipleTable" :field-list="fieldList" primaryKey="meta.title"
                           :compUrl="dataUrl" :disableAction="true" :showPageBar="false"
                           :dataFormat="dataFormat"
                           :allowSelectParent="false" :expand="true" :reverseDataList="reverseDataList"
                           :tableDataList="filterTableData"/>
  </star-horse-dialog>
  <div class="star-horse-inner-header">
    <div :title="systemName" class="logo">
      <img v-if="getCustomerInfo()?.logo" :src="getCustomerInfo()?.logo" :height="getCustomerInfo()?.height||45"/>
      <star-horse-icon v-else icon-class="logo"
                       style="color: var(--star-horse-white);height:45px;width:45px;font-weight:bold"/>
    </div>
    <div class="header-left">
      <star-horse-hmenu v-if="configInfo.menusCfg=='tradition'"/>
    </div>
    <div class="header-right">
      <div class="message">
        <el-switch @change="toggleDark"
                   v-model="theme"
                   active-value="light"
                   inactive-value="dark"
                   :active-action-icon="Sunny"
                   :inactive-action-icon="Moon"
                   style="width: 50%"
        />
        <el-popover :popper-style="{width: 'unset !important'}" placement="bottom-end" :width="600" trigger="hover"
                    :show-arrow="false">
          <template #reference>
            <el-badge :value="6">
              <star-horse-icon icon-class="messages" color="var(--star-horse-white)"/>
            </el-badge>
          </template>
          <el-tabs v-model="currentTab">
            <el-tab-pane label="消息" name="message">
              <template #label>
                <el-badge :value="4">
                  消息
                </el-badge>
              </template>
            </el-tab-pane>
            <el-tab-pane label="待办" name="dealt">
              <template #label>
                <el-badge :value="2">
                  待办
                </el-badge>
              </template>
            </el-tab-pane>
          </el-tabs>
        </el-popover>
      </div>
      <div class="user-info">
        <el-dropdown class="lang" @command="handleLanguageChanged" :show-arrow="false">
          <span class="el-dropdown-link">{{ curLangName }}<star-horse-icon icon-class="arrow-down"
                                                                           style="color:var(--star-horse-white)"/></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh_cn">中文</el-dropdown-item>
              <el-dropdown-item command="en_us">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown trigger="click" :show-arrow="false">
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
              <el-dropdown-item divided class="clearfix" @click="modifyInfo">
                <star-horse-icon icon-class="user-circle" color="var(--star-horse-style)"/>
                {{ i18n("main.header.authority") }}
              </el-dropdown-item>
              <el-dropdown-item divided class="clearfix" @click="layoutConfig">
                <star-horse-icon icon-class="layout" color="var(--star-horse-style)"/>
                {{ i18n("main.header.layoutConfig") }}
              </el-dropdown-item>

              <el-dropdown-item divided @click="loginOut" class="clearfix">
                <star-horse-icon icon-class="login_out" style="vertical-align: middle;color:#f56c6c;"/>
                {{ i18n("main.header.logout") }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

      </div>
    </div>
  </div>
  <div style="clear: both"></div>
  <div class="shortcut" v-if="configInfo.shortCutMenus=='Y'">
    <div class="shortcut_ul">
      <template v-for="(item, index) in shortcutMenuList">
        <span>
          <el-tooltip :content="item.menuName">
            <router-link :to="{ path: item.menuPath }">
               <el-icon class="star-icon" style="color: var(--star-horse-white);font-size:18px">
          <component :is="item.menuIcon||'document'"/>
        </el-icon>
             &nbsp;{{ item["menuName"] }}</router-link>
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

  svg {
    color: var(--star-horse-white);
  }
}

.star-horse-inner-header {
  height: 50px;
  width: 100%;
  background: var(--star-horse-style);
  /*padding: 16px 36px 15px 30px;*/
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  vertical-align: middle;
  box-sizing: border-box;
  flex-direction: row;
  overflow: hidden;

  .logo {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }

  .header-left {
    height: 100%;
    flex: 1;
    width: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: row;
    align-items: center;

  }

  .header-right {
    width: 15%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

    .message {
      height: 40px;
      width: 45%;
      display: flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      cursor: pointer;

      .el-badge {
        svg {
          width: 2em;
          height: 2em;
        }
      }

    }

    .user-info {
      flex: 1;
      width: 30%;
      height: 100%;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      vertical-align: middle;
      align-items: center;

      .lang {
        width: 50%;
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
  background: var(--star-horse-style);
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
    margin-left: 0;
    padding-left: 0;

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
