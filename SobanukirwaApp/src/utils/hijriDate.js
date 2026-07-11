export function getHijriDate(date = new Date()) {
  const gregorian = new Date(date);
  const day = gregorian.getDate();
  const month = gregorian.getMonth();
  const year = gregorian.getFullYear();

  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month < 2 ? month + 13 : month + 1)) + day - 1524.5;
  const l = Math.floor(jd - 1948439.5 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) + Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const rem2 = remainder - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * rem2) / 709);
  const hDay = rem2 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  const hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'];

  return {
    day: hDay,
    month: hMonth,
    monthName: hijriMonths[hMonth - 1] || '',
    year: hYear,
    formatted: `${hDay} ${hijriMonths[hMonth - 1] || ''} ${hYear}`,
  };
}
