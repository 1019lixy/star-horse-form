/**
 * 系统内置模板注册表
 * 从 /template/*.json 加载 30 个预置模板，区分分类与标签
 * 模板分为系统模板（内置）和自定义模板（后端API），此处只管理系统模板
 */

export interface SystemTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  formInfo: any;
  dataList: any[];
  formData: any;
}

const modules = import.meta.glob("../../../../../../template/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

const CATEGORY_MAP: Record<
  string,
  { category: string; description: string; tags: string[] }
> = {
  "01-用户注册表单": {
    category: "基础表单",
    description: "用户注册，含用户名/邮箱/密码/验证码",
    tags: ["注册", "认证", "基础"],
  },
  "02-用户登录表单": {
    category: "基础表单",
    description: "用户登录，含用户名/密码/验证码/记住我",
    tags: ["登录", "认证", "基础"],
  },
  "03-个人信息表单": {
    category: "基础表单",
    description: "个人信息录入，含头像/姓名/性别/生日/联系方式等",
    tags: ["个人信息", "基础"],
  },
  "04-商品管理表单": {
    category: "数据管理",
    description: "商品信息管理，含分类/价格/库存/规格/图片等",
    tags: ["商品", "管理", "电商"],
  },
  "05-员工信息表单": {
    category: "数据管理",
    description: "员工档案管理，含部门/岗位/职级/入职信息等",
    tags: ["员工", "HR", "管理"],
  },
  "06-请假申请表单": {
    category: "业务申请",
    description: "请假申请流程，含请假类型/时间/事由/审批人",
    tags: ["请假", "审批", "OA"],
  },
  "07-报修申请表单": {
    category: "业务申请",
    description: "设备报修申请，含故障描述/位置/紧急程度/图片",
    tags: ["报修", "审批", "OA"],
  },
  "08-合同管理表单": {
    category: "数据管理",
    description: "合同信息管理，含合同编号/方/金额/期限/附件",
    tags: ["合同", "管理", "法务"],
  },
  "09-客户管理表单": {
    category: "数据管理",
    description: "客户信息管理，含企业/联系人/等级/跟进记录",
    tags: ["客户", "CRM", "管理"],
  },
  "10-项目管理表单": {
    category: "数据管理",
    description: "项目信息管理，含进度/负责人/预算/里程碑",
    tags: ["项目", "管理", "PMO"],
  },
  "11-会议申请表单": {
    category: "业务申请",
    description: "会议申请，含主题/时间/地点/参会人/议程",
    tags: ["会议", "审批", "OA"],
  },
  "12-出差申请表单": {
    category: "业务申请",
    description: "出差申请，含目的地/时间/交通/预算/事由",
    tags: ["出差", "审批", "OA"],
  },
  "13-报销申请表单": {
    category: "业务申请",
    description: "费用报销，含报销明细/金额/票据/审批链",
    tags: ["报销", "审批", "财务"],
  },
  "14-问卷调查表单": {
    category: "内容与向导",
    description: "通用问卷调查，含单选/多选/评分/开放题",
    tags: ["问卷", "调查"],
  },
  "15-文章发布表单": {
    category: "内容与向导",
    description: "文章发布，含标题/分类/标签/富文本/封面",
    tags: ["文章", "CMS", "内容"],
  },
  "16-设备管理表单": {
    category: "数据管理",
    description: "设备资产管理，含编号/型号/状态/位置/维保",
    tags: ["设备", "资产", "管理"],
  },
  "17-多步骤向导表单": {
    category: "内容与向导",
    description: "多步骤分步填写向导，演示步骤容器能力",
    tags: ["向导", "步骤", "演示"],
  },
  "18-系统配置表单": {
    category: "系统配置",
    description: "系统参数配置，含开关/阈值/选项/权限",
    tags: ["配置", "系统"],
  },
  "19-数据看板配置表单": {
    category: "系统配置",
    description: "数据看板配置，含图表类型/数据源/刷新/布局",
    tags: ["看板", "配置", "可视化"],
  },
  "20-综合业务表单": {
    category: "系统配置",
    description: "综合业务演示，覆盖多种容器与组件组合",
    tags: ["综合", "演示"],
  },
  "21-学校教学满意度问卷": {
    category: "调查问卷",
    description: "教学满意度调查，含课程/教师/多维度评分",
    tags: ["问卷", "教育", "满意度"],
  },
  "22-用车习惯调查问卷": {
    category: "调查问卷",
    description: "用车习惯调查，含车型/频率/偏好/场景",
    tags: ["问卷", "交通", "调查"],
  },
  "23-消费习惯调查问卷": {
    category: "调查问卷",
    description: "消费习惯调查，含渠道/品类/频次/预算",
    tags: ["问卷", "消费", "调查"],
  },
  "24-健康生活问卷": {
    category: "调查问卷",
    description: "健康生活调查，含运动/饮食/睡眠/体检",
    tags: ["问卷", "健康", "调查"],
  },
  "25-网络使用习惯问卷": {
    category: "调查问卷",
    description: "网络使用习惯，含设备/时长/场景/偏好",
    tags: ["问卷", "网络", "调查"],
  },
  "26-阅读习惯问卷": {
    category: "调查问卷",
    description: "阅读习惯调查，含类型/时长/渠道/偏好",
    tags: ["问卷", "阅读", "调查"],
  },
  "27-旅游出行习惯问卷": {
    category: "调查问卷",
    description: "旅游出行习惯，含频率/目的地/预算/方式",
    tags: ["问卷", "旅游", "调查"],
  },
  "28-职场满意度问卷": {
    category: "调查问卷",
    description: "职场满意度调查，含环境/薪酬/发展/管理",
    tags: ["问卷", "职场", "满意度"],
  },
  "29-居家生活品质问卷": {
    category: "调查问卷",
    description: "居家生活品质，含居住/消费/休闲/满意度",
    tags: ["问卷", "生活", "调查"],
  },
  "30-社交生活问卷": {
    category: "调查问卷",
    description: "社交生活调查，含频率/方式/平台/满意度",
    tags: ["问卷", "社交", "调查"],
  },
};

const systemTemplates: SystemTemplate[] = Object.entries(modules)
  .map(([path, mod]) => {
    const fileName = path.split("/").pop()!.replace(".json", "");
    const meta = CATEGORY_MAP[fileName] || {
      category: "其他",
      description: fileName,
      tags: [],
    };
    return {
      id: "sys_" + fileName,
      name: fileName.replace(/^\d+-/, ""),
      category: meta.category,
      description: meta.description,
      tags: meta.tags,
      formInfo: mod.formInfo || {},
      dataList: mod.dataList || [],
      formData: mod.formData || {},
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const SYSTEM_TEMPLATES = systemTemplates;

export const SYSTEM_TEMPLATE_CATEGORIES = [
  "基础表单",
  "业务申请",
  "数据管理",
  "内容与向导",
  "系统配置",
  "调查问卷",
];
