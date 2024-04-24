<script lang="ts" setup>
import AppHeader from "@/components/AppHeader.vue";
import AppLeft from "@/components/AppLeft.vue";
import router from "@/router";
import {computed, provide, ref, watch} from "vue";
import {navBarList} from "@/store/NavbarListStore";
import {viewList} from "@/store/ViewCacheStore";
import TagsView from "@/components/tags/TagsView.vue";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const route = router.getRoutes().find(item => item.path == "/home");
let navBarListStore = navBarList();
let viewListStore = viewList();
let isCollapse = ref<boolean>(true);
let sysemId = ref<string>("-1");
let outerIsCollapse = ref<string>("64px");
navBarListStore.addNavBar(route);
const language = ref('zhCn')
const locale = computed(() => (language.value === 'zhCn' ? zhCn : en));
const changeLang = (lang: string) => {
  language.value = lang;
};
const loadMenuFun = (data: string) => {
  sysemId.value = data;
}
provide("loadMenu", loadMenuFun);
const mouseOver = () => {
  jQuery(".star-horse-left").addClass('show-scroll-bar');
};
const mouseOut = () => {
  jQuery(".star-horse-left").removeClass('show-scroll-bar');
};

const collopseOperation = () => {
  isCollapse.value = !isCollapse.value;
};


watch(
    () => isCollapse.value,
    (val: boolean) => {
      setTimeout(function () {
        outerIsCollapse.value = val ? "200px" : "64px";
      }, 200);
    }, {
      immediate: true
    }
)
</script>
<template>
  <el-config-provider :locale="locale">
    <el-container style="max-height: 100%">
      <el-header class="star-horse-header">
        <app-header :is-collapse="!isCollapse" @collopseOperation="collopseOperation" @changeLang="changeLang"/>
      </el-header>
      <el-container style="height: calc( 100vh - 95px); padding-bottom:1cm; ">
        <el-aside :width="outerIsCollapse" class="star-horse-left animate__animated animate__bounceInLeft"
                  @mouseover="mouseOver" @mouseout="mouseOut">
          <app-left :sysem-id="sysemId" :is-collapse="!isCollapse" style="overflow-x: hidden"/>
        </el-aside>
        <el-main class="star-horse-main  animate__animated animate__bounceInUp">
          <tags-view/>
          <router-view v-slot="{ Component }" class="animate__animated animate__fadeIn">
            <transition name="solid">
              <keep-alive :include="viewListStore.getViewCache">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <el-backtop :bottom="100">
      <div class="page-up">
        UP
      </div>
    </el-backtop>
  </el-config-provider>
</template>


<style lang="scss" scoped>
.el-header {
  box-shadow: 0px 10px 5px var(--star-horse-white);
}

.el-menu--collapse {
  width: 100%;
  height: 100%;
}

.star-horse-main {
  margin-top: 5px;
}
</style>
