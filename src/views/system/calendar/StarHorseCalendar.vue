<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { ArrowLeftBold, ArrowRightBold, Search } from "@element-plus/icons-vue";
  import FullCalendar from "@fullcalendar/vue3";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import multiMonthPlugin from "@fullcalendar/multimonth";
  import interactionPlugin from "@fullcalendar/interaction";
  import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
  import listPlugin from "@fullcalendar/list";
  import { CalendarOptions } from "@fullcalendar/core";
  import { uuid } from "@/api/system.ts";
  import { getUserInfo } from "@/utils/auth.ts";
  import { calendarManage, defineType } from "@/views/system/calendar/CalendarProps.ts";
  import { createCondition, deleteByIds, loadData } from "@/api/sh_api.ts";
  import { currentMonthRange, monthRange, currentDate } from "@/api/date_utils.ts";
  import { success, warning } from "@/utils/message.ts";
  import { SearchParams } from "@/components/types/Params";
  import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

  const props = defineProps({
    eventList: { type: Array, default: [] },
    compSize: { type: String, default: "small" }
  });
  const fullCalendar = ref();
  const dialogFullCalendar = ref();
  const starHorseDateRef = ref();
  let dateValue = ref<any>(null);
  let selectedWeekRange = ref<Array<any>>([]);
  let outerData = ref<any>({});
  const calendarTitle = ref<string>("");
  const collapseModel = ref<string>("first");
  let editTitle = ref<string>("开启编辑模式");
  const commonOptions = {
    plugins: [
      // 加载插件，V5采用插件模块方式加入
      multiMonthPlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin, // needed for dateClick
      listPlugin
    ],
    events: [],
    height: "100%",
    handleWindowResize: true, //随浏览器窗口变化
    // initialView: 'dayGridMonth', // 初始化插件显示
    droppable: true, //可拖拽的
    timeZone: "local", //采用时区
    selectable: true,
    firstDay: 0,
    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
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
    initialDate: new Date(), //初始化日期
    // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    locale: zhCnLocale,
    nextDayThreshold: "01:00:00"
  };
  let calenderModel = ref<string>("view");
  const formCalendarOptions = ref<any>({
    ...commonOptions,
    initialView: "timeGridDay", // 初始化插件显示
    select: (item: any) => {
      console.log("select", item);
      outerData.value = {};
      if (item.allDay) {
        outerData.value = {
          startStr: item.startStr,
          sTime: "00:00",
          endStr: item.startStr,
          eTime: "24:00"
        };
      } else {
        let st =
          (item.start.getHours() < 10 ? "0" + item.start.getHours() : item.start.getHours()) +
          ":" +
          (item.start.getMinutes() < 10 ? "0" + item.start.getMinutes() : item.start.getMinutes());
        let se =
          (item.end.getHours() < 10 ? "0" + item.end.getHours() : item.end.getHours()) +
          ":" +
          (item.end.getMinutes() < 10 ? "0" + item.end.getMinutes() : item.end.getMinutes());
        outerData.value = {
          startStr: item.startStr.split("T")[0],
          sTime: st,
          endStr: item.endStr.split("T")[0],
          eTime: se
        };
      }
    },
    eventClick: async (item: any) => {
      outerData.value = {};
      // 日程点击事件
      console.log("eventClick", item);
    }
  });
  let currentDateParam = ref<Date>(null);
  let initFlag = ref<boolean>(true);
  const calendarOptions = ref<CalendarOptions>({
    ...commonOptions,
    headerToolbar: false,
    select: (item: any) => {
      let date = new Date();
      let ss = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      outerData.value = {
        startStr: item.startStr,
        sTime: ss,
        endStr: item.endStr,
        eTime: ss
      };
      if (calenderModel.value != "edit") {
        return;
      }
      calendarManageVisible.value = true;
      console.log("select", item);
    },
    eventClick: async (item: any) => {
      outerData.value = {
        title: item.event.title,
        id: item.event.id,
        backgroundColor: item.event.backgroundColor,
        borderColor: item.event.borderColor,
        ...item.event.extendedProps
      };
      if (calenderModel.value != "edit") {
        return;
      }
      calendarManageVisible.value = true;
      await nextTick();
      dialogFullCalendar.value.getApi().changeView("timeGridDay");
      // 日程点击事件
      console.log("eventClick", item);
    },
    eventMouseEnter: (item: any) => {
      // 用户将鼠标悬停在事件上时触发
      console.log("eventMouseEnter", item);
    },
    datesSet: (item: CalendarOptions) => {
      console.log("datesSet", item);
      calendarTitle.value = item.view.title;
    },
    // eventSources: (item) => {
    //   currentDate = item?.start;
    //   console.log("eventSources", currentDate, item);
    //   if (!isInit.value) {
    //     loadAllCalendar();
    //   }
    // },
    eventsSet: (item: any) => {
      // let dateProfile = item[0]?._context?.dateProfile;
      // if (dateProfile) {
      //
      // }
      // console.log("eventsSet", item[0], item[0]?._context, dateProfile);
    },
    dateClick: async (item: any) => {
      let date = new Date();
      outerData.value = {
        startStr: item.dateStr,
        sTime: date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
      };

      if (calenderModel.value != "edit") {
        return;
      }
      calendarManageVisible.value = true;
      await nextTick();
      dialogFullCalendar.value.getApi().changeView("timeGridDay");
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
    customButtons: {
      btn: {
        text: "看板",
        click: () => {}
      },
      editBtn: {
        text: editTitle,
        click: () => {}
      }
    }
  });
  const changeDate = (date: any) => {
    console.log(date);
    let api = fullCalendar.value.getApi();
    api.gotoDate(date);
    api.select(date);
  };
  const selectDate = (val: string) => {
    if (!starHorseDateRef.value) {
      return;
    }
    starHorseDateRef.value.selectDate(val);
    changeDate(dateValue.value);
  };
  onBeforeUnmount(() => {
    fullCalendar.value.getApi().destroy();
  });

  // 周背景色
  watch(
    dateValue,
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
    },
    { immediate: true }
  );

  const calendarFieldRef = ref();
  const addCalendar = (type: string, evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    calendarOperation(type, {});
  };
  const close = () => {
    calendarTypeVisible.value = false;
    calendarManageVisible.value = false;
  };
  const calendarManageSubmit = async () => {
    let result = await calendarMangeRef.value.$refs.starHorseFormRef.validate();
    if (!result) {
      return;
    }
    let data = calendarMangeRef.value.getFormData().value;
    let mergeResult = await loadData("system-config/system/calendarManage/merge", data);
    if (mergeResult.error) {
      warning(mergeResult.error);
      return;
    }
    success("操作成功");
    loadAllCalendar();
    close();
  };
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
      end: data["endStr"] + " " + data["eTime"]
    };
    fullCalendar.value.getApi().view.calendar.addEvent(temp);
    if (action == "close") {
      close();
    }
  };
  let searchText = ref<string>("");
  let calendarTypeVisible = ref<boolean>(false);
  let calendarManageVisible = ref<boolean>(false);
  let calendarTypeRef = ref();
  let calendarMangeRef = ref();
  const exportData = async (data: any) => {
    await nextTick();
    if (data.id) {
      let event: any = dialogFullCalendar.value.getApi().view.calendar.getEventById(data.id);
      if (event) {
        event.remove();
      }
    } else {
      data["id"] = uuid();
    }
    let flag = false;
    if (data.allDay?.includes("all")) {
      flag = true;
      let str = currentDate();
      data["startStr"] = str;
      data["start"] = str + " 00:00";
      data["endStr"] = str;
      data["end"] = str + " 23:59";
    } else {
      if (data.sTime) {
        flag = true;
        data["start"] = (data["startStr"] || "") + " " + (data["sTime"] || "");
      }
      if (data.eTime) {
        data["end"] = (data["endStr"] || "") + " " + (data["eTime"] || "");
      }
    }
    if (dialogFullCalendar.value && flag) {
      dialogFullCalendar.value.getApi().view.calendar.addEvent(data);
    }
  };
  const addCalendarType = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    calendarTypeVisible.value = true;
  };
  const calendarOperation = async (cmd: string, item: any) => {
    console.log(cmd, item);
    if (cmd == "delete") {
      let resultData = await deleteByIds(
        "/system-config/system/calendarDefine/batchDeleteById",
        [item["idCalendarDefine"]],
        "删除日历后，所有日程都蒋被删除，确认要删除吗？"
      );
      if (resultData) {
        initData();
      }
    } else {
      calendarManageVisible.value = true;
      await nextTick();
      dialogFullCalendar.value.getApi().changeView("timeGridDay");
    }
  };
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
  };
  let myCalendarList = ref<Array<any>>([]);
  let isInit = ref<boolean>(false);
  const initData = async () => {
    isInit.value = true;
    let userInfo = getUserInfo();
    let resultData = await loadData("system-config/system/calendarDefine/getAllByCondition", {
      fieldList: [createCondition("createdBy", userInfo.name + "(" + userInfo.username + ")")],
      orderBy: [
        {
          fieldName: "createdTime",
          ascOrDesc: "asc"
        }
      ]
    });
    if (resultData.error) {
      warning(resultData.error);
      return;
    }
    myCalendarList.value = resultData.data;
    await loadAllCalendar(resultData.data.map((item) => item.idCalendarDefine));
    isInit.value = false;
  };
  const loadAllCalendar = async (ids: any, searchParam: SearchParams[] = []) => {
    let params: SearchParams[] = [];
    if (!ids) {
      ids = myCalendarList.value.map((item) => item.idCalendarDefine);
    }
    if (!ids || ids.length == 0) {
      return;
    }
    params.push(createCondition("idCalendarDefine", ids, Array.isArray(ids) ? "in" : "eq"));
    if (searchParam?.length > 0) {
      params = params.concat(searchParam);
    }
    let ymd = currentMonthRange();
    if (currentDateParam.value) {
      ymd = monthRange(currentDateParam.value);
    }
    params.push(createCondition("createdTime", [ymd.starDateStr + " 00:00:00", ymd.lastDateStr + " 23:59:59"], "bt"));
    let resultData = await loadData("system-config/system/calendarManage/getAllByCondition", {
      fieldList: params,
      orderBy: [
        {
          fieldName: "createdTime",
          ascOrDesc: "asc"
        }
      ]
    });
    if (resultData.error) {
      console.log(resultData.error);
      return;
    }
    await nextTick();
    fullCalendar.value.getApi().removeAllEvents();
    let datas = resultData.data;
    for (let i in datas) {
      let data = datas[i];
      data["id"] = data["idCalendarManage"];
      data["start"] = data["startStr"] + (data.sTime ? " " + data.sTime : " 00:00");
      data["end"] = data["endStr"] + (data.eTime ? " " + data.eTime : " 23:59");
      fullCalendar.value.getApi().view.calendar.addEvent(data);
    }
  };
  const searchCalendar = () => {
    let params: SearchParams[] = [];
    if (searchText.value) {
      params.push(createCondition("title", searchText.value, "lk"));
    }
    loadAllCalendar(null, params);
  };
  const changeDateRange = (type: string) => {
    let api = fullCalendar.value.getApi();
    switch (type) {
      case "preYear":
        api.prevYear();
        break;
      case "pre":
        api.prev();
        break;
      case "nextYear":
        api.nextYear();
        break;
      case "next":
        api.next();
        break;
      default:
        api.today();
    }
    let view = api.view;
    console.log(view);
    currentDateParam.value = view.currentStart;
    loadAllCalendar();
  };
  const changeModel = (type: string) => {
    if (type == "editBtn") {
      calenderModel.value = calenderModel.value == "view" ? "edit" : "view";
      editTitle.value = calenderModel.value == "view" ? "开启编辑模式" : "关闭编辑模式";
    } else {
      fullCalendar.value.getApi().changeView(type);
    }
  };
  onMounted(async () => {
    await initData();
    await nextTick();
    fullCalendar.value.getApi().changeView("dayGridMonth");
    setTimeout(() => {
      fullCalendar.value.getApi().changeView("dayGridMonth");
      // calendarTitle.value=fullCalendar.value.title;
    }, 500);
  });
