<script setup lang="ts">
import {computed, ref} from 'vue';
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon';
import {scale} from '@/views/workflow/plugin/utils/deviceUtil';
import {useFlowDesignStore} from '@/store/FlowDesign';
import {piniaInstance, warning} from 'star-horse-lowcode';

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
const emits = defineEmits(['change', 'flowSave', 'changeFlow']);
const navItems = ref<Array<any>>([
  {
    name: '基础信息',
    shortName: '基础',
    type: 1,
    path: '/basicInfo',
  },
  {
    name: '表单设计',
    shortName: '表单',
    type: 2,
    path: '/formDesign',
  },
  {
    name: '流程设计',
    shortName: '流程',
    type: 3,
    path: '/flowDesign',
  },
  {
    name: '更多配置',
    shortName: '配置',
    type: 4,
    path: '/flowSetting',
  },
]);
const flowDesign = useFlowDesignStore(piniaInstance);
let navable = computed(() => flowDesign.navable);
let formInfo = computed(() => flowDesign.flowFormInfo);
const onChange = (item: any) => {
  if (!navable.value) {
    warning('请先完成当前页面的数据填写');
    return;
  }
  emits('change', item);
};
const flowSave = (type: string) => {
  emits('flowSave', type);
};
const changeFlow = () => {
  emits('changeFlow');
};
</script>
<template>
  <div class="designer-nav-box">
    <div class="designer-nav-return">
      <router-link
        :to="{ path: '/workflow/FlowDefineUi' }"
        style="display: flex; width: 100px; margin-right: 10px"
      >
        <star-horse-icon icon-class="back" />
        返回
      </router-link>
      <div v-if="!scale.isMobile()" class="select-version-box">
        <span class="title">流程设计器</span>
      </div>
    </div>
    <div class="designer-nav-center">
      <div
        v-for="(item, i) in navItems"
        :key="i"
        :class="{ 'designer-nav-center-wrap': true }"
      >
        <template v-if="item.type == 2">
          <div
            v-if="!formInfo.bindForm || !formInfo.bindForm.length"
            class="designer-nav-center-wrap-item"
            @click="onChange(item)"
          >
            <span :class="{ 'act-item': currentNav == item.type }">{{
              scale.isMobile() ? item.shortName : item.name
            }}</span>
          </div>
        </template>
        <div
          v-else
          class="designer-nav-center-wrap-item"
          @click="onChange(item)"
        >
          <span :class="{ 'act-item': currentNav == item.type }">{{
            scale.isMobile() ? item.shortName : item.name
          }}</span>
        </div>
      </div>
    </div>
    <div class="designer-nav-button">
      <!--      <el-button v-if="currentNav ==3" link :size="flowCommon.size" @click="changeFlow">
              <span>切换</span>
            </el-button>-->
      <el-button type="info" :size="flowCommon.size" @click="flowSave('save')">
        <star-horse-icon icon-class="save" color="var(--star-style-white)" />
        暂存
      </el-button>
      <el-button
        type="primary"
        :size="flowCommon.size"
        @click="flowSave('publish')"
      >
        <star-horse-icon icon-class="publish" color="var(--star-style-white)" />
        {{ buttonName }}
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
      flex: 1;
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

    .nav-disabled {
      background: var(--star-horse-disable);
    }

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
