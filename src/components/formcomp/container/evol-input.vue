<template>
  <div ref="input" class="input-div" :contenteditable="isEdit?'plaintext-only':false" @click.stop @mousedown.stop
       @blur="inputVal"/>
</template>
<script>
function keepLastIndex(obj) {
  if (window.getSelection) { // ie11 10 9 ff safari
    obj.focus() // 解决ff不获取焦点无法定位问题
    const range = window.getSelection() // 创建range
    range.selectAllChildren(obj) // range 选择obj下所有子内容
    range.collapseToEnd() // 光标移至最后
  } else if (document.selection) { // ie10 9 8 7 6 5
    const range = document.selection.createRange() // 创建选择对象
    // var range = document.body.createTextRange();
    range.moveToElementText(obj) // range定位到obj
    range.collapse(false) // 光标移至最后
    range.select()
  }
}
export default {
  name: "evol-input",
  props: {
    value: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      default: +new Date() + ''
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    showBorder: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value(val) {
      this.$nextTick(() => {
        this.$refs.input.innerHTML = this.value
      })
    }
  },
  mounted() {
    this.$refs.input.innerHTML = this.value
  },
  methods: {
    inputVal(event) {
      this.$emit('input', event.target.innerHTML)
    },
    inputFocus() {
      setTimeout(() => {
        // document.getElementById(this.inputId).focus()
        //  keepLastIndex(document.getElementById(this.inputId))
        if (this.$refs.input) {
          this.$refs.input.focus()
          keepLastIndex(this.$refs.input)
        }
      }, 2)
    },
    inputBlur() {
      setTimeout(() => {
        if (this.$refs.input) {
          this.$refs.input.blur()
        }
      }, 2)
    }
  }
}
</script>
<style lang="scss" scoped>
.input-div {
  display: inline-block;
  min-width: 10px;
  word-break: break-all;
  white-space: pre-wrap;
  padding: 1px 0px;
}
</style>
