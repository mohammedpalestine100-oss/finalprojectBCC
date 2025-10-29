import { type NextRequest, NextResponse } from "next/server"
import { storeCertificateOnBlockchain, generateCertificateHash } from "@/lib/blockchain"

/**
 * POST /api/blockchain/store
 * Store certificate hash on blockchain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { certificateNumber, certificateData } = body

    if (!certificateNumber || !certificateData) {
      return NextResponse.json({ success: false, message: "Certificate number and data are required" }, { status: 400 })
    }

    // Generate certificate hash
    const certificateHash = generateCertificateHash(certificateData)

    // Store on blockchain
    const result = await storeCertificateOnBlockchain(certificateNumber, certificateHash)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Failed to store on blockchain" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Certificate stored on blockchain successfully",
      data: {
        certificateHash,
        transactionHash: result.transactionHash,
      },
    })
  } catch (error: any) {
    console.error("[v0] Blockchain store API error:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}
