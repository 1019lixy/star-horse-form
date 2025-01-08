<template>
  <el-form label-position="top">
    <el-form-item prop="waitType" label="等待方式">
      <el-radio-group v-model="activeData.waitType">
        <el-radio-button label="固定时长" value="duration"/>
        <el-radio-button label="固定时间" value="date"/>
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="duration" label="等待时长" v-if="activeData.waitType === 'duration'">
      <el-input
          v-model.number="activeData.duration"
          :min="0"
          :max="9999999"
          type="number"
          class="input-with-select"
      >
        <template #append>
          <el-select v-model="activeData.unit" placeholder="Select" style="width: 100px">
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
    <el-form-item prop="duration" label="指定时间" v-if="activeData.waitType === 'date'">
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
import AuthForm from '@/views/workflow/plugin/common/AuthForm.vue';
import {ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

defineOptions({
  name: 'WritePrep',
})
let node: ModelRef<any> = defineModel("activeData");
let visible = ref<boolean>(false);

const flowDesign = useFlowDesign(piniaInstance);

const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  if (node.value.privileges && node.value.privileges.length > 0) {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: '已设置'});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
    onClose();
  } else {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: null});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
  }

}
</script>
<style lang="scss" scoped>
:deep(.el-input-group__append) {
  padding: 0 20px !important;
}
</style>
