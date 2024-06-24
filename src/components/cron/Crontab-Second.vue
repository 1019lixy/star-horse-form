<template>
  <el-form>
    <el-form-item>
      <el-radio v-model='radioValue' :label="1" border>
        秒，允许的通配符[, - * /]
      </el-radio>
    </el-form-item>
    <el-form-item>
      <el-radio v-model='radioValue' :label="2" border>周期</el-radio>
      <span style="margin-left: 10px; margin-right: 5px;">从</span>
      <el-input-number v-model='cycle01' :min="0" :max="60"/>
      <span style="margin-left: 5px; margin-right: 5px;">至</span>
      <el-input-number v-model='cycle02' :min="1" :max="60"/>
      <span style="margin-left: 5px; margin-right: 5px;">秒</span>
    </el-form-item>
    <el-form-item>
      <el-radio v-model='radioValue' :label="3" border>循环</el-radio>
      <span style="margin-left: 10px; margin-right: 5px;">从</span>
      <el-input-number v-model='average01' :min="0" :max="60"/>
      <span style="margin-left: 5px; margin-right: 5px;"> 秒开始，每</span>
      <el-input-number v-model='average02' :min="0" :max="60"/>
      <span style="margin-left: 5px; margin-right: 5px;">秒执行一次</span>
    </el-form-item>
    <el-form-item>
      <el-radio v-model='radioValue' :label="4" border> 指定</el-radio>
      <el-select clearable filterable v-model="checkboxList" placeholder="请选择秒" multiple collapse-tags
      >
        <el-option v-for="item in 60" :label="item-1" :key="item" :value="item-1"/>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<style lang="scss" scoped>
.el-select {
  width: 250px;
}
.el-input-number {
  width: 150px;
}
</style>
<script setup lang="ts" name="crontab-second">
import {computed, onMounted, ref, watch} from "vue";
let radioValue = ref(1);
let cycle01 = ref(1);
let cycle02 = ref(2);
let average01 = ref(1);
let average02 = ref(1);
let checkboxString = ref(0);
let cycleTotal = ref(0);
let averageTotal = ref(0);
let checkboxList = ref([]);
const props = defineProps({
  check: {type: Function},
  cron: {type: Object},
  radioParent: {}
});
let checkNum = ref(props.check);
const emits = defineEmits(["update"]);
// 单选按钮值变化时
const radioChange = () => {
  switch (radioValue.value) {
    case 1:
      emits('update', 'second', '*', 'second');
      emits('update', 'min', '*', 'second');
      break;
    case 2:
      emits('update', 'second', cycle01.value + '-' + cycle02.value);
      break;
    case 3:
      emits('update', 'second', average01.value + '/' + average02.value);
      break;
    case 4:
      emits('update', 'second', checkboxString.value.value);
      break;
  }
};
// 周期两个值变化时
const cycleChange = () => {
  if (radioValue.value == 2) {
    emits('update', 'second', cycleTotal.value.value);
  }
};
// 平均两个值变化时
const averageChange = () => {
  if (radioValue.value == 3) {
    emits('update', 'second', averageTotal.value.value);
  }
};
// checkbox值变化时
const checkboxChange = () => {
  if (radioValue.value == 4) {
    emits('update', 'second', checkboxString.value.value);
  }
};
const othChange = () => {
  //反解析
  let ins = props.cron.second
  if (ins === '*') {
    radioValue.value = 1;
  } else if (ins.indexOf('-') > -1) {
    radioValue.value = 2
  } else if (ins.indexOf('/') > -1) {
    radioValue.value = 3
  } else {
    radioValue.value = 4
    checkboxList.value = ins.split(',')
  }
};
watch(() => radioValue.value,
    (val) => radioChange(), {
      immediate: true,
      deep: true
    });
watch(() => cycleTotal.value,
    (val) => cycleChange(), {
      immediate: true,
      deep: true
    });
watch(() => averageTotal.value,
    (val) => averageChange(), {
      immediate: true,
      deep: true
    });
watch(() => checkboxString.value,
    (val) => checkboxChange(), {
      immediate: true,
      deep: true
    });
cycleTotal.value = computed(() => cycleTotalFun());
averageTotal.value = computed(() => averageTotalFun());
checkboxString.value = computed(() => checkboxStringFun());
onMounted(() => {
  radioValue.value = props.radioParent;
})
// 计算两个周期值
const cycleTotalFun = () => {
  cycle01.value = checkNum.value(cycle01.value, 0, 59)
  cycle02.value = checkNum.value(cycle02.value, 0, 59)
  return cycle01.value + '-' + cycle02.value;
};
// 计算平均用到的值
const averageTotalFun = () => {
  average01.value = checkNum.value(average01.value, 0, 59)
  average02.value = checkNum.value(average02.value, 1, 59)
  return average01.value + '/' + average02.value;
};
// 计算勾选的checkbox值合集
const checkboxStringFun = () => {
  let str = checkboxList.value.join();
  return str == '' ? '*' : str;
};
</script>
