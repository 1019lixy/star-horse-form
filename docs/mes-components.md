# MES 业务组件集

基于 MES 业务线（工艺路线 → 工单绑工艺 → 排产 → 投产 → 投入/绑定/校验/QC/返工/装箱/入库/下线/出库）提取的表单级业务组件。组件位于 `src/components/formcomp/items/`，面板分类 `category: 4`（FieldPanel "MES组件" 分区）。

| itemType | 组件 | 业务环节 | 后端接口 |
| --- | --- | --- | --- |
| mes-scan-input | 扫码录入 | 投入/绑定/出库扫码 | 可选（apiDataSource 校验） |
| mes-station-pass | 过站校验 | 过站/流转 | 必需（apiDataSource 过站） |
| mes-qc-inspect | 检验录入 | QC | 无（结构化写入表单） |
| mes-rework-record | 返工记录 | 返工 | 无（结构化写入表单） |
| mes-packing | 装箱 | 装箱 | 无（结构化写入表单） |
| mes-label-print | 标签打印 | 全环节 | WebSocket（C/S 打印客户端）或浏览器打印 |

## 统一后端调用契约（callMesApi）

扫码校验、过站等后端交互**复用既有数据源体系**：在设计器中给组件配置"数据源"（DataSourceConfigPanel，thirdParty 模式），写入 `preps.apiDataSource`。组件经 `loadData` 调用代理接口：

```
POST  {apiDataSource.proxyUrl ?? /system-config/redirect/apiLinkage}
Body: {
  ...apiDataSource,                       // 原样透传（含 url/httpMethod/protocol/requestParams 等）
  formData: { ...当前表单数据 },           // 完整表单数据，可供 requestParams 动态参数 ${field} 解析
  queryCondition: {
    fieldList: [                          // 业务参数（按组件不同，见下）
      { propertyName: "scanValue", value: "ABC123", operation: "eq" }
    ]
  }
}
```

响应遵循平台统一格式：`{ code: 200, data: <业务数据>, cnMessage? }`。`code !== 200` 时 `cnMessage` 作为失败原因展示。

## mes-scan-input 扫码录入

**交互**：扫码枪（键盘模拟）输入 + 回车提交；防重复（同码一次会话仅成功一次）；Web Audio 声音提示（成功高音/失败低音）；输入框闪色反馈（绿/红+抖动）；扫码历史列表。

**配置项**：placeholder、allowRepeat（允许重复）、soundTip、autoFocus、historySize、messageField（校验信息回填到该表单字段）。

**校验接口**（配置了数据源时）：`fieldList` 携带 `{ scanValue, fieldName }`。

**响应约定**：

```json
{ "success": true, "message": "校验通过" }
```

- `success` 或 `pass` 缺省视为成功；`false` 视为失败。
- `message`：成功/失败原因，回填 `messageField`（已配置时）。

**写入 formData**：成功时 `formData[fieldName] = 扫码值`。

## mes-station-pass 过站

**交互**：序列号扫码 + 回车（或点"过站"按钮）→ 调过站接口 → 成功计数 + 显示下一工序；历史记录列表；防重复过站。

**配置项**：placeholder、operationField（从表单字段取当前工序）、operationValue（固定工序值，二者取一）、soundTip、historySize。

**过站接口**：`fieldList` 携带 `{ sn, operation, action: "stationPass" }`。

**响应约定**：

```json
{ "success": true, "message": "过站成功", "nextOperation": "OP020" }
```

- `success/pass`：是否允许过站（后端做漏站/重复站/状态校验，前端只呈现结果）。
- `nextOperation`：可选，成功时展示"下一工序"。

**写入 formData**：

```json
{ "lastSn": "SN001", "operation": "OP010", "nextOperation": "OP020", "count": 3 }
```

## mes-qc-inspect 检验录入

**交互**：按配置的检验项逐项录入实测值；数值型按 min/max 自动判定，文本型手动判定（合格/不合格）；整体结论自动汇总（任一不合格→不合格），允许改判（合格/让步接收/不合格）；结论非合格时可选不良代码（选项经数据源拉取）。

**配置项**：

- `inspectItems`（JSON 数组）：

