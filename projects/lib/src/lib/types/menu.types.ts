/**
 * 導航菜單類型定義
 */
export interface SubCategory {
  title: string;
  link: string;
  hero: string;
}

export interface MenuCategory {
  category: string;
  subCategory: SubCategory[];
}

export interface MenuItem {
  title: string;
  link?: string;
  subMenu?: MenuCategory[];
}
