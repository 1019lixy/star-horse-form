<script lang="ts" setup name="Header">
import { Config } from "@/api/settings";
import { userLogout } from "@/api/star_horse_apis";
import Message from "@/components/Message.vue";
import { i18n } from "@/lang";
import { useLoginStore } from "@/store/Login";
import { getLang, setLang } from "@/theme/localStorge";
import { LangType } from "@/theme/theme";
import { getCustomerInfo, getUserInfo } from "@/utils/auth";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  DataPicker,
  error,
  load,
  operationConfirm,
  piniaInstance,
  postRequest,
  success,
  useGlobalConfigStore,
  useUserInfoStore,
  warning,
} from "star-horse-lowcode";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const userStore = useUserInfoStore(piniaInstance);
const loginStore = useLoginStore(piniaInstance);
const menuUrl: ApiUrls = apiInstance("system-config", "system/menusinfo");
const configStore = useGlobalConfigStore(piniaInstance);
const configInfo = computed(() => configStore.configFormInfo);
const { push } = useRouter();
const emits = defineEmits(["changeLang", "layoutConfig"]);
const appinfoList = computed(() => loginStore.getAppInfoList());
const shortcutMenuList = computed(() => loginStore.getShortcutMenuList());
let systemName = Config.title;
let userInfo = getUserInfo();

const initData = () => {
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
  push("/userCenter");
};

const loginOut = () => {
  operationConfirm(i18n("header.logoutConfirm")).then((res: boolean) => {
    if (res) {
      userStore.logout();
      userLogout(userInfo || {});
    }
  });
};
const selectData = ref<Array<any>>([]);
const dataPickerRef = ref<any>();
const addShortcutMenu = async () => {
  selectData.value = [...shortcutMenuList.value];
  dataPickerRef.value.open();
};
const batchMerge = (datas: Array<any>) => {
  if (datas?.length > 10) {
    warning(i18n("userCenter.shortcutMenuLimit"));
    return;
  }
  let dataList: Array<any> = [];
  datas.forEach((item: any) => {
    dataList.push({
      idUsersinfo: userInfo?.idUsersinfo,
      menuName: item.menuName,
      menuPath: item.menuPath,
    });
  });
  load(i18n("userCenter.dataSubmitting"));
  postRequest(
    `/system-config/system/shortcutMenu/mergeBatch/${userInfo.idUsersinfo}`,
    dataList,
  )
    .then((res: any) => {
      success(res.data.cnMessage);
      dataPickerRef.value.close();
      loginStore.loadShortMenu();
    })
    .catch((err: any) => {
      error(err);
    })
    .finally(() => {
      closeLoad();
    });
};
let curLangName = ref("");
const handleLanguageChanged = (lang: LangType) => {
  // Use the language synchronization service to set the language
  changeLang(lang as LangType, false);
  location.reload();
};
const changeLang = (lang: LangType, isInit: boolean) => {
  curLangName.value =
    lang == LangType.ZH_CN ? i18n("locale.chinese") : i18n("locale.english");
  setLang(lang);
  emits("changeLang", lang, isInit);
};

