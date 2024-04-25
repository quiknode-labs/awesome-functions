# Awesome Functions 

Welcome to the Awesome Functions! This repository is designed to help you get started with our Functions serverless computing platform / edge functions, providing you with boilerplate code samples in Python and NodeJS.

These samples are tailored to assist you in integrating real-time and historic blockchain data into your applications efficiently.

## Getting Started
Follow these steps to get started with Awesome Functions 👇

### Prerequisites
- Ensure you have Node.js and Python installed on your machine. You can download them from [Node.js](https://nodejs.org/) and [Python](https://www.python.org/downloads/) respectively.
- A QuickNode account with access to the Functions product.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourorganization/awesome-functions.git
   cd awesome-functions
   ```

2. **Install Dependencies:**

    For Node.js projects:
    ```bash
    npm install
    ```

    For Python projects:
    ```bash
    pip install -r requirements.txt
    ```

3. **Setting Up Your Environment:**
Set up environment variables (such as .env) or configuration files with your API keys and other sensitive information. Never hard code your credentials in your scripts.


### Deployment

#### NodeJS: Single Script
TBD

#### NodeJS: ZIP Archive

To package your NodeJS project (`qn-token-metadata-parser`) into a ZIP archive with all dependencies included, follow these steps:

1. **Navigate to your project directory:**
    ```bash
    cd qn-token-metadata-parser
    ```

2. **Install project dependencies:**
    Ensure that you have npm installed on your system. Run the following command to install dependencies:
    ```bash
    npm install
    ```

3. **Modify the .env file:**
    Create or update your .env file with the QuickNode endpoint URL. You can obtain an endpoint from QuickNode by [visiting QuickNode dashboard](https://dashboard.quicknode.com/endpoints). Replace XXX with your actual QuickNode endpoint URL:
    ```
    # Replace 'XXX' with your actual QuickNode URL
    QUICKNODE_URL="XXX"
    ``` 

4. **Build the project:**
    This step compiles your JavaScript files using Webpack and outputs the built files in the dist directory, and creates a ZIP package with .env and JS files ready to be used in Functions. Execute the following command:
    ```bash
    npm run build
    ```

#### Python: Single Script
TBD

#### Python: ZIP Archive
TBD

### Testing
TBD

### Documentation
For detailed documentation on all the functions and configurations available, please visit our documentation page.

### Support
If you encounter any issues or have questions, please file an issue in this repository or contact our support team at support@quicknode.com.