import { Kafka, logLevel } from 'kafkajs';
import https from 'https';

// Kafka configuration
const kafka = new Kafka({
  brokers: ['URL-kafka.upstash.io:9092'],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256',
    username: 'your_user_name',
    password: 'your_password'
  },
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();

async function main(params) {
    return new Promise((resolve, reject) => {
        let balances = [];
        let blockNumber = null;
        let errors = [];
        let rpcPromises = [];
        let originalPayload = params.data;
        let addressCount = 0;

        console.log("Received params:", JSON.stringify(params, null, 2)); // Log the received params

        if (!params.data || !Array.isArray(params.data) || params.data.length === 0) {
            errors.push("Input data is missing or not in the expected format.");
            resolve({
                blockNumber: blockNumber,
                balances: balances,
                addressCount: addressCount,
                originalPayload: originalPayload,
                errors: errors
            });
            return;
        }

        params.data.forEach(item => {
            const content = item.content;
            if (content && content.block && content.block.number) {
                blockNumber = parseInt(content.block.number, 16); // Extract block number safely

                // Extract unique addresses from the block data
                let addresses = new Set();
                content.receipts.forEach(receipt => {
                    addresses.add(receipt.from);
                    if (receipt.to) {
                        addresses.add(receipt.to);
                    }
                    receipt.logs.forEach(log => {
                        addresses.add(log.address);
                        if (log.topics.length > 1) {
                            addresses.add('0x' + log.topics[1].slice(-40));
                        }
                        if (log.topics.length > 2) {
                            addresses.add('0x' + log.topics[2].slice(-40));
                        }
                    });
                });

                content.trace.forEach(trace => {
                    addresses.add(trace.result.from);
                    if (trace.result.to) {
                        addresses.add(trace.result.to);
                    }
                });

                // Count addresses
                addressCount += addresses.size;

                // Make RPC calls to eth_getBalance for each address
                addresses.forEach(address => {
                    rpcPromises.push(new Promise((rpcResolve, rpcReject) => {
                        makeBalanceRpcRequest(address, blockNumber, (err, balanceData) => {
                            if (err) {
                                errors.push(err.toString());
                                rpcReject(err);
                            } else {
                                balances.push({
                                    address: address,
                                    balance: balanceData.result,
                                    blockNumber: blockNumber
                                });
                                rpcResolve();
                            }
                        });
                    }));
                });
            } else {
                errors.push("Block data is missing or malformed in one of the items.");
            }
        });

        // Wait for all RPC promises to settle
        Promise.allSettled(rpcPromises).then(() => {
            const responsePayload = {
                blockNumber: blockNumber,
                balances: balances,
                addressCount: addressCount,
                originalPayload: originalPayload,
                errors: errors
            };
            const enrichedDataString = JSON.stringify(responsePayload);
            sendEnrichedDataToKafka(enrichedDataString, resolve, reject);
        });
    });
}

function makeBalanceRpcRequest(address, blockNumber, callback) {
    const postData = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": [address, `0x${blockNumber.toString(16)}`],
        "id": 1
    });

    const options = {
        hostname: 'YOUR_QUICKNODE_ENDPOINT',
        path: '/YOUR_QUICKNODE_ENDPOINT_KEY/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, res => {
        let data = '';
        res.on('data', d => {
            data += d;
        });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                callback(null, parsedData);
            } catch (e) {
                callback(e, null);
            }
        });
    });

    req.on('error', error => {
        callback(error, null);
    });

    req.write(postData);
    req.end();
}

async function sendEnrichedDataToKafka(data, resolve, reject) {
    try {
        await producer.connect();
        await producer.send({
            topic: 'YOUR_TOPIC',
            messages: [
                { value: data },
            ],
        });
        console.log("Data sent to Kafka successfully");
        await producer.disconnect();
        resolve({
            body: "Data sent to Kafka successfully",
            errors: JSON.parse(data).errors
        });
    } catch (error) {
        reject({
            err: error.toString()
        });
    }
}

// Export the main function
export { main };
