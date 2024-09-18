<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-date-picker
        :fid="field.preps['name']"
        :clear-icon="field.preps['clearIcon']"
        :clearable="field.preps['clearable']=='Y'"
        :default-time="field.preps['defaultTime']"
        :default-value="field.preps['defaultValue']||new Date()"
        :disabled="field.preps['disabled']=='Y'"
        :editable="field.preps['editable']=='Y'"
        :end-placeholder="field.preps['endPlaceholder']"
        :format="field.preps['format']||'YYYY-MM-DD HH:mm:ss'"
        date-format="YYYY-MM-DD"
        time-format="HH:mm"
        :type="field.preps['type']"
        :placeholder="field.preps['placeholder']"
        :range-separator="field.preps['rangeSeparator']"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :start-placeholder="field.preps['startPlaceholder']"
        :value-format="field.preps['valueFormat']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formData'][field.preps['name']]"
    ></el-date-picker>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, shallowRef} from "vue";

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
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField, context, field, formItem,
      dataField, keyEnterFun, actionName
    }
  }
});
</script>
<style scoped>
</style>
