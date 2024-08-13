<script lang="ts" setup name="NotFound">
import {useRouter} from "vue-router";
const router = useRouter();
const backFun = () => {
  router.go(-2);
};
</script>
<style lang="scss" scoped>
body {
  margin: 0;
  padding: 0;
  background: var(--star-horse-background);
  font-family: Georgia, Times, Verdana, Geneva, Arial, Helvetica, sans-serif;
}
.not-found-card {
  margin: 0 auto;
  padding: 0;
  width: 50%;
  background: #e4e7ed;
  .error-content {
    display: flex;
    flex-direction: row;
    position: relative;
    .error-icon {
      flex: 1;
      margin: 0 auto;
      background: url(@/icons/404.svg) no-repeat center;
    }
    .errorText {
      width: 70%;
      div {
        display: block;
        width: 303px;
        font-size: 14px;
        line-height: 26px;
      }
    }
  }
}
h1 {
  font-size: 40px;
  margin-bottom: 35px;
}
</style>
<template>
  <el-card class="not-found-card">
    <div class="error-content">
      <div class="error-icon"></div>
      <div class="errorText">
        <h1>Sorry..页面没有找到！</h1>
        <div>
          似乎你所寻找的网页已移动或丢失了。
          <div>或者也许你只是键入错误了一些东西。</div>
          我们建议你返回首页进行浏览
        </div>
        <p>
          或者请与管理员联系，谢谢！
        </p>
      </div>
    </div>
    <hr>
    <el-button size="large" text @click="backFun">返回</el-button>
  </el-card>
</template>
