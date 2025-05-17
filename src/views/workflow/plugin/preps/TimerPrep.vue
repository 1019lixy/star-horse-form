<template>
  <el-form label-position="top" :model="node" ref="timerNodeRef">
    <el-form-item prop="waitType" label="等待方式" :rules="rules">
      <el-radio-group v-model="node.waitType">
        <el-radio-button label="固定时长" value="duration"/>
        <el-radio-button label="固定时间" value="date"/>
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="duration" label="等待时长" :rules="rules" v-if="node.waitType === 'duration'">
      <el-input v-model="node.duration" :min="0" :max="9999999" type="number" class="input-with-select">
        <template #append>
          <el-select v-model="node.unit" placeholder="Select" default-first-option style="width: 100px">
            <el-option v-for="(item, i) in timeOptionList" :label="item.name" :value="item.value" :key="i"/>
          </el-select>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="timeDate" :rules="rules" label="指定时间" v-if="activeData.waitType === 'date'">
      <el-date-picker
          v-model="activeData.timeDate"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择等待时间"
      />
    </el-form-item>
  </el-form>

  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import {ModelRef, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance, SelectOption} from "star-horse-lowcode";

defineOptions({
  name: "WritePrep"
});
const rules = [{trigger: "blur", required: true, message: "必填项不能为空"}];
const timeOptionList = ref<SelectOption[]>([
  {name: "秒", value: "PT%sS"},
  {name: "分钟", value: "PT%sM"},
  {name: "小时", value: "PT%sH"},
  {name: "天", value: "P%sD"},
  {name: "周", value: "P%sW"},
  {name: "月", value: "P%sM"}
]);
let node: ModelRef<any> = defineModel("activeData");
const timerNodeRef = ref();
const flowDesign = useFlowDesignStore(piniaInstance);
const onClose = () => {
  flowDesign.setActive(false);
};
/**
 * 保存配置
 */
const onSave = () => {
  timerNodeRef.value.validate((valid: boolean) => {
    if (valid) {
      if (node.value.waitType == "duration" || node.value.duration) {
        node.value.content =
            node.value.duration + timeOptionList.value.find((item) => item.value == node.value.unit)?.name || "";
      }
      if (node.value.waitType == "date") {
        node.value.content = node.value.timeDate;
      }
      onClose();
    }
  });
};
</script>
<style lang="scss" scoped>
:deep(.el-input-group__append) {
  padding: 0 20px !important;
}
</style>
