<template>
  <starhorse-form-item
    :isDesign="context.attrs['isDesign']"
    :bareFlag="context.attrs['bareFlag']"
    :form-item="field"
    :parentField="parentField"
  >
    未知组件。。。。。。。。。。。。。。。
  </starhorse-form-item>
</template>
<script lang="ts">
  import { defineComponent, shallowRef } from "vue";

  export default defineComponent({
    setup(_props, context) {
      const parentField = context.attrs["parentField"];

      const field = context.attrs["field"] as any;
      let formItem = shallowRef({ label: "input", required: false });
      let dataField = shallowRef("");
      return { parentField, context, field, formItem, dataField };
    }
  });
</script>
<style scoped></style>
