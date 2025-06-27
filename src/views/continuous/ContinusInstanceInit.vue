<script setup lang="ts" name="ContinusInstanceInit">
import {computed, ComputedRef, nextTick, onMounted, ref} from "vue";
import {
  apiInstance,
  ApiUrls,
  operationConfirm,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SelectOption,
  useContinusConfigStore,
  uuid,
  warning
} from "star-horse-lowcode";
import {loadDict} from "@/api/star_horse_apis";
import {pipelineFields} from "@/views/continuous/utils/FieldsUtils";
import {useRouter} from "vue-router";

let router = useRouter();
const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/pipelineConfig");
const nodeCompRef = ref<any>();
// const nodeInfoRef = ref<any>();
const toolInfoRef = ref<any>();
const deployTemplateRef = ref<any>();
const tempDialog = ref<boolean>(false);
const nodeDialog = ref<boolean>(false);
const currentNodeIndex = ref<number>(-1);
const continuousStore = useContinusConfigStore(piniaInstance);
const nodeInfo = computed(() => continuousStore.nodeInfo);
let pipeLineData: ComputedRef = computed(() => continuousStore.getNodeInfo(pipelineNode.id));
let currentCompName = ref<string>("PipelineCfg");
let formNo = ref<string>("");
const processList = ref<any>([]);
let currentNode = ref<any>({});
let execTypeList = ref<SelectOption[]>([]);
let nodeSuccessConditionList = ref<SelectOption[]>([]);
let subNodeList = ref<SelectOption[]>([]);
let assignSelect = ref<boolean>(false);
const pipelineNode: any = {
  nodeCode: "PipelineCfg",
  id: uuid()
}
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
        listVisible: true
      },
      {
        label: "执行方式",
        fieldName: "nodeExecType",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps:{
          values: execTypeList,
        }
      }
    ],
    [
      {
        label: "节点成功条件",
        fieldName: "nodeSuccessCondition",
        type: "radio",
        optionList: nodeSuccessConditionList,
        defaultValue: "any",
        actions: {change:(val: any) => {
          console.log(val);
          assignSelect.value = val["nodeSuccessCondition"] == "assign";
        }},
        required: true,
        formVisible: true,
        listVisible: true,
        brotherNodes: [
          {
            label: "  ",
            fieldName: "assignNode",
            type: "select",
            optionList: subNodeList,
            required: true,
            formVisible: assignSelect,
            preps: {
              colspan: 6
            }
          }
        ],
        preps: {
          colspan: 13
        }
      }
    ],
  ]
})
const changeTemplate = () => {
  tempDialog.value = !tempDialog.value;
  nextTick(() => {
    deployTemplateRef.value.setTemplate(nodeInfo.value.pipelineCfg);
  });
};
const goBack = () => {
  router.push({
    path: "/continuous/ContinusInstanceConfig"
  });
}
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
  let result = await nodeCompRef.value.getFormData();
  if (!result) {
    return false;
  }
  continuousStore.addNodeInfo(currentNode.value.id, result);
  return true;
}

const isChange = ref<boolean>(false);
/** 编辑节点
 * @param node 当前节点
 * @param currentIndex 当前节点索引
 */
const editNode = async (node: any, currentIndex: number) => {
  let result = await validate()
  if (!result) {
    return "error";
  }
  //如果点击的是当前节点，则不做任何操作
  if (currentNode.value.id == node.id) {
    return "same";
  }
  nodeCompRef.value?.resetForm();
  // nodeInfoRef.value?.resetForm();
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
  const formData = continuousStore.getNodeInfo(node.id);
  if (formData) {
    nodeCompRef.value.setFormData(formData);
  }
  return "ok";
};
const delNode = (item: any) => {
  let index = processList.value.indexOf(item);
  processList.value.splice(index, 1);
  continuousStore.removeNode(item.id);
};
const addSubNode = () => {
  nodeDialog.value = true;
};
const closeAction = () => {
  nodeDialog.value = false;
  tempDialog.value = false;
};
/**
 * 保存选择的节点
 */
