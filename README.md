# **Tracking Link Clicks System**

## **Overview**
This project is a **full-stack** application designed to track link clicks from **HTML pages and emails**. It includes:
- A **backend** built with **NestJS & MongoDB** for processing URLs, tracking analytics, and handling redirections.
- A **frontend** built with **Next.js** for shortening URLs, processing HTML, and viewing analytics.

## **Features**
✅ **Shorten URLs** – Generates unique trackable links.
✅ **Process HTML** – Replaces links in HTML content with shortened links.
✅ **Track Analytics** – Logs user clicks, IP, device, and referrer.
✅ **Secure & Scalable** – Uses Redis caching, MongoDB indexing, and rate limiting.
✅ **API Documentation** – Provides Swagger-based API endpoints.

---
## **Backend Setup (NestJS)**

### **Prerequisites**
- **Node.js v18+**
- **MongoDB**
- **Redis** (Optional but recommended for caching)
- **Docker** (For containerized setup)

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo.git
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file based on `.env.example` and configure:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/link-tracker
   JWT_SECRET=your-secret-key
   REDIS_HOST=localhost
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```

### **Running with Docker**
```bash
docker-compose up -d
```

### **API Documentation**
Once the server is running, access **Swagger API Docs**:
- **http://localhost:5000/api-docs**

---
## **Frontend Setup (Next.js)**

### **Prerequisites**
- **Node.js v18+**

### **Installation**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### **Frontend Features**
- **Shorten URLs** via a simple form.
- **Process HTML** to replace links.
- **View Analytics** on clicks and user interactions.

---
## **System Architecture**

### **1. Backend Components**
| Service                  | Description |
|--------------------------|-------------|
| `HtmlProcessorService.ts` | Extracts links and replaces them with shortened URLs. |
| `UrlShortenerService.ts` | Generates and manages short URLs. |
| `RedirectionService.ts` | Handles user redirections and logs analytics. |
| `AnalyticsRepository.ts` | Stores and retrieves click data. |
| `AuthMiddleware.ts` | Secures routes with JWT authentication. |

### **2. Database Models**
- **`Url.ts`** – Stores URL mappings (`originalUrl`, `shortId`, `clicks`).
- **`ClickEvent.ts`** – Logs click events (`urlId`, `timestamp`, `ipAddress`, `browser`).

### **3. Frontend Structure**
| Component | Description |
|-----------|-------------|
| `page.tsx` | Main page for shortening URLs. |
| `html-processor.tsx` | Page for processing HTML content. |
| `analytics.tsx` | Displays analytics data. |

---
## **Testing**
Run unit tests using:
```bash
npm run test
```

For API testing, use **Postman** or:
```bash
curl -X POST http://localhost:5000/api/v1/urls -H "Content-Type: application/json" -d '{"originalUrl":"https://example.com"}'
```

---
## **Next Steps**
✅ **Improve UI for analytics visualization.**  
✅ **Enhance caching mechanisms for better performance.**  
✅ **Implement role-based access control for security.**  

Feel free to reach out for any questions! 🚀

