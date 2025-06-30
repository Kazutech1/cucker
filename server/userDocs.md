Crypto Investment Platform API Documentation
Table of Contents
Authentication

User Profile

Deposits

Withdrawals

Earnings

VIP System

Admin

Authentication
Register New User
Endpoint: POST /api/auth/register

Request Body:

json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "username": "johndoe",
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123!",
  "referredBy": "REF123" // optional
}
Success Response (201):

json
{
  "message": "User created successfully",
  "user": {
    "id": "user-123",
    "username": "johndoe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "referralCode": "ABC123XYZ",
    "vipLevel": 0
  }
}
Login
Endpoint: POST /api/auth/login

Request Body:

json
{
  "login": "user@example.com", // Can be email, username or phone
  "password": "SecurePassword123!"
}
Success Response:

json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "balance": 500.00,
    "profitBalance": 250.00,
    "vipLevel": 1,
    "role": "user"
  }
}
User Profile
Get Profile
Endpoint: GET /api/auth/profile

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "message": "Profile retrieved successfully",
  "user": {
    "username": "johndoe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "balance": 500.00,
    "referralCode": "ABC123XYZ",
    "vipLevel": {
      "level": 1,
      "name": "Silver",
      "profitPerOrder": 0.05
    },
    "totalInvested": 1000.00
  }
}
Update Profile
Endpoint: PATCH /api/auth/profile

Headers:

text
Authorization: Bearer <token>
Request Body:

json
{
  "fullName": "John Updated", // optional
  "phoneNumber": "+9876543210" // optional
}
Success Response:

json
{
  "message": "Profile updated successfully",
  "user": {
    "username": "johndoe",
    "email": "user@example.com",
    "fullName": "John Updated",
    "phoneNumber": "+9876543210"
  }
}
Deposits
Get Deposit Info
Endpoint: GET /api/deposit/info

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "depositWallets": [
    {
      "currency": "BTC",
      "address": "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
      "network": "Mainnet"
    }
  ],
  "minDeposit": 10
}
Submit Deposit Proof
Endpoint: POST /api/deposit/submit

Headers:

text
Authorization: Bearer <token>
Content-Type: multipart/form-data
Form Data:

amount (number): Deposit amount

currency (string): BTC, USDT, etc.

txHash (string, optional): Transaction hash

proofImage (file, optional): Screenshot of transaction

Success Response:

json
{
  "message": "Deposit submitted for verification",
  "depositId": "dep-123",
  "status": "pending"
}
Withdrawals
Set Withdrawal Address
Endpoint: POST /api/withdrawal/address

Headers:

text
Authorization: Bearer <token>
Request Body:

json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
Success Response:

json
{
  "message": "Withdrawal address set successfully",
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
Get Withdrawal Info
Endpoint: GET /api/withdrawal/info

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "profitBalance": 250.00,
  "withdrawalAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "minWithdrawal": 10
}
Request Withdrawal
Endpoint: POST /api/withdrawal/request

Headers:

text
Authorization: Bearer <token>
Request Body:

json
{
  "amount": 100.00
}
Success Response:

json
{
  "message": "Withdrawal request submitted",
  "withdrawalId": "with-123",
  "amount": 100.00,
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "newProfitBalance": 150.00
}
Earnings
Calculate Daily Profit
Endpoint: GET /api/earnings/daily

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "message": "Daily profit calculated",
  "vipLevel": 1,
  "dailyProfit": 2.50,
  "newProfitBalance": 252.50,
  "nextAvailable": "2023-11-16T10:30:00Z"
}
VIP System
Get All VIP Levels
Endpoint: GET /api/vip/levels

Success Response:

json
[
  {
    "level": 0,
    "name": "Bronze",
    "profitPerOrder": 0.03,
    "minBalance": 0
  },
  {
    "level": 1,
    "name": "Silver",
    "profitPerOrder": 0.05,
    "minBalance": 50
  }
]
Get User VIP Level
Endpoint: GET /api/vip/my-level

Headers:

text
Authorization: Bearer <token>
Success Response:

json
{
  "currentLevel": {
    "level": 1,
    "name": "Silver",
    "profitPerOrder": 0.05,
    "minBalance": 50
  },
  "nextLevel": {
    "level": 2,
    "name": "Gold",
    "profitPerOrder": 0.07,
    "minBalance": 200
  },
  "progressPercentage": 25
}
Admin
See separate Admin API Documentation

Error Responses
All endpoints return consistent error formats:

400 Bad Request:

json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Phone number already exists",
  "statusCode": 400
}
401 Unauthorized:

json
{
  "success": false,
  "error": "AUTH_ERROR",
  "message": "Invalid credentials",
  "statusCode": 401
}
500 Server Error:

json
{
  "success": false,
  "error": "SERVER_ERROR",
  "message": "Internal server error",
  "statusCode": 500
}





Authentication
All endpoints except /auth/register, /auth/login, and /vip/levels require:

