import {ServiceEnums} from "@/components/enums/ServiceEnums";
import {i18n} from "@/lang";
import {apiInstance, ApiUrls, error, getRequest, piniaInstance, postRequest, success, uuid,} from "star-horse-lowcode";
import {useFlexDesignStore} from "@/store/FlexDesign.js";
import {computed,unref} from "vue";

export interface FlexDesignData {
    id?: string;
    name: string;
    description?: string;
    containerInfo: any;
    itemsInfo: Record<string, any>;
    positionList: string[];
    currentItem: string;
    containerDirection: string;
    compList: Record<string, any>;
    flexModel: string;
    createdAt?: string;
    updatedAt?: string;
    status?: "draft" | "published";
    version?: number;
    shareCode?: string;
    previewUrl?: string;
}

export interface ShareResult {
    shareCode: string;
    shareUrl: string;
    expiryDate: string;
}

export interface PublishResult {
    publishUrl: string;
    version: number;
    publishDate: string;
}

const flexDesign = useFlexDesignStore(piniaInstance);
const containerInfo = computed(() => flexDesign.getContainerInfo());
const positionList = computed(() => flexDesign.getPositionList());
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicPages");

/**
 * 保存Flex设计数据
 * @param designData 设计数据
 * @returns 保存结果
 */
export async function saveFlexDesign(formData: any) {
    formData["containerType"] = containerInfo.value.containerType;
    formData["containerContent"] = JSON.stringify(containerInfo.value.containerContent || {});
    formData["containerName"] = containerInfo.value.containerName;
    formData["dynamicPageDetailsList"] = [];
    positionList.value.forEach((itemId: string, index: number) => {
        let itemStyle = unref(flexDesign.getItem(itemId));
        let comp = unref(flexDesign.getComp(itemId));
        formData["dynamicPageDetailsList"].push({
            nodeIndex: index + 1,
            nodeContent: JSON.stringify(itemStyle || {}),
            nodeCompContent: JSON.stringify(comp || {}),
        });
    });
    const response = await dataUrl!.mergeAction(formData);
    if (response.data.code === 0) {
        success("保存成功");
        return true;
    } else {
        error(response.data.cnMessage || "保存失败");
        return false;
    }
}

/**
 * 加载Flex设计数据
 * @param id 设计ID
 * @returns 设计数据
 */
export async function loadFlexDesign(id: string): Promise<FlexDesignData> {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/load/${id}`,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || "加载失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("加载Flex设计失败:", err);
        error("加载失败，请检查网络连接");
        throw err;
    }
}

/**
 * 获取所有Flex设计列表
 * @returns 设计列表
 */
export async function getFlexDesignList() {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/list`,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || "获取列表失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("获取Flex设计列表失败:", err);
        error("获取列表失败，请检查网络连接");
        throw err;
    }
}

/**
 * 分享Flex设计
 * @param designData 设计数据
 * @param expiryDays 过期天数，默认7天
 * @returns 分享结果
 */
export async function shareFlexDesign(
    designData: FlexDesignData,
    expiryDays: number = 7,
): Promise<ShareResult> {
    try {
        const shareData = {
            ...designData,
            shareCode: uuid(),
            expiryDays,
        };

        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/share`,
            shareData,
        );

        if (response.data.code === 0) {
            success("分享链接生成成功");
            return response.data.data;
        } else {
            error(response.data.cnMessage || "分享失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("分享Flex设计失败:", err);
        error("分享失败，请检查网络连接");
        throw err;
    }
}

/**
 * 通过分享码获取设计数据
 * @param shareCode 分享码
 * @returns 设计数据
 */
export async function getSharedFlexDesign(
    shareCode: string,
): Promise<FlexDesignData> {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/shared/${shareCode}`,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || "分享链接已失效或不存在");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("获取分享的Flex设计失败:", err);
        error("获取分享内容失败");
        throw error;
    }
}

/**
 * 发布Flex设计
 * @param designData 设计数据
 * @returns 发布结果
 */
export async function publishFlexDesign(
    designData: FlexDesignData,
): Promise<PublishResult> {
    try {
        const publishData = {
            ...designData,
            status: "published",
            publishDate: new Date().toISOString(),
            version: (designData.version || 0) + 1,
        };

        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/publish`,
            publishData,
        );

        if (response.data.code === 0) {
            success("发布成功");
            return response.data.data;
        } else {
            error(response.data.cnMessage || "发布失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("发布Flex设计失败:", err);
        error("发布失败，请检查网络连接");
        throw err;
    }
}

/**
 * 生成预览数据
 * @param designData 设计数据
 * @returns 预览URL或数据
 */
export async function generatePreview(designData: FlexDesignData) {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/preview`,
            designData,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || "生成预览失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("生成预览失败:", err);
        error("生成预览失败，请检查网络连接");
        throw err;
    }
}

