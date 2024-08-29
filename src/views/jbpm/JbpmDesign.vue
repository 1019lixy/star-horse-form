<!--1、工作流引擎：抽象的业务流程设计模型，负责业务流程的定义，解释和运转。-->
<!--2、工作流模版：用工作流引擎的基本概念和路由过程表示出一个业务办理过程，这个过程通常是用xml格式的文件来记录的，这个xml文件，
就是工作流模版，也可以说是流程模版。-->
<!--3、工作流名称：就是工作流模版文件的名称。也可以叫流程名称。-->
<!--4、工作流版本：工作流模版的版本，也可以叫流程版本。在工作流系统中，对工作流模版有个版本管理，新建一个工作流模版时候，
它的工作流模版是.1。当再次做修改的时候，可以选择创建新的版本，如.2。因为一旦业务流程模版投入使用了，有了运行的流程实例了，
再次对业务流程做的修改，就需要更新到新的版本中，原来的流程版本还需要存在，原来的流程定义信息，按版本仍然能查询到。
新的修改在新的版本中。流程名称＋流程版本 是唯一标识一个业务流程的。-->
<!--5、工作流建模：利用流程设计器将业务处理过程用工作流的节点方式表示出来，就是工作流建模，也可以说是流程建模。-->
<!--6、工作流节点：是工作流引擎的设计基本节点，一个节点表示一个业务处理过程，在流程设计器中，会有相应的表示方式。-->
<!--1、流程实例：按照工作流模版定义的处理过程启动运行的业务处理过程，即流程实例。利用建立好的业务流程模版，可以 多次启动流程实例，
一个流程实例即一个业务处理过程。如请假审批的流程，张三填写他的请假单，启动一个审批流程实例。李四也填写一个自己的清单单，也是启 动了一条流程实例。-->
<!--2、流程实例id：每条启动的流程实例，在工作流引擎中，都会对应一个流程实例id，来唯一标识这条流程实例。-->
<!--3、轨迹id： 轨迹id通常是指流程节点的运行轨迹id，当一个节点在流程实例中被反复运行的时候（如循环路由，自由流），每次到达这个节点的时候，
都会产生一个轨迹 id，trace_id, 唯一标识这次的运行轨迹。-->
<!--4、业务数据： 流程中每个节点上处理的业务记录等。通常流程数据和业务数据是有关联的。-->
<!--5、流程设计器：利用工作流引擎的设计基本节点和概念给业务流程建模的可视化编辑工具，就是流程设计器。-->
<!--6、当前步骤：流程实例未结束前，正运行到的当前节点，为当前步骤。-->
<!--7、历史步骤：流程实例运行完成的节点，都认为是历史步骤。-->
<!--8、流程实例运行轨迹：每条流程实例在工作流模版的节点上运行的轨迹。-->
<!--9、流程实例监控：监控每个流程实例在各个节点的运行情况。-->
<!--1、任务：每条流程实例在运行到流程的各个节点时，会产生一些待执行的任务信息。有任务名称，描述，和参与人，完成人等任务的基本信息。
通过任务链接到待处理的业务过程。-->
<!--2、任务参与人：任务信息的参与人，能够查看到任务的相关人。-->
<!--3、任务执行人：可执行任务的操作人。-->
<!--4、任务工单：任务派发下来的工单。-->
<!--5、串行路由：业务建模中，节点按顺序一个一个的往后串联的方式。-->
<!--6、并行路由：业务建模中，节点并行的方式往后链接。-->
<!--7、条件路由：业务建模中，按设置的条件为真，链接一个路由方式，条件为false，往后链接一个路由方式。在流程实例运行时，只会执行一条路由，
即条件要么＝true，要么=false.-->
<!--1、分支：业务建模中，平行分支的节点路由方式。-->
<!--2、合并：业务建模中，将平行分支的节点路由再合并起来的路由方式。-->
<!--3、子流程：为一个独立的业务流程，嵌入到主流程中。-->
<!--4、循环路由：在节点间或同一个节点上循环执行的路由方式。-->
<!--5、自由流：流程实例不按照流程模版中预定义好的节点顺序往下执行，而是可以自由的跳转。-->
<!--6、回退流：流程实例不按照流程模版中预定义好的节点顺序往下执行，而是回退到曾经运行过的任意节点上。-->
<!--7、业务补偿类：在流程发生自由跳转的时候，需要辅助执行一些业务处理过程来对业务数据进行修改。-->
<!--1、转派：直接将任务办理人换成别人，这时任务的拥有着者不再是转办人，相当于将任务转出。-->
<!--2、委托：就是可以让一个用户将自己某个流程的主办或者经办权限转移委托至别的用户，则当有流程设定为该用户办理时，
流程自动转由被委托的人在有效期限里接收并办理，等被委托人处理好之后，委托任务会自动回到委托人的任务中 。-->
<!--3、协办：在协办委派中，协办人的职责是协助委托人完成任务，协办人操作完毕以后，委托人需要对该工作进行确认。-->
<!--4、会签（有序/无序）：一般的会签就是指在流程管理中发起人可以同时对多个人发起会签，多个人可以同时处理，只有所有负责人审批通过，
审批节点才会通过。-->
<!--5、或签：只要任一负责人审批通过,审批节点就会通过。-->
<!--6、加签：增加一道审批签名，这个道审批往往是临时增加的，标准流程没有规定要走的。　-->
<!--7、交接：管理员将离职或换岗员工的待执行、待领取、代办他人、委托他人代办的任务转交给接管人，并删除与该员工相关的委托代理关系。
交接员工所有直接参与的流程实例中对应的参与者将自动由系统修改为接管人。-->
<!--8、回退：流程实例不按照流程模版中预定义好的节点顺序往下执行，而是回退到曾经运行过的任意节点上。-->
<script setup lang="ts" name="JbpmDesign">
import jpbmInit from "@/views/jbpm/utils/template";
import BpmnModeler from 'bpmn-js/lib/Modeler'
import BpmnViewer from "bpmn-js/lib/Viewer"
import {xmlStr} from "@/views/jbpm/utils/xml";
import customTranslate from "@/views/jbpm/utils/zh_CN";
import activitiModele from '@/views/jbpm/utils/activiti.json';
import flowableModdle from '@/views/jbpm/utils/flowable.json';
import JbpmHeader from "@/views/jbpm/JbpmHeader.vue";
import JbpmPropertyPanel from "@/views/jbpm/panel/JbpmPropertyPanel.vue";
import {error, success, warning} from "@/utils/message";
import {getRequest, postRequest} from "@/api/star_horse";
import lintModule from 'bpmn-js-bpmnlint';
import * as bpmnlintConfig from '@/views/jbpm/packed-config';
import "bpmn-js/dist/assets/diagram-js.css" // 左边工具栏以及编辑节点的样式
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css"
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css"
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css"
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import {markRaw, onMounted, ref, unref, watch} from "vue";
import {closeLoad, load} from "@/api/sh_api";
import {useRoute} from "vue-router";

