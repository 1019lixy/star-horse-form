import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import camelcase from "camelcase";

const OUT = 'template';
mkdirSync(OUT, { recursive: true });

// ── Helpers ──
const uid = () => randomUUID();
const fid = () => camelcase(["field",uid().substring(0, 6)]) ;
const mkId = () => 'Id' + uid();

function field(itemType, label, opts = {}) {
  const id = mkId();
  const name = fid();
  return {
    id, compType: 'formItem', itemType, fieldName: name,
    preps: {
      id, label, name, itemNameLabel: label,
      formVisible: opts.formVisible !== false,
      listVisible: opts.listVisible !== false,
      viewVisible: opts.viewVisible !== false,
      searchVisible: opts.searchVisible || false,
      required: opts.required || false,
      disabled: opts.disabled || false,
      clearable: opts.clearable !== false,
      readonly: opts.readonly || false,
      maxLength: opts.maxLength || 255,
      placeholder: opts.placeholder || `请输入${label}`,
      dataSource: opts.dataSource || '',
      values: opts.values || [],
      rules: opts.rules || [],
      helpMsg: opts.helpMsg || '',
      ...opts.extra,
    },
  };
}

function selectField(label, options, opts = {}) {
  return field('select', label, {
    ...opts,
    extra: {
      dataSource: 'data',
      values: options.map((v, i) => ({ label: v, value: String(i + 1) })),
      ...(opts.extra || {}),
    },
  });
}

function box2(...items) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'box', fieldName: name, rowNums: 1, columnNums: 2,
    preps: {
      id, label: 'Grid Layout', name, itemNameLabel: 'Grid Layout',
      elements: [{
        id: 'row-' + uid(), rowIndex: 1,
        columns: [
          { id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 12, items: [items[0]] },
          { id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 12, items: [items[1]] },
        ],
      }],
    },
  };
}

function box3(...items) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'box', fieldName: name, rowNums: 1, columnNums: 3,
    preps: {
      id, label: 'Grid Layout', name, itemNameLabel: 'Grid Layout',
      elements: [{
        id: 'row-' + uid(), rowIndex: 1,
        columns: [
          { id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 8, items: [items[0]] },
          { id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 8, items: [items[1]] },
          { id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 8, items: [items[2]] },
        ],
      }],
    },
  };
}

function boxFull(item) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'box', fieldName: name, rowNums: 1, columnNums: 1,
    preps: {
      id, label: 'Grid Layout', name, itemNameLabel: 'Grid Layout',
      elements: [{
        id: 'row-' + uid(), rowIndex: 1,
        columns: [{ id: 'col-' + uid(), cellVisible: true, colIndex: 1, colspan: 24, items: [item] }],
      }],
    },
  };
}

function card(label, items) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'card', fieldName: name,
    preps: {
      id, label, name, itemNameLabel: label,
      headerFieldList: [],
      elements: [{ label, tabName: label, objectName: label, subFormFlag: 'Y', items }],
    },
  };
}

function tab(tabs) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'tab', fieldName: name,
    preps: {
      id, label: 'Tab', name, itemNameLabel: 'Tab',
      elements: tabs.map(t => ({
        label: t.label, tabName: t.label, objectName: t.label, subFormFlag: 'Y', items: t.items,
      })),
    },
  };
}

function collapse(panels) {
  const id = mkId(); const name = fid();
  return {
    id, compType: 'container', itemType: 'collapse', fieldName: name,
    preps: {
      id, label: 'Collapse', name, itemNameLabel: 'Collapse',
      elements: panels.map(p => ({
        label: p.label, tabName: p.label, objectName: p.label, subFormFlag: 'Y', items: p.items,
      })),
    },
  };
}

function divider(label) {
  return field('divider', label, { extra: { direction: 'horizontal' } });
}

function save(filename, list, formInfoExtra = {}) {
  const data = {
    formInfo: { formName: filename.replace('.json', ''), currentPageType: 'pc', ...formInfoExtra },
    dataList: list,
    exportTime: new Date().toISOString(),
    version: '1.0',
  };
  writeFileSync(join(OUT, filename), JSON.stringify(data, null, 2), 'utf8');
  console.log(`  ✓ ${filename}`);
}

// ══════════════════════════════════════════════════
// 20 Templates
// ══════════════════════════════════════════════════

console.log('Generating 20 base templates...\n');

// ── 1. 用户注册 ──
save('01-用户注册表单.json', [
  card('基本信息', [
    box2(field('input', '用户名', { required: true, maxLength: 20 }), field('input', '邮箱', { required: true })),
    box2(field('password', '密码', { required: true, maxLength: 32 }), field('password', '确认密码', { required: true, maxLength: 32 })),
    box2(field('input', '手机号', { required: true, maxLength: 11 }), field('date', '出生日期')),
  ]),
  card('详细资料', [
    selectField('性别', ['男', '女', '其他']),
    field('textarea', '个人简介', { maxLength: 500 }),
    field('upload', '头像上传'),
  ]),
  boxFull(field('checkbox', '我已阅读并同意用户协议', { required: true })),
  boxFull(field('button', '注册', { extra: { buttonType: 'primary' } })),
]);

// ── 2. 用户登录 ──
save('02-用户登录表单.json', [
  field('input', '用户名/邮箱', { required: true, placeholder: '请输入用户名或邮箱' }),
  field('password', '密码', { required: true }),
  box2(field('input', '验证码', { maxLength: 6 }), field('button', '获取验证码')),
  field('checkbox', '记住我'),
  boxFull(field('button', '登录', { extra: { buttonType: 'primary' } })),
]);

