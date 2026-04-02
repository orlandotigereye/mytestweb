/**
 * 真八字（節氣版）
 * 輸入日期 → 回傳 年/月/日/時 干支 
 */
function getBazi(dateInput) {
  const now = new Date();
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new Error("日期格式錯誤");
  }

  // 👉 時間用現在
  date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

  const HS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const EB = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

  // =========================
  // 1️⃣ 節氣表（簡化固定）
  // =========================
  const JIEQI = [
    { name:'立春', m:2, d:4 },
    { name:'驚蟄', m:3, d:5 },
    { name:'清明', m:4, d:4 },
    { name:'立夏', m:5, d:5 },
    { name:'芒種', m:6, d:5 },
    { name:'小暑', m:7, d:6 },
    { name:'立秋', m:8, d:7 },
    { name:'白露', m:9, d:7 },
    { name:'寒露', m:10, d:8 },
    { name:'立冬', m:11, d:7 },
    { name:'大雪', m:12, d:6 },
    { name:'小寒', m:1, d:5 }
  ];

  // =========================
  // 2️⃣ 年柱（立春切換）
  // =========================
  const year = date.getFullYear();
  const lichun = new Date(year, 1, 4);

  let gzYear = year;
  if (date < lichun) gzYear -= 1;

  const yIndex = (gzYear - 4) % 60;
  const yearGan = HS[yIndex % 10];
  const yearZhi = EB[yIndex % 12];

  // =========================
  // 3️⃣ 月柱（節氣切）
  // =========================
  let monthIndex = 0;

  for (let i = 0; i < JIEQI.length; i++) {
    const jq = JIEQI[i];
    const jqDate = new Date(year, jq.m - 1, jq.d);

    if (date >= jqDate) {
      monthIndex = i;
    }
  }

  const monthZhiIndex = (monthIndex + 2) % 12;

  const yearStemIndex = yIndex % 10;
  const monthStemBase = (yearStemIndex % 5) * 2 + 2;
  const monthStemIndex = (monthStemBase + monthZhiIndex) % 10;

  const monthGan = HS[monthStemIndex];
  const monthZhi = EB[monthZhiIndex];

  // =========================
  // 4️⃣ 日柱（天文基準）
  // =========================
  const baseDate = new Date(2024, 0, 1); // 甲子日
  const diffDays = Math.floor((date - baseDate) / 86400000);

  const dayIndex = ((diffDays % 60) + 60) % 60;

  const dayGan = HS[dayIndex % 10];
  const dayZhi = EB[dayIndex % 12];

  // =========================
  // 5️⃣ 時柱
  // =========================
  const hour = date.getHours();

  const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;

  const dayStemIndex = dayIndex % 10;
  const hourStemBase = (dayStemIndex % 5) * 2;

  const hourStemIndex = (hourStemBase + hourZhiIndex) % 10;

  const hourGan = HS[hourStemIndex];
  const hourZhi = EB[hourZhiIndex];

  // =========================
  return {
    year: `${yearGan}${yearZhi}年`,
    month: `${monthGan}${monthZhi}月`,
    day: `${dayGan}${dayZhi}日`,
    hour: `${hourGan}${hourZhi}時`
  };
}
