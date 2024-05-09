<template>
  <starhorse-form-item :formDatas = "formDatas" :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-button
        :autofocus = "field?.preps['autofocus']=='yes'"
        :bg = "field?.preps['bg']=='yes'"
        :circle = "field?.preps['circle']=='yes'"
        :disabled = "field?.preps['disabled']=='yes'"
        :icon = "field?.preps['icon']"
        :link = "field?.preps['link']=='yes'"
        :loading = "field?.preps['loading']=='yes'"
        :loading-icon = "field?.preps['loadingIcon']"
        :native-type = "field?.preps['nativeType']"
        :plain = "field?.preps['plain']=='yes'"
        :round = "field?.preps['round']=='yes'"
        :size = "field?.preps['size']"
        :text = "field?.preps['text']=='yes'"
        @click = "dynamicFunc(field?.preps['click'])"
        :type = "field?.preps['type']">{{ field?.preps["btnLabel"] }}
    </el-button>
  </starhorse-form-item>
</template>

<script lang = "ts" name = "buttonItem">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(props, context) {

    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = () => {
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    const dynamicFunc = (code: any) => {
      let func = new Function(code);
      func.call(this);
    };
    return {parentCompType, formFieldList, dynamicFunc, context, field, formItem, formDatas, dataField, selectItem}
  }
});

</script>

<style scoped>

</style>