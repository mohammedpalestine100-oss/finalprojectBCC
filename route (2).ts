import { type NextRequest, NextResponse } from "next/server"
import { verifyCertificateOnBlockchain, generateCertificateHash } from "@/lib/blockchain"

/**
 * GET /api/blockchain/verify?certificateNumber=XXX
 * Verify certificate hash on blockchain
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const certificateNumber = searchParams.get("certificateNumber")

    if (!certificateNumber) {
      return NextResponse.json({ success: false, message: "Certificate number is required" }, { status: 400 })
    }

    // Verify on blockchain
    const result = await verifyCertificateOnBlockchain(certificateNumber)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to verify on blockchain" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: result.verified ? "Certificate verified on blockchain" : "Certificate not found on blockchain",
      data: {
        verified: result.verified,
        blockchainHash: result.blockchainHash,
        timestamp: result.timestamp,
        issuer: result.issuer,
      },
    })
  } catch (error: any) {
    console.error("[v0] Blockchain verify API error:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/blockchain/verify
 * Verify certificate hash matches blockchain record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { certificateNumber, certificateData } = body

    if (!certificateNumber || !certificateData) {
      return NextResponse.json({ success: false, message: "Certificate number and data are required" }, { status: 400 })
    }

    // Generate hash from provided data
    const localHash = generateCertificateHash(certificateData)

    // Get hash from blockchain
    const blockchainResult = await verifyCertificateOnBlockchain(certificateNumber)

    if (!blockchainResult.success) {
      return NextResponse.json(
        { success: false, message: blockchainResult.error || "Failed to verify on blockchain" },
        { status: 500 },
      )
    }

    if (!blockchainResult.verified) {
      return NextResponse.json({
        success: true,
        message: "Certificate not found on blockchain",
        data: {
          verified: false,
          hashMatch: false,
        },
      })
    }

    // Compare hashes
    const hashMatch = localHash === blockchainResult.blockchainHash

    return NextResponse.json({
      success: true,
      message: hashMatch ? "Certificate verified and hash matches" : "Certificate found but hash mismatch",
      data: {
        verified: blockchainResult.verified,
        hashMatch,
        localHash,
        blockchainHash: blockchainResult.blockchainHash,
        timestamp: blockchainResult.timestamp,
        issuer: blockchainResult.issuer,
      },
    })
  } catch (error: any) {
    console.error("[v0] Blockchain verify API error:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}
