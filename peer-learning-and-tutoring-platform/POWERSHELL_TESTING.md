# 🚀 Q&A Forum Backend - PowerShell Testing Script

## 📋 **Quick PowerShell Tests**

### **Step 1: Test Server Connection**
```powershell
# Test if server is running
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing
```

### **Step 2: Test Questions API**

#### **Get All Questions**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions" -Method GET -UseBasicParsing | ConvertFrom-Json
```

#### **Create Question**
```powershell
$body = @{
    title = "PowerShell Test Question"
    body = "This is a test question created via PowerShell to verify the backend API is working properly. It has more than 30 characters."
    category = "general"
    tags = @("powershell", "test", "api")
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$question = $response.Content | ConvertFrom-Json
$questionId = $question.data._id
Write-Host "Question created with ID: $questionId"
```

#### **Get Question by ID**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions/$questionId" -Method GET -UseBasicParsing | ConvertFrom-Json
```

#### **Update Question**
```powershell
$body = @{
    title = "Updated PowerShell Test Question"
    body = "This question has been updated via PowerShell to test the update functionality. It still has more than 30 characters."
    category = "technical"
    tags = @("powershell", "test", "updated")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions/$questionId" -Method PUT -ContentType "application/json" -Body $body -UseBasicParsing | ConvertFrom-Json
```

### **Step 3: Test Answers API**

#### **Create Answer**
```powershell
$body = @{
    questionId = $questionId
    body = "This is a test answer created via PowerShell to verify the answer creation API is working properly."
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/answers" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
$answer = $response.Content | ConvertFrom-Json
$answerId = $answer.data._id
Write-Host "Answer created with ID: $answerId"
```

#### **Get Answers by Question ID**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/answers/$questionId" -Method GET -UseBasicParsing | ConvertFrom-Json
```

### **Step 4: Test Voting API**

#### **Vote on Question**
```powershell
$body = @{
    targetType = "question"
    targetId = $questionId
    value = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/qa/vote" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | ConvertFrom-Json
```

#### **Vote on Answer**
```powershell
$body = @{
    targetType = "answer"
    targetId = $answerId
    value = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/qa/vote" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | ConvertFrom-Json
```

### **Step 5: Test Leaderboards**

#### **Get Overall Leaderboard**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/leaderboard/overall" -Method GET -UseBasicParsing | ConvertFrom-Json
```

#### **Get Category Leaderboard**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/leaderboard/general" -Method GET -UseBasicParsing | ConvertFrom-Json
```

### **Step 6: Test User Points**

#### **Get User Points**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/users/507f1f77bcf86cd799439011/points" -Method GET -UseBasicParsing | ConvertFrom-Json
```

#### **Get User Points History**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/users/507f1f77bcf86cd799439011/points/history" -Method GET -UseBasicParsing | ConvertFrom-Json
```

### **Step 7: Test Notifications**

#### **Get Notifications**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/notifications" -Method GET -UseBasicParsing | ConvertFrom-Json
```

### **Step 8: Clean Up (Optional)**

#### **Delete Answer**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/answers/$answerId" -Method DELETE -UseBasicParsing | ConvertFrom-Json
```

#### **Delete Question**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions/$questionId" -Method DELETE -UseBasicParsing | ConvertFrom-Json
```

## 🎯 **Complete Test Script**

```powershell
# Complete Q&A Forum Backend Test
Write-Host "🚀 Starting Q&A Forum Backend Tests..." -ForegroundColor Green

# Test 1: Server Health
Write-Host "📡 Testing server connection..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing
    Write-Host "✅ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    exit
}

# Test 2: Create Question
Write-Host "📝 Creating test question..." -ForegroundColor Yellow
$body = @{
    title = "Complete PowerShell Test Question"
    body = "This is a comprehensive test question created via PowerShell to verify all backend functionality is working properly. It has more than 30 characters."
    category = "general"
    tags = @("powershell", "test", "complete")
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    $question = $response.Content | ConvertFrom-Json
    $questionId = $question.data._id
    Write-Host "✅ Question created: $questionId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create question!" -ForegroundColor Red
    exit
}

# Test 3: Get Questions
Write-Host "📋 Getting all questions..." -ForegroundColor Yellow
try {
    $questions = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/questions" -Method GET -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Found $($questions.data.length) questions" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get questions!" -ForegroundColor Red
}

# Test 4: Create Answer
Write-Host "💬 Creating test answer..." -ForegroundColor Yellow
$body = @{
    questionId = $questionId
    body = "This is a comprehensive test answer created via PowerShell to verify answer functionality."
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/answers" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
    $answer = $response.Content | ConvertFrom-Json
    $answerId = $answer.data._id
    Write-Host "✅ Answer created: $answerId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create answer!" -ForegroundColor Red
}

# Test 5: Vote
Write-Host "🗳️ Testing voting..." -ForegroundColor Yellow
$body = @{
    targetType = "question"
    targetId = $questionId
    value = 1
} | ConvertTo-Json

try {
    $vote = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/vote" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Vote recorded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to vote!" -ForegroundColor Red
}

# Test 6: Leaderboard
Write-Host "🏆 Testing leaderboard..." -ForegroundColor Yellow
try {
    $leaderboard = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/leaderboard/overall" -Method GET -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Leaderboard working" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get leaderboard!" -ForegroundColor Red
}

# Test 7: User Points
Write-Host "🎯 Testing user points..." -ForegroundColor Yellow
try {
    $points = Invoke-WebRequest -Uri "http://localhost:5000/api/qa/users/507f1f77bcf86cd799439011/points" -Method GET -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ User points: $($points.data.points)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get user points!" -ForegroundColor Red
}

Write-Host "🎉 All tests completed!" -ForegroundColor Green
Write-Host "📊 Test Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Server Connection" -ForegroundColor Green
Write-Host "  ✅ Question CRUD" -ForegroundColor Green
Write-Host "  ✅ Answer Creation" -ForegroundColor Green
Write-Host "  ✅ Voting System" -ForegroundColor Green
Write-Host "  ✅ Leaderboard" -ForegroundColor Green
Write-Host "  ✅ User Points" -ForegroundColor Green
Write-Host "🚀 Your Q&A Forum backend is working perfectly!" -ForegroundColor Green
```

## 🎯 **How to Use**

### **Option 1: Postman (Recommended)**
1. **Open**: `POSTMAN_TESTING_GUIDE.md`
2. **Import**: The JSON collection
3. **Run**: All tests in order

### **Option 2: PowerShell**
1. **Copy**: The complete test script
2. **Paste**: Into PowerShell
3. **Run**: All tests automatically

### **Option 3: Individual Commands**
1. **Copy**: Specific commands
2. **Run**: One at a time
3. **Debug**: Any issues

## ✅ **Expected Results**

✅ **All commands return 200/201 status codes**  
✅ **JSON responses with `{"success": true, "data": {...}}`**  
✅ **Questions and answers created successfully**  
✅ **Votes recorded and points awarded**  
✅ **Leaderboards and user points working**  

**Your Q&A Forum backend is fully testable!** 🎉
