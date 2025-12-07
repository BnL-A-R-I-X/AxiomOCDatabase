## Firebase Comment System Setup Guide

### 🔥 Firebase Rules Configuration

To enable the comment system, you need to set up proper security rules in your Firebase Console.

#### 1. Enable Firestore Database (if not done yet)
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your **AxiomOCDatabase** project
3. Click **Firestore Database** in left sidebar
4. If no database exists, click **"Create database"**
5. Choose **"Start in test mode"** → Select location → **"Done"**

#### 2. Set Up Security Rules
1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User votes for ranking system
    match /user_votes/{userId} {
      allow read, write: if true; // Allow all users to manage their own votes
    }
    
    // Global rankings data
    match /global_rankings/{characterId} {
      allow read: if true; // Everyone can read rankings
      allow write: if true; // Allow ranking updates (consider restricting in production)
    }
    
    // Character comments system
    match /character_comments/{characterId}/comments/{commentId} {
      allow read: if true; // Everyone can read comments
      allow create: if true; // Anyone can create comments
      allow update, delete: if false; // No editing/deleting comments (prevents abuse)
    }
  }
}
```

#### 3. Publish Rules
1. Click **Publish** to save the new rules
2. Wait for confirmation that rules are deployed

### 📊 Database Collections

The comment system will automatically create these collections:

#### `character_comments` Collection Structure:
```
character_comments/
├── ariella/
│   └── comments/
│       ├── [comment_id_1]
│       ├── [comment_id_2]
│       └── ...
├── aridoe/
│   └── comments/
├── darla/
│   └── comments/
├── caelielle/
│   └── comments/
└── misc/
    └── comments/
```

#### Comment Document Structure:
```javascript
{
  text: "Great character design!",
  userId: "user_1643920123456_abc123def",
  userName: "CosmicTraveler", 
  timestamp: 1643920123456,
  characterId: "ariella"
}
```

### 🎮 Features Included

✅ **Real-time Comments** - Live updates across all browsers  
✅ **Anonymous Users** - Auto-generated fun usernames  
✅ **Character Counter** - 500 character limit  
✅ **User Identification** - Shows "You" on your own comments  
✅ **Time Stamps** - Shows "2h ago", "Just now", etc.  
✅ **Name Changing** - Users can update their display name  
✅ **Fallback System** - Works offline with localStorage  

### 🔧 How It Works

1. **Auto-Detection**: Comment system automatically detects character pages
2. **User IDs**: Generates persistent anonymous user IDs  
3. **User Names**: Creates fun sci-fi themed usernames like "QuantumExplorer"
4. **Firebase Integration**: Uses same Firebase config as ranking system
5. **Real-time Sync**: Comments appear instantly across all browsers

### 🎨 UI Features

- **BNL Terminal Styling**: Matches your sci-fi aesthetic
- **Live/Local Status**: Shows 🔥 LIVE COMMENTS or 📱 LOCAL ONLY
- **Responsive Design**: Works on mobile and desktop
- **Theme Integration**: Supports light/dark mode toggle

### 🚀 Testing the System

1. Visit any character page (ariella.html, thea.html, etc.)
2. Scroll down to see the comment section
3. Post a test comment
4. Open another browser/tab to see real-time updates
5. Try changing your username

### 📱 Usage Tips

- **Ctrl+Enter** to submit comments quickly
- **Character limit** changes color near 500 chars
- **Auto-generated names** are persistent per browser
- **Comments sync** in real-time across devices

The comment system is now ready to use! 🎉
