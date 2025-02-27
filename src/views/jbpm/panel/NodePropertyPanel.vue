<template>
  {{ nodeElement.type }}

  <star-horse-form ref="userTaskFormRef" :outerFormData="outFormData" v-if="nodeElement.type=='bpmn:UserTask'"
                   :field-list="userTaskNodeField"/>
  <star-horse-form ref="taskFormRef" :outerFormData="outFormData" v-if="nodeElement.type=='bpmn:Task'"
                   :field-list="serviceTaskNodeField(nodeElement)"/>
  <star-horse-form ref="otherTaskFormRef" :outerFormData="outFormData"
                   v-else-if="nodeElement?.type&&nodeElement.type!='bpmn:UserTask' && nodeElement.type!='bpmn:Task'"
                   :field-list="serviceTaskNodeField(nodeElement)"/>
</template>
<script setup lang="ts" name="NodePropertyPanel">
import StarHorseForm from '@/components/comp/StarHorseForm.vue';
import {serviceTaskNodeField, userTaskNodeField} from '@/views/jbpm/panel/Fields.ts';
import {computed, ref, watch} from 'vue';
import {Config} from '@/api/settings.ts';

const props = defineProps({
  modeler: {
    type: Object,
    required: true
  },
  nodeElement: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  compSize: {type: String, default: Config.compSize},
  tab: {type: String, default: 'node'}
});
const userTaskFormRef = ref();
const taskFormRef = ref();
const otherTaskFormRef = ref();
const emits = defineEmits(['modifyFormData']);
let outFormData = computed(() => {
  let obj = props.nodeElement.businessObject;
  if (!obj) {
    return {};
  }
  let attr = obj.$attrs;
  return {
    ...attr,
    id: obj.id,
    name: obj.name
  };
});
let userFormData = computed(() => userTaskFormRef?.value?.getFormData().value);
let taskFormData = computed(() => taskFormRef?.value?.getFormData().value);
let otherFormData = computed(() => otherTaskFormRef?.value?.getFormData().value);
const exportData = (formData: any) => {
  console.log('触发', formData);
};
const updateProperties = (properties: any) => {
  console.log('updateProperties', properties);
  let modeling = props.modeler.get('modeling');
  let shape = props.modeler.get('elementRegistry').get(props.nodeElement.id);
  modeling.updateProperties(shape, properties);
};
/**
 * 更新组件信息
 */
const updateCompAttr = () => {
  if (userFormData?.value) {
    updateProperties(userFormData.value);
  }
  if (taskFormData?.value) {
    console.log(taskFormData.value);
    updateProperties(taskFormData.value);
  }
  if (otherFormData?.value) {
    updateProperties(otherFormData.value);
  }
};

const updateSequenceFlow = (val: any) => {
  let newCondition = props.modeler.get('moddle').create('bpmn:FormalExpression', {
    body: val
  });
  updateProperties({conditionExpression: newCondition});
};
const addUser = (properties: any) => {
  updateProperties(properties);
  Object.assign(properties, {
    userType: Object.keys(properties)[0]
  });
  emits('modifyFormData', properties);
};
watch([() => userFormData, () => taskFormData, () => otherFormData],
    () => {
      updateCompAttr();
    }, {deep: true});
</script>
<style scoped>
</style>

