<template>
  <starhorse-form-item  :form-item="field" :parentField="parentField"
  >
    <el-button
        :autofocus="field?.preps['autofocus']=='yes'"
        :bg="field?.preps['bg']=='yes'"
        :circle="field?.preps['circle']=='yes'"
        :disabled="field?.preps['disabled']=='yes'"
        :icon="field?.preps['icon']||'document'"
        :link="field?.preps['link']=='yes'"
        :loading="field?.preps['loading']=='yes'"
        :loading-icon="field?.preps['loadingIcon']"
        :native-type="field?.preps['nativeType']"
        :plain="field?.preps['plain']=='yes'"
        :round="field?.preps['round']=='yes'"
        :size="field?.preps['size']||'small'"
        :text="field?.preps['text']=='yes'"
        @click="dynamicFunc(field?.preps['click'])"
        :type="field?.preps['type']">
      {{ field?.preps["label"] }}
    </el-button>
  </starhorse-form-item>
</template>

<script lang="ts" name="buttonItem">
import {defineComponent, shallowRef,onMounted} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

export default defineComponent({
  components: {StarHorseIcon},
  setup(props, context) {

    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let actionName = shallowRef("click");

    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });

    const dynamicFunc = (code: any) => {
      if (code) {
        let func = new Function(code);
        func.call(this);
      } else {
        if (field.preps["actions"]) {
          field.preps["actions"](context.attrs['formFieldList']);
        }
        context.emit('selfFunc', context.attrs['formFieldList']);
      }

    };
    return {parentField, formFieldList, dynamicFunc, context, field, formItem, dataField}
  }
});

</script>

<style scoped>

</style>