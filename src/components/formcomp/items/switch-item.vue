<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-switch
        :fid="field.preps['name']"
        :active-color="field.preps['activeColor']"
        :active-text="field.preps['activeText']"
        :active-value="field.preps['activeValue']"
        :before-change="field.preps['beforeChange']"
        :disabled="field.preps['disabled']=='Y'"
        :inactive-color="field.preps['inactiveColor']"
        :inactive-text="field.preps['inactiveText']"
        :inactive-value="field.preps['inactiveValue']"
        :name="field.preps['name']"
        :size="field?.preps['size']||'small'"
        :width="field.preps['width']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("change");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField, formFieldList, context, field, formItem, dataField
      , keyEnterFun, actionName
    }
  }
});
</script>
<style scoped>
</style>
