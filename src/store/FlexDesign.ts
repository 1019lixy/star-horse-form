import {FlexboxItem} from "@/components/types/FlexType";
import {GridItem} from "@/components/types/GridType";
import {defineStore} from "pinia";
import {uuid} from "star-horse-lowcode";
import {ref} from "vue";

export const useFlexDesignStore = defineStore("flexDesign", () => {
  const containerDirection = ref<string>("row");
  const containerInfo = ref<any>({});
  const compList = ref<Record<string, any>>({});
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
    containerDirection.value = "row";
    compList.value = {};
  };
  /**
   * 添加组件到组件列表
   * @param name 组件名称
   * @param comp 组件
   */
  const addComp = (name: string, comp: any) => {
    if (!Object.keys(compList.value).includes(name)) {
      compList.value[name] = [];
    }
    compList.value[name].push(comp);
  };
  /**
   * 批量添加组件到组件列表
   * @param comps 组件列表
   */
  const batchAddComp = (comps: Record<string, any>) => {
    Object.keys(comps).forEach((key) => {
      addComp(key, comps[key]);
    });
  };
  /**
   * 获取组件
   * @param name 组件名称
   * @returns 组件
   */
  const getComp = (name: string) => {
    if (!Object.keys(compList.value).includes(name)) {
      compList.value[name] = [];
    }
    return compList.value[name];
  };
  /**
   * 获取组件列表
   * @returns 组件列表
   */
  const getCompList = () => {
    return compList.value;
  };
  /**
   * 移除组件
   * @param name 组件名称
   * @param id 组件id
   */
  const removeComp = (name: string, id: string) => {
    const index = compList.value[name].findIndex((item: any) => item.id === id);
    if (index !== -1) {
      if (compList.value[name].length == 1) {
        delete compList.value[name];
      } else {
        compList.value[name].splice(index, 1);
      }
    }
  };
  /**
   * 设置容器信息
   * @param container 容器信息
   */
  const setContainerInfo = (container: any) => {
    containerInfo.value = container;
  };
  /**
   * 设置容器方向
   * @param direction 方向
   */
  const setContainerDirection = (direction: string) => {
    containerDirection.value = direction;
  };
  /**
   * 获取容器方向
   * @returns 方向
   */
  const getContainerDirection = () => {
    return containerDirection.value;
  };

  /**
   * 添加位置
   * @param position
   */
  const addPosition = (position: string) => {
    positionList.value.push(position);
    setItemWidth();
  };
  const setItemWidth = () => {
    containerInfo.value["width"] =
      positionList.value.length == 1 ? "100%" : "auto";
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
   * 批量添加组件
   * @param items
   */
  const batchAddItems = (items: FlexboxItem[] | GridItem[]) => {
    items.forEach((item: FlexboxItem | GridItem) => {
      addItem(uuid(), item.styles);
    });
    setCurrentItem(positionList.value[0]);
  };
  /**
   * 设置当前组件
   * @param position 位置
   */
  const setCurrentItem = (position: string) => {
    currentItem.value = position;
  };
  const getCurrentItem = () => {
    return currentItem.value;
  };
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
    positionList.value = positionList.value.filter(
      (item: any) => item != position,
    );
    compList.value = compList.value.filter((item: any) => item != position);
    if (currentItem.value == position) {
      index = index < positionList.value.length ? index : index - 1;
      setCurrentItem(positionList.value[index]);
    }
    setItemWidth();
  };
  const getItems = () => {
    return itemsInfo.value;
  };
  return {
    init,
    addComp,
    batchAddComp,
    getComp,
    getCompList,
    removeComp,
    addItem,
    getItem,
    setContainerDirection,
    getContainerDirection,
    batchAddItems,
    setContainerInfo,
    setCurrentItem,
    getCurrentItem,
    getPositionList,
    delItem,
    getItems,
  };
});
