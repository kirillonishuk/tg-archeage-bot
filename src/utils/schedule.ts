import { UPDATE_INTERVAL } from "@configs/archeage";

export function scheduleFunction(cb: () => void): void {
  const now = new Date();
  const minutes = now.getMinutes();
  const millisecondsUntilNextCall =
    (UPDATE_INTERVAL - (minutes % UPDATE_INTERVAL) + 1) * 60 * 1000;

  cb();
  setTimeout(() => {
    cb();
    setInterval(cb, UPDATE_INTERVAL * 60 * 1000);
  }, millisecondsUntilNextCall);
}
