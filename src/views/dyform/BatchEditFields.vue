<script setup lang="ts" name="BatchEditFields">
import {computed, reactive} from "vue";
import {batchModifyAction, piniaInstance, useDesignFormStore} from "star-horse-lowcode";
import {Config} from "@/api/settings";

defineProps({
  compSize: {type: String, default: Config.compSize},
})
let designForm = useDesignFormStore(piniaInstance);
const list = computed(() => designForm.compList);
let batchModifyData = reactive<any>({
  maxLength: 100,
  precision: 0,
  required: "N",
  formVisible: true,
  searchVisible: true,
  listVisible: true
});
const batchOperation = (val: any, fieldName: string) => {
  batchModifyAction(list.value, val, fieldName);
};
</script>
<template>
  <el-row style="font-weight: bold; font-size: 12px; margin: 5px 0">
    <el-col :span="3">容器名称</el-col>
    <el-col :span="3">标签名称</el-col>
    <el-col :span="3">属性名称</el-col>
    <el-col :span="3">最大长度/精度</el-col>
    <el-col :span="3">是否必须</el-col>
    <el-col :span="2">表单显示</el-col>
    <el-col :span="2">查询显示</el-col>
    <el-col :span="2">列表显示</el-col>
    <el-col :span="3">默认值</el-col>
  </el-row>
  <el-row style="font-weight: bold; font-size: 12px; margin: 10px 0">
    <el-col :span="3">批量设置</el-col>
    <el-col :span="2">--</el-col>
    <el-col :span="2">--</el-col>
    <el-col :span="5">
      <el-row>
        <el-col :span="12">
          <el-input-number
              v-model="batchModifyData.maxLength"
              controls-position="right"
              :size="compSize"
              @change="(val: any) => batchOperation(val, 'maxLength')"
              placeholder="字段长度"
              clearable
          />
        </el-col>
        <el-col :span="12">
          <el-input-number
              v-model="batchModifyData.precision"
              controls-position="right"
              :size="compSize"
              @change="(val: any) => batchOperation(val, 'precision')"
              placeholder="精度"
              clearable
          />
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="3">
      <el-switch
          v-model="batchModifyData.required"
          :size="compSize"
          @change="(val: any) => batchOperation(val, 'required')"
          :active-value=true
          :inactive-value=false
      />
    </el-col>
    <el-col :span="2">
      <el-switch
          v-model="batchModifyData.formVisible"
          :size="compSize"
          @change="(val: any) => batchOperation(val, 'formVisible')"
          :active-value=true
          :inactive-value=false
      />
    </el-col>
    <el-col :span="2">
      <el-switch
          v-model="batchModifyData.searchVisible"
          :size="compSize"
          @change="(val: any) => batchOperation(val, 'searchVisible')"
          :active-value=true
          :inactive-value=false
      />
    </el-col>
    <el-col :span="2">
      <el-switch
          v-model="batchModifyData.listVisible"
          :size="compSize"
          @change="(val: any) => batchOperation(val, 'listVisible')"
          :active-value=true
          :inactive-value=false
      />
    </el-col>
    <el-col :span="3"></el-col>
  </el-row>
  <el-divider content-position="center">字段信息</el-divider>
  <div class="flex-1 overflow-hidden">
    <el-scrollbar height="100%">
      <template v-for="(item, index) in list">
        <template v-if="item.compType == 'container'" v-for="sitem in item.preps['elements']">
          <template v-for="sitem1 in sitem['columns']">
            <template v-for="(sitem2, sindex) in sitem1.items">
              <FieldAnalysis
                  :index="index + sindex + 1"
                  :size="compSize"
                  :field="sitem2"
                  :container="item.preps.label"
              />
            </template>
          </template>
          <template v-for="(sitem2, sindex) in sitem.items">
            <FieldAnalysis
                :index="index + sindex + 1"
                :size="compSize"
                :field="sitem2"
                :container="sitem.label || item.preps.label"
            />
          </template>
        </template>
        <FieldAnalysis
            :index="index + 1"
            :field="item"
            :size="compSize"
            v-if="item.compType == 'item'||item.compType == 'formItem'"
            :container="'--'"
        />
      </template>
    </el-scrollbar>
  </div>
</template>
<style scoped lang="scss">
.el-input-number,
.el-input-number-small {
  width: unset;
}
</style>
