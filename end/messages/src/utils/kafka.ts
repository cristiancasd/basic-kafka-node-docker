import { Kafka } from "kafkajs";

//It is a service that hosts a topic, each broker is identify for a unique ID
const brokers = ["0.0.0.0:9092"];  // enter to Docker container and look for Ports

const kafka = new Kafka({
  clientId: "messages-app",
  brokers,
});

const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
  console.log("Producer connected");
}

export async function disconnectFromKafka() {
  await producer.disconnect();
  console.log("Producer disconnected");
}

const topics = ["message_created"] as const;

export async function sendMessage(topic: typeof topics[number], message: any) {
  console.log('voy a enviar mensaje ', {topic, messages: [{ value: message }],})
  return producer.send({
    topic,
    messages: [{ value: message }],
  });
}

/*
  usually when you use kafka you need register all of your diffenret topics and share them around your services
 I recommend crating a package that you can install in all of your services that
 keeps a list of all the topics and then a schema for all of those topics and
 this is going to make sure that when you're consuming a message it is the message that you expect to consume
 */