<template>
  <starhorse-form-item :formDatas = "formDatas" :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-cascader
        :fid = "field.preps['name']"
        :clearable = "field.preps['clearable']=='yes'"
        :collapse-tags = "field.preps['collapseTags']=='yes'"
        :collapse-tags-tooltip = "field.preps['collapseTagsTooltip']=='yes'"
        :disabled = "field.preps['disabled']=='yes'"
        :options = "field.preps['values']"
        :placeholder = "field.preps['placeholder']||'请选择'+field.preps['label']"
        :props = "field.preps['props']"
        :separator = "field.preps['separator']"
        :show-all-levels = "field.preps['showAllLevels']=='yes'"
        :size = "field.preps['size']"
        :tag-type = "field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter = "keyEnterFun"
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
    const formDatas = context.attrs["formDatas"];
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep:any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc',prep);
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    return {parentCompType, formFieldList, context, field, formItem,
      formDatas, dataField, selectItem,keyEnterFun,actionName}
  }
});
</script>

<style scoped>

</style>