/**
 * 删除Flex设计
 * @param id 设计ID
 */
export async function deleteFlexDesign(id: string) {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/delete/${id}`,
            {},
        );

        if (response.data.code === 0) {
            success("删除成功");
            return response.data.data;
        } else {
            error(response.data.cnMessage || "删除失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("删除Flex设计失败:", err);
        error("删除失败，请检查网络连接");
        throw err;
    }
}

/**
 * 复制Flex设计
 * @param id 原设计ID
 * @param newName 新名称
 */
export async function duplicateFlexDesign(id: string, newName: string) {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/duplicate`,
            {id, newName},
        );

        if (response.data.code === 0) {
            success("复制成功");
            return response.data.data;
        } else {
            error(response.data.cnMessage || "复制失败");
            throw new Error(response.data.cnMessage);
        }
    } catch (err) {
        console.error("复制Flex设计失败:", err);
        error("复制失败，请检查网络连接");
        throw err;
    }
}

export const saveDesign = async (data: any) => {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/save`,
            data,
        );

        if (response.data.code === 0) {
            success(i18n("flex.design.save.success"));
        } else {
            error(response.data.cnMessage || i18n("flex.design.save.failure"));
        }

        return response.data.data;
    } catch (err) {
        console.error("保存Flex设计失败:", err);
        error("保存失败，请检查网络连接");
        throw err;
    }
};

export const loadDesign = async (id: string) => {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/load/${id}`,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || i18n("flex.design.load.failure"));
        }
    } catch (err) {
        console.error("加载Flex设计失败:", err);
        error("加载失败，请检查网络连接");
        throw err;
    }
};

export const getDesignList = async (params: any) => {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/list`,
            params,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || i18n("flex.design.list.failure"));
        }
    } catch (err) {
        console.error("获取Flex设计列表失败:", err);
        error("获取列表失败，请检查网络连接");
        throw err;
    }
};

export const generateShareLink = async (id: string) => {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/share`,
            {id},
        );

        if (response.data.code === 0) {
            success(i18n("flex.design.share.generate.success"));
        } else {
            error(
                response.data.cnMessage || i18n("flex.design.share.generate.failure"),
            );
        }

        return response.data.data;
    } catch (err) {
        console.error("生成分享链接失败:", err);
        error("生成分享链接失败，请检查网络连接");
        throw err;
    }
};

export const loadSharedDesign = async (shareId: string) => {
    try {
        const response = await getRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/shared/${shareId}`,
        );

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            error(response.data.cnMessage || i18n("flex.design.share.load.failure"));
        }
    } catch (err) {
        console.error("加载分享的Flex设计失败:", err);
        error("加载分享内容失败");
        throw err;
    }
};

export const publishDesign = async (id: string) => {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/publish`,
            {id},
        );

        if (response.data.code === 0) {
            success(i18n("flex.design.publish.success"));
        } else {
            error(response.data.cnMessage || i18n("flex.design.publish.failure"));
        }

        return response.data.data;
    } catch (err) {
        console.error("发布Flex设计失败:", err);
        error("发布失败，请检查网络连接");
        throw err;
    }
};

export const deleteDesign = async (id: string) => {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/delete/${id}`,
            {},
        );

        if (response.data.code === 0) {
            success(i18n("flex.design.delete.success"));
        } else {
            error(response.data.cnMessage || i18n("flex.design.delete.failure"));
        }

        return response.data.data;
    } catch (err) {
        console.error("删除Flex设计失败:", err);
        error("删除失败，请检查网络连接");
        throw err;
    }
};

export const copyDesign = async (id: string) => {
    try {
        const response = await postRequest(
            `${ServiceEnums.SYSTEM_PREFIX}flexDesign/duplicate`,
            {id},
        );

        if (response.data.code === 0) {
            success(i18n("flex.design.copy.success"));
        } else {
            error(response.data.cnMessage || i18n("flex.design.copy.failure"));
        }

        return response.data.data;
    } catch (err) {
        console.error("复制Flex设计失败:", err);
        error("复制失败，请检查网络连接");
        throw err;
    }
};
