import moment from "moment";

function getLastThursdayOfMonth(): number {
  const year = moment().year();
  const month = moment().month();

  const lastDayOfMonth = moment().year(year).month(month).endOf("month");

  const dayOfWeek = lastDayOfMonth.day();

  const daysToSubtract = dayOfWeek >= 4 ? dayOfWeek - 4 : 3 + dayOfWeek;
  const lastThursday = lastDayOfMonth.subtract(daysToSubtract, "days");

  return lastThursday.get("date");
}

export function shouldResetScore(): boolean {
  const warningDate = getLastThursdayOfMonth();
  const curDate = moment().get("date");
  const curHours = moment().get("hours");

  if (warningDate === curDate && curHours < 1) {
    return true;
  }
  return false;
}
