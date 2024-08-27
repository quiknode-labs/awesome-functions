const { PubSub } = require('@google-cloud/pubsub');

function main(params) {
    // Initialize PubSub client
    const projectId = "GOOGLE_CLOUD_PROJECT_ID";
    const privateKey = "GOOGLE_CLOUD_PRIVATE_KEY";
    const clientEmail = "GOOGLE_CLOUD_CLIENT_EMAIL";

    // Create a client configuration object
    const clientConfig = {
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        projectId: projectId,
    };

    // Initialize PubSub client with the configuration
    const pubsub = new PubSub(clientConfig);

    // The topic to publish to
    const topicName = 'TOPIC_NAME';

    // The Streams data should be passed in the params
    const streamsData = params.data;

    if (!streamsData) {
        return { error: "No Streams data provided" };
    }

    // Publish the message
    async function publishMessage() {
        try {
            const messageId = await pubsub.topic(topicName).publish(Buffer.from(JSON.stringify(streamsData)));
            console.log(`Message ${messageId} published.`);
            return { success: true, messageId: messageId };
        } catch (error) {
            console.error(`Received error while publishing: ${error.message}`);
            return { error: error.message };
        }
    }

    // Return a promise that resolves with the result
    return publishMessage();
}

// Export the function
exports.main = main;