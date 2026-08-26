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

  ],
};
