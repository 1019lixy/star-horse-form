# FormDesigner 滚动条显示问题修复说明

## 问题描述
在 FormDesigner.vue 组件中添加 `el-scrollbar` 后，发现以下问题：
1. 拖拽区域的提示文本 "释放鼠标放置组件" 显示不完整，只显示了下半部分
2. 空状态提示在某些情况下显示位置不正确
3. 组件在滚动区域中可能显示不完整

## 问题原因
添加 `el-scrollbar` 组件后，改变了原有布局结构，导致以下CSS定位出现问题：
1. `transform: translate(0, -50%)` 样式在滚动容器中的定位基准发生变化
2. 绝对定位元素的包含块发生变化
3. 高度计算方式改变，影响了元素的显示

## 解决方案

### 1. CSS 样式调整
- 为 `.dragging-area` 添加了明确的 `height: 100%` 和 `width: 100%` 样式
- 为 `.dragging-area::after` 提示文本添加了 `min-width` 和 `text-align` 样式确保正确显示
- 为 `el-scrollbar` 相关元素添加了明确的高度和宽度样式
- 调整了 `.empty-canvas` 的尺寸计算，使用 `calc(100% - 40px)` 确保在滚动区域中正确显示

### 2. 模板结构调整
- 在包含 `currentPageClass` 的 div 上添加了明确的 `height: 100%; width: 100%` 样式
- 为 `el-scrollbar` 添加了 `style="width: 100%;"` 确保宽度正确

### 3. 深度样式优化
- 添加了针对 `el-scrollbar` 组件的深度样式，确保滚动区域正确显示
- 为 `.h-full` 和 `.w-full` 类添加了明确的高度和宽度定义
- 添加了针对主设计类（`.main-design`, `.main-design-phone`, `.main-design-pad`）的样式确保在滚动区域中正确显示

## 修改文件
- `src/views/dyform/components/FormDesigner.vue` - 主要修复文件

## 验证结果
修改后，以下问题已解决：
1. ✅ 拖拽区域提示文本完整显示
2. ✅ 空状态提示在滚动区域中正确显示
3. ✅ 组件在滚动区域中完整显示
4. ✅ 所有设计类样式在不同设备模式下正确应用

## 注意事项
1. 使用深度选择器 `:deep()` 确保样式能正确穿透到 Element Plus 组件内部
2. 保持了原有的视觉效果和交互体验
3. 修复未影响其他功能，保持了代码的兼容性