<template>
  <star-horse-dialog :title="'Crontab 配置器'" :self-func="true " @resetForm="resetForm" @closeAction="close"
                     @merge="submit"
                     :dialog-visible="cronVisible">
    <Crontab ref="cronTabRef" :expression="context.attrs['formData'][field.preps['name']]"
    />
  </star-horse-dialog>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :form-item="field" :parentField="parentField"
  >
    <el-input
        :fid="field.preps['name']"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'small'"
        readonly
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        v-model="context.attrs['formData'][field.preps['name']]">
      <template #append>
        <el-button icon="Clock" @click="cronVisible=true"/>
      </template>
    </el-input>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, onMounted, provide, ref, shallowRef} from "vue";
import Crontab from "@/components/cron/Crontab.vue";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
export default defineComponent({
  components: {Crontab, StarHorseDialog},
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formData = context.attrs["formData"];
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
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc');
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
        keyEnterFun(actionName.value);
      }
    });
    return {
      parentField,  context, field, formItem,
      dataField, keyEnterFun, cronVisible
      , resetForm, close, submit, cronTabRef, actionName
    }
  }
});
</script>
<style scoped>
</style>
