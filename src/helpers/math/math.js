export default function getWeeksDiff(startDate, endDate) {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;

  return Math.floor(Math.abs(endDate - startDate) / msInWeek);
}
