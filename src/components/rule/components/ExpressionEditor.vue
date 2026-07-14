<template>
  <div class="expr-editor" ref="rootRef">
    <div class="expr-wrap" :class="{ 'is-focus': focused }">
      <pre class="expr-highlight" aria-hidden="true"><span v-html="highlighted"></span><br /></pre>
      <textarea
        ref="taRef"
        class="expr-input"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        spellcheck="false"
        @input="onInput"
        @keydown="onKeydown"
        @scroll="syncScroll"
        @focus="focused = true"
        @blur="onBlur"
      ></textarea>
    </div>
    <!-- 建议面板 -->
    <div v-if="suggestionVisible" class="expr-suggest">
      <template v-if="varSuggestions.length">
        <div class="suggest-title">{{ i18n('rule.expr.variables') }}</div>
        <div
          v-for="(v, i) in varSuggestions"
          :key="'v' + v.field"
          class="suggest-item"
          :class="{ active: activeIndex === i }"
          @mousedown.prevent="insertVariable(v)"
          @mouseenter="activeIndex = i"
        >
          <span class="si-dot" :style="{ background: typeColor(v.type) }"></span>
          <span class="si-label">{{ v.label || v.field }}</span>
          <span class="si-field">{{ v.field }}</span>
          <span class="si-type">{{ typeText(v.type) }}</span>
        </div>
      </template>
      <template v-if="funcSuggestions.length">
        <div class="suggest-title">{{ i18n('rule.expr.functions') }}</div>
        <div
          v-for="(f, i) in funcSuggestions"
          :key="'f' + f.name"
          class="suggest-item"
          :class="{ active: activeIndex === varSuggestions.length + i }"
          @mousedown.prevent="insertFunction(f)"
          @mouseenter="activeIndex = varSuggestions.length + i"
        >
          <span class="si-fn">ƒ</span>
          <span class="si-label">{{ f.name }}()</span>
          <span class="si-desc">{{ f.desc }}</span>
        </div>
      </template>
      <div v-if="!varSuggestions.length && !funcSuggestions.length" class="suggest-empty">
        {{ i18n('rule.expr.noMatch') }}
      </div>
    </div>
    <div v-if="showHint" class="expr-hint">{{ i18n('rule.expr.hint') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { i18n } from '@/lang'

type VarType = 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ARRAY'
interface RuleVariable {
  field: string; label: string; type: string;
  source: string; defaultValue?: string; desc?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  variables?: RuleVariable[]
  placeholder?: string
  rows?: number
  showHint?: boolean
}>(), {
  variables: () => [],
  placeholder: '',
  rows: 2,
  showHint: true
})

const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>()

const rootRef = ref<HTMLElement>()
const taRef = ref<HTMLTextAreaElement>()
const focused = ref(false)
const activeIndex = ref(0)

// 内置函数库
const FUNCTIONS = [
  { name: 'SUM', desc: i18n('rule.expr.fnSum'), args: '(...nums)' },
  { name: 'AVG', desc: i18n('rule.expr.fnAvg'), args: '(...nums)' },
  { name: 'MIN', desc: i18n('rule.expr.fnMin'), args: '(...nums)' },
  { name: 'MAX', desc: i18n('rule.expr.fnMax'), args: '(...nums)' },
  { name: 'ROUND', desc: i18n('rule.expr.fnRound'), args: '(x, n)' },
  { name: 'ABS', desc: i18n('rule.expr.fnAbs'), args: '(x)' },
  { name: 'LEN', desc: i18n('rule.expr.fnLen'), args: '(s)' },
  { name: 'CONCAT', desc: i18n('rule.expr.fnConcat'), args: '(...strs)' },
  { name: 'UPPER', desc: i18n('rule.expr.fnUpper'), args: '(s)' },
  { name: 'LOWER', desc: i18n('rule.expr.fnLower'), args: '(s)' },
  { name: 'NOW', desc: i18n('rule.expr.fnNow'), args: '()' },
  { name: 'IF', desc: i18n('rule.expr.fnIf'), args: '(cond, a, b)' },
  { name: 'IS_EMPTY', desc: i18n('rule.expr.fnIsEmpty'), args: '(x)' }
]
const FUNC_NAMES = new Set(FUNCTIONS.map(f => f.name))

// 当前光标处的 token
const currentToken = ref('')
const caretPos = ref(0)

const suggestionVisible = computed(() => focused.value && currentToken.value.length >= 1)

const varSuggestions = computed(() => {
  const kw = currentToken.value.toLowerCase()
  return props.variables.filter(v =>
    v.field.toLowerCase().includes(kw) || (v.label || '').toLowerCase().includes(kw)
  ).slice(0, 8)
})
const funcSuggestions = computed(() => {
  const kw = currentToken.value.toLowerCase()
  return FUNCTIONS.filter(f => f.name.toLowerCase().includes(kw)).slice(0, 6)
})

// ===== 语法高亮 =====
const escapeHtml = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const tokenize = (code: string) => {
  const tokens: { type: string; val: string }[] = []
  const re = /(\s+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*)|([+\-*/%<>!=&|^]+)|([(),.\[\]{}:;])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    if (m[1]) tokens.push({ type: 'ws', val: m[1] })
    else if (m[2]) tokens.push({ type: 'str', val: m[2] })
    else if (m[3]) tokens.push({ type: 'num', val: m[3] })
    else if (m[4]) tokens.push({ type: 'id', val: m[4] })
    else if (m[5]) tokens.push({ type: 'op', val: m[5] })
    else if (m[6]) tokens.push({ type: 'punc', val: m[6] })
  }
  return tokens
}

