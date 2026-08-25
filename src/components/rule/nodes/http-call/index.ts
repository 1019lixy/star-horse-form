/**
 * HTTP 调用节点（http-call）—— 业务自包含模块
 * 端点代理地址等来自全局 appEndpoints 配置，不写死业务接口。
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import {appEndpoints} from "@/api/app_config";
import HttpCallNode from "./HttpCallNode.vue";
import HttpCallDialog from "./HttpCallDialog.vue";
import type {NodeTypeDef} from "../../nodeTypes";

const HttpCallEditor = defineComponent({
  name: "HttpCallEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () =>
      h(HttpCallDialog as any, {
        visible: true,
        config: JSON.parse(JSON.stringify(props.nodeData || {})),
        onSave: (c: any) => emit("save", c),
        onClose: () => emit("close"),
      });
  },
});

export const httpCallDef: NodeTypeDef = {
  type: "http-call",
  label: "rule.node.httpCall",
  icon: "🌐",
  category: "logic",
  nodeClass: "action",
  desc: "rule.desc.httpCall",
  component: HttpCallNode as any,
  editor: HttpCallEditor as any,
  editorHint: "rule.hint.httpCallDialog",
  getSummary: (d) => `${d.httpMethod || "GET"} ${d.url || "?"}`,
  defaultData: () => ({
    actionType: "HTTP_CALL",
    apiMode: "custom",
    apiType: "thirdApi",
    url: "",
    httpMethod: "GET",
    protocol: "https",
    timeout: 5000,
    requestDataType: "json",
    headers: [],
    requestParams: [],
    body: "",
    successCode: "200",
    codePath: "code",
    messagePath: "message",
    dataPath: "data",
    fieldMappings: [],
    authEnabled: false,
    authInfo: null,
    proxyEnabled: true,
    proxyUrl: appEndpoints.apiLinkageProxyUrl,
    retryCount: 0,
    description: "",
  }),
  estimateSize: () => ({width: 300, height: 160}),
  getEdgeLabel: ({data}) => ({
    label: `${data?.method || data?.httpMethod || "GET"} ${data?.url || i18n("rule.edge.interface")}`,
    labelStyle: {fill: "#64748b", fontSize: 11, fontWeight: 500},
  }),
  paramSchema: [
    {
      name: "httpMethod",
      label: "rule.lbl.httpMethod",
      type: "select",
      required: true,
      group: "rule.group.request",
      options: [
        {label: "GET", value: "GET"},
        {label: "POST", value: "POST"},
        {label: "PUT", value: "PUT"},
        {label: "DELETE", value: "DELETE"},
      ],
    },
    {
      name: "url",
      label: "rule.lbl.apiUrl",
      type: "input",
      required: true,
      group: "rule.group.request",
      placeholder: "https://api.example.com/data",
    },
    {
      name: "fieldMappings",
      label: "rule.lbl.fieldMappings",
      type: "table",
      group: "rule.group.mapping",
      columns: [
        {
          prop: "sourceField",
          label: "rule.lbl.sourceField",
          type: "input",
          width: "45%",
        },
        {
          prop: "distField",
          label: "rule.lbl.distField",
          type: "input",
          fieldSelect: true,
          width: "45%",
        },
      ],
    },
    {
      name: "requestParams",
      label: "rule.lbl.requestParams",
      type: "table",
      group: "rule.group.request",
      columns: [
        {
          prop: "paramName",
          label: "rule.lbl.paramName",
          type: "input",
          width: "30%",
        },
        {
          prop: "valueType",
          label: "rule.lbl.valueType",
          type: "select",
          width: "20%",
          options: [
            {label: () => i18n("rule.opt.static"), value: "static"},
            {label: () => i18n("rule.opt.dynamic"), value: "dynamic"},
          ],
        },
        {
          prop: "paramValue",
          label: "rule.lbl.paramValue",
          type: "input",
          fieldSelect: true,
          width: "40%",
        },
      ],
    },
    {
      name: "body",
      label: "rule.lbl.requestBody",
      type: "textarea",
      rows: 4,
      group: "rule.group.request",
      placeholder: "rule.ph.jsonBody",
    },
    {
      name: "successCode",
      label: "rule.lbl.successCode",
      type: "input",
      default: "200",
      group: "rule.group.response",
      placeholder: "200",
    },
    {
      name: "dataPath",
      label: "rule.lbl.dataPath",
      type: "input",
      default: "data",
      group: "rule.group.response",
      placeholder: "data.list",
    },
    {
      name: "headers",
      label: "rule.lbl.headers",
      type: "table",
      group: "rule.group.advanced",
      columns: [
        {
          prop: "paramName",
          label: "rule.lbl.paramName",
          type: "input",
          width: "30%",
        },
        {
          prop: "valueType",
          label: "rule.lbl.valueType",
          type: "select",
          width: "20%",
          options: [
            {label: () => i18n("rule.opt.static"), value: "static"},
            {label: () => i18n("rule.opt.dynamic"), value: "dynamic"},
          ],
        },
        {
          prop: "paramValue",
          label: "rule.lbl.paramValue",
          type: "input",
          fieldSelect: true,
          width: "40%",
        },
      ],
    },
    {
      name: "timeout",
      label: "rule.lbl.timeout",
      type: "number",
      min: 1000,
      step: 1000,
      default: 5000,
      group: "rule.group.advanced",
    },
    {
      name: "retryCount",
      label: "rule.lbl.retryCount",
      type: "number",
      min: 0,
      max: 5,
      default: 0,
      group: "rule.group.advanced",
    },
  ],
};