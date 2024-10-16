<template>
  <star-horse-dialog :title="'Crontab 配置器'" :self-func="true " @resetForm="resetForm" @closeAction="close"
                     @merge="submit"
                     :dialog-visible="cronVisible">
    <Crontab ref="cronTabRef" :expression="context.attrs['formData'][field.preps['name']]"
    />
  </star-horse-dialog>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-input
        :fid="field.preps['name']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        readonly
        @change="itemAction('change')"
        @input="itemAction('input')"
        @keydown.enter="itemAction('enter')"
        @focus="itemAction('focus')"
        @blur="itemAction('blur')"
        v-model="context.attrs['formData'][field.preps['name']]">
      <template #append>
        <el-button icon="Clock" @click="cronVisible=true"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled']=='Y'"/>
      </template>
    </el-input>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, provide, ref, shallowRef} from "vue";
import Crontab from "@/components/cron/Crontab.vue";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";

export default defineComponent({
  components: {Crontab, StarHorseDialog},
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    //  const formData = context.attrs["formData"];
    const field = context.attrs["field"] as any;
    const defaultExpress = "* * * * * * *";
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let cronVisible = ref(false);
    const cronTabRef = ref();
    let recordNewExpress = defaultExpress;
    provide("cronExpress", (val: string) => {
      recordNewExpress = val;
    });
    let actionName = shallowRef("change");
    const itemAction = (prep: any) => {
      allAction(context, prep);
    };
    const resetForm = () => {
      context.attrs['formData'][field.preps['name']] = defaultExpress;
      if (cronTabRef.value) {
        cronTabRef.value.clearCron();
      }
    };
    const close = () => {
      cronVisible.value = false;
    };
    const submit = () => {
      close();
      context.attrs['formData'][field.preps['name']] = recordNewExpress;
    };
    resetForm();
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      if (!context.attrs["isSearch"]) {
        allAction(context, actionName.value, true);
      }
    });
    return {
      parentField, context, field, formItem,
      dataField, itemAction, cronVisible
      , resetForm, close, submit, cronTabRef, actionName
    }
  }
});
</script>
<style lang="scss" scoped>
:deep(.el-input-group__append){
  padding: 0 20px !important;
}
</style>
