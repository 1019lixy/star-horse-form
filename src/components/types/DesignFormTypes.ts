export interface CompType {
  itemName: string;
  itemType: string;
  itemIcon: string;
  category: number;
  itemDesc?: string;
}

export interface RoleInfo {
  roleId: string;
  roleName: string;
  roleCode?: string;
}

export interface UserInfo {
  userId: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  roles?: RoleInfo[];
}