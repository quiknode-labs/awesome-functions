// This function filters and processes ERC-20 token transfer traces from Ethereum trace data provided via Streams.
// It expects 'debug_trace' data formatted in a specific structure as input in the 'params'.
// see https://www.quicknode.com/docs/streams/data-sources

function main(params) {
    const { data } = params;

    // Serialize and log the incoming data size for monitoring and troubleshooting.
    const incomingDataString = JSON.stringify(data);
    const incomingSizeBytes = Buffer.byteLength(incomingDataString);
    console.log(`Incoming data size: ${incomingSizeBytes} bytes`);

    console.log("Starting processing to selectively pass through ERC-20 token transfer traces.");

    // Define the ERC-20 Transfer Event Signature Hash to identify relevant transfer events.
    // https://www.4byte.directory/signatures/?bytes4_signature=0xddf252a
    // Transfer(address,address,uint256)

    const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const filteredTraces = [];

    // Iterate through each block of trace data to extract and filter relevant token transfer events.
    // We expect each block trace to contain a list of individual transaction traces.
    data.forEach(blockTraces => {
        blockTraces.forEach(trace => {
            // Check for logs within each trace result that match the ERC-20 transfer event signature.
            if (trace.result && trace.result.logs && trace.result.logs.some(log => log.topics[0] === transferEventSignature)) {
                // Include the entire trace if it contains at least one token transfer event, ensuring we capture complete context.
                filteredTraces.push(trace);
            }
        });
    });

    // Serialize the filtered data for output and calculate the outgoing data size for monitoring and diagnostics.
    const outgoingData = {
        success: filteredTraces.length > 0,
        data: filteredTraces,
        metadata: {
            totalTracesProcessed: data.length, // Total number of traces processed.
            relevantTracesIncluded: filteredTraces.length // Number of traces included after filtering.
        }
    };
    const outgoingDataString = JSON.stringify(outgoingData);
    const outgoingSizeBytes = Buffer.byteLength(outgoingDataString);
    console.log(`Outgoing data size: ${outgoingSizeBytes} bytes`);

    // Log the number of traces that contained ERC-20 token transfers and the overall count of processed blocks.
    console.log(`Filtered traces that contain token transfers: ${filteredTraces.length}`);
    console.log(`Processed blocks. Detected token transfers: ${filteredTraces.length}`);

    return outgoingData;
}