const dataSubmit = async () => {
  let node = toolInfoRef.value.getNode();
  console.log(node);
  if (!node) {
    warning("请先选择要配置的节点");
    return;
  }
  node = JSON.parse(JSON.stringify(node));
  node["id"] = uuid();
  let index = preCurrentNodeIndex.value == -1 ? processList.value.length : preCurrentNodeIndex.value;
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
    item["id"] = uuid();
  })
  processList.value = nodeList;
  closeAction();
  const result = await validate();
  if (result) {
    currentNode.value = nodeList[0];
    currentCompName.value = nodeList[0].nodeCode;
    currentNodeIndex.value = 0;
    formNo.value = nodeList[0].dynamicFormNo;
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
  let nodeList: any = [];
  if (!processList.value || processList.value.length == 0) {
    warning("请先添加节点");
    return;
  }
  processList.value?.forEach((item: any, num: number) => {
    const params = continuousStore.getNodeInfo(item.id);
    item["nodeParams"] = Array.isArray(params) ? params : [params];
    item["dataIndex"] = num + 1;
    nodeList.push(item);
  });
  pipeLineData.value["nodeList"] = nodeList;
  pipeLineData.value["execFlag"] = type;
  pipeLineData.value["isPublished"] = "Y";
  postRequest(dataUrl.mergeUrl, pipeLineData.value).then((res: any) => {
    let result = res?.data;
    if (result?.code) {
      warning(result.cnMessage);
      return;
    }
    operationConfirm("提交成功,是否返回列表？").then((res:boolean) => {
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
  currentFieldList.value = pipelineFields;
  continuousStore.clear();
  processList.value = [];
}
const init = async () => {
  reset();
  loadDict("CONTINUS_SUBNODE_FINISH_CONDITION").then((res) => {
    nodeSuccessConditionList.value = res;
  });
  loadDict("CONTINUS_SUBNODE_EXECUTE_TYPE").then((res) => {
    execTypeList.value = res;
  });
  continuousStore.clear();
};
onMounted(async () => {
  await init();
});

</script>
<template>
  <star-horse-dialog
      :title="'节点列表'"
      :dialogVisible="nodeDialog"
      :self-func="true"
      @closeAction="closeAction"
      @merge="dataSubmit"
      :is-batch="false"
      :is-show-btn-continue="false"
  >
    <ToolInfo ref="toolInfoRef" @selectNode="dataSubmit"/>
  </star-horse-dialog>
  <star-horse-dialog
      :title="'更换模板'"
      @merge="selectTemplate"
      :dialogVisible="tempDialog"
      :self-func="true"
      @closeAction="closeAction"
  >
    <deploy-template ref="deployTemplateRef" @selectTemplate="selectTemplate"/>
  </star-horse-dialog>
  <el-card class="inner_content relative">
    <div class="config-nav-bar relative">
      <div class="nav-bar-left">
        <span>{{ pipeLineData?.lineName || "未定义" }}</span>
        <span style="width: 40px"></span>
        <span>当前模板：{{ pipelineNode.templateName || "无" }}</span
        >&nbsp;&nbsp;
        <el-button @click="changeTemplate" link class="flex items-center">
          <star-horse-icon icon-class="transfer"/>
          更换模板
        </el-button>
        <el-button @click="goBack" link class="flex items-center">
          <star-horse-icon icon-class="return"/>
          返回列表
        </el-button>
      </div>
      <div class="nav-bar-right">
        <el-button @click="save('publish')" style="background: var(--star-horse-style); color: var(--star-horse-white)">
          <star-horse-icon icon-class="publish" color="white"/>
          保存并启用
        </el-button>
        <el-button @click="save('exec')">
          <star-horse-icon icon-class="run"/>
          保存并执行
        </el-button>
      </div>
    </div>
    <div class="pipeline-nav relative">
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
              color: -1 == currentNodeIndex ? 'var(--star-horse-white)' : 'var(--star-horse-style)'
            }"
          />
          流水线配置
        </div>
        <div class="nav-line"></div>
        <div class="start_end" v-if="processList.length > 0">开始</div>
        <el-scrollbar>
          <div class="nav-nodes">
            <div class="continuous-node-content" v-for="(item, index) in processList">
              <div class="step">
                <i class="icon node-arrow">
                  <star-horse-icon icon-class="arrow-double-right"/>
                </i>
                <i @click="addNode(index)" class="icon node-add">
                  <el-tooltip content="插入节点">
                    <star-horse-icon icon-class="add" cursor="pointer"/>
                  </el-tooltip>
                </i>
              </div>
              <div :class="{ 'is-active': index == currentNodeIndex }" @click.stop="editNode(item, index)"
                   class="nav-panel">
                <div class="relative flex flex-row items-center justify-center">
                  <star-horse-icon :icon-class="item.icon" size="30px"
                                   :color="index == currentNodeIndex?'var(--star-horse-white)':'var(--star-horse-style)'"/>
                  <span>{{ item.nodeName }}</span>
                  <i class="icon pright">
                    <star-horse-icon @click.stop="delNode(item)" icon-class="close" cursor="pointer" color="red"/>
                  </i>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
        <div class="step" v-if="processList.length > 0">
          <i class="icon node-arrow">
            <star-horse-icon icon-class="arrow-double-right" style="vertical-align: middle"/>
          </i>
          <i @click="addNode(processList.length)" class="icon node-add">
            <el-tooltip content="插入节点">
              <star-horse-icon icon-class="add" cursor="pointer" style="vertical-align: middle"/>
            </el-tooltip>
          </i>
        </div>
        <div class="start_end" v-if="processList.length > 0">结束</div>
        <el-button @click="addNode(-1)" class="init-btn" text>
          <star-horse-icon icon-class="add" cursor="pointer" style="vertical-align: middle"/>
          添加节点
        </el-button>
      </div>
    </div>
    <div class="config-content relative">
      <div class=" py-[7px] mx-[7px] my-[10px] border-solid border-1 rounded"
           style="border-color: var(--el-border-color-light);"
      >
        <node-fields :formNo="formNo" :staticFieldData="currentFieldList" ref="nodeCompRef"/>
        <!--每个节点的基础信息-->
        <!--        <star-horse-form ref="nodeInfoRef" class="build-cfg" :outerFormData="currentNode" :fieldList="nodeField"/>-->
      </div>

      <!--      <div class="flex-1 overflow-hidden">
              &lt;!&ndash;每个节点挂载的表单信息&ndash;&gt;

            </div>-->
    </div>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
