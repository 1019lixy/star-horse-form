import { DynamicNode } from "star-horse-lowcode";

export interface PageCompContainer {}

export interface PageComp {
  id: string;
  label: string;
  name: string;
  icon?: string;
  items?: DynamicNode[];
  container?: PageCompContainer;
}

export interface PageCompInfo {
  //是否设计模式
  isDesign: boolean;
  //组件字段
  field: Record<string, any>;
  //组件属性
  preps: Record<string, any>;
  //组件样式
  styles?: Record<string, any>;
}
