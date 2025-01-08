<template>
  <
  <el-form label-position="top">
    <el-form-item prop="implementationType" label="执行类型">
      <!--参照 Flowable ImplementationType-->
      <el-select v-model="activeData.implementationType" placeholder="请选择">
        <el-option label="类" value="class"/>
        <el-option label="表达式" value="expression"/>
        <el-option label="委托表达式" value="delegateExpression"/>
        <el-option label="脚本" value="script"/>
        <el-option label="实例" value="instance"/>
      </el-select>
    </el-form-item>
    <el-form-item prop="implementation" label="执行值">
      <el-input
          type="textarea"
          v-model.number="activeData.implementation"
          clearable
      />
      <help :message="impMsg"/>
    </el-form-item>
  </el-form>
  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";
import Help from "@/components/help.vue";

const impMsg = `
实现 JavaDelegate 接口
类：\${com.example.delegate.MyServiceDelegate}
表达式: \${myServiceDelegate.execute(execution)}
委托表达式：\${myServiceDelegate}
`;
defineOptions({
  name: 'ServicePrep',
})
let node: ModelRef<any> = defineModel("activeData");

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
