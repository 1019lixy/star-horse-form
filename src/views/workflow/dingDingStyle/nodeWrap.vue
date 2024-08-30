<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import AddNode from "@/views/workflow/dingDingStyle/addNode.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {ModelRef} from "vue-demi";

const props = defineProps<{
  isTried: { type: Object },
  dataFields: { type: Object },
}>();
const emits = defineEmits(["update:nodeConfig"]);
let nodeConfig: ModelRef<any> = defineModel("nodeConfig");
let placeholderList: Array<string> = ['发起人', '审核人', '抄送人'];
let directorLevelList: Array<any> = [{
  value: '1',
  label: '第一级主管',
},
  {
    value: '2',
    label: '第二级主管',
  },
  {
    value: '3',
    label: '第三级主管',
  },
  {
    value: '4',
    label: '第四级主管',
  },
  {
    value: '5',
    label: '第五级主管',
  },
  {
    value: '6',
    label: '第六级主管',
  },
  {
    value: '7',
    label: '第七级主管',
  },
  {
    value: '8',
    label: '第八级主管',
  },
  {
    value: '9',
    label: '第九级主管',
  },
  {
    value: '10',
    label: '第十级主管',
  },
];
let approverConfig = ref<any>({});
let searchUser = ref<string>("");
let directorLevel = ref<string>('1'); //主管层级
let nodeUser = ref<string>(''); //审批人（stringList）
let approverDrawer = ref<boolean>(false);//审批弹框
let defaultApprovalDrawer = ref<boolean>(false); //默认条件弹框
let conditionDrawer = ref<boolean>(false); //条件弹框
//条件弹框字段
let conditionsConfig = ref<any>({});
let conditionConfig = ref<any>({}); //条件弹框item
let useroptions = ref<Array<any>>([
  {name: "admin", id: "1", userName: "admin"},
  {name: "Anna", id: "2", userName: "Anna"},
]);
let userInf = ref<any>({
  data: [],
  total: 0
});
let examineModeList = ref<Array<any>>([{
  value: '1',
  label: '会签审批',
  mark: '需要所有审批人同意，该审批节点才通过',
},
  {
    value: '2',
    label: '或签审批',
    mark: '任意一名审批人同意，该审批节点即通过',
  },
  {
    value: '3',
    label: '逐级审批',
    mark: '按人事部门层级逐级依次审批后，该审批节点才通过',
  },
]);
let operatorList = ['=', '!=', '>', '>=', '<', '<='];
// -----
let isInputList = ref<Array<any>>([]);
let isInput = ref<boolean>(false);
let hasFlag = ref<boolean>(false);
let conditionTip = ref<string>('');
let bPriorityLevel = ref<string>('');
let conditionList = ref<Array<any>>([]);
let pager = ref<any>({
  current: 1,
  size: 10
});
let selectionList = ref<Array<any>>([]); //表格选中id
let userOriginList = ref<Array<any>>([]);

