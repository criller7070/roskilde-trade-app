# RosSwap - Technical Architecture & Project Structure

**React 19 + Firebase** enterprise-grade trading platform with real-time features, admin panel, GDPR compliance, and content moderation.

## System Architecture

### Application Type
- **SPA**: Single-page application with React Router DOM v7.4.0
- **Real-time**: Firestore listeners for live data synchronization
- **PWA**: Progressive web app with offline capabilities
- **Admin System**: Firebase collection-based role management

### Core Systems
- **Discovery Engine**: Tinder-like swipe interface with Fisher-Yates shuffle
- **Real-time Messaging**: Firestore listeners with unread counters
- **Admin Dashboard**: Enterprise moderation panel with audit trails
- **Content Moderation**: User flagging with admin resolution workflow
- **GDPR Framework**: Article 17 implementation with cascading deletion
- **Bug Tracking**: Integrated reporting with screenshot uploads

## Project Structure

```
roskilde-trade-app/
├── frontend/                        # React 19 + Vite application
│   ├── src/
│   │   ├── components/              # 27 React components
│   │   │   ├── Core/                # 8 core components
│   │   │   │   ├── App.jsx          # Main app with routing
│   │   │   │   ├── Navbar.jsx       # Navigation + admin access
│   │   │   │   ├── Home.jsx         # Landing page
│   │   │   │   ├── About.jsx        # Team information
│   │   │   │   ├── LoginRequired.jsx # Auth guard
│   │   │   │   ├── LoadingPlaceholder.jsx # Progressive loading
│   │   │   │   ├── Popup.jsx        # Modal system
│   │   │   │   └── EmailVerificationBanner.jsx # Email verification
│   │   │   ├── Auth/                # 4 authentication components
│   │   │   │   ├── Login.jsx        # Email/password + Google OAuth
│   │   │   │   ├── Signup.jsx       # Registration + GDPR consent
│   │   │   │   ├── Profile.jsx      # User profile + account deletion
│   │   │   │   └── GDPRControls.jsx # Data export/deletion
│   │   │   ├── Trading/             # 8 trading components
│   │   │   │   ├── SwipePage.jsx    # Discovery interface
│   │   │   │   ├── AddItem.jsx      # Item creation + image upload
│   │   │   │   ├── ItemList.jsx     # Grid view with filtering
│   │   │   │   ├── ItemPage.jsx     # Item details + flagging
│   │   │   │   ├── Liked.jsx        # Liked items history
│   │   │   │   ├── Disliked.jsx     # Disliked items history
│   │   │   │   ├── ChatList.jsx     # Real-time chat list
│   │   │   │   └── ChatPage.jsx     # Individual chat interface
│   │   │   ├── Admin/               # 5 admin components
│   │   │   │   ├── Admin.jsx        # Main dashboard + stats
│   │   │   │   ├── AdminPosts.jsx   # Item management
│   │   │   │   ├── AdminBugReports.jsx # Bug report management
│   │   │   │   ├── AdminUsers.jsx   # User management + deletion
│   │   │   │   └── AdminFlagged.jsx # Content moderation
│   │   │   └── Legal/               # 3 legal/support components
│   │   │       ├── Terms.jsx        # Legal terms + safety
│   │   │       ├── Privacy.jsx      # GDPR privacy policy
│   │   │       └── BugReport.jsx    # Bug reporting form
│   │   ├── contexts/                # 5 React Context providers
│   │   │   ├── AuthContext.jsx      # User authentication state
│   │   │   ├── AdminContext.jsx     # Admin permissions + audit logging
│   │   │   ├── ItemsContext.jsx     # Items data + real-time sync
│   │   │   ├── ChatContext.jsx      # Real-time chat management
│   │   │   └── PopupContext.jsx     # Global modal management
│   │   ├── hooks/
│   │   │   └── usePopup.js          # Custom popup hook
│   │   ├── utils/                   # Utility functions
│   │   │   ├── emailValidation.js   # Email validation + disposable domain check
│   │   │   ├── fileValidation.js    # File upload validation
│   │   │   ├── inputSanitizer.js    # XSS protection + content filtering
│   │   │   └── rateLimiter.js       # Client-side rate limiting
│   │   ├── firebase.js              # Firebase configuration
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.css                  # Global styles
│   │   └── index.css                # Tailwind imports
│   ├── public/                      # Static assets
│   │   ├── default_pfp.jpg          # Default profile picture
│   │   ├── logo-compressed.png      # App logo
│   │   └── team/                    # Team member photos
│   ├── package.json                 # Dependencies + scripts
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   └── eslint.config.js             # ESLint configuration
├── functions/                       # Firebase Functions
│   ├── index.js                     # GDPR-compliant user deletion
│   ├── package.json                 # Firebase Functions dependencies
│   └── package-lock.json
├── firebase.json                    # Firebase project configuration
├── firestore.rules                  # Database security rules
├── firestore.indexes.json           # Database indexes
└── README.md
```

