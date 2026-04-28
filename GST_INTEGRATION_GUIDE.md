# Official GST API Setup Guide

This guide describes how to finalize the connection between your store and the [Official GST Developer Portal](https://developer.gst.gov.in/apiportal/).

## 1. Prerequisites (Portal Steps)

To move from **Simulation Mode** to **Real Data**, follow these steps:

1.  **Log in** to the [GST Developer Portal](https://developer.gst.gov.in/apiportal/) with your credentials (`DHIRO8989`).
2.  **Create an Application**:
    - Go to "My Applications" > "Create Application".
    - Enter a name like "VibeCart-Checkout".
    - You will receive a **Client ID** and **Client Secret**.
3.  **Get the Public Key**:
    - Locate the **Public Key (PEM)** in your application settings or download it.
    - This is required for the RSA handshake.

## 2. Configuration (`.env`)

Update your `ecom-2-web/.env` with the values you obtained:

```env
# official GST Portal API
GST_BASE_URL=https://api.gst.gov.in
GST_CLIENT_ID=XXXX_PASTE_CLIENT_ID_HERE_XXXX
GST_CLIENT_SECRET=XXXX_PASTE_CLIENT_SECRET_HERE_XXXX
GST_USERNAME=DHIRO8989
GST_PASSWORD=Jiban**12
GST_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- ... ----END PUBLIC KEY-----"
GST_STATE_CD=27
```

## 3. How it Works (Technical Flow)

The system is now built with a multi-layer security handshake:

1.  **Handshake (`getGSPSession`)**: 
    - Generates a 32-byte session key (`AppKey`).
    - Encrypts it with the **Government's RSA Public Key**.
    - Exchanges it for an `auth-token`.
2.  **Encryption (`encryptPayload`)**:
    - All business data sent to the portal is encrypted using **AES-256-CBC**.
3.  **Search Taxpayer**:
    - The `verifyGSTIN` function (used in Checkout) calls the G2B endpoint and decrypts the response to show you the verified business name.

## 4. Current Status
- **Simulation Mode**: ON 
  - (Works automatically for testing even without keys).
- **Security Logic**: Ready 
  - (AES/RSA code is implemented in `lib/utils/gst-crypto.ts`).
- **Checkout Integration**: Ready 
  - (Logic is added to `lib/database/actions/order.actions.ts`).

---
**Verification**: To verify, simply go to your checkout page, select "Tax Invoice", and enter any GSTIN. You will see the system attempt to verify it.
