Admin API Documentation
Table of Contents
Authentication

Dashboard

User Management

Deposit Management

Withdrawal Management

VIP Management

Wallet Management

Authentication
Admin Login
Endpoint: POST /api/auth/login

Request Body:

json
{
  "login": "admin1@example.com",  // Can be email, username or phone
  "password": "Admin123!"
}
Success Response:

json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin-123",
    "email": "admin1@example.com",
    "username": "admin1",
    "role": "admin",
    "vipLevel": 0
  }
}
Error Responses:

400 Bad Request - Missing credentials or invalid format

401 Unauthorized - Invalid credentials

500 Internal Server Error - Server error

Dashboard
Get Statistics
Endpoint: GET /api/admin/stats

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "totalUsers": 142,
  "totalDeposits": 89,
  "totalWithdrawals": 56,
  "totalEarnings": 28450.75,
  "totalInvested": 125000.00
}
User Management
Get All Users
Endpoint: GET /api/admin/users

Query Parameters:

?role=user (optional filter)

?vipLevel=2 (optional filter)

Success Response:

json
[
  {
    "id": "user-123",
    "email": "user@example.com",
    "username": "user1",
    "balance": 500.00,
    "profitBalance": 250.00,
    "role": "user",
    "profile": {
      "vipLevel": 1,
      "totalInvested": 1000.00
    }
  }
]
Delete User
Endpoint: DELETE /api/admin/users/:userId

Success Response:

json
{
  "message": "User deleted successfully"
}
Deposit Management
Get Deposits
Endpoint: `GET /api/admin/deposits**

Query Parameters:

?status=pending (optional filter)

?userId=user-123 (optional filter)

Success Response:

json
[
  {
    "id": "dep-456",
    "amount": 500.00,
    "status": "pending",
    "userId": "user-123",
    "proofImage": "https://example.com/proof.jpg",
    "createdAt": "2023-11-15T10:30:00Z"
  }
]
Verify Deposit
Endpoint: PUT /api/admin/deposits/verify

Request Body:

json
{
  "depositId": "dep-456",
  "status": "verified",  // or "rejected"
  "adminNote": "Transaction confirmed"
}
Success Response:

json
{
  "message": "Deposit verified",
  "deposit": {
    "id": "dep-456",
    "status": "verified",
    "verifiedAt": "2023-11-15T10:35:00Z"
  }
}
Withdrawal Management
Get Withdrawals
Endpoint: GET /api/admin/withdrawals

Query Parameters:

?status=pending (optional filter)

?userId=user-123 (optional filter)

Success Response:

json
[
  {
    "id": "with-789",
    "amount": 200.00,
    "status": "pending",
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "userId": "user-123"
  }
]
Process Withdrawal
Endpoint: PUT /api/admin/withdrawals/process

Request Body:

json
{
  "withdrawalId": "with-789",
  "status": "completed",  // or "rejected"
  "txHash": "0x123...",  // required if completed
  "adminNote": "Transaction processed"
}
Success Response:

json
{
  "message": "Withdrawal completed",
  "withdrawal": {
    "id": "with-789",
    "status": "completed",
    "completedAt": "2023-11-15T11:00:00Z"
  }
}
VIP Management
Get VIP Levels
Endpoint: GET /api/admin/vip-levels

Success Response:

json
[
  {
    "level": 1,
    "name": "Silver",
    "profitPerOrder": 0.05,
    "minBalance": 1000.00
  }
]
Update User VIP Level
Endpoint: PUT /api/admin/users/vip

Request Body:

json
{
  "userId": "user-123",
  "level": 2
}
Success Response:

json
{
  "message": "VIP level updated",
  "user": {
    "id": "user-123",
    "vipLevel": 2
  }
}
Wallet Management
Get Admin Wallets
Endpoint: GET /api/admin/wallets

Success Response:

json
[
  {
    "id": "wallet-123",
    "currency": "BTC",
    "address": "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
    "network": "Mainnet",
    "isActive": true
  }
]
Add Admin Wallet
Endpoint: POST /api/admin/wallets

Request Body:

json
{
  "currency": "USDT",
  "address": "TXYZ1234567890",
  "network": "TRC20"
}
Success Response (201 Created):

json
{
  "message": "Wallet added successfully",
  "wallet": {
    "id": "wallet-456",
    "currency": "USDT",
    "address": "TXYZ1234567890",
    "network": "TRC20",
    "isActive": true
  }
}
Error Handling
All endpoints follow these error response formats:

Validation Error (400):

json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Currency and address are required",
  "statusCode": 400
}
Unauthorized (401):

json
{
  "success": false,
  "error": "AUTH_ERROR",
  "message": "Invalid credentials",
  "statusCode": 401
}
Not Found (404):

json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "User not found",
  "statusCode": 404
}
Server Error (500):

json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "Internal server error",
  "statusCode": 500
}




1. Admin Endpoints
Send Notification
POST /api/admin/notifications

Send a notification to a specific user or broadcast to all users.

Request Body:

For broadcast (all users):

json
{
  "title": "System Maintenance",
  "message": "We'll be performing maintenance tonight at 2AM UTC",
  "type": "warning"
}
For specific user:

json
{
  "userId": "user-id-here",
  "title": "Deposit Verified",
  "message": "Your deposit of $100 has been verified",
  "type": "success"
}
Fields:

title (required): Notification title

message (required): Notification content

type (optional): info (default), warning, success, or error

userId (optional): If provided, sends to a specific user. If omitted, broadcasts to all users.

Response:

json
{
  "message": "Broadcast notification sent to all users",
  "notification": {
    "id": "notification-id",
    "title": "System Maintenance",
    "message": "We'll be performing maintenance tonight at 2AM UTC",
    "type": "warning",
    "createdAt": "2023-07-20T12:00:00.000Z"
  }
}
Get All Notifications
GET /api/admin/notifications

Retrieve all notifications with optional filters.

Query Parameters:

userId: Filter by user ID

isRead: Filter by read status (true or false)

type: Filter by notification type (info, warning, success, error)

Example:

bash
GET /api/admin/notifications?userId=user123&isRead=false&type=warning
Response:

json
[
  {
    "id": "notification-id",
    "userId": "user123",
    "title": "Warning",
    "message": "Your account has low balance",
    "isRead": false,
    "type": "warning",
    "createdAt": "2023-07-20T12:00:00.000Z",
    "user": {
      "id": "user123",
      "username": "john_doe"
    }
  }
]
Delete Notification
DELETE /api/admin/notifications/:notificationId

Delete a notification (admin only).

Example:

bash
DELETE /api/admin/notifications/notif-12345
Response:

json
{
  "message": "Notification deleted successfully"
}