let setTypeLabel = computed(() => {
  if (approverConfig.value.nodeUserType.type === 'manager')
    return '部门主管：'
  if (
      approverConfig.value.nodeUserType.type === 'role' &&
      approverConfig.value.type === 1
  )
    return '审批角色：'
  if (
      approverConfig.value.nodeUserType.type === 'role' &&
      approverConfig.value.type === 2
  )
    return '抄送角色：'
  if (approverConfig.value.nodeUserType.type === 'user')
    return '指定用户：'
  return ''
});
const remoteMethod = (query: string) => {
  searchUser.value = query;
  if (query !== '') {
    if (approverConfig.value.nodeUserType.type === 'user') {
      // companyUsersList();
    }
  } else {
    useroptions.value = userOriginList.value;
  }
}
const selectionChange = (val) => {
  selectionList.value = val.map(item => item.id);
}
const saveUserInfo = () => {
  approverConfig.value.nodeUserType.valueList = selectionList.value;
  // dialogFlag = false;
}
//删除条件组和条件
const removeCondition = (conditonflag, index, ind) => {
  if (conditonflag === 'group') {
    approverConfig.value.conditionList.splice(index, 1)
    return
  }
  approverConfig.value.conditionList[
      index
      ].conditionChildrenNodes.splice(ind, 1)
}
//审批选择节点
const setExamineModeRadio = (val: string) => {
  approverConfig.value.nodeUserType['value'] = '';
  approverConfig.value.nodeUserType['valueList'] = [];
  if (val === '3') {
    approverConfig.value.nodeUserType.type = 'manager'
  }
}
//添加条件组
const addConditionGroup = (flag: string, item: any) => {
  if (flag === '1') {
    item.conditionChildrenNodes.push({
      conditionOperator: '',
      leftFileds: '',
      centerFileds: '',
      rightFileds: '',
    })
    return
  }
  approverConfig.value.conditionList.push({
    conditionChildrenNodes: [],
    conditionGroupOperator: '',
  })
}
//节点类型
const setTypeRadio = (val: string) => {
  if (approverConfig.value.nodeUserType.valueList.length > 0) {
    approverConfig.value.nodeUserType.valueList = ''
  }
  // approverConfig.value.nodeUserType.value = ''
  if (val === 'role') {
    // companyRoles()
    return
  }
  if (val === 'user') {
    // companyUsersList()
    return
  }
  if (val === 'manager') {
    approverConfig.value.nodeUserType.value = '部门主管'
  }
}
//修改节点name
const editNodename = () => {
  approverConfig.value["titleInputFlag"] = true;

}
const nodeNameBlur = () => {
  approverConfig.value["titleInputFlag"] = false;
}
//条件显示
const conditionStr = (item, index) => {
  let {
    conditionList, //条件组
    conditionString, //条件数据
    conditionStringName, //条件显示
  } = item
  let arr = [true] //判断条件是否有值
  if (conditionList.length === 0 || conditionString === '') {
    if (item.nodeName === '默认') {
      return '其他情况'
    }
    return '请设置条件'
  }
  if (conditionList.length !== 0) {
    if (conditionList.length === 1) {
      //当条件组为一个
      conditionList[0].conditionChildrenNodes &&
      conditionList[0].conditionChildrenNodes.forEach((item, index) => {
            if (item.leftFileds == '' || item.centerFileds == '' || item.rightFileds == '') {
              arr.push(false)
            }
            if (index !== 0 && item.conditionOperator == '') {
              arr.push(false)
            }
          }
      )
    } else {
      //当条件组为多个（判断是否有运算符）
      conditionList.forEach((item, index) => {
        if (index != conditionList.length - 1) {
          //条件组不为最后一个.校验是否有条件运算符
          if (item.conditionGroupOperator == '')
            arr.push(false)
        }
        if (
            item.conditionChildrenNodes &&
            item.conditionChildrenNodes.length > 0
        ) {
          item.conditionChildrenNodes.forEach((it, ind) => {
            if (
                it.leftFileds === '' ||
                it.centerFileds === '' ||
                it.rightFileds == ''
            )
              arr.push(false)
            if (ind !== 0 && it.conditionOperator == '')
              arr.push(false)
          })
        } else if (
            item.conditionChildrenNodes &&
            item.conditionChildrenNodes.length == 0
        ) {
          arr.push(false)
        }
      })
    }
    if (arr.includes(false)) {
      return '请设置条件'
    }
  }
  return conditionStringName
}
const dealStr = (str: string, obj: any) => {
  let arr = []
  let list = str.split(',')
  for (var elem in obj) {
    list.map((item) => {
      if (item == elem) {
        arr.push(obj[elem].value)
      }
    })
  }
  return arr.join('或')
}
//审批人抄送人显示和校验
const setApproverStr = (nodeConfig: any) => {
  let type = '会签';
  let role = '部门主管';
  if (nodeConfig.nodeUserType.type === 'role') role = '角色';
  if (nodeConfig.nodeUserType.type === 'user') role = '用户';
  if (nodeConfig.nodeUserType.value == '') return '';
  if (nodeConfig.type === 1) {
    //审批
    if (nodeConfig.examineMode === '1') type = '会签'
    if (nodeConfig.examineMode === '2') type = '或签'
    if (nodeConfig.examineMode === '3') type = '逐级审批'
    if (nodeConfig.nodeUserType.type === 'manager' && nodeConfig.examineMode === '3') {
      if (nodeConfig.nodeUserType.value.indexOf('m') != -1) {
        return `由发起人向上的${nodeConfig.nodeUserType.valueName}审批`
      } else {
        return `由${nodeConfig.nodeUserType.valueName}审批`
      }
    }
    if (nodeConfig.nodeUserType.type === 'manager' && nodeConfig.examineMode !== '3') {
      return `由${role}${type}`
    }
    return `由${role}：${nodeConfig.nodeUserType.valueName}${type}`
  }
  if (nodeConfig.type === 2) {
    //抄送
    if (nodeConfig.nodeUserType.value == '') return ''
    if (nodeConfig.nodeUserType.type === 'manager') {
      //主管
      if (nodeConfig.nodeUserType.value.indexOf('m') != -1) {
        return `给发起人向上的${nodeConfig.nodeUserType.valueName}抄送`
      } else {
        return `给${nodeConfig.nodeUserType.valueName}抄送`
      }
    }
    // 角色、用户
    return `给${role}：${nodeConfig.nodeUserType.valueName}抄送`
  }
}
//保存弹框设置
const saveApprover = () => {
  if (approverConfig.value.type === 3) {
    saveCondition()
    return
  }
  let list = approverConfig.value.nodeUserType.valueList;
  let nameList = [] // 下拉框:审批角色是name，指定用户是userName
  if (list.length > 0) {
    useroptions.value.forEach((item) => {
      list.forEach((i) => {
        if (approverConfig.value.nodeUserType.type === 'role') {
          if (item.id === i) nameList.push(item.name);
        }
        if (approverConfig.value.nodeUserType.type === 'user') {
          if (item.id === i) nameList.push(item.userName);
        }
      })
    })
    approverConfig.value.nodeUserType.value = list.join(',')
    approverConfig.value.nodeUserType.valueName = nameList.join(',')
  } else if (approverConfig.value.nodeUserType.type !== 'manager') {
    approverConfig.value.nodeUserType.value = ''
    approverConfig.value.nodeUserType.valueName = ''
  }
  if (approverConfig.value.nodeUserType.type === 'manager') {
    //抄送 、审批人逐级审批
    if (approverConfig.value.type === 2 || approverConfig.value.type === 1) {
      let num = approverConfig.value.nodeUserType.value;
      if (num.indexOf('m') !== -1) {
        num = num.substring(2)
      }
      directorLevelList.forEach((item, index) => {
        if (index === num - 1)
          approverConfig.value.nodeUserType.valueName = item.label
      })
      // 默认值
      if (approverConfig.value.type === 1 && approverConfig.value.nodeUserType.type == 'manager'
          && !approverConfig.value.nodeUserType.value) {
        approverConfig.value.nodeUserType.value = '主管'
      }
    } else {
      approverConfig.value.nodeUserType.value = '主管'
    }
  }
  approverConfig.value.error = setApproverStr(approverConfig.value) === '';
  // 通过hasFlag区分添加节点后自动出现弹框及点击出现弹框
  if (hasFlag) {
    if (nodeConfig.value.conditionNodes && nodeConfig.value.conditionNodes.length > 0 && conditionTip) {  //条件分支
      nodeConfig.value.conditionNodes.forEach(element => {
        if (element.childNode && (!element.childNode.nodeUserType.value && element.childNode.nodeName === approverConfig.value.nodeName)) {  //条件分支节点赋值
          element.childNode = approverConfig;
        }
      });
    } else {
      nodeConfig.value.childNode = approverConfig;
    }

    // emits('update:nodeConfig', nodeConfig.value);
  } else {
    nodeConfig.value = approverConfig.value;
    // emits('update:nodeConfig', approverConfig);
  }
  approverDrawer.value = false;
}
//保存条件设置
const saveCondition = () => {
  approverDrawer.value = false;
  let conditionString = ''; // 后端要的数据
  let conditionStringName = ''; //前端显示
  //条件循环设置
  if (approverConfig.value.conditionList.length > 0) {
    approverConfig.value.conditionList.forEach((item, indx) => {
      if (item.conditionChildrenNodes && item.conditionChildrenNodes.length > 0) {
        item.conditionChildrenNodes.forEach((it, ind) => {
          conditionString = conditionString + it.conditionOperator + it.leftFileds + it.centerFileds + it.rightFileds;
          conditionStringName = conditionStringName + it.conditionOperator + it.leftFiledsName + it.centerFileds + it.rightFileds;
        })
      }
      conditionString = conditionString + item.conditionGroupOperator;
      conditionStringName = conditionStringName + item.conditionGroupOperator;
    })
  }
  approverConfig.value.conditionString = conditionString;
  approverConfig.value.conditionStringName = conditionStringName;
  for (let i = 0; i < conditionsConfig.value.conditionNodes.length; i++) {
    conditionsConfig.value.conditionNodes[i].error =
        conditionStr(conditionsConfig.value.conditionNodes[i], i) == '请设置条件'
  }
  // 区分添加节点后自动出现弹框及点击出现弹框
  if (hasFlag) {
    nodeConfig.value.childNode = conditionsConfig;
    // emits('update:nodeConfig', nodeConfig.value);
  } else {
    nodeConfig.value = conditionsConfig;
    // emits('update:nodeConfig', conditionsConfig)
  }
}
//条件字段显示name
const dataFieldsChange = (it: any) => {
  props.dataFields.forEach((item: any) => {
    if (item.key === it.leftFileds) {
      it["leftFiledsName"] = item.name;
      it["leftFiledsType"] = item.type;
    }
  })
}
//删除节点
const delNode = () => {
  // delete nodeConfig.value["childNode"];
  // nodeConfig.value.childNode=c=nodeConfig.value.childNode;
  nodeConfig.value = nodeConfig.value.childNode;
  // emits('update:nodeConfig', nodeConfig.value.childNode)
}
//添加条件
const addTerm = () => {
  let len = nodeConfig.value.conditionNodes.length;
  nodeConfig.value.conditionNodes.push({
    nodeName: '条件' + len,
    type: 3,
    priorityLevel: len + 1,
    conditionList: [],
    childNode: null,
  })
  for (let i = 0; i < nodeConfig.value.conditionNodes.length; i++) {
    nodeConfig.value.conditionNodes[i].error =
        conditionStr(nodeConfig.value.conditionNodes[i], i) ==
        '请设置条件' &&
        i != nodeConfig.value.conditionNodes.length - 1
  }
  // emits('update:nodeConfig', nodeConfig.value)
}
//删除条件
const delTerm = (index: number) => {
  nodeConfig.value.conditionNodes.splice(index, 1)
  for (let i = 0; i < nodeConfig.value.conditionNodes.length; i++) {
    nodeConfig.value.conditionNodes[i].error =
        conditionStr(nodeConfig.value.conditionNodes[i], i) ==
        '请设置条件' &&
        i != nodeConfig.value.conditionNodes.length - 1
  }
  // emits('update:nodeConfig', nodeConfig.value)
  if (nodeConfig.value.conditionNodes.length == 1) {
    if (nodeConfig.value.childNode) {
      if (nodeConfig.value.conditionNodes[0].childNode) {
        reData(
            nodeConfig.value.conditionNodes[0].childNode,
            nodeConfig.value.childNode
        )
      } else {
        nodeConfig.value.conditionNodes[0].childNode = nodeConfig.value.childNode
      }
    }
    // emits('update:nodeConfig', nodeConfig.value.conditionNodes[0].childNode)
  }
}
const reData = (data: any, addData: any) => {
  if (!data.childNode) {
    data.childNode = addData
  } else {
    reData(data.childNode, addData)
  }
}
//打开弹框
const setPerson = (priorityLevel, item, data, tip) => {
  console.log("setPerson click:", priorityLevel, item, data, tip);
  approverDrawer.value = true;
  // 默认条件
  if (item && item.nodeName === '默认') {
    defaultApprovalDrawer.value = true;
  } else {
    defaultApprovalDrawer.value = false;
  }
  if (tip) {
    conditionTip.value = tip;
  }
  if (data) {   //添加节点自动出现弹框传值
    hasFlag.value = true;
    // 条件
    if (priorityLevel == 1) {
      bPriorityLevel.value = priorityLevel;
      conditionsConfig.value = JSON.parse(JSON.stringify(data));
      approverConfig.value = conditionsConfig.value.conditionNodes[priorityLevel - 1];
      return
    }
    // 审批人、抄送人
    approverConfig.value = JSON.parse(JSON.stringify(data));
  } else {  //点击出现弹框
    // 条件
    let {type} = nodeConfig.value;
    if (type == 4) {
      bPriorityLevel.value = priorityLevel;
      conditionsConfig.value = JSON.parse(JSON.stringify(nodeConfig.value));
      approverConfig.value = conditionsConfig.value.conditionNodes[priorityLevel - 1];
      return
    }
    // 审批人、抄送人
    approverConfig.value = JSON.parse(JSON.stringify(nodeConfig.value));
  }

  if (approverConfig.value.nodeUserType && approverConfig.value.nodeUserType.type === 'role') {
    // companyRoles()
    return
  }
  if (approverConfig.value.nodeUserType && approverConfig.value.nodeUserType.type === 'user') {
    // companyUsersList()
    return
  }
}
const arrTransfer = (index: number, type = 1) => {
  //向左-1,向右1
  nodeConfig.value.conditionNodes[index] = nodeConfig.value.conditionNodes.splice(index + type, 1, nodeConfig.value.conditionNodes[index])[0];
  nodeConfig.value.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1
  })
  for (var i = 0; i < nodeConfig.value.conditionNodes.length; i++) {
    nodeConfig.value.conditionNodes[i].error =
        conditionStr(nodeConfig.value.conditionNodes[i], i) ==
        '请设置条件' &&
        i != nodeConfig.value.conditionNodes.length - 1
  }
  // emits('update:nodeConfig', nodeConfig.value)
}
const init = async () => {
  if (nodeConfig.value.type == 1) {
    nodeConfig.value.error = setApproverStr(nodeConfig.value) == ''
  } else if (nodeConfig.value.type == 2) {
    nodeConfig.value.error = setApproverStr(nodeConfig.value) === ''
  } else if (nodeConfig.value.type == 4) {
    for (let i = 0; i < nodeConfig.value.conditionNodes.length; i++) {
      nodeConfig.value.conditionNodes[i].error = conditionStr(nodeConfig.value.conditionNodes[i], i) ==
          '请设置条件'
    }
  }
  // console.log(nodeConfig.value);
}
onMounted(async () => {
  await init();
});
watch(() => approverDrawer.value,
    (val) => {
      if (!val) {
        defaultApprovalDrawer.value = false;
        hasFlag.value = false;
        conditionTip.value = "";
      }

    }
)
</script>
<template>
  <div class="nodeflow-components">
    <div class="node-wrap" v-if="nodeConfig?.type!=4">
      <div class="node-wrap-box" v-if="nodeConfig?.type && nodeConfig?.type != 0"
           :class=" (nodeConfig.type == 0 ? 'start-node ' : '') + (isTried && nodeConfig.error ? 'active error' : '') ">
        <div @click="setPerson()">
          <div class="title" :style="
                        'background: rgb(' + [ '87, 106, 149', '230, 162, 60', '72, 128, 255', ][nodeConfig.type] + ');' ">
            <span class="editable-title">{{ nodeConfig.nodeName }}</span>
            <star-horse-icon icon-class="close" v-if="nodeConfig.type != 0" @click.stop="delNode()"/>
          </div>
          <div class="content">
            <div class="text" v-if="nodeConfig.type == 1">
              <span class="placeholder" v-if="setApproverStr(nodeConfig) === ''">
                请选择{{ placeholderList[nodeConfig.type] }}
              </span>
              {{ setApproverStr(nodeConfig) }}
            </div>
            <div class="text" v-if="nodeConfig.type == 2">
              <span class="placeholder" v-if="setApproverStr(nodeConfig) === ''">
                请选择{{ placeholderList[nodeConfig.type] }}
              </span>
              {{ setApproverStr(nodeConfig) }}
            </div>
            <star-horse-icon icon-class="arrow-double-right"/>
          </div>
          <div class="error_tip" v-if="isTried && nodeConfig.error">
            <star-horse-icon icon-class="warning" style="color: rgb(242, 86, 67);"/>
          </div>
        </div>
      </div>
      <addNode :childNodeP="nodeConfig" @setPerson="setPerson"></addNode>
    </div>
    <div class="branch-wrap" v-if="nodeConfig?.type == 4">
      <div class="branch-box-wrap">
        <div class="branch-box">
          <button class="add-branch" @click="addTerm">
            添加条件
          </button>
          <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
            <div class="condition-node">
              <div class="condition-node-box">
                <div class="auto-judge" @click="setPerson(item.priorityLevel,item)"
                     :class="isTried && item.error ? 'error active' : '' ">
                  <div class="sort-left" v-if="index != 0" @click.stop="arrTransfer(index, -1)">
                    &lt;
                  </div>
                  <div class="title-wrapper">
                    <span class="editable-title">{{ item.nodeName }}</span>
                    <span class="priority-title">优先级{{ item.priorityLevel }}</span>
                    <star-horse-icon icon-class="close" @click.stop="delTerm(index)"/>
                  </div>
                  <div class="sort-right" v-if=" index != nodeConfig.conditionNodes .length - 1 "
                       @click.stop="arrTransfer(index)"> &gt;
                  </div>
                  <div class="content">
                    {{ conditionStr(item, index) }}
                  </div>
                  <div class="error_tip" v-if="isTried && item.error">
                    <star-horse-icon icon-class="warning" style="color: rgb(242, 86, 67);"/>
                  </div>
                </div>
                <addNode :childNodeP="item" @setPerson="setPerson" :tip="'条件'"></addNode>
              </div>
            </div>
            <nodeWrap v-if="item.childNode && item.childNode" :dataFields="dataFields" :nodeConfig="item.childNode"
                      :isTried="isTried"></nodeWrap>
            <div class="top-left-cover-line" v-if="index == 0"></div>
            <div class="bottom-left-cover-line" v-if="index == 0"></div>
            <div class="top-right-cover-line" v-if="index == nodeConfig.conditionNodes.length - 1"></div>
            <div class="bottom-right-cover-line" v-if="index == nodeConfig.conditionNodes.length - 1"></div>
          </div>
        </div>
        <addNode :childNodeP="nodeConfig" @setPerson="setPerson"></addNode>
      </div>
    </div>
    <nodeWrap v-if="nodeConfig?.childNode" :dataFields="dataFields"
              v-model:nodeConfig="nodeConfig.childNode" :isTried="isTried"></nodeWrap>
  </div>
</template>
<style lang="scss">

.el-dialog__title {
  font-size: 18px !important;
  font-weight: 600 !important;
}

.default-style {
  margin-left: 25px;
}

.search-style {
  label {
    width: 50px !important;
  }

  .el-row {
    padding-right: 0 !important;
  }

  .el-form-item__content {
    margin-left: 50px !important;
  }
}

.flex-style {
  display: flex;
  justify-content: space-between;
}

.dang-style {
  font-size: 14px;
}

.dialog-style {
  z-index: 99999 !important;
  background: rgba(0, 0, 0, 0.5);
}

.v-modal {
  background: none !important;
  z-index: -1 !important;
}
.error_tip {
  position: absolute;
  top: 36px;
  right: 0px;
  transform: translate(150%, 0px);

  i {
    font-size: 24px;
  }
}

.add-node-popover-body {
  display: flex;
}

.el-drawer:focus,
.el-drawer__close-btn:focus {
  outline: none;
}
</style>
