import {defineStore, StoreDefinition} from "pinia";
import {MenusInfo} from "@/components/types/MenusInfo";

export const userInfoStore:StoreDefinition<any> = defineStore("userInfo", {
    state: () => {
        return {
            userInfo: {} as any,
            pageButtonPermission: {} as any,
            permissionMenus: [] as Array<any>,
            dynamicMenus: [] as Array<MenusInfo>,
        }
    },
    getters: {
        /**
         * 获取用户信息
         * @param state
         */
        getUserInfo: (state: any) => {
            return state.userInfo;
        },
        /**
         * 获取权限菜单
         * @param state
         */
        getPermissionMenus: (state: any) => {
            return state.permissionMenus;
        },
        /**
         * 获取动态菜单数据
         * @param state
         */
        getDynamicMenus: (state: any) => {
            return state.dynamicMenus;
        }
    },
    actions: {
        /**
         * 用户登录
         * @param data
         */
        login(data: any) {
            this.userInfo = data;
        },
        /**
         * 用户登出
         */
        logout() {
            // this.userInfo = {};
            this.permissionMenus = [];
            this.dynamicMenus = [];
        },
        /**
         * 权限菜单
         * @param data
         */
        addPermissionMenus(data: any) {
            this.permissionMenus = data;
        },
        /**
         * 添加页面按钮权限
         * @param data
         */
        addPageButtonPermission(data: any) {
            this.pageButtonPermission = data;
        },
        /**
         * 记录菜单权限
         * @param menuId
         * @param data
         */
        pushPageButtonPermission(menuId: string, data: any) {
            this.pageButtonPermission[menuId] = data;
        },
        /**
         * 添加动态菜单
         * @param data
         */
        addDynamicMenus(data: MenusInfo) {
            if (!this.dynamicMenus) {
                this.dynamicMenus = [];
            }
            if (data) {
                this.dynamicMenus.push(data);
            }
        }
    },
    persist: {
        enabled: true, // 开启数据缓存
        strategies: [{key: "userInfoStore", storage: localStorage}]
    }
});
