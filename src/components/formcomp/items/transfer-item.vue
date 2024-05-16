<template>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-transfer
        :fid = "field.preps['name']"
        :button-texts = "field.preps['buttonTexts']"
        :data = "field.preps['values']"
        :filter-method = "field.preps['filterMethod']"
        :props = "{key:field.preps['dataSource']=='url'?field.preps['selectValue']:'value',
        label:field.preps['dataSource']=='url'?field.preps['selectLabel']:'name'}"
        :filter-placeholder = "field.preps['filterPlaceholder']||'请输入'+field.preps['label']"
        :filterable = "field.preps['filterable']=='yes'"
        :format = "field.preps['format']"
        :target-order = "field.preps['targetOrder']"
        :titles = "field.preps['titles']"
        :size="field?.preps['size']||'small'"
        :left-default-checked = "JSON.parse(field.preps['leftDefaultChecked'])"
        :right-default-checked = "JSON.parse(field.preps['rightDefaultChecked'])"
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
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("keydown.enter");
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep:String) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc',prep);
    };

    return {parentCompType, formFieldList, context, field, formItem,
       dataField,  keyEnterFun,actionName
    }
  }
});
</script>

<style scoped>

</style>