// ── 3. 个人信息 ──
save('03-个人信息表单.json', [
  card('个人资料', [
    box2(field('input', '姓名', { required: true }), selectField('性别', ['男', '女'])),
    box2(field('date', '出生日期'), field('input', '身份证号', { maxLength: 18 })),
    field('upload', '头像'),
  ]),
  card('联系方式', [
    box2(field('input', '手机号', { required: true, maxLength: 11 }), field('input', '邮箱')),
    box2(field('input', '微信号'), field('input', 'QQ号')),
    field('input', '家庭地址'),
  ]),
  card('工作信息', [
    box2(field('input', '公司名称'), field('input', '职位')),
    field('input', '工作地址'),
    field('textarea', '个人简介', { maxLength: 300 }),
  ]),
]);

// ── 4. 商品管理 ──
save('04-商品管理表单.json', [
  card('基本信息', [
    box2(field('input', '商品名称', { required: true }), selectField('商品分类', ['电子产品', '服装鞋帽', '食品饮料', '家居用品', '图书文具', '其他'])),
    box3(field('number', '售价', { required: true, extra: { min: 0, precision: 2 } }), field('number', '成本价', { extra: { min: 0, precision: 2 } }), field('number', '库存数量', { required: true, extra: { min: 0, precision: 0 } })),
    box2(selectField('品牌', ['品牌A', '品牌B', '品牌C', '其他']), field('input', '商品编码', { required: true })),
  ]),
  card('商品详情', [
    field('textarea', '商品描述', { maxLength: 1000 }),
    field('upload', '商品图片'),
    field('upload', '详情图片'),
    field('htmleditor', '详细描述'),
  ]),
  card('规格参数', [
    field('input-tag', '商品标签'),
    box2(field('number', '重量(kg)', { extra: { min: 0, precision: 2 } }), field('number', '尺寸(cm)')),
    selectField('商品状态', ['上架', '下架', '预售']),
  ]),
]);

// ── 5. 员工信息 ──
save('05-员工信息表单.json', [
  tab([
    { label: '基本信息', items: [
      box2(field('input', '员工姓名', { required: true }), field('input', '工号', { required: true })),
      box2(selectField('性别', ['男', '女']), field('date', '出生日期')),
      box2(field('input', '身份证号', { maxLength: 18 }), field('input', '手机号', { required: true, maxLength: 11 })),
      field('input', '邮箱'),
      field('upload', '证件照'),
    ]},
    { label: '工作信息', items: [
      box2(selectField('部门', ['技术部', '产品部', '市场部', '人事部', '财务部', '运营部']), selectField('职位', ['初级工程师', '中级工程师', '高级工程师', '技术经理', '总监'])),
      box2(field('date', '入职日期', { required: true }), selectField('用工类型', ['全职', '兼职', '实习', '外包'])),
      field('number', '基本工资', { extra: { min: 0, precision: 2 } }),
      field('input', '直属上级'),
    ]},
    { label: '紧急联系人', items: [
      box2(field('input', '联系人姓名', { required: true }), field('input', '联系人电话', { required: true })),
      field('input', '与员工关系'),
      field('input', '联系人地址'),
    ]},
  ]),
]);

// ── 6. 请假申请 ──
save('06-请假申请表单.json', [
  card('请假信息', [
    box2(field('input', '申请人', { required: true, disabled: true }), selectField('部门', ['技术部', '产品部', '市场部', '人事部', '财务部'])),
    selectField('请假类型', ['年假', '事假', '病假', '婚假', '产假', '丧假', '调休'], { required: true }),
    box2(field('datetime', '开始时间', { required: true }), field('datetime', '结束时间', { required: true })),
    field('number', '请假天数', { required: true, extra: { min: 0.5, precision: 1 } }),
    field('textarea', '请假事由', { required: true, maxLength: 500 }),
  ]),
  card('审批信息', [
    field('input', '审批人', { disabled: true }),
    selectField('审批状态', ['待审批', '已通过', '已拒绝', '已撤回']),
    field('textarea', '审批意见'),
  ]),
]);

// ── 7. 报修申请 ──
save('07-报修申请表单.json', [
  card('报修信息', [
    box2(field('input', '报修人', { required: true }), field('input', '联系电话', { required: true, maxLength: 11 })),
    box2(field('input', '报修地点', { required: true }), selectField('故障类型', ['电力故障', '水管问题', '门窗损坏', '空调故障', '网络故障', '家具损坏', '其他'])),
    selectField('紧急程度', ['紧急', '一般', '不紧急'], { required: true }),
    field('textarea', '问题描述', { required: true, maxLength: 500 }),
    field('upload', '现场照片'),
    field('datetime', '期望维修时间'),
  ]),
  card('处理信息', [
    field('input', '维修人员'),
    selectField('处理状态', ['待处理', '处理中', '已完成', '已关闭']),
    field('textarea', '处理结果'),
    field('datetime', '完成时间'),
  ]),
]);

