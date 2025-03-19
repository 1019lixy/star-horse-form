import {defineStore} from "pinia";
import router from "@/router/index";
import {RouteLocationNormalizedLoaded} from "vue-router";
import {ref} from "vue";

export const useNavBarListStore = defineStore("navBarList",
    () => {
        const currentView = ref<any>({});
        const navTagsList = ref<RouteLocationNormalizedLoaded[]>([]);

        /**
         * 设置当前激活的View
         * @param view
         */
        const setCurrentView = (view: RouteLocationNormalizedLoaded) => {
            currentView.value = view;
        };
        const updateVisitedView = (view: RouteLocationNormalizedLoaded) => {
            for (let v of navTagsList.value) {
                if (v.path === view.path) {
                    v = Object.assign(v, view);
                    break;
                }
            }
        };
        /**
         * 添加数据
         * @param  data
         */
        const addNavBar = (data: RouteLocationNormalizedLoaded) => {
            const dataList = navTagsList.value;
            const nav = dataList.find((item: RouteLocationNormalizedLoaded) => item.path === data.path);
            // @ts-ignore
            if (!nav) {
                if (data.name == "Index" || data.name == "Home") {
                    dataList.splice(0, 0, data);
                } else {
                    dataList.push(data);
                }
            }
        };
        /**
         * 清除数据
         */
        const clearNavItem = (data: RouteLocationNormalizedLoaded) => {
            const dataList = navTagsList.value;
            const index = dataList.findIndex((item: RouteLocationNormalizedLoaded) => item.path === data.path);
            // const isActive = router.currentRoute.value.path == dataList[index]["path"];
            // const len = dataList.length - 1;
            dataList.splice(index, 1);
            //   (index == len || isActive) && router.push({path: dataList[dataList.length - 1]["path"]})
        };
        /**
         * 切换Tab
         * @param {number} data
         */
        const changeTab = (data: number) => {
            const currentPath = router.currentRoute.value.path;
            let index = 0;
            const dataList = navTagsList.value;
            const len = dataList.length;
            for (let i = 0; i < len; i++) {
                /**
                 * @type {{ [x: string]: any; }}
                 */
                const temp = dataList[i];
                if (currentPath == temp["path"]) {
                    index = i + data;
                    break;
                }
            }
            index = index < 0 ? 0 : index >= len ? len - 1 : index;
            router.push({path: dataList[index]["path"]});
        };
        /**
         * 清空对象
         */
        const clearAll = () => {
            const route = navTagsList.value.find((item) => item.path == "/home");
            if (route) {
                navTagsList.value = [route];
            }
        };
        return {
            currentView,
            navTagsList,
            updateVisitedView,
            setCurrentView,
            addNavBar,
            clearNavItem,
            changeTab,
            clearAll
        };
    });