/**
 * https://github.com/bpmn-io/bpmn-js-examples
 * 先删除再安装所需插件
 * yarn remove bpmn-js bpmn-js-bpmnlint bpmn-js-properties-panel bpmn-js-properties-panel bpmn-moddle bpmnlint bpmnlint-loader
 yarn add bpmn-js bpmn-js-bpmnlint bpmn-js-properties-panel bpmn-js-properties-panel bpmn-moddle bpmnlint bpmnlint-loader
 */
const mergeUrl = ref("/flow-engine/workflow/flowdefinition/merge");
const mergeDraftUrl = ref("/flow-engine/workflow/flowdefinition/mergeDraft");
const batchMergeUrl = ref("/flow-engine/workflow/flowdefinition/mergeBatch");
const batchMergeDraftUrl = ref("/flow-engine/workflow/flowdefinition/mergeBatchDraft");
const loadByIdUrl = ref("/flow-engine/workflow/flowdefinition/getById");
const isPreivew = ref(false);
let bpmnModeler: any = null;
const initData = ref({});
const formId = ref(null);
const isEdit = ref(1);
const product = ref("flowable");
const initTemplate = ref("");
const container = ref(null);
const canvas = ref(null);
const router = useRoute();
const createXml = (str: string) => {
  if (document.all) {
    var xmlDom = new ActiveXObject("Microsoft.XMLDOM")
    xmlDom.loadXML(str);
    return xmlDom;
  } else {
    return new DOMParser().parseFromString(str, "text/xml");
  }
};
const loadById = (id: any, isView: boolean) => {
  load("数据加载中");
  getRequest(loadByIdUrl + (isView ? "ForView" : "") + "/" + id).then(res => {
    let redata = res.data.data;
    if (!redata) {
      warning("未找到对应数据");
    }
    // let title = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
    initTemplate.value = redata.flowXml.split("?>")[1];
    initData.value = {
      flowName: redata.flowName,
      flowId: redata.flowId,
      isUpdate: true,
      processTypeList: [
        {name: "请假", value: "001"},
        {name: "报销", value: "002"},
        {name: "聚餐", value: "003"},
      ]
    }
    createNewDiagram(unref(initTemplate));
  }).catch(err => {
    error("接口错误或网络异常:" + err);
  }).finally(() => {
    closeLoad();
  })
};
const createData = () => {
  let processId = new Date().getTime();
  let processName = "UnSaved";
  initTemplate.value = jpbmInit.initTemplate(processName, processId);
  initData.value = {
    flowName: processName,
    flowId: processId,
    isUpdate: false,
    processTypeList: [
      {name: "请假", value: "001"},
      {name: "报销", value: "002"},
      {name: "聚餐", value: "003"},
    ]
  }
};
const flowCheck = () => {
};
const init = () => {
  // canvas.value = _this.$refs.canvas;
  let _moddleExtensions = getModdleExtensions();
  let translatezhCn = {
    translate: ['value', customTranslate]
  };
  if (unref(isPreivew)) {
    bpmnModeler = markRaw(new BpmnViewer({
      container: unref(canvas),
    }));
  } else {
    // 建模
    bpmnModeler = markRaw(new BpmnModeler({
      linting: {
        active: true,
        bpmnlint: bpmnlintConfig
      },
      container: unref(canvas),
      additionalModules: [translatezhCn, lintModule],
      moddleExtensions: _moddleExtensions
    }));
  }
  //createNewDiagram(unref(initTemplate));
  createNewDiagram(xmlStr);
  const linting: any = bpmnModeler.get('linting')
  linting.toggle(true);
  $(".bjs-powered-by").remove();
};
const getModdleExtensions = () => {
  let moddleExtensions = {};
  if (product.value == "flowable") {
    moddleExtensions = {flowable: flowableModdle};
  }
  if (product.value == "activiti") {
    moddleExtensions = {activiti: activitiModele};
  }
  return moddleExtensions;
};
const createNewDiagram = async (xml: string) => {
  // 将字符串转换成图显示出来
  try {
    if (!bpmnModeler) {
      init();
    }
    const result = await bpmnModeler.importXML(xml);
    const {warnings} = result;
    console.log(warnings);
  } catch (err) {
    return;
  }
};
const handleExportBpmn = async () => {
  const {xml} = bpmnModeler.saveXML();
  let {filename, href} = setEncoded('BPMN', xml);
  if (href && filename) {
    let a = document.createElement('a');
    a.download = filename; //指定下载的文件名
    a.href = href; //  URL对象
    a.click(); // 模拟点击
    URL.revokeObjectURL(a.href); // 释放URL 对象
  }
};
const handleExportSvg = async () => {
  const {svg} = await bpmnModeler.saveSVG();
  let {filename, href} = setEncoded('SVG', svg);
  if (href && filename) {
    let a = document.createElement('a');
    a.download = filename;
    a.href = href;
    a.click();
    URL.revokeObjectURL(a.href);
  }
};
const setEncoded = (type: String, data: any) => {
  const encodedData = encodeURIComponent(data);
  if (data) {
    if (type === 'XML') {
      return {
        filename: 'diagram.bpmn20.xml',
        href: "data:application/bpmn20-xml;charset=UTF-8," + encodedData,
        data: data
      }
    }
    if (type === 'BPMN') {
      return {
        filename: 'diagram.bpmn',
        href: "data:application/bpmn20-xml;charset=UTF-8," + encodedData,
        data: data
      }
    }
    if (type === 'SVG') {
      initData.value.svg = data;
      return {
        filename: 'diagram.svg',
        href: "data:application/text/xml;charset=UTF-8," + encodedData,
        data: data
      }
    }
  }
};
/*const bakeFunction = async () => {
  //事件备份操作
  let eventBus = bpmnModeler.get('eventBus');
  //读取节点属性
  eventBus.on('element.click', function (evt: any) {
    $('#hidNode').val(evt.element.id);
    $('#hidNodeType').val(evt.element.type);
    $('#hidNodeName').val(evt.element.businessObject.name);
  });
  let modeling = bpmnModeler.get('modeling');
  //跟新节点名称 getAll 获取elementRegistry 所有节点
  let shape = bpmnModeler.get('elementRegistry')!.get("nodeId");
  modeling!.updateProperties(shape, {name: "新名称"});
  //改变节点颜色
  let elementToColor = bpmnModeler.get('elementRegistry')!.get('StartEvent_1');
  modeling!.setColor([elementToColor], {
    stroke: 'green',
    fill: 'rgba(0, 80, 0, 0.4)'
  });
  //设置当前节点属性
  bpmnModeler.updateProperties(element, {'attrs:name': '属性名称name'});
  //创建 conditionExpression 条件表达式
  const moddle = bpmnModeler.get('moddle')
  const conditionElement = await moddle.create('bpmn:FormalExpression', {
    body: '${new_start}'
  })
  bpmnModeler.updateProperties(element, {
    conditionExpression: conditionElement
  })
  // 卸载监听事件
  bpmnModeler.off('selection.changed', e => {
  })
  bpmnModeler.off('element.changed', e => {
  })
};*/
const processSave = (data: any) => {
  postRequest(mergeUrl.value, data).then(res => {
    let rdata = res.data;
    if (rdata.code === 0) {
      success(rdata.cnMessage);
    } else {
      warning(rdata.cnMessage);
    }
  }).catch(err => {
    error("接口错误或者网络异常:" + err);
  });
};
const restart = () => {
  createData();
  createNewDiagram(initTemplate.value);
};
onMounted(() => {
  createData();
  init();
});
//路由监听
watch(() => router.query,
    (to, from) => {
      if (to.fullPath?.indexOf("workflowDesign") == -1) {
        return;
      }
      formId.value = to.query?.formId;
      isEdit.value = to.query?.isEdit;
    }, {
      deep: true,
      immediate: true  //第一次是否要监听到
    });
