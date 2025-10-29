/**
 * Blockchain Integration Module
 * Handles certificate hash storage and verification on Ethereum blockchain
 */

import { ethers } from "ethers"

// Certificate Registry Smart Contract ABI
const CERTIFICATE_REGISTRY_ABI = [
  "function storeCertificate(string memory certificateNumber, bytes32 certificateHash) public returns (bool)",
  "function verifyCertificate(string memory certificateNumber) public view returns (bytes32, uint256, address)",
  "function getCertificateHash(string memory certificateNumber) public view returns (bytes32)",
  "event CertificateStored(string indexed certificateNumber, bytes32 certificateHash, address indexed issuer, uint256 timestamp)",
]

// Configuration
const BLOCKCHAIN_CONFIG = {
  // Use Sepolia testnet for development
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  contractAddress: process.env.CERTIFICATE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || "",
  chainId: Number.parseInt(process.env.BLOCKCHAIN_CHAIN_ID || "11155111"), // Sepolia
}

/**
 * Get blockchain provider
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl)
}

/**
 * Get signer (wallet) for transactions
 */
export function getSigner(): ethers.Wallet {
  const provider = getProvider()
  return new ethers.Wallet(BLOCKCHAIN_CONFIG.privateKey, provider)
}

/**
 * Get certificate registry contract instance
 */
export function getCertificateContract(signer?: ethers.Wallet) {
  const signerOrProvider = signer || getProvider()
  return new ethers.Contract(BLOCKCHAIN_CONFIG.contractAddress, CERTIFICATE_REGISTRY_ABI, signerOrProvider)
}

/**
 * Generate certificate hash from certificate data
 */
export function generateCertificateHash(certificateData: {
  certificateNumber: string
  recipientName: string
  certificateType: string
  issueDate: string
  issuingEntityId: number
}): string {
  const dataString = JSON.stringify({
    certificateNumber: certificateData.certificateNumber,
    recipientName: certificateData.recipientName,
    certificateType: certificateData.certificateType,
    issueDate: certificateData.issueDate,
    issuingEntityId: certificateData.issuingEntityId,
  })

  return ethers.keccak256(ethers.toUtf8Bytes(dataString))
}

/**
 * Store certificate hash on blockchain
 */
export async function storeCertificateOnBlockchain(
  certificateNumber: string,
  certificateHash: string,
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const signer = getSigner()
    const contract = getCertificateContract(signer)

    // Convert hash to bytes32 format
    const hashBytes32 = certificateHash.startsWith("0x") ? certificateHash : `0x${certificateHash}`

    // Send transaction
    const tx = await contract.storeCertificate(certificateNumber, hashBytes32)

    // Wait for confirmation
    const receipt = await tx.wait()

    return {
      success: true,
      transactionHash: receipt.hash,
    }
  } catch (error: any) {
    console.error("[v0] Blockchain storage error:", error)
    return {
      success: false,
      error: error.message || "Failed to store certificate on blockchain",
    }
  }
}

/**
 * Verify certificate hash on blockchain
 */
export async function verifyCertificateOnBlockchain(certificateNumber: string): Promise<{
  success: boolean
  verified: boolean
  blockchainHash?: string
  timestamp?: number
  issuer?: string
  error?: string
}> {
  try {
    const contract = getCertificateContract()

    // Get certificate data from blockchain
    const [hash, timestamp, issuer] = await contract.verifyCertificate(certificateNumber)

    // Check if certificate exists (hash is not zero)
    const verified = hash !== ethers.ZeroHash

    return {
      success: true,
      verified,
      blockchainHash: verified ? hash : undefined,
      timestamp: verified ? Number(timestamp) : undefined,
      issuer: verified ? issuer : undefined,
    }
  } catch (error: any) {
    console.error("[v0] Blockchain verification error:", error)
    return {
      success: false,
      verified: false,
      error: error.message || "Failed to verify certificate on blockchain",
    }
  }
}

/**
 * Get certificate hash from blockchain
 */
export async function getCertificateHashFromBlockchain(
  certificateNumber: string,
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const contract = getCertificateContract()
    const hash = await contract.getCertificateHash(certificateNumber)

    return {
      success: true,
      hash: hash !== ethers.ZeroHash ? hash : undefined,
    }
  } catch (error: any) {
    console.error("[v0] Blockchain hash retrieval error:", error)
    return {
      success: false,
      error: error.message || "Failed to retrieve certificate hash from blockchain",
    }
  }
}

/**
 * Check blockchain connection status
 */
export async function checkBlockchainConnection(): Promise<{
  connected: boolean
  network?: string
  blockNumber?: number
  error?: string
}> {
  try {
    const provider = getProvider()
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()

    return {
      connected: true,
      network: network.name,
      blockNumber,
    }
  } catch (error: any) {
    console.error("[v0] Blockchain connection error:", error)
    return {
      connected: false,
      error: error.message || "Failed to connect to blockchain",
    }
  }
}
