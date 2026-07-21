-- ============================================
-- CFOCN 資料庫結構說明 Part 2 - 請購/採購/付款/品類
-- ============================================

-- 【付款條件主檔 - 儲存付款條件資料】
-- 表格名稱: CMSNA
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   NA001 nchar(1) -- 類別代號(PK)
--   NA002 nchar(6) -- 付款條件代號(PK)
--   NA003 nvarchar(40) -- 付款條件名稱
--   NA004 nvarchar(1) -- 票據兌現天數
--   NA005 numeric -- 現金折扣率
--   NA006 nvarchar(1) -- 現金折扣計算方式
--   NA007 nvarchar(2) -- 票據天數
--   NA008 nvarchar(1) -- 計息方式
--   NA009 numeric -- 計息利率
--   NA010 nvarchar(1) -- 計息天數
--   NA011 nvarchar(2) -- 票據類別
--   NA012 nvarchar(1) -- 票據兌現方式
--   NA013 nvarchar(1) -- 票據兌現條件
--   NA014 numeric -- 票據兌現比率
--   NA015 numeric -- 票據兌現金額
--   NA016 numeric -- 票據兌現天數2
--   NA017 nvarchar(255) -- 備註
--   NA018 nvarchar(1) -- 自定義欄位
--   NA019 nvarchar(1) -- 自定義欄位
--   NA020 numeric -- 自定義欄位
--   NA021 numeric -- 自定義欄位
--   NA022 nvarchar(1) -- 自定義欄位
--   NA023 nvarchar(30) -- 自定義欄位
--   NA024 nvarchar(60) -- 自定義欄位
--   NA025 nvarchar(20) -- 自定義欄位
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- 【品號類別主檔 - 儲存品號分類資料】
-- 表格名稱: INVMA
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   MA001 nchar(1) -- 類別代號(PK)
--   MA002 nchar(6) -- 類別名稱
--   MA003 nvarchar(40) -- 類別簡稱
--   MA004 nvarchar(20) -- 上層類別
--   MA005 nvarchar(20) -- 類別層級
--   MA006 nvarchar(20) -- 類別順序
--   MA007 nvarchar(20) -- 類別屬性
--   MA008 numeric -- 庫存科目
--   MA009 numeric -- 銷貨收入科目
--   MA010 nvarchar(1) -- 銷貨成本科目
--   MA011 nvarchar(30) -- 進貨科目
--   MA012 nvarchar(60) -- 備註
--   MA013 numeric -- 自定義欄位
--   MA014 numeric -- 自定義欄位
--   MA015 nvarchar(20) -- 自定義欄位
--   MA016 nvarchar(6) -- 自定義欄位
--   MA017 nvarchar(15) -- 自定義欄位
--   MA018 nvarchar(100) -- 自定義欄位
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- 【請購單主檔 - 儲存請購單資料】
-- 表格名稱: PURTA
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   TA001 nchar(4) -- 單別(PK)
--   TA002 nchar(11) -- 單號(PK)
--   TA003 nvarchar(8) -- 請購日期
--   TA004 nvarchar(10) -- 請購人員
--   TA005 nvarchar(26) -- 部門代號
--   TA006 nvarchar(255) -- 專案代號
--   TA007 nvarchar(1) -- 幣別
--   TA008 numeric -- 匯率
--   TA009 nvarchar(1) -- 稅別
--   TA010 nvarchar(6) -- 稅率
--   TA011 numeric -- 總金額
--   TA012 nvarchar(10) -- 總稅額
--   TA013 nvarchar(8) -- 總未稅金額
--   TA014 nvarchar(10) -- 狀態碼
--   TA015 numeric -- 審核碼
--   TA016 nvarchar(1) -- 列印次數
--   TA017 numeric -- 確認碼
--   TA018 nvarchar(25) -- 簽核狀態
--   TA019 nvarchar(4) -- 來源單別
--   TA020 numeric -- 來源單號
--   TA021 nvarchar(4) -- 備註
--   TA022 nvarchar(10) -- 自定義欄位
--   TA023 numeric -- 自定義欄位
--   TA024 numeric -- 自定義欄位
--   TA025 nvarchar(1) -- 自定義欄位
--   TA026 nvarchar(30) -- 自定義欄位
--   TA027 nvarchar(60) -- 自定義欄位
--   TA028 nvarchar(1) -- 自定義欄位
--   TA550 nvarchar(1) -- 自定義欄位
--   TA551 numeric -- 自定義欄位
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- 【請購單明細 - 儲存請購單明細資料】
-- 表格名稱: PURTB
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   TB001 nchar(4) -- 單別(PK)
--   TB002 nchar(11) -- 單號(PK)
--   TB003 nchar(4) -- 序號(PK)
--   TB004 nvarchar(40) -- 品號
--   TB005 nvarchar(120) -- 品名
--   TB006 nvarchar(120) -- 規格
--   TB007 nvarchar(6) -- 單位
--   TB008 nvarchar(10) -- 請購數量
--   TB009 numeric -- 已轉採購數量
--   TB010 nvarchar(10) -- 需求日期
--   TB011 nvarchar(8) -- 預交日期
--   TB012 nvarchar(255) -- 備註
--   TB013 nvarchar(10) -- 建議廠商
--   TB014 numeric -- 單價
--   TB015 nvarchar(6) -- 金額
--   TB016 nvarchar(4) -- 稅額
--   TB017 numeric -- 未稅金額
--   TB018 numeric -- 狀態碼
--   TB019 nvarchar(8) -- 審核碼
--   TB020 nvarchar(1) -- 確認碼
--   TB021 nvarchar(1) -- 簽核狀態
--   TB022 nvarchar(21) -- 來源單別
--   TB023 nvarchar(10) -- 來源單號
--   TB024 nvarchar(255) -- 來源序號
--   TB025 nvarchar(1) -- 自定義欄位
--   TB026 nvarchar(1) -- 自定義欄位
--   TB027 nvarchar(6) -- 自定義欄位
--   TB028 nvarchar(6) -- 自定義欄位
--   TB029 nvarchar(4) -- 自定義欄位
--   TB030 nvarchar(11) -- 自定義欄位
--   TB031 nvarchar(4) -- 自定義欄位
--   TB032 nvarchar(1) -- 自定義欄位
--   TB033 nvarchar(20) -- 自定義欄位
--   TB034 numeric -- 自定義欄位
--   TB035 numeric -- 自定義欄位
--   TB036 nvarchar(8) -- 自定義欄位
--   TB037 nvarchar(6) -- 自定義欄位
--   TB038 nvarchar(6) -- 自定義欄位
--   TB039 nvarchar(1) -- 自定義欄位
--   TB040 nvarchar(1) -- 自定義欄位
--   TB041 nvarchar(30) -- 自定義欄位
--   TB042 nvarchar(1) -- 自定義欄位
--   TB043 nvarchar(20) -- 自定義欄位
--   TB044 numeric -- 自定義欄位
--   TB045 numeric -- 自定義欄位
--   TB046 nvarchar(1) -- 自定義欄位
--   TB047 nvarchar(6) -- 自定義欄位
--   TB048 nvarchar(20) -- 自定義欄位
--   TB049 numeric -- 自定義欄位
--   TB050 nvarchar(4) -- 自定義欄位
--   TB051 numeric -- 自定義欄位
--   TB052 numeric -- 自定義欄位
--   TB053 numeric -- 自定義欄位
--   TB054 nvarchar(1) -- 自定義欄位
--   TB055 nvarchar(30) -- 自定義欄位
--   TB056 nvarchar(60) -- 自定義欄位
--   TB057 nvarchar(3) -- 自定義欄位
--   TB058 nvarchar(1) -- 自定義欄位
--   TB059 nvarchar(40) -- 自定義欄位
--   TB060 nvarchar(2) -- 自定義欄位
--   TB061 nvarchar(4) -- 自定義欄位
--   TB062 nvarchar(11) -- 自定義欄位
--   TB063 numeric -- 自定義欄位
--   TB064 nvarchar(1) -- 自定義欄位
--   TB065 numeric -- 自定義欄位
--   TB066 nvarchar(6) -- 自定義欄位
--   TB067 numeric -- 自定義欄位
--   TB068 numeric -- 自定義欄位
--   TB500 nvarchar(255) -- 自定義欄位
--   TB501 nvarchar(4) -- 自定義欄位
--   TB502 nvarchar(11) -- 自定義欄位
--   TB503 nvarchar(4) -- 自定義欄位
--   TB550 nvarchar(1) -- 自定義欄位
--   TB551 numeric -- 自定義欄位
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- 【採購單主檔 - 儲存採購單資料】
-- 表格名稱: PURTC
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   TC001 nchar(4) -- 單別(PK)
--   TC002 nchar(11) -- 單號(PK)
--   TC003 nvarchar(8) -- 採購日期
--   TC004 nvarchar(10) -- 供應商代號(FK->PURMA)
--   TC005 nvarchar(4) -- 部門代號
--   TC006 numeric -- 採購員代號
--   TC007 nvarchar(40) -- 交貨地址
--   TC008 nvarchar(16) -- 幣別
--   TC009 nvarchar(255) -- 匯率
--   TC010 nvarchar(6) -- 稅別
--   TC011 nvarchar(10) -- 稅率
--   TC012 nvarchar(1) -- 聯絡人
--   TC013 numeric -- 電話
--   TC014 nvarchar(1) -- 傳真
--   TC015 nvarchar(8) -- 備註
--   TC016 nvarchar(20) -- 狀態碼
--   TC017 nvarchar(20) -- 審核碼
--   TC018 nvarchar(1) -- 列印次數
--   TC019 numeric -- 確認碼
--   TC020 numeric -- 簽核狀態
--   TC021 nvarchar(255) -- 來源單別
--   TC022 nvarchar(255) -- 來源單號
--   TC023 numeric -- 總金額
--   TC024 nvarchar(8) -- 總稅額
--   TC025 nvarchar(10) -- 總未稅金額
--   TC026 numeric -- 總數量
--   TC027 nvarchar(6) -- 付款條件(FK->CMSNA)
--   TC028 numeric -- 預交日期
--   TC029 numeric -- 自定義欄位
--   TC030 nvarchar(1) -- 自定義欄位
--   TC031 numeric -- 自定義欄位
--   TC032 nvarchar(2) -- 自定義欄位
--   TC033 nvarchar(1) -- 自定義欄位
--   TC034 nvarchar(10) -- 自定義欄位
--   TC035 nvarchar(1) -- 自定義欄位
--   TC036 nvarchar(25) -- 自定義欄位
--   TC037 nvarchar(4) -- 自定義欄位
--   TC038 nvarchar(1) -- 自定義欄位
--   TC039 nvarchar(4) -- 自定義欄位
--   TC040 nvarchar(1) -- 自定義欄位
--   TC041 nvarchar(1) -- 自定義欄位
--   TC042 numeric -- 自定義欄位
--   TC043 numeric -- 自定義欄位
--   TC044 nvarchar(1) -- 自定義欄位
--   TC045 nvarchar(30) -- 自定義欄位
--   TC046 nvarchar(60) -- 自定義欄位
--   TC047 nvarchar(3) -- 自定義欄位
--   TC048 nvarchar(1) -- 自定義欄位
--   TC049 nvarchar(10) -- 自定義欄位
--   TC050 nvarchar(1) -- 自定義欄位
--   TC051 nvarchar(1) -- 自定義欄位
--   TC052 nvarchar(30) -- 自定義欄位
--   TC500 nvarchar(255) -- 自定義欄位
--   TC501 nvarchar(255) -- 自定義欄位
--   TC502 nvarchar(255) -- 自定義欄位
--   TC503 nvarchar(255) -- 自定義欄位
--   TC550 nvarchar(1) -- 自定義欄位
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- 【採購單明細 - 儲存採購單明細資料】
-- 表格名稱: PURTD
-- 欄位:
--   COMPANY nvarchar(20) -- 公司別
--   CREATOR nvarchar(10) -- 建立者
--   USR_GROUP nvarchar(10) -- 使用者群組
--   CREATE_DATE nvarchar(8) -- 建立日期
--   MODIFIER nvarchar(10) -- 修改者
--   MODI_DATE nvarchar(8) -- 修改日期
--   FLAG numeric -- 旗標
--   CREATE_TIME nvarchar(20) -- 建立時間
--   CREATE_AP nvarchar(50) -- 建立程式
--   CREATE_PRID nvarchar(50) -- 建立流程代號
--   MODI_TIME nvarchar(20) -- 修改時間
--   MODI_AP nvarchar(50) -- 修改程式
--   MODI_PRID nvarchar(50) -- 修改流程代號
--   TD001 nchar(4) -- 單別(PK)
--   TD002 nchar(11) -- 單號(PK)
--   TD003 nchar(4) -- 序號(PK)
--   TD004 nvarchar(40) -- 品號
--   TD005 nvarchar(120) -- 品名
--   TD006 nvarchar(120) -- 規格
--   TD007 nvarchar(10) -- 單位
--   TD008 numeric -- 採購數量
--   TD009 nvarchar(6) -- 單價
--   TD010 numeric -- 金額
--   TD011 numeric -- 稅額
--   TD012 nvarchar(8) -- 預交日期
--   TD013 nvarchar(4) -- 已交數量
--   TD014 nvarchar(255) -- 備註
--   TD015 numeric -- 未交數量
--   TD016 nvarchar(1) -- 交貨狀態
--   TD017 nvarchar(10) -- 確認碼
--   TD018 nvarchar(1) -- 簽核狀態
--   TD019 numeric -- 狀態碼
--   TD020 nvarchar(6) -- 請購單別
--   TD021 nvarchar(11) -- 請購單號
--   TD022 nvarchar(20) -- 請購序號
--   TD023 nvarchar(4) -- 來源單別
--   TD024 nvarchar(20) -- 來源單號
--   TD025 nvarchar(1) -- 來源序號
--   TD026 nvarchar(4) -- 專案代號
--   TD027 nvarchar(11) -- 請購單號(關聯PURTA)
--   TD028 nvarchar(4) -- 請購單別
--   TD029 nvarchar(20) -- 請購序號
--   TD030 numeric -- 自定義欄位
--   TD031 numeric -- 自定義欄位
--   TD032 nvarchar(6) -- 自定義欄位
--   TD033 nvarchar(10) -- 自定義欄位
--   TD034 nvarchar(1) -- 自定義欄位
--   TD035 nvarchar(30) -- 自定義欄位
--   TD036 nvarchar(25) -- 自定義欄位
--   TD037 nvarchar(4) -- 自定義欄位
--   TD038 nvarchar(1) -- 自定義欄位
--   TD039 nvarchar(40) -- 自定義欄位
--   TD040 nvarchar(4) -- 自定義欄位
--   TD041 nvarchar(4) -- 自定義欄位
--   TD042 nvarchar(6) -- 自定義欄位
--   TD043 nvarchar(20) -- 自定義欄位
--   TD044 nvarchar(10) -- 自定義欄位
--   TD045 nvarchar(8) -- 自定義欄位
--   TD046 nvarchar(8) -- 自定義欄位
--   TD047 nvarchar(6) -- 自定義欄位
--   TD048 numeric -- 自定義欄位
--   TD049 numeric -- 自定義欄位
--   TD050 nvarchar(1) -- 自定義欄位
--   TD051 nvarchar(30) -- 自定義欄位
--   TD052 nvarchar(60) -- 自定義欄位
--   TD053 nvarchar(40) -- 自定義欄位
--   TD054 nvarchar(2) -- 自定義欄位
--   TD055 nvarchar(4) -- 自定義欄位
--   TD056 nvarchar(11) -- 自定義欄位
--   TD057 numeric -- 自定義欄位
--   TD058 numeric -- 自定義欄位
--   TD059 nvarchar(6) -- 自定義欄位
--   TD060 numeric -- 自定義欄位
--   TD061 nvarchar(3) -- 自定義欄位
--   TD062 numeric -- 自定義欄位
--   TD063 numeric -- 自定義欄位
--   TD064 nvarchar(2) -- 自定義欄位
--   TD065 nvarchar(40) -- 自定義欄位
--   TD500 nvarchar(255) -- 自定義欄位
--   TD501 nvarchar(4) -- 自定義欄位
--   TD502 nvarchar(11) -- 自定義欄位
--   TD503 nvarchar(4) -- 自定義欄位
--   TD550 nvarchar(1) -- 自定義欄位
--   TD551 numeric -- 自定義欄位
--   TD552 nvarchar(8) -- 自定義欄位
--   TD553 nvarchar(1250) -- 自定義欄位
--   TD554 nvarchar(1) -- 自定義欄位
--   TD555 nvarchar(20) -- 自定義欄位
--   TD200 nvarchar(8) -- 承諾交期
--   UDF01 nvarchar(255) -- 自定義欄位01
--   UDF02 nvarchar(255) -- 自定義欄位02
--   UDF03 nvarchar(255) -- 自定義欄位03
--   UDF04 nvarchar(255) -- 自定義欄位04
--   UDF05 nvarchar(255) -- 自定義欄位05
--   UDF06 numeric -- 自定義欄位06
--   UDF07 numeric -- 自定義欄位07
--   UDF08 numeric -- 自定義欄位08
--   UDF09 numeric -- 自定義欄位09
--   UDF10 numeric -- 自定義欄位10

