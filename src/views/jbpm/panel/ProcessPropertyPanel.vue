<script setup lang="ts" name="ProcessProperty">
import {onMounted, ref} from "vue";

const props = defineProps({
  processData: {
    type: Object,
    required: true
  },
  modeler: {
    type: Object,
    required: true
  },
  element: {
    type: Object,
    required: true
  }
});
let localProcessData = ref<any>();
onMounted(() => {
  localProcessData.value = props.processData;
})
const updateId = (name: string) => {
  props.modeler.get("modeling").updateProperties(props.element, {id: name});
};
const updateName = (name: string) => {
  props.modeler.get("modeling").updateProperties(props.element, {name: name});
};
const updateDesc = (name: string) => {
  let doc = props.modeler.get("bpmnFactory").create("bpmn:Documentation", {text: name});
  props.modeler.get("modeling").updateProperties(props.element, {documentation: [doc]});
};
</script>

<style scoped>

</style>
<template>
  <div>
    <el-form :inline="false"
             :model="localProcessData"
             label-position="left"
             label-width="100px">
      <el-form-item label="流程类别">
        <el-select
            placeholder="请选择分类"
            v-model="localProcessData.typeCode"
        >
          <el-option
              :key="item.value"
              :label="item.name"
              :value="item.value"
              v-for="item in localProcessData.processTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="流程名称">
        <el-input @input="updateName" v-model="localProcessData.flowName"></el-input>
      </el-form-item>
      <el-form-item label="流程ID">
        <el-input @input="updateId" v-model="localProcessData.flowId"></el-input>
      </el-form-item>

      <el-form-item label="流程描述">
        <el-input @input="updateDesc" v-model="localProcessData.description"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
