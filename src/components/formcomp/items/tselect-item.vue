<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-tree-select
        :fid="field.preps['name']"
        :readonly="field.preps['readonly']=='Y'"
        :show-checkbox="field.preps['showCheckbox']=='Y'"
        :clearable="field.preps['clearable']=='Y'"
        :collapse-tags="field.preps['collapseTags']=='Y'"
        :collapse-tags-tooltip="field.preps['collapseTagsTooltip']=='Y'"
        :default-first-option="field.preps['defaultFirstOption']=='Y'"
        :props="field.preps['props']"
        :disabled="field.preps['disabled']=='Y'"
        :multiple="field.preps['multiple']=='Y'"
        :multiple-limit="field.preps['multipleLimit']"
        :name="field.preps['name']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :size="field?.preps['size']||'small'"
        :data="field.preps['values']||context.attrs['formFieldList'][field.preps['name']+'OptionList']"
        :tag-type="field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]">

    </el-tree-select>

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
    let actionName = shallowRef("keydown.enter");

    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      keyEnterFun(actionName.value);
    });
    return {parentField, formFieldList, context, field, formItem, dataField, keyEnterFun, actionName}
  }
});
</script>

<style scoped>

</style>
