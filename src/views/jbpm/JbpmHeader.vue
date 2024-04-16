<script lang="ts" setup name="JbpmHeader">
import {postRequest} from "@/api/star_horse";
import {warning} from "@/utils/message";
import {PropType, ref, unref} from "vue";

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
//  //let modeling= props.modeler.get("modeling");;
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
</script>

<style scoped></style>
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
          <el-button @click="save(0)" link type="primary">取消</el-button>
          <el-button @click="save(1)" link type="primary">保存</el-button>
          <el-button @click="save(2)" link type="primary">保存并关闭编辑器</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-button-group>
      <el-tooltip class="item" content="发布" effect="dark" placement="bottom">
        <el-button @click="confirm(2)" link type="primary">
          <star-horse-icon icon-class="save"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="检查" effect="dark" placement="bottom">
        <el-button @click="checkFlow" link type="primary">
          <star-horse-icon icon-class="check"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="打开流程文件" effect="dark" placement="bottom">
        <el-button link type="primary">
          <star-horse-icon icon-class="open-file"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="创建新流程图" effect="dark" placement="bottom">
        <el-button @click="reset" link type="primary">
          <star-horse-icon icon-class="new-file"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="下载流程图" effect="dark" placement="bottom">
        <el-button @click="downloadSvg" link type="primary">
          <star-horse-icon icon-class="download"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="下载流程文件" effect="dark" placement="bottom">
        <el-button @click="downloadBpmn" link type="primary">
          <star-horse-icon icon-class="file_download"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="撤销" effect="dark" placement="bottom">
        <el-button @click="undo" link type="primary">
          <star-horse-icon icon-class="undo"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="恢复" effect="dark" placement="bottom">
        <el-button @click="redo" link type="primary">
          <star-horse-icon icon-class="redo"/>
        </el-button>
      </el-tooltip>
      <!--      <el-tooltip class="item" content="水平对齐" effect="dark" placement="bottom">
              <el-button @click="elementAlign(1)" link type="primary">
                <star-horse-icon icon-class="horizontal-align" />
              </el-button>
            </el-tooltip>
            <el-tooltip class="item" content="垂直对齐" effect="dark" placement="bottom">
              <el-button @click="elementAlign(2)" link type="primary">
                <star-horse-icon icon-class="vertical-align" />
              </el-button>
            </el-tooltip>-->
      <el-tooltip class="item" content="放大" effect="dark" placement="bottom">
        <el-button @click="zoom(0.05)" link type="primary">
          <star-horse-icon icon-class="amplify"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="缩小" effect="dark" placement="bottom">
        <el-button @click="zoom(-0.05)" link type="primary">
          <star-horse-icon icon-class="reduce"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" content="重置" effect="dark" placement="bottom">
        <el-button @click="zoom(0)" link type="primary">
          <star-horse-icon icon-class="reset"/>
        </el-button>
      </el-tooltip>
    </el-button-group>
  </div>
</template>


