import { defineStore } from "pinia";
import { ref } from "vue";
export const useFlexDesignStore = defineStore("flexDesign", () => {
    const containerInfo = ref<any>({});
    const itemsInfo = ref<Record<string, any>>({});
    const positionList = ref<string[]>([]);
    const currentItem = ref<string>("");
    /**
     * 初始化数据
     */
    const init = () => {
        containerInfo.value = {};
        itemsInfo.value = {};
        positionList.value = [];
        currentItem.value = "";
    };
    /**
     * 添加位置
     * @param position 
     */
    const addPosition = (position: string) => {
        positionList.value.push(position);
    };
    /**
     * 添加组件
     * @param position 位置
     * @param item 组件
     */
    const addItem = (position: string, item: any) => {
        itemsInfo.value[position] = item;
        addPosition(position);
        setCurrentItem(position);
    };
    /**
     * 设置当前组件
     * @param position 位置
     */
    const setCurrentItem = (position: string) => {
        currentItem.value = position;
    }
    const getCurrentItem = () => {
        return currentItem.value;
    }
    /**
     * 获取组件
     * @param position 位置
     * @returns 组件
     */
    const getItem = (position: string) => {
        return itemsInfo.value[position];
    };
    /**
     * 获取位置列表
     * @returns 位置列表
     */
    const getPositionList = () => {
        return positionList.value;
    };

    /**
     * 删除组件
     * @param position 位置
     */
    const delItem = (position: string) => {
        delete itemsInfo.value[position];
        let index = positionList.value.indexOf(position);
        positionList.value = positionList.value.filter((item) => item != position);
        if (currentItem.value == position) {
            index = index < positionList.value.length ? index : index - 1;
            setCurrentItem(positionList.value[index]);
        }
    };
    const getItems = () => {
        return itemsInfo.value;
    }
    return {
        init,
        addItem,
        getItem,
        setCurrentItem,
        getCurrentItem,
        getPositionList,
        delItem,
        getItems
    };
});
