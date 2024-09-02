<template>
  <div class="designer-wrap">
    <div class="designer-base-info">
      <div class="base-info-panel">
        <el-form :layout="formLayout">
          <el-form-item label="图标">
            <el-avatar shape="square" size="large" icon="red-envelope"/>
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="flowName" placeholder="请输入名称" :size="flowMixin.size"/>
          </el-form-item>
          <el-form-item label="分组">
            <FlowSimpleSelect v-model="flowGroup" :datas="flowGroups" labelName="label" placeholder="请选择分组"/>
          </el-form-item>
          <el-form-item label="绑定表单">
            <FlowSelect v-model="bindForm" :datas="forms" mode="multiple" labelName="label" placeholder="请选择表单"/>
          </el-form-item>
          <el-form-item v-if="bindForm.length > 1" label="多表单显示模式">
            <el-radio-group :size="flowMixin.size" class="w-fill">
              <el-radio value="1">
                <span>标签栏</span>
              </el-radio>
              <el-radio value="2">
                <span>步进式</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="谁可以管理这个审批">
            <!-- <UserSelector type="button" /> -->
          </el-form-item>
          <el-form-item label="说明">
            <el-input type="textarea" :size="flowMixin.size" :rows="4" placeholder="说明"/>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import FlowSelect from '@/views/workflow/plugin/Component/FlowSelect.vue';
import FlowSimpleSelect from '@/views/workflow/plugin/Component/FlowSimpleSelect.vue';
import {computed, ref} from "vue";
import {flowMixin} from "@/views/workflow/plugin/mixins/flowMixin.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const props = defineProps({
  navable: {
    type: Boolean,
    default: true,
  },
  readable: {
    type: Boolean,
    default: false,
  },
});
const flowDesign = useFlowDesign(piniaInstance);
const emits = defineEmits(["publish"]);
const nodeData = computed(() => flowDesign.node);
let buttonName = ref<string>('保存');
let formLayout = ref<string>('vertical');
let flowName = ref<string>('');
let flowGroup = ref<string>('');
let bindForm = ref<Array<any>>([]);
let flowGroups = ref<Array<any>>([
  {label: '人事', value: '人事'},
  {label: '考勤', value: '考勤'},
  {label: '行政', value: '行政'},
  {label: '财务', value: '财务'},
  {label: '薪酬', value: '薪酬'},
  {label: '资产', value: '资产'},
]);
let forms = ref<Array<any>>([
  {label: '请假表单', value: '人事表单'},
  {label: '加班表单', value: '考勤表单'},
  {label: '调休表单', value: '调休表单'},
  {label: '补卡表单', value: '补卡表单'},
  {label: '出差表单', value: '出差表单'},
  {label: '销假表单', value: '销假表单'},
]);
const toReturn = () => {
};
const change = (type) => {
};
const handleSave = () => {
};
const getData = () => {
  return nodeData;
}
const publish = () => {
  emits('publish', nodeData);
}
</script>
