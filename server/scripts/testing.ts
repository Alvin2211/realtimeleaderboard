import { performance } from "perf_hooks";

const URL = "http://localhost:5000/api/leaderboard";

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 100;

async function makeRequest(): Promise<number> {
  const start = performance.now();

  const response = await fetch(URL);

  await response.text();

  const end = performance.now();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return end - start;
}

async function testing() {
  console.log("Starting performance test");
  console.log(`URL: ${URL}`);
  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log();

  const latencies: number[] = [];
  let completed = 0;
  let failed = 0;

  const startTime = performance.now();

  async function worker() {
    while (true) {
      const requestNumber = completed + failed;

      if (requestNumber >= TOTAL_REQUESTS) {
        break;
      }

      completed++;

      try {
        const latency = await makeRequest();
        latencies.push(latency);
      } catch (error) {
        failed++;
      }
    }
  }

  const workers = Array.from(
    { length: CONCURRENCY },
    () => worker()
  );

  await Promise.all(workers);

  const endTime = performance.now();

  const totalTime = endTime - startTime;

  latencies.sort((a, b) => a - b);

  const successful = latencies.length;

  const average =
    latencies.reduce((sum, value) => sum + value, 0) /
    successful;

  const min = latencies[0];
  const max = latencies[latencies.length - 1];

  const percentile = (p: number) => {
    const index = Math.ceil((p / 100) * successful) - 1;
    return latencies[index];
  };

  const throughput =
    (successful / totalTime) * 1000;

  console.log("========== RESULTS ==========");

  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  console.log(`Successful:     ${successful}`);
  console.log(`Failed:         ${failed}`);

  console.log();

  console.log(`Total time:     ${totalTime.toFixed(2)} ms`);
  console.log(`Throughput:     ${throughput.toFixed(2)} req/s`);

  console.log();

  console.log("Latency:");
  console.log(`Min:            ${min.toFixed(2)} ms`);
  console.log(`Average:        ${average.toFixed(2)} ms`);
  console.log(`p50:            ${percentile(50).toFixed(2)} ms`);
  console.log(`p95:            ${percentile(95).toFixed(2)} ms`);
  console.log(`p99:            ${percentile(99).toFixed(2)} ms`);
  console.log(`Max:            ${max.toFixed(2)} ms`);
}

testing();