```json
[
  { "name": "外观", "type": "text" },
  { "name": "长度", "type": "number", "unit": "mm", "min": 10, "max": 10.5, "standard": "10.2", "precision": 2 }
]
```

- `allowOverride`：允许人工改判结论。
- `showDefectCode`：结论非合格时显示不良代码多选。

**写入 formData**：

```json
{
  "items": [
    { "name": "长度", "actual": 10.3, "result": true, "manualResult": null },
    { "name": "外观", "actual": null, "result": false, "manualResult": "fail" }
  ],
  "conclusion": "fail",
  "defectCodes": ["D001"],
  "inspectTime": "2026-09-14T10:00:00.000Z"
}
```

**不良代码选项**：配置数据源时经 `compDynamicData` 拉取选项列表（`[{name, value}]` 结构），支持手工录入（allowCreate）。

## mes-rework-record 返工记录

**交互**：返工数量 + 不良原因（数据源选项）+ 返工去向工序 + 备注；不良代码→默认工序自动带出（`defectTargetMap` 映射），可修改。

**配置项**：`defectTargetMap`（JSON：`{"D001": "OP010"}`）、`maxQty`。

**写入 formData**：

```json
{ "qty": 5, "defectCode": "D001", "targetOperation": "OP010", "remark": "外观划伤" }
```

## mes-packing 装箱

**交互**：当前箱 + 扫码累积明细 + 容量上限满箱自动封箱 + 手动封箱 + 明细移出（拆箱）+ 已封箱历史；箱号支持自动生成（前缀+日期+序号）或扫码/手动输入。

**配置项**：boxNoMode（auto/input）、boxNoPrefix、boxCapacity（0=不限）、boxNoField（input 模式下从表单字段读箱号）、soundTip。

**写入 formData**：

```json
{
  "currentBox": { "boxNo": "BOX20260914001", "items": ["SN1", "SN2"], "count": 2, "sealed": false },
  "historyBoxes": [ { "boxNo": "BOX20260914000", "items": ["SN0"], "count": 1, "sealedTime": "10:00:00" } ]
}
```

## mes-label-print 标签打印

**打印模式**：

- `websocket`（默认）：对接 C/S 打印客户端。客户端监听本机 WebSocket 端口，Web 端直连发送打印指令，绕开浏览器无法枚举本机打印机的限制。
- `browser`：回退方案，生成标签 HTML 经 iframe 调起浏览器打印。

**配置项**：printMode、wsUrl（默认 `ws://127.0.0.1:16823`）、templateName（客户端模板标识）、copies、printer（留空=客户端默认打印机）、dataMapping（JSON：`{"模板变量": "表单字段名"}`，留空传全部扁平表单字段）。

**WebSocket 协议契约（C/S 客户端实现依据）**：

```
连接：   ws://127.0.0.1:16823（可配置）
请求：   {
  "action": "print",
  "requestId": "r1694660000000",
  "template": "SN_LABEL",
  "data": { "SN": "SN001", "WO": "WO20260914001" },
  "copies": 2,
  "printer": ""                    // 空串 = 默认打印机
}
响应：   { "success": true, "message": "打印成功", "requestId": "r1694660000000" }
```

- 客户端按 `template` 从模板库加载模板，用 `data` 填充变量，向 `printer` 打印 `copies` 份。
- `requestId` 用于匹配响应，客户端原样回带即可；未回带时组件按"下一条消息即响应"处理。
- 组件内置：连接超时 5s、打印响应超时 15s、连接状态指示（未连接/连接中/已连接/失败）、"测试连接"按钮、断开自动清理。

## 组件注册链路

- 组件文件：`src/components/formcomp/items/mes-*-item.vue`，由 `src/index.ts` 的 `import.meta.glob` 自动全局注册。
- 元数据：`src/components/system/items/form/composables/mesExtendItems.ts`（category=4），由 `StarHorseFormDesign.vue` 注入 store。
- 面板：`FieldPanel.vue` "MES组件" 分区（activeNames 'd'）。
- 公共扫码逻辑：`src/components/formcomp/utils/useScanner.ts`（声音/防重复/历史/callMesApi）。