# 🚀 Q&A Forum Backend - Complete Postman Testing Guide

## 📋 **Postman Collection Setup**

### **Import This Collection**
```json
{
  "info": {
    "name": "Q&A Forum Backend API",
    "description": "Complete testing for Q&A Forum backend without authentication",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/qa",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Questions",
      "item": [
        {
          "name": "Get All Questions",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/questions",
              "host": ["{{baseUrl}}"],
              "path": ["questions"]
            }
          },
          "response": []
        },
        {
          "name": "Create Question",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Postman Test Question\",\n  \"body\": \"This is a test question created via Postman to verify the backend API is working properly. It has more than 30 characters to pass validation.\",\n  \"category\": \"general\",\n  \"tags\": [\"postman\", \"test\", \"api\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/questions",
              "host": ["{{baseUrl}}"],
              "path": ["questions"]
            }
          },
          "response": []
        },
        {
          "name": "Get Question by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/questions/{{questionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["questions", "{{questionId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Update Question",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Updated Postman Test Question\",\n  \"body\": \"This question has been updated via Postman to test the update functionality. It still has more than 30 characters.\",\n  \"category\": \"technical\",\n  \"tags\": [\"postman\", \"test\", \"updated\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/questions/{{questionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["questions", "{{questionId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Question",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/questions/{{questionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["questions", "{{questionId}}"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Answers",
      "item": [
        {
          "name": "Create Answer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"questionId\": \"{{questionId}}\",\n  \"body\": \"This is a test answer created via Postman to verify the answer creation API is working properly.\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/answers",
              "host": ["{{baseUrl}}"],
              "path": ["answers"]
            }
          },
          "response": []
        },
        {
          "name": "Get Answers by Question ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/answers/{{questionId}}",
              "host": ["{{baseUrl}}"],
              "path": ["answers", "{{questionId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Update Answer",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"body\": \"This answer has been updated via Postman to test the update functionality.\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/answers/{{answerId}}",
              "host": ["{{baseUrl}}"],
              "path": ["answers", "{{answerId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Delete Answer",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/answers/{{answerId}}",
              "host": ["{{baseUrl}}"],
              "path": ["answers", "{{answerId}}"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Voting",
      "item": [
        {
          "name": "Vote on Question",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"targetType\": \"question\",\n  \"targetId\": \"{{questionId}}\",\n  \"value\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/vote",
              "host": ["{{baseUrl}}"],
              "path": ["vote"]
            }
          },
          "response": []
        },
        {
          "name": "Vote on Answer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"targetType\": \"answer\",\n  \"targetId\": \"{{answerId}}\",\n  \"value\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/vote",
              "host": ["{{baseUrl}}"],
              "path": ["vote"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Leaderboards",
      "item": [
        {
          "name": "Get Overall Leaderboard",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/leaderboard/overall",
              "host": ["{{baseUrl}}"],
              "path": ["leaderboard", "overall"]
            }
          },
          "response": []
        },
        {
          "name": "Get Category Leaderboard",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/leaderboard/general",
              "host": ["{{baseUrl}}"],
              "path": ["leaderboard", "general"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Rank",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/leaderboard/user/507f1f77bcf86cd799439011",
              "host": ["{{baseUrl}}"],
              "path": ["leaderboard", "user", "507f1f77bcf86cd799439011"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "User Points",
      "item": [
        {
          "name": "Get User Points",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/507f1f77bcf86cd799439011/points",
              "host": ["{{baseUrl}}"],
              "path": ["users", "507f1f77bcf86cd799439011", "points"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Points History",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/users/507f1f77bcf86cd799439011/points/history",
              "host": ["{{baseUrl}}"],
              "path": ["users", "507f1f77bcf86cd799439011", "points", "history"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Notifications",
      "item": [
        {
          "name": "Get Notifications",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/notifications",
              "host": ["{{baseUrl}}"],
              "path": ["notifications"]
            }
          },
          "response": []
        },
        {
          "name": "Mark Notification as Read",
          "request": {
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/notifications/{{notificationId}}/read",
              "host": ["{{baseUrl}}"],
              "path": ["notifications", "{{notificationId}}", "read"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```

## 🧪 **Step-by-Step Testing Guide**

### **Step 1: Import Collection**
1. **Open Postman**
2. **Click "Import"** (top left)
3. **Select "Raw text"**
4. **Paste the JSON above**
5. **Click "Import"**

### **Step 2: Set Variables**
1. **Click on "Q&A Forum Backend API"** collection
2. **Click "Variables"** tab
3. **Set baseUrl**: `http://localhost:5000/api/qa`

### **Step 3: Test in Order**

