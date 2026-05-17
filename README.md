# 🦷 Interactive Denture Movement Learning Web Application – Khon Kaen University  

แพลตฟอร์มการเรียนรู้ออนไลน์สำหรับการสอนเรื่อง **การเคลื่อนที่ของฟันเทียม** ผ่านสื่อ 3D แอนิเมชัน, 3D โมเดล, AR (Augmented Reality) และแบบทดสอบออนไลน์ รองรับสองบทบาท ได้แก่ นักศึกษาและอาจารย์

---

## 📋 สารบัญ

- [ภาพรวมของระบบ](#ภาพรวมของระบบ)
- [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
- [การติดตั้งและรัน](#การติดตั้งและรัน)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)

---

## ภาพรวมของระบบ

ระบบนี้พัฒนาขึ้นเพื่อช่วยให้นักศึกษาทันตแพทย์เข้าใจหลักการทำงานของฟันเทียมแบบถอดได้ โดยใช้สื่อการสอนแบบอินเทอร์แอคทีฟ ได้แก่:

- **3D แอนิเมชัน** แสดงการเคลื่อนที่ของฟันเทียมในรูปแบบต่าง ๆ
- **3D โมเดล** จำลอง Kennedy Classification ทั้ง 3 ประเภท
- **AR (Augmented Reality)** ดูโมเดล 3D ผ่านกล้องในโลกจริง
- **แอนิเมชัน 2D** อธิบาย Mechanical Force และ Lever Class ต่าง ๆ

---

## ฟีเจอร์หลัก

### 👩‍🎓 นักศึกษา (Student)

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| ดูสื่อ 3D แอนิเมชัน | 9 วิดีโอ ครอบคลุมการเคลื่อนที่ 4 แกน |
| ดู 3D โมเดล | 9 โมเดล Kennedy Classification I–III |
| ดูสื่อ AR | 9 โมเดล ผ่านกล้องสมาร์ทโฟน/แท็บเล็ต |
| ดูแอนิเมชัน 2D | 9 วิดีโอ (Mechanical Force 6 + Lever 3) |
| ค้นหาสื่อการสอน | ค้นหาตามชื่อหรือหมวดหมู่ |
| เขียนเลกเชอร์บนสื่อ | Annotation บนหน้าสื่อ |
| บุ๊กมาร์ก | บันทึกสื่อที่สนใจ |
| ประวัติการเลกเชอร์ | ดูย้อนหลังการจดบันทึก |
| ทำแบบทดสอบ | ทดสอบความเข้าใจ |
| ดูคะแนนแบบทดสอบ | ตรวจสอบผลคะแนน |
| แชท | สื่อสารกับอาจารย์หรือเพื่อน |
| การแจ้งเตือน | รับการแจ้งเตือนต่าง ๆ |

### 👨‍🏫 อาจารย์ (Instructor)

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| ดูสื่อการสอนทั้งหมด | เหมือนกับสิทธิ์นักศึกษา |
| จัดการสื่อการสอน | เพิ่ม / แก้ไข / ลบสื่อการสอน |
| ดูแดชบอร์ด | ภาพรวมสถิติการใช้งานของนักศึกษา |
| แชท | สื่อสารกับนักศึกษา |
| การแจ้งเตือน | รับและส่งการแจ้งเตือน |

---

## เทคโนโลยีที่ใช้

### Frontend

| หมวด | Library / Framework |
|------|---------------------|
| Framework | React 18, Vite 5 |
| Styling | Tailwind CSS 3, Chakra UI 3, Bootstrap 5 |
| 3D / AR | Three.js, @react-three/fiber, AR.js, @artcom/react-three-arjs |
| State Management | Redux Toolkit, React Redux |
| Routing | React Router DOM v6 |
| Realtime | Socket.IO Client |
| PDF | @react-pdf-viewer/core, @react-pdf/renderer, pdfjs-dist |
| Animation | Framer Motion |
| Canvas / Drawing | Fabric.js, html2canvas |
| Auth | @react-oauth/google, JWT Decode |
| HTTP | Axios |
| UI Utilities | React Toastify, SweetAlert2, Swiper, React Icons |

### Backend

| หมวด | Library / Framework |
|------|---------------------|
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Realtime | Socket.IO 4 |
| Auth | JWT, bcrypt, Passport.js (Google OAuth2) |
| File Upload | Multer |
| Scheduler | node-cron |
| 3D Processing | gltf-pipeline |
| Spreadsheet Export | ExcelJS, xlsx |
| HTTP | Axios |

---

## ข้อกำหนดเบื้องต้น

- **Node.js** `>= 20.x`
- **npm** `>= 9.x`
- **MongoDB** (local หรือ MongoDB Atlas)
- บัญชี **Google Cloud Console** (สำหรับ Google OAuth)
---

## การติดตั้งและรัน

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd project
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ใน folder `backend/` (ดูตัวอย่างที่ [Environment Variables](#environment-variables))

```bash
npm start
# หรือใช้ nodemon สำหรับ development
npx nodemon server.js
```

Backend จะรันที่ `http://localhost:8080` (หรือ port ที่กำหนดใน .env)

### 3. ติดตั้ง Frontend

```bash
cd ../frontend
npm install
```

สร้างไฟล์ `.env` ใน folder `frontend/`

```bash
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

### 4. Build สำหรับ Production

```bash
cd frontend
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ใน `frontend/dist/`

---

## Environment Variables

### `backend/.env`

```env
PORT=8080
MONGODB_URI=your_mongodb_id

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

SESSION_SECRET=your_session_secret

CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_APP_NOTIFICATION_API_URL=http://localhost:8080/api/notifications
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## API Routes
 
### Auth (`/auth`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/auth/register` | ลงทะเบียนผู้ใช้ใหม่ |
| POST | `/auth/login` | เข้าสู่ระบบ (Passport local) |
| GET | `/auth/logout` | ออกจากระบบ |
| GET | `/auth/google` | เริ่มต้น Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/user` | ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่ (🔒) |
| POST | `/auth/addUser` | เพิ่มผู้ใช้ใหม่ (🔒) |
| POST | `/auth/uploadStudent` | อัปโหลดข้อมูลนักศึกษาเป็นไฟล์ |
| GET | `/auth/students` | ดึงนักศึกษาทั้งหมด |
| GET | `/auth/teachers` | ดึงอาจารย์ทั้งหมด |
| PUT | `/auth/students/softDelete/:studentId` | Soft delete นักศึกษา |
| PUT | `/auth/teachers/softDelete/:teacherId` | Soft delete อาจารย์ |
| PUT | `/auth/students/restore` | กู้คืนนักศึกษา |
| PUT | `/auth/students/restoreMultiple` | กู้คืนนักศึกษาหลายรายการ |
| PUT | `/auth/teachers/restoreMultiple` | กู้คืนอาจารย์หลายรายการ |
| DELETE | `/auth/students/delete-multiple` | ลบนักศึกษาหลายรายการ (🔒) |
| DELETE | `/auth/teachers/delete-multiple` | ลบอาจารย์หลายรายการ (🔒) |
| DELETE | `/auth/students/delete/:studentId` | ลบนักศึกษา (🔒) |
| DELETE | `/auth/teachers/delete/:teacherId` | ลบอาจารย์ (🔒) |
 
### User (`/user`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/user/login` | เข้าสู่ระบบ |
| GET | `/user/find/:userId` | ค้นหาผู้ใช้ตาม ID |
| GET | `/user/` | ดึงผู้ใช้ทั้งหมด |
| GET | `/user/students` | ดึงนักศึกษาทั้งหมด |
| POST | `/user/addTeacher` | เพิ่มอาจารย์ |
| POST | `/user/addStudent` | เพิ่มนักศึกษา |
| PUT | `/user/updateProfile` | อัปเดตโปรไฟล์ (🔒) |
| GET | `/user/:userId` | ดึงข้อมูลผู้ใช้ตาม ID |
 
### 3D Animation (`/animation3d`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/animation3d/uploadAnimation` | อัปโหลด 3D แอนิเมชัน |
| GET | `/animation3d/animations` | ดึง 3D แอนิเมชันทั้งหมด |
| GET | `/animation3d/animation/:id` | ดึง 3D แอนิเมชันตาม ID |
| PUT | `/animation3d/update/:id` | แก้ไข 3D แอนิเมชัน |
| DELETE | `/animation3d/delete/:id` | ลบ 3D แอนิเมชัน |
 
### Animation 2D (`/animation`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/animation/getAnimation` | ดึงแอนิเมชันทั้งหมด |
| GET | `/animation/getAnimationById/:_id` | ดึงแอนิเมชันตาม ID |
| POST | `/animation/saveAnimation` | อัปโหลดแอนิเมชันใหม่ (multipart) |
| PUT | `/animation/updateAnimation/:_id` | แก้ไขแอนิเมชัน (multipart) |
| DELETE | `/animation/deleteAnimation/:_id` | ลบแอนิเมชัน |
 
### 3D Model & AR (`/model3d`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/model3d/model3d` | สร้างโมเดล 3D ใหม่ (multipart) |
| GET | `/model3d/` | ดึงโมเดลทั้งหมด |
| GET | `/model3d/:id` | ดึงโมเดลตาม ID |
| POST | `/model3d/getByIds` | ดึงโมเดลหลายรายการตาม ID |
| GET | `/model3d/marker-image/:filename` | ดึงรูป marker สำหรับ AR |
| PUT | `/model3d/:id` | แก้ไขโมเดล (multipart) |
| DELETE | `/model3d/:id` | ลบโมเดล |
 
### Quiz (`/quiz`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/quiz/addQuiz` | สร้างแบบทดสอบใหม่ |
| GET | `/quiz/` | ดึงแบบทดสอบทั้งหมด |
| GET | `/quiz/:id` | ดึงแบบทดสอบตาม ID |
| PUT | `/quiz/:id` | แก้ไขแบบทดสอบ |
| DELETE | `/quiz/:id` | ลบแบบทดสอบ |
| GET | `/quiz/:quizId/questions` | ดึงคำถามทั้งหมดในแบบทดสอบ |
| GET | `/quiz/:quizId/questions/:questionId` | ดึงคำถามตาม ID |
| POST | `/quiz/:quizId/questions` | เพิ่มคำถามในแบบทดสอบ |
| PUT | `/quiz/:quizId/questions/:questionId` | แก้ไขคำถาม |
| DELETE | `/quiz/:quizId/questions/:questionId` | ลบคำถาม |
| POST | `/quiz/submitResult` | ส่งคำตอบแบบทดสอบ |
| GET | `/quiz/results/:studentId` | ดึงผลคะแนนของนักศึกษา |
 
### Result (`/result`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/result/submitResult` | บันทึกคะแนน |
| GET | `/result/results/:quizId` | ดึงผลคะแนนตาม Quiz ID |
 
### Bookmark (`/bookmark`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/bookmark/:userId` | ดึงบุ๊กมาร์กของผู้ใช้ |
| POST | `/bookmark/` | เพิ่ม / อัปเดตบุ๊กมาร์ก |
| DELETE | `/bookmark/remove-bookmark` | ลบบุ๊กมาร์ก |
 
### Lecture (`/lecture`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/lecture/` | บันทึกเลกเชอร์ใหม่ |
| GET | `/lecture/:userLectureID` | ดึงเลกเชอร์ของผู้ใช้ |
| DELETE | `/lecture/lectures/:id` | ลบเลกเชอร์ |
 
### Chat (`/chat`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/chat/` | สร้างห้องแชทใหม่ |
| GET | `/chat/:userId` | ดึงห้องแชทของผู้ใช้ |
| GET | `/chat/find/:userId/:secondId` | ค้นหาห้องแชทระหว่างผู้ใช้ 2 คน |
 
### Message (`/message`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/message/` | ส่งข้อความใหม่ |
| GET | `/message/:chatId` | ดึงข้อความในห้องแชท |
| PATCH | `/message/read/:senderId` | มาร์กข้อความว่าอ่านแล้ว |
| GET | `/message/notifications/unread/:recipientId` | ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน |
| PATCH | `/message/notifications/read/:recipientId` | มาร์กแจ้งเตือนว่าอ่านแล้ว |
| PUT | `/message/notifications/userRead/:senderId` | อัปเดตสถานะการอ่านของผู้ส่ง |
| DELETE | `/message/notifications/DeleteUserRead/:recipientId` | ลบแจ้งเตือนที่อ่านแล้ว |
 
### Notification (`/notification`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/notification/user` | ดึงการแจ้งเตือนของผู้ใช้ที่ล็อกอินอยู่ (🔒) |
| PUT | `/notification/mark-read` | มาร์กแจ้งเตือนว่าอ่านแล้ว (🔒) |
| DELETE | `/notification/:notificationId` | ลบการแจ้งเตือน |
| DELETE | `/notification/user/:userId` | ลบแจ้งเตือนทั้งหมดของผู้ใช้ |
| DELETE | `/notification/quiz/:quizId` | ลบแจ้งเตือนที่เกี่ยวข้องกับ Quiz |
 
### Chat Notification (`/notiChat`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/notiChat/notifications/:userId` | ดึงการแจ้งเตือนแชทของผู้ใช้ |
 
### Recent Activity (`/recent`)
 
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| GET | `/recent/:userId` | ดึง 5 กิจกรรมล่าสุดของผู้ใช้ |
| POST | `/recent/` | บันทึกกิจกรรมของผู้ใช้ |
 
> 🔒 = ต้องแนบ JWT Token ใน Authorization header

---

## สื่อการสอนที่รองรับ

### 3D แอนิเมชัน (9 วิดีโอ)

การเคลื่อนที่ 4 รูปแบบ:
1. การเคลื่อนที่หลุดออกในแนวดิ่ง / แนวทางการถอดใส่
2. หมุนรอบแกนหมุน (Fulcrum)
3. การหมุนรอบแกนนอน
4. การหมุนรอบแกนตั้งสมมุติ

### 3D โมเดล & AR (9 โมเดล)

- Kennedy Classification I — 3 โมเดล
- Kennedy Classification II — 2 โมเดล
- Kennedy Classification III — 4 โมเดล

### แอนิเมชัน 2D (9 วิดีโอ)

**Mechanical Force (6 วิดีโอ):** Lever, Wedge, Screw, Wheel, Pulley, Inclined Plane

**Lever Class (3 วิดีโอ):** Class One, Class Two, Class Three

---

## ประโยชน์ที่คาดว่าจะได้รับ

1. ช่วยให้นักศึกษาเข้าใจและได้เรียนรู้ เรื่องการเคลื่อนที่ของฟันเทียม ผ่านสื่อการสอน และสื่อการสอนในรูปแบบแอนนิเมชัน 3D และ AR
2. ช่วยอาจารย์ ในการสอน และ การอธิบาย เรื่องการเคลื่อนที่ของฟันเทียม
3. ช่วยให้นักศึกษาได้ทบทวนเนื้อหาความรู้และทดสอบความเข้าใจได้ตลอดเวลา

---

> พัฒนาโดยนักศึกษา คณะวิทยาลัยการคอมพิวเตอร์ สาขาเทคโนโลยีสารสนเทศ มหาวิทยาลัยขอนแก่น
