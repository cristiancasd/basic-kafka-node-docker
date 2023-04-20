import { connectConsumer, disconnectConsumer } from "./utils/kafka";
import { createServer } from "./utils/server";

async function gracefulShutdown(app: Awaited<ReturnType<typeof createServer>>) {
  console.log("Shutting down...");

  await app.close();

  await disconnectConsumer();
  process.exit(0);
}

async function main() {
  const app = createServer();


  let wrongConnection = true;
  while (wrongConnection) {
    try {
      await connectConsumer();
      wrongConnection = false;
    } catch (err) {
      await sleep(3000);
      function sleep(ms:number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
    } 
  }


  await app.listen({
    port: 4000,
    host: "0.0.0.0",
  });

  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i];
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }


  console.log("Notification service ready at http://localhost:4000");
}

main();