// ── 8. 合同管理 ──
save('08-合同管理表单.json', [
  card('合同基本信息', [
    box2(field('input', '合同编号', { required: true }), selectField('合同类型', ['采购合同', '销售合同', '服务合同', '租赁合同', '劳动合同', '其他'])),
    box2(field('input', '合同名称', { required: true }), field('input', '合同金额(元)', { required: true })),
    box2(field('date', '签订日期', { required: true }), field('date', '到期日期', { required: true })),
    selectField('合同状态', ['草稿', '审批中', '已签署', '执行中', '已到期', '已终止']),
  ]),
  card('签约方信息', [
    box2(field('input', '甲方名称', { required: true }), field('input', '甲方联系人')),
    box2(field('input', '乙方名称', { required: true }), field('input', '乙方联系人')),
    field('textarea', '合同摘要', { maxLength: 500 }),
  ]),
  card('附件', [
    field('upload', '合同文件'),
    field('upload', '补充文件'),
  ]),
]);

// ── 9. 客户管理 ──
save('09-客户管理表单.json', [
  card('客户基本信息', [
    box2(field('input', '客户名称', { required: true }), selectField('客户类型', ['企业客户', '个人客户', 'VIP客户', '代理商'])),
    box2(field('input', '联系人', { required: true }), field('input', '联系电话', { required: true })),
    box2(field('input', '邮箱'), field('input', '公司网站')),
    selectField('所属行业', ['互联网', '金融', '教育', '医疗', '制造业', '零售', '其他']),
    field('input', '客户地址'),
  ]),
  card('商务信息', [
    box2(field('input', '客户经理'), selectField('客户来源', ['线上推广', '线下活动', '老客户推荐', '电话营销', '其他'])),
    box2(field('number', '预估金额', { extra: { min: 0, precision: 2 } }), selectField('客户等级', ['A级', 'B级', 'C级', 'D级'])),
    field('textarea', '客户需求', { maxLength: 500 }),
    field('textarea', '跟进记录', { maxLength: 1000 }),
  ]),
]);

// ── 10. 项目管理 ──
save('10-项目管理表单.json', [
  card('项目概况', [
    box2(field('input', '项目名称', { required: true }), field('input', '项目编号', { required: true })),
    box2(selectField('项目类型', ['产品研发', '系统集成', '运维服务', '咨询服务', '其他']), selectField('优先级', ['P0-紧急', 'P1-高', 'P2-中', 'P3-低'])),
    field('textarea', '项目描述', { required: true, maxLength: 1000 }),
  ]),
  card('时间与预算', [
    box2(field('date', '计划开始', { required: true }), field('date', '计划结束', { required: true })),
    box3(field('number', '预算(万元)', { extra: { min: 0, precision: 2 } }), field('number', '已花费(万元)', { extra: { min: 0, precision: 2 } }), field('slider', '进度(%)', { extra: { min: 0, max: 100 } })),
    selectField('项目状态', ['规划中', '进行中', '已暂停', '已完成', '已取消']),
  ]),
  card('团队与资源', [
    box2(field('input', '项目负责人', { required: true }), field('input', '技术负责人')),
    field('input-tag', '团队成员'),
    field('textarea', '风险与备注'),
  ]),
]);

// ── 11. 会议申请 ──
save('11-会议申请表单.json', [
  card('会议信息', [
    box2(field('input', '会议主题', { required: true }), selectField('会议类型', ['周会', '月度总结', '项目评审', '需求讨论', '头脑风暴', '培训', '其他'])),
    box2(field('datetime', '开始时间', { required: true }), field('datetime', '结束时间', { required: true })),
    selectField('会议室', ['A101-大会议室', 'B202-中会议室', 'C303-小会议室', '线上-腾讯会议', '线上-钉钉'], { required: true }),
    field('input', '参会人员', { required: true, placeholder: '请输入参会人，逗号分隔' }),
    field('textarea', '会议议程', { maxLength: 1000 }),
    field('upload', '会议资料'),
  ]),
  card('会后纪要', [
    field('textarea', '会议纪要', { maxLength: 2000 }),
    box2(field('input', '记录人'), field('datetime', '记录时间')),
    field('input-tag', '待办事项'),
  ]),
]);

// ── 12. 出差申请 ──
save('12-出差申请表单.json', [
  card('出差信息', [
    box2(field('input', '申请人', { required: true }), selectField('部门', ['技术部', '产品部', '市场部', '人事部', '财务部'])),
    box2(field('input', '目的地', { required: true }), selectField('出差类型', ['国内出差', '国际出差'])),
    box2(field('date', '出发日期', { required: true }), field('date', '返回日期', { required: true })),
    field('textarea', '出差目的', { required: true, maxLength: 500 }),
    selectField('交通方式', ['飞机', '高铁', '自驾', '公司派车', '其他']),
  ]),
  card('预算明细', [
    box3(
      field('number', '交通费', { extra: { min: 0, precision: 2 } }),
      field('number', '住宿费', { extra: { min: 0, precision: 2 } }),
      field('number', '餐饮补贴', { extra: { min: 0, precision: 2 } }),
    ),
    box2(field('number', '其他费用', { extra: { min: 0, precision: 2 } }), field('number', '合计金额', { readonly: true, extra: { min: 0, precision: 2 } })),
    field('textarea', '费用说明'),
  ]),
]);

