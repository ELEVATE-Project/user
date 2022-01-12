/**
 * name : configs/kafka
 * author : Aman Gupta
 * Date : 07-Dec-2021
 * Description : Kafka connection configurations
*/

const Kafka = require('kafka-node');

module.exports = () => {
    const Producer = Kafka.Producer;
    const KafkaClient = new Kafka.KafkaClient({
        kafkaHost: process.env.KAFKA_URL
    });
    const producer = new Producer(KafkaClient);

    /* Uncomment while writing consuming actions for this service */
    // const Consumer = Kafka.Consumer;
    // const consumer = new Consumer(KafkaClient, [ { topic: process.env.KAFKA_TOPIC } ], { autoCommit: true, groupId: process.env.KAFKA_GROUP_ID })

    /* Registered events */

    KafkaClient.on('error', error => {
        console.log('Kafka connection error: ', error);
    });

    KafkaClient.on('connect', () => {
        console.log('Connected to kafka client');
    });

    producer.on('error', error => {
        console.log('Kafka producer intialization error: ', error);
    });

    producer.on('ready', () => {
        console.log('Producer intialized successfully');
    });

    // consumer.on('error', error => {
    //     console.log('Kafka consumer intialization error: ', error);
    // });

    // consumer.on('message', message => {
    //     // perform action using message
    // });

    global.kafkaProducer = producer;
    global.kafkaClient = KafkaClient;

};