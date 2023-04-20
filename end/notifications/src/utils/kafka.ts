import { Kafka, KafkaMessage } from "kafkajs";
import { Message } from '../../../../start/messages/src/models/message.model';

const brokers = ["0.0.0.0:9092"];


const kafka = new Kafka({
  brokers,
  clientId: "notifications-service",
});

const consumer = kafka.consumer({
  groupId: "notifications-service",
});


export async function disconnectConsumer() {
  await consumer.disconnect();
  console.log("Disconnected from consumer");
}

const topics = ["message_created"] as const;


function messageCreatedHandler(data:string) {
  console.log("TENAZ Got a new message", JSON.stringify(data, null, 2));
}

//const topicToSubscribe: Record<typeof topics[number], Function> = {
const topicToSubscribe: Record<string, Function> = {
  'message_created': messageCreatedHandler,
};


interface InputKafka{
    topic: string;
    partition: number;
    message: KafkaMessage
}


export async function connectConsumer() {
  await consumer.connect();
  console.log("Connected to consumer");

  for (let i = 0; i < topics.length; i++) {
    await consumer.subscribe({
      topic: topics[i],
      fromBeginning: true,
    });
  }
  
  await consumer.run({
    eachMessage: async (input:InputKafka) => {
      if (!input.message || !input.message.value) {
        return;
      }

      const data = JSON.parse(input.message.value.toString());
      const handler = topicToSubscribe[input.topic];

      console.log('handler ... ', handler)
      if (handler) {
        console.log('estoy en el condicional')
        handler(data);
      }
    },
  });
}