<template>
  <starhorse-form-item :formDatas="formDatas" :isDesign="context.attrs['isDesign']" :form-item="field"
                       :parentCompType="parentCompType"
  >
    <el-input
        :autocomplete="field.preps['autocomplete']=='yes'"
        :clearable="field.preps['clearable']=='yes'"
        :disabled="field.preps['disabled']=='yes'"
        :max="field.preps['max']"
        :maxlength="field.preps['maxlength']"
        :min="field.preps['min']"
        :minlength="field.preps['maxlength']"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :readonly="field.preps['readonly']=='yes'"
        :size="field.preps['size']"
        type="text"
        :fid="field.preps['name']"
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
  emits: ["selectItem", "selfFunc"],
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"];
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");

    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const dynamicFunction = (funcName: String, data: any) => {
      if (!data) {
        return;
      }
      try {
        let fun = new Function(data);
        fun.call(this);
      } catch (e) {
        console.error(e);
      }
    };

    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {
      parentCompType, formFieldList, context, field, formItem,
      formDatas, dataField, dynamicFunction, selectItem, keyEnterFun, actionName
    }
  }
});


</script>

<style scoped>

</style>