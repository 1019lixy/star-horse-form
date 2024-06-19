<template>
  <star-horse-dialog :title="field.preps['label']+'数据选择'" :self-func="true"
                     :dialog-visible="dialogInputVisible"
                     @merge="selectItem"
                     @closeAction="closeAction">
    <star-horse-search-comp @searchData="(data)=>dialogInputTableRef.createCreateParams(data)"
                            :formData="field.preps['searchFieldList']"
                            :compUrl="field.preps['dataUrl']"/>
    <star-horse-table-comp :fieldList="field.preps['fieldList']" :primaryKey="field.preps['primaryKey']"
                           :compUrl="field.preps['dataUrl']"
                           ref="dialogInputTableRef"
                           :dialogInput="true"
                           height="400px"
                           :filterCondition="field.preps['filterCondition']"
                           :orderBy="field.preps['orderBy']"
                           @selectItem="selectItem"
                           :dataFormat="field.preps['dataFormat']" :disableAction="true"/>
  </star-horse-dialog>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :formItem="field"
                       :parentField="parentField">
    <el-input
        :clearable="field.preps['clearable'] == 'yes'"
        :disabled="field.preps['disabled'] == 'yes'"
        :max="field.preps['max']"
        :maxlength="field.preps['maxlength']"
        :min="field.preps['min']"
        :minlength="field.preps['maxlength']"
        :placeholder="field.preps['placeholder'] || '请输入' + field.preps['label']"
        :prefix-icon="field.preps['prefixIcon']"
        :readonly="field.preps['readonly']=='yes'"
        :size="field?.preps['size']||'small'"
        type="text"
        :fid="field.preps['name']"
        v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
        @keydown.enter="keyEnterFun"
        @focus="keyEnterFun('focus')"
        @blur="keyEnterFun('blur')"
        v-model="context.attrs['formFieldList'][field.preps['name']]">
      <template #append>
        <el-button icon="Search" @click="showVisible" :size="field?.preps['size']||'small'"
                   :disabled="field.preps['disabled'] == 'yes'"/>
      </template>
    </el-input>
  </starhorse-form-item>
</template>

<script lang="ts">
import {defineComponent, nextTick, onMounted, ref, shallowRef} from "vue";
import {warning} from "@/utils/message";
import {FieldMapping} from "@/components/types/PageFieldInfo";
import {SearchParams} from "@/components/types/Params";

export default defineComponent({
  setup(props, context) {
    const parentField = context.attrs["parentField"];
    const formFieldList = context.attrs["formFieldList"] as any;
    const field = context.attrs["field"] as any;
    const dialogInputTableRef = ref();
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let dialogInputVisible = shallowRef(false);
    let multipleSelection = shallowRef<any>([]);
    // let instance=getCurrentInstance();
    const dynamicFunction = (data: any) => {
      if (!data) {
        return;
      }
      try {
        let fun = new Function(data);
        fun.call(this);
      } catch (e) {
        console.error(e);
      }
    };
    let actionName = shallowRef("keydown.enter");

    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formFieldList'][field.preps['name']], context.attrs['formFieldList']["xh"]);
      }
      context.emit('selfFunc', prep);
    };

    const selectItem = (row: any) => {
      let data = "";
      let needField = field.preps["needField"];
      if (!row) {
        let selectDatas = dialogInputTableRef.value.multipleSelection;
        if (!selectDatas) {
          warning("请选择数据");
          return;
        }
        data = selectDatas[0];
      } else {
        data = row;
      }
      //如果没有指定属性，则默认取相同的属性
      if (!needField) {
        let name = field.preps['name'];
        context.attrs["formFieldList"][name] = data[name];
      } else {
        needField.forEach((item: FieldMapping) => {
          context.attrs["formFieldList"][item.distField] = data[item.sourceField];
        });
      }
      if (field.preps["recall"]) {
        field.preps["recall"](row);
      }

      closeAction();
    };
    const closeAction = () => {
      dialogInputVisible.value = false;
    };
    const showVisible = () => {
      dialogInputVisible.value = true;
      nextTick(() => {
        let fields = field.preps["needField"];
        let name = field.preps['name'];
        let realName = name;
        if (field.preps['aliasName']) {
          realName = field.preps['aliasName'];
        }
        if (fields) {
          name = fields.map((item: FieldMapping) => item.sourceField)[0];
        }
        dialogInputTableRef.value?.setDataInfo(name, context.attrs["formFieldList"][realName]);
      });
    };
    const searchData = (data: SearchParams[]) => {
      dialogInputTableRef.value?.createCreateParams(data);
    };
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      keyEnterFun( actionName.value);
    });
    return {
      parentField, formFieldList, context, field, formItem,
      dataField, dynamicFunction, keyEnterFun, dialogInputVisible, closeAction
      , showVisible, actionName, dialogInputTableRef, searchData, selectItem
    }
  }
});


</script>

<style scoped></style>
