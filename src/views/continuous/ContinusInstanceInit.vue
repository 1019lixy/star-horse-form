<script setup lang="ts" name="ContinusInstanceInit">
import {computed, ComputedRef, nextTick, onMounted, ref, watch} from "vue";
import {
  apiInstance,
  ApiUrls,
  loadData,
  operationConfirm,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SelectOption,
  StarHorseIcon,
  uuid,
  warning,
} from "star-horse-lowcode";
import {loadDict} from "@/api/star_horse_apis";
import {pipelineFields} from "@/views/continuous/utils/FieldsUtils";
import {useRouter} from "vue-router";
import {Config} from "@/api/settings";
import {useContinusConfigStore} from "@/store/ContinusConfig";
import {dataInit} from "./utils/ToolsParams";

let router = useRouter();
const dataUrl: ApiUrls = apiInstance(
    "continuous-manage",
    "continuous/pipelineConfig",
);
const nodeFormRef = ref<any>();
const nodeCompRef = ref<any>();
const deployTemplateRef = ref<any>();
const tempDialogVisible = ref<boolean>(false);
const nodeDialogVisible = ref<boolean>(false);
const currentNodeIndex = ref<number>(-1);
const continuousStore = useContinusConfigStore(piniaInstance);
const nodeInfo = computed(() => continuousStore.nodeInfo);
let pipeLineData: ComputedRef = computed(() => {
  if (currentNodeIndex.value == -1) {
    return currentFormNode.value;
  } else {
    return continuousStore.getNodeInfo(pipelineNode.idNodeInfo);
  }
});
let currentCompName = ref<string>("PipelineCfg");
let formNo = ref<string>("");
const processList = ref<any>([]);
let currentNode = ref<any>({});
let currentFormNode = ref<any>({});
let execTypeList = ref<SelectOption[]>([]);
let nodeSuccessConditionList = ref<SelectOption[]>([]);
let subNodeList = ref<SelectOption[]>([]);
let assignSelect = ref<boolean>(false);
const pipelineNode: any = {
  nodeCode: "PipelineCfg",
  nodeName: "流水线配置",
  idNodeInfo: uuid(),
};
//当前节点属性
const currentFieldList = ref<PageFieldInfo>({fieldList: []});

let nodeField = ref<PageFieldInfo>({
  fieldList: [
    [
      {
        label: "名称",
        fieldName: "nodeName",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "执行方式",
        fieldName: "nodeExecType",
        type: "select",
        required: true,
        defaultValue: "serial",
        formVisible: true,
        listVisible: true,
        preps: {
          values: execTypeList,
        },
      },
    ],
    [
      {
        label: "节点成功条件",
        fieldName: "nodeSuccessCondition",
        type: "radio",
        defaultValue: "any",
        actions: {
          change: (val: any) => {
            assignSelect.value = val["nodeSuccessCondition"] == "assign";
          },
        },
        required: true,
        formVisible: true,
        listVisible: true,
        brotherNodes: [
          {
            label: "  ",
            fieldName: "assignNode",
            type: "select",
            required: true,
            formVisible: assignSelect,
            preps: {
              values: subNodeList,
              colspan: 6,
            },
          },
        ],
        preps: {
          values: nodeSuccessConditionList,
          colspan: 13,
        },
      },
    ],
  ],
});
const changeTemplate = () => {
  tempDialogVisible.value = !tempDialogVisible.value;
  nextTick(() => {
    deployTemplateRef.value.setTemplate(nodeInfo.value.pipelineCfg);
  });
};
const goBack = () => {
  router.push({
    path: "/continuous/ContinusInstanceConfig",
  });
};
const preCurrentNodeIndex = ref<number>(-1);
/**
 * 添加节点
 * @param currentIndex 当前节点索引
 */
const addNode = async (currentIndex: number) => {
  let result = await validate();
  if (!result) {
    warning("请先填写节点信息");
    return;
  }
  preCurrentNodeIndex.value = currentIndex;
  addSubNode();
};
/**
 * 校验节点信息
 */
const validate = async () => {
  let result = await nodeFormRef.value.validate();
  if (!result) {
    return false;
  }
  //这里只是处理了当前的节点信息，子节点也需要处理

  continuousStore.addNodeInfo(currentNode.value.idNodeInfo, {
    ...currentFormNode.value,
  });

  return true;
};

