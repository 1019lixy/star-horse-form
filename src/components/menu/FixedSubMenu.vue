<script setup lang="ts">
import {computed, ref} from 'vue';
import StarHorseIcon from '@/components/comp/StarHorseIcon.vue';

const props = defineProps({
  dataList: {type: Array<any>, required: true},
  top: {type: String, default: '83px'},
  level: {type: Number, default: 1},
});
// let arrow = ref<string>("arrow-double-right");
let menuColor = computed(() => props.level > 1 ? 'var(--star-horse-font-color)' : 'var(--star-horse-white)');
let htop = ref<string>(computed(() => props.top).value == '83px' ? '65px' : '35px');
let currentItem = ref<any>({});
const overHandler = (item: any) => {
  currentItem.value = item;
};
const outHandler = () => {
  currentItem.value = {};
};
</script>
<template>
  <el-scrollbar height="100%" style="width: 100%">
    <template v-for="item in dataList">
      <div v-if="!item.children||item.children?.length==0" :index="item.meta.menuId" class="sub-menu-item">
        <div class="menu-item">
          <el-icon class="star-icon">
            <component :is="item.meta.menuIcon||'document'"/>
          </el-icon>
          <div class="link-url">
            <router-link :to="{ path: item.path }">{{ item.meta.title }}</router-link>
          </div>
        </div>
      </div>
      <div v-else :index="item.meta.menuId" class="sub-menu-list">
        <div class="menu-item-sub" @mouseover="overHandler(item)" @mouseout="outHandler">
          <el-icon class="star-icon">
            <component :is="item.meta.menuIcon||'document'"/>
          </el-icon>
          <span>{{ item.meta.title }}</span>
          <star-horse-icon
              size="16px"
              :icon-class="item.meta.menuId==currentItem.meta?.menuId?'arrow-double-left':'arrow-double-right'"
              class="sub-arrow"/>
        </div>
        <div class="sub-list">
          <FixedSubMenu :dataList="item.children" :level="level+1"></FixedSubMenu>
        </div>
      </div>
    </template>
  </el-scrollbar>
</template>
<style lang="scss" scoped>
.star-icon {
  font-size: 22px;
}

.sub-menu-item, .sub-menu-list {
  width: 100%;
  line-height: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;

  margin-top: 5px;

  .menu-item, .menu-item-sub {
    display: flex;
    flex: 1;
    width: 100%;
    flex-direction: row;
    align-items: center;

    .star-icon {
      height: 2rem;
      width: 2rem;
      color: var(--star-horse-style);
    }

    span, .link-url a {
      margin-left: 5px;
      font-weight: bold;
      display: block;
      line-height: 40px;
      height: 40px;
      font-size: 12px;
      color: #666;
      cursor: pointer;

    }

    &:hover {
      background: var(--star-horse-shadow);
    }

  }

  .menu-item {
    margin: 0 25px;
    .star-icon {
      height: 2rem;
      width: 2rem;
      color: var(--star-horse-style);
    }

  }

  .menu-item-sub {
    margin-left: 25px;

    &:hover {
      background: var(--star-horse-background);
    }
  }

  &:hover {
    background: v-bind(menuColor);
  }
}

.sub-menu-list {
  position: relative;
  width: 100%;

  .sub-arrow {
    color: var(--star-horse-style);
    position: absolute;
    right: 0;
  }

  &:hover .sub-list {
    display: block;
    opacity: 1;

  }

  .sub-list {
    display: none;
    opacity: 0;
    transition-delay: 1s;
    background: #6b778c;
    z-index: 9993;
    right: 0;
    left: 285px;
    position: fixed;
    top: v-bind(top);
    width: 200px;
    background: var(--star-horse-background);
    border: green;
    height: calc(100vh - v-bind(htop));
  }
}


</style>
