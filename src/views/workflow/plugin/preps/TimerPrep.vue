<template>
  <el-form label-position="top" :model="node" ref="timerNodeRef">
    <el-form-item prop="waitType" label="等待方式"
                  :rules="rules">
      <el-radio-group v-model="node.waitType">
        <el-radio-button label="固定时长" value="duration"/>
        <el-radio-button label="固定时间" value="date"/>
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="duration" label="等待时长" :rules="rules"
                  v-if="node.waitType === 'duration'">
      <el-input
          v-model.number="node.duration"
          :min="0"
          :max="9999999"
          type="number"
          class="input-with-select"
      >
        <template #append>
          <el-select v-model="node.unit" placeholder="Select" style="width: 100px">
            <el-option label="秒" value="PT%sS"></el-option>
            <el-option label="分钟" value="PT%sM"></el-option>
            <el-option label="小时" value="PT%sH"></el-option>
            <el-option label="天" value="P%sD"></el-option>
            <el-option label="周" value="P%sW"></el-option>
            <el-option label="月" value="P%sM"></el-option>
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
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

defineOptions({
  name: 'WritePrep',
})
const rules = [{trigger: 'blur', required: true, message: '必填项不能为空'}];
let node: ModelRef<any> = defineModel("activeData");
let visible = ref<boolean>(false);
const timerNodeRef = ref();
const flowDesign = useFlowDesign(piniaInstance);

const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  timerNodeRef.value.validate((valid: boolean) => {
    node.value.error = !valid;
    if (valid) {
      onClose();
    }
  });
}
</script>
<style lang="scss" scoped>
:deep(.el-input-group__append) {
  padding: 0 20px !important;
}
</style>
