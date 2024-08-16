<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field" :parentField="parentField"
  >
    <el-input
        :fid="field.preps['name']"
        :clearable="field.preps['clearable']=='Y'"
        :disabled="field.preps['disabled']=='Y'"
        :max="field.preps['max']"
        :maxlength="field.preps['maxlength']"
        :min="field.preps['min']"
        :minlength="field.preps['maxlength']"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :readonly="field.preps['readonly']=='Y'"
        :rows="field.preps['rows']"
        :show-word-limit="field.preps['showWordLimit']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        type="textarea"
        :resize="field?.preps['resize']||'--'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"/>
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
    const dynamicFunction = (data: any) => {
      if (!data) {
        return;
      }
      let fun = new Function(data);
      fun();
    };
    let actionName = shallowRef("keydown.enter");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', (prep instanceof KeyboardEvent) ? prep.code.toLowerCase() : prep || actionName.value);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      keyEnterFun(actionName.value)
    });
    return {
      parentField,  context, field, formItem, dataField, dynamicFunction, keyEnterFun, actionName
    }
  }
});
</script>
<style scoped>
</style>
