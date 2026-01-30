// 可选择的身份列表

export const availableUsers: any = [
    {id: "zhangsan", name: "张三", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"},
    {id: "lisi", name: "李四", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"},
    {id: "wangwu", name: "王五", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"}
];
// 模拟会议信息
export const meetingInfo = {
    id: "MEET123456",
    name: "项目进度讨论会议",
    startTime: new Date().toLocaleString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toLocaleString(),
    host: "张三",
    hostAvatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    password: "123456",
    duration: 60 // 会议时长（分钟）
};
