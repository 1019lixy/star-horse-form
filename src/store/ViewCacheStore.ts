import {defineStore} from "pinia";
import {RouteRecordNormalized} from "vue-router";
import {ref} from "vue";

export const viewList: any = defineStore("viewList", () => {
        const viewListDatas = ref<Array<string>>([]);

        /**
         * 存视图
         * @param data
         */
        const setViewCache = (data: RouteRecordNormalized) => {
            const name = data.name as string;
            if (viewListDatas.value.includes(name)) {
                return;
            }
            viewListDatas.value.push(name);
        }
        /**
         * 清除视图
         * @param data
         */
        const clearCache = (data: RouteRecordNormalized) => {
            const index = viewListDatas.value.findIndex(item => item === data.name);
            viewListDatas.value.splice(index, 1);
        }
        /**
         * 清除所有Tab
         */
        const clearAll = () => {
            // state.navBarList = [];
            viewListDatas.value = [];
        }
        return {
            viewListDatas,
            setViewCache,
            clearCache,
            clearAll
        }
    },
    {
        persist: {
            enabled: true,
            strategies: [
                {key: "viewListDatas", paths: ["viewListDatas"]}
            ]
        }
    }
);