-- ============================================
-- 常用查詢範例 - 請購/採購
-- ============================================

-- 範例8: 查請購單簽核狀態
-- 問題: 請購單20260708001簽核完成了嗎
SELECT TA001 AS '單別', TA002 AS '單號', TA003 AS '請購日期',
       TA018 AS '簽核狀態', TA014 AS '狀態碼', TA015 AS '審核碼'
FROM PURTA
WHERE TA002 = '20260708001'

-- 範例9: 查請購單明細
-- 問題: 請購單20260708001買了什麼
SELECT TB001, TB002, TB003, TB004 AS '品號', TB005 AS '品名',
       TB006 AS '規格', TB008 AS '請購數量', TB010 AS '需求日期'
FROM PURTB
WHERE TB002 = '20260708001'

-- 範例10: 查採購單簽核狀態
-- 問題: 採購單3401-20260708001簽核完成了嗎
SELECT TC001 AS '單別', TC002 AS '單號', TC003 AS '採購日期',
       TC004 AS '供應商代號', TC020 AS '簽核狀態',
       TC016 AS '狀態碼', TC017 AS '審核碼'
FROM PURTC
WHERE TC001 = '3401' AND TC002 = '20260708001'

-- 範例11: 查採購單明細
-- 問題: 採購單3401-20260708001買了什麼
SELECT TD001, TD002, TD003, TD004 AS '品號', TD005 AS '品名',
       TD006 AS '規格', TD008 AS '採購數量', TD012 AS '預交日期',
       TD015 AS '未交數量', TD018 AS '簽核狀態'