// ── 13. 报销申请 ──
save('13-报销申请表单.json', [
  card('报销基本信息', [
    box2(field('input', '申请人', { required: true }), field('date', '申请日期', { required: true })),
    selectField('报销类型', ['差旅费', '办公用品', '交通费', '餐饮费', '通讯费', '培训费', '其他']),
    field('input', '关联项目'),
  ]),
  card('费用明细', [
    field('dytable', '费用明细表', {
      extra: {
        rowNums: 1, columnNums: 4,
        elements: [{
          id: 'row-' + uid(), colIndex: 1,
          columns: [
            { id: 'c1-' + uid(), cellVisible: true, colIndex: 1, colspan: 1, rowspan: 1, items: [field('date', '日期')] },
            { id: 'c2-' + uid(), cellVisible: true, colIndex: 2, colspan: 1, rowspan: 1, items: [field('input', '费用项目')] },
            { id: 'c3-' + uid(), cellVisible: true, colIndex: 3, colspan: 1, rowspan: 1, items: [field('number', '金额', { extra: { min: 0, precision: 2 } })] },
            { id: 'c4-' + uid(), cellVisible: true, colIndex: 4, colspan: 1, rowspan: 1, items: [field('input', '备注')] },
          ],
        }],
      },
    }),
    box2(field('number', '报销总额', { required: true, extra: { min: 0, precision: 2 } }), field('input', '收款账户')),
  ]),
  card('附件与说明', [
    field('upload', '发票/收据'),
    field('textarea', '报销说明', { maxLength: 500 }),
  ]),
]);

// ── 14. 问卷调查 ──
save('14-问卷调查表单.json', [
  card('基本信息', [
    field('input', '姓名'),
    box2(selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46岁以上']), selectField('职业', ['学生', '上班族', '自由职业', '创业者', '退休'])),
  ]),
  card('满意度调查', [
    selectField('总体满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意'], { required: true }),
    field('rate', '产品质量评分'),
    field('rate', '服务体验评分'),
    field('rate', '性价比评分'),
  ]),
  card('详细反馈', [
    field('checkbox', '您认为我们的优势是什么？'),
    field('radio', '您是否愿意推荐给朋友？', { extra: { dataSource: 'data', values: [{ label: '愿意', value: '1' }, { label: '不愿意', value: '2' }, { label: '不确定', value: '3' }] } }),
    field('textarea', '您的建议或意见', { maxLength: 1000 }),
  ]),
]);

// ── 15. 文章发布 ──
save('15-文章发布表单.json', [
  card('文章信息', [
    field('input', '文章标题', { required: true, maxLength: 100 }),
    box2(selectField('文章分类', ['技术', '产品', '运营', '行业动态', '公司新闻']), selectField('发布状态', ['草稿', '待审核', '已发布', '已下架'])),
    box2(field('datetime', '发布时间'), field('input', '作者')),
    field('input-tag', '标签'),
    field('upload', '封面图片'),
  ]),
  card('文章内容', [
    field('htmleditor', '正文内容', { required: true }),
  ]),
  card('SEO 设置', [
    field('input', 'SEO 标题', { maxLength: 60 }),
    field('textarea', 'SEO 描述', { maxLength: 160 }),
    field('input-tag', '关键词'),
  ]),
]);

// ── 16. 设备管理 ──
save('16-设备管理表单.json', [
  card('设备信息', [
    box2(field('input', '设备名称', { required: true }), field('input', '设备编号', { required: true })),
    box2(selectField('设备类型', ['服务器', '交换机', '路由器', 'PC终端', '打印机', '监控设备', '其他']), selectField('设备品牌', ['华为', '联想', '戴尔', '惠普', '思科', '其他'])),
    box2(field('input', '型号规格'), field('input', '序列号')),
    box2(field('date', '采购日期'), field('date', '保修到期')),
    selectField('设备状态', ['在用', '闲置', '维修中', '已报废', '待分配']),
  ]),
  card('使用信息', [
    box2(field('input', '使用人'), field('input', '使用部门')),
    field('input', '设备位置'),
    field('textarea', '设备备注'),
    field('upload', '设备照片'),
  ]),
  card('维护记录', [
    field('dytable', '维护历史', {
      extra: {
        rowNums: 1, columnNums: 4,
        elements: [{
          id: 'row-' + uid(), colIndex: 1,
          columns: [
            { id: 'c1-' + uid(), cellVisible: true, colIndex: 1, colspan: 1, rowspan: 1, items: [field('date', '维护日期')] },
            { id: 'c2-' + uid(), cellVisible: true, colIndex: 2, colspan: 1, rowspan: 1, items: [field('input', '维护内容')] },
            { id: 'c3-' + uid(), cellVisible: true, colIndex: 3, colspan: 1, rowspan: 1, items: [field('input', '维护人员')] },
            { id: 'c4-' + uid(), cellVisible: true, colIndex: 4, colspan: 1, rowspan: 1, items: [field('number', '费用', { extra: { min: 0, precision: 2 } })] },
          ],
        }],
      },
    }),
  ]),
]);

// ── 17. 多步骤向导表单 ──
save('17-多步骤向导表单.json', [
  tab([
    { label: '第一步：基本信息', items: [
      field('input', '步骤标题', { required: true }),
      box2(field('input', '字段1', { required: true }), field('input', '字段2', { required: true })),
      field('textarea', '描述信息'),
    ]},
    { label: '第二步：详细配置', items: [
      selectField('配置选项', ['选项A', '选项B', '选项C']),
      box2(field('number', '参数1'), field('number', '参数2')),
      field('switch', '高级选项开关'),
      field('slider', '调节参数', { extra: { min: 0, max: 100 } }),
    ]},
    { label: '第三步：确认提交', items: [
      field('input', '确认码', { required: true }),
      field('checkbox', '我已确认所有信息无误', { required: true }),
      field('textarea', '补充说明'),
      boxFull(field('button', '提交', { extra: { buttonType: 'primary' } })),
    ]},
  ]),
]);

