//This functions fetches metadata for a TRC20 token contract on the TRON blockchain. 
// It accepts a contract address as input provided as contractAddress inside user_data and returns the token's name, symbol, decimals, and total supply.
// It can accept a TRON contract address in TRON format (starting with 'T') and Ethereum format (starting with '0x').

const { Web3 } = require('web3');
const bs58 = require('bs58');

// Important: Replace with your TRON QuickNode endpoint
const tronEvmNodeUrl = '';

const web3 = new Web3(tronEvmNodeUrl);

// ERC20/TRC20 ABI
const tokenABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
];

// Function to convert TRON address to EVM address
function convertTronToEvmAddress(tronAddress) {
    if (tronAddress.startsWith('T')) {
        // Decode the base58 address
        const decoded = bs58.decode(tronAddress);
        
        // Remove the first byte (address type) and the last 4 bytes (checksum)
        const addressHex = decoded.slice(1, -4).toString('hex');
        
        // Add '0x' prefix to make it a valid Ethereum-style address
        return '0x' + addressHex;
    }
    // If it's already an EVM address, return as is
    return tronAddress;
}

async function fetchTokenMetadata(contractAddress) {
    try {
        // Convert address if it's in TRON format
        const evmAddress = convertTronToEvmAddress(contractAddress);

        // Create contract instance
        const contract = new web3.eth.Contract(tokenABI, evmAddress);

        // Fetch token metadata
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.methods.name().call(),
            contract.methods.symbol().call(),
            contract.methods.decimals().call(),
            contract.methods.totalSupply().call()
        ]);

        // Return the results
        return {
            address: {
                original: contractAddress,
                evm: evmAddress
            },
            name,
            symbol,
            decimals: parseInt(decimals),
            totalSupply: totalSupply.toString()
        };
    } catch (error) {
        console.error("Error fetching token metadata:", error);
        throw error;
    }
}

async function main(params) {
    try {
        const contractAddress = params.user_data.contractAddress;
        if (!contractAddress) {
            throw new Error("Contract address is required");
        }

        const metadata = await fetchTokenMetadata(contractAddress);

        return {
            statusCode: 200,
            metadata,
        };
    } catch (error) {
        console.error("Error in main function:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}

module.exports = { main };