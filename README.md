# Authentication System Using MERN Stack

This project is a full-fledged authentication system built using the MERN stack (MongoDB, Express, React, Node.js). It handles user information such as name, username, email, photo, account type (Google, local), encrypted password, created and updated timestamps, verification status, and account status (active, inactive).

## Features

- Local authentication
- Google OAuth authentication
- Email verification
- User status management
- JWT-based authentication

## Steps to Use

### 1. Clone the Repository

```bash
git clone https://github.com/kuldeepvarma7413/Authentication-using-MERN.git
```
### 2. Create a .env File in the Server Directory
Add the following variables to the .env file:

```bash
NODE_ENV = development # or production
PORT = 3001 # (node) backend port
ATLAS_URI = # add MongoDB URL containing database name (***.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority)
JWT_SECRET = # any JWT secret key to create secure auth token
CLIENT_URL = # frontend (react) URL (http://localhost:5173)

# email
EMAIL_PASS = # **** **** **** **** (your app password generated in App Passwords)
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = # your email address through which emails will be sent
EMAIL_SERVICE = gmail
EMAIL_SECURE = true

# google authentication
GOOGLE_CLIENT_ID = # your google client ID
GOOGLE_CLIENT_SECRET = # your client secret
GOOGLE_REDIRECT_URI = BACKEND_URL/api/auth/google # (replace BACKEND_URL with your server URL)
```

### 3. Create App Password to Send Emails

1. Go to https://myaccount.google.com/apppasswords
2. Add app name and create.
3. Copy the password and replace EMAIL_PASS in .env
4. Replace EMAIL_USER with the email you created the App Password for.


### 4. Google Authentication

1. Go to https://console.cloud.google.com/apis/dashboard
2. Go to Credentials.
3. Create Credentials (OAuth client ID).
4. Select application type (web application), add app name.
5. Add Frontend URL (http://localhost:5173) in "Authorized JavaScript origins".
6. Add BACKEND_URL/api/auth/google in Authorized redirect URIs (http://localhost:3001/api/auth/google) and save.
7. Copy and replace Client ID and Client Secret in .env


### 5. Install and Run the Client

```bash
cd client
npm i
npm run dev
```

### 6. Install and Run the Server

```bash
cd server
npm i
npm start
```

All Done!
Your authentication system should now be running. You can access the client at http://localhost:5173 and the server at http://localhost:3001
