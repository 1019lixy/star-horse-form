import {defineStore} from "pinia";
import router from "@/router/index";
import {RouteLocationNormalizedLoaded} from "vue-router";

export const navBarList: any = defineStore("navBarList", {
    state: () => ({
        currentView: {} as RouteLocationNormalizedLoaded,
        navTagsList: [] as RouteLocationNormalizedLoaded[]
    }),
    getters: {
        getNavBarList: (state: any) => {
            return state.navTagsList;
        },
        getCurrentView: (state: any) => {
            return state.currentView;
        }
    },
    actions: {
        /**
         * 设置当前激活的View
         * @param view
         */
        setCurrentView(view: RouteLocationNormalizedLoaded) {
            this.currentView = view;
        },
        updateVisitedView(view: RouteLocationNormalizedLoaded) {
            for (let v of this.navTagsList) {
                if (v.path === view.path) {
                    v = Object.assign(v, view)
                    break
                }
            }
        },
        /**
         * 添加数据
         * @param  data
         */
        addNavBar(data: RouteLocationNormalizedLoaded) {
            let dataList = this.navTagsList;
            const nav = dataList.find((item: RouteLocationNormalizedLoaded) => item.path === data.path);
            // @ts-ignore
            if (!nav) {
                if (data.name == "Index" || data.name == "Home") {
                    dataList.splice(0, 0, data);
                } else {
                    dataList.push(data);
                }

            }
        },

        /**
         * 清除数据
         */
        clearNavItem(data: RouteLocationNormalizedLoaded) {
            let dataList = this.navTagsList;
            const index = dataList.findIndex((item: RouteLocationNormalizedLoaded) => item.path === data.path);
            // const isActive = router.currentRoute.value.path == dataList[index]["path"];
            // const len = dataList.length - 1;
            dataList.splice(index, 1);
            //   (index == len || isActive) && router.push({path: dataList[dataList.length - 1]["path"]})
        },
        /**
         * 切换Tab
         * @param {number} data
         */
        changeTab(data: number) {
            let currentPath = router.currentRoute.value.path;
            let index = 0;
            let dataList = this.navTagsList;
            let len = dataList.length;
            for (let i = 0; i < len; i++) {
                /**
                 * @type {{ [x: string]: any; }}
                 */
                let temp = dataList[i];
                if (currentPath == temp["path"]) {
                    index = i + data;
                    break;
                }
            }
            index = index < 0 ? 0 : index >= len ? len - 1 : index;
            router.push({path: dataList[index]["path"]})
        },
        /**
         * 清空对象
         */
        clearAll() {
            let route = this.navTagsList.find(item => item.path == "/home");
            if (route) {
                this.navTagsList = [route];
            }
        }
    }
});
