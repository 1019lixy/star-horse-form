<script lang="ts" setup name="JbpmHeader">
import {postRequest} from "@/api/star_horse";
import {warning} from "@/utils/message";
import {PropType, ref, unref} from "vue";
import {buttonList} from "@/views/jbpm/utils/FlowData.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

const scale = ref<number>(1.0);
const dialogTableVisible = ref<boolean>(false);
const labelPosition = ref<string>("top");
let ruleForm = ref<any>({});
const canRedo = ref<any>(false);
const rules = {};
const props = defineProps({
  processData: {
    type: Object as PropType<any>,
  },
  modeler: {
    type: Object,
    default: null
  },
});
const emits = defineEmits(["flowCheck", "processSave", "restart", "handleExportSvg", "handleExportBpmn"]);
const confirm = (type: any) => {
  dialogTableVisible.value = !dialogTableVisible.value;
  ruleForm.value = props.processData;
};
const checkFlow = () => {
  emits("flowCheck");
};
/**
 *
 * @param type 2 垂直对齐 1 水平对齐
 */
const elementAlign = (type: any) => {
  // warning("功能开发中");
//   // props.modeler.get("alignElements").trigger("bottom");
//  //let modeling= props.modeler.get("modeling");
//   //props.modeler.get("elements.align").trigger("bottom");
//   props.modeler.get("modeling").autoPlace();
//   //alignElements.trigger(Elements, type);
// const AlignElements = props.modeler.get("alignElements");
  /**
   * Executes the alignment of a selection of elements
   * 執行元素選擇的對齊
   *
   * @param  {Array} elements 一般爲節點元素
   * @param  {string} type 可用：left|right|center|top|bottom|middle
   */
// AlignElements.trigger(Elements, type);
};
const deploy = async () => {
  let that = this;
  const result_xml = await props.modeler.saveXML();
  const result_svg = await props.modeler.saveSVG();
  const {xml} = result_xml;
  const {svg} = result_svg;
  postRequest("jbpm/deploy", {
    processKey: "test",
    processName: "test",
    resourceName: "test",
    xml: xml,
    svg: svg,
  })
      .then((data: any) => {
      })
      .catch((err) => {
        warning(err);
      });
};
const save = async (type: any) => {
  const result_xml = await props.modeler.saveXML();
  const result_svg = await props.modeler.saveSVG();
  const {xml} = result_xml;
  const {svg} = result_svg;
  ruleForm.validate((valid: boolean) => {
    if (!valid) {
      return;
    }
    if (type > 0) {
      if (ruleForm["typeCode"]) {
        let type = props.processData!.processTypeList.find(
            (itm: any) => itm.value === ruleForm["typeCode"]
        );
        ruleForm["typeName"] = type.name;
      }
      ruleForm["flowXml"] = xml;
      ruleForm["flowSvg"] = svg;
      emits("processSave", ruleForm);
    }
    if (type == 2 || type == 0) {
      dialogTableVisible.value = !dialogTableVisible.value;
    }
  });
};
const reset = () => {
  emits("restart");
};
const downloadSvg = () => {
  emits("handleExportSvg");
};
const downloadBpmn = () => {
  emits("handleExportBpmn");
};
const undo = () => {
  props.modeler.get("commandStack").undo();
  canRedo.value = props.modeler.get("commandStack").canRedo();
};
const redo = () => {
  if (!unref(canRedo)) {
    return;
  }
  props.modeler.get("commandStack").redo();
  canRedo.value = props.modeler.get("commandStack").canRedo();
};
const zoom = (val: any) => {
  let newScale = !val ? 1.0 : unref(scale) + val <= 0.2 ? 0.2 : unref(scale) + val;
  props.modeler.get("canvas").zoom(newScale);
  scale.value = newScale;
};

let active = ref<boolean>(false);
const exec = () => {
  console.log(props.modeler.get("toggleMode"));
  active.value = !active.value;
  props.modeler.get("toggleMode").toggleMode(active.value);
  const simulationSupport = props.modeler.get('simulationSupport');
// enable simulation
  if (active.value) {
    simulationSupport.toggleSimulation(active);
    // 获取BPMN模拟器中的ElementRegistry对象
    const elementRegistry = props.modeler.get('elementRegistry');
// 获取所有的开始事件节点
    const startEvents = elementRegistry.filter((element: any) => {
      return element.type === 'bpmn:StartEvent';
    });
    simulationSupport.triggerElement(startEvents.id);

  }

}
const actionOperation = async (actionName: string) => {
  console.log(actionName, props.modeler.get('canvas'));
  if (actionName == "newFile") {
    props.modeler.get('eventBus').fire('diagram.clear');
    // props.modeler.get('eventBus').fire('diagram.init');
    // 新建一个空白BPMN图表
    const newDiagram = await props.modeler.createDiagram();
    // 渲染图表
    props.modeler.importDiagram(newDiagram);
  }
};
</script>
<style lang="scss" scoped>
.inner_button {
  height: 40px;
  text-align: left;
  justify-content: flex-start;
  background-color: #fafafa;
  border: solid 1px #ccc;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
<template>
  <div>
    <el-dialog
        :center="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :lock-scroll="true"
        title="保存模型"
        top="20px"
        v-model="dialogTableVisible"
        width="50%"
    >
      <el-form
          :label-position="labelPosition"
          :model="ruleForm"
          :rules="rules"
          class="demo-ruleForm"
          ref="ruleForm"
      >
        <el-form-item label="类别" prop="typeCode" required>
          <el-select placeholder="请选择分类" v-model="ruleForm.typeCode">
            <el-option
                :key="item.value"
                :label="item.name"
                :value="item.value"
                v-for="item in processData.processTypeList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="flowName" required>
          <el-input
              clearable
              placeholder="请输入名称"
              v-model="ruleForm.flowName"
          ></el-input>
        </el-form-item>
        <el-form-item label="Key" prop="flowId" required>
          <el-input
              clearable
              placeholder="请输入Key"
              v-model="ruleForm.flowId"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              clearable
              placeholder="请输入描述"
              type="textarea"
              v-model="ruleForm.description"
          ></el-input>
        </el-form-item>
        <el-form-item prop="saveForNew">
          <el-checkbox label="保存为最新版本" v-model="ruleForm.saveForNew"/>
        </el-form-item>
      </el-form>
      <el-row>
        <el-col :span="12">
          <el-button @click="save(0)" link style="background: var(--star-horse-style);color: var(--star-horse-white)">
            取消
          </el-button>
          <el-button @click="save(1)" link style="background: var(--star-horse-style);color: var(--star-horse-white)">
            保存
          </el-button>
          <el-button @click="save(2)" link style="background: var(--star-horse-style);color: var(--star-horse-white)">
            保存并关闭编辑器
          </el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <div class="inner_button">
      <el-menu mode="horizontal" style="height: inherit;width: 100%;">
        <el-menu-item v-for="(item,index ) in buttonList">
          <el-tooltip class="item" :content="item.label" :index="index"
                      effect="dark"
                      placement="bottom">
            <star-horse-icon @click="actionOperation(item.key)" :icon-class="item.icon" size="24px"
                             style="color: var(--star-horse-style)"
            />
          </el-tooltip>
        </el-menu-item>
        <el-menu-item>
          <star-horse-icon @click="exec" icon-class="run" size="24px"
                           style="color: var(--star-horse-style)"
          />
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>
