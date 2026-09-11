<script lang="ts" setup>

import {i18n} from "@/lang";
import ExtToolbarButton from "./ExtToolbarButton.vue";
import {ref} from "vue";
import {FormConfig} from "@/components/types";
import {closeLoad, ContainerFieldInfo, error, FieldInfo, load, postRequest, success, warning} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import PublishFormDialog from "@/components/system/items/form/dialogs/PublishFormDialog.vue";

const props = defineProps<{
  /** 与设计器一致的 FormConfig（取 primaryKey） */
  optional?: FormConfig;
  advancedTabs?: ContainerFieldInfo[];
  formBasicProps?: FieldInfo[];
  /** 主键兜底（与 StarHorseFormDesign.primaryKey 一致） */
  primaryKey?: string;
}>();
const designForm = getDesignFormStore();
const publishDialogRef = ref();
const configDialogVisible = ref(false);
const saveData = (isDraft: boolean, data: any) => {
  load(i18n("dyform.sample.submitting"));
  postRequest(`${props.optional?.api?.basePrefix}/${isDraft ? "mergeDraft" : "merge"}`, data)
      .then((res: any) => {
        if (res.data.code != 200) {
          warning(res.data.cnMessage);
          return;
        }
        success(res.data.cnMessage);
        dialogVisibleOperation(false);
      })
      .catch((err: any) => {
        error(i18n("dyform.sample.operationError") + err);
      })
      .finally(() => {
        closeLoad();
      });
};

const dialogVisibleOperation = (flag: boolean) => {
  configDialogVisible.value = flag;
  designForm.setShortKeyDisabled(flag);
}
</script>

<template>
  <ExtToolbarButton
      icon="save"
      :label="i18n('dyform.action.save')"
      @click="dialogVisibleOperation(true)"
  />
  <PublishFormDialog
      ref="publishDialogRef"
      v-model="configDialogVisible"
      :optional="optional"
      :advancedTabs="advancedTabs"
      :formBasicProps="formBasicProps"
      @save="saveData"
      @close="dialogVisibleOperation(false)"
  />
</template>

<style scoped lang="scss">

</style>
