<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
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
        :show-password="field.preps['showPassword']=='Y'"
        :size="field?.preps['size']||'small'"
        type="password"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]"/>
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
    const dynamicFunction = (data: any) => {
      if (!data) {
        return;
      }
      let fun = new Function(data);
      fun();
    };
    let actionName = shallowRef("keydown.enter");

    const keyEnterFun = (prep: String) => {
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
      parentField, formFieldList, context, field, formItem,
      dataField, dynamicFunction, keyEnterFun, actionName
    }
  }
});


</script>

<style scoped>

</style>
