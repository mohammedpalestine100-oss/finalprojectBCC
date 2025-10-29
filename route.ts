import { NextResponse } from "next/server"
import { checkBlockchainConnection } from "@/lib/blockchain"

/**
 * GET /api/blockchain/status
 * Check blockchain connection status
 */
export async function GET() {
  try {
    const status = await checkBlockchainConnection()

    return NextResponse.json({
      success: status.connected,
      message: status.connected ? "Blockchain connected" : "Blockchain connection failed",
      data: {
        connected: status.connected,
        network: status.network,
        blockNumber: status.blockNumber,
        error: status.error,
      },
    })
  } catch (error: any) {
    console.error("[v0] Blockchain status API error:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}
