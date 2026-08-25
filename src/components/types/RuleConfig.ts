import {ApiUrls} from "star-horse-lowcode";

export interface RuleConfig {
    /**
     * 接口地址
     */
    api: ApiUrls;
    /**
     * prop 转换
     */
    shotProps: Record<string, any>;
    /**
     * 主键
     */
    primaryKey: string;
}
