# 🎬 MyFlix Movie API

MyFlix API is the server-side backbone of the myFlix movie application. Built with Node.js and Express, it provides a RESTful interface for managing movie data, user profiles, and favorites. It interacts with a MongoDB database and supports secure authentication and authorization.

# 🚀 Features
📚 Retrieve a list of all movies

🎞️ Get details about a movie by title

🎭 Get genre information

🎬 Get director information

👤 Register new users

🔐 Log in with basic HTTP or JWT authentication

✏️ Update user profile information

❤️ Add or remove movies from a user's favorite list

🧾 Delete user accounts

# 🛠️ Technologies Used

| Category | Stack |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | Basic HTTP & JWT |
| Architecture | REST |
| Deployment | Heroku |

# 📦 Installation & Setup

1. Clone the Repository
```bash
    git clone https://github.com/KamilaKnits/MyFlix.git
    cd MyFlix
```
2. Install Dependencies
```bash
npm install
```
3. Run Locally
```bash
npm start
```

# 🔐 Authentication & Authorization

Basic HTTP authentication for login

JWT token-based authentication for protected routes

Secure password hashing with Mongoose

# 🧵 Developer Notes

All business logic is handled via Mongoose models

CORS is configured to allow frontend access from GitHub Pages

Error handling and validation are built-in for robust API responses
