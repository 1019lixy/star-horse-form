<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ArrowLeftBold, ArrowRightBold, InfoFilled} from "@element-plus/icons-vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import {CalendarOptions} from "@fullcalendar/core";

const props = defineProps({
  eventList: {type: Array, default: []},
});
const fullCalendar = ref();
const starHorseDateRef = ref();
let dateValue = ref<any>(null);
let selectedItem = ref<number>(0);
let selectedWeekRange = ref<Array<any>>([]);
let subscriptionList = ref<Array<any>>([
  {
    isChecked:false,
    followName:"Test",
    id:"0002",
  }
]);
const collapseModel = ref<string>("first");
let predefineColors = ref<Array<any>>([]);

const calendarOptions: CalendarOptions = {
  plugins: [
    // 加载插件，V5采用插件模块方式加入
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin, // needed for dateClick
  ],
  // height: 800, //日历高度
  events: [],
  headerToolbar: {
    // 头部toolba
    left: 'prev,next today',
    center: 'title',
    right: 'btn,timeGridDay,timeGridWeek,dayGridMonth',
  },
  handleWindowResize: true, //随浏览器窗口变化
  // initialView: 'dayGridMonth', // 初始化插件显示
  editable: true, //是否可编辑
  droppable: true,//可拖拽的
  timeZone: 'local',//采用时区
  selectable: true,
  firstDay: 0,
  weekNumbers: true,
  dayMaxEvents: true,
  weekends: true,
  fixedWeekCount: 6,
  // selectMirror: true,
  // initialDate:""//初始化日期
  // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  // weekends: true, // 是否显示一周七天
  select: (item: any) => {
    console.log("select", item);
  },
  eventClick: (item: any) => {
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
    //日期方格点击事件
    console.log("dateClick", item);
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
        console.log("xx");
      }
    }
  },
};
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
  // $(".calendar").fullCalendar('destroy');
  // fullCalendar.value.destroy();
  fullCalendar.value.getApi().destroy();
})
onMounted(async () => {
  await nextTick();
  fullCalendar.value.getApi().view.calendar.addEvent(...props.eventList);
  // fullCalendar.value.getApi().changeView("timeGridDay");
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
 *   title: `青兔_test01`,
 *   start: '2024-04-25' + ' 13:00:00',
 *   end: '2024-04-25' + ' 17:00:00',
 *   // 修改背景颜色
 *   backgroundColor:'#d8377a',
 *   // 修改边框颜色
 *   borderColor:'#d8377a',
 * })
 *
 */
</script>

<template>
  <div class="star-horse-calendar">
    <div class="calendar-left">
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
        <el-collapse-item name="first" class="relative z-50 collapseBox" style="height: auto;">
          <template #title>
            <div class="collapse-item-title title">
              <div style="width: 80%">我的日程</div>
            </div>
          </template>
        </el-collapse-item>
        <el-collapse-item name="second" class="relative z-50 collapseBox" style="height: auto;">
          <template #title>
            <div class="collapse-item-title title">
              <div style="width: 80%">订阅日程</div>
            </div>
          </template>
          <div class="w-full h-44 overflow-y-scroll overflow-x-hidden z-50">
            <div v-for="(item,index) in subscriptionList" :key="item.id">
              <div class="flex justify-between items-center mx-4 mb-2" :class="`itemBox_${index}`" v-if="index != 0">
                <div class="flex items-center ">
                  <input type="checkbox" v-model="item.isChecked" class="mr-2" :class="`checked_${item.id}`"
                         @change="filterEvent(item)">
                  <p class=" text-base">{{ item.followName }}</p>
                </div>
                <el-icon size="20" color="#54575D" class="cursor-pointer" @click.stop="getSubscriberLoaction(index)">
                  <MoreFilled/>
                </el-icon>
                <aside v-show="selectedItem == index"
                       class="absolute shadow-deeper rounded-lg rounded-tr-none overflow-hidden"
                       :class="`asideBox_${index}`" style="width: 140px; max-height: 110px; z-index:999999;"
                       @click.stop="null">
                  <div class="w-full h-full p-4 pt-5 bg-mainWhite">
                    <div class="mb-4">
                      <div class="flex justify-between items-center">
                        <p class="text-test text-base mb-1 cursor-pointer">修改颜色</p>
                        <el-color-picker v-model="item.color" show-alpha :predefine="predefineColors"
                                         @change="changeColor($event,item)"/>
                      </div>
                      <p class="text-test text-base mb-1 cursor-pointer" @click="setPermission(item)"
                         v-if="item.editable == 1">设置权限</p>
                      <div class="relative">
                        <el-popconfirm title="确认取消订阅?" confirm-button-text="是" cancel-button-text="否"
                                       :icon="InfoFilled" icon-color="#626AEF" placement="right"
                                       @confirm="handleCancleSubscription(item.id)">
                          <template #reference>
                            <p class="text-test text-base mb-1 cursor-pointer">取消订阅</p>
                          </template>
                        </el-popconfirm>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="calendar-right">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" class="app-calendar">
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
  </div>
</template>

<style scoped lang="scss">

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

:deep(.fc-daygrid-body) {
  height: 100% !important;
  width: 100% !important;

}
</style>
