<template>
  {{ nodeElement.type }}
  <star-horse-form v-if="nodeElement.type=='bpmn:UserTask'" :field-list="userTaskNodeField"/>
  <star-horse-form v-if="nodeElement.type=='bpmn:Task'" :field-list="serviceTaskNodeField(nodeElement)"/>
  <star-horse-form v-else-if="nodeElement?.type&&nodeElement.type!='bpmn:UserTask' && nodeElement.type!='bpmn:Task'"
                   :field-list="serviceTaskNodeField(nodeElement)"/>
</template>
<script setup lang="ts" name="NodePropertyPanel">
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {serviceTaskNodeField, userTaskNodeField} from "@/views/jbpm/panel/Fields.ts";

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
  compSize: {type: String, default: "default"},
  tab: {type: String, default: "node"}
});
const emits = defineEmits(["modifyFormData"]);

const updateProperties = (properties: any) => {
  let modeling = props.modeler.get('modeling');
  let shape = props.modeler.get('elementRegistry').get(props.nodeElement.id);
  modeling.updateProperties(shape, properties);
};
const updateId = (name: string) => {
  updateProperties({id: name});
};
const updateName = (name: string) => {
  updateProperties({name: name});
};
const changeServiceType = () => {
};
const changeUserType = () => {
};
const updateSequenceFlow = (val: any) => {
  let newCondition = props.modeler.get("moddle").create('bpmn:FormalExpression', {
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
}
</script>
<style scoped>
</style>

