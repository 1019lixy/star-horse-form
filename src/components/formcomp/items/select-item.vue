<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
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
        :allow-create="field.preps['allowCreate']=='Y'"
        :multiple-limit="field.preps['multipleLimit']"
        :name="field.preps['name']"
        :placeholder="field.preps['placeholder']||'请选择'+field.preps['label']"
        :size="field?.preps['size']||'small'"
        :tag-type="field.preps['tagType']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]">
      <el-option :disabled="items['disabled']" :label="items['name']" :value="items['value']"
                 v-for="items in field.preps['values']||context.attrs['formFieldList'][field.preps['name']+'OptionList']"/>
    </el-select>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";
import {dictData, loadData} from "@/api/sh_api.ts";
import {error} from "@/utils/message.ts";
import {SelectOption} from "@/components/types/SearchProps";

export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("change");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
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
    return {
      parentField, formFieldList, context, field, formItem,
      dataField, keyEnterFun, actionName
    }
  }
});
</script>
<style scoped>
</style>
