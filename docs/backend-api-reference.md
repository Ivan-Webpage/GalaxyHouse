# 後端 API 參考（歷史文件——後端已移除）

> **狀態更新**：後端已於重構中移除，前端不再呼叫這些 API。這份文件保留下來是因為 `public/data/*.json` 裡的每個欄位、每個過濾/排序規則，都是照這裡記錄的 API 行為 1:1 對應搬過去的（實作在 [ContentService](../projects/lib/src/lib/service/content.service.ts)）。要追溯某個資料欄位或業務邏輯原本從哪裡來、為什麼這樣設計，看這份文件即可，不需要回頭翻 Django 程式碼。

這份文件記錄了重構前前端實際依賴的 5 個後端 API（不是後端全部功能）。每一支都附上：呼叫位置、URL、後端邏輯、回傳形狀。

> 後端程式碼位置：`backEnd20251210/`。若要重新確認行為，對照的 view 檔案路徑都已附上。

## 1. 首頁 / 文章列表 — `GET article/?format=json`

- 呼叫端：[src/app/home/home.component.ts](../src/app/home/home.component.ts)、[src/app/article/article.component.ts](../src/app/article/article.component.ts)（文章詳情頁側邊的其他文章列表）
- 後端：[backEnd20251210/article/views.py](../backEnd20251210/article/views.py) `articleViewSet.get_queryset`
- 後端邏輯（重構時必須在前端重建）：
  - 只回傳 `state > 0`（上架中）的文章
  - 只回傳 `expiration_date` 未過期或為 null 的文章
  - 排序：`expiration_date` 由近到遠，再依 `create_time` 新到舊
  - **最多只回傳 9 筆**
- 回傳形狀（`ArticleSimple[]`，見 [projects/lib/src/lib/interface/article.ts](../projects/lib/src/lib/interface/article.ts)）：
  ```ts
  { id: number; title: string; image: string; newType: { title: string; color: string };
    description: string; expiration_date: string; create_date: string }[]
  ```

## 2. 單篇文章 — `GET article/{id}/pick_article/?format=json`

- 呼叫端：[src/app/article/article.component.ts](../src/app/article/article.component.ts)
- 後端：`articleViewSet.pick_article`（同上檔案）
- 邏輯：依 `id` 取單篇，僅限 `state > 0`。**沒有**過期日過濾（過期文章仍可被直接連結看到）。
- 回傳形狀（`Article`）：多了 `content`（富文字 HTML，原本是 `RichTextUploadingField`）等欄位，見 interface 定義。

## 3. 依分類篩選消息 — `POST article/pick_news_type/`

- 呼叫端：[src/app/news/news.component.ts](../src/app/news/news.component.ts)
- 後端：`articleViewSet.pick_news_type`
- Request body：`{ newType: string, branchShop: string }`（對應路由 `/news/:newType/:branchShop`）
- 邏輯：
  - 若 `branchShop === "galaxyhouse"` → 只用 `newType` 篩選（不分店）
  - 否則 → 同時用 `newType` 的 `englishName` 與 `branchShop` 的 `englishName` 篩選
  - 一樣套用「未過期」「`state > 0`」「依 `expiration_date`、`create_time` 排序」規則，但**沒有 9 筆上限**
- 回傳形狀：同 `ArticleSimple[]`

## 4. 分店詳情（含菜單與相簿）— `GET branchShop/{englishName}/pick_classify/?format=json`

- 呼叫端：[src/app/branch-shop/branch-shop.component.ts](../src/app/branch-shop/branch-shop.component.ts)
- 後端：[backEnd20251210/branchShop/views.py](../backEnd20251210/branchShop/views.py) `branchShopViewSet.pick_classify`
- 邏輯：
  - 用 `englishName`（如 `Songshan`、`Tianmu`）查唯一分店
  - 撈該分店 `state > 0` 的所有菜單品項，**依 `menuType.title` 分組**成 `{ title, image, subMenu: [{subTitle, price}] }[]`（`image` 取自 menuType 本身的封面圖，不是每個品項各自的圖）
  - 撈該分店 `state > 0` 的所有相簿照片
- 回傳形狀（對照 component 內定義的 `BranchData` interface）：
  ```ts
  {
    shop: { title, images_list, phone, location, googleMapUrl, bookingUrl,
            consumptionPattern, instagramID?, facebookID?, lineID?, gallery, openTime },
    menus: { title: string; image: string; subMenu: { subTitle: string; price: number }[] }[],
    gallery: Images[]
  }
  ```

## 5. 職缺分類 — `GET apply/shopClassification/?format=json`

- 呼叫端：[src/app/apply/apply.component.ts](../src/app/apply/apply.component.ts)
- 後端：[backEnd20251210/apply/views.py](../backEnd20251210/apply/views.py) `applyViewSet.shopClassification`
- 邏輯：撈所有 `state > 0` 的分店，每間分店底下再撈 `state > 0` 的職缺，組成「依分店分組」的陣列
- 回傳形狀：
  ```ts
  { title: string; // 分店名稱
    data: { title, branchShop_title, pay, detail, location, workTime,
            welfare_title: string[], how2Pay_title: string[] }[] }[]
  ```

## 相關資料模型（欄位參考）

完整欄位定義見對應的 Django model：

- 分店：[backEnd20251210/branchShop/models.py](../backEnd20251210/branchShop/models.py)（`branchShop`, `branchShopGallery`）
- 文章：[backEnd20251210/article/models.py](../backEnd20251210/article/models.py)（`article`, `newType`）
- 職缺：[backEnd20251210/apply/models.py](../backEnd20251210/apply/models.py)（`apply`, `welfare`, `how2Pay`）
- 菜單：`backEnd20251210/menu/models.py`（`menu`, `menuType`）

所有內容型 model 都有共通的 `state`（0=關閉/1=開啟，用來做軟性上下架）與 `expiration_date`（僅文章有，用來做到期自動下架）欄位 —— 這兩個欄位背後的「上下架」「到期」邏輯，是靜態化之後最需要在前端或建置流程重新實作的部分。

## 圖片 / 媒體

後端圖片走 Django `ImageField`（`upload_to='static/upload/image/'`），由 `backEnd20251210/urls.py` 裡的 `re_path(r'^media/...')` 動態提供，且部分 model（`newType`, `article`）在 `clean()` 裡會用 `imageCheck.ImageValidator` 檢查圖片比例（16:9）與大小上限（300 單位，需回頭確認單位是 KB 或其他）。移除後端後這些圖片需要整批下載並搬進前端可引用的靜態路徑，圖片比例/大小檢查如果還需要，要在資料匯出或建置流程中重建。
