<script setup lang="ts" name="SubNodeInfo">
import {ref} from "vue";


const nodeInfo = ref<any>({});
const successFlag = ref<number>(2);
const errorFlag = ref<number>(2);

</script>

<style lang="scss" scoped>
.report-switch {
  display: block;
  width: 100%;
  vertical-align: middle;
  margin-left: 15px;
}

.report-content {
  margin: 0 20px;
}

.el-sub-menu {
  margin-top: 10px;
  border: 1px solid #e8e8e8;
}
</style>
<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>节点信息</span>
        <el-button class="init-btn" text>
          <star-horse-icon icon-class="fa-plus" style="vertical-align: middle;"/>
          拷贝已配置信息
        </el-button>
      </div>
    </template>
    <el-row>
      <el-col :span="12">
        <el-form-item disabled label="节点类型" prop="nodeType">
          <el-input placeholder="请输入节点类型" v-model="nodeInfo.nodeType"/>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11">
        <el-form-item label="节点名称" prop="nodeName" required>
          <el-input placeholder="请输入节点名称" v-model="nodeInfo.nodeName"/>
        </el-form-item>
      </el-col>
      <el-col :span="2"></el-col>
      <el-col :span="11">
        <el-form-item label="执行方式" prop="execType">
          <el-radio-group v-model="nodeInfo.execType">
            <el-radio label="1">自动</el-radio>
            <el-radio label="2">手动</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11">
        <el-form-item label="归档制品" prop="uploadProduct">
          <el-input/>
          <el-button class="init-btn" text>
            <star-horse-icon icon-class="fa-plus" style="vertical-align: middle;"/>
            添加目录
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11">
        <el-form-item label="获取制品" prop="downloadProduct">
          <el-select></el-select>
          <el-button class="init-btn" text>
            <star-horse-icon icon-class="fa-plus" style="vertical-align: middle;"/>
            添加制品来源
          </el-button>
        </el-form-item>
      </el-col>
    </el-row>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>节点信息</span>
        </div>
      </template>
      <el-row>
        <el-col :span="11">
          <el-form-item label="编译类型" prop="compileType">
            <el-select clearable filterable v-model="nodeInfo.compileType">
              <el-option label="Maven" value="maven"/>
              <el-option label="Gradle" value="gradle"/>
              <el-option label="Ant" value="ant"/>
              <el-option label="Docker容器内编译" value="docker"/>
              <el-option label="自定义" value="user"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="JDK版本" prop="jdkVersion">
            <el-select/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="Maven版本" prop="mavenVersion">
            <el-select/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="Pom文件" prop="pomName">
            <el-input v-model="nodeInfo.pomName"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-form-item label="编译脚本" prop="script">
            <el-input rows="5" type="textarea" v-model="nodeInfo.script"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-form-item label="镜像名称" prop="imageName">
            <el-input v-model="nodeInfo.imageName"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-menu>
        <el-sub-menu index="1">
          <template #title>
            高级设置
          </template>
          <el-checkbox label="1">使用唯一镜像名称</el-checkbox>
          <el-form-item label="关联使用执行机">
            <el-select/>
          </el-form-item>
        </el-sub-menu>
      </el-menu>
      <el-menu>
        <el-sub-menu index="2">
          <template #title>
            运行结果通知
          </template>
          <span class="report-switch">失败时通知 &nbsp;&nbsp;<el-switch @change="(a)=>errorFlag=a"
                                                                        active-value="1"
                                                                        inactive-value="2"
                                                                        v-model="nodeInfo.errorReport"/></span>
          <div class="report-content" v-if="errorFlag==1">
            <el-form-item label="通知人" prop="errorReportList">
              <el-checkbox-group v-model="nodeInfo.errorReportList">
                <el-checkbox label="1">作业操作人</el-checkbox>
                <el-checkbox label="2">流水线操作作人</el-checkbox>
                <el-checkbox label="3">代码提交人&nbsp;&nbsp;<el-select/>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <hr>
            <el-form-item label="通知方式" prop="reportType">
              <el-checkbox-group v-model="nodeInfo.reportType">
                <el-checkbox label="1">QQ通知</el-checkbox>
                <el-checkbox label="2">微信通知</el-checkbox>
                <el-checkbox label="3">邮件通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </div>
          <span class="report-switch">成功时通知&nbsp;&nbsp;<el-switch @change="(a)=>successFlag=a"
                                                                       active-value="1"
                                                                       inactive-value="2"
                                                                       v-model="nodeInfo.successReport"/></span>
          <div class="report-content" v-if="successFlag==1">
            <el-form-item label="通知人" prop="successReportList">
              <el-checkbox-group v-model="nodeInfo.successReportList">
                <el-checkbox label="1">作业操作人</el-checkbox>
                <el-checkbox label="2">流水线操作作人</el-checkbox>
                <el-checkbox label="3">代码提交人&nbsp;&nbsp;<el-select/>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <hr>
            <el-form-item label="通知方式" prop="reportType">
              <el-checkbox-group v-model="nodeInfo.reportType">
                <el-checkbox label="1">QQ通知</el-checkbox>
                <el-checkbox label="2">微信通知</el-checkbox>
                <el-checkbox label="3">邮件通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </div>
        </el-sub-menu>

      </el-menu>
    </el-card>
  </el-card>
</template>