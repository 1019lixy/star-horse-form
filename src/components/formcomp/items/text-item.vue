<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :formItem="field"
                       :parentField="parentField"
  >
    <div class="cell-header"  @click="keyEnterFun('click')" v-if="field?.preps['headerFlag']=='Y'">
       <span>{{
           context.attrs['formData'][field.preps['name']] || (field.preps['placeholder'] || field.preps['label'])
         }}</span>
    </div>
    <el-tag
        v-else
        :type="field?.preps['type']||'primary'"
        :disable-transitions="field?.preps['disableTransitions']=='Y'"
        :hit="field?.preps['hit']=='Y'"
        :color="field?.preps['color']"
        :effect="field?.preps['effect']||'light'"
        :round="field?.preps['round']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        @click="keyEnterFun('click')"
    >
      {{
        context.attrs['formData'][field.preps['name']] || (field.preps['placeholder'] || '请赋值' + field.preps['label'])
      }}
    </el-tag>
  </starhorse-form-item>
</template>
<script lang="ts">
import {defineComponent, shallowRef} from "vue";

export default defineComponent({
  setup(_props, context) {
    const parentField = context.attrs["parentField"];

    const field = context.attrs["field"] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef("");
    const keyEnterFun = (prep: any) => {
      if (field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
      }
      context.emit('selfFunc', prep);
    };
    return {parentField, context, field, formItem, dataField, keyEnterFun}
  }
});
</script>
<style lang="scss" scoped>
.cell-header{
  width: 100%;
  height: 100%;


  background: var(--star-horse-font-color);
  span{
    display: flex;
    vertical-align: middle;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-weight: 800;
  }
}
</style>
