import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * RPC utility class for making Ethereum blockchain calls using ethers.js
 */
class RPCClient {
    constructor(rpcUrl = null, privateKey = null) {
        // Use provided RPC URL or fallback to environment variable
        this.rpcUrl = rpcUrl || process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
        
        // Initialize provider
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        
        // Initialize wallet if private key is provided
        if (privateKey || process.env.PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(privateKey || process.env.PRIVATE_KEY, this.provider);
        }
    }

    /**
     * Make a generic RPC call
     * @param {string} method - RPC method name
     * @param {Array} params - RPC method parameters
     * @returns {Promise<any>} RPC response
     */
    async makeRPCCall(method, params = []) {
        try {
            const result = await this.provider.send(method, params);
            return {
                success: true,
                data: result,
                error: null
            };
        } catch (error) {
            console.error(`RPC call failed for method ${method}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get the current block number
     * @returns {Promise<number>} Current block number
     */
    async getBlockNumber() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            return {
                success: true,
                data: blockNumber,
                error: null
            };
        } catch (error) {
            console.error('Failed to get block number:', error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get balance of an address
     * @param {string} address - Ethereum address
     * @returns {Promise<string>} Balance in ETH
     */
    async getBalance(address) {
        try {
            const balance = await this.provider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);
            return {
                success: true,
                data: {
                    wei: balance.toString(),
                    eth: balanceInEth
                },
                error: null
            };
        } catch (error) {
            console.error(`Failed to get balance for ${address}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get transaction details
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>} Transaction details
     */
    async getTransaction(txHash) {
        try {
            const tx = await this.provider.getTransaction(txHash);
            return {
                success: true,
                data: tx,
                error: null
            };
        } catch (error) {
            console.error(`Failed to get transaction ${txHash}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get transaction receipt
     * @param {string} txHash - Transaction hash
     * @returns {Promise<Object>} Transaction receipt
     */
    async getTransactionReceipt(txHash) {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            return {
                success: true,
                data: receipt,
                error: null
            };
        } catch (error) {
            console.error(`Failed to get transaction receipt ${txHash}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get block details
     * @param {number|string} blockNumberOrHash - Block number or hash
     * @returns {Promise<Object>} Block details
     */
    async getBlock(blockNumberOrHash) {
        try {
            const block = await this.provider.getBlock(blockNumberOrHash);
            return {
                success: true,
                data: block,
                error: null
            };
        } catch (error) {
            console.error(`Failed to get block ${blockNumberOrHash}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get gas price
     * @returns {Promise<string>} Current gas price in gwei
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.provider.getFeeData();
            return {
                success: true,
                data: {
                    gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
                    maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
                    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
                },
                error: null
            };
        } catch (error) {
            console.error('Failed to get gas price:', error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Send a transaction (requires wallet to be initialized)
     * @param {Object} txData - Transaction data
     * @returns {Promise<Object>} Transaction response
     */
    async sendTransaction(txData) {
        if (!this.wallet) {
            return {
                success: false,
                data: null,
                error: 'Wallet not initialized. Please provide a private key.'
            };
        }

        try {
            const tx = await this.wallet.sendTransaction(txData);
            return {
                success: true,
                data: {
                    hash: tx.hash,
                    transaction: tx
                },
                error: null
            };
        } catch (error) {
            console.error('Failed to send transaction:', error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Call a contract method (read-only)
     * @param {string} contractAddress - Contract address
     * @param {Array} abi - Contract ABI
     * @param {string} methodName - Method name to call
     * @param {Array} params - Method parameters
     * @returns {Promise<any>} Method result
     */
    async callContract(contractAddress, abi, methodName, params = []) {
        try {
            const contract = new ethers.Contract(contractAddress, abi, this.provider);
            const result = await contract[methodName](...params);
            return {
                success: true,
                data: result,
                error: null
            };
        } catch (error) {
            console.error(`Failed to call contract method ${methodName}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Execute a contract transaction (requires wallet)
     * @param {string} contractAddress - Contract address
     * @param {Array} abi - Contract ABI
     * @param {string} methodName - Method name to execute
     * @param {Array} params - Method parameters
     * @param {Object} txOptions - Transaction options (gasLimit, gasPrice, etc.)
     * @returns {Promise<Object>} Transaction response
     */
    async executeContract(contractAddress, abi, methodName, params = [], txOptions = {}) {
        if (!this.wallet) {
            return {
                success: false,
                data: null,
                error: 'Wallet not initialized. Please provide a private key.'
            };
        }

        try {
            const contract = new ethers.Contract(contractAddress, abi, this.wallet);
            const tx = await contract[methodName](...params, txOptions);
            return {
                success: true,
                data: {
                    hash: tx.hash,
                    transaction: tx
                },
                error: null
            };
        } catch (error) {
            console.error(`Failed to execute contract method ${methodName}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Wait for transaction confirmation
     * @param {string} txHash - Transaction hash
     * @param {number} confirmations - Number of confirmations to wait for
     * @returns {Promise<Object>} Transaction receipt
     */
    async waitForTransaction(txHash, confirmations = 1) {
        try {
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);
            return {
                success: true,
                data: receipt,
                error: null
            };
        } catch (error) {
            console.error(`Failed to wait for transaction ${txHash}:`, error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Estimate gas for a transaction
     * @param {Object} txData - Transaction data
     * @returns {Promise<string>} Estimated gas
     */
    async estimateGas(txData) {
        try {
            const gasEstimate = await this.provider.estimateGas(txData);
            return {
                success: true,
                data: gasEstimate.toString(),
                error: null
            };
        } catch (error) {
            console.error('Failed to estimate gas:', error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }
}

// Factory function to create RPC client instances

export function createRPCClient(rpcUrl = null, privateKey = null) {
    return new RPCClient(rpcUrl, privateKey);
}

// Default instance
export const rpcClient = new RPCClient();

// Export the class as well for custom instantiation
export { RPCClient };
