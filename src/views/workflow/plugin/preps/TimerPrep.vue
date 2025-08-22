<template>
  <el-form label-position="top" :model="node" ref="timerNodeRef">
    <el-tabs v-model="timerTab" type="border-card">
      <el-tab-pane key="basic" name="basic" label="节点信息">
        <BasePrep :nodeInfo="node"/>
      </el-tab-pane>
      <el-tab-pane key="timer" name="timer" label="定时器设置">
        <el-form-item prop="waitType" label="等待方式" :rules="rules">
          <el-radio-group v-model="node.waitType">
            <el-radio-button label="固定时长" value="duration"/>
            <el-radio-button label="固定时间" value="date"/>
          </el-radio-group>
        </el-form-item>
        <el-form-item
            prop="duration"
            label="等待时长"
            :rules="rules"
            v-if="node.waitType === 'duration'"
        >
          <el-input
              v-model="node.duration"
              :min="0"
              :max="9999999"
              type="number"
          >
            <template #append>
              <el-select
                  v-model="node.unit"
                  placeholder="Select"
                  default-first-option
                  class="w-[25%]!"
              >
                <el-option
                    v-for="(item, i) in timeOptionList"
                    :label="item.name"
                    :value="item.value"
                    :key="i"
                />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
            prop="timeDate"
            :rules="rules"
            label="指定时间"
            v-if="activeData.waitType === 'date'"
        >
          <el-date-picker
              v-model="activeData.timeDate"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择等待时间"
          />
        </el-form-item>
      </el-tab-pane>
    </el-tabs>
  </el-form>
  <DrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import {ModelRef, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance, SelectOption} from "star-horse-lowcode";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";

defineOptions({
  name: "WritePrep",
});
const timerTab = ref<string>("basic");
const rules = [{trigger: "blur", required: true, message: "必填项不能为空"}];
const timeOptionList = ref<SelectOption[]>([
  {name: "秒", value: "PT%sS"},
  {name: "分钟", value: "PT%sM"},
  {name: "小时", value: "PT%sH"},
  {name: "天", value: "P%sD"},
  {name: "周", value: "P%sW"},
  {name: "月", value: "P%sM"},
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
            node.value.duration +
            timeOptionList.value.find((item) => item.value == node.value.unit)
                ?.name || "";
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
  width: 20%;
}
</style>
