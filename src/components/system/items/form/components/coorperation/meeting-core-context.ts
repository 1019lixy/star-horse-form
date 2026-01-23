import { inject, provide } from "vue";
import { useMeetingDialog } from "./useMeetingDialog";

const meetingCoreKey = Symbol("meetingCore");

export type MeetingCore = ReturnType<typeof useMeetingDialog>;

// 单例核心对象
let globalCore: MeetingCore | null = null;

export const provideMeetingCore = (core?: MeetingCore) => {
  const value = core ?? (globalCore ?? useMeetingDialog());
  globalCore = value;
  provide(meetingCoreKey, value);
  return value;
};

export const useMeetingCore = () => {
  return inject<MeetingCore>(meetingCoreKey) ?? (globalCore ?? useMeetingDialog());
};
