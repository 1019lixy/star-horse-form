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
    const draggingItem = ref<any>({});
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
        draggingItem.value = {};
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
     * 更新组件属性
     * @param name 组件名称
     * @param id 组件id
     * @param propertyName 属性名
     * @param value 属性值
     */
    const updateComponentProperty = (name: string, id: string, propertyName: string, value: any) => {
        if (!Object.keys(compList.value).includes(name)) {
            return;
        }

        const index = compList.value[name].findIndex((item: any) => item.id === id);
        if (index !== -1) {
            compList.value[name][index] = {
                ...compList.value[name][index],
                preps: {
                    ...(compList.value[name][index].preps || {}),
                    [propertyName]: value
                }
            };
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

    /**
     * 获取容器信息
     * @returns 容器信息
     */
    const getContainerInfo = () => {
        return containerInfo.value;
    };

    /**
     * 序列化设计数据
     * @param name 设计名称
     * @param description 设计描述
     * @param flexModel flex模式
     * @returns 序列化的设计数据
     */
    const serializeDesignData = (
        name: string,
        description: string = "",
        flexModel: string = "flex",
    ) => {
        return {
            name,
            description,
            containerInfo: containerInfo.value,
            itemsInfo: itemsInfo.value,
            positionList: positionList.value,
            currentItem: currentItem.value,
            containerDirection: containerDirection.value,
            compList: compList.value,
            flexModel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    };

    /**
     * 从序列化数据加载设计
     * @param data 序列化的设计数据
     */
    const loadDesignData = (data: any) => {
        containerInfo.value = data.containerInfo || {};
        itemsInfo.value = data.itemsInfo || {};
        positionList.value = data.positionList || [];
        currentItem.value = data.currentItem || "";
        containerDirection.value = data.containerDirection || "row";
        compList.value = data.compList || {};
    };

    /**
     * 清除所有数据
     */
    const clearAll = () => {
        init();
    };

    /**
     * 获取设计摘要信息
     * @returns 设计摘要
     */
    const getDesignSummary = () => {
        return {
            itemCount: positionList.value.length,
            compCount: Object.keys(compList.value).reduce(
                (total, key) => total + compList.value[key].length,
                0,
            ),
            containerDirection: containerDirection.value,
            hasContainer: Object.keys(containerInfo.value).length > 0,
        };
    };

    /**
     * 验证设计数据的完整性
     * @returns 验证结果
     */
    const validateDesign = () => {
        const errors = [];

        if (positionList.value.length === 0) {
            errors.push("设计中没有任何元素");
        }

        // 检查positionList中的每个项是否在itemsInfo中存在
        for (const position of positionList.value) {
            if (!itemsInfo.value[position]) {
                errors.push(`位置 ${position} 在itemsInfo中不存在`);
            }
        }

        // 检查currentItem是否有效
        if (currentItem.value && !itemsInfo.value[currentItem.value]) {
            errors.push("当前选中的项不存在");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    };

    /**
     * 将驼峰命名转换为CSS属性格式
     * @param key 驼峰命名的属性
     * @returns CSS格式的属性名
     */
    const camelToKebab = (key: string): string => {
        return key.replace(/([A-Z])/g, "-$1").toLowerCase();
    };

    /**
     * 生成预览用的HTML代码
     * @param flexModel 布局模式 (flex 或 grid)
     * @param containerDataForm 容器表单数据
     * @returns HTML代码字符串
     */
    const generatePreviewHTML = (
        flexModel: string = "flex",
        containerDataForm?: any,
    ) => {
        let containerStyles: any = {};

        // 优先使用传入的containerDataForm
        const containerData = containerDataForm || containerInfo.value;

        if (flexModel === "grid") {
            // CSS Grid 布局
            containerStyles = {
                display: "grid",
                ...containerData,
            };

            // 如果容器信息中没有grid相关属性，应用默认的4x4网格
            if (
                !containerData.gridTemplateColumns &&
                !containerData.gridTemplateRows
            ) {
                containerStyles.gridTemplateColumns = "repeat(4, 1fr)";
                containerStyles.gridTemplateRows = "repeat(4, 1fr)";
                containerStyles.gap = "10px";
            }
        } else {
            // Flexbox 布局
            containerStyles = {
                display: "flex",
                flexDirection: containerDirection.value || "row",
                ...containerData,
            };
        }

        // 将驼峰命名转换为CSS属性格式
        const containerStyleString = Object.entries(containerStyles)
            .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
            .join("; ");

        let html = `<div style="${containerStyleString}">\n`;

        for (const position of positionList.value) {
            const item = itemsInfo.value[position];
            if (item) {
                // 同样转换item的样式属性
                const itemStyles = Object.entries(item)
                    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
                    .join("; ");
                html += `  <div style="${itemStyles}">${position}</div>\n`;
            }
        }

        html += "</div>";
        return html;
    };
    const setDraggingItem = (item: any) => {
        draggingItem.value = item;
    };
    const getDraggingItem = () => {
        return draggingItem.value;
    };
    const clearDraggingItem = () => {
        draggingItem.value = null;
    };

    return {
        init,
        addComp,
        batchAddComp,
        getComp,
        getCompList,
        removeComp,
        updateComponentProperty,
        addItem,
        getItem,
        setContainerDirection,
        getContainerDirection,
        batchAddItems,
        setContainerInfo,
        getContainerInfo,
        setCurrentItem,
        getCurrentItem,
        getPositionList,
        delItem,
        getItems,
        serializeDesignData,
        loadDesignData,
        clearAll,
        getDesignSummary,
        validateDesign,
        generatePreviewHTML,
        setDraggingItem,
        getDraggingItem,
        clearDraggingItem,
    };
});
