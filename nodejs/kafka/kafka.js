const { Kafka } = require('kafkajs');

// Kafka configuration
const KAFKA_BROKER = process.env.KAFKA_BROKER || '2.tcp.ngrok.io:13757';
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'example';

async function initializeKafka() {
    try {
        const kafka = new Kafka({
            clientId: 'quicknode-stream-producer',
            brokers: [KAFKA_BROKER],
            retry: {
                initialRetryTime: 100,
                retries: 5
            }
        });

        const producer = kafka.producer();
        await producer.connect();
        console.log('Successfully connected to Kafka broker');
        return producer;
    } catch (error) {
        console.error('Failed to initialize Kafka:', error);
        throw error;
    }
}

/**
 * main(params) processes blockchain stream data and sends it to Kafka
 * 
 * @param {Object} params - Contains dataset (params.data), params.metadata, and params.user_data
 * @returns {Object} - Status of the Kafka operation
 */
async function main(params) {
    let producer = null;
    try {
        // Initialize Kafka producer
        producer = await initializeKafka();

        // Extract data from params
        const {
            metadata: { dataset, network },
            data,
            user_data
        } = params;

        // Prepare message payload
        const messagePayload = {
            dataset,
            network,
            timestamp: new Date().toISOString(),
            data,
            user_data
        };

        // Determine topic based on dataset type
        const topic = `${KAFKA_TOPIC}-${dataset.toLowerCase()}`;

        // Send to Kafka
        const result = await producer.send({
            topic,
            messages: [
                {
                    key: `${network}-${dataset}-${Date.now()}`,
                    value: JSON.stringify(messagePayload),
                    headers: {
                        network,
                        dataset,
                        timestamp: new Date().toISOString()
                    }
                }
            ]
        });

        console.log(`Successfully sent data to Kafka topic ${topic}`, {
            dataset,
            network,
            result
        });

        // Explicitly disconnect the producer
        await producer.disconnect();
        console.log('Kafka producer disconnected');

        return {
            status: 'success',
            message: `Data from ${dataset} dataset on ${network} network sent to Kafka`,
            topic,
            timestamp: new Date().toISOString(),
            metadata: {
                dataset,
                network,
                kafka_result: result
            }
        };

    } catch (error) {
        console.error('Error processing stream data:', error);
        
        // Ensure producer is disconnected even on error
        if (producer) {
            try {
                await producer.disconnect();
                console.log('Kafka producer disconnected after error');
            } catch (disconnectError) {
                console.error('Error disconnecting producer:', disconnectError);
            }
        }

        return {
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString(),
            metadata: {
                dataset: params.metadata?.dataset,
                network: params.metadata?.network
            }
        };
    }
}

module.exports = { main };