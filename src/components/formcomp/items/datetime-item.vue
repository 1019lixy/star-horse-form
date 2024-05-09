<template>
  <starhorse-form-item :formDatas = "formDatas" :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-date-picker
        :fid = "field.preps['name']"
        :clear-icon = "field.preps['clearIcon']"
        :clearable = "field.preps['clearable']=='yes'"
        :default-time = "field.preps['defaultTime']"
        :default-value = "field.preps['defaultValue']||new Date()"
        :disabled = "field.preps['disabled']=='yes'"
        :editable = "field.preps['editable']=='yes'"
        :end-placeholder = "field.preps['endPlaceholder']"
        :format = "field.preps['format']||'YYYY-MM-DD HH:mm:ss'"
        date-format="YYYY-MM-DD"
        time-format="HH:mm"
        :type = "field.preps['type']"
        :placeholder = "field.preps['placeholder']"
        :range-separator = "field.preps['rangeSeparator']"
        :readonly = "field.preps['readonly']=='yes'"
        :size = "field.preps['size']"
        :start-placeholder = "field.preps['startPlaceholder']"
        :value-format = "field.preps['valueFormat']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter = "keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model = "context.attrs['formFieldList'][field.preps['name']]"
    ></el-date-picker>
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