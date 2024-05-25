<template>
  <starhorse-form-item
      :form-item = "field"
      :parentField = "parentField"
  >
    <el-autocomplete
        :fid = "field.preps['name']"
        :clearable = "field.preps['clearable']=='yes'"
        :disabled = "field.preps['disabled']=='yes'"
        :readonly = "field.preps['readonly']=='yes'"
        :fetch-suggestions = "querySearch"
        :fit-input-width = "field.preps['fitInputWidth']=='yes'"
        :aria-label = "field.preps['label']"
        :name = "field.preps['name']"
        :size="field?.preps['size']||'small'"
        :placeholder = "field.preps['placeholder']||'请输入'+field.preps['label']"
        :placement = "field.preps['placement']"
        :teleported = "field.preps['teleported']=='yes'"
        :trigger-on-focus = "field.preps['triggerOnFocus']=='yes'"
        :value-key = "field.preps['valueKey']"
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
    const parentField = context.attrs["parentField"];
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
    return {parentField, formFieldList, context, field, formItem, dataField,
      keyEnterFun,querySearch,actionName}
  }
});
</script>

<style scoped>
</style>