<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

const props = defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
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
  <el-row v-if="item instanceof Array" :gutter="10">
    <el-col :span="sitem.colspan||sitem.preps?.colspan||(24/item.length)" v-for="sitem in item">
      <div class="item" v-if="sitem.formShow||sitem.tableShow||sitem.viewShow">
        <label>{{ sitem.label }} :</label>
        <div class="content">
          <el-tooltip :content="dataFormat(sitem)">
            {{ dataFormat(sitem) }}
          </el-tooltip>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

</style>
