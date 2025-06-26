<script setup lang="ts" name="FieldAnalysis">
import {Config} from "@/api/settings";
import {onMounted, PropType} from "vue";
import {fieldPlaceholder} from "@/views/dyform/utils/ItemPreps";
const props = defineProps({
  container: {type: String, default: ""},
  field: {type: Object as PropType<any>, required: true},
  index: {type: Number, required: true, default: 1},
  size: {type: String, default: Config.compSize}
});
const numberLengthComp: Array<string> = [
  "number",
  "rate",
  "number-range",
  "slider"
]
const exclusionLengthComp: Array<string> = [
  "time",
  "time-picker",
  "datetime",
];
const needBigLengthComp: Array<string> = [
  "textarea",
  "htmleditor",
  "json",
  "json-array",
  "html",
  "signature",
  "markdown"
];
onMounted(() => {
  let preps = props.field.preps;
  if (needBigLengthComp.includes(props.field.itemType)) {
    preps.maxLength = preps.maxLength ?? 2000;
  } else if (props.field.itemType == "switch") {
    preps.maxLength = 20;
  } else if (numberLengthComp.includes(props.field.itemType)) {
    preps.precision = preps.precision ?? 2;
    preps.maxLength = preps.maxLength ?? 15;
  } else if (!exclusionLengthComp.includes(props.field.itemType)) {
    preps.maxLength = preps.maxLength ?? 100;
  }
});
</script>
<template>
  <template v-if="field?.compType == 'container'">
    <template v-if="field.preps['elements']?.length > 0" v-for="sitem in field.preps['elements']">
      <template v-for="sitem1 in sitem['columns']">
        <template v-for="(sitem2, sindex) in sitem1.items">
          <FieldAnalysis :index="index + sindex + 1" :field="sitem2" :container="container + '>' + field.preps.label"/>
        </template>
      </template>
      <template v-for="(sitem2, sindex) in sitem.items">
        <FieldAnalysis :index="index + sindex + 1" :field="sitem2" :container="container + '>' + field.preps.label"/>
      </template>
    </template>
  </template>
  <template v-else-if="field?.preps">
    <el-row :style="{ background: index % 2 == 0 ? '#f1f1f1' : '', 'margin-top': '5px' }">
      <el-col :span="3">
        <el-tag>{{ container }}</el-tag>
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['label']" @input='fieldPlaceholder(field.preps)' :size="size" placeholder="标签名称" clearable/>
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['name']" :size="size" placeholder="属性名称" clearable/>
      </el-col>
      <el-col :span="3">
        <el-row :align="'middle'">
          <el-col :span="12">
            <el-input-number
                v-model="field.preps['maxLength']"
                :size="size"
                placeholder="最大长度"
                min="1"
                :controls="false"
                v-if="!exclusionLengthComp.includes(field.itemType)"
                clearable
            />
          </el-col>
          <el-col :span="12">
            <el-input-number
                min="0"
                v-model="field.preps['precision']"
                :size="size"
                placeholder="精度"
                v-if="numberLengthComp.includes(field.itemType)"
                :controls="false"
                clearable
            />
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="3">
        <el-switch
            v-model="field.preps['required']"
            :size="size"
            :active-value=true
            :inactive-value=false
        />
      </el-col>
      <el-col :span="2">
        <el-switch
            v-model="field.preps['formVisible']"
            :size="size"
            :active-value=true
            :inactive-value=false
        />
      </el-col>
      <el-col :span="2">
        <el-switch
            v-model="field.preps['searchVisible']"
            :size="size"
            :active-value=true
            :inactive-value=false
        />
      </el-col>
      <el-col :span="2">
        <el-switch
            v-model="field.preps['listVisible']"
            :size="size"
            :active-value=true
            :inactive-value=false
        />
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['defaultValue']" :size="size" placeholder="默认值"/>
      </el-col>
    </el-row>
  </template>
</template>
<style scoped lang="scss">
.el-input-number,
.el-input-number-small {
  width: unset;
}
</style>
