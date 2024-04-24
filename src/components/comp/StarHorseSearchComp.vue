<script setup lang="ts" name="StarHorseSearchComp">
import {inject, onMounted, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PropType} from "vue/dist/vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {searchMatchList} from "@/api/sh_api";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {SearchParams} from "@/components/types/Params";

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
let searchForm: any = inject("searchForm");
const init = () => {
  matchTypeList.value = searchMatchList();
  if (!searchForm && props.dialogInput) {
    searchForm = [];
  }
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
  for (let key in searchForm.value) {
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
const dataSearch = (val: string | null) => {
  if (val === "reset") {
    searchForm.value = {};
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
    <el-form class="search_area" size="mini">
      <template v-for="item in formData" v-if="defaultSearch">
        <el-form-item
            size="small"
            :label="item.label"
            v-if="item.defaultShow"
            :prop="item.fieldName">
          <template v-if="item.type=='input'" :span="6">
            <el-select size="small" style="width: 90px" v-model="item['matchType']" clearable filterable>
              <el-option v-for="sitem in matchTypeList" :value="sitem.value" :label="sitem.name" :key=
                  "sitem.value"/>
            </el-select>&nbsp;&nbsp;
          </template>
          <star-horse-item :dataForm="searchForm" :item="item" :isSearch="true"
                           @dataSearch="dataSearch" isEdit="true">

          </star-horse-item>
        </el-form-item>
      </template>
      <template v-for="item in formData" v-else>
        <el-form-item
            size="small"
            :label="item.label"
            :prop="item.fieldName">
          <template v-if="item.type=='input'" :span="6">
            <el-select size="small" style="width: 90px" v-model="item['matchType']" clearable filterable>
              <el-option v-for="sitem in matchTypeList" :value="sitem.value" :label="sitem.name" :key=
                  "sitem.value"/>
            </el-select>&nbsp;&nbsp;
          </template>
          <star-horse-item :dataForm="searchForm" :item="item" :isSearch="true"
                           @dataSearch="dataSearch" isEdit="true">
          </star-horse-item>
        </el-form-item>
      </template>
      <el-form-item label="     ">
        <el-button @click="dataSearch" type="primary" size="small">
          <star-horse-icon icon-class="search" size="13px"/>
          <span style="vertical-align: middle"> 查询 </span>
        </el-button>
        <el-button @click="dataSearch('reset')" link size="small">
          <span style="vertical-align: middle"> 重置 </span>
        </el-button>
        &nbsp;&nbsp;
        <el-tooltip :content="tips" v-if="showTips">
          <star-horse-icon :iconClass="sarchIcon" size="20px" color="var(--star-horse-style);" cursor="pointer"
                           @click="searchArea"/>
        </el-tooltip>
      </el-form-item>
    </el-form>
  </div>
</template>
