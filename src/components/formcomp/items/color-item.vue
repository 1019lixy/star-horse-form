<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-color-picker
        :fid = "field.preps['name']"
        :color-format = "field.preps['colorFormat']"
        :disabled = "field.preps['disabled']=='yes'"
        :show-alpha = "field.preps['showAlpha']=='yes'"
        :size = "field.preps['disabled']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model = "context.attrs['formFieldList'][field.preps['name']]"
    />

  </starhorse-form-item>
</template>

<script lang = "ts">
import {defineComponent, onMounted, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("change");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };

    return {parentCompType, formFieldList, context, field, formItem, dataField, keyEnterFun, actionName}
  }
});
</script>

<style scoped>

</style>