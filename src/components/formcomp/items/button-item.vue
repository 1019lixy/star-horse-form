<template>
  <starhorse-form-item :isDesign="context.attrs['isDesign']" :bareFlag="context.attrs['bareFlag']" :form-item="field"
                       :parentField="parentField"
  >
    <el-button
        :autofocus="field?.preps['autofocus']=='Y'"
        :bg="field?.preps['bg']=='Y'"
        :circle="field?.preps['circle']=='Y'"
        :disabled="!context.attrs['formData']['_'+field.preps['name']+'Editable']&&field?.preps['disabled']=='Y'"
        :link="field?.preps['link']=='Y'"
        :loading="field?.preps['loading']=='Y'"
        :loading-icon="field?.preps['loadingIcon']"
        :native-type="field?.preps['nativeType']"
        :plain="field?.preps['plain']=='Y'"
        :round="field?.preps['round']=='Y'"
        :size="context.attrs.formInfo?.size||field?.preps['size']||'default'"
        :text="field?.preps['text']=='Y'"
        @click="dynamicFunc(field?.preps['click'])"
        :type="field?.preps['type']">
      <star-horse-icon v-if="field?.preps['icon']" :icon-class="field?.preps['icon']"
                       style="vertical-align: middle;color:var(--star-horse-style)"/>
      {{ field?.preps["label"] }}
    </el-button>
  </starhorse-form-item>
</template>
<script lang="ts" name="buttonItem">
import {defineComponent, onMounted, shallowRef} from 'vue';
import StarHorseIcon from '@/components/comp/StarHorseIcon.vue';
import {userFunction} from '@/api/user_func.ts';
import {buttonAction} from '@/components/formcomp/utils/ItemRelationEventUtils.ts';

export default defineComponent({
  components: {StarHorseIcon},
  setup(_props, context) {
    const parentField = context.attrs['parentField'];
    const field = context.attrs['field'] as any;
    let formItem = shallowRef({label: 'input', required: false});
    let dataField = shallowRef('');
    let actionName = shallowRef('click');
    onMounted(() => {
       actionName.value = field.preps?.actionName || 'keydown.enter';;
    });
    const dynamicFunc = (code: any) => {
      buttonAction(context, code);
    };
    return {parentField, dynamicFunc, context, field, formItem, dataField};
  }
});
</script>
<style lang="scss" scoped>
:deep(.el-icon) {
  display: none;
}
</style>
