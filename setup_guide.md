# 🏁 PeerLearn | Manual Setup & Quick-Start Guide

Follow this guide to get all PeerLearn components (Backend, Web, and Mobile) running on your local machine.

---

## 🛠️ Step 1: Database Setup
PeerLearn requires **MongoDB**. 
- **Option A (Local)**: Ensure MongoDB is running at `mongodb://localhost:27017`.
- **Option B (Cloud)**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and get your `SRV` connection string.

---

## ⚙️ Step 2: Backend Configuration
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file and paste the following:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/peerlearn
   JWT_SECRET=your_super_secret_key_123
   NODE_ENV=development

   # (Optional) For real email/sms in production
   EMAIL_USER=
   EMAIL_PASS=
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

---

## 🌐 Step 3: Frontend Web Configuration
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Create or update the `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

---

## 📱 Step 4: Mobile App (Expo) Setup
1. Navigate to the mobile folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Connectivity Note**: To connect to the backend from your mobile device:
   - Open `src/services/api.ts`.
   - Update `DEFAULT_IP` with your computer's local IP address (e.g., `192.168.1.10`).
4. Start the app:
   ```bash
   npx expo start
   ```

---

## 💡 Pro-Tip: Testing the Signup Flow
I've enabled **Development OTP Mode** so you don't need to check your email during testing:

1. Go to the **Signup** page on the Web or Mobile app.
2. Enter your details and click **Continue**.
3. On the OTP verification screen, the valid code will **appear as a blue hint** (Web) or **blue banner** (Mobile).
4. Simply type that code in to verify your account instantly!

---

## 🛣️ Standard Routes
- **Landing Page**: `http://localhost:5173/`
- **Login**: `http://localhost:5173/login`
- **Signup**: `http://localhost:5173/signup`
- **API Docs (Swagger)**: `http://localhost:5001/api-docs`

*Happy Learning! 🎓*
