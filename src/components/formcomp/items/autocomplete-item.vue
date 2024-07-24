<template>
  <starhorse-form-item
      :isDesign="context.attrs['isDesign']"
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
        :size="field?.preps['size']||'small'"
        :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
        :placement="field.preps['placement']"
        :teleported="field.preps['teleported']=='Y'"
        :trigger-on-focus="field.preps['triggerOnFocus']=='Y'"
        :value-key="field.preps['valueKey']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
import {dictData, loadData} from "@/api/sh_api.ts";
import {SelectOption} from "@/components/types/SearchProps";
import {error} from "@/utils/message.ts";

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
    /**
     * 动态获取数据
     */
    const initData = async () => {
      let temp = field.preps;
      let dataSource = temp['dataSource'];
      let urlOrDictName = temp['urlOrDictName'];
      let queryParams = temp['queryParams'];
      if (dataSource == "url") {
        let requestParams = [] as any;
        queryParams?.forEach((item: any) => {
          if (!item.name) {
            return;
          }
          requestParams.push({
            propertyName: item.name,
            value: item.value,
            operation: item.matchType
          });
        });
        let url = temp["preinterfaceUrl"] + temp["interfaceUrl"];
        let params = {
          url: url,
          httpMethod: temp.httpMethod || "POST",
          dataType: temp.dataType || "JSON",
          searchInfo: {
            fieldList: requestParams
          }
        }
        url = "/system-config/redirect/execute";
        let validResult = await loadData(url, params);
        if (validResult.error) {
          error(validResult.error);
        } else {
          let reDataList: SelectOption[] = [];
          validResult.data.forEach((item: any) => {
            reDataList.push({name: item[temp["selectLabel"]], value: item[temp["selectValue"]]});
          });
          field.preps["values"] = reDataList;
        }
      } else if (dataSource == "dict") {
        let dicts = await dictData(urlOrDictName);
        if (Object.keys(dicts).length == 0) {
          error("数据字典可能未配置");
        } else {
          field.preps["values"] = dicts;
        }
      }
    }
    onMounted(() => {
      initData();
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    const querySearch = (queryString: string, cb: any) => {
      const results = queryString
          ? field.preps['values'].filter(createFilter(queryString))
          : field.preps['values']
      // call callback function to return suggestions
      cb(results)
    }
    const createFilter = (queryString: string) => {
      return (restaurant: any) => {
        return (
            restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    }
    return {
      parentField, formFieldList, context, field, formItem, dataField,
      keyEnterFun, querySearch, actionName
    }
  }
});
</script>
<style scoped>
</style>
