<template>
  <div class="designer-nav-box">
    <div class="designer-nav-return">
      <img :src="flowMixin.backIcon"/>
      <div v-if="!scale.isMobile()" class="select-version-box">
        <span class="title">test</span>
        <span class="version">&nbsp;V1</span>
        <i class="el-icon-caret-bottom selec-down"></i>
      </div>
    </div>
    <div class="designer-nav-center">
      <div v-for="(item, i) in navItems" :key="i" class="designer-nav-center-wrap">
        <div class="designer-nav-center-wrap-item" @click="onChange(item)">
          <span :class="{ 'act-item': currentNav == item.value }">{{ scale.isMobile() ? item.shortName : item.name }}</span>
        </div>
      </div>
    </div>
    <div class="designer-nav-button">
      <a-button type="primary" :size="flowMixin.size" @click="onClick">
        <span>{{ buttonName }}</span>
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {flowMixin} from '../mixins/flowMixin';
import {useRouter} from "vue-router";
import {scale} from "../util/deviceUtil";
defineProps({
  currentNav: {
    type: Number,
    default: 1,
  },
  buttonName: {
    type: String,
    default: '发布',
  },
});
const emits=defineEmits(["change","click"]);
const router=useRouter();
const navItems=ref<Array<any>> ([
      {
        name: '基础信息',
        shortName: '基础',
        value: 1,
        path: '/basicInfo',
      },
      /* {
        name: '表单设计',
        shortName: '表单',
        value: 2,
        path: '/formDesign',
      }, */
      {
        name: '流程设计',
        shortName: '流程',
        value: 3,
        path: '/flowDesign',
      },
      {
        name: '更多配置',
        shortName: '配置',
        value: 4,
        path: '/flowSetting',
      },
    ]);

const onChange=(item:any)=> {
  router.push({path: item.path});
  emits('change', item);
}
const onClick=()=> {
  emits('click');
}
</script>