// ── 18. 系统配置 ──
save('18-系统配置表单.json', [
  tab([
    { label: '基本设置', items: [
      field('input', '系统名称', { required: true }),
      field('input', '系统标题'),
      field('upload', '系统Logo'),
      field('upload', '网站图标'),
      selectField('主题风格', ['默认蓝色', '暗黑模式', '经典绿色', '商务灰色']),
      field('input', '版权信息'),
    ]},
    { label: '邮件设置', items: [
      box2(field('input', 'SMTP服务器'), field('number', 'SMTP端口')),
      box2(field('input', '发件人邮箱'), field('password', '授权密码')),
      field('switch', '启用SSL'),
      field('button', '发送测试邮件'),
    ]},
    { label: '安全设置', items: [
      box2(field('number', '密码最小长度', { extra: { min: 6, max: 32 } }), field('number', '登录失败锁定次数', { extra: { min: 1, max: 20 } })),
      field('switch', '启用验证码'),
      field('switch', '启用双因素认证'),
      field('switch', '强制密码复杂度'),
      field('number', '会话超时时间(分钟)', { extra: { min: 1 } }),
    ]},
  ]),
]);

// ── 19. 数据看板配置 ──
save('19-数据看板配置表单.json', [
  card('看板基本信息', [
    box2(field('input', '看板名称', { required: true }), selectField('刷新频率', ['实时', '1分钟', '5分钟', '15分钟', '30分钟', '1小时'])),
    field('textarea', '看板描述'),
  ]),
  card('图表配置', [
    collapse([
      { label: '图表1 - 趋势图', items: [
        field('input', '图表标题'),
        selectField('图表类型', ['折线图', '柱状图', '饼图', '散点图']),
        box2(field('input', '数据源接口'), selectField('时间范围', ['今日', '本周', '本月', '本季度', '本年'])),
      ]},
      { label: '图表2 - 统计卡片', items: [
        field('input', '卡片标题'),
        box2(field('number', '数值'), field('input', '单位')),
        selectField('变化趋势', ['上升', '下降', '持平']),
      ]},
      { label: '图表3 - 数据表格', items: [
        field('input', '表格标题'),
        field('input', '数据源接口'),
        field('number', '显示行数', { extra: { min: 5, max: 100 } }),
      ]},
    ]),
  ]),
]);

// ── 20. 综合业务表单 ──
save('20-综合业务表单.json', [
  card('申请人信息', [
    box3(
      field('input', '申请人', { required: true }),
      selectField('部门', ['技术部', '产品部', '市场部', '人事部', '财务部', '运营部']),
      field('date', '申请日期', { required: true }),
    ),
  ]),
  tab([
    { label: '业务详情', items: [
      box2(field('input', '业务编号', { required: true }), selectField('业务类型', ['新办', '续办', '变更', '撤销'])),
      field('input', '关联客户'),
      selectField('业务优先级', ['紧急', '高', '中', '低']),
      field('textarea', '业务描述', { required: true, maxLength: 2000 }),
      field('upload', '相关附件'),
    ]},
    { label: '审批流程', items: [
      field('input', '当前审批人', { disabled: true }),
      selectField('审批状态', ['待提交', '审批中', '已通过', '已驳回', '已撤回']),
      field('datetime', '审批时间'),
      field('textarea', '审批意见'),
    ]},
    { label: '执行记录', items: [
      field('input', '执行人'),
      field('datetime', '执行时间'),
      selectField('执行结果', ['成功', '失败', '部分完成']),
      field('textarea', '执行备注'),
    ]},
  ]),
  divider('签字确认'),
  box2(field('signature', '申请人签字'), field('signature', '审批人签字')),
]);

// ══════════════════════════════════════════════════
// 10 Questionnaire Survey Templates (21-30)
// ══════════════════════════════════════════════════

console.log('\nGenerating 10 questionnaire surveys...\n');