const varFieldSet = computed(() => new Set(props.variables.map(v => v.field)))

const highlighted = computed(() => {
  const code = props.modelValue || ''
  if (!code) return ''
  const tokens = tokenize(code)
  // 预判函数：id 后面（跳过空白）紧跟 '('
  const nextNonWs = (i: number) => {
    for (let j = i + 1; j < tokens.length; j++) {
      if (tokens[j].type !== 'ws') return tokens[j]
    }
    return null
  }
  return tokens.map((t, i) => {
    const esc = escapeHtml(t.val)
    if (t.type === 'ws') return esc
    if (t.type === 'str') return `<span class="tk-str">${esc}</span>`
    if (t.type === 'num') return `<span class="tk-num">${esc}</span>`
    if (t.type === 'op') return `<span class="tk-op">${esc}</span>`
    if (t.type === 'id') {
      const nxt = nextNonWs(i)
      if (nxt && nxt.type === 'punc' && nxt.val === '(' && FUNC_NAMES.has(t.val.toUpperCase())) {
        return `<span class="tk-fn">${esc}</span>`
      }
      if (varFieldSet.value.has(t.val)) {
        return `<span class="tk-var">${esc}</span>`
      }
      return `<span class="tk-id">${esc}</span>`
    }
    return esc
  }).join('')
})

// ===== 输入处理 =====
const onInput = (e: Event) => {
  const ta = e.target as HTMLTextAreaElement
  emit('update:modelValue', ta.value)
  updateToken(ta)
}

const updateToken = (ta: HTMLTextAreaElement) => {
  const pos = ta.selectionStart
  caretPos.value = pos
  const val = ta.value
  // 从光标向前找token边界（字母数字下划线点）
  let start = pos
  while (start > 0 && /[\w.]/.test(val[start - 1])) start--
  currentToken.value = val.slice(start, pos)
  activeIndex.value = 0
}

const syncScroll = (e: Event) => {
  const ta = e.target as HTMLTextAreaElement
  const pre = ta.previousElementSibling as HTMLElement
  if (pre) {
    pre.scrollTop = ta.scrollTop
    pre.scrollLeft = ta.scrollLeft
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (suggestionVisible.value) {
    const total = varSuggestions.value.length + funcSuggestions.value.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % Math.max(total, 1)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + Math.max(total, 1)) % Math.max(total, 1)
      return
    }
    if ((e.key === 'Enter' || e.key === 'Tab') && total > 0) {
      e.preventDefault()
      pickActive()
      return
    }
    if (e.key === 'Escape') {
      currentToken.value = ''
      return
    }
  }
  // 输入 $ 触发变量列表（清空token让全部变量显示）
  if (e.key === '$') {
    nextTick(() => {
      if (taRef.value) {
        // 删除 $ 字符
        const ta = taRef.value
        const pos = ta.selectionStart
        const v = ta.value
        const newVal = v.slice(0, pos - 1) + v.slice(pos)
        emit('update:modelValue', newVal)
        nextTick(() => {
          ta.setSelectionRange(pos - 1, pos - 1)
          currentToken.value = ''
          activeIndex.value = 0
        })
      }
    })
  }
}

