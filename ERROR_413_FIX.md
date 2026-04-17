# Fix for Error 413 - Payload Too Large

## Problem
When lab technician tries to upload a file with the lab report, the request fails with error code 413 "Payload Too Large".

## Root Cause
- Files are converted to base64 format before sending to server
- Base64 encoding increases file size by ~33%
- Default Express.js body parser limit is 100kb
- Large files (images, PDFs) exceed this limit

## Solution Applied

### 1. Backend Changes (server.js)
Increased payload size limit to 50MB:
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### 2. Frontend Changes (LabTechnicianDashboard.js)
Added file size validation (5MB limit):
- Checks file size before upload
- Shows error if file > 5MB
- Provides success feedback on upload
- Added remove button to clear selected file
- Made file upload optional

## How to Use

### After Restart Backend Server
**IMPORTANT**: You must restart the backend server for changes to take effect!

```bash
# Stop the current server (Ctrl+C)
cd backend
npm run dev
```

### Upload Files
1. Select a file (PDF, JPG, PNG, DOC, DOCX)
2. File must be under 5MB
3. If file is too large, you'll see an error
4. You can remove the file and try a smaller one
5. Or submit the report without a file

### File Size Recommendations
- **Small files** (< 1MB): Images, small PDFs - Upload directly
- **Medium files** (1-5MB): Larger PDFs, scanned documents - Upload with caution
- **Large files** (> 5MB): Compress first or use external storage

## Alternative Solutions

### Option 1: Compress Files Before Upload
- Use online tools to compress PDFs
- Resize images before uploading
- Convert to lower quality if needed

### Option 2: Submit Without File
- Fill in test results manually
- Add findings and recommendations
- Submit report without file attachment
- Upload file separately later if needed

### Option 3: Use External Storage (Future Enhancement)
- Upload files to AWS S3, Cloudinary, etc.
- Store only the file URL in database
- Much better for large files
- Recommended for production

## Testing

### Test 1: Small File (< 1MB)
1. Select a small image or PDF
2. Should upload successfully
3. See green checkmark with filename

### Test 2: Large File (> 5MB)
1. Select a large file
2. Should see error: "File size too large"
3. File input is cleared
4. Try a smaller file

### Test 3: No File
1. Don't select any file
2. Fill in other fields
3. Submit report
4. Should work without file

## Current Limits
- **Frontend validation**: 5MB per file
- **Backend limit**: 50MB total payload
- **Recommended**: Keep files under 2MB for best performance

## Error Messages

### "File size too large. Please upload a file smaller than 5MB."
- File exceeds 5MB limit
- Solution: Compress file or use smaller file

### "Failed to read file. Please try again."
- File reading error
- Solution: Try different file or refresh page

### "Request failed with code 413"
- File too large even after validation (shouldn't happen now)
- Solution: Restart backend server to apply new limits

## Performance Notes
- Large files slow down the application
- Base64 encoding increases database size
- Consider external storage for production
- Current solution works for moderate file sizes

## Future Improvements
1. Implement file compression on frontend
2. Use cloud storage (AWS S3, Cloudinary)
3. Add progress bar for file uploads
4. Support multiple file uploads
5. Add file preview before upload
