import fs from 'fs';

// 完整的中英文翻译映射 - 基于zh_CN.ts的每一个中文值提供正确的英文翻译
const zh2en = {
  // Home
  "添加模块": "Add Module",
  "欢迎使用系统": "Welcome to the System",
  "您还没有配置任何模块，请添加您的第一个模块": "You haven't configured any modules yet. Please add your first module.",
  "选择模块": "Select Module",
  "搜索模块...": "Search Modules...",
  "添加选中模块": "Add Selected Modules",
  "全部": "All",
  "系统管理": "System Management",
  "业务模块": "Business Modules",
  "数据分析": "Data Analysis",
  "工具": "Tools",
  "用户管理": "User Management",
  "管理系统用户和权限": "Manage system users and permissions",
  "系统监控": "System Monitoring",
  "查看系统运行状态": "View system running status",
  "个人中心": "Personal Center",
  "查看和编辑个人信息": "View and edit personal information",
  "请输入": "Please input",
  "请选择": "Please select",
  "不能为空": "Cannot be empty",
  // Login
  "密码登录": "Password Login",
  "扫码登录": "Scan Code Login",
  "其它登录方式": "Other Login Methods",
  "微信": "WeChat",
  "支付宝": "Alipay",
  "微博": "Weibo",
  "验证码": "Verification Code",
  // PreOrPend
  "前后缀配置": "Prefix/Suffix Configuration",
  "前缀文本": "Prefix Text",
  "输入框前面显示的固定文本": "Fixed text displayed in front of the input box",
  "前缀下拉列表": "Prefix Dropdown List",
  "配置输入框前面的下拉选项": "Configure dropdown options in front of the input box",
  "前缀下拉列表配置": "Prefix Dropdown List Configuration",
  "后缀文本": "Suffix Text",
  "输入框后面显示的固定文本": "Fixed text displayed after the input box",
  "后缀操作按钮": "Suffix Action Button",
  "配置输入框后面的操作按钮": "Configure action buttons after the input box",
  "后缀操作按钮配置": "Suffix Action Button Configuration",
  "后缀下拉列表": "Suffix Dropdown List",
  "配置输入框后面的下拉选项": "Configure dropdown options after the input box",
  "后缀下拉列表配置": "Suffix Dropdown List Configuration",
  "前缀文本和前缀下拉列表不能同时配置": "Prefix text and prefix dropdown list cannot be configured simultaneously",
  "后缀文本、后缀操作按钮和后缀下拉列表不能同时配置": "Suffix text, suffix action button and suffix dropdown list cannot be configured simultaneously",
  "账  号": "Account",
  "密  码": "Password",
  "记住我": "Remember Me",
  "忘记密码？": "Forget Password?",
  "没有账号？": "No Account?",
  "记得密码？": "Remember Password?",
  "请输入您注册时使用的邮箱地址，我们将向该邮箱发送密码重置链接。": "Please enter the email address you used when registering, and we will send a password reset link to that email.",
  "立即注册": "Register Now",
  "登 录": "Login",
  "欢迎光临": "Welcome",
  "取消": "Cancel",
  "欢迎回来": "Welcome Back",
  "登 录 中...": "Logging...",
  "请检查您的邮箱并按照指示重置密码。": "Please check your email and follow the instructions to reset your password.",
  "用户中心": "User Center",
  "日程表": "Calendar",
  "布局设置": "Layout Settings",
  "修改个人信息": "Edit Personal Info",
  "退出": "Logout",
  // Dialog
  "提交": "Submit",
  "提交并继续": "Submit & Continue",
  "保存": "Save",
  "保存并继续": "Save & Continue",
  "重置": "Reset",
  "最大化": "Maximize",
  "还原": "Restore",
  "关闭": "Close",
  // Flow
  "流程设计": "Flow Design",
  "流程设计器": "Flow Designer",
  "添加节点": "Add Node",
  "开始": "Start",
  "结束": "End",
  "条件分支": "Condition Branch",
  "并行分支": "Parallel Branch",
  "意见分支": "Opinion Branch",
  "用户节点": "User Node",
  "表单节点": "Form Node",
  "审批节点": "Approval Node",
  "会签节点": "Countersign Node",
  "分支节点": "Branch Node",
  "循环节点": "Loop Node",
  "子流程节点": "Sub-process Node",
  "自动节点": "Auto Node",
  "人工节点": "Manual Node",
  "自动审批": "Auto Approval",
  "人工审批": "Manual Approval",
  "自动会签": "Auto Countersign",
  "人工会签": "Manual Countersign",
  "自动分支": "Auto Branch",
  "人工分支": "Manual Branch",
  "自动循环": "Auto Loop",
  "人工循环": "Manual Loop",
  "自动子流程": "Auto Sub-process",
  "人工子流程": "Manual Sub-process",
  "删除节点": "Delete Node",
  "确认删除节点？": "Confirm delete node?",
  "删除节点后，该节点的所有子节点将被删除，确认删除？": "After deleting the node, all child nodes will be deleted. Confirm?",
  // Dyform Designer
  "组件": "Components",
  "数据源": "Data Source",
  "图表": "Charts",
  "模板": "Templates",
  "帮助": "Help",
  "布局组件": "Layout Components",
  "表单组件": "Form Components",
  "自定义组件": "Custom Components",
  "表单验证通过": "Form validation passed",
  "表单验证失败，请检查输入": "Form validation failed, please check your input",
  "表单预览": "Form Preview",
  "HTML文件导出成功": "HTML file exported successfully",
  "校验表单": "Validate Form",
  "导出HTML": "Export HTML",
  "表单属性层级": "Form Property Layer",
  "表单列表": "Form List",
  "欢迎使用表单设计器": "Welcome to Form Designer",
  "请从左侧组件库中选择一个组件，然后用鼠标双击或者拖动该组件放置于此处": "Please select a component from the left component library, then double-click or drag the component to place it here",
  "拖拽组件": "Drag Components",
  "配置属性": "Configure Properties",
  "快速构建": "Quick Build",
  "恢复缓存数据": "Restore Cached Data",
  "返回列表": "Back to List",
  "风格": "Style",
  "电脑": "PC",
  "平板": "Tablet",
  "手机": "Mobile",
  "新建": "New",
  "导入": "Import",
  "导出": "Export",
  "修改属性": "Edit Properties",
  "表单层级": "Form Layer",
  "清空元素": "Clear Elements",
  "后退一步": "Undo",
  "前进一步": "Redo",
  "校验": "Validate",
  "预览": "Preview",
  "生成代码": "Generate Code",
  "批量修改属性": "Batch Edit Properties",
  "业务字段": "Business Fields",
  "公共字段": "Common Fields",
  "按钮点击事件": "Button Click Event",
  "加载此模板": "Load This Template",
  // Shortcuts
  "快捷键": "Shortcuts",
  "剪切操作": "Cut operation",
  "复制操作": "Copy operation",
  "粘贴操作": "Paste operation",
  "后退一步操作": "Undo operation",
  "前进一步操作": "Redo operation",
  "校验操作": "Validate operation",
  "新建操作": "New operation",
  "保存操作": "Save operation",
  "删除操作": "Delete operation",
  "全选操作": "Select all operation",
  "清空操作": "Clear operation",
  "查找操作": "Find operation",
  "打开/关闭左侧面板": "Open/close left panel",
  "打开/关闭右侧面板": "Open/close right panel",
  "更换选中组件": "Change selected component",
  "预览操作": "Preview operation",
  "返回上一个页面": "Go back to previous page",
  "向上移动选中组件": "Move selected component up",
  "向下移动选中组件": "Move selected component down",
  "其它快捷键待更新": "More shortcuts to be updated",
  "描述": "Description",
  "表单设计器是一款通过拖拽即可实现复杂表单模型，可满足大部分常见业务": "Form Designer is a tool that can implement complex form models through drag and drop, meeting most common business needs",
  "规则": "Rules",
  "所有同级组件的名字不能重复，在Tab组件中tabName和objectName不能重复": "All sibling component names cannot be duplicated. In Tab components, tabName and objectName cannot be duplicated",
  "Table组件中batchFieldName不能重复": "In Table components, batchFieldName cannot be duplicated",
  "操作步骤": "Steps",
  "在左边拖动或者双击组件可添加到中间设计舞台": "Drag or double-click components on the left to add them to the design stage",
  "在右边属性区域设置选中组件得属性": "Set properties of selected components in the right property area",
  "在头部可批量编辑按钮可编辑属性名称": "Use the batch edit button in the header to edit property names",
  "在头部设置按钮可设置表单属性": "Use the settings button in the header to set form properties",
  "在头部代码按钮可以生成代码（目前只能生成vue3）": "Use the code button in the header to generate code (currently only Vue3)",
  "在头部预览按钮可以预览表单信息": "Use the preview button in the header to preview form information",
  "在舞台上点击鼠标右键可打开右键菜单": "Right-click on the stage to open the context menu",
  "盲点（数据源生成的表单模型）": "Blind spots (form models generated by data sources)",
  "须注意选择器、单选框、多选框等组件的值类型，系统默认是字符串类型，如果数据库设置是数值类型需要在对应字段的属性面板中修改值类型": "Note the value types of selector, radio, checkbox and other components. The system default is string type. If the database setting is numeric type, you need to modify the value type in the corresponding field's property panel",
  "提交时须注意表的主键生成策略，默认是动态赋值，如果是自增，需要在保存时修改主键策略": "When submitting, pay attention to the primary key generation strategy of the table. The default is dynamic assignment. If it is auto-increment, you need to modify the primary key strategy when saving",
  "未实现": "Not implemented",
  "在配置或者提交功能里设置": "Set in configuration or submission function",
  "表单配置": "Form Configuration",
  "暂存": "Save Draft",
  "代码": "Code",
  // JS Editor
  "自定义信息": "Custom Information",
  "自定义事件,提供了如下系统参数": "Custom events provide the following system parameters",
  "当前组件的信息": "Current component information",
  "表单数据": "Form data",
  "表单的所有元素": "All elements of the form",
  "表单实例对象": "Form instance object",
  "具体参数或方法切换Tab查看": "Switch tabs to view specific parameters or methods",
  "当前组件属性": "Current Component Properties",
  "表单实例": "Form Instance",
  "表单属性": "Form Properties",
  "对象名字": "Object name",
  "名称": "Name",
  "说明": "Description",
  "类型": "Type",
  "对整个表单的内容进行验证。 接收一个回调函数，或返回": "Validate the contents of the entire form. Receives a callback function, or returns",
  "验证具体的某个字段。": "Validate a specific field.",
  "重置该表单项，将其值重置为初始值，并移除校验结果": "Reset the form item, reset its value to the initial value, and remove the validation result",
  "滚动到指定的字段": "Scroll to the specified field",
  "清理某个字段的表单验证信息。": "Clear form validation information for a field.",
  "获取所有字段的 context": "Get context of all fields",
  // Params
  "参数配置": "Parameter Configuration",
  "请选择主键字段": "Please select the primary key field",
  "请配置回调字段": "Please configure callback fields",
  // Mind Map
  "根节点": "Root Node",
  "协同插件": "Collaboration Plugin",
  // Workflow
  "流程名称": "Process Name",
  "流程分类": "Process Category",
  "是否部署": "Is Deployed",
  "已部署": "Deployed",
  "未部署": "Not Deployed",
  "流程部署ID": "Process Deployment ID",
  "绑定表单信息": "Bind Form Info",
  "图标": "Icon",
  "流程类型": "Process Type",
  "状态": "Status",
  "流程版本": "Process Version",
  "多表单显示模式": "Multi-form Display Mode",
  "流程管理员": "Process Manager",
  "流程Xml文件": "Process Xml File",
  "流程Json文件": "Process Json File",
  "版本号": "Version Number",
  "是否删除": "Is Deleted",
  "数据编号": "Data Number",
  "状态名称": "Status Name",
  "国际编码": "International Code",
  "备注": "Remark",
  "编辑": "Edit",
  "查看": "View",
  "新增": "Add",
  "配置类别": "Config Category",
  "编码": "Code",
  "是否选中": "Is Checked",
  "是": "Yes",
  "否": "No",
  "图片地址": "Image URL",
  // Continuous
  "节点": "Node",
  "测试报告类型": "Test Report Type",
  "主键": "Primary Key",
  "实例ID": "Instance ID",
  "列索引": "Column Index",
  "执行方式": "Execution Type",
  "程序语言": "Program Language",
  "项目编码": "Project Code",
  "源码相对目录": "Source Code Relative Directory",
  "执行失败通知": "Failure Notification",
  "执行成功通知": "Success Notification",
  "自定义规则": "Custom Rules",
  "行索引": "Row Index",
  "项目名称": "Project Name",
  "项目类型": "Project Type",
  "实例名称": "Instance Name",
  "是否独占 1是 2否 默认2": "Is Exclusive 1=Yes 2=No Default=2",
  "关联计划": "Link Data Plan",
  "Cron定时触发执行": "Cron Scheduled Execution",
  "代码下载后存放目录": "Target Directory After Code Download",
  "是否自动触发构建 1是 2否 默认2": "Auto Build 1=Yes 2=No Default=2",
  "创建人": "Created By",
  "修改人": "Updated By",
  "创建日期": "Created Date",
  "修改日期": "Updated Date",
  "数据版本号": "Data Version",
  "是否已逻辑": "Is Logically Deleted",
  "状态码": "Status Code",
  "状态码名称": "Status Code Name",
  "国际码": "International Code",
  // Project Info
  "代码库类型": "Repository Type",
  "代码库地址": "Repository URL",
  "项目字符集": "Project Charset",
  "流水线账号": "Pipeline Account",
  "流水线密码": "Pipeline Password",
  "项目成员": "Project Members",
  "用户名": "Username",
  "姓名": "Name",
  "工号": "Employee No",
  "职级": "Rank",
  "岗位": "Position",
  "角色名称": "Role Name",
  "生效时间": "Effective Date",
  "失效日期": "Expiration Date",
  "是否管理员": "Is Manager",
  // System
  "所属用户组": "User Group",
  "不能设置空格密码": "Cannot set empty password",
  "请设置长度为6到15的密码": "Please set a password with length between 6 and 15",
  "两次密码不一致，请重新录入": "Passwords do not match, please re-enter",
  "密码": "Password",
  "确认密码": "Confirm Password",
  "修改密码": "Change Password",
  "区域名称": "Area Name",
  "区域编码": "Area Code",
  "区域主键": "Area Key",
  "父节点编号": "Parent Node Number",
  "请求方法": "Request Method",
  "操作人": "Operator",
  "访问接口": "Access Interface",
  "访问地址": "Access Address",
  "请求参数": "Request Parameters",
  "完成日期": "Completed Date",
  "挂起日期": "Suspended Date",
  "委托日期": "Delegated Date",
  "确认": "Confirm",
  "审批意见": "Approval Opinion",
  "接口地址": "Interface Address",
  "客户名称": "Customer Name",
  "客户编码": "Customer Code",
  "创建时间": "Created Time",
  "修改时间": "Updated Time",
  "是否逻辑删除": "Is Logical Deleted",
  "部门名称": "Department Name",
  "部门编码": "Department Code",
  "上级部门": "Parent Department",
  "部门领导": "Department Leader",
  "分管领导": "Division Leader",
  "所属公司": "Affiliated Company",
  "部门电话": "Department Phone",
  "部门职责": "Department Responsibility",
  "字典类型名称": "Dictionary Type Name",
  "字典类型编码": "Dictionary Type Code",
  "字典类型": "Dictionary Type",
  "字典名称": "Dictionary Name",
  "字典编码": "Dictionary Code",
  "排序": "Sort",
  "字典描述": "Dictionary Description",
  "字典信息": "Dictionary Info",
  "请先选择字典类别": "Please select dictionary category first",
  "归属主体": "Belonging Entity",
  "应用名称": "Application Name",
  "添加时间": "Add Time",
  "上级应用": "Parent Application",
  "系统编码": "System Code",
  "系统Logo": "System Logo",
  "数据排序": "Data Sort",
  "系统描述": "System Description",
  "菜单名称": "Menu Name",
  "菜单编码": "Menu Code",
  "菜单图标": "Menu Icon",
  "菜单描述": "Menu Description",
  "原应用": "Original Application",
  "新应用": "New Application",
  "新应用的父级菜单": "Parent Menu of New Application",
  "打开方式": "Open Type",
  "保持活跃": "Keep Alive",
  "菜单切换方式": "Menu Switch Method",
  "移动": "Move",
  "复制": "Copy",
  "菜单列表": "Menu List",
  "原应用菜单": "Original Application Menu",
  "目标应用菜单": "Target Application Menu",
  "退回左边": "Return to Left",
  "添加到右边": "Add to Right",
  "菜单路径": "Menu Path",
};