const isChange = ref<boolean>(false);
/** 编辑节点
 * @param node 当前节点
 * @param currentIndex 当前节点索引
 */
const editNode = async (node: any, currentIndex: number) => {
  let result = await validate();
  if (!result) {
    return "error";
  }
  //如果点击的是当前节点，则不做任何操作
  if (currentNode.value.idNodeInfo == node.idNodeInfo) {
    return "same";
  }
  nodeCompRef.value?.resetForm();
  isChange.value = true;
  currentNode.value = node;
  currentCompName.value = node.nodeCode;
  if (node.nodeCode == "PipelineCfg") {
    formNo.value = "";
    currentFieldList.value = pipelineFields;
  } else {
    formNo.value = node.dynamicFormNo;
    currentFieldList.value = {};
  }
  currentNodeIndex.value = currentIndex;
  initDataInfo(node);
  return "ok";
};
const initDataInfo = (node: any) => {
  const formData = continuousStore.getNodeInfo(node.idNodeInfo);
  if (formData) {
    currentFormNode.value = formData;
  } else {
    currentFormNode.value = {
      nodeName: node.nodeName,
      nodeCode: node.nodeCode,
      nodeExecType: "serial",
      nodeSuccessCondition: "any",
    };
  }
};
const delNode = (item: any) => {
  let index = processList.value.indexOf(item);

  // 删除节点前先确定下一个要显示的节点
  let nextNode = null;
  if (processList.value.length > 1) {
    // 如果有多个节点，取相邻节点（优先前一个，没有则后一个）
    nextNode = processList.value[index - 1] ?? processList.value[index + 1];
  }

  // 清除NodeFields组件中的表单数据
  nodeCompRef.value?.resetForm();

  // 删除节点
  processList.value.splice(index, 1);

  if (processList.value.length === 0) {
    // 如果没有节点了，设置为配置节点
    currentFieldList.value = pipelineFields;
    formNo.value = "";
    // 重置为初始配置节点
    currentNode.value = {
      ...pipelineNode,
    };
  } else {
    // 设置为相邻节点或第一个节点
    if (nextNode) {
      currentNode.value = nextNode;
      formNo.value = nextNode.dynamicFormNo || "";
    } else {
      // 如果没有相邻节点，取第一个节点
      currentNode.value = processList.value[0];
      formNo.value = processList.value[0].dynamicFormNo || "";
    }
    currentFieldList.value = {};
    // 重置表单数据为当前节点的基础信息
  }
  initDataInfo(currentNode.value);
  continuousStore.removeNode(item.idNodeInfo);
};
const addSubNode = () => {
  nodeDialogVisible.value = true;
};
const closeAction = () => {
  nodeDialogVisible.value = false;
  tempDialogVisible.value = false;
};
/**
 * 保存选择的节点
 */
const dataSubmit = async (pnode: any) => {
  if (!pnode) {
    warning("请先选择要配置的节点");
    return;
  }
  let node = JSON.parse(JSON.stringify(pnode));
  node["idNodeInfo"] = uuid();
  let index =
      preCurrentNodeIndex.value == -1
          ? processList.value.length
          : preCurrentNodeIndex.value;
  await editNode(node, index);
  processList.value.splice(index, 0, node);
  currentNodeIndex.value = index;
  currentCompName.value = node.nodeCode;
  formNo.value = node.dynamicFormNo;
  currentNode.value = node;
  closeAction();
};
const selectTemplate = async () => {
  let template = deployTemplateRef.value.getTemplate();
  if (!template || Object.keys(template).length == 0) {
    warning("请选择要更换的模板");
    return;
  }
  pipelineNode.templateName = template.templateName;
  pipelineNode.idTemplate = template.idTemplate;
  let nodeList = JSON.parse(JSON.stringify(template.nodeList));
  nodeList.forEach((item: any) => {
    item["idNodeInfo"] = uuid();
  });
  processList.value = nodeList;
  closeAction();
  const result = await validate();
  if (result) {
    editNode(processList.value[0], 0);
  }
};
/**
 * 保存数据
 * @param type
 */