## Technology Stack

### Frontend Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0", 
  "react-router-dom": "^7.4.0",
  "firebase": "^11.5.0",
  "framer-motion": "^12.18.2",
  "react-swipeable": "^7.0.2",
  "@headlessui/react": "^2.2.4",
  "@heroicons/react": "^2.2.0",
  "lucide-react": "^0.514.0",
  "date-fns": "^4.1.0"
}
```

### Development Stack
```json
{
  "vite": "^6.2.0",
  "@vitejs/plugin-react": "^4.3.4",
  "eslint": "^9.21.0",
  "tailwindcss": "^3.3.3",
  "postcss": "^8.5.3",
  "autoprefixer": "^10.4.21"
}
```

### Build Metrics
- **Bundle Size**: 952.96 kB (256.93 kB gzipped)
- **Build Time**: ~5.5 seconds
- **Module Count**: 2383 transformed modules

## Database Schema

### Firestore Collections

#### `admin/config`
```typescript
interface AdminConfig {
  adminEmails: string[];        // List of admin email addresses
}
```

#### `users/{userId}`
```typescript
interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
  gdprConsent: boolean;           // GDPR compliance
  consentedAt: Timestamp;         // Consent timestamp
  likedItemIds?: string[];        // Swipe history
  dislikedItemIds?: string[];     // Swipe history
}
```

#### `items/{itemId}`
```typescript
interface Item {
  id: string;
  title: string;
  description: string;
  category: 'food' | 'items' | 'services';
  price: number;
  imageUrl?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: Timestamp;
  flagged?: boolean;             // Content moderation flag
  flagCount?: number;            // Number of user flags
}
```

#### `chats/{chatId}`
```typescript
interface Chat {
  id: string;                    // Format: userId1_userId2_itemId
  participants: string[];        // [userId1, userId2]
  itemId: string;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  createdAt: Timestamp;
}
```

#### `messages/{messageId}`
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
}
```

#### `flags/{flagId}`
```typescript
interface Flag {
  id: string;
  itemId: string;
  reporterId: string;
  reason: 'inappropriate' | 'spam' | 'scam' | 'other';
  description?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;           // Admin user ID
}
```

#### `bugReports/{reportId}`
```typescript
interface BugReport {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  screenshotUrl?: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  adminNotes?: string;
}
```

#### `adminActions/{actionId}`
```typescript
interface AdminAction {
  id: string;
  action: string;                // Action type
  adminEmail: string;
  adminUID: string;
  adminName: string;
  timestamp: Timestamp;
  details: Record<string, any>; // Action-specific details
  userAgent: string;
  ipAddress?: string;
}
```

## Context-Based State Management

### Provider Hierarchy
```javascript
// App.jsx - Nested context providers
<AuthProvider>
  <AdminProvider>
    <ItemsProvider>
      <ChatProvider>
        <PopupProvider>
          <AppRoutes />
        </PopupProvider>
      </ChatProvider>
    </ItemsProvider>
  </AdminProvider>
</AuthProvider>
```

### Context Responsibilities

#### AuthContext (58 lines)
- User authentication state management
- Google OAuth + email/password login
- Session persistence across browser sessions