const pickActive = () => {
  const vi = varSuggestions.value.length
  if (activeIndex.value < vi) {
    insertVariable(varSuggestions.value[activeIndex.value])
  } else {
    insertFunction(funcSuggestions.value[activeIndex.value - vi])
  }
}

const replaceCurrentToken = (replacement: string) => {
  const ta = taRef.value
  if (!ta) return
  const pos = caretPos.value
  const val = ta.value
  let start = pos
  while (start > 0 && /[\w.]/.test(val[start - 1])) start--
  const newVal = val.slice(0, start) + replacement + val.slice(pos)
  emit('update:modelValue', newVal)
  const newPos = start + replacement.length
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(newPos, newPos)
    currentToken.value = ''
  })
}

const insertVariable = (v: RuleVariable) => replaceCurrentToken(v.field)
const insertFunction = (f: { name: string }) => replaceCurrentToken(f.name + '()')

const onBlur = () => {
  focused.value = false
  currentToken.value = ''
}

// ===== 类型显示辅助 =====
const typeText = (t: string) => ({
  STRING: i18n('rule.dialog.string'), NUMBER: i18n('rule.dialog.number'),
  DATE: i18n('rule.dialog.date'), BOOLEAN: i18n('rule.dialog.boolean'), ARRAY: i18n('rule.dialog.array')
}[t] || t)
const typeColor = (t: string) => ({
  STRING: '#2563eb', NUMBER: '#059669', DATE: '#d97706', BOOLEAN: '#7c3aed', ARRAY: '#0891b2'
}[t] || '#64748b')
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.expr-editor {
  position: relative;
  width: 100%;
}

.expr-wrap {
  position: relative;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  background: $rd-bg-surface;
  transition: border-color $rd-transition-fast, box-shadow $rd-transition-fast;
  &.is-focus {
    border-color: $rd-primary;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
  }
}

.expr-highlight,
.expr-input {
  margin: 0;
  padding: $rd-space-2 $rd-space-3;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: $rd-font-sm;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  box-sizing: border-box;
}

.expr-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: $rd-text-primary;
  overflow: hidden;
  z-index: 0;
  min-height: 100%;
}

.expr-input {
  position: relative;
  display: block;
  width: 100%;
  border: none;
  outline: none;
  resize: vertical;
  background: transparent;
  color: transparent;
  caret-color: $rd-primary;
  z-index: 1;
  &::placeholder { color: $rd-text-tertiary; }
  &::selection { background: rgba(79, 70, 229, 0.2); }
}

// token 颜色
:deep(.tk-var) { color: #2563eb; font-weight: 500; }
:deep(.tk-fn) { color: #7c3aed; font-weight: 600; }
:deep(.tk-num) { color: #059669; }
:deep(.tk-str) { color: #d97706; }
:deep(.tk-op) { color: #94a3b8; }
:deep(.tk-id) { color: $rd-text-primary; }

// 建议面板
.expr-suggest {
  position: absolute;
  z-index: 9999;
  top: calc(100% + 4px);
  left: 0;
  min-width: 280px;
  max-width: 100%;
  max-height: 280px;
  overflow-y: auto;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  box-shadow: $rd-shadow-lg;
  padding: $rd-space-1;
}

.suggest-title {
  font-size: 10px;
  font-weight: 600;
  color: $rd-text-tertiary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: $rd-space-1 $rd-space-2;
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: $rd-space-2;
  padding: $rd-space-1 $rd-space-2;
  border-radius: $rd-radius-sm;
  cursor: pointer;
  font-size: $rd-font-xs;
  transition: background $rd-transition-fast;
  &.active, &:hover { background: $rd-primary-bg; }
  .si-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .si-fn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: $rd-radius-sm;
    background: rgba(124, 58, 237, 0.12); color: #7c3aed;
    font-weight: 700; font-size: 11px; flex-shrink: 0;
  }
  .si-label { color: $rd-text-primary; font-weight: 500; }
  .si-field {
    color: $rd-text-tertiary; font-family: ui-monospace, monospace; font-size: 10px;
    margin-left: auto;
  }
  .si-type {
    color: #2563eb; font-size: 10px; font-weight: 600;
  }
  .si-desc { color: $rd-text-tertiary; font-size: 10px; margin-left: auto; }
}

.suggest-empty {
  padding: $rd-space-3;
  text-align: center;
  font-size: $rd-font-xs;
  color: $rd-text-tertiary;
}

.expr-hint {
  margin-top: $rd-space-1;
  font-size: 10px;
  color: $rd-text-tertiary;
  line-height: 1.4;
}
</style>
