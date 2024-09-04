<template>
  <div class="flow-setting-module">
    <div class="flow-setting-content">
      <div class="flow-setting-block">
        <div class="flow-block-title">提醒填写</div>
        <div class="flow-block-desc">通过设置推送提醒指定成员填写表单</div>
        <div class="flow-block-content">
          <el-row type="flex" :gutter="16">
            <el-col v-for="(item, i) in items" :key="i" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-card hoverable class="w-fill card-xx" @click="setSetting(item)">
                <div class="flowSetting-card-header">
                  <div class="flowSetting-card-header-title">
                    <img :src="flowMixin.settingBaseIcon"/>
                    <span>{{ item.name }}</span>
                  </div>
                  <div @click.stop>
                    <!-- 阻止el-switch冒泡事件, 在父添加@click.stop-->
                    <star-horse-icon iconClass="delete" theme="filled"/>
                  </div>
                </div>
                <div class="flowSetting-card-context">
                  <el-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
                    <el-form-item label="Note">

                    </el-form-item>
                    <el-form-item label="Gender">

                    </el-form-item>
                    <el-form-item :wrapper-col="{ span: 12, offset: 5 }">

                    </el-form-item>
                  </el-form>

                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="16">
                    <el-col class="gutter-row" :span="6">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                    <el-col class="gutter-row" :span="18">
                      <div class="gutter-box">
                        col-6
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <el-button icon="plus" block style="margin-top: 20px;">
            新增提醒
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import {ref} from "vue";

let bodyStyle = ref<any>({
  padding: '12px 12px 0',
  'margin-bottom': '8px',
  border: '1px solid rgba(17, 31, 44, 0.08)',
  'box-shadow': '0 2px 8px 0 rgb(17 31 44 / 4%)',
  'border-radius': '8px',
});
let form = ref<any>({});
let items = ref<Array<any>>([
  {
    id: '',
    name: '提醒方式',
    checked: true,
    des: 'xxxxxxxxxxxx',
    icon: '',
  },
  {
    id: '',
    name: '提醒方式',
    checked: true,
    icon: '',
  },
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
}
</script>
<style lang=“scss”></style>
