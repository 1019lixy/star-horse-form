<template>
  <starhorse-form-item
      :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']"
      :form-item="field"
      :parentField="parentField"
  >
    <el-autocomplete
        :fid="field.preps['name']"
        :clearable="field.preps['clearable']=='Y'"
        :disabled="field.preps['disabled']=='Y'"
        :readonly="field.preps['readonly']=='Y'"
        :fetch-suggestions="querySearch"
        :fit-input-width="field.preps['fitInputWidth']=='Y'"
        :aria-label="field.preps['label']"
        :name="field.preps['name']"
        :hide-loading="false"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :placement="field.preps['placement']"
        :teleported="field.preps['teleported']=='Y'"
        :trigger-on-focus="field.preps['triggerOnFocus']=='Y'"
        :value-key="field.preps['valueKey']||'name'"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @select="handSelect"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
import {compDynamicData, dynamicUrlOperation, createFilter} from "@/api/sh_api.ts";
import {SearchParams} from "@/components/types/Params";

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
    /**
     * 动态获取数据
     */
    const initData = async () => {
      field.preps["values"] = await compDynamicData(field.preps);
    }
    onMounted(() => {
      initData();
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    const querySearch = async (queryString: string, cb: (arg: any) => void) => {
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
        cb(temp["values"]);
      } else {
        const results = queryString ? temp['values'].filter(createFilter(queryString)) : temp['values'];
        cb(results);
      }
    }

    const handSelect = (item: Record<string, any>) => {
      console.log(item);
    }
    return {
      parentField,  context, field, formItem, dataField,
      keyEnterFun, querySearch, actionName, handSelect
    }
  }
});
</script>
<style scoped>
</style>
