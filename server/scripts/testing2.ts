import { performance } from "perf_hooks";
import fs from "fs";

const BASE_URL = "http://localhost:5000/api/leaderboard";

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 100;

const userIds: string[] = JSON.parse(
  fs.readFileSync("./users.json", "utf-8")
);

async function makeRequest(userId: string): Promise<number> {
  const start = performance.now();
  const response = await fetch(`${BASE_URL}/${userId}`);

  await response.text();

  const end = performance.now();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return end - start;
}

async function worker(
  latencies: number[],
  failed: { count: number },
  requestsStarted: { count: number }
) {
  while (true) {
    const requestIndex = requestsStarted.count;

    if (requestIndex >= TOTAL_REQUESTS) {
      return;
    }

    requestsStarted.count++;

    const userId = userIds[requestIndex];

    try {
      const latency = await makeRequest(userId);
      latencies.push(latency);
    } catch {
      failed.count++;
    }
  }
}

async function runBenchmark() {
  console.log("=================================");
  console.log("       RANK BENCHMARK");
  console.log("=================================");

  console.log(`Total users:     ${userIds.length}`);
  console.log(`Total requests:  ${TOTAL_REQUESTS}`);
  console.log(`Concurrency:     ${CONCURRENCY}`);
  console.log();

  const latencies: number[] = [];

  const failed = { count: 0 };
  const requestsStarted = { count: 0 };

  const startTime = performance.now();

  const workers = Array.from(
    { length: CONCURRENCY },
    () =>
      worker(
        latencies,
        failed,
        requestsStarted
      )
  );

  await Promise.all(workers);

  const endTime = performance.now();

  const totalTime = endTime - startTime;

  const successful = latencies.length;

  if (successful === 0) {
    console.log("No successful requests.");
    return;
  }

  latencies.sort((a, b) => a - b);

  let sum = 0;

  for (const latency of latencies) {
    sum += latency;
  }

  const average = sum / successful;

  function percentile(p: number): number {
    const index =
      Math.ceil((p / 100) * successful) - 1;

    return latencies[Math.max(0, index)];
  }

  const throughput =
    (successful / totalTime) * 1000;

  console.log("========== RESULTS ==========");

  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  console.log(`Successful:     ${successful}`);
  console.log(`Failed:         ${failed.count}`);

  console.log();
  console.log(`Total time:     ${totalTime.toFixed(2)} ms`);
  console.log(`Throughput:     ${throughput.toFixed(2)} req/s`);

  console.log();
  console.log("Latency:");
  console.log(`Min:            ${latencies[0].toFixed(2)} ms`);
  console.log(`Average:        ${average.toFixed(2)} ms`);
  console.log(`P50:            ${percentile(50).toFixed(2)} ms`);
  console.log(`P95:            ${percentile(95).toFixed(2)} ms`);
  console.log(`P99:            ${percentile(99).toFixed(2)} ms`);
  console.log(`Max:            ${latencies[latencies.length - 1].toFixed(2)} ms`);
}

runBenchmark();