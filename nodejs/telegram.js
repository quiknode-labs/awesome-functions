// Import dependencies, learn more at: https://www.quicknode.com/docs/functions/runtimes/node-js-20-runtime
const axios = require('axios');

async function main(params) {
    // Extract dataset and network from metadata in params
    const dataset = params.metadata.dataset;
    const network = params.metadata.network;

    // Extract user data from params, if any
    const userData = params.user_data;

    // Prepare payload for Telegram
    const payload = {
        chat_id: '<YOUR_TELEGRAM_CHAT_ID>',
        text: `This is data from the ${dataset} dataset on the ${network} network. User data: ${JSON.stringify(userData)}`
    };

    // Send payload to Telegram
    try {
        const response = await axios.post(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Telegram response:', response.data);
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
    
    // Return anything that you will consume on API side or helping you check your execution later
    return { 
        message: `This is data from the ${dataset} dataset on the ${network} network.`,
        user_data: userData,
        params 
    };
}