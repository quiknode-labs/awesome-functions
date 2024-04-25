require('dotenv').config();
const Web3 = require('web3');
const axios = require('axios');
const https = require('https');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.QUICKNODE_URL));

// Create an HTTPS Agent that specifies the TLS protocol
const httpsAgent = new https.Agent({
  secureProtocol: 'TLSv1_2_method'  // Using TLS 1.2 as an example; adjust as necessary based on the server's requirements
});

async function getTokenMetadata(contractAddress) {
  console.log(`Fetching token metadata for address: ${contractAddress}`); // Log the address being queried
  try {
    const response = await axios.post(process.env.QUICKNODE_URL, {
      id: 67,
      jsonrpc: "2.0",
      method: "qn_getTokenMetadataByContractAddress",
      params: [{
        contract: contractAddress
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: httpsAgent  // Use the custom HTTPS Agent
    });
    console.log('Response data:', response.data); // Log response data
    return response.data.result;
  } catch (error) {
    console.error('Error fetching token metadata:', error); // Log errors if the request fails
    throw error; // Rethrow error to handle it upstream if necessary
  }
}

async function parseLogs(logs) {
  const summaries = [];
  console.log(`Parsing logs: ${logs.length} entries found`); // Log number of logs to be parsed

  for (const log of logs) {
    console.log(`Processing log entry:`, log); // Log each log entry
    if (log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
      const from = '0x' + log.topics[1].slice(26);
      const to = '0x' + log.topics[2].slice(26);
      if (log.topics.length === 4) {
        // ERC-721 Transfer event
        const tokenId = Web3.utils.hexToNumberString(log.topics[3]);
        summaries.push(`Transaction ${log.transactionHash} - Transferred NFT token ID ${tokenId} from ${from} to ${to}`);
      } else {
        // ERC-20 Transfer event
        const metadata = await getTokenMetadata(log.address);
        const value = Web3.utils.fromWei(log.data, 'ether');
        const readableValue = (parseInt(value) / Math.pow(10, metadata.decimals)).toFixed(metadata.decimals);
        summaries.push(`Transaction ${log.transactionHash} - Transferred ${readableValue} ${metadata.symbol} (${metadata.name}) from ${from} to ${to}`);
      }
    }
  }
  console.log('Completed parsing logs:', summaries); // Log summaries of all parsed logs
  return summaries;
}

async function main(params) {
  console.log('Starting main function with params:', params); // Log input params
  try {
    const { data } = params;
    const results = await Promise.all(data.map(async entry => {
      const { block, receipts } = entry;
      console.log(`Processing block number ${block.number} with receipts`); // Log details of the block being processed
      return {
        blockNumber: block.number,
        transactions: await Promise.all(receipts.map(async receipt => ({
          transactionHash: receipt.transactionHash,
          logsSummary: await parseLogs(receipt.logs)
        })))
      };
    }));
    console.log('Final results:', results); // Log final results
    return { results };
  } catch (error) {
    console.error('Error in main function:', error); // Log any errors encountered in the main function
    throw error;
  }
}

module.exports = { main };