watch(
    () => formId,
    (val) => {
      if (val) {
        // loadById(val, isEdit.value == 2);
      }
    },
    { //id 改变的时候才请求后端
      deep: true,
      immediate: true
    } //第一次是否要监听到
);
</script>
<template>
  <el-card class="inner_content">
    <div class="flow-design">
      <div class="jbpm">
        <jbpm-header :modeler="bpmnModeler" :process-data="initData" @flowCheck="flowCheck"
                     @handleExportBpmn="handleExportBpmn" @handleExportSvg="handleExportSvg"
                     @processSave="processSave" @restart="restart"/>
        <div class="bpmn-container">
          <div class="bpmn-content" ref="canvas"></div>
        </div>
      </div>
<!--      <jbpm-property-panel :modeler="bpmnModeler" :process="initData" v-if="bpmnModeler"/>-->
    </div>
  </el-card>
</template>
<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  width: 100%;
}
.flow-design {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
}
.container {
  height: inherit;
  display: flex;
  border: 1px solid #e3e9f2;
}
.jbpm {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.bpmn-container {
  padding: 10px;
  height: 100%;
  flex: 1;
  .bpmn-content {
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+") repeat !important;
  }
  .canvas {
    width: 100%;
    height: 100%;
  }
}
.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 500px;
}
:deep( .bjs-powered-by) {
  display: none;
}
.container {
  width: 100%;
  height: 100%;
}
</style>
