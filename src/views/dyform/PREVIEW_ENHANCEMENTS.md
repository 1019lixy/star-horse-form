# 表单预览功能增强说明

## 概述
本次更新对表单预览功能进行了全面增强，增加了以下核心功能：
1. 支持根据 currentPageClass 显示不同样式
2. 表单验证功能
3. HTML 文件导出功能

## 功能详情

### 1. 样式支持
预览对话框现在支持根据 currentPageClass 属性显示不同的样式：
- `main-design` - 默认设计样式
- `main-design-phone` - 手机端样式
- `main-design-pad` - 平板端样式

这些样式会正确应用到导出的 HTML 文件中。

### 2. 表单验证
新增表单验证功能，可以：
- 验证表单中所有字段的输入有效性
- 显示验证结果提示信息
- 返回验证状态供其他组件调用

### 3. HTML 导出
新增将表单预览导出为 HTML 文件的功能：
- 生成包含完整样式和结构的 HTML 文件
- 保留所有表单元素和布局
- 支持响应式设计样式
- 自动生成下载链接

## 使用方法

### 在 DynamicForm.vue 中调用
```vue
<PreviewDialog
  :visible="isPreview"
  :compSize="compSize"
  :list="list"
  :currentPageClass="currentPageClass"
  @close="closeAction"
  ref="previewDialogRef"
/>
```

### 调用验证功能
```javascript
// 验证预览表单
await validatePreviewForm();

// 导出为 HTML
exportPreviewToHtml();
```

## 技术实现

### PreviewDialog.vue 增强
1. 新增 `currentPageClass` 属性支持
2. 添加验证和导出按钮到对话框头部
3. 实现 `validateForm` 方法进行表单验证
4. 实现 `exportToHtml` 方法导出 HTML 文件
5. 通过 `defineExpose` 暴露方法供父组件调用

### DynamicForm.vue 更新
1. 添加 `previewDialogRef` 引用
2. 新增 `validatePreviewForm` 和 `exportPreviewToHtml` 方法
3. 将方法暴露给外部组件使用

### FormPreview.vue 更新
1. 增强表单验证支持
2. 暴露验证方法和表单元素引用
3. 添加必要的 key 属性提高渲染性能

## 文件变更列表
- `src/views/dyform/dialogs/PreviewDialog.vue` - 主要增强实现
- `src/views/dyform/DynamicForm.vue` - 调用支持更新
- `src/views/dyform/FormPreview.vue` - 验证支持增强

## 注意事项
1. 导出的 HTML 文件包含基础样式，但不包含外部依赖
2. 验证功能依赖于表单组件的验证规则
3. 样式类名需要与项目中定义的 CSS 类保持一致