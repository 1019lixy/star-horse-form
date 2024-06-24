<template>
  <ul v-show="isShow" ref="menu" class="right-key-menu" :style="{left:x+'px',top:y+'px'}" @mousedown.stop>
    <li
        v-for="(item,index) in menuList"
        v-show="!item.hide"
        :key="index"
        :class="{'N-enable':!item.enable, 'active': index === activeIndex}"
        @mousemove.stop="closeMenuMove(index)"
        @mouseup.stop="closeMenu(index)"
    >
      <div @mousemove.stop>
        <span>{{ item.label }}</span>
        <p v-if="[3, 4].includes(index)" class="d-flex flex-column a-center j-center textAlign"
           :class="{'showtextAlign':showtextAlign}">
          <template v-if="activeIndex === 3">
            <span @mouseup.stop="closeMenu(activeIndex,'up')">上</span>
            <span @mouseup.stop="closeMenu(activeIndex,'down')">下</span>
          </template>
          <template v-if="activeIndex === 4">
            <span @mouseup.stop="closeMenu(activeIndex,'left')">左</span>
            <span @mouseup.stop="closeMenu(activeIndex,'right')">右</span>
          </template>
          <!-- <span @mouseup.stop="closeMenu(index,'left')">居左</span>
          <span @mouseup.stop="closeMenu(index,'center')">居中</span>
          <span @mouseup.stop="closeMenu(index,'right')">居右</span> -->
        </p>
      </div>
    </li>
  </ul>
</template>
<!--
      -->
<script setup lang="ts" name="right-key-menu">
/*export default {
  name: "right-key-menu",
  props: {
    menuList: {
      type: Array,
      default: () => [] // {label:'菜单名',enable：true/false,hide:false}
    }
  },
  data() {
    return {
      isShow: false,
      x: 0,
      y: 0,
      callback: null, // 回调方法,
      showtextAlign: false,
      text: '',
      activeIndex: -1
    }
  },
  created() {
    this.$nextTick(() => {
      document.removeEventListener('mouseup', this.hideMenu, false)
      document.addEventListener('mouseup', this.hideMenu, false)
    })
  },
  unmounted() {
    document.removeEventListener('mouseup', this.hideMenu, false)
  },
  methods: {
    open(event, callback) {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      this.isShow = true
      this.activeIndex = -1
      this.$nextTick(() => {
        const menuWidth = this.$refs.menu.offsetWidth
        const menuHeight = this.$refs.menu.offsetHeight
        this.x = event.x + menuWidth > width ? event.x - menuWidth : event.x
        this.y = event.y + menuHeight > height ? event.y - menuHeight : event.y
      })
      this.callback = callback
    },
    hideMenu() {
      this.isShow = false
      this.showtextAlign = false
    },
    closeMenuMove(clickNum, val) {
      if (!val) this.activeIndex = clickNum
      if ([3, 4].includes(clickNum) && !this.showtextAlign && !val) {
        this.showtextAlign = true
        return
      }
    },
    closeMenu(clickNum, val) {
      const isEnableCall = (this.menuList[clickNum] && this.menuList[clickNum].enable)
      if (clickNum === undefined || isEnableCall) {
        this.isShow = false
        this.showtextAlign = false
      }
      if ([3, 4].includes(this.activeIndex) && !val) return
      if (isEnableCall && clickNum !== null && typeof this.callback === 'function') {
        this.callback(this.menuList[clickNum].code, val)
      }
    }
  }
}*/
</script>
<style lang="scss" scoped="scoped">
.N-enable {
  color: #8F8F8F !important;
  cursor: default !important;
  &:hover {
    background-color: #fff !important;
    background-image: none !important;
  }
}
.right-key-menu {
  display: inline-block;
  position: fixed;
  left: 0;
  top: 0;
  // min-width:120px;
  padding: 8px 0;
  margin: 2px 0 0;
  font-size: 14px;
  text-align: left;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, .15);
  list-style: none;
  box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
  user-select: none;
  display: inline-block;
  min-width: 120px;
  text-rendering: auto;
  z-index: 9999999999;
  background-color: #fff;
  -webkit-font-smoothing: antialiased;
  li {
    padding: 4px 12px;
    color: #333;
    cursor: pointer;
    &.active {
      background-color: #e8e8e8;
      background-image: linear-gradient(to bottom, #f5f5f5 0, #e8e8e8 100%);
      background-repeat: repeat-x;
      color: #262626;
      text-decoration: none;
    }
  }
  .textAlign {
    position: absolute;
    right: -120px;
    top: 40px;
    bottom: auto;
    border: 1px solid rgba(0, 0, 0, .15);
    min-width: 120px;
    color: #333;
    cursor: pointer;
    background-color: #fff;
    line-height: 25px;
    display: none;
    span {
      cursor: pointer;
      width: 100%;
      text-align: center;
      &:hover {
        background-color: #e8e8e8;
        background-image: linear-gradient(to bottom, #f5f5f5 0, #e8e8e8 100%);
        background-repeat: repeat-x;
        color: #262626;
        text-decoration: none;
      }
    }
  }
  .showtextAlign {
    display: block;
    display: flex;
  }
}
</style>
