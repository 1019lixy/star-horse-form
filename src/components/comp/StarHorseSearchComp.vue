<script setup lang="ts" name="StarHorseSearchComp">
import {computed, inject, nextTick, onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {searchMatchList} from "@/api/sh_api";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {SearchParams} from "@/components/types/Params";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

let matchTypeList = ref<SelectOption[]>();
let sarchIcon = ref<String>("search_down");
let defaultSearch = ref<Boolean>(true);
let tips = ref<String>("高级查询");
let showTips = ref<Boolean>(true);
const emits = defineEmits(["searchData"]);
const props = defineProps({
  dialogInput: {type: Boolean, default: false},
  mutComp: {type: Boolean, default: false},
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  formData: {type: Array as PropType<SearchProps[]>, required: true},
});
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "small");
let searchForm: any = inject("searchForm");
const init = async () => {
  matchTypeList.value = searchMatchList();
  searchForm.value ={...analysisDefaultValue()};
  // if (!searchForm && props.dialogInput) {
  //
  // }
  await nextTick();
  //没有隐藏的查询属性，则隐藏掉展开图标
  let fdata = props.formData?.find(item => !item.defaultShow);
  if (!fdata) {
    showTips.value = false;
  }
};
onMounted(() => {
  init();
});
const createCreateParams = (formData: any) => {
  let searchFields = []
  for (let key in searchForm?.value) {
    let val = searchForm.value[key]
    let temp = formData?.find((item: any) => item.fieldName == key);
    //如果子项和父项存在同名会存在bug，
    if (!!val && temp) {
      if (temp?.type == 'datarange') {
        val = [val[0] + ' 00:00:00', val[1] + ' 23:59:59']
      } else if (temp?.type == 'date') {
        val = [val + ' 00:00:00', val + ' 23:59:59']
      }
      let param: SearchParams = {
        propertyName: key,
        operation: temp?.matchType || 'eq',
        value: val
      }
      searchFields.push(param)
    }
  }
  return searchFields;
};
/**
 * 解析默认值
 */
const analysisDefaultValue = () => {
  let defaultDatas = {};
  props.formData?.forEach(item => {
    if (item.defaultValue) {
      defaultDatas[item.fieldName] = item.defaultValue;
    }
  });
  return defaultDatas;
};
const dataSearch = (val: string | null) => {
  if (val === "reset") {
    searchForm.value = {...analysisDefaultValue()};
  }
  let searchDatas = createCreateParams(props.formData);
  //如果一个页面（包括引入的页面）出现多个此组件,不能走消息总线，
  // 否则只有最后一个组件能收到查询消息
  emits("searchData", searchDatas);
};
const searchArea = () => {
  if (defaultSearch.value) {
    tips.value = "普通查询";
    sarchIcon.value = "search_up";
  } else {
    tips.value = "高级查询";
    sarchIcon.value = "search_down";
  }
  defaultSearch.value = !defaultSearch.value;

};
</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
  margin-bottom: 3px;
}

:deep(.el-form-item__label) {
  padding: 3px 12px;
}

.search_content {
  display: flex;

  .search_area {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    flex: 1;
    flex-shrink: 0;
  }
}
</style>
<template>
  <div class="search_content">

    <el-form class="search_area" :size="compSize" v-if="formData">

      <template v-for="item in formData" v-if="defaultSearch">
        <el-form-item
            :size="compSize"
            :label="item.label"
            v-if="item.defaultShow"
            :prop="item.fieldName">
          <template v-if="item.type=='input'&&(item.disabled===false||item.disabled=='no')" :span="6">
            <el-select :size="compSize" style="width: 90px;height:100%;padding-top:2px;" v-model="item['matchType']"
                       clearable filterable>
              <el-option v-for="sitem in matchTypeList" :value="sitem.value" :label="sitem.name" :key=
                  "sitem.value"/>
            </el-select>&nbsp;&nbsp;
          </template>
          <star-horse-item :dataForm="searchForm" :compSize="compSize" :item="item" :isSearch="true"
                           @dataSearch="dataSearch" isEdit="true">
          </star-horse-item>
        </el-form-item>
      </template>
      <template v-for="item in formData" v-else>
        <el-form-item
            :size="compSize"
            :label="item.label"
            :prop="item.fieldName">
          <template v-if="item.type=='input'" :span="6">
            <el-select :size="compSize" style="width: 90px;height:100%;padding-top:2px;" v-model="item['matchType']"
                       clearable filterable>
              <el-option v-for="sitem in matchTypeList" :value="sitem.value" :label="sitem.name" :key=
                  "sitem.value"/>
            </el-select>&nbsp;&nbsp;
          </template>
          <star-horse-item :dataForm="searchForm" :compSize="compSize" :item="item" :isSearch="true"
                           @dataSearch="dataSearch" isEdit="true">
          </star-horse-item>
        </el-form-item>
      </template>
      <el-form-item label="     ">
        <el-button @click="dataSearch" style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
          <star-horse-icon icon-class="search" color="var(--star-horse-white)"/>
          <span style="vertical-align: middle"> 查询 </span>
        </el-button>
        <el-button @click="dataSearch('reset')" link :size="compSize">
          <span style="vertical-align: middle"> 重置 </span>
        </el-button>
        &nbsp;&nbsp;
        <el-tooltip :content="tips" v-if="showTips">
          <star-horse-icon :iconClass="sarchIcon" size="20px" color="var(--star-horse-style)" cursor="pointer"
                           @click="searchArea"/>
        </el-tooltip>
      </el-form-item>
    </el-form>
  </div>
</template>