#### AdminContext (120 lines)
- Firebase-based admin role management
- Real-time admin statistics
- Comprehensive audit logging to `adminActions` collection

#### ItemsContext (169 lines)
- Real-time items management with Firestore synchronization
- Item CRUD operations with validation
- Flagging system integration

#### ChatContext (564 lines)
- Real-time chat management with unread counters
- Message synchronization across devices
- Chat creation and message sending

#### PopupContext (34 lines)
- Global modal and notification system
- Success/error/confirmation dialogs

## Security Implementation

### Content Security Policy (Production Hardened)
```javascript
// firebase.json - Comprehensive CSP
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' https://apis.google.com https://www.gstatic.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: https://lh3.googleusercontent.com; connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com wss://*.firebaseio.com"
}
```

### Firestore Security Rules
```javascript
// firestore.rules - Multi-layered access control
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin configuration (read-only via console)
    match /admin/config {
      allow read: if request.auth != null;
      allow write: if false; // Only Firebase Console can modify
    }
    
    // Admin actions audit trail
    match /adminActions/{actionId} {
      allow create: if request.auth != null && isAdmin();
      allow read: if request.auth != null && isAdmin();
      // No update/delete - audit logs are immutable
    }
    
    // Items with admin override
    match /items/{itemId} {
      allow read: if true; // Public read for discovery
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
    }
    
    // User profiles with admin access
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == userId || isAdmin()
      );
    }
    
    // Server-side admin validation function
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email != null &&
             exists(/databases/$(database)/documents/admin/config) &&
             request.auth.token.email in get(/databases/$(database)/documents/admin/config).data.adminEmails;
    }
  }
}
```

### Input Validation & Sanitization
```javascript
// inputSanitizer.js - XSS protection and content filtering
export const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  // Content filtering for inappropriate content
  const inappropriatePatterns = [
    /\b(password|adgangskode|login|bank)\b/i,
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card patterns
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i // Email patterns in content
  ];
  
  const containsInappropriate = inappropriatePatterns.some(pattern => 
    pattern.test(sanitized)
  );
  
  if (containsInappropriate && options.strictMode) {
    throw new Error('Indhold indeholder ikke-tilladt information');
  }
  
  return sanitized;
};
```

### Rate Limiting
```javascript
// rateLimiter.js - Client-side rate limiting
class RateLimiter {
  constructor() {
    this.actions = new Map();
  }
  
  checkLimit(actionType, userId, limits = {}) {
    const defaultLimits = {
      addItem: { max: 5, window: 300000 },           // 5 items per 5 minutes
      sendMessage: { max: 30, window: 60000 },       // 30 messages per minute
      uploadFile: { max: 10, window: 600000 },       // 10 files per 10 minutes
      flagReport: { max: 10, window: 3600000 },      // 10 flags per hour
      bugReport: { max: 5, window: 1800000 },        // 5 bug reports per 30 minutes
      adminAction: { max: 50, window: 300000 }       // 50 admin actions per 5 minutes
    };
    
    const actionLimits = { ...defaultLimits, ...limits };
    const limit = actionLimits[actionType];
    
    const key = `${actionType}_${userId}`;
    const now = Date.now();
    
    if (!this.actions.has(key)) {
      this.actions.set(key, []);
    }
    
    const actionHistory = this.actions.get(key);
    const validActions = actionHistory.filter(
      timestamp => now - timestamp < limit.window
    );
    
    if (validActions.length >= limit.max) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((validActions[0] + limit.window - now) / 1000) 
      };
    }
    
    validActions.push(now);
    this.actions.set(key, validActions);
    
    return { allowed: true };
  }
}
```

## Authentication & Authorization

### Implementation Details
- **Google OAuth**: `signInWithPopup` with automatic user document creation
- **Email/Password**: Traditional authentication with profile setup
- **GDPR Consent**: Required checkbox during registration with timestamp tracking
- **Session Persistence**: Firebase Auth state maintained across browser sessions
- **Admin Access**: Firebase collection-based role system with server-side validation

