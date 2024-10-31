<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {ArrowLeftBold, ArrowRightBold, InfoFilled, Search} from "@element-plus/icons-vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import listPlugin from '@fullcalendar/list'
import {CalendarOptions} from "@fullcalendar/core";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {uuid} from "@/api/system.ts";
import {getUserInfo} from "../../../utils/auth.ts";
import {calendarManage, defineType} from "@/views/system/calendar/CalendarProps.ts";
import {createCondition, deleteByIds, loadData} from "@/api/sh_api.ts";
import {success, warning, confirm} from "@/utils/message.ts";

const props = defineProps({
  eventList: {type: Array, default: []},
  compSize: {type: String, default: "small"}
});
const fullCalendar = ref();
const starHorseDateRef = ref();
let dateValue = ref<any>(null);
let selectedItem = ref<number>(0);
let selectedWeekRange = ref<Array<any>>([]);
let outerData = ref<any>({});
let subscriptionList = ref<Array<any>>([
  {
    isChecked: false,
    followName: "Test",
    id: "0002",
  },
  {
    isChecked: false,
    followName: "Test1",
    id: "0003",
  }
]);
const collapseModel = ref<string>("first");
let predefineColors = ref<Array<any>>([]);
let editTitle = ref<string>("开启编辑模式");
let calenderModel = ref<string>("view");
const calendarOptions = ref<CalendarOptions>({
  plugins: [
    // 加载插件，V5采用插件模块方式加入
    multiMonthPlugin,
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin, // needed for dateClick
    listPlugin
  ],
  // height: 800, //日历高度
  // themeSystem: 'bootstrap5',
  events: [],
  headerToolbar: {
    // 头部toolba
    left: 'prevYear,prev,next,nextYear,today,btn',
    center: 'title',
    right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,editBtn',
  },
  handleWindowResize: true, //随浏览器窗口变化
  // initialView: 'dayGridMonth', // 初始化插件显示
  droppable: true,//可拖拽的
  timeZone: 'local',//采用时区
  selectable: true,
  firstDay: 0,
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false // 设置时间为24小时
  },
  weekNumbers: true,
  dayMaxEvents: true,
  weekends: true,
  aspectRatio: 1,
  fixedWeekCount: false,
  editable: true, // 是否可以进行（拖动、缩放）修改
  eventStartEditable: true, // Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
  eventDurationEditable: true, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
  selectMirror: true,
  selectMinDistance: 0, // 选中日历格的最小距离
  navLinks: true, // 天链接
  slotEventOverlap: false, // 相同时间段的多个日程视觉上是否允许重叠，默认true允许
  initialDate: new Date(),//初始化日期
  // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  select: (item: any) => {
    let date = new Date();
    let ss = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    outerData.value = {
      startStr: item.startStr,
      sTime: ss,
      endStr: item.endStr,
      eTime: ss
    }
    if (calenderModel.value != "edit") {
      return;
    }
    visible.value = true;
    console.log("select", item);
  },
  eventClick: async (item: any) => {
    outerData.value = {
      title: item.event.title,
      id: item.event.id,
      backgroundColor: item.event.backgroundColor,
      borderColor: item.event.borderColor,
      ...item.event.extendedProps
    }
    if (calenderModel.value != "edit") {
      return;
    }
    visible.value = true;
    // await nextTick();
    // calendarFieldRef.value.setF
    // 日程点击事件
    console.log("eventClick", item);
  },
  eventMouseEnter: (item: any) => {
    // 用户将鼠标悬停在事件上时触发
    console.log("eventMouseEnter", item);
  },
  eventsSet: (item: any) => {
    console.log("eventsSet", item);
  },
  dateClick: (item: any) => {
    let date = new Date();
    outerData.value = {
      startStr: item.dateStr,
      sTime: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    };

    if (calenderModel.value != "edit") {
      return;
    }
    visible.value = true;
    //日期方格点击事件
    console.log("dateClick", item, outerData);
  },
  eventAdd: (item: any) => {
    //添加
    console.log("eventAdd", item);
  },
  eventChange: (item: any) => {
    //更改
    console.log("eventChange", item);
  },
  eventRemove: (item: any) => {
    //删除
    console.log("eventRemove", item);
  },
  locale: zhCnLocale,
  nextDayThreshold: '01:00:00',
  customButtons: {
    btn: {
      text: "看板",
      click: () => {

      }
    },
    editBtn: {
      text: editTitle,
      click: () => {
        calenderModel.value = calenderModel.value == "view" ? "edit" : "view";
        editTitle.value = calenderModel.value == "view" ? "开启编辑模式" : "关闭编辑模式";
      }
    }
  },
});
const changeDate = (date: any) => {
  console.log(date);
  let api = fullCalendar.value.getApi();
  api.gotoDate(date);
  api.select(date)
}
const filterEvent = (date: any) => {

}
const changeColor = (evt: MouseEvent, item: any) => {

}
const setPermission = (item: any) => {

}
const handleCancleSubscription = (id: string) => {

}
const getSubscriberLoaction = (index: number) => {
  selectedItem.value = index;
}
const selectDate = (val: string) => {
  if (!starHorseDateRef.value) {
    return;
  }
  starHorseDateRef.value.selectDate(val);
  changeDate(dateValue.value);
}
onBeforeUnmount(() => {
  fullCalendar.value.getApi().destroy();
})
onMounted(async () => {
  await nextTick();
  props.eventList?.forEach((item: any) => {
    fullCalendar.value.getApi().view.calendar.addEvent(item);
  });
  fullCalendar.value.getApi().changeView("dayGridMonth");
  setTimeout(() => {
    fullCalendar.value.getApi().changeView("dayGridMonth");
  }, 500);
});
// 周背景色
watch(dateValue,
    (newValue) => {
      // 获取用户选择的日期
      const selectedDate = new Date(newValue);
      // 获取用户选择日期是所在周的第几天（周日为0，周一为1，以此类推）
      const dayOfWeek = selectedDate.getDay();
      // 计算周一的日期
      let monday = new Date(selectedDate);
      monday.setDate(selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      // 计算周日的日期
      let sunday = new Date(selectedDate);
      sunday.setDate(selectedDate.getDate() + (7 - dayOfWeek) + (dayOfWeek === 0 ? -7 : 0));
      selectedWeekRange.value = [monday, sunday];
    }, {immediate: true}
);
let calendarTitle = ref<string>("新建日程");
let visible = ref<boolean>(false);
/**
 * // 切换到下一月/周/日
 * fullCalendar.getApi().next()
 * // 切换到上一月/周/日
 * fullCalendar.getApi().prev()
 * // 跳转到今天
 * fullCalendar.getApi().today()
 * // 跳转到指定日期  formatData是日期 格式为 yyyy-MM-dd
 * fullCalendar.getApi().gotoDate(formatData)
 * // 获得当前视图起始位置的日期
 * fullCalendar.getApi().getDate()
 * // 获得当前视图  里面有一些参数
 * fullCalendar.getApi().view
 * // 当前视图的类型
 * fullCalendar.getApi().view.type
 * // 当前显示的事件(日程)的开始时
 * fullCalendar.getApi().view.activeStart
 * // 当前显示的事件(日程)的结束时
 * fullCalendar.getApi().view.activeEnd
 * //访问当前视图所涉及的日历对象或者日历配置信息。
 * fullCalendar.getApi().view.calendar
 * // 获得当前所显示的所有事件(日程)
 * fullCalendar.getApi().view.calendar.getEvents()
 * // 向日历中添加事项
 * fullCalendar.getApi().view.calendar.addEvent({
 *   id: '001',
 *   title: `test01`,
 *   start: '2024-04-25' + ' 13:00:00',
 *   end: '2024-04-25' + ' 17:00:00',
 *   // 修改背景颜色
 *   backgroundColor:'#d8377a',
 *   // 修改边框颜色
 *   borderColor:'#d8377a',
 * })
 *
 */
const calendarField = reactive<PageFieldInfo | any>({
  fieldList: [{
    label: "日程名称",
    fieldName: "title",
    type: "input",
    required: true,
    formShow: true
  }, [
    {
      label: "开始时间",
      fieldName: "startStr",
      type: "date",
      required: true,
      formShow: true,
      preps: {
        placeholder: "请选择开始日期",
        valueFormat: "YYYY-MM-DD"
      },
      brotherNodes: [{
        label: "请选择开始时间",
        fieldName: "sTime",
        type: "time",
        formShow: true,
      }]
    },
    {
      label: "结束时间",
      fieldName: "endStr",
      type: "date",
      formShow: true,
      preps: {
        placeholder: "请选择结束日期",
        valueFormat: "YYYY-MM-DD"
      },
      brotherNodes: [{
        label: "结束时间",
        fieldName: "eTime",
        type: "time",

        formShow: true,
      }]
    }
  ], [
    {
      label: "背景色",
      fieldName: "backgroundColor",
      type: "color",
      formShow: true
    },
    {
      label: "边框颜色",
      fieldName: "borderColor",
      type: "color",
      formShow: true
    }
  ]]
});
const calendarFieldRef = ref();
const addCalendar = (type: string, evt: MouseEvent) => {
  evt.stopPropagation();
  evt.preventDefault();
  outerData.value["type"] = type;
  visible.value = true;
}
const close = () => {
  visible.value = false;
  calendarTypeVisible.value = false;
  calendarManageVisible.value = false;
}
const submit = async (action: string) => {
  let result = await calendarFieldRef.value.$refs.starHorseFormRef.validate();
  if (!result) {
    return;
  }
  let data = calendarFieldRef.value.getFormData().value;
  console.log(data);
  if (data.id) {
    let event: any = fullCalendar.value.getApi().view.calendar.getEventById(data.id);
    if (event) {
      event.remove();
    }
  } else {
    data["id"] = uuid();
  }
  let temp = {
    ...data,
    start: data["startStr"] + " " + data["sTime"],
    end: data["endStr"] + " " + data["eTime"],
  }
  fullCalendar.value.getApi().view.calendar.addEvent(temp);
  if (action == "close") {
    close();
  }
}
let searchText = ref<string>("");
let calendarTypeTitle = ref<string>("");
let calendarTypeVisible = ref<boolean>(false);
let calendarManageVisible = ref<boolean>(false);
let calendarTypeRef = ref();
let calendarMangeRef = ref();
const addCalendarType = (evt: MouseEvent) => {
  evt.stopPropagation();
  evt.preventDefault();
  calendarTypeVisible.value = true;
}
const calendarOperation = async (cmd: string, item: any) => {
  console.log(cmd,item);
  if (cmd == "delete") {
    let resultData = await deleteByIds(`system-config/system/calendarDefine/batchDeleteById`, [item['idCalendarDefine']],
        "删除日历后，所有日程都蒋被删除，确认要删除吗？");
    if (resultData) {
      initData();
    }
  } else {
    calendarManageVisible.value = true;
  }

}
const calendarTypeSubmit = async () => {
  let valid = await calendarTypeRef.value.$refs.starHorseFormRef.validate();
  if (!valid) {
    return;
  }
  let formData = calendarTypeRef.value.getFormData().value;
  let resultData = await loadData("system-config/system/calendarDefine/merge", formData);
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  success("操作成功");
  initData();
  close();
}
let myCalendarList = ref<Array<any>>([]);
const initData = async () => {
  let userInfo = getUserInfo();
  let resultData = await loadData("system-config/system/calendarDefine/getAllByCondition", {
    fieldList: [createCondition("createdBy", userInfo.name + "(" + userInfo.username + ")")],
    orderBy: [{
      fieldName: "createdTime",
      ascOrDesc: "asc"
    }]
  });
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  myCalendarList.value = resultData.data;
}
onMounted(() => {
  initData();
})
</script>

<template>
  <star-horse-dialog :title="'添加日程'" @closeAction="close" @merge="calendarTypeSubmit"
                     :dialog-visible="calendarManageVisible"
                     :draggable="true"
                     :self-func="true">
    <star-horse-form :formSize="compSize" :outer-form-data="outerData" :field-list="calendarManage()"
                     ref="calendarMangeRef"/>
  </star-horse-dialog>
  <star-horse-dialog :title="'添加日历'" @closeAction="close" @merge="calendarTypeSubmit"
                     :dialog-visible="calendarTypeVisible"
                     :draggable="true"
                     :self-func="true">
    <star-horse-form :formSize="compSize" :outer-form-data="outerData" :field-list="{
      fieldList:defineType('calendar')
    }"
                     ref="calendarTypeRef"/>
  </star-horse-dialog>
  <star-horse-dialog :title="calendarTitle" :is-show-btn-continue="true" @closeAction="close" @merge="submit"
                     :dialog-visible="visible"
                     :draggable="true"
                     :self-func="true">
    <star-horse-form :formSize="compSize" :outer-form-data="outerData" :field-list="calendarField"
                     ref="calendarFieldRef"/>
  </star-horse-dialog>
  <div class="star-horse-calendar">
    <div class="calendar-left">
      <div class="create-calender">
        <el-button text @click="addCalendar('meeting',$event)" :size="compSize">
          <star-horse-icon icon-class="meeting"/>
          预定会议
        </el-button>
        <el-button text @click="addCalendar('calendar',$event)" :size="compSize">
          <star-horse-icon icon-class="calendar"/>
          新建日程
        </el-button>
      </div>
      <div class="create-calender">
        <el-input v-model="searchText" :size="compSize" placeholder="请输入日程">
          <template #prefix>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-calendar v-model="dateValue" ref="starHorseDateRef" class="custom-calendar">
        <template #header="{date}">
          <div class="date-header">
            <span>{{ date }}</span>
            <div class="header-body">
              <el-icon @click="selectDate('prev-month')" style="cursor: pointer">
                <ArrowLeftBold/>
              </el-icon>
              <el-icon @click="selectDate('next-month')" style="cursor: pointer">
                <ArrowRightBold/>
              </el-icon>
            </div>
          </div>
        </template>
        <template #date-cell="{ data }">
          <p class="calendar-cell"
             :class="[data.date >= selectedWeekRange[0] && data.date <= selectedWeekRange[1] ? 'is-week' : '']"
             @click="changeDate(data.date)">
            {{ data.day.split('-').slice(2).join() }}
            {{ data.isSelected ? '✔️' : '' }}
          </p>
        </template>
      </el-calendar>
      <el-collapse v-model="collapseModel">
        <el-collapse-item name="first" style="height: auto;">
          <template #title>
            <div class="collapse-item-title title">
              <div style="width: 80%">我的日历</div>
              <star-horse-icon icon-class="add" title="添加日历" @click="addCalendarType"/>
            </div>
          </template>
          <template v-for="item in myCalendarList">
            <div class="my-calendar">
              <div class="title">
                <star-horse-icon :icon-class="item.category||'user-cycle'"/>
                {{ item.calendarName }}
              </div>
              <el-dropdown placement="bottom" @command="(cmd)=>calendarOperation(cmd,item)">
                <star-horse-icon icon-class="more" cursor="pointer" color="var(--star-horse-style)" size="20px"/>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="add">
                      <star-horse-icon icon-class="add"/>
                      添加日程
                    </el-dropdown-item>
                    <el-dropdown-item command="delete">
                      <star-horse-icon icon-class="delete" color="var(--el-color-danger)"/>
                      删除日历
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

            </div>
          </template>

        </el-collapse-item>

      </el-collapse>
    </div>
    <div class="calendar-right">
      <FullCalendar ref="fullCalendar" height="parent"
                    :eventLimit="true"
                    allDayText="全天"
                    :editable="true"
                    :options="calendarOptions" class="app-calendar">
        <!--        <template v-slot:eventContent="arg">
                  <span>{{ arg.timeText }}</span>
                  <i>{{ arg.event.title }}</i>
                  <i>{{ arg.event.title }}</i>

                </template>-->
      </FullCalendar>
    </div>
  </div>
</template>

<style scoped lang="scss">
.my-calendar {
  height: 30px;
  display: flex;
  align-items: center;
  vertical-align: middle;
  justify-content: space-between;
  padding-left: 15px;

  .title {
    display: flex;
    align-items: center;
    vertical-align: middle;
  }

  &:hover {
    background: #fafafa;
  }
}

.create-calender {
  width: 98%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 53px;
  margin: 5px auto;
  border-bottom: var(--star-horse-style) 1px solid;
}

:deep(.fc-view) {
  inset: unset;
}

:deep(.fc-header-toolbar) {
  margin: 10px 5px;
}

:deep(.el-calendar-day) {
  padding: unset !important;
}

:deep(.el-calendar) {
  --el-calendar-cell-width: 35px !important;
}

.star-horse-calendar {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  .calendar-left {
    width: 300px;
    height: 100%;

    .date-header {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .header-body {
        width: 20px;
        display: flex;
        justify-content: space-between;
      }
    }

    .calendar-cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .calendar-right {
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
  }
}

.app-calendar {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
