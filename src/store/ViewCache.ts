import { defineStore } from "pinia";
import { RouteLocationNormalizedLoaded } from "vue-router";
import { ref } from "vue";

export const useViewCacheStore = defineStore(
  "viewCache",
  () => {
    const viewListDatas = ref<Array<string>>([]);

    /**
     * 存视图
     * @param data
     */
    const setViewCache = (data: RouteLocationNormalizedLoaded) => {
      const name = data.name as string;
      if (viewListDatas.value.includes(name)) {
        return;
      }
      viewListDatas.value.push(name);
    };
    /**
     * 清除视图
     * @param data
     */
    const clearCache = (data: RouteLocationNormalizedLoaded) => {
      const index = viewListDatas.value.findIndex((item) => item === data.name);
      viewListDatas.value.splice(index, 1);
    };
    /**
     * 清除所有Tab
     */
    const clearAll = () => {
      // state.navBarList = [];
      viewListDatas.value = [];
    };
    return {
      viewListDatas,
      setViewCache,
      clearCache,
      clearAll,
    };
  },
  {
    persist: true,
  },
);
