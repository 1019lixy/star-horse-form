<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field" :parentField="parentField"
  >
    <el-color-picker
        :fid="field.preps['name']"
        :color-format="field.preps['colorFormat']"
        :disabled="field.preps['disabled']=='Y'"
        :show-alpha="field.preps['showAlpha']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("change");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {parentField,  context, field, formItem, dataField, keyEnterFun, actionName}
  }
});
</script>
<style scoped>
</style>