const save = async (type: string) => {
  let result = await validate();
  if (!result) {
    return;
  }
  if (!processList.value || processList.value.length == 0) {
    warning("请先添加节点");
    return;
  }
  let configData: any[] = [];
  processList.value?.forEach((item: any, num: number) => {
    const params = continuousStore.getNodeInfo(item.idNodeInfo);
    let temp = {
      ...params,
      subNodeInfoList: item.subNodeInfoList,
      dynamicFormNo: item.dynamicFormNo,
      advancedDynamicFormNo: item.advancedDynamicFormNo,
      resultFormNo: item.resultFormNo,
      dataIndex: num + 1,
    };
    configData.push(temp);
  });
  pipeLineData.value["nodeList"] = configData;
  pipeLineData.value["isPublished"] = "Y";
  pipeLineData.value["configList"] = processList.value;
  postRequest(dataUrl.mergeUrl, pipeLineData.value).then((res: any) => {
    let result = res?.data;
    if (result?.code) {
      warning(result.cnMessage);
      return;
    }
    operationConfirm("提交成功,是否返回列表？").then((res: boolean) => {
      if (res) {
        goBack();
      } else {
        reset();
      }
    });
  });
};
/**
 * 重置
 */
const reset = () => {
  currentNode.value = {...pipelineNode};
  currentCompName.value = pipelineNode.nodeCode;
  initDataInfo(currentNode.value);
  currentFieldList.value = pipelineFields;
  continuousStore.clear();
  processList.value = [];
};
//记录表单的属性
const loadCfgData = (query: any) => {
  if (!query || !query.configId) {
    return;
  }
  reset();
  loadData(dataUrl.loadByIdUrl + "/" + query.configId, {}).then((res: any) => {
    if (res?.error) {
      warning(res.error);
      return;
    }
    let result = res?.data;
    processList.value = result.nodeList;
    delete result.nodeList;
    let params = result.params;
    delete result.params;
    currentNode.value = {...pipelineNode};
    currentFormNode.value = result;
    continuousStore.addNodeInfo(currentNode.value.idNodeInfo, result);
    for (let key in params) {
      continuousStore.addNodeInfo(key, params[key]);
    }
  });
};

