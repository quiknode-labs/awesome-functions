const https = require('https');

// Node.js Function for Filtering Uniswap Event Logs and sending data to a webhook
function main(params) {
    return new Promise((resolve, reject) => {
        const { data } = params;

        if (!Array.isArray(data)) {
            reject({
                error: "Data is not properly formatted as an array."
            });
            return;
        }

        const filteredResults = [];
        const uniSwapEventType =
            "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"; // Swap event signature

        data.forEach((logArray) => {
            if (Array.isArray(logArray)) {
                logArray.forEach((log) => {
                    if (log.address && log.topics && log.topics.includes(uniSwapEventType)) {
                        const relevantData = extractRelevantData(log);
                        if (relevantData) {
                            // Decode the Swap data
                            const swapData = decodeSwapData(log.data);
                            // Merge the decoded data with relevant log data
                            const fullData = { ...relevantData, swapData };
                            filteredResults.push(fullData);
                        }
                    }
                });
            }
        });

        if (filteredResults.length > 0) {
            sendFilteredDataToWebhook(filteredResults, resolve, reject);
        } else {
            resolve({
                message: "No relevant Uniswap Swap events found."
            });
        }
    });
}

function extractRelevantData(log) {
    return {
        address: log.address,
        blockNumber: parseInt(log.blockNumber, 16),
        transactionHash: log.transactionHash,
        topics: log.topics
    };
}

function decodeSwapData(data) {
    let amount0 = BigInt('0x' + data.slice(2, 66));
    let amount1 = BigInt('0x' + data.slice(66, 130));
    let sqrtPriceX96 = BigInt('0x' + data.slice(130, 194));
    let liquidity = BigInt('0x' + data.slice(194, 258));
    let tick = BigInt('0x' + data.slice(258, 290));

    amount0 = convertBigIntSigned(amount0);
    amount1 = convertBigIntSigned(amount1);
    tick = convertBigIntSigned(tick, 24);

    // Convert all BigInt values to strings to avoid serialization errors
    return {
        amount0: amount0.toString(),
        amount1: amount1.toString(),
        sqrtPriceX96: sqrtPriceX96.toString(),
        liquidity: liquidity.toString(),
        tick: tick.toString()
    };
}

function convertBigIntSigned(value, bits = 256) {
    const upperLimit = BigInt(2) ** BigInt(bits - 1);
    const modularValue = BigInt(2) ** BigInt(bits);
    if (value >= upperLimit) {
        return value - modularValue;
    }
    return value;
}

function sendFilteredDataToWebhook(data, resolve, reject) {
    const dataString = JSON.stringify(data);
    const options = {
        hostname: 'typedwebhook.tools',
        path: '/webhook/URL',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString)
        }
    };

    const req = https.request(options, res => {
        let responseData = '';
        res.on('data', (d) => {
            responseData += d;
        });
        res.on('end', () => {
            resolve({
                response: responseData,
                message: "Data sent to webhook successfully."
            });
        });
    });

    req.on('error', (error) => {
        reject({
            error: error.toString()
        });
    });

    req.write(dataString);
    req.end();
}

module.exports = { main };