#### **🎯 Test 1: Questions**
1. **"Get All Questions"** 
   - **Expected**: `{"success": true, "data": []}`
   - **Status**: ✅ 200 OK

2. **"Create Question"**
   - **Expected**: `{"success": true, "data": {_id: "...", ...}}`
   - **Status**: ✅ 201 Created
   - **Copy the `_id`** for next tests

3. **Set questionId Variable**
   - **Click "Variables"** tab
   - **Set questionId**: Paste the copied ID

4. **"Get Question by ID"**
   - **Expected**: `{"success": true, "data": {question}}`
   - **Status**: ✅ 200 OK

5. **"Update Question"**
   - **Expected**: `{"success": true, "data": {updated_question}}`
   - **Status**: ✅ 200 OK

#### **🎯 Test 2: Answers**
1. **"Create Answer"**
   - **Expected**: `{"success": true, "data": {_id: "...", ...}}`
   - **Status**: ✅ 201 Created
   - **Copy the `_id`** for next tests

2. **Set answerId Variable**
   - **Click "Variables"** tab
   - **Set answerId**: Paste the copied ID

3. **"Get Answers by Question ID"**
   - **Expected**: `{"success": true, "data": [answers]}`
   - **Status**: ✅ 200 OK

#### **🎯 Test 3: Voting**
1. **"Vote on Question"**
   - **Expected**: `{"success": true, "data": {message: "Vote recorded successfully"}}`
   - **Status**: ✅ 200 OK

2. **"Vote on Answer"**
   - **Expected**: `{"success": true, "data": {message: "Vote recorded successfully"}}`
   - **Status**: ✅ 200 OK

#### **🎯 Test 4: Leaderboards**
1. **"Get Overall Leaderboard"**
   - **Expected**: `{"success": true, "data": [leaderboard_data]}`
   - **Status**: ✅ 200 OK

2. **"Get Category Leaderboard"**
   - **Expected**: `{"success": true, "data": [leaderboard_data]}`
   - **Status**: ✅ 200 OK

#### **🎯 Test 5: User Points**
1. **"Get User Points"**
   - **Expected**: `{"success": true, "data": {points: number}}`
   - **Status**: ✅ 200 OK

2. **"Get User Points History"**
   - **Expected**: `{"success": true, "data": [transactions]}`
   - **Status**: ✅ 200 OK

#### **🎯 Test 6: Notifications**
1. **"Get Notifications"**
   - **Expected**: `{"success": true, "data": [notifications]}`
   - **Status**: ✅ 200 OK

## ✅ **Expected Results Summary**

| API Endpoint | Method | Expected Status | Expected Response |
|-------------|--------|----------------|------------------|
| `/questions` | GET | 200 OK | `{"success": true, "data": []}` |
| `/questions` | POST | 201 Created | `{"success": true, "data": {question}}` |
| `/questions/:id` | GET | 200 OK | `{"success": true, "data": {question}}` |
| `/questions/:id` | PUT | 200 OK | `{"success": true, "data": {question}}` |
| `/questions/:id` | DELETE | 200 OK | `{"success": true, "data": {message}}` |
| `/answers` | POST | 201 Created | `{"success": true, "data": {answer}}` |
| `/answers/:questionId` | GET | 200 OK | `{"success": true, "data": [answers]}` |
| `/vote` | POST | 200 OK | `{"success": true, "data": {message}}` |
| `/leaderboard/overall` | GET | 200 OK | `{"success": true, "data": [users]}` |
| `/users/:userId/points` | GET | 200 OK | `{"success": true, "data": {points}}` |
| `/notifications` | GET | 200 OK | `{"success": true, "data": [notifications]}` |

## 🔍 **Troubleshooting**

### **❌ If Tests Fail:**

#### **Connection Issues:**
- **Error**: "Could not connect"
- **Fix**: Make sure backend is running on port 5000

#### **Validation Errors:**
- **Error**: "Title, body, and category are required"
- **Fix**: Ensure all required fields are present

#### **Not Found:**
- **Error**: 404 Not Found
- **Fix**: Check if questionId/answerId variables are set correctly

#### **Server Errors:**
- **Error**: 500 Internal Server Error
- **Fix**: Check backend console for errors

## 🎉 **Success Criteria**

✅ **All endpoints return 200/201 status codes**  
✅ **All responses have `{"success": true, "data": {...}}` format**  
✅ **Questions can be created, read, updated, deleted**  
✅ **Answers can be created and retrieved**  
✅ **Voting works and awards points**  
✅ **Leaderboards show user rankings**  
✅ **Points system tracks transactions**  
✅ **Notifications are generated**

**Your Q&A Forum backend is fully testable with Postman!** 🚀