const init = async () => {
  reset();
  loadDict("CONTINUS_SUBNODE_FINISH_CONDITION").then((res) => {
    nodeSuccessConditionList.value = res;
  });
  loadDict("CONTINUS_SUBNODE_EXECUTE_TYPE").then((res) => {
    execTypeList.value = res;
  });
  continuousStore.clear();
  dataInit();
};
onMounted(async () => {
  await init();
});
watch(
    () => router.currentRoute.value,
    (newVal, oldVal) => {
      loadCfgData(newVal.query);
    },
    {
      immediate: true,
    },
);
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <NodeDialog :visible="nodeDialogVisible" @save="dataSubmit" @close="closeAction"/>
    <star-horse-dialog
        :title="'更换模板'"
        @merge="selectTemplate"
        :dialogVisible="tempDialogVisible"
        :self-func="true"
        @closeAction="closeAction"
    >
      <deploy-template
          ref="deployTemplateRef"
          @selectTemplate="selectTemplate"
      />
    </star-horse-dialog>
    <el-card class="inner_content relative">
      <div class="config-nav-bar relative">
        <div class="nav-bar-left">
          <div class="flex items-center font-[600] text-[14px]">
            <star-horse-icon icon-class="config"/>
            流水线:{{ pipeLineData?.lineName || "未定义" }}
          </div>
          <el-divider
              direction="vertical"
              style="border: 1px solid var(--star-horse-style)"
          />
          <div class="flex items-center">当前模板：{{ pipelineNode.templateName || "无" }}
          </div
          >
          <el-divider
              direction="vertical"
              style="border: 1px solid var(--star-horse-style)"
          />
          <div @click="changeTemplate" link class="flex items-center cursor-pointer">
            <star-horse-icon icon-class="transfer"/>
            更换模板
          </div>
          <el-divider
              direction="vertical"
              style="border: 1px solid var(--star-horse-style)"
          />
          <div @click="goBack" link class="flex items-center cursor-pointer">
            <star-horse-icon icon-class="return"/>
            返回列表
          </div>
        </div>
        <div class="nav-bar-right flex items-center">
          <div
              class="flex items-center cursor-pointer px-2"
              @click="save('publish')"
              style="
              border: 1px solid var(--star-horse-style);
              border-radius: 4px;
            "
          >
            <star-horse-icon icon-class="publish"/>
            保存并启用
          </div>
          <el-divider
              direction="vertical"
              style="border: 1px solid var(--star-horse-style)"
          />
          <div @click="save('exec')" style="
           border-radius: 4px;
              border: 1px solid var(--star-horse-style);
            " class="flex items-center cursor-pointer  px-2">
            <star-horse-icon icon-class="run"/>
            保存并执行
          </div>
        </div>
      </div>
      <el-splitter layout="vertical">
        <el-splitter-panel :resizable="false" size="76">
          <div class="pipeline-nav">
            <div class="nav">
              <div
                  :class="{ 'is-active': -1 == currentNodeIndex }"
                  @click.stop="editNode(pipelineNode, -1)"
                  class="nav-setting nav-panel"
              >
                <star-horse-icon
                    icon-class="setting"
                    :style="{
                    'vertical-align': 'middle',
                    color:
                      -1 == currentNodeIndex
                        ? 'var(--star-horse-white)'
                        : 'var(--star-horse-style)',
                  }"
                />
                流水线配置
              </div>
              <div class="nav-line"></div>

              <div class="nav-nodes" v-if="processList?.length > 0">
                <div class="start_end" v-if="processList.length > 0">开始</div>
                <div
                    class="continuous-node-content"
                    v-for="(item, index) in processList"
                >
                  <div class="step">
                    <div class="icon node-arrow">
                      <star-horse-icon icon-class="arrow-double-right"/>
                    </div>
                    <div @click="addNode(index)" class="icon node-add">
                      <el-tooltip content="插入节点">
                        <star-horse-icon icon-class="add" cursor="pointer"/>
                      </el-tooltip>
                    </div>
                  </div>
                  <template v-if="item.children?.length"></template>
                  <div
                      v-else
                      :class="{ 'is-active': index == currentNodeIndex }"
                      @click.stop="editNode(item, index)"
                      class="nav-panel"
                  >
                    <div
                        class="relative flex flex-row items-center justify-center"
                    >
                      <star-horse-icon
                          :icon-class="item.icon"
                          size="24px"
                          :color="
                          index == currentNodeIndex
                            ? 'var(--star-horse-white)'
                            : 'var(--star-horse-style)'
                        "
                      />
                      <span>{{ item.nodeName }}</span>
                      <div class="icon pright">
                        <star-horse-icon
                            @click.stop="delNode(item)"
                            icon-class="close"
                            cursor="pointer"
                            color="red"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="step" v-if="processList.length > 0">
                  <div class="icon node-arrow">
                    <star-horse-icon
                        icon-class="arrow-double-right"
                        style="vertical-align: middle"
                    />
                  </div>
                  <div
                      @click="addNode(processList.length)"
                      class="icon node-add"
                  >
                    <el-tooltip content="插入节点">
                      <star-horse-icon
                          icon-class="add"
                          cursor="pointer"
                          style="vertical-align: middle"
                      />
                    </el-tooltip>
                  </div>
                </div>
                <div class="start_end" v-if="processList.length > 0">结束</div>
              </div>

              <el-button @click="addNode(-1)" class="init-btn" text>
                <star-horse-icon
                    icon-class="add"
                    cursor="pointer"
                    style="vertical-align: middle"
                />
                添加节点
              </el-button>
            </div>
          </div>
        </el-splitter-panel>
        <el-splitter-panel>
          <div
              class="py-[7px] mx-[7px] my-[10px] border-solid border-1 rounded"
              style="border-color: var(--el-border-color-light)"
          >
            <sh-form v-model:dataForm="currentFormNode" ref="nodeFormRef">
              <!--每个节点的基础信息-->
              <star-horse-form-item
                  v-if="currentNode.nodeCode != 'PipelineCfg'"
                  ref="nodeInfoRef"
                  class="build-cfg"
                  :compSize="Config.compSize"
                  v-model:dataForm="currentFormNode"
                  :fieldList="nodeField"
              />
              <node-fields
                  :formNo="formNo"
                  :nodeInfo="currentNode"
                  v-model:dataForm="currentFormNode"
                  :staticFieldData="currentFieldList"
                  ref="nodeCompRef"
              />
            </sh-form>
          </div>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
