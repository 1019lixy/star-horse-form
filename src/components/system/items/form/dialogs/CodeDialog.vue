<script setup lang="ts">
import { i18n } from "@/lang/index.js";
import CodeComp from "@/components/system/items/form/components/code/CodeComp.vue";
import { FormConfig } from "@/components/types";
import {ref, watch} from "vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const props = defineProps<{
  visible: boolean;
  optional: FormConfig;
}>();

const closeAction = () => {
  emit("close");
};
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const codeDoSave = () => {
  emit("save");
};
</script>

<template>
  <star-horse-dialog
    v-model="dialogVisible"
    @closeAction="closeAction"
    :selfFunc="true"
    :source="3"
    :full-screen="true"
    :compSize="props.optional?.compSize ?? 'default'"
    @merge="codeDoSave"
    boxHeight="80%"
    :title="i18n('dyform.code.dialog.title')"
  >
    <code-comp :optional="optional" />
  </star-horse-dialog>
</template>
