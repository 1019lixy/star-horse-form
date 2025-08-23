import { postRequest, getRequest } from "./star_horse_apis";
import { postRequest, getRequest } from "./star_horse_apis";
import { ServiceEnums } from "@/components/enums/ServiceEnums";
import { success, error, warning, uuid } from "star-horse-lowcode";

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
  status?: 'draft' | 'published';
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

/**
 * 保存Flex设计数据
 * @param designData 设计数据
 * @returns 保存结果
 */
export async function saveFlexDesign(designData: FlexDesignData) {
  try {
    const data = {
      ...designData,
      id: designData.id || uuid(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    const response = await postRequest(
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/save`,
      data
    );
    
    if (response.data.code === 0) {
      success("保存成功");
      return response.data.data;
    } else {
      error(response.data.cnMessage || "保存失败");
      throw new Error(response.data.cnMessage);
    }
  } catch (err) {
    console.error("保存Flex设计失败:", err);
    error("保存失败，请检查网络连接");
    throw err;
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
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/load/${id}`
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
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/list`
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
export async function shareFlexDesign(designData: FlexDesignData, expiryDays: number = 7): Promise<ShareResult> {
  try {
    const shareData = {
      ...designData,
      shareCode: uuid(),
      expiryDays
    };
    
    const response = await postRequest(
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/share`,
      shareData
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
export async function getSharedFlexDesign(shareCode: string): Promise<FlexDesignData> {
  try {
    const response = await getRequest(
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/shared/${shareCode}`
    );
    
    if (response.data.code === 0) {
      return response.data.data;
    } else {
      error(response.data.cnMessage || "分享链接已失效或不存在");
      throw new Error(response.data.cnMessage);
    }
  } catch (error) {
    console.error("获取分享的Flex设计失败:", error);
    error("获取分享内容失败");
    throw error;
  }
}

/**
 * 发布Flex设计
 * @param designData 设计数据
 * @returns 发布结果
 */
export async function publishFlexDesign(designData: FlexDesignData): Promise<PublishResult> {
  try {
    const publishData = {
      ...designData,
      status: 'published',
      publishDate: new Date().toISOString(),
      version: (designData.version || 0) + 1
    };
    
    const response = await postRequest(
      `${ServiceEnums.SYSTEM_PREFIX}flexDesign/publish`,
      publishData
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
      designData
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
      {}
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
      { id, newName }
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