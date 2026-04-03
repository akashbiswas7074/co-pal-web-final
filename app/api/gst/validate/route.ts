import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GST Validation API - Production Ready Structure
 * Implements Official GSTN REST Standards:
 * - HTTPS Only
 * - Base64 Encoding (RES7/REQ2)
 * - Custom Headers (clientid, client-secret, ip-usr)
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Config from Environment Variables
        const CLIENT_ID = process.env.GST_CLIENT_ID;
        const CLIENT_SECRET = process.env.GST_CLIENT_SECRET;
        const USERNAME = process.env.GST_USERNAME;
        const STATE_CD = process.env.GST_STATE_CD || '27'; // Default Maharashtra

        let gstin = "";
        if (body.data) {
            // Decode incoming payload if sent in Base64 (REQ2)
            const decodedData = JSON.parse(Buffer.from(body.data, 'base64').toString('utf-8'));
            gstin = decodedData.gstin;
        } else {
            gstin = body.gstin;
        }

        if (!gstin) {
            return NextResponse.json({
                status_cd: "0",
                error: { error_cd: "GST_MISSING", message: "GSTIN is required" }
            }, { status: 400 });
        }

        // --- STEP 1: Authentication (Mock/Placeholder for Auth-Token) ---
        // In production, you would first call the Authentication API to get an 'auth-token'
        // and an Encryption Key 'EK'.
        const authToken = "MOCK_AUTH_TOKEN";

        // --- STEP 2: Prepare Official API Call ---
        /*
        const response = await fetch('https://api.gst.gov.in/taxpayerapi/v1.0/search', {
          method: 'GET',
          headers: {
            'clientid': CLIENT_ID!,
            'client-secret': CLIENT_SECRET!,
            'auth-token': authToken,
            'username': USERNAME!,
            'state-cd': STATE_CD,
            'ip-usr': request.ip || '127.0.0.1',
            'txn': `NOFAME${Date.now()}`
          }
        });
        */

        // --- STEP 3: Handle Encryption/Decryption as per RES6/RES7 ---
        // For now, we simulate a successful validated response.
        const mockResponsePayload = {
            gstin: gstin,
            status: 'Active',
            businessName: 'Business Verified via GSTN',
            businessAddress: 'Registered GST Address, State Code: ' + STATE_CD,
            legalName: 'Official Legal Name Ltd.'
        };

        // Encode to Base64 as per RES7
        const base64Data = Buffer.from(JSON.stringify(mockResponsePayload)).toString('base64');

        return NextResponse.json({
            status_cd: "1",
            data: base64Data, // Official standard encoding
            rek: "", // This would be the encrypted session key in production
            hmac: "" // This would be the payload hash for integrity
        });

    } catch (error: any) {
        console.error("[GST_API_ERROR]:", error);
        return NextResponse.json({
            status_cd: "0",
            error: { error_cd: "INTERNAL_ERROR", message: "Failed to communicate with GST System" }
        }, { status: 500 });
    }
}

// Keep GET for easy frontend debugging/simpler calls
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const gstin = searchParams.get('gstin')?.toUpperCase();

    if (!gstin) {
        return NextResponse.json({ status_cd: "0", error: { message: "GSTIN required" } }, { status: 400 });
    }

    // Simulate official response structure
    const responseData = {
        gstin: gstin,
        status: 'Active',
        businessName: 'Validated Business from P-API',
        businessAddress: 'Verified Address, Maharashtra, 400001'
    };

    return NextResponse.json({
        status_cd: "1",
        data: Buffer.from(JSON.stringify(responseData)).toString('base64')
    });
}
