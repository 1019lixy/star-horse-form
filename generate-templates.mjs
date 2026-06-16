import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const OUT = 'E:/lixycode/template';
mkdirSync(OUT, { recursive: true });

// ── Helpers ──
const uid = () => randomUUID();
const fid = () => 'field_' + uid().substring(0, 6);
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

console.log('Generating 20 templates...\n');

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

console.log('\n✅ All 20 templates generated successfully!');
