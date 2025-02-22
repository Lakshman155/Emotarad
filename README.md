### **📌 Overview**
This project implements an **Identity Reconciliation Service** using **Node.js, Express, and MongoDB**. It manages user contact information by identifying **primary and secondary contacts** and linking related records.

---

## **🛠️ Tech Stack**
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (MongoDB Atlas)  
- **ORM**: Mongoose  
- **Testing**: Jest, Supertest, MongoMemoryServer  

---

## **📦 Installation & Setup**
### **1️⃣ Clone the Repository**
Clone the repository first.

### **2️⃣ Install Dependencies**
After cloning run the given commant to install necessary dependecies.
```sh
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file and configure your **MongoDB Atlas** connection:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
or use mine
MONGO_URI="mongodb+srv://lakshman:lakshman@cluster0.zmioray.mongodb.net/"
PORT=5000
```

### **4️⃣ Start the Server**
Run the following command to start the server.
```sh
npm start
```
---

## **📡 API Endpoints**
### **1️⃣ Identify Contact (`POST /identify`)**
- **Description**: Identifies contacts and links them as primary or secondary.  
- **URL**: `http://localhost:5000/identify`  
- **Method**: `POST`  
- **Request Body (JSON)**:
  ```json
  {
    "email": "john@example.com",
    "phone": "+1234567890"
  }
  ```
- **Response (JSON)**:
  ```json
  {
    "primaryContactId": "650a5a1a0b1c6e1a44b4a",
    "emails": ["john@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": []
  }
  ```

---

## **✅ Running Tests**
We use **Jest and Supertest** for testing.
### **Run All Tests**
```sh
npm test
```

---