FROM PURTD
WHERE TD001 = '3401' AND TD002 = '20260708001'

-- 範例12: 查請購單對應的採購單
-- 問題: 請購單20260708001轉成哪些採購單了
SELECT DISTINCT TD001 AS '採購單別', TD002 AS '採購單號',
       TD020 AS '請購單別', TD021 AS '請購單號', TD022 AS '請購序號'
FROM PURTD
WHERE TD021 = '20260708001'

-- 範例13: 查供應商採購單
-- 問題: 宏明最近有什麼採購單
SELECT TC001, TC002, TC003, TC004,
       (SELECT MA002 FROM PURMA WHERE MA001 = TC004) AS '供應商名稱'
FROM PURTC
WHERE TC004 IN (SELECT MA001 FROM PURMA WHERE MA002 LIKE '%宏明%')
ORDER BY TC003 DESC

-- 範例14: 查採購單付款條件
-- 問題: 採購單3401-20260708001的付款條件是什麼
SELECT TC001, TC002, TC027 AS '付款條件代號',
       (SELECT NA003 FROM CMSNA WHERE NA001 = '1' AND NA002 = TC027) AS '付款條件名稱'
FROM PURTC
WHERE TC001 = '3401' AND TC002 = '20260708001'

-- 範例15: 查未交貨的採購單明細
-- 問題: 哪些採購單還沒交完貨
SELECT TD001, TD002, TD003, TD004, TD005,
       TD008 AS '採購數量', TD013 AS '已交數量', TD015 AS '未交數量'
FROM PURTD
WHERE TD015 > 0
ORDER BY TD001, TD002, TD003

-- ============================================
-- 表格關聯說明 (補充)
-- ============================================
-- PURTA.TA001+TA002 -> PURTB.TB001+TB002 (請購單主檔->明細)
-- PURTC.TC001+TC002 -> PURTD.TD001+TD002 (採購單主檔->明細)
-- PURTD.TD020+TD021+TD022 -> PURTB.TB001+TB002+TB003 (採購->請購)
-- PURTC.TC004 -> PURMA.MA001 (採購單的供應商)
-- PURTC.TC027 -> CMSNA.NA002 (採購單的付款條件, NA001='1')
-- PURTD.TD004 -> INVMB.MB001 (採購單明細的品號)
-- PURTD.TD004 -> INVMA.MA001+MA002 (品號類別)
