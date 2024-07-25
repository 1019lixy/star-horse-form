<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField">
    <el-cascader
        :fid="field.preps['name']"
        :clearable="field.preps['clearable']=='Y'"
        :filterable="field.preps['filterable']=='Y'"
        :collapse-tags="field.preps['collapseTags']=='Y'"
        :collapse-tags-tooltip="field.preps['collapseTagsTooltip']=='Y'"
        :disabled="field.preps['disabled']=='Y'"
        :options="field.preps['values']"
        :placeholder="'请选择'+field.preps['label']"
        :props="{
          'multiple':field.preps['multiple']=='Y',
          'checkStrictly':field.preps['checkStrictly']=='Y',
          'expandTrigger':field.preps['expandTrigger']||'click',
          'label':'name',
        }"
        :separator="field.preps['separator']"
        :show-all-levels="field.preps['showAllLevels']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        :tag-type="field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, nextTick, onMounted, shallowRef} from "vue";
import {compDynamicData} from "@/api/sh_api.ts";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    const lazyLoad = (node, resolve) => {

    }
    const initData = async () => {
      await nextTick();
      field.preps["values"] = await compDynamicData(field.preps);
      let data = context.attrs['formData'][field.preps['name']];
      if (data) {
        context.attrs['formData'][field.preps['name']] = JSON.parse(data);
      } else {
        //解决加载慢问题，导致数据没法回显
        setTimeout(() => {
          context.attrs['formData'][field.preps['name']] = JSON.parse(context.attrs['formData'][field.preps['name']]);
        }, 200);
      }
    }
    onMounted(() => {
      initData();
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField,  context, field, formItem,
      dataField, keyEnterFun, actionName, lazyLoad
    }
  }
});
</script>
<style lang="scss" scoped>
:deep(.el-cascader) {
  width: 100%;
}
</style>
