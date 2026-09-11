# 🐛 E2E Test Bug Report Template

## Test Information
- **Test Date**: 
- **Test Environment**: Production (https://ayuzee.com)
- **Test Suite**: 
- **Test File**: 
- **Browser**: Chromium (Headless)

## Issue Details

### Title
[Short description of the bug]

### Severity
- [ ] Critical - Test fails completely, blocks deployment
- [ ] High - Major functionality broken
- [ ] Medium - Feature works but with issues
- [ ] Low - Minor UI/UX issue

### Test Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Error Message
```
[Paste error message here]
```

### Screenshots/Videos
- Screenshot: `test-results/.../test-failed-1.png`
- Video: `test-results/.../video.webm`

## Database Verification

### Query 1: Check User Registration
```sql
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%ayuzee-test.dev%'
ORDER BY created_at DESC LIMIT 5;
```

### Query 2: Check Related Table
```sql
-- Replace with relevant table
SELECT * FROM <table_name> 
WHERE created_at > NOW() - INTERVAL '30 minutes';
```

### Query 3: Check Notifications
```sql
SELECT * FROM unified_notifications 
WHERE user_id = '<user_id_from_above>'
ORDER BY created_at DESC;
```

## Fix Status
- [ ] Fixed in code
- [ ] Pending fix
- [ ] Won't fix (reason: )

## Notes
[Any additional context or follow-up needed]

---
**Reported by**: E2E Test Suite
**Report Date**: Auto-generated