import { createRouterAndMenuList } from '@/api/star_horse_apis.ts';
import {
  getUserInfo,
  setCustomerInfo,
  setToken,
  setUserInfo,
} from '@/utils/auth.ts';
import { defineStore } from 'pinia';
import {
  apiInstance,
  ApiUrls,
  loadData,
  MenusInfo,
  piniaInstance,
  postRequest,
  useUserInfoStore,
} from 'star-horse-lowcode';
import { ref } from 'vue';
import { useNavBarListStore } from '@/store/NavBarList';
import { useViewCacheStore } from '@/store/ViewCache';
import piniaCompInstance from '@/store';

const appinfoUrl: ApiUrls = apiInstance(
  'system-config',
  'system/informationsEntity',
);
const shortcutMenuUrl: ApiUrls = apiInstance(
  'system-config',
  'system/shortcutMenu',
);
const menuUrl: ApiUrls = apiInstance('system-config', 'system/menusinfoEntity');
const userAuditUrl: ApiUrls = apiInstance(
  'system-config',
  'system/usersAuditEntity',
);
const userStore = useUserInfoStore(piniaInstance);
const navStore = useNavBarListStore(piniaCompInstance);
const viewCache = useViewCacheStore(piniaCompInstance);
export const useLoginStore = defineStore('login', () => {
  const appinfoList = ref([]);
  const menusList = ref<MenusInfo[]>([]);
  const shortcutMenuList = ref([]);
  /**
   * 初始化登录信息
   */
  const init = () => {
    let userId = getUserInfo()?.idUsersinfo;
    loadAppInfo(userId);
    loadMenusInfo(userId, '-1');
    loadShortMenu();
  };
  /**
   * 清除所有登录信息
   */
  const clearAll = () => {
    navStore.clearAll();
    viewCache.clearAll();
    sessionStorage.removeItem('menusInfo');
    sessionStorage.removeItem('appsInfo');
    sessionStorage.removeItem('shortsInfo');
    appinfoList.value = [];
    menusList.value = [];
    shortcutMenuList.value = [];
  };
  /**
   * 加载菜单信息
   * @param userId
   * @param appId
   */
  const loadMenusInfo = (userId: string, appId: string) => {
    if (!appId) {
      appId = '-1';
    }
    postRequest(`${menuUrl.basePrefix}/permissionMenus/${userId}/${appId}`, [])
      .then((res: any) => {
        const redata = res?.data?.data;
        if (redata) {
          sessionStorage.setItem('menusInfo', JSON.stringify(redata));
          menusList.value = createRouterAndMenuList(redata);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  /**
   * 加载应用信息
   * @param userId
   */
  const loadAppInfo = (userId: string) => {
    postRequest(`${appinfoUrl.basePrefix}/getUserSystem/${userId}`, [])
      .then((res: any) => {
        const redata = res?.data?.data;
        sessionStorage.setItem('appsInfo', JSON.stringify(redata));
        appinfoList.value = redata;
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  /**
   * 加载快捷菜单
   */
  const loadShortMenu = () => {
    let param: any = [];
    postRequest(`${shortcutMenuUrl.basePrefix}/currentUserShortcut`, param)
      .then((res: any) => {
        const redata = res?.data?.data;
        sessionStorage.setItem('shortsInfo', JSON.stringify(redata));
        shortcutMenuList.value = redata;
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
  /**
   * 获取快捷菜单列表
   * @returns
   */
  const getShortcutMenuList = () => {
    if (shortcutMenuList.value?.length == 0) {
      const shortsInfo: any = sessionStorage.getItem('shortsInfo');
      if (!shortsInfo || shortsInfo == 'undefined') {
        loadShortMenu();
      } else {
        shortcutMenuList.value = JSON.parse(shortsInfo);
      }
    }
    return shortcutMenuList.value;
  };
  /**
   * 获取应用信息列表
   * @returns
   */
  const getAppInfoList = () => {
    if (appinfoList.value?.length == 0) {
      const appsInfo: any = sessionStorage.getItem('appsInfo');
      if (!appsInfo || appsInfo == 'undefined') {
        loadAppInfo(getUserInfo()?.idUsersinfo);
      } else {
        appinfoList.value = JSON.parse(appsInfo);
      }
    }
    return appinfoList.value;
  };
  /**
   * 获取菜单列表
   * @returns
   */
  const getMenusList = () => {
    if (menusList.value?.length == 0) {
      const menusInfo: any = sessionStorage.getItem('menusInfo');
      if (!menusInfo || menusInfo == 'undefined') {
        loadMenusInfo(getUserInfo()?.idUsersinfo, '-1');
      } else {
        menusList.value = createRouterAndMenuList(JSON.parse(menusInfo));
      }
    }
    return menusList.value;
  };
  /**
   * 用户登录
   * @param loginData 登录参数
   */
  const userLogin = async (loginData: any) => {
    clearAll();
    let data: any = {};
    let errMsg = null;
    const resultData = await loadData(
      `${userAuditUrl.basePrefix}/userLogin`,
      loginData,
    );
    if (resultData.error) {
      errMsg = resultData.error;
    } else {
      const userData = resultData.data;
      userData['rememberMe'] = loginData.rememberMe;
      userStore.login(userData);
      userStore.closeLoginDialog();
      setToken(userData.dataNo, data.rememberMe);
      setUserInfo(userData);
      setCustomerInfo(userData.customerInfo);
      init();
    }
    return { data, errMsg };
  };
  return {
    init,
    clearAll,
    getShortcutMenuList,
    getAppInfoList,
    getMenusList,
    loadMenusInfo,
    loadShortMenu,
    loadAppInfo,
    userLogin,
  };
});