const selectItem = (item: any) => {
  const userId = getUserInfo()?.idUsersinfo;
  loginStore.loadMenusInfo(userId, item?.idInformations);
};
</script>
<template>
  <DataPicker
    ref="dataPickerRef"
    :title="i18n('header.shortcutMenu.title')"
    :data-url="`${menuUrl.basePrefix}/permissionMenus/${getUserInfo()?.idUsersinfo}/-1`"
    :page-size="100"
    :display-name="'menuName'"
    :display-value="'dataNo'"
    :checkStrictly="true"
    :multiple="true"
    :autoClose="false"
    @dataSubmit="batchMerge"
    v-model="selectData"
  />
  <div
    class="flex items-center justify-between overflow-hidden w-full vertical-align-middle flex-row"
    :style="{ height: configInfo.shortCutMenus == 'Y' ? '60%' : 'inherit' }"
    style="
      -webkit-box-align: center;
      -webkit-box-pack: justify;
      background: var(--star-horse-style);
    "
  >
    <div :title="systemName" class="flex items-center ml-[10px]">
      <img
        v-if="getCustomerInfo()?.logo"
        :src="getCustomerInfo()?.logo"
        :height="getCustomerInfo()?.height || 45"
      />
      <star-horse-icon
        v-else
        icon-class="logo"
        size="45px"
        width="45px"
        height="45px"
        style="color: var(--star-horse-white); font-weight: bold"
      />
    </div>
    <div class="flex-1 flex flex-row items-center h-full overflow-hidden">
      <star-horse-menu
        :ellipsis="true"
        v-if="configInfo.menusCfg == 'tradition'"
        :mode="'horizontal'"
        @selectItem="selectItem"
        :dataList="appinfoList"
        :preps="{
          id: 'idInformations',
          label: 'sysName',
          icon: 'sysLogo',
          children: 'children',
        }"
      />
    </div>
    <div
      class="flex h-full w-[180px] mr-[10px] flex-row justify-between flex-no-wrap items-center"
    >
      <Message />
      <el-dropdown
        class="flex flex-row"
        @command="handleLanguageChanged"
        :show-arrow="false"
      >
        <span
          class="flex items-center flex-row"
          style="cursor: pointer; color: #fff"
        >
          {{ curLangName
          }}<star-horse-icon
            icon-class="arrow-down"
            style="color: var(--star-horse-white)"
        /></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh_cn">{{
              i18n("locale.chinese")
            }}</el-dropdown-item>
            <el-dropdown-item command="en_us">{{
              i18n("locale.english")
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click" :show-arrow="false">
        <span class="el-dropdown-link">
          <star-horse-icon
            icon-class="user-circle"
            size="30px"
            width="30px"
            height="30px"
            cursor="pointer"
            style="vertical-align: middle; color: var(--star-horse-white)"
          />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <span>{{ userInfo.name }}</span>
              <p>({{ userInfo.username }})</p>
            </el-dropdown-item>
            <el-dropdown-item divided class="clearfix" @click="modifyInfo">
              <star-horse-icon
                icon-class="user-circle"
                color="var(--star-horse-style)"
              />
              {{ i18n("main.header.authority") }}
            </el-dropdown-item>
            <el-dropdown-item
              divided
              class="clearfix"
              @click="push('/shcalendar')"
            >
              <star-horse-icon
                icon-class="calendar"
                color="var(--star-horse-style)"
              />
              {{ i18n("main.header.calendar") }}
            </el-dropdown-item>
            <el-dropdown-item divided class="clearfix" @click="layoutConfig">
              <star-horse-icon
                icon-class="layout"
                color="var(--star-horse-style)"
              />
              {{ i18n("main.header.layoutConfig") }}
            </el-dropdown-item>

            <el-dropdown-item divided @click="loginOut" class="clearfix">
              <star-horse-icon
                icon-class="login_out"
                style="vertical-align: middle; color: #f56c6c"
              />
              {{ i18n("main.header.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <div class="shortcut" v-if="configInfo.shortCutMenus == 'Y'">
    <div
      class="shortcut_ul flex h-full w-full flex-row align-left items-center ml-0 pl-0"
    >
      <template v-for="(item, index) in shortcutMenuList">
        <span>
          <el-tooltip :content="item.menuName">
            <router-link :to="{ path: item.menuPath }">
              <el-icon
                class="star-icon"
                style="color: var(--star-horse-white); font-size: 18px"
              >
                <component :is="item.menuIcon || 'document'" />
              </el-icon>
              &nbsp;{{ item["menuName"] }}</router-link
            >
          </el-tooltip>
        </span>
        <span
          style="
            display: flex;
            height: 100%;
            width: 1px;
            cursor: none;
            color: #ffd04b;
          "
          v-if="index < shortcutMenuList.length - 1"
          >|</span
        >
      </template>
      <span @click="addShortcutMenu">
        <el-tooltip :content="i18n('header.shortcutMenu.tooltip')">
          <star-horse-icon
            icon-class="add"
            style="color: var(--star-horse-white)"
          />
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

.el-dropdown-menu > .el-dropdown-menu__item:first-child {
  border-bottom: 1px solid silver;
}

.shortcut {
  height: 30px;
  background: var(--star-horse-style);
  -webkit-box-shadow: 0 2px 10px 0 var(--star-horse-shadow-rgba);
  box-shadow: 0 2px 10px 0 var(--star-horse-shadow-rgba);
  border-top: 1px solid rgba($color: #fff, $alpha: 0.2);
  box-sizing: border-box;

  .shortcut_ul {
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
