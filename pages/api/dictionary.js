import axios from 'axios';

export default async function handler(req, res) {
    const { word } = req.query; // Get the word from query parameters
    const baseUrl = 'https://od-api-sandbox.oxforddictionaries.com/api/v2'; // Oxford API base URL
    const accessKey = process.env.ACCESS_KEY; // API key from .env
    const appId = process.env.APP_ID; // App ID from .env

    // Check if required variables are set
    if (!accessKey || !appId) {
        return res.status(500).json({ error: 'Missing API credentials. Check .env file.' });
    }

    try {
        // Try with en-us first
        let apiUrl = `${baseUrl}/entries/en-us/${word}`;
        console.log(`Requesting: ${apiUrl}`);

        let response = await axios.get(apiUrl, {
            headers: {
                'app_id': appId,
                'app_key': accessKey,
                'User-Agent': 'MyDictionaryClient/1.0'
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        // Log error details
        console.error('Error details:', error.response ? error.response.data : error.message);

        // Handle 404 error (word not found)
        if (error.response && error.response.status === 404) {
            try {
                // Retry with en-gb as an alternative
                let fallbackApiUrl = `${baseUrl}/entries/en-gb/${word}`;
                console.log(`Retrying with: ${fallbackApiUrl}`);

                let fallbackResponse = await axios.get(fallbackApiUrl, {
                    headers: {
                        'app_id': appId,
                        'app_key': accessKey,
                        'User-Agent': 'MyDictionaryClient/1.0'
                    }
                });

                return res.status(200).json(fallbackResponse.data);
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError.response ? fallbackError.response.data : fallbackError.message);
                return res.status(404).json({ error: 'Word not found in the dictionary.' });
            }
        }

        // Handle other errors
        return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
}
