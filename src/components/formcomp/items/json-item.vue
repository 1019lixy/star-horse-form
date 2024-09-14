<template>
  <star-horse-dialog :title="field.preps['label']+'时间编辑'" :self-func="true"
                     :dialog-visible="dialogInputVisible"
                     @merge="selectItem"
                     @resetForm="resetForm"
                     @closeAction="closeAction">
    <star-horse-form :field-list="jsonTableField" ref="jsonFormRef"/>
  </star-horse-dialog>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <div class="json-comp">
      <div class="json-box">
        <el-input
            :fid="field.preps['name']"
            :clearable="field.preps['clearable']=='Y'"
            :disabled="field.preps['disabled']=='Y'"
            :max="field.preps['max']"
            :maxlength="field.preps['maxlength']"
            :min="field.preps['min']"
            :minlength="field.preps['minlength']"
            :placeholder="field.preps['placeholder']||'请输入'+field.preps['label']"
            :readonly="true"
            :rows="field.preps['rows']|3"
            :show-word-limit="field.preps['showWordLimit']=='Y'"
            :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
            type="textarea"
            resize="none"
            v-on:[actionName]="keyEnterFun(field.preps['actionName'])"
            @keydown.enter="keyEnterFun"
            @focus="keyEnterFun('focus')"
            @blur="keyEnterFun('blur')"
            v-model="context.attrs['formData'][field.preps['name']]"/>
      </div>
      <div class="json-btn" @click="editJsonData" title="编辑数据">
        <star-horse-icon icon-class="edit" style="cursor: pointer"/>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, nextTick, onMounted, reactive, shallowRef} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";

export default defineComponent({
  components: {StarHorseForm, StarHorseIcon},
  setup(_props, context) {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    let dialogInputVisible = shallowRef<boolean>(false);
    let jsonFormRef = shallowRef();
    let jsonTableField = reactive<PageFieldInfo>({
      batchFieldList: [{
        batchName: "jsonDatas",
        fieldList: [{
          label: "Key/键",
          fieldName: "key",
          type: "input",
          required: true,
          formShow: true,
        }, {
          label: "Value/值",
          fieldName: "value",
          type: "input",
          required: true,
          formShow: true,
        }]
      }]
    })
    const dynamicFunction = (data: any) => {
      if (!data) {
        return;
      }
      let fun = new Function(data);
      fun();
    };
    let actionName = shallowRef("keydown.enter");
    const keyEnterFun = (prep: any) => {
      if (prep == actionName.value && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', (prep instanceof KeyboardEvent) ? prep.code.toLowerCase() : prep || actionName.value);
    };
    const editJsonData = async () => {
      let jsonStr = context.attrs['formData'][field.preps['name']];
      let formData: any = {};
      if (jsonStr) {
        let json = JSON.parse(jsonStr);
        let arr = [];
        for (let key in json) {
          arr.push({
            key: key,
            value: json[key]
          });
        }
        formData["jsonDatas"] = arr;
      }
      dialogInputVisible.value = true;
      await nextTick();
      jsonFormRef.value.setFormData(formData);
    }
    const selectItem = async () => {
      let flag = false;
      await jsonFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
        flag = res
      });
      if (!flag) {
        return;
      }
      let formData = jsonFormRef.value.getFormData().value;
      let dataList = formData["jsonDatas"];
      let jsonData = {};
      dataList.forEach((item: any) => {
        jsonData[item.key] = item.value;
      });
      context.attrs['formData'][field.preps['name']] = JSON.stringify(jsonData, null, 4);
      closeAction();
    }
    const resetForm = () => {
      jsonFormRef.value.setFormData({jsonDatas: [{}]});
    }
    const closeAction = () => {
      dialogInputVisible.value = false;
    }
    onMounted(() => {
      actionName.value = field.preps["actionName"];
      keyEnterFun(actionName.value)
    });
    return {
      parentField, context, field, formItem, dataField, dynamicFunction, keyEnterFun, actionName,
      dialogInputVisible, selectItem, closeAction, editJsonData, resetForm, jsonTableField, jsonFormRef

    }
  }
});
</script>
<style lang="scss" scoped>
.json-comp {
  width: 100%;
  display: flex;
  align-items: center;

  .json-box {
    flex: 1;
    margin-right: 5px;

    :deep(.el-input) {
      height: 60px !important;
    }
  }

  .json-btn {
    cursor: pointer;
    border: 1px solid var(--star-horse-style);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
}
</style>
