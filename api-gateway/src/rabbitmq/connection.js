import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
let connection, channel;

export const initRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("[DONE] RabbitMQ connected");
  }
  return channel;
};

export const getChannel = () => {
  if (!channel) throw new Error("[NOT YET] RabbitMQ not initialized");
  return channel;
};

export const closeRabbitMQ = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};
