<script setup lang="ts" name="StarHorseHmenu">
import {inject, onMounted, ref} from "vue";
import {postRequest} from "@/api/star_horse";
import {getUserInfo} from "@/utils/auth";
import SubSystemMenu from "@/components/menu/SubSystemMenu.vue";

let dataList = ref([]);
const loadMenuFun = inject("loadMenu") as Function;
const handleSelect = (data: any) => {
  loadMenuFun(data);
};
let query = getUserInfo().idUsersinfo;
const initData = async () => {
  await postRequest("/system-config/system/informationsEntity/getUserSystem/" + query, [])
    .then((res) => {
      dataList.value = res?.data?.data;
    })
    .catch((err) => {
      console.log(err);
    });
};
onMounted(()=>{
  initData();
});
</script>

<style lang="scss" scoped>
.el-menu--horizontal {
  .el-menu-item {
    height: inherit;
  }
  .el-menu-item.is-active,
  .el-menu-item:hover,
  .el-submenu__title:hover,
  .el-submenu__title.is-opened {
    background-color: unset !important;
  }
}

:deep(.el-submenu__title:hover),
:deep(.el-sub-menu:hover),
.el-tooltip__trigger:hover,
.el-submenu__title.is-opened {
  background-color: unset !important;
}

.sub-class {
  background-color: var(--star-horse-style);;

  div:hover {
    background-color: unset !important;
  }
}

.el-popper,
.el-menu--popup-container {
  ul {
    background-color: var(--star-horse-style);;
  }

  background-color: var(--star-horse-style);;
}

.sub-class:hover {
  background-color: unset !important;
}

.el-menu-demo {
  max-height: 50px;
  background-color: unset;
  border-bottom: none;
  color: var(--star-horse-white);
  font-weight: bold;
  font-size: 16px;

}
:deep(.el-menu-item ){
  padding: 0 3px;
}
:deep(.el-sub-menu) {
  background-color: unset !important;
}

.star-icon {
  font-size: 26px;
  color: var(--star-horse-white);;
}

:deep(.el-icon) {
  color: var(--star-horse-white);;
}

:deep(.el-popper.is-light) {
  background-color: var(--star-horse-style);;
}
</style>
<template>
  <el-menu
    class="el-menu-demo"
    mode="horizontal"
    text-color="#fff"
    active-text-color="#ffd04b"
    background-color="#409eff"
    @select="handleSelect"
  >
    <sub-system-menu :dataList="dataList"/>
  </el-menu>
</template>
