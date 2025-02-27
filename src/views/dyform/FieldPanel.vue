<script setup lang="ts" name="FieldPanel">
import {computed, ref} from 'vue';
import {DesignForm} from '@/store/DesignFormStore.ts';
import piniaInstance from '@/store/index.ts';
import DbListComp from '@/views/dbsearch/utils/DbListComp.vue';
import {fieldCopy} from '@/views/dyform/utils/FieldOperationUtils.ts';

let designForm = DesignForm(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let tabModel = ref<string>('component');
let activeNames = ref(['a', 'b', 'c', 'd']);

const onContainerCopy = (data: any) => {
  return onDataCopy(data, 'container');
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, 'formItem');
};

const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};

</script>
<template>
  <el-tabs v-model="tabModel">
    <el-tab-pane name="component">
      <template #label>
        <star-horse-icon icon-class="component"
                         style="color: var(--star-horse-style)"/>&nbsp;<span>组件</span>
      </template>
      <el-scrollbar height="100%">
        <el-collapse
            class="starhorse-collapse"
            v-model="activeNames"
        >
          <el-collapse-item name="a">
            <template #title>
              <div class="collapse-item-title title">
                <div style="width: 80%">容器</div>
                <star-horse-icon icon-class="container"
                                 style="color: var(--star-horse-style)"/>
              </div>
            </template>

            <draggable
                :clone="onContainerCopy"
                :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="id"
                tag="ul"
                :list="containerList"
            >
              <template #item="{element}">
                <li class="field-item">&nbsp;&nbsp;
                  <span><star-horse-icon :icon-class="element.itemIcon" style="color: var(--star-horse-style)"/>&nbsp;
                    &nbsp;{{ element.itemName }}</span>
                </li>
              </template>
            </draggable>

          </el-collapse-item>
          <el-collapse-item name="b">
            <template #title>
              <div class="collapse-item-title title">
                <div style="width: 80%">表单元素</div>
                &nbsp;<star-horse-icon icon-class="form"
                                       style="color: var(--star-horse-style)"/>
              </div>
            </template>
            <draggable
                :clone="onFormItemCopy"
                :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="formDataList"
            >
              <template #item="{element}">
                <li class="field-item">&nbsp;&nbsp;
                  <span><star-horse-icon :icon-class="element.itemIcon" style="color: var(--star-horse-style)"/>&nbsp;&nbsp;{{
                      element.itemName
                    }}</span>
                </li>
              </template>
            </draggable>
          </el-collapse-item>
          <el-collapse-item name="c">
            <template #title>
              <div class="collapse-item-title title">
                <div style="width: 80%">自定义组件</div>
                &nbsp;<star-horse-icon icon-class="other"
                                       style="color: var(--star-horse-style)"/>
              </div>
            </template>
            <draggable
                :clone="onFormItemCopy"
                :group="{name: 'starHorseGroup', pull: 'clone', put: false}"
                :sort="false"
                animation="300"
                ghost-class="ghost"
                item-key="key"
                tag="ul"
                :list="selfFormDataList"
            >
              <template #item="{element}">
                <li class="field-item">&nbsp;&nbsp;
                  <span><star-horse-icon :icon-class="element.itemIcon"
                                         style="color: var(--star-horse-style)"/>&nbsp;&nbsp;{{
                      element.itemName
                    }}</span>
                </li>
              </template>
            </draggable>
            <div style="height: 50px"></div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </el-tab-pane>
    <el-tab-pane name="dbinfo">
      <template #label>
        <star-horse-icon icon-class="database" style="color: var(--star-horse-style)"/>&nbsp;<span>数据源</span>
      </template>
      <db-list-comp/>
    </el-tab-pane>
  </el-tabs>

</template>
<style lang="scss" scoped>
:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

.starhorse-collapse {
  border-top-width: 0;
  display: flex;
  flex-direction: column;
  /*  height: 100%;
    overflow: hidden;*/

  .el-collapse-item__header {
    padding-left: 10px;
    font-weight: bold;
  }

  .el-collapse-item__content {
    padding-bottom: 6px;
    margin-left: 8px;

    ul {
      padding-left: 10px; /* 重置IE11默认样式 */
      margin: 0; /* 重置IE11默认样式 */
      margin-block-start: 0;
      margin-block-end: 0.25em;
      padding-inline-start: 10px;

      &:after {
        content: '';
        display: block;
        clear: both;
      }

      .field-item {
        display: inline-flex;
        height: 28px;
        line-height: 28px;
        width: 120px;
        float: left;
        margin: 2px 6px 6px 0;
        cursor: move;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        border: 1px solid #f1f2f3;

        span {
          display: inline-flex;
          justify-items: center;
          vertical-align: middle;
          align-items: center;
          width: 100%;
          padding: 0;
          margin: 0;
          height: 100%;

          .svg-icon {
            margin-left: 0;
            margin-right: 0;
          }
        }
      }

      .field-item:hover {
        background: #ebeef5;
        outline: 1px solid #999999;
      }

      .drag-handler {
        position: absolute;
        top: 0;
        left: 160px;
        background-color: #dddddd;
        border-radius: 5px;
        padding-right: 5px;
        font-size: 11px;
        color: #666666;
      }
    }
  }
}
</style>
