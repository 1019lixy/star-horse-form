<template>
  <star-horse-dialog :title = "'Crontab 配置器'" :self-func = "true " @resetForm = "resetForm" @closeAction = "close"
                     @merge = "submit"
                     :dialog-visible = "cronVisible">
    <Crontab ref = "cronTabRef" :expression = "context.attrs['formFieldList'][field.preps['name']]"
    />
  </star-horse-dialog>
  <starhorse-form-item  :form-item = "field" :parentCompType = "parentCompType"
  >
    <el-input
        :fid = "field.preps['name']"
        readonly
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter = "keyEnterFun"
        v-model = "context.attrs['formFieldList'][field.preps['name']]">
      <template #append>
        <el-button icon = "Clock" @click = "cronVisible=true"/>
      </template>
    </el-input>
  </starhorse-form-item>
</template>

<script lang = "ts">
import {defineComponent, provide, ref, shallowRef,onMounted} from "vue";
import Crontab from "@/components/cron/Crontab.vue";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";

export default defineComponent({
  components: {Crontab, StarHorseDialog},
  setup(props, context) {
    const parentCompType = context.attrs["parentCompType"];
    const formFieldList = context.attrs["formFieldList"];
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
    onMounted(() => {
      actionName.value = field.preps["actionName"];
    });
    const keyEnterFun = (prep:any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']],context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc');
    };
    const selectItem = (data: any) => {
      context.emit('selectItem', data, parentCompType)
    };
    const resetForm = () => {
      context.attrs['formFieldList'][field.preps['name']] = defaultExpress;
      if (cronTabRef.value) {
        cronTabRef.value.clearCron();
      }

    };
    const close = () => {
      cronVisible.value = false;
    };
    const submit = () => {
      close();
      context.attrs['formFieldList'][field.preps['name']] = recordNewExpress;
    };
    resetForm();
    return {
      parentCompType, formFieldList, context, field, formItem,
       dataField, selectItem, keyEnterFun, cronVisible
      , resetForm, close, submit, cronTabRef,actionName
    }
  }
});


</script>

<style scoped>

</style>