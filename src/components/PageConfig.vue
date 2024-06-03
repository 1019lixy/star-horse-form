<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps.d.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

let configInfo = ref<any>({tagsView: 'yes'});
let configStore = GlobalConfig(piniaInstance);
let sizeList = ref<Array<SelectOption>>([
  {name: "大", value: "large"},
  {name: "中", value: "default"},
  {name: "小", value: "small"},
]);
let showTypeList = ref<Array<SelectOption>>([
  {name: "排列展示", value: "line"},
  {name: "下拉展示", value: "dropdown"},
]);
configInfo = computed(() => configStore.configFormInfo);
const init = () => {
  configStore.clearAll();

};
const changeOperation = (val: any) => {
  configStore.setConfigFormInfo(configInfo.value);
};
onMounted(() => {
  init();
});
</script>

<template>
  <el-form :model="configInfo" size="small">
    <el-divider content-position="left">
      <h4>布局</h4>
    </el-divider>
    <el-form-item prop="buttonShowType" label="按钮风格">
      <el-select v-model="configInfo.buttonShowType" @change="changeOperation">
        <el-option v-for="item in showTypeList" :value="item.value" :label="item.name" :key="item.value"/>
      </el-select>
    </el-form-item>
    <el-divider content-position="left">
      <h4>颜色</h4>
    </el-divider>
    <el-form-item label="经典颜色">
    </el-form-item>
    <el-form-item prop="themeColor" label="自定义颜色">
      <el-color-picker v-model="configInfo.themeColor" @change="changeOperation"/>
    </el-form-item>
    <el-divider content-position="left">
      <h4>尺寸</h4>
    </el-divider>
    <el-row>
      <el-col :span="12">
        <el-form-item prop="inputSize" label="组件尺寸">
          <el-select v-model="configInfo.inputSize" @change="changeOperation">
            <el-option v-for="item in sizeList" :value="item.value" :label="item.name" :key="item.value"/>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="buttonSize" label="按钮尺寸 ">
          <el-select v-model="configInfo.buttonSize" @change="changeOperation">
            <el-option v-for="item in sizeList" :value="item.value" :label="item.name" :key="item.value"/>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">
      <h4>菜单</h4>
    </el-divider>
    <el-divider content-position="left">
      <h4>其他配置</h4>
    </el-divider>
    <el-form-item prop="tagsView" label="开启/关闭TagsView ">
      <el-switch v-model="configInfo.tagsView" :active-value="'yes'" inactive-value="'no'" @change="changeOperation">

      </el-switch>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">

</style>
