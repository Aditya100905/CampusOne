import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
  clientId: "campusone",
  brokers: ["localhost:9092"],
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const kafkaProducer = kafka.producer();
await kafkaProducer.connect();
