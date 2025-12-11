# 🏸 Sports Court Booking System (MERN Stack)

A modern, responsive, and feature-rich **Sports Court Booking Web Application** built using the **MERN stack**.  
This platform allows users to **book courts**, hire coaches, rent equipment, manage bookings, and make **simulated payments** with a beautiful UI.

---

## 🚀 Demo (Screenshots)
> *(Add screenshots here once pushed to GitHub)*  
Example placeholders:

- Courts Page  
- View Slots Page  
- Booking (Quick Book) Page  
- Payment UI  
- My Bookings Page  
- Profile & Settings  

---

# ✨ Features

## 👤 Authentication
- User Registration & Login  
- Admin access capability  
- JWT-based secure authentication  
- Profile dropdown (Name, Email, Logout)  

---

## 🎾 Court Booking System
- View available courts  
- Court details (image, rating, dimensions, type, price)  
- Dynamic available slots  
- Equipment selection (auto-price calculation)  
- Optional coach selection  
- Real-time price preview  
- Rules-based pricing (e.g., evening peak multiplier)

---

## 💳 Payment System (Simulated UI)
- UPI Apps (Google Pay, PhonePe, Paytm)  
- Credit / Debit card form  
- NetBanking  
- Wallets  
- “Skip for now” option (auto-booking)  
- Responsive and beautiful animations  

---

## 📄 Booking Management
- My Bookings page  
- Court image + details in booking history  
- Downloadable PDF receipt  
- Cancel booking  
- Pricing breakdown stored in DB  

---

## 🧰 Admin Features
- Add courts  
- Add equipment  
- Add coaches  
- Add pricing rules  
- Manage all bookings  

---

# 🛠️ Tech Stack

### **Frontend**
- React.js  
- React Router  
- TailwindCSS  
- Axios  
- Context API Authentication  
- Responsive UI for all devices  

### **Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT Authentication  
- Pricing Engine  
- Transaction-based booking creation  

---

# 📁 Folder Structure

```
sports-booking/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

# 🔧 Installation & Setup

## 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/sports-booking.git
cd sports-booking
```

---

# 📝 Backend Setup

### Navigate to backend:
```bash
cd backend
```

### Install dependencies:
```bash
npm install
```

### Create `.env` file:
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=yourSecretKeyHere
PORT=5000
```

### Start backend:
```bash
npm run dev
```

Backend runs at:
```
http://localhost:5000
```

---

# 🎨 Frontend Setup

### Navigate to frontend:
```bash
cd frontend
```

### Install dependencies:
```bash
npm install
```

### Start frontend:
```bash
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

# 🔌 API Endpoints (Simplified)

### **Auth**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

### **Courts**
| GET | `/public/courts` | Get all courts |
| GET | `/public/courts/:id` | Get single court |

### **Booking**
| GET | `/bookings/price` | Price preview |
| POST | `/bookings` | Create booking |
| GET | `/bookings/user/:id` | Get user's bookings |
| DELETE | `/bookings/:id` | Cancel booking |

---

# 📦 Build for Production

### Frontend:
```bash
npm run build
```

### Backend:
Deploy on:
- Render
- Railway
- AWS EC2
- Docker
- VPS

---

# 🙌 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you'd like to modify.

---

# 👨‍💻 Author

**Gokul P**  
🔗 LinkedIn: https://www.linkedin.com/in/gokulp-/  
🐙 GitHub: https://github.com/Gokul9379  

---

# ⭐ Show Your Support

If this project helped you, **please give the repo a star** ⭐ on GitHub!  
It motivates me to improve and add more features.

