# Cloudinary Upload Preset Security Configuration

## Current Issue
The `ayuzee_uploads` preset is an unsigned upload preset, meaning anyone who knows the cloud name and preset name can upload files without authentication.

## Required Steps (Do in Cloudinary Dashboard)

### 1. Log in to Cloudinary
Go to: https://console.cloudinary.com/

### 2. Navigate to Upload Presets
Settings → Upload → Upload Presets → Click `ayuzee_uploads`

### 3. Configure Security Restrictions

| Setting | Value | Reason |
|---------|-------|--------|
| Signing Mode | Unsigned (keep) | Required for client-side uploads |
| Folder | `ayuzee/` | Prevents directory traversal |
| Allowed Formats | `jpg,jpeg,png,webp,gif,pdf,doc,docx` | Blocks executables/scripts |
| Max file size | 10485760 (10 MB) | Prevents storage abuse |
| Resource type | `auto` | Allows images + documents |
| Unique filename | `true` | Prevents filename collisions |
| Overwrite | `false` | Prevents overwriting existing files |
| Invalidate | `false` | Leave as default |

### 4. Enable Upload Moderation (Optional but Recommended)
- Settings → Upload → Moderation
- Enable "Auto-moderation" with Google AI Vision
- This flags inappropriate/NSFW content automatically

### 5. Set Usage Limits
- Settings → Account → Usage
- Set alert at 80% of free tier (20 GB storage, 20 GB bandwidth)
- Optionally enable "Block if exceeded"

### 6. Monitor Upload Activity
- Media Library → Activity Log
- Set up email alerts for unusual upload patterns

## Client-Side Validation (Already Implemented)
File: `src/utils/cloudinaryUpload.ts`

```typescript
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
```

## Future Enhancement: Signed Uploads
For maximum security, switch to signed uploads:

1. Create a Netlify Function `cloudinary-sign.js`:
```javascript
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: "khcxf5nw", api_key: "...", api_secret: "..." });

exports.handler = async (event) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "ayuzee", upload_preset: "ayuzee_uploads" },
    process.env.CLOUDINARY_API_SECRET
  );
  return { statusCode: 200, body: JSON.stringify({ timestamp, signature }) };
};
```

2. Client fetches signature before upload
3. Upload includes signature — Cloudinary validates it server-side
4. No unsigned uploads possible

This eliminates the abuse vector entirely.
