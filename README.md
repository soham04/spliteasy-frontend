# 📱 BillSplit Frontend (React Native + Expo)

This is the **mobile frontend** for the BillSplit application — a group expense sharing app.  
The backend is built with **Spring Boot** and lives in a separate repository: [BillSplit Backend](https://github.com/soham04/billsplit).

---

## 🚀 Features

- **Authentication** (JWT-based, Google Sign-In integration)  
- **Expense management**: Add, edit, delete, and view expenses  
- **Groups**: Create and manage groups with members  
- **Friends system**: Add, remove, and manage friends + friend requests  
- **Activity feed**: Track all expense activity with filtering and search  
- **Profile management**: Update profile, change password, manage notifications  
- **Secure storage** of JWT using `expo-secure-store`  
- **Auto-logout** when JWT is expired or unauthorized  

---

## 🛠️ Tech Stack

- [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))  
- [NativeWind](https://www.nativewind.dev/) for styling (Tailwind in RN)  
- [React Navigation](https://reactnavigation.org/) + [Expo Router](https://expo.github.io/router/)  
- [Zustand](https://github.com/pmndrs/zustand) for global state  
- [React Native Paper](https://callstack.github.io/react-native-paper/) for UI components  
- [Lucide Icons](https://lucide.dev/) for vector icons  
- Secure storage via `expo-secure-store`  
- API communication with `fetch` (JWT attached automatically)  

---

## 📂 Project Structure
```

app/

_layout.tsx  # Root layout, handles auth redirects

index.tsx  # Welcome / login screen

(tabs)/  # Main navigation (profile, activity, add expense, etc.)

expense-detail/  # Expense detail screens

group-detail/  # Group detail screens

create-group/  # Group creation

hooks/

Auth.ts  # Zustand auth store

api/

axios.ts # Axios instance with JWT + interceptors

auth/

logout.ts  # Global logout utility

global.css # Tailwind styles

```
---

## ⚙️ Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/soham04/billsplit-frontend.git
cd billsplit-frontend
```

### **2. Install dependencies**

```
npm install
# or
yarn install
```

### **3. Setup environment variables**

  

Create a .env file at the root:

```
API_URL=http://localhost:8080    # Spring Boot backend
GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

Load them with react-native-config.

  

### **4. Run the app**

  

Start Metro bundler:

```
npm start
```

Run on iOS:

```
npm run ios
```

Run on Android:

```
npm run android
```

----------

## **🔑 Authentication**

-   Uses JWT stored securely in expo-secure-store.
    
-   On login, JWT is saved; on logout it is cleared.
    
-   **Auto logout** occurs if an API call returns 401 Unauthorized.
    
-   RootLayout checks for token on app launch and redirects to (tabs) or index.
    

----------

## **🌐 Backend**

  

This project requires the [BillSplit Backend](https://github.com/soham04/billsplit) running locally or remotely.

  

### **Backend quick start:**

```
cd billsplit-backend
./mvnw spring-boot:run
```

The backend runs on http://localhost:8080 by default.

----------

## **📸 Screens**

-   **Welcome/Login** → Authenticate via Google or email/password
    
-   **Add Expense** → Add group/individual expenses, split equally or by shares
    
-   **Activity Feed** → View all transactions and settlements
    
-   **Expense Detail** → Drill down into expense info (payer, participants, notes, attachments)
    
-   **Profile** → Manage account, notifications, and logout
    

----------

## **🧪 Testing**

  

For backend API testing:

-   Swagger UI is available at: http://localhost:8080/swagger-ui.html
    
-   You can use Postman collections (see backend repo).
    

  

For frontend testing:

-   Use Expo Go app on device or iOS Simulator / Android Emulator.
    

----------

## **🤝 Contributing**

1.  Fork this repo
    
2.  Create a feature branch (git checkout -b feature/awesome-feature)
    
3.  Commit your changes (git commit -m "feat: add awesome feature")
    
4.  Push to branch (git push origin feature/awesome-feature)
    
5.  Create a Pull Request
    
