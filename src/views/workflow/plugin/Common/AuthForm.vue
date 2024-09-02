<template>
  <div class="flow-setting-auth-table">
    <div class="flow-setting-auth-table-header">
      <div
          :class="{ 'flow-setting-auth-table-name-column-30': !readable, 'flow-setting-auth-table-name-column-25': readable }">
        <span>表单</span>
      </div>
      <div class="flow-setting-auth-table-option-column">
        <div
            :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }"
            v-if="readable">
          <el-checkbox v-model="writableChecked" @change="onAllWritableChange">
            编辑
          </el-checkbox>
        </div>
        <div
            :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }">
          <el-checkbox v-model="readableChecked" @change="onAllReadableChange">
            只读
          </el-checkbox>
        </div>
        <div
            :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }">
          <el-checkbox v-model="displayableChecked" @change="onAllDisplayableChange">
            隐藏
          </el-checkbox>
        </div>
        <div
            :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }"
            v-if="readable">
          <el-checkbox v-model="requiredChecked" @change="onAllRequiredChange">
            必填
          </el-checkbox>
        </div>
      </div>
    </div>
    <div class="flow-setting-auth-table-body">
      <div class="flow-setting-auth-table-name-column-row" v-for="(item, i) in fields" :key="i">
        <div
            :class="{ 'flow-setting-auth-table-name-column-30': !readable, 'flow-setting-auth-table-name-column-25': readable }">
          <span>{{ item.name }}</span>
        </div>
        <div class="flow-setting-auth-table-option-column">
          <div
              :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }"
              v-if="readable">
            <el-checkbox  v-model="item.writable" @change="writableChange($event, item)">
              编辑
            </el-checkbox>
          </div>
          <div
              :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }">
            <el-checkbox  v-model="item.readable" @change="readableChange($event, item)">
              只读
            </el-checkbox>
          </div>
          <div
              :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }">
            <el-checkbox v-model="item.displayable"
                        @change="displayableChange($event, item)">
              隐藏
            </el-checkbox>
          </div>
          <div
              :class="{ 'flow-setting-auth-table-option-column-item-50': !readable, 'flow-setting-auth-table-option-column-item-25': readable }"
              v-if="readable">
            <el-checkbox v-model="item.required" @change="displayableRequired($event, item)">
              必填
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import {computed, ref} from "vue";
import {uuid} from "@/views/workflow/plugin/mixins/flowMixin";

const props = defineProps({
  readable: {
    type: Boolean,
    default: false,
  },
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  value: {
    type: Array,
    default: function () {
      return [];
    },
  },
});
const emits = defineEmits(["input"]);
let fields = ref<Array<any>>([
  {
    id: uuid(),
    name: '姓名',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '工号',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '部门',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '性别',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '职位',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '账号',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '学历',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '毕业证书',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '资格证书',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '身份证正面',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '身份证反面',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '银行信息',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  },
  {
    id: uuid(),
    name: '相关附件',
    writable: true,
    readable: false,
    displayable: false,
    required: false,
  }
]);
const writableChecked = computed(() => {
  return fields.value.filter((item) => item.writable == false).length == 0;
});
const readableChecked = computed(() => {
  return fields.value.filter((item) => item.readable == false).length == 0
});
const displayableChecked = computed(() => {
  return fields.value.filter((item) => item.displayable == false).length == 0;
});
const requiredChecked = computed(() => {
  return fields.value.filter((item) => item.required == false).length == 0;
});
/**
 *  全选编辑
 * @param {*} e
 */
const onAllWritableChange = (e) => {
  fields.value.forEach((item, i) => {
    writableChange(e, item);
  });
}
/**
 * 全选只读
 * @param {*} e
 */
const onAllReadableChange = (e) => {
  for (let item of fields.value) {
    readableChange(e, item);
  }
}
/**
 * 全选隐藏
 * @param {*} e
 */
const onAllDisplayableChange = (e) => {
  fields.value.forEach((item, i) => {
    displayableChange(e, item);
  });
}
/**
 * 全选必填
 * @param {*} e
 */
const onAllRequiredChange = (e) => {
  fields.value.forEach((item, i) => {
    displayableRequired(e, item);
  });
}
/**
 * 编辑
 * @param {*} e
 * @param {*} item
 */
const writableChange = (e, item) => {
  item.writable = e.target.checked;
  if (e.target.checked) {
    item.readable = !e.target.checked;
    item.displayable = !e.target.checked;
  } else {
    item.required = e.target.checked;
  }
  changePrivilege();
}
/**
 * 只读
 * @param {*} e
 * @param {*} item
 */
const readableChange = (e, item) => {
  item.readable = e.target.checked;
  if (e.target.checked) {
    item.writable = !e.target.checked;
    item.displayable = !e.target.checked;
    item.required = !e.target.checked;
  }
  changePrivilege();
}
/**
 * 隐藏
 * @param {*} e
 * @param {*} item
 */
const displayableChange = (e, item) => {
  item.displayable = e.target.checked;
  if (e.target.checked) {
    item.writable = !e.target.checked;
    item.readable = !e.target.checked;
    item.required = !e.target.checked;
  }
  changePrivilege();
}
/**
 * 必填
 * @param {*} e
 * @param {*} item
 */
const displayableRequired = (e, item) => {
  item.required = e.target.checked;
  if (e.target.checked) {
    item.readable = !e.target.checked;
    item.displayable = !e.target.checked;
    item.writable = e.target.checked;
  }
  changePrivilege();
}
const changePrivilege = () => {
  emits('input', fields);
}
</script>
