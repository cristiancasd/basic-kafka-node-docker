import { connectProducer, disconnectFromKafka } from "./utils/kafka";
import { createServer } from "./utils/server";


async function gracefulShutdown(app: Awaited<ReturnType<typeof createServer>>) {
  console.log("Graceful shutdown");
  await app.close();
  await disconnectFromKafka(); 
  process.exit(0);
}

async function main() {
  const app = createServer(); 

  let wrongConnection = true;
  while (wrongConnection) {
    try {
      await connectProducer();
      wrongConnection = false;
    } catch (err) {
      console.log('kafka ... error to conect with producer');
      await sleep(3000);
      function sleep(ms:number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
    } 
  }



  app.listen({
    port: 3000,
    host: "0.0.0.0",
  });

  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;

  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i];
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }

  console.log("Message service ready at http://localhost:3000");
}

main();
