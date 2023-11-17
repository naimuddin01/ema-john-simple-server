# **Set Up the Backend and Database**
**Here is the Fontend Code :** [Fontend](https://github.com/naimuddin01/ema-john-simple/tree/master) 

Provide step-by-step instructions on how to install and set up your project. Include any necessary commands or configuration steps. For example:

**Clone the Repository**
```bash
https://github.com/naimuddin01/ema-john-simple-server.git
```

**Install project dependencies:**
```bash
cd your-project
npm install
```

### Configure the .env file backend

Explain how to set up the necessary configuration, especially the .env file.
1. Create a .env file in the project root directory:
   ```bash
    touch .env
   ```
2. Add the following environment variables to your .env file:
    ```bash
    DB_User=your-mongoBD-project-userName
    DB_PASS=your-mongoBD-project-PASS
   ```
    
3. Add the following environment variables to your .env file for SSL:
   ```bash
   SSLCommerz_StoreID = your-store-id
   SSLCommerz_StorePassword = your-store-password
    ```

### SSL Integration

General steps to integrate SSLcommerze payment system

1. **Register with the Payment Gateway:** Sign up [here](https://developer.sslcommerz.com/registration/) for an account with the chosen payment gateway. During registration, you will receive API credentials, such as API keys and other relevant information.

2. **Install Required Packages:** Required packages are already installed if you install the `requirements.txt` file. But you can install sslcommerze package manually by running the following command

   ```bash
   npm install sslcommerz-lib
   ```
