# Sobanukirwa - Full Stack Islamic Learning Platform

## Project Structure

```
D:\Sobanukirwa\
├── index.html              # Main web app (PWA)
├── Css/style.css           # Improved web app styles
├── Javascript/
│   ├── script.js           # Main app logic
│   └── api.js              # API connection layer
├── admin/
│   ├── index.html          # Admin panel
│   ├── admin.css           # Admin styles
│   └── admin.js            # Admin logic
├── database/
│   └── sobanukirwa_schema.sql  # MySQL Workbench schema
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json        # Backend dependencies
│   ├── .env                # Database config
│   ├── config/
│   │   ├── db.js           # MySQL connection pool
│   │   └── seed.js         # Seed script
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── upload.js       # Multer file upload
│   ├── routes/
│   │   ├── auth.js         # Login/me endpoints
│   │   ├── artists.js      # CRUD artists
│   │   ├── tracks.js       # CRUD audio tracks
│   │   ├── videos.js       # CRUD videos
│   │   ├── books.js        # CRUD books
│   │   ├── categories.js   # GET categories
│   │   ├── quran.js        # GET surahs
│   │   └── stats.js        # Admin dashboard stats
│   └── uploads/
│       ├── audio/          # Uploaded audio files
│       ├── videos/         # Uploaded video files
│       ├── documents/      # Uploaded PDF/docs
│       └── images/         # Uploaded images
└── SobanukirwaApp/         # React Native (Expo) mobile app
    ├── App.js
    ├── src/
    │   ├── context/AppContext.js
    │   ├── navigation/AppNavigator.js
    │   ├── screens/
    │   │   ├── HomeScreen.js
    │   │   ├── AudioScreen.js
    │   │   ├── AudioPlayerScreen.js
    │   │   ├── VideoScreen.js
    │   │   ├── VideoPlayerScreen.js
    │   │   ├── QuranScreen.js
    │   │   ├── BooksScreen.js
    │   │   ├── PrayerScreen.js
    │   │   ├── QiblaScreen.js
    │   │   └── SettingsScreen.js
    │   └── services/api.js
    └── package.json
```

## Setup Instructions

### 1. Database Setup (MySQL Workbench)

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `database/sobanukirwa_schema.sql`
4. Execute the script (Ctrl+Shift+Enter)
5. This creates the `sobanukirwa` database with all tables and seed data

### 2. Backend Setup (Node.js)

```bash
cd backend
npm install
```

Edit `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sobanukirwa
JWT_SECRET=your_secret_key
```

Run the seed script to populate database (optional):
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Web App

Open `index.html` in a browser or serve via:
```bash
npx http-server . -p 3000
```

The web app auto-detects the backend API. Works fully offline with cached data.

### 4. Admin Panel

Navigate to `admin/index.html` or click the shield icon in the web app header.

**Default login:**
- Username: `admin`
- Password: `admin123`

### 5. React Native Mobile App

```bash
cd SobanukirwaApp
npm install
npx expo start
```

Scan the QR code with Expo Go app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/artists` | List all artists |
| POST | `/api/artists` | Create artist (auth) |
| GET | `/api/tracks` | List tracks (filter: ?artist_id=&category_id=&search=) |
| POST | `/api/tracks` | Create track with audio upload (auth) |
| GET | `/api/videos` | List videos |
| POST | `/api/videos` | Create video with file upload (auth) |
| GET | `/api/books` | List books |
| POST | `/api/books` | Create book with file upload (auth) |
| GET | `/api/categories` | List categories |
| GET | `/api/quran/surahs` | List all surahs |
| GET | `/api/stats/dashboard` | Admin dashboard stats (auth) |

## Features

- **Full Backend**: Node.js + Express + MySQL with RESTful API
- **Admin Panel**: Upload/manage audio, video, books with file upload
- **Dual Audio Browsing**: Browse by Teacher or by Category (Tauhid, Fiqh, Sirah, etc.)
- **Multi-language**: Kinyarwanda, English, Arabic
- **PWA**: Installable web app with offline support
- **Mobile App**: React Native (Expo) cross-platform app
- **MySQL Schema**: Complete database with all relationships
- **File Upload**: Multer-based file handling for audio, video, documents, images
- **Admin Auth**: JWT-based authentication
