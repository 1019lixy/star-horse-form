<script setup lang="ts">
  import { flowCommon } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import { ref } from "vue";

  let bodyStyle = ref<any>({
    padding: "12px 12px 0",
    "margin-bottom": "8px",
    border: "1px solid rgba(17, 31, 44, 0.08)",
    "box-shadow": "0 2px 8px 0 rgb(17 31 44 / 4%)",
    "border-radius": "8px"
  });
  let form = ref<any>({});
  let items = ref<Array<any>>([
    {
      id: "",
      name: "提醒方式",
      checked: true,
      des: "xxxxxxxxxxxx",
      icon: ""
    },
    {
      id: "",
      name: "提醒方式",
      checked: true,
      icon: ""
    }
    /* {
    id: '',
    name: '提醒方式',
    checked: true,
    icon: '',
  },
  {
    id: '',
    name: '提醒方式',
    checked: false,
    icon: '',
  }, */
  ]);
  const setSetting = (item: any) => {
    console.log(item);
  };
  const deleteItem = (item: any) => {};
  const addItem = () => {};
</script>
<template>
  <div class="flow-module">
    <div class="flow-content">
      <div class="flow-block">
        <div class="flow-block-title">提醒填写</div>
        <div class="flow-block-desc">通过设置推送提醒指定成员填写表单</div>
        <div class="flow-block-content">
          <el-row type="flex" :gutter="16">
            <el-col v-for="(item, i) in items" :key="i" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-card hoverable class="w-fill card-xx" @click="setSetting(item)" :style="bodyStyle">
                <div class="flowSetting-card-header">
                  <div class="flowSetting-card-header-title">
                    <star-horse-icon iconClass="document" boxShow="true" />
                    <span>{{ item.name }}</span>
                  </div>
                  <div @click.stop="deleteItem(item)">
                    <star-horse-icon iconClass="delete" color="var(--el-color-danger)" cursor="pointer" />
                  </div>
                </div>
                <div class="flowSetting-card-context">
                  <el-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
                    <el-form-item label="Note"> bbbbb </el-form-item>
                    <el-form-item label="Gender"> fwfwfefwe </el-form-item>
                    <el-form-item :wrapper-col="{ span: 12, offset: 5 }"> fsfdsfds </el-form-item>
                  </el-form>

                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box"> col-6 </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-button icon="plus" block style="margin-top: 20px" @click.stop="addItem"> 新增提醒 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="“scss”"></style>
