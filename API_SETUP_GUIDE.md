# 🔑 API Setup Guide for Peer Learning Platform

To fully enable the integrated features, you need to obtain API keys from the following services. Most of these have generous free tiers.

---

### 1. 🧠 AI Study Assistant (Google Gemini)
The platform uses Gemini for explaining concepts, solving math problems, and multimodal (image) analysis.

*   **How to get it:**
    1.  Go to [Google AI Studio](https://aistudio.google.com/).
    2.  Sign in with your Google account.
    3.  Click on **"Get API key"** in the sidebar.
    4.  Create a new API key in a Google Cloud project.
*   **Env Variable:** `GOOGLE_AI_API_KEY`

---

### 2. 📹 Live Video Classes (Daily.co)
Powers the real-time video and audio in the Virtual Classroom.

*   **How to get it:**
    1.  Sign up at [Daily.co](https://www.daily.co/).
    2.  Go to your **Dashboard**.
    3.  Click on **"Developers"** in the sidebar to find your **API Key**.
    4.  (Optional) Create a Room manually or use the API to generate dynamic rooms.
*   **Env Variable:** `DAILY_API_KEY` (used for server-side room creation)

---

### 3. 💳 Sri Lankan Payments (PayHere)
Handles LKR payments for study materials and tutoring sessions.

*   **How to get it:**
    1.  Register at [PayHere.lk](https://www.payhere.lk/).
    2.  Complete the verification process for your business/individual account.
    3.  In the **Merchant Dashboard**, go to **Settings > Domains & Credentials**.
    4.  Get your **Merchant ID** and **Secret Key**.
*   **Env Variable:** `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`

---

### 4. 🖼️ Image & PDF Storage (Cloudinary)
Used for storing tutor certificates, profile pictures, and study materials.

*   **How to get it:**
    1.  Sign up at [Cloudinary](https://cloudinary.com/).
    2.  Go to your **Dashboard**.
    3.  Copy the **Cloud Name**, **API Key**, and **API Secret**.
*   **Env Variable:** `CLOUDINARY_URL` (format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`)

---

### 🚀 Implementation Status
- [x] **Gemini API**: Integrated in `backend/services/AIHomeworkAssistant.js`.
- [x] **Daily.co**: Integrated in `frontend/src/views/VirtualClassroom.jsx`.
- [x] **Excalidraw**: Integrated (Open Source, No Key Required).
- [ ] **PayHere**: Placeholder logic added in `MaterialsLibrary.jsx`.

> [!TIP]
> Add these keys to your `.env` file in the `backend/` directory and restart the server to activate the features.
