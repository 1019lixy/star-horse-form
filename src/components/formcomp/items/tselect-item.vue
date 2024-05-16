<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-tree-select
        :fid = "field.preps['name']"
        :readonly = "field.preps['readonly']=='yes'"
        :show-checkbox="field.preps['showCheckbox']=='yes'"
        :clearable = "field.preps['clearable']=='yes'"
        :collapse-tags = "field.preps['collapseTags']=='yes'"
        :collapse-tags-tooltip = "field.preps['collapseTagsTooltip']=='yes'"
        :default-first-option = "field.preps['defaultFirstOption']=='yes'"
        :props="field.preps['props']"
        :disabled = "field.preps['disabled']=='yes'"
        :multiple = "field.preps['multiple']=='yes'"
        :multiple-limit = "field.preps['multipleLimit']"
        :name = "field.preps['name']"
        :placeholder = "field.preps['placeholder']||'请选择'+field.preps['label']"
        :size="field?.preps['size']||'small'"
        :data="field.preps['values']"
        :tag-type = "field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter = "keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model = "context.attrs['formFieldList'][field.preps['name']]">

    </el-tree-select>

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

    return {parentCompType, formFieldList, context, field, formItem,  dataField, keyEnterFun,actionName}
  }
});
</script>

<style scoped>

</style>