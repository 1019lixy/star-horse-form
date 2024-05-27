<script setup lang="ts" name="FieldAnalysis">
const props = defineProps({
  container: {type: String, default: ""},
  field: {type: Object, required: true},
  index: {type: Number, required: true, default: 1},
  size: {type: String, default: "small"}
});
</script>

<template>
  <template v-if="field?.compType=='container'&&(field.itemType=='box'||field.itemType=='table')">
    <template v-if="field.preps['elements']?.length>0" v-for="sitem in field.preps['elements']">
      <template v-for="sitem1 in sitem['columns']">
        <template v-for="sitem2 in sitem1.items">
          <FieldAnalysis :index="index" :field="sitem2" :container="container+'>'+field.preps.label"/>
        </template>
      </template>
      <template v-for="sitem2 in sitem.items">
        <FieldAnalysis :index="index" :field="sitem2" :container="container+'>'+field.preps.label"/>
      </template>
    </template>
  </template>
  <template v-else-if="field?.preps">
    <el-row :style="{background:index%2==0?'#f1f1f1':'','margin-top':'5px'}">
      <el-col :span="3">
        <el-tag>{{ container }}</el-tag>
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['label']" :size="size" placeholder="标签名称" clearable/>
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['name']" :size="size" placeholder="属性名称" clearable/>
      </el-col>
      <el-col :span="3">
        <el-row>
          <el-col :span="12">
            <el-input-number v-model="field.preps['maxLength']" :size="size" placeholder="最大长度" min="1"
                             :controls="false"
                             v-if="field.itemType=='input'||field.itemType=='textarea'||field.itemType=='number'"
                             clearable/>
          </el-col>
          <el-col :span="12">
            <el-input-number min="0" v-model="field.preps['precision']" :size="size" placeholder="精度"
                             v-if="field.itemType=='number'" :controls=false clearable/>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="3">
        <el-switch v-model="field.preps['required']" :size="size" active-value="yes" active-text="是"
                   inactive-value="no"
                   inactive-text="否"/>
      </el-col>
      <el-col :span="2">
        <el-switch v-model="field.preps['formShow']" :size="size" active-value="yes" active-text="是"
                   inactive-value="no"
                   inactive-text="否"/>
      </el-col>
      <el-col :span="2">
        <el-switch v-model="field.preps['searchShow']" :size="size" active-value="yes" active-text="是"
                   inactive-value="no"
                   inactive-text="否"/>
      </el-col>
      <el-col :span="2">
        <el-switch v-model="field.preps['tableShow']" :size="size" active-value="yes" active-text="是"
                   inactive-value="no"
                   inactive-text="否"/>
      </el-col>
      <el-col :span="3">
        <el-input v-model="field.preps['defaultValue']" :size="size" placeholder="默认值"/>
      </el-col>
    </el-row>
  </template>
</template>

<style scoped lang="scss">

</style>