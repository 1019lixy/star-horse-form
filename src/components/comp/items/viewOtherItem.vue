<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

const props = defineProps({
  item: {type: Object as PropType<FieldInfo>, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  try {
    return props.commonFormat(name, dataForm.value[name], null);
  } catch (e) {
    console.log(e);
    return name;
  }
};
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-item v-if="item.type=='comp'" :primaryKey="'id'" v-model:dataForm="dataForm" :item="item"
                   :isView="true"/>
  <div class="item" v-if="item.formShow||item.tableShow||item.viewShow">
    <label>{{ item.label }} :</label>
    <div class="content">
      <el-tooltip :content="dataFormat(item)">
        {{ dataFormat(item) }}
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
