# Local Kafka Setup for QuickNode Functions Guide

## Prerequisites
- Docker and Docker Compose installed
- ngrok installed
- A QuickNode account with Functions access
- Basic understanding of Node.js

## Step 1: Set Up Local Kafka Cluster

1. Inspect the `docker-compose.yml` file and adjust it to your needs.

## Step 2: Start Kafka and Expose via ngrok

1. Start ngrok tunnel:
```bash
ngrok tcp 9092
```

2. Copy the ngrok URL (e.g., `2.tcp.ngrok.io:18139`)

3. Start Kafka with the ngrok URL:
```bash
NGROK_URL=2.tcp.ngrok.io:18139 docker-compose up -d
```

4. Verify setup:
- Check Kafka UI: http://localhost:8080
- Verify containers are running: `docker ps`

## Step 3: Create QuickNode Function

1. Go to QuickNode dashboard and create a new Function
2. Add `kafkajs` dependency in the Function settings
3. Use this code template in kafka.js

Make sure to update:

```javascript
const { Kafka } = require('kafkajs');

// Configure Kafka broker with your ngrok URL
const KAFKA_BROKER = process.env.KAFKA_BROKER || '2.tcp.ngrok.io:18139'; // Update with your ngrok URL
…

module.exports = { main };
```

## Step 4: Configure Stream

1. Create a new Stream in QuickNode dashboard
2. Select your desired dataset (e.g., blocks, transactions)
3. Add your Function as a destination
4. Start the Stream

## Step 5: Verify Data Flow

1. Watch the Kafka UI (http://localhost:8080) for:
   - New topics being created automatically
   - Messages arriving in topics
   - Consumer groups and partition info

2. Check Function logs in QuickNode dashboard for:
   - Successful connections
   - Message delivery confirmations
   - Any potential errors

## Common Issues and Solutions

1. Connection Refused
   - Check if ngrok is running
   - Verify ngrok URL in Function code
   - Ensure Kafka is running

2. Topic Not Created
   - Topics are created automatically on first message
   - Check Kafka UI for any errors
   - Verify topic naming convention

3. Messages Not Appearing
   - Check Function logs for successful delivery
   - Verify topic names in Kafka UI
   - Ensure proper connection credentials

## Maintenance Notes

1. ngrok URL Changes
   - ngrok URL changes on restart
   - Update both docker-compose and Function code with new URL
   - Restart Kafka containers with new URL

2. Monitoring
   - Use Kafka UI for real-time monitoring
   - Check Function logs for performance
   - Monitor ngrok connection status