// Read zh_CN.ts and generate en_US.ts
const zhContent = fs.readFileSync('src/lang/zh_CN.ts', 'utf-8');
const lines = zhContent.split('\n');

let output = [];
let inTemplateLiteral = false;
let templateBuffer = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Handle template literals (backtick strings)
  if (inTemplateLiteral) {
    templateBuffer += '\n' + line;
    if (line.includes('`')) {
      inTemplateLiteral = false;
      // For template literals, we need to translate them specially
      output.push(translateTemplateLiteral(templateBuffer));
      templateBuffer = '';
    }
    continue;
  }

  // Check for template literal start
  if (line.includes('`') && !line.includes('`') === line.lastIndexOf('`')) {
    // Template literal spans multiple lines
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount === 1) {
      inTemplateLiteral = true;
      templateBuffer = line;
      continue;
    }
  }

  // Handle import statement
  if (line.startsWith('import')) {
    output.push('// @ts-ignore');
    continue;
  }

  // Handle Config.footerTxt
  if (line.includes('Config.footerTxt')) {
    output.push(`  "starhorse.copyright": \`©Copyright2020-\${new Date().getFullYear()} Star Horse Personal Work House\`,`);
    continue;
  }

  // Try to match key-value pair
  const kvMatch = line.match(/^(\s*)"([^"]+)":\s*"([^"]*)"(.*)$/);
  if (kvMatch) {
    const [, indent, key, zhValue, rest] = kvMatch;
    const enValue = zh2en[zhValue] || translateChinese(zhValue);
    output.push(`${indent}"${key}": "${enValue}"${rest}`);
    continue;
  }

  // Try to match key with backtick value on same line
  const btMatch = line.match(/^(\s*)"([^"]+)":\s*`([^`]*)`(.*)$/);
  if (btMatch) {
    const [, indent, key, zhValue, rest] = btMatch;
    const enValue = zh2en[zhValue] || translateChinese(zhValue);
    output.push(`${indent}"${key}": \`${enValue}\`${rest}`);
    continue;
  }

  // Keep other lines as-is (comments, empty lines, etc.)
  output.push(line);
}

