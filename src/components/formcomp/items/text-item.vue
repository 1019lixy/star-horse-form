<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :formItem="field"
                       :parentField="parentField"
  >
    <el-tag
        :type="field?.preps['type']||'primary'"
        :disable-transitions="field?.preps['disableTransitions']=='Y'"
        :hit="field?.preps['hit']=='Y'"
        :color="field?.preps['color']"
        :effect="field?.preps['effect']||'light'"
        :round="field?.preps['round']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        @click="keyEnterFun('click')"
    >
      {{
        context.attrs['formData'][field.preps['name']] || (field.preps['placeholder'] || '请赋值' + field.preps['label'])
      }}
    </el-tag>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";
export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = (prep: any) => {
      if (field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    return {parentField,  context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style scoped>
</style>
