<template>
  <star-horse-dialog :title="field.preps['label']+'数据选择'" :self-func="true"
                     :dialog-visible="dialogInputVisible"
                     @merge="selectItem"
                     :box-height="'500px'"
                     @closeAction="closeAction">
    <div style="width: 100%;">
      <user-manage :showButton="false" :cellEditable="false" :dialogInput="true" ref="userTableRef" style="flex:1;"/>
    </div>

  </star-horse-dialog>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField">
    <el-input
        :clearable="field.preps['clearable'] == 'Y'"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field.preps['disabled'] == 'Y'"
        :max="field.preps['max']"
        :maxlength="field.preps['maxlength']"
        :min="field.preps['min']"
        :minlength="field.preps['maxlength']"
        :placeholder="field.preps['placeholder'] || '请输入' + field.preps['label']"
        :prefix-icon="field.preps['prefixIcon']"
        :readonly="field.preps['readonly']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        type="text"
        :fid="field.preps['name']"
        @change="itemAction('change')"
        @keydown.enter="itemAction('enter')"
        @focus="itemAction('focus')"
        @blur="itemAction('blur')"
        v-model="context.attrs['formData'][field.preps['name']]">
      <template #append>
        <star-horse-icon icon-class="search" @click="showVisible" :disabled="field.preps['disabled'] == 'Y'"/>
        <!--        <el-button icon="Search" @click="showVisible"
                           :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
                           :disabled="field.preps['disabled'] == 'Y'"/>-->
      </template>
    </el-input>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, nextTick, shallowRef} from "vue";
import UserManage from "@/views/system/UserManage.vue";
import {FieldMapping} from "@/components/types/PageFieldInfo";
import {isJson} from "@/api/sh_api.ts";
import {warning} from "@/utils/message.ts";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {allAction} from "@/components/formcomp/utils/ItemRelationEventUtils.ts";

export default defineComponent({
  components: {StarHorseIcon, UserManage},
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let userTableRef = shallowRef();
    let dialogInputVisible = shallowRef<boolean>(false);
    let actionName = shallowRef("keydown.enter");
    const itemAction = (prep: any) => {
      allAction(context, prep);
    };
    const selectItem = (row: any) => {
      let data = "";
      let needField = field.preps["needField"];
      if (!row || !isJson(row)) {
        let selectDatas = userTableRef.value.$refs.employeeInfoRef.multipleSelection;
        if (!selectDatas) {
          warning("请选择数据");
          return;
        }
        data = selectDatas[0];
      } else {
        data = row;
      }
      //如果没有指定属性，则默认取相同的属性
      let name = field.preps['name'];
      if (!needField) {
        context.attrs["formData"][name] = data[name];
      } else {
        needField.forEach((item: FieldMapping) => {
          if (needField.length == 1) {
            context.attrs["formData"][name] = data[item.sourceField];
          } else {
            context.attrs["formData"][item.distField] = data[item.sourceField];
          }
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
        userTableRef.value.$refs.employeeInfoRef.setDataInfo(name, context.attrs["formData"][realName]);
      });
    };
    return {
      parentField, context, field, formItem, dataField, closeAction, dialogInputVisible,
      actionName, itemAction, showVisible,
      userTableRef, selectItem
    }
  }
});
</script>
<style lang="less" scoped>

</style>
