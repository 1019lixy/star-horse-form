<script setup lang="ts">
import {ref} from "vue";

const props = defineProps({
  childNodeP: {type: Object},
  nodeConfig: {type: Object},
  tip: {type: Object},
});
const emits = defineEmits(["setPerson", "childNodeP"]);
let visible = ref<boolean>(false);
let parentObj = ref<any>({});
const addType = (type: number) => {
  visible.value = false;
  let data;
  if (type != 4) {
    if (type == 1) {
      data = {
        nodeName: "审核人",
        error: true,
        type: 1,
        nodeId: "approvalID",
        examineMode: "1",
        nodeUserType: {
          type: 'manager',
          value: '',
          valueList: [],
          valueName: '',
        },
        childNode: props.childNodeP.childNode,
      }
    } else if (type == 2) {
      data = {
        nodeName: "抄送人",
        error: true,
        type: 2,
        nodeId: "copyID",
        nodeUserType: {
          type: 'manager',
          value: 'm-1',
          valueName: '第一级主管',
          valueList: [],
        },
        childNode: props.childNodeP.childNode,
      }
    }
    emits("setPerson", '', '', data, props.tip);  //添加节点自动弹出弹框
  } else {
    data = {
      nodeName: "路由",
      type: 4,
      nodeId: "conditionID",
      childNode: props.childNodeP.childNode,
      conditionNodes: [{
        nodeName: "条件1",
        error: true,
        type: 3,
        priorityLevel: 1,
        conditionList: [],
        childNode: null,
      }, {
        nodeName: "默认",
        error: true,
        type: 3,
        priorityLevel: 2,
        conditionList: [],
        childNode: null
      }]
    }
    emits("setPerson", 1, '', data);
  }
  props.childNodeP.childNode = data;
  // emits("childNodeP", data);
}
</script>
<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <el-popover placement="right-start" popper-class="add-node-popover" :show-arrow="false"
                  :popper-style="{width: 'unset !important'}" v-model="visible">
        <div class="add-node-popover-body">
          <div class="add-node-popover-item approver" @click="addType(1)">
            <div class="item-wrapper">
              <star-horse-icon icon-class="auditor" class="img-style"/>
            </div>
            <p>审批人</p>
          </div>
          <div class="add-node-popover-item notifier" @click="addType(2)">
            <div class="item-wrapper">
              <star-horse-icon icon-class="carbon-copy" class="img-style"/>
            </div>
            <p>抄送人</p>
          </div>
          <div class="add-node-popover-item condition" @click="addType(4)">
            <div class="item-wrapper">
              <star-horse-icon icon-class="condition" class="img-style"/>
            </div>
            <p>条件分支</p>
          </div>
        </div>
        <template #reference>
          <star-horse-icon icon-class="add" color="purple"/>
        </template>
      </el-popover>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.add-node-btn-box {
  width: 240px;
  display: inline-flex;
  flex-shrink: 0;
  position: relative;

  &:first-child {
    margin-left: 16px;
  }

  &:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 0px;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 1px;
    // height: 100%;
    background-color: var(--star-horse-style);
  }
}

.img-style {
  width: 36px;
}

.add-node-popover {
  padding: 14px 26px;

  .add-node-popover-body {
    display: flex;

    .add-node-popover-item {
      margin-right: 20px;
      text-align: center;
      cursor: pointer;

      &:last-child {
        margin-right: 0;
      }

      i {
        font-size: 36px;
      }

      p {
        color: #333;
        margin-top: 4px;
      }
    }

    .approver {
      i {
        color: #e6a23c;
      }
    }

    .condition {
      i {
        color: #67c23a;
      }
    }

    .notifier {
      i {
        color: #4880ff;
      }
    }
  }
}
</style>