</script>

<template>
  <star-horse-dialog
    :title="'添加日程'"
    @closeAction="close"
    @merge="calendarManageSubmit"
    :dialog-visible="calendarManageVisible"
    :draggable="true"
    :self-func="true"
  >
    <div class="dialog-body2">
      <div class="dialog-form">
        <star-horse-form
          :formSize="compSize"
          :outer-form-data="outerData"
          :field-list="calendarManage(myCalendarList)"
          @exportData="exportData"
          ref="calendarMangeRef"
        />
      </div>
      <div class="dialog-calendar">
        <FullCalendar
          ref="dialogFullCalendar"
          :eventLimit="true"
          allDayText="全天"
          :editable="true"
          :options="formCalendarOptions"
        >
        </FullCalendar>
      </div>
    </div>
  </star-horse-dialog>
  <star-horse-dialog
    :title="'添加日历'"
    @closeAction="close"
    @merge="calendarTypeSubmit"
    :dialog-visible="calendarTypeVisible"
    :draggable="true"
    :self-func="true"
  >
    <star-horse-form
      :formSize="compSize"
      :outer-form-data="outerData"
      :field-list="{
        fieldList: defineType('calendar')
      }"
      ref="calendarTypeRef"
    />
  </star-horse-dialog>
  <div class="star-horse-calendar">
    <div class="calendar-left">
      <div class="create-calender">
        <el-button text @click="addCalendar('meeting', $event)" :size="compSize">
          <star-horse-icon icon-class="meeting" />
          预定会议
        </el-button>
        <el-button text @click="addCalendar('calendar', $event)" :size="compSize">
          <star-horse-icon icon-class="calendar" />
          新建日程
        </el-button>
      </div>
      <div class="create-calender">
        <el-input v-model="searchText" :size="compSize" @keydown.enter="searchCalendar" placeholder="请输入日程">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-calendar v-model="dateValue" ref="starHorseDateRef" class="custom-calendar">
        <template #header="{ date }">
          <div class="date-header">
            <span>{{ date }}</span>
            <div class="header-body">
              <el-icon @click="selectDate('prev-month')" style="cursor: pointer">
                <ArrowLeftBold />
              </el-icon>
              <el-icon @click="selectDate('next-month')" style="cursor: pointer">
                <ArrowRightBold />
              </el-icon>
            </div>
          </div>
        </template>
        <template #date-cell="{ data }">
          <p
            class="calendar-cell"
            :class="[data.date >= selectedWeekRange[0] && data.date <= selectedWeekRange[1] ? 'is-week' : '']"
            @click="changeDate(data.date)"
          >
            {{ data.day.split("-").slice(2).join() }}
            {{ data.isSelected ? "✔️" : "" }}
          </p>
        </template>
      </el-calendar>
      <el-collapse v-model="collapseModel">
        <el-collapse-item name="first" style="height: auto">
          <template #title>
            <div class="collapse-item-title title">
              <div style="width: 80%">我的日历</div>
              <star-horse-icon icon-class="add" title="添加日历" @click="addCalendarType" />
            </div>
          </template>
          <template v-for="item in myCalendarList">
            <div class="my-calendar">
              <div class="title" @click="loadAllCalendar(item.idCalendarDefine)">
                <star-horse-icon :icon-class="item.category || 'user-cycle'" />
                {{ item.calendarName }}
              </div>
              <el-dropdown placement="bottom" @command="(cmd) => calendarOperation(cmd, item)">
                <star-horse-icon icon-class="more" cursor="pointer" color="var(--star-horse-style)" size="20px" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="add">
                      <star-horse-icon icon-class="add" />
                      添加日程
                    </el-dropdown-item>
                    <el-dropdown-item command="delete">
                      <star-horse-icon icon-class="delete" color="var(--el-color-danger)" />
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
      <div class="calendar-tool-bar">
        <div class="tool-bar-left">
          <star-horse-icon
            title="上一年"
            @click="changeDateRange('preYear')"
            cursor="pointer"
            icon-class="arrow-double-left"
            size="14px"
          />
          <star-horse-icon
            title="上一月"
            @click="changeDateRange('pre')"
            cursor="pointer"
            icon-class="arrow-left"
            size="14px"
          />
          <star-horse-icon
            title="下一月"
            @click="changeDateRange('next')"
            cursor="pointer"
            icon-class="arrow-right"
            size="14px"
          />
          <star-horse-icon
            title="下一年"
            @click="changeDateRange('nextYear')"
            cursor="pointer"
            icon-class="arrow-double-right"
            size="14px"
          />
          <star-horse-icon title="当前日期" @click="changeDateRange('today')" cursor="pointer" icon-class="today" />
        </div>
        <div class="tool-bar-center">{{ calendarTitle }}</div>
        <div class="tool-bar-right">
          <el-button link :size="compSize" @click="changeModel('multiMonthYear')">
            <star-horse-icon cursor="pointer" icon-class="calendar" />
            年
          </el-button>
          <el-button link :size="compSize" @click="changeModel('dayGridMonth')">
            <star-horse-icon cursor="pointer" icon-class="calendar" />
            月
          </el-button>
          <el-button link :size="compSize" @click="changeModel('timeGridWeek')">
            <star-horse-icon cursor="pointer" icon-class="calendar" />
            周
          </el-button>
          <el-button link :size="compSize" @click="changeModel('timeGridDay')">
            <star-horse-icon cursor="pointer" icon-class="calendar" />
            日
          </el-button>
          <el-button link :size="compSize" @click="changeModel('listMonth')">
            <star-horse-icon cursor="pointer" icon-class="calendar" />
            列表
          </el-button>
          <el-button link :size="compSize" @click="changeModel('editBtn')">
            <star-horse-icon cursor="pointer" icon-class="edit" />
            {{ editTitle }}
          </el-button>
        </div>
      </div>
      <FullCalendar
        ref="fullCalendar"
        height="parent"
        :eventLimit="true"
        allDayText="全天"
        :editable="true"
        :options="calendarOptions"
        class="app-calendar"
      >
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
  .calendar-tool-bar {
    height: 35px;
    display: flex;
    align-items: center;
    vertical-align: middle;
    width: 99%;
    margin: 0 auto;

    .tool-bar-left {
      flex: 1;
      display: flex;
      align-items: center;
      vertical-align: middle;
      height: inherit;
    }

    .tool-bar-center {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 16px;
      vertical-align: middle;
      justify-content: center;
      font-weight: 800;
      height: inherit;
    }

    .tool-bar-right {
      flex: 1;
      display: flex;
      height: inherit;
      align-items: center;
      vertical-align: middle;
    }
  }

  .dialog-body2 {
    display: flex;
    height: inherit;
    width: 100%;
    overflow: hidden;

    .dialog-form {
      height: 100%;
      flex: 1;
      margin-right: 5px;
    }

    .dialog-calendar {
      height: 100%;
      width: 100%;
      flex: 1;
    }
  }

  .my-calendar {
    height: 30px;
    display: flex;
    align-items: center;
    vertical-align: middle;
    justify-content: space-between;
    padding-left: 15px;

    .title {
      display: flex;
      cursor: pointer;
      align-items: center;
      vertical-align: middle;
    }

    &:hover {
      background: #fafafa;
    }
  }

  .create-calender {
    width: 99%;
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
