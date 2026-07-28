/**
 * FontAwesome 圖標配置
 * 只導入實際使用的圖標，實現樹搖優化
 * 減少 @fortawesome/free-brands-svg-icons 和 @fortawesome/free-solid-svg-icons 的包體積
 */

// Solid Icons (導入實際使用的)
import { 
  faChevronUp, 
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

// Brand Icons (導入實際使用的)
import { 
  faFacebookF, 
  faInstagram, 
  faLine 
} from '@fortawesome/free-brands-svg-icons';

/**
 * 所有使用的圖標集合
 * 這些是整個應用中使用的全部圖標
 * 樹搖優化會移除未導入的圖標
 */
export const GLOBAL_ICONS = {
  // Solid Icons
  faChevronUp,
  faChevronDown,
  
  // Brand Icons
  faFacebookF,
  faInstagram,
  faLine,
};

// 類型推斷
export type IconName = keyof typeof GLOBAL_ICONS;

/**
 * 輔助函數：獲取特定圖標
 * @param iconName 圖標名稱
 * @returns 圖標對象
 */
export function getIcon(iconName: IconName) {
  return GLOBAL_ICONS[iconName];
}
