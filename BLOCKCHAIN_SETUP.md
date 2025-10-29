# Blockchain Integration Setup Guide

This guide explains how to set up and use the blockchain integration for certificate verification.

## Overview

The Certificate Verification Platform uses Ethereum blockchain to store immutable certificate hashes, providing cryptographic proof of certificate authenticity.

## Architecture

1. **Smart Contract**: `CertificateRegistry.sol` - Stores certificate hashes on-chain
2. **Backend Integration**: `lib/blockchain.ts` - Handles blockchain interactions
3. **API Endpoints**: 
   - `/api/blockchain/store` - Store certificate hash
   - `/api/blockchain/verify` - Verify certificate on blockchain
   - `/api/blockchain/status` - Check blockchain connection

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install ethers@^6.0.0
\`\`\`

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

\`\`\`env
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BLOCKCHAIN_CHAIN_ID=11155111
CERTIFICATE_CONTRACT_ADDRESS=0xYourContractAddress
BLOCKCHAIN_PRIVATE_KEY=0xYourPrivateKey
\`\`\`

**Important**: Never commit your private key to version control!

### 3. Deploy Smart Contract

#### Option A: Using Remix IDE (Recommended for beginners)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `CertificateRegistry.sol`
3. Copy the contract code from `contracts/CertificateRegistry.sol`
4. Compile the contract (Solidity 0.8.20+)
5. Deploy to Sepolia testnet using MetaMask
6. Copy the deployed contract address

#### Option B: Using Hardhat

\`\`\`bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Copy contract to contracts/ folder
npx hardhat compile
npx hardhat run scripts/deploy-contract.ts --network sepolia
\`\`\`

### 4. Get Testnet ETH

For Sepolia testnet:
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Receive test ETH for transactions

### 5. Configure Infura/Alchemy

1. Sign up at [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Create a new project
3. Get your API key
4. Update `BLOCKCHAIN_RPC_URL` with your endpoint

## Usage

### Storing a Certificate on Blockchain

\`\`\`typescript
import { storeCertificateOnBlockchain, generateCertificateHash } from '@/lib/blockchain'

const certificateData = {
  certificateNumber: 'CERT-2025-ABC123',
  recipientName: 'John Doe',
  certificateType: 'Achievement',
  issueDate: '2025-01-15',
  issuingEntityId: 1
}

const hash = generateCertificateHash(certificateData)
const result = await storeCertificateOnBlockchain('CERT-2025-ABC123', hash)

if (result.success) {
  console.log('Transaction hash:', result.transactionHash)
}
\`\`\`

### Verifying a Certificate

\`\`\`typescript
import { verifyCertificateOnBlockchain } from '@/lib/blockchain'

const result = await verifyCertificateOnBlockchain('CERT-2025-ABC123')

if (result.verified) {
  console.log('Certificate verified!')
  console.log('Blockchain hash:', result.blockchainHash)
  console.log('Timestamp:', new Date(result.timestamp! * 1000))
}
\`\`\`

## API Examples

### Store Certificate Hash

\`\`\`bash
curl -X POST http://localhost:3000/api/blockchain/store \
  -H "Content-Type: application/json" \
  -d '{
    "certificateNumber": "CERT-2025-ABC123",
    "certificateData": {
      "certificateNumber": "CERT-2025-ABC123",
      "recipientName": "John Doe",
      "certificateType": "Achievement",
      "issueDate": "2025-01-15",
      "issuingEntityId": 1
    }
  }'
\`\`\`

### Verify Certificate

\`\`\`bash
curl http://localhost:3000/api/blockchain/verify?certificateNumber=CERT-2025-ABC123
\`\`\`

### Check Blockchain Status

\`\`\`bash
curl http://localhost:3000/api/blockchain/status
\`\`\`

## Security Considerations

1. **Private Key Management**: Never expose private keys in code or version control
2. **Access Control**: Only authorized issuers can store certificates on-chain
3. **Gas Optimization**: Batch operations when possible to reduce costs
4. **Network Selection**: Use testnet for development, mainnet for production

## Troubleshooting

### "Insufficient funds" error
- Ensure your wallet has enough ETH for gas fees
- Get testnet ETH from faucets

### "Contract not deployed" error
- Verify `CERTIFICATE_CONTRACT_ADDRESS` is correct
- Ensure contract is deployed on the correct network

### "RPC connection failed" error
- Check `BLOCKCHAIN_RPC_URL` is valid
- Verify Infura/Alchemy API key is active
- Check network connectivity

## Cost Estimation

Approximate gas costs on Ethereum:
- Store certificate: ~50,000-70,000 gas
- Verify certificate: Free (read-only)
- At 30 gwei gas price: ~$2-3 per certificate

Consider using Layer 2 solutions (Polygon, Arbitrum) for lower costs.

## Production Checklist

- [ ] Deploy contract to mainnet
- [ ] Update environment variables with mainnet values
- [ ] Set up monitoring for blockchain transactions
- [ ] Implement gas price optimization
- [ ] Add transaction retry logic
- [ ] Set up alerts for failed transactions
- [ ] Document contract address and deployment details
- [ ] Implement backup RPC endpoints
- [ ] Test certificate storage and verification flow
- [ ] Set up automated testing for blockchain integration

## Support

For issues or questions:
- Check the [Ethers.js documentation](https://docs.ethers.org/)
- Review [Solidity documentation](https://docs.soliditylang.org/)
- Contact the development team