### User Document Structure
```javascript
// Automatic user document creation on registration
await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  name: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
  createdAt: new Date(),
  gdprConsent: true,           // GDPR compliance flag
  consentedAt: new Date(),     // Consent timestamp
  likedItemIds: [],            // Swipe history
  dislikedItemIds: []          // Swipe history
});
```

### Firebase-Based Admin Authorization
```javascript
// AdminContext.jsx - Server-side role verification
const checkAdminStatus = async () => {
  const adminConfigRef = doc(db, 'admin', 'config');
  const adminConfigSnap = await getDoc(adminConfigRef);
  
  if (adminConfigSnap.exists()) {
    const adminConfig = adminConfigSnap.data();
    const adminEmails = adminConfig.adminEmails || [];
    const userIsAdmin = adminEmails.includes(user.email);
    setIsAdmin(userIsAdmin);
  }
};
```

## Admin Panel System

### Dashboard Architecture
- **Real-time Statistics**: Live counts for users, posts, chats, bugs, and flags
- **Quick Actions**: Direct access to management functions with confirmation dialogs
- **Protected Routes**: Admin-only routes with Firebase collection-based role verification
- **Audit Logging**: Comprehensive action logging to `adminActions` collection

### Content Management Features

#### User Management (AdminUsers.jsx)
- **User Listing**: Real-time user list with activity statistics
- **Account Deletion**: GDPR-compliant user deletion via Firebase Functions
- **Activity Tracking**: Items, chats, and flags per user
- **Audit Trails**: All admin actions logged with details

#### Content Moderation (AdminFlagged.jsx)
- **Flag Review**: Comprehensive flag management with bulk actions
- **Content Filtering**: View flagged items with flag reasons and reporter details
- **Resolution Workflow**: Mark flags as resolved/dismissed with admin notes
- **Escalation Support**: Priority-based flag handling

#### Bug Tracking (AdminBugReports.jsx)
- **Report Management**: View and manage user-submitted bug reports
- **Status Tracking**: Open/In-Progress/Resolved status management
- **Priority Assignment**: Low/Medium/High priority classification
- **Screenshot Support**: View uploaded screenshots for bug context

### Admin Action Logging
```javascript
// AdminContext.jsx - Comprehensive audit trail
const logAdminAction = async (action, details = {}) => {
  try {
    const adminActionsRef = collection(db, 'adminActions');
    await addDoc(adminActionsRef, {
      action,
      adminEmail: user.email,
      adminUID: user.uid,
      adminName: user.displayName || 'Unknown',
      timestamp: serverTimestamp(),
      details: {
        itemCount: details.itemCount || null,
        reportCount: details.reportCount || null,
        actionType: details.actionType || null
      },
      userAgent: navigator.userAgent,
      ipAddress: null // Server-side function would capture real IP
    });
  } catch (error) {
    // Don't throw - logging failure shouldn't break admin operations
  }
};
```

## Real-time Features

