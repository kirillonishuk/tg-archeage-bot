import moment from "moment";

export function getLastThursdayOfMonth(): number {
  const year = moment().utcOffset(180).year();
  const month = moment().utcOffset(180).month();

  const lastDayOfMonth = moment().utcOffset(180).year(year).month(month).endOf("month");

  const dayOfWeek = lastDayOfMonth.day();

  const daysToSubtract = dayOfWeek >= 4 ? dayOfWeek - 4 : 3 + dayOfWeek;
  const lastThursday = lastDayOfMonth.subtract(daysToSubtract, "days");

  return lastThursday.get("date");
}

export function shouldResetScore(): boolean {
  const warningDate = getLastThursdayOfMonth();
  const curDate = moment().utcOffset(180).get("date");
  const curHours = moment().utcOffset(180).get("hours");
  const curMinutes = moment().utcOffset(180).get("minutes");

  if (warningDate === curDate && curHours === 1 && curMinutes < 10) {
    return true;
  }
  return false;
}

export function shouldSendUpdates(): boolean {
  const warningDate = getLastThursdayOfMonth();
  const curDate = moment().utcOffset(180).get("date");
  const curHours = moment().utcOffset(180).get("hours");

  if (warningDate === curDate && curHours <= 12) {
    return false;
  }
  return true;
}
