// Node.js Function for Filtering Uniswap Event Logs
// This function filters logs from 
// Streams logs dataset 
// by identifying Swap events and processing only the relevant logs:

// params — expects Streams logs dataset, see https://www.quicknode.com/docs/streams/data-sources#logs
function main(params) {
    const { data } = params;
  
    // Serialize the input data to a string and calculate its size in kilobytes
    const inputDataString = JSON.stringify(data);
    const inputSizeKB = Buffer.byteLength(inputDataString) / 1024;
    console.log(`Input data size: ${inputSizeKB.toFixed(2)} KB`);
  
    // Check if the input data is an array as expected
    if (!Array.isArray(data)) {
      console.log("Data is not an array!");
      return {
        error: "Data is not properly formatted as an array.",
        metadata: {
          inputSizeKB: inputSizeKB.toFixed(2),
          filteredSizeKB: 0,
          success: false,
        },
      };
    }
  
    // Initialize the results array for storing filtered data
    const filteredResults = [];
    const uniSwapEventType =
      "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"; //https://www.4byte.directory/signatures/?bytes4_signature=0xc42079f&sort=bytes_signature
      //Swap(address,address,int256,int256,uint160,uint128,int24)
  
    // Log the start of data processing
    console.log(
      JSON.stringify({
        message: "Starting data processing",
        totalLogArrays: data.length,
        timestamp: new Date().toISOString(),
      })
    );
  
    // Process each log array in the input data
    data.forEach((logArray, arrayIndex) => {
      if (!Array.isArray(logArray)) {
        console.log(
          `Item at index ${arrayIndex} is not an array:`,
          JSON.stringify(logArray)
        );
        return;
      }
  
      logArray.forEach((log, logIndex) => {
        if (log.address && log.topics && log.topics.includes(uniSwapEventType)) {
          const relevantData = extractRelevantData(log);
          if (relevantData) {
            filteredResults.push(relevantData);
          } else {
            console.log(
              JSON.stringify({
                message: "Data extraction returned null or undefined",
                context: { arrayIndex, logIndex },
              })
            );
          }
        }
      });
    });
  
    // Calculate the size of the filtered data and log it
    const filteredDataString = JSON.stringify(filteredResults);
    const filteredSizeKB = Buffer.byteLength(filteredDataString) / 1024;
    console.log(`Filtered data size: ${filteredSizeKB.toFixed(2)} KB`);
  
    // Log the completion of data processing
    console.log(
      JSON.stringify({
        message: "Data processing completed",
        filteredResultsCount: filteredResults.length,
        timestamp: new Date().toISOString(),
      })
    );
  
    // Return the filtered results and their count
    return {
      success: filteredResults.length > 0,
      data: filteredResults,
    };
  }
  
  // Function to extract relevant data from a log based on the Uniswap event type
  function extractRelevantData(log) {
    return {
      address: log.address,
      blockNumber: parseInt(log.blockNumber, 16),
      transactionHash: log.transactionHash,
      data: log.data,
      topics: log.topics,
    };
  }
  