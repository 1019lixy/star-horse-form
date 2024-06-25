import {defineStore} from "pinia";
import {RouteRecordNormalized} from "vue-router";

export const viewList: any = defineStore("viewList", {
    state: () => {
        return {
            viewListDatas: [] as Array<String>
        }
    },
    getters: {
        /**
         * 获取视图
         * @param state
         */
        getViewListDatas: (state: any) => {
            return state.viewListDatas;
        },
    },
    actions: {
        /**
         * 存视图
         * @param data
         */
        setViewCache(data: RouteRecordNormalized) {
            let name = data.name as String;
            if (this.viewListDatas.includes(name)) {
                return;
            }
            this.viewListDatas.push(name);
        },
        /**
         * 清除视图
         * @param data
         */
        clearCache(data: RouteRecordNormalized) {
            const index = this.viewListDatas.findIndex(item => item === data.name);
            this.viewListDatas.splice(index, 1);
        },
        /**
         * 清除所有Tab
         */
        clearAll() {
            // state.navBarList = [];
            this.viewListDatas = [];
        },
    }
});
