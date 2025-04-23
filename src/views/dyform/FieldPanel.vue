<script setup lang="ts" name="FieldPanel">
import {computed, ref} from "vue";
import {apiInstance, ApiUrls, loadData, piniaInstance, useDesignFormStore} from "star-horse-lowcode";
import DbListComp from "@/views/dbsearch/utils/DbListComp.vue";
import {fieldCopy} from "@/views/dyform/utils/FieldOperationUtils.ts";
import FormPreview from "@/views/dyform/FormPreview.vue";

const emits = defineEmits(["loadData"]);
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = useDesignFormStore(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let tabModel = ref<string>("component");
let activeNames = ref(["a", "b", "c", "d"]);

const onContainerCopy = (data: any) => {
  return onDataCopy(data, "container");
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, "formItem");
};

const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};
const templateList = ref<any[]>([]);
const previewImages = ref<Record<string, string>>({}); // 新增：存储生成的图片

const tabChange = (name: string) => {
  if (name == "template") {
    loadData(dataUrl.basePrefix + "/loadTemplate", {}).then(async (res: any) => {
      templateList.value = res.data || [];

    })
  }
}
const loadFormData = (formId: any) => {
  emits("loadData", formId);
}
const previewRefs = ref<any[]>([]); // 新增ref数组
// 新增：生成所有预览图片的方法
const createRef = (el: any) => {
  previewRefs.value.push(el);
}

</script>
<template>
  <el-tabs v-model="tabModel" style="width: 100%; height: 100%; "
           tab-position="left"
           @tabChange="tabChange"
           type="border-card">
    <el-tab-pane name="component">
      <template #label>
        <star-horse-icon icon-class="component" style="color: var(--star-horse-style)"/>&nbsp;<span>组件</span>
      </template>
      <div class="field-area">
        <el-scrollbar height="100%">
          <el-collapse class="starhorse-collapse" v-model="activeNames">
            <el-collapse-item name="a">
              <template #title>
                <div class="collapse-item-title title">
                  <div style="width: 80%">布局组件</div>
                  <star-horse-icon icon-class="container" style="color: var(--star-horse-style)"/>
                </div>
              </template>
              <draggable
                  :clone="onContainerCopy"
                  :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                  :sort="false"
                  animation="300"
                  ghost-class="ghost"
                  item-key="id"
                  tag="ul"
                  :list="containerList"
              >
                <template #item="{ element }">
                  <li class="field-item"
                  >&nbsp;&nbsp;
                    <span
                    ><star-horse-icon :icon-class="element.itemIcon"
                                      style="color: var(--star-horse-style)"/><i>{{ element.itemName }}</i></span
                    >
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="b">
              <template #title>
                <div class="collapse-item-title title">
                  <div style="width: 80%">表单组件</div>
                  &nbsp;<star-horse-icon icon-class="form" style="color: var(--star-horse-style)"/>
                </div>
              </template>
              <draggable
                  :clone="onFormItemCopy"
                  :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                  :sort="false"
                  animation="300"
                  ghost-class="ghost"
                  item-key="key"
                  tag="ul"
                  :list="formDataList"
              >
                <template #item="{ element }">
                  <li class="field-item"
                  >&nbsp;&nbsp;
                    <span
                    ><star-horse-icon
                        :icon-class="element.itemIcon"
                        style="color: var(--star-horse-style)"
                    /><i>{{ element.itemName }}</i></span
                    >
                  </li>
                </template>
              </draggable>
            </el-collapse-item>
            <el-collapse-item name="c">
              <template #title>
                <div class="collapse-item-title title">
                  <div style="width: 80%">自定义组件</div>
                  &nbsp;<star-horse-icon icon-class="other" style="color: var(--star-horse-style)"/>
                </div>
              </template>
              <draggable
                  :clone="onFormItemCopy"
                  :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                  :sort="false"
                  animation="300"
                  ghost-class="ghost"
                  item-key="key"
                  tag="ul"
                  :list="selfFormDataList"
              >
                <template #item="{ element }">
                  <li class="field-item">&nbsp;&nbsp;
                    <span><star-horse-icon
                        :icon-class="element.itemIcon"
                        style="color: var(--star-horse-style)"
                    /><i>{{ element.itemName }}</i></span>
                  </li>
                </template>
              </draggable>
              <div style="height: 50px"></div>
            </el-collapse-item>
          </el-collapse>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="dbinfo">
      <template #label>
        <star-horse-icon icon-class="database" style="color: var(--star-horse-style)"/>&nbsp;<span>数据源</span>
      </template>
      <db-list-comp/>
    </el-tab-pane>
    <el-tab-pane name="charts">
      <template #label>
        <star-horse-icon icon-class="charts" style="color: var(--star-horse-style)"/>&nbsp;<span>图表</span>
      </template>
    </el-tab-pane>
    <el-tab-pane name="template">
      <template #label>
        <star-horse-icon icon-class="template" style="color: var(--star-horse-style)"/>&nbsp;<span>模板</span>
      </template>
      <div class="field-area m-t-8">
        <el-scrollbar height="100%">
          <el-card class="temp-card" style="margin-bottom: 10px !important;" v-for=" item in templateList">
            <div class="flex w-full flex-1 justify-center items-center">
              <el-popover placement="right" :width="500">
                <template #reference>
                  <el-image :src="item.shortImages">
                    <template #error>
                      <star-horse-icon iconClass="empty_image" size="100px"/>
                    </template>
                  </el-image>
                </template>
                <template #default>
                  <form-preview
                      :compSize="'small'"
                      :formDisabled="true"
                      :list="JSON.parse(item['details'].content||[])"
                      :ref="createRef"
                      class="flex w-full flex-1 justify-center items-center"
                      v-if="item['details'].content"
                  />
                </template>
              </el-popover>

            </div>
            <template #footer>
              <div class="flex items-center">
                <div class="w-[60%]">#{{ item.formName }}</div>
                <div class="flex-1 justify-end">
                  <el-button size="small" link @click="loadFormData(item.idDynamicForm)" icon="plus">加载此模板</el-button>
                </div>
              </div>
            </template>
          </el-card>
        </el-scrollbar>
      </div>
    </el-tab-pane>
    <el-tab-pane name="help">
      <template #label>
        <star-horse-icon icon-class="help" style="color: var(--star-horse-style)"/>&nbsp;<span>帮助</span>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
.field-area {
  width: 100%;
  height: 100%;
  overflow: hidden;

}

.temp-card {
  width: 99% !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 250px !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;
}

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
        content: "";
        display: block;
        clear: both;
      }

      .field-item {
        display: inline-flex;
        height: 28px;
        line-height: 28px;
        width: 100px;
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
            margin-right: 3px;
          }

          i {
            flex: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden; // 确保这个属性存在
            max-width: 70px; // 根据实际需要调整这个值
          }
        }

        &:hover {
          background: #ebeef5;
          outline: 1px solid #999999;
        }
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

:deep {
  .el-tabs__content {
    padding: 0 !important;
  }

  .el-tabs__header.is-left {
    margin-right: 5px !important;
  }

  .el-tabs__item {
    height: 80px !important;
    display: flex;
    padding: 0 5px;
    align-items: center;
    justify-content: center !important;
    vertical-align: middle !important;
    writing-mode: vertical-lr;
    flex-direction: row !important;
    text-align: center;
  }

}
</style>