// ── 21. 学校教学满意度问卷 ──
save('21-学校教学满意度问卷.json', [
  card('基本信息', [
    box2(field('input', '学生姓名'), selectField('年级', ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'])),
    box2(selectField('班级', ['1班', '2班', '3班', '4班', '5班', '6班']), field('input', '填写日期')),
  ]),
  card('教学质量评价', [
    selectField('您对教师教学态度的评价', ['非常满意', '满意', '一般', '不满意', '非常不满意'], { required: true }),
    selectField('您对课堂教学效果的评价', ['非常好', '好', '一般', '差', '非常差']),
    selectField('教师布置的作业量是否合适', ['太多', '偏多', '合适', '偏少', '太少']),
    selectField('教师批改作业是否认真', ['非常认真', '认真', '一般', '不认真', '非常不认真']),
    field('rate', '教学质量总体评分'),
  ]),
  card('课程与设施', [
    selectField('您对学校课程设置的满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意']),
    selectField('学校教学设施是否完善', ['非常完善', '完善', '一般', '不完善', '非常不完善']),
    selectField('课外活动丰富程度', ['非常丰富', '丰富', '一般', '不丰富', '几乎没有']),
    field('rate', '学校环境评分'),
  ]),
  card('意见与建议', [
    field('radio', '您是否愿意向其他家长推荐本校？', { extra: { dataSource: 'data', values: [{ label: '愿意', value: '1' }, { label: '不愿意', value: '2' }, { label: '不确定', value: '3' }] } }),
    field('textarea', '您对学校的改进建议', { maxLength: 1000 }),
  ]),
]);

// ── 22. 用车习惯调查问卷 ──
save('22-用车习惯调查问卷.json', [
  card('车主基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'])),
    box2(field('input', '驾龄(年)'), selectField('车辆类型', ['轿车', 'SUV', 'MPV', '新能源', '混合动力', '其他'])),
    selectField('车辆品牌', ['丰田', '本田', '大众', '宝马', '奔驰', '比亚迪', '特斯拉', '蔚来', '理想', '其他']),
  ]),
  card('日常用车习惯', [
    selectField('您每天用车的主要目的', ['上下班通勤', '接送孩子', '商务出行', '购物出行', '休闲旅游', '其他'], { required: true }),
    box2(selectField('日均行驶里程', ['10公里以内', '10-30公里', '30-50公里', '50-100公里', '100公里以上']), selectField('常用出行时段', ['早高峰(7-9点)', '晚高峰(17-19点)', '平峰时段', '夜间', '不固定'])),
    selectField('您每周用车频率', ['每天', '5-6天', '3-4天', '1-2天', '偶尔', '几乎不用']),
    selectField('最常行驶的路况', ['城市道路', '高速公路', '乡村道路', '综合路况']),
    field('number', '月均油费/电费(元)', { extra: { min: 0, precision: 0 } }),
  ]),
  card('保养与维护', [
    selectField('您通常在何处保养车辆？', ['4S店', '连锁维修店', '路边修理店', '自己保养', '其他']),
    selectField('保养频率', ['每5000公里', '每10000公里', '每半年', '每年', '不规律']),
    field('number', '年均车辆维护费用(元)', { extra: { min: 0, precision: 0 } }),
    selectField('您是否购买了车辆保险全险？', ['是', '否']),
  ]),
  card('用车满意度', [
    field('rate', '您对当前车辆的整体满意度'),
    selectField('您下次购车是否考虑新能源？', ['是', '否', '不确定']),
    field('textarea', '您对用车体验的意见或建议', { maxLength: 500 }),
  ]),
]);

// ── 23. 消费习惯调查问卷 ──
save('23-消费习惯调查问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'])),
    box2(selectField('月收入范围', ['3000元以下', '3000-5000元', '5000-10000元', '10000-20000元', '20000-50000元', '50000元以上']), selectField('职业', ['学生', '上班族', '自由职业', '创业者', '公务员', '退休'])),
  ]),
  card('消费偏好', [
    selectField('您最主要的消费渠道', ['线上电商', '线下实体店', '直播间', '社交电商', '综合兼有'], { required: true }),
    selectField('您每月消费最多的品类', ['食品饮料', '服装鞋帽', '数码电子', '美妆护肤', '家居日用', '教育培训', '娱乐休闲', '其他']),
    box2(selectField('月均消费金额', ['1000元以下', '1000-3000元', '3000-5000元', '5000-10000元', '10000元以上']), field('number', '月均储蓄金额(元)', { extra: { min: 0, precision: 0 } })),
    selectField('您是否使用信用卡/花呗等信用消费？', ['经常使用', '偶尔使用', '从不使用']),
  ]),
  card('消费决策因素', [
    selectField('影响您消费决策的最重要因素', ['价格', '品牌', '质量', '口碑评价', '促销活动', '外观设计', '其他'], { required: true }),
    selectField('您购物前是否会做功课/比价？', ['每次都会', '经常会', '偶尔', '从不']),
    selectField('您对品牌忠诚度如何？', ['只买固定品牌', '偏好固定品牌但会尝试新品', '无固定品牌偏好']),
    field('rate', '您对自身消费理性的评价(5星=非常理性)'),
  ]),
  card('消费趋势', [
    selectField('未来一年您预计消费会增加的领域', ['教育培训', '健康养生', '旅游出行', '数码科技', '房产家居', '其他']),
    field('textarea', '您的消费理念或心得分享', { maxLength: 500 }),
  ]),
]);

// ── 24. 健康生活问卷 ──
save('24-健康生活问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'])),
    box2(field('number', '身高(cm)', { extra: { min: 50, precision: 0 } }), field('number', '体重(kg)', { extra: { min: 20, precision: 1 } })),
  ]),
  card('饮食习惯', [
    selectField('您每天吃几餐？', ['一餐', '两餐', '三餐', '三餐以上']),
    selectField('您是否经常吃早餐？', ['每天都吃', '经常吃', '偶尔吃', '几乎不吃']),
    selectField('您每日饮水量', ['500ml以下', '500ml-1L', '1L-2L', '2L以上']),
    selectField('您偏好哪种饮食口味？', ['清淡', '偏咸', '偏辣', '偏甜', '偏油腻', '均衡']),
    field('rate', '您对自己饮食习惯的满意度'),
  ]),
  card('运动与睡眠', [
    selectField('您每周运动频率', ['每天', '5-6次', '3-4次', '1-2次', '几乎不运动']),
    selectField('您常做的运动类型', ['跑步/快走', '游泳', '健身/力量训练', '球类运动', '瑜伽/普拉提', '骑行', '其他']),
    box2(selectField('您通常几点入睡？', ['22点前', '22-23点', '23-24点', '凌晨1点后']), selectField('每日睡眠时长', ['5小时以下', '5-6小时', '6-7小时', '7-8小时', '8小时以上'])),
    selectField('您的睡眠质量如何？', ['很好', '较好', '一般', '较差', '很差']),
  ]),
  card('心理健康', [
    selectField('您目前的生活压力程度', ['非常大', '较大', '一般', '较小', '几乎没有']),
    selectField('您的主要减压方式', ['运动', '听音乐', '看电影/追剧', '社交聚会', '阅读', '冥想', '其他']),
    field('rate', '您对目前生活状态的整体满意度'),
    field('textarea', '您的健康生活建议或心得', { maxLength: 500 }),
  ]),
]);

