import { Images } from './images';

/**
 * 靜態資料原始格式（對照 public/data/*.json，取代原本的 Django API）
 */

export interface ArticleRecord {
  id: number;
  title: string;
  image: string;
  description: string;
  content: string;
  newTypeId: number;
  newTypeTitle: string;
  newTypeColor: string;
  newTypeEnglishName: string;
  branchShopId: number | null;
  branchShopEnglishName: string | null;
  state: number;
  expiration_date: string | null;
  create_date: string;
  create_time: string;
}

export interface NewsTypeRecord {
  id: number;
  title: string;
  englishName: string;
  image: string;
  color: string;
  description: string;
  state: number;
}

export interface BranchShop {
  id: number;
  title: string;
  englishName: string;
  images_list: string[];
  phone: string;
  location: string;
  openTime: string;
  consumptionPattern: string;
  googleMapUrl: string;
  bookingUrl: string;
  instagramID?: string;
  facebookID?: string;
  lineID?: string;
}

export interface BranchMenu {
  title: string;
  image: string;
  unitLabel?: string;
  subMenu: { subTitle: string; price: number; priceAlt?: number }[];
}

export interface BranchData {
  shop: BranchShop;
  menus: BranchMenu[];
  gallery: Images[];
}

/** 分店某一天已被訂走的時段，之後預計由 gh_finance 的活動管理資料同步過來 */
export interface ReservationBlock {
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  note?: string;
}

export interface ApplyData {
  title: string;
  branchShop_title: string;
  pay: string;
  detail: string;
  location: string;
  workTime: string;
  welfare_title: string[];
  how2Pay_title: string[];
}

export interface ApplyGroup {
  title: string;
  data: ApplyData[];
}