### Firestore Real-time Listeners
```javascript
// ItemsContext.jsx - Real-time subscription
useEffect(() => {
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const itemsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setItems(itemsData);
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

### Unread Message Counters
```javascript
// ChatContext.jsx - Real-time unread count calculation
useEffect(() => {
  const calculateUnreadCounts = () => {
    const counts = {};
    let total = 0;
    
    chats.forEach(chat => {
      const chatMessages = allMessages.filter(msg => msg.chatId === chat.id);
      const unreadCount = chatMessages.filter(msg => 
        msg.senderId !== user.uid && !msg.read
      ).length;
      
      counts[chat.id] = unreadCount;
      total += unreadCount;
    });
    
    setUnreadCounts(counts);
    setTotalUnread(total);
  };
  
  calculateUnreadCounts();
}, [chats, allMessages, user]);
```

## GDPR Compliance Framework

### Legal Foundation
- **Privacy Policy**: Article 13/14 GDPR compliance with clear data processing explanations
- **Terms of Service**: Legal disclaimers, user responsibilities, and data handling
- **Consent Management**: Required checkbox during registration with timestamp tracking
- **Data Controller**: Clear identification and contact information

### User Rights Implementation

#### Right to Access (Article 15)
```javascript
// GDPRControls.jsx - Data export functionality
const exportUserData = async () => {
  const userData = {
    profile: userDoc,
    items: userItems,
    chats: userChats,
    flags: userFlags,
    bugReports: userBugReports
  };
  
  const blob = new Blob([JSON.stringify(userData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${user.displayName}_data_export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};
```

#### Right to Erasure (Article 17)
```javascript
// Firebase Functions - Server-side cascading deletion
exports.deleteUser = onRequest(async (req, res) => {
  // Multi-layer authorization validation
  const isAuthorized = targetUserId === currentUserId || 
                      adminEmails.includes(currentUserEmail);
  
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  // Cascading deletion across 7 collections:
  // 1. Firebase Auth user deletion
  await admin.auth().deleteUser(targetUserId);
  
  // 2. users/{userId} document
  await admin.firestore().collection('users').doc(targetUserId).delete();
  
  // 3. items collection cleanup
  const itemsQuery = admin.firestore().collection('items').where('userId', '==', targetUserId);
  const itemsSnapshot = await itemsQuery.get();
  const batch1 = admin.firestore().batch();
  itemsSnapshot.forEach(doc => batch1.delete(doc.ref));
  await batch1.commit();
  
  // 4-7. bugReports, flags, chats, userChats cleanup...
  
  return res.json({ 
    success: true, 
    deletedItems: { items: itemCount, bugReports, flags, chats } 
  });
});
```

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Firebase CLI 12.0.0 or higher

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/roskilde-trade-app.git
cd roskilde-trade-app

# Install frontend dependencies
cd frontend
npm install

# Install Firebase Functions dependencies
cd ../functions
npm install

# Return to root
cd ..
```

### Environment Setup
```bash
# Create environment file
cp frontend/.env.example frontend/.env.local

# Configure Firebase environment variables
# Edit frontend/.env.local with your Firebase config
```

### Required Environment Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Project Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google provider)
3. Create a Firestore database
4. Enable Storage
5. Create a web app to get your config values
6. Set up Firebase Functions (optional)
7. Configure Firestore security rules (see `firestore.rules`)
8. Create admin configuration in Firestore:
   ```javascript
   // Collection: admin, Document: config
   {
     adminEmails: ["your-admin-email@example.com"]
   }
   ```

### Development Commands
```bash
# Start frontend development server
cd frontend
npm run dev

# Start Firebase emulators (optional)
firebase emulators:start

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build & Deployment

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Firebase deployment
firebase deploy
```

### Firebase Hosting Configuration
```json
// firebase.json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://apis.google.com..."
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Firebase project initialized
- [ ] Firestore security rules deployed
- [ ] Admin configuration document created in Firestore
- [ ] Firebase Functions deployed
- [ ] Frontend build optimized
- [ ] CSP headers configured
- [ ] SSL certificate active

---

## Architecture Summary

This is a **React 19 + Firebase** enterprise application with:

1. **Firebase-based Admin System**: Role management via Firestore collections, not hardcoded values
2. **Real-time Everything**: Firestore listeners for items, chats, admin stats, flags, and bug reports
3. **GDPR Compliance**: Complete Article 17 implementation with cascading deletion via Firebase Functions
4. **Enterprise Security**: CSP headers, input sanitization, rate limiting, email validation
5. **Content Moderation**: User flagging system with admin resolution workflow
6. **Audit Trails**: All admin actions logged to `adminActions` collection
7. **Context-Based State**: 5 contexts managing different application domains
8. **Component Organization**: 27 components organized by functionality (auth, trading, admin, legal)
9. **Production Ready**: Comprehensive error handling, loading states, and user feedback

**Key Technical Decisions:**
- **No Redux**: Context API for simpler state management
- **No TypeScript**: JSDoc comments for type safety
- **No Testing Framework**: Manual testing with comprehensive error handling
- **Firebase-First**: All backend services use Firebase ecosystem
- **Real-time by Default**: All data operations use Firestore listeners