// ── 25. 网络使用习惯问卷 ──
save('25-网络使用习惯问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['12岁以下', '12-18岁', '18-25岁', '26-35岁', '36-50岁', '50岁以上'])),
    selectField('职业', ['学生', '上班族', '自由职业', '创业者', '退休', '其他']),
  ]),
  card('上网习惯', [
    selectField('您每天上网时长', ['1小时以下', '1-3小时', '3-5小时', '5-8小时', '8小时以上'], { required: true }),
    selectField('您最常用的上网设备', ['手机', '电脑', '平板', '电视', '多种设备']),
    selectField('您主要在什么时段上网？', ['早晨', '上午', '下午', '晚上', '深夜', '全天']),
    selectField('您上网的主要目的', ['社交媒体', '视频娱乐', '游戏', '学习/工作', '购物', '新闻资讯', '其他']),
  ]),
  card('社交媒体使用', [
    selectField('您最常用的社交平台', ['微信', '微博', '抖音', '小红书', 'B站', '知乎', 'QQ', '其他']),
    box2(field('number', '日均刷社交媒体时长(分钟)', { extra: { min: 0, precision: 0 } }), field('number', '社交媒体好友/关注数', { extra: { min: 0, precision: 0 } })),
    selectField('您是否发布过原创内容？', ['经常发布', '偶尔发布', '很少发布', '从不发布']),
    field('rate', '您对社交媒体使用的满意度'),
  ]),
  card('网络安全与健康', [
    selectField('您是否担心过度使用手机/网络？', ['非常担心', '有些担心', '不担心']),
    selectField('您是否遇到过网络安全问题？', ['是，多次', '是，偶尔', '否']),
    field('textarea', '您对健康使用网络有什么建议？', { maxLength: 500 }),
  ]),
]);

// ── 26. 阅读习惯问卷 ──
save('26-阅读习惯问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-60岁', '60岁以上'])),
    selectField('学历', ['初中及以下', '高中/中专', '大专', '本科', '硕士及以上']),
  ]),
  card('阅读偏好', [
    selectField('您最喜欢的阅读方式', ['纸质书', '电子书', '有声书', '都差不多']),
    selectField('您最喜欢的书籍类型', ['文学小说', '历史传记', '科学技术', '经管励志', '哲学心理', '教育学习', '漫画绘本', '其他']),
    box2(selectField('每月阅读书籍数量', ['0本', '1-2本', '3-5本', '5-10本', '10本以上']), field('number', '年购书预算(元)', { extra: { min: 0, precision: 0 } })),
    selectField('您通常在什么时间阅读？', ['早晨', '午休', '通勤路上', '睡前', '周末/假日', '碎片时间']),
  ]),
  card('数字阅读', [
    selectField('您常用的电子阅读平台', ['微信读书', 'kindle', '番茄小说', '豆瓣阅读', '得到', '喜马拉雅', '其他', '不使用']),
    selectField('您是否愿意为电子书付费？', ['愿意，经常付费', '偶尔付费', '只读免费内容']),
    field('rate', '您对自身阅读习惯的满意度'),
  ]),
  card('阅读感想', [
    field('textarea', '请分享一本您最近读过且印象深刻的书', { maxLength: 500 }),
    field('textarea', '您对培养阅读习惯有什么建议？', { maxLength: 500 }),
  ]),
]);

// ── 27. 旅游出行问卷 ──
save('27-旅游出行习惯问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'])),
    box2(selectField('月收入范围', ['3000元以下', '3000-8000元', '8000-15000元', '15000-30000元', '30000元以上']), selectField('家庭结构', ['单身', '情侣/夫妻', '有小孩', '与父母同住'])),
  ]),
  card('旅游偏好', [
    selectField('您每年旅游次数', ['0次', '1-2次', '3-4次', '5次以上'], { required: true }),
    selectField('您偏好的旅游类型', ['自然风光', '历史文化', '美食之旅', '亲子游', '冒险探险', '休闲度假', '购物游']),
    box2(selectField('出游方式', ['自由行', '跟团游', '自驾游', '半自由行']), selectField('同行人数', ['独自出行', '2人', '3-5人', '6人以上'])),
    selectField('您通常选择的出行时间', ['法定假日', '年假出行', '周末短途', '寒暑假', '不固定']),
    field('number', '年旅游预算(元)', { extra: { min: 0, precision: 0 } }),
  ]),
  card('出行方式', [
    selectField('长途出行首选交通工具', ['飞机', '高铁', '自驾', '大巴', '火车']),
    selectField('住宿偏好', ['高星级酒店', '经济型酒店', '民宿', '青年旅舍', '露营', '亲友家']),
    selectField('您通过什么渠道预订行程？', ['携程', '飞猪', '美团', '去哪儿', '小红书', '朋友推荐', '其他']),
    field('rate', '您对国内旅游体验的整体满意度'),
  ]),
  card('旅游感想', [
    selectField('您最向往的旅游目的地', ['日韩', '东南亚', '欧美', '澳新', '国内热门城市', '小众目的地']),
    field('textarea', '分享您最难忘的一次旅行经历', { maxLength: 1000 }),
  ]),
]);

// ── 28. 职场满意度问卷 ──
save('28-职场满意度问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['22岁以下', '22-28岁', '29-35岁', '36-45岁', '46岁以上'])),
    box2(selectField('工作年限', ['1年以下', '1-3年', '3-5年', '5-10年', '10年以上']), selectField('所属行业', ['互联网/IT', '金融', '教育', '医疗', '制造业', '零售/消费', '政府/事业单位', '其他'])),
    selectField('职位层级', ['基层员工', '初级管理', '中级管理', '高级管理', '创业者/老板']),
  ]),
  card('工作满意度', [
    selectField('您对目前工作的整体满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意'], { required: true }),
    selectField('您对目前薪资的满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意']),
    selectField('您对工作强度的感受', ['过于忙碌', '偏忙', '适中', '轻松', '过于清闲']),
    selectField('您与上级/同事关系如何？', ['非常融洽', '融洽', '一般', '紧张', '非常紧张']),
    field('rate', '工作生活平衡度评分'),
  ]),
  card('职业发展', [
    selectField('您对目前晋升空间的看法', ['很有空间', '有空间', '一般', '没什么空间', '完全没有']),
    selectField('您是否有跳槽打算？', ['正在找工作', '近期有打算', '偶尔想想', '暂时没有', '完全没有']),
    selectField('您最看重的工作因素', ['薪资待遇', '发展前景', '工作环境', '团队氛围', '工作稳定性', '兴趣匹配', '其他']),
    field('textarea', '您对职场发展有什么建议或困惑？', { maxLength: 500 }),
  ]),
]);

// ── 29. 居家生活品质问卷 ──
save('29-居家生活品质问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18-25岁', '26-35岁', '36-45岁', '46-55岁', '55岁以上'])),
    box2(selectField('居住类型', ['自有房产', '租房', '与家人同住', '宿舍']), selectField('居住面积', ['30㎡以下', '30-60㎡', '60-90㎡', '90-120㎡', '120㎡以上'])),
    selectField('家庭结构', ['独居', '二人世界', '三口之家', '多口之家', '与父母同住']),
  ]),
  card('居家习惯', [
    selectField('您每周做家务的频率', ['每天', '每周3-5次', '每周1-2次', '偶尔', '几乎不做']),
    selectField('您做饭的频率', ['每天自己做', '经常做', '偶尔做', '几乎不做，以外卖为主']),
    selectField('您家的清洁方式', ['自己打扫', '请保洁', '扫地机器人', '综合使用']),
    box2(selectField('家电智能化程度', ['全屋智能', '部分智能', '少量智能', '传统家电']), field('number', '月均家居消费(元)', { extra: { min: 0, precision: 0 } })),
  ]),
  card('居家满意度', [
    selectField('您对居住环境的满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意']),
    selectField('您对社区/小区配套的评价', ['非常完善', '完善', '一般', '不完善', '非常不完善']),
    field('rate', '居家幸福感评分'),
    selectField('您最希望改善的居家方面', ['居住面积', '装修品质', '社区配套', '周边环境', '家居智能化', '其他']),
    field('textarea', '您提升居家生活品质的经验或建议', { maxLength: 500 }),
  ]),
]);

// ── 30. 社交生活问卷 ──
save('30-社交生活问卷.json', [
  card('基本信息', [
    box2(selectField('性别', ['男', '女']), selectField('年龄段', ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-60岁', '60岁以上'])),
    selectField('性格类型', ['外向型', '内向型', '中间型', '不确定']),
  ]),
  card('社交习惯', [
    selectField('您每周社交活动的频率', ['每天都有', '每周3-5次', '每周1-2次', '每月几次', '很少'], { required: true }),
    selectField('您最喜欢的社交方式', ['面对面聚会', '线上聊天', '社交活动/派对', '运动/户外活动', '兴趣小组', '其他']),
    selectField('您通常的社交场景', ['工作场合', '朋友聚会', '家庭聚餐', '兴趣社群', '网络社区', '其他']),
    box2(field('number', '月均社交消费(元)', { extra: { min: 0, precision: 0 } }), field('number', '亲密朋友数量', { extra: { min: 0, precision: 0 } })),
  ]),
  card('社交满意度', [
    selectField('您对目前社交生活的满意度', ['非常满意', '满意', '一般', '不满意', '非常不满意']),
    selectField('您是否感到社交焦虑？', ['经常', '偶尔', '很少', '从不']),
    selectField('您认为理想的社交状态是', ['广泛交友', '深度交友', '少量深交', '独处为主']),
    field('rate', '社交幸福感评分'),
    field('textarea', '您对社交生活有什么感想或建议？', { maxLength: 500 }),
  ]),
]);

console.log('\n✅ All 30 templates generated successfully!');
