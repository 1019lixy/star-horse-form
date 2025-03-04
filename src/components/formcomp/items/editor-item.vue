<template>
  <starhorse-form-item
    :isDesign="context.attrs['isDesign']"
    :bareFlag="context.attrs['bareFlag']"
    :form-item="field"
    :parentField="parentField"
  >
    <star-horse-editor
      :lang="field.preps?.lang || 'javascript'"
      style="min-height: 200px !important; flex-direction: column !important"
      v-model:value="context.attrs['formData'][field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script lang="ts" name="codeItem">
  import { defineComponent, onMounted, shallowRef } from "vue";
  import StarHorseEditor from "@/components/system/StarHorseEditor.vue";

  export default defineComponent({
    components: { StarHorseEditor },
    setup(_props, context) {
      const parentField = context.attrs["parentField"];

      const field = context.attrs["field"] as any;
      let formItem = shallowRef({ label: "input", required: false });
      let dataField = shallowRef("");
      const itemAction = () => {
        context.emit("selfFunc");
      };
      const init = async () => {};
      const rendered = () => {};
      onMounted(() => {
        init();
      });
      return { parentField, context, field, formItem, dataField, itemAction, rendered };
    }
  });
</script>
<style scoped></style>
