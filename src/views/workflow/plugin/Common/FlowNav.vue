<script setup lang="ts">
import {ref} from "vue";
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {useRouter} from "vue-router";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";
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
  // router.push({path: item.path});
  emits('change', item);
}
const onClick=()=> {
  emits('click');
}
</script>
<template>
  <div class="designer-nav-box">
    <div class="designer-nav-return">
      <div v-if="!scale.isMobile()" class="select-version-box">
        <span class="title">流程设计器</span>
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
      <el-button type="primary" :size="flowMixin.size" @click="onClick">
        <span>{{ buttonName }}</span>
      </el-button>
    </div>
  </div>
</template>
<style lang="scss">
.designer-nav-box {
  width: 100%;
  height: 50px;
  -webkit-box-shadow: 0 2px 8px rgba(92, 99, 115, 25%);
  box-shadow: 0 2px 8px rgba(92, 99, 115, 25%);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: relative;
  z-index: 100;

  .designer-nav-return {
    // width: 170px;
    -webkit-box-flex: 0;
    -ms-flex: 0 0 auto;
    flex: 0 0 auto;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    margin-left: 20px;
    font-size: 14px;
    font-weight: 700;
    color: #575757;
    cursor: pointer;

    img {
      margin-right: 10px;
    }

    .select-version-box {
      width: 100%;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      cursor: pointer;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      font-size: 16px;
      color: #575757;
      font-weight: 700;
      margin-right: 30px;
      position: relative;

      .title {
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .version {
        color: #575757;
      }
    }
  }

  .designer-nav-center {
    -webkit-box-flex: 1;
    -ms-flex: 1 0 auto;
    flex: 1 0 auto;
    text-align: center;
    line-height: 50px;

    .designer-nav-center-wrap {
      display: inline-block;

      .designer-nav-center-wrap-item {
        display: inline-block;
        margin-right: 35px;
        font-size: 16px;
        font-weight: 700;
        color: #575757;
        cursor: pointer;

        .act-item {
          border-bottom: 3px solid #ff6a00;
          padding-bottom: 12px;
          color: #575757;
        }
      }
    }
  }

  .designer-nav-button {
    // width: 220px;
    -webkit-box-flex: 0;
    -ms-flex: 0 0 auto;
    flex: 0 0 auto;
    margin-right: 25px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
}
</style>

