<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-select
        :fid="field.preps['name']"
        :readonly="field.preps['readonly']=='Y'"
        :automatic-dropdown="field.preps['automaticDropdown']=='Y'"
        :clearable="field.preps['clearable']=='Y'"
        :collapse-tags="field.preps['collapseTags']=='Y'"
        :collapse-tags-tooltip="field.preps['collapseTagsTooltip']=='Y'"
        :default-first-option="field.preps['defaultFirstOption']=='Y'"
        :disabled="field.preps['disabled']=='Y'"
        :filterable="field.preps['filterable']=='Y'"
        :multiple="field.preps['multiple']=='Y'"
        :remote="field.preps['remote']=='Y'||field.preps['dataSource']=='url'"
        :remote-show-suffix="field.preps['remoteShowSuffix']=='Y'"
        :remote-method="remoteMethod"
        :allow-create="field.preps['allowCreate']=='Y'"
        :multiple-limit="field.preps['multipleLimit']"
        :name="field.preps['name']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :tag-type="field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]">
      <el-option :disabled="items['disabled']" :label="items['name']" :value="items['value']"
                 v-for="items in field.preps['values']||context.attrs['formData'][field.preps['name']+'OptionList']"/>
    </el-select>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
import {compDynamicData, createFilter, dynamicUrlOperation} from "@/api/sh_api.ts";
import {SearchParams} from "@/components/types/Params";

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
      try {
        context.emit('selfFunc', prep);
      } catch (e) {
        console.log(e);
      }
    };
    /**
     * 动态获取数据
     */
    const initData = async () => {
      field.preps["values"] = await compDynamicData(field.preps);
    }
    const remoteMethod = async (queryString: string) => {
      let temp = field.preps;
      let dataSource = temp['dataSource'];
      if (dataSource == "url") {
        let searchParams: SearchParams[] = [];
        searchParams.push({
          propertyName: temp["selectLabel"],
          value: queryString,
          operation: "lk"
        });
        temp["values"] = await dynamicUrlOperation(temp, searchParams);
      } else {
        temp["values"] = queryString ? temp['values'].filter(createFilter(queryString)) : temp['values'];
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
      parentField, context, field, formItem,
      dataField, keyEnterFun, actionName, remoteMethod
    }
  }
});
</script>
<style lang="scss" scoped>
.el-select {
  width: 100%;
}
</style>