function translateTemplateLiteral(template) {
  // Handle multi-line template literals
  // For now, keep the structure but translate Chinese content
  if (template.includes('StarHorse DevOps')) {
    return `  "loginButton.description": \`  StarHorse DevOps is an enterprise-level development, operations and full-stack low-code development platform! Built with powerful core technology: built-in metadata engine, business process engine, business triggers, visual forms.
                                SQL queries, code generation, CMDB, data modeling, data visualization, reports, dashboards, workflows, permission management, message push, file management and more!\`,`;
  }
  if (template.includes('映射关系表示当前表与所选择的表之间的关系')) {
    return `  "dyform.formProp.relation.helpMsg": \`Mapping relationship indicates the relationship between the current table and the selected table:
 One-to-one: indicates a one-to-one correspondence between the current table and the selected table;
 One-to-many: indicates one record in the current table corresponds to multiple records in the selected table;
 Many-to-one: indicates multiple records in the current table correspond to one record in the selected table;
 Many-to-many: indicates one record in the current table corresponds to multiple records in the selected table,
        and vice versa, one record in the selected table also corresponds to multiple records in the current table.\`,`;
  }
  return template;
}

function translateChinese(text) {
  // Check if the text contains Chinese characters
  if (!/[\u4e00-\u9fff]/.test(text)) {
    return text; // No Chinese, return as-is
  }

  // Check the dictionary first
  if (zh2en[text]) {
    return zh2en[text];
  }

  // For texts not in the dictionary, return a placeholder
  // We'll fill these in later
  return text; // Return original for now, will be handled by the full dictionary
}

fs.writeFileSync('src/lang/en_US.ts', output.join('\n'), 'utf-8');
console.log('en_US.ts generated successfully!');
