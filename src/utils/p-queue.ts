import PQueue from "p-queue";

const queue = new PQueue({
  concurrency: 1,
  timeout: 100,
});

export default queue;
