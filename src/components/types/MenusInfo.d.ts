interface Meta {
    title: string;
    menuId: string;
    keepAlive: boolean;
    menuIcon: string;
}
export declare interface MenusInfo {
    path: string;
    /* @vite-ignore */
    component: Object;
    name: string;
    children: Array<MenusInfo>;
    meta: Meta;
}
