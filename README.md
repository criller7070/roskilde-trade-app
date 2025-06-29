# RosSwap - Roskilde Festival Trading Platform

A comprehensive React 19-based progressive web application for peer-to-peer trading of items, food, and services at Roskilde Festival. Built with Firebase backend services, featuring complete admin panel, GDPR compliance, content moderation, and real-time messaging capabilities.

## Live Production

**Production URL**: https://rosswap.dk
**Firebase Hosting**: `roskilde-trade.firebaseapp.com`

## Table of Contents

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [File Structure](#file-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Data Models & Database Schema](#data-models--database-schema)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Admin Panel System](#admin-panel-system)
- [GDPR Compliance](#gdpr-compliance)
- [Content Moderation](#content-moderation)
- [Real-time Features](#real-time-features)
- [Security Implementation](#security-implementation)
- [Development Setup](#development-setup)
- [Build & Deployment](#build--deployment)

## System Architecture

### Application Type
Single-page application (SPA) with client-side routing using React Router DOM v7.4.0

### Core Systems
- **Discovery Engine**: Tinder-like swipe interface with Fisher-Yates shuffle algorithm
- **Real-time Messaging**: WebSocket-based chat with Firestore real-time listeners
- **Admin Dashboard**: Comprehensive moderation panel with role-based access control
- **Content Moderation**: User flagging system with admin review workflow
- **GDPR Framework**: Complete data export, deletion, and privacy controls
- **Bug Tracking**: Integrated reporting system with screenshot capabilities
- **Asset Management**: Firebase Storage with progressive loading optimizations

### Deployment Architecture
- **Frontend**: Firebase Hosting with CDN distribution
- **Database**: Firestore with real-time synchronization
- **Authentication**: Firebase Auth with Google OAuth + email/password
- **Storage**: Firebase Storage for image assets
- **Functions**: Firebase Functions (configured but not implemented)

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

## File Structure

```
roskilde-trade-app/
├── frontend/
│   ├── src/
│   │   ├── components/           # React components (26 components)
│   │   │   ├── About.jsx
│   │   │   ├── AddItem.jsx
│   │   │   ├── Admin.jsx         # Main admin dashboard
│   │   │   ├── AdminBugReports.jsx
│   │   │   ├── AdminFlagged.jsx  # Content moderation
│   │   │   ├── AdminPosts.jsx
│   │   │   ├── AdminUsers.jsx    # User management
│   │   │   ├── BugReport.jsx
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── Disliked.jsx
│   │   │   ├── GDPRControls.jsx  # Data export/deletion
│   │   │   ├── Home.jsx
│   │   │   ├── ItemList.jsx
│   │   │   ├── ItemPage.jsx      # Item details + flagging
│   │   │   ├── Liked.jsx
│   │   │   ├── LoadingPlaceholder.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── LoginRequired.jsx
│   │   │   ├── Navbar.jsx        # Navigation with admin access
│   │   │   ├── Popup.jsx         # Modal system
│   │   │   ├── Privacy.jsx       # GDPR privacy policy
│   │   │   ├── Profile.jsx       # User profile + account deletion
│   │   │   ├── Signup.jsx        # Registration with GDPR consent
│   │   │   ├── SwipePage.jsx     # Discovery interface
│   │   │   └── Terms.jsx         # Legal terms + safety guidelines
│   │   ├── contexts/             # React Context providers (5 contexts)
│   │   │   ├── AdminContext.jsx  # Admin permissions & logging
│   │   │   ├── AuthContext.jsx   # User authentication state
│   │   │   ├── ChatContext.jsx   # Real-time chat management
│   │   │   ├── ItemsContext.jsx  # Items data & real-time sync
│   │   │   └── PopupContext.jsx  # Global modal management
│   │   ├── hooks/
│   │   │   └── usePopup.js       # Custom popup hook
│   │   ├── assets/
│   │   ├── firebase.js           # Firebase configuration & auth
│   │   ├── App.jsx               # Main app with routing
│   │   ├── main.jsx              # React app entry point
│   │   ├── App.css               # Global styles
│   │   └── index.css             # Tailwind imports
│   ├── public/                   # Static assets
│   │   ├── default_pfp.jpg       # Default profile picture
│   │   ├── logo-compressed.png
│   │   └── team/                 # Team member photos
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
├── functions/                    # Firebase Functions (configured)
│   ├── index.js                  # Functions entry point
│   └── package.json
├── firebase.json                 # Firebase project configuration
└── README.md
```

## Authentication & Authorization

### Implementation Details
- **Google OAuth**: `signInWithPopup` with automatic user document creation
- **Email/Password**: Traditional authentication with profile setup
- **GDPR Consent**: Required checkbox during registration with timestamp tracking
- **Admin Access**: Hardcoded email-based role system for `philippzhuravlev@gmail.com` and `crillerhylle@gmail.com`
- **Session Persistence**: Firebase Auth state maintained across browser sessions

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
  consentedAt: new Date()      // Consent timestamp
});
```

### Admin Authorization
```javascript
// AdminContext.jsx - Role-based access control
const adminEmails = [
  "philippzhuravlev@gmail.com",
  "crillerhylle@gmail.com"
];
const isAdmin = user?.email && adminEmails.includes(user.email);
```

## Data Models & Database Schema

### Firestore Collections

#### users/{userId}
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

#### items/{itemId}
```typescript
interface Item {
  title: string;
  description: string;
  imageUrl: string;
  mode: "bytte" | "sælge";        // Trade or sell (Danish)
  userId: string;
  userName: string;               // Denormalized for performance
  userProfileImage?: string;      // Denormalized profile image
  createdAt: FieldValue;
  flagged?: boolean;              // Content moderation flag
  flagCount?: number;             // Number of flag reports
}
```

#### chats/{chatId}
```typescript
interface Chat {
  itemId: string;
  itemName: string;               // Denormalized
  itemImage: string;              // Denormalized
  participants: string[];         // [userId1, userId2]
  createdAt: FieldValue;
  lastMessage: {
    text: string;
    timestamp: FieldValue;
    senderId: string;
  } | null;
  userNames: Record<string, string>;  // Participant names
  isItemDeleted?: boolean;        // Item deletion tracking
  itemDeletedAt?: FieldValue;     // Deletion timestamp
}
```

#### chats/{chatId}/messages/{messageId}
```typescript
interface Message {
  senderId: string;
  text: string;
  timestamp: FieldValue;
  isSystemMessage?: boolean;      // System-generated messages
}
```

#### userChats/{userId}/chats/{chatId}
```typescript
interface UserChat {
  itemId: string;
  itemName: string;
  itemImage: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: FieldValue;
  unreadCount: number;
}
```

#### flags/{flagId}
```typescript
interface Flag {
  itemId: string;                 // Flagged item
  reporterId: string;             // User who flagged
  reason: string;                 // Predefined reason
  comment?: string;               // Optional additional details
  status: "open" | "resolved";    // Moderation status
  createdAt: FieldValue;
  resolvedAt?: FieldValue;        // Resolution timestamp
  resolvedBy?: string;            // Admin who resolved
}
```

#### bugReports/{reportId}
```typescript
interface BugReport {
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAgent: string;              // Browser information
  url: string;                    // Page where bug occurred
  imageUrl?: string;              // Optional screenshot
  status: "open" | "resolved";
  createdAt: FieldValue;
  resolvedAt?: FieldValue;
  resolvedBy?: string;
}
```

#### adminActions/{actionId}
```typescript
interface AdminAction {
  adminId: string;                // Admin who performed action
  adminEmail: string;
  action: string;                 // Action type
  targetType: string;             // Item, user, etc.
  targetId: string;               // Target document ID
  details: Record<string, any>;   // Action-specific data
  timestamp: FieldValue;
}
```

## Component Architecture

### Page Components (12)
- `Home.jsx` - Landing page with app introduction
- `SwipePage.jsx` - Tinder-like discovery interface with swipe gestures
- `ItemList.jsx` - Grid view of all items with filtering
- `ItemPage.jsx` - Individual item details with flagging functionality
- `ChatList.jsx` - User's conversations overview
- `ChatPage.jsx` - Individual chat interface with real-time messaging
- `Profile.jsx` - User profile management with GDPR controls
- `About.jsx` - Team information and app details
- `Login.jsx` - Authentication interface
- `Signup.jsx` - Registration with GDPR consent
- `Terms.jsx` - Legal terms and safety guidelines
- `Privacy.jsx` - Comprehensive GDPR privacy policy

### Admin Components (5)
- `Admin.jsx` - Main dashboard with statistics and navigation
- `AdminPosts.jsx` - Item management and moderation
- `AdminBugReports.jsx` - Bug report management and resolution
- `AdminUsers.jsx` - User account management and deletion
- `AdminFlagged.jsx` - Content moderation for flagged items

### Utility Components (9)
- `Navbar.jsx` - Navigation with conditional admin access
- `AddItem.jsx` - Item creation form with image upload
- `Liked.jsx` - User's liked items history
- `Disliked.jsx` - User's disliked items history
- `BugReport.jsx` - Bug reporting form with screenshot upload
- `GDPRControls.jsx` - Data export and account deletion
- `LoadingPlaceholder.jsx` - Progressive image loading component
- `Popup.jsx` - Modal system with confirmation dialogs
- `LoginRequired.jsx` - Authentication guard component

## State Management

### Context Providers
```javascript
// App.jsx - Provider hierarchy
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
- **AuthContext**: User authentication state and profile data
- **AdminContext**: Admin permissions, action logging, and statistics
- **ItemsContext**: Items data with real-time Firestore synchronization
- **ChatContext**: Real-time chat management and unread counters
- **PopupContext**: Global modal and notification system

### Real-time Data Synchronization
```javascript
// ItemsContext.jsx - Real-time items subscription
useEffect(() => {
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const itemsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setItems(itemsData);
  });
  return unsubscribe;
}, []);
```

## Admin Panel System

### Dashboard Features
- **Statistics Cards**: Real-time counts for users, posts, chats, bugs, and flags
- **Quick Actions**: Direct access to management functions
- **Admin Navigation**: Protected routes with role verification

### Content Management
- **Post Moderation**: View, edit, and delete user posts
- **User Management**: View user profiles, activity, and account deletion
- **Flag Resolution**: Review and resolve content flags with bulk actions
- **Bug Tracking**: Manage bug reports with status updates

### Admin Action Logging
```javascript
// AdminContext.jsx - Action logging for audit trails
const logAdminAction = async (action, details) => {
  await addDoc(collection(db, "adminActions"), {
    adminId: user.uid,
    adminEmail: user.email,
    action,
    details,
    timestamp: serverTimestamp()
  });
};
```

### Security Controls
- **Email-based Access**: Hardcoded admin email list
- **Route Protection**: Admin-only routes with authentication guards
- **Audit Logging**: All admin actions logged with timestamps
- **Data Validation**: Server-side validation through Firestore rules

## GDPR Compliance

### Legal Framework
- **Privacy Policy**: Comprehensive Article 13/14 GDPR compliance
- **Terms of Service**: Legal disclaimers and user responsibilities
- **Consent Management**: Required checkbox during registration
- **Data Controller**: Clear identification and contact information

### User Rights Implementation
```javascript
// GDPRControls.jsx - Data export functionality
const exportUserData = async () => {
  const userData = {
    account: { uid, name, email, photoURL },
    items: [], // User's posts
    chats: [], // Chat conversations
    bugReports: [], // Bug reports submitted
    flagReports: [] // Flag reports made
  };
  // Export as JSON file
};
```

### Data Management
- **Right to Access**: Complete data export in JSON format
- **Right to Deletion**: Account deletion with cascade data removal
- **Right to Rectification**: Profile editing capabilities
- **Right to Portability**: Machine-readable data export
- **Data Retention**: Clear policies for different data types

### Account Deletion Process
```javascript
// Profile.jsx - Comprehensive account deletion
const handleDeleteAccount = async () => {
  // 1. Delete all user posts
  // 2. Clean up chat references
  // 3. Remove flag reports
  // 4. Delete user document
  // 5. Sign out from Firebase Auth
};
```

## Content Moderation

### Flagging System
```javascript
// ItemPage.jsx - Content flagging interface
const flagReasons = [
  "Upassende indhold",
  "Spam eller falsk",
  "Vildledende information",
  "Ulovligt indhold",
  "Andet"
];
```

### Moderation Workflow
1. **User Reports**: Flag button on item pages with reason selection
2. **Admin Review**: AdminFlagged component for flag management
3. **Action Options**: Resolve flag, delete post, or investigate further
4. **Status Tracking**: Open/resolved status with admin attribution

### Safety Guidelines
- **Legal Disclaimers**: User responsibility for content legality
- **Safety Instructions**: Meeting guidelines and food safety
- **Reporting Mechanisms**: Multiple channels for issue reporting
- **Age Restrictions**: 18+ enforcement with clear policies

## Real-time Features

### Chat System
```javascript
// ChatPage.jsx - Real-time message subscription
useEffect(() => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messagesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMessages(messagesData);
  });
  return unsubscribe;
}, [chatId]);
```

### Live Data Updates
- **Items Feed**: Real-time updates for new posts and modifications
- **Chat Messages**: Instant message delivery with read receipts
- **Admin Dashboard**: Live statistics and notification counts
- **Flag Notifications**: Real-time flag report updates

### Performance Optimizations
- **Progressive Loading**: LoadingPlaceholder component for images
- **Lazy Loading**: Dynamic imports for admin components
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Connection Management**: Automatic reconnection handling

## Security Implementation

### Firestore Security Rules
```javascript
// Flags collection - Example security rule
match /flags/{flagId} {
  allow create: if request.auth != null &&
    request.resource.data.reporterId == request.auth.uid;
  
  allow read: if request.auth != null && (
    resource.data.reporterId == request.auth.uid ||
    request.auth.token.email in [
      "philippzhuravlev@gmail.com",
      "crillerhylle@gmail.com"
    ]
  );
  
  allow list: if request.auth != null && (
    resource.data.reporterId == request.auth.uid ||
    request.auth.token.email in [
      "philippzhuravlev@gmail.com", 
      "crillerhylle@gmail.com"
    ]
  );
}
```

### Access Control
- **Authentication Required**: Most routes protected by authentication guards
- **Role-based Access**: Admin-specific routes and functionality
- **Data Ownership**: Users can only modify their own content
- **Admin Privileges**: Elevated permissions for moderation actions

### Data Validation
- **Client-side Validation**: Form validation with user feedback
- **Server-side Enforcement**: Firestore rules prevent unauthorized access
- **Input Sanitization**: XSS prevention and data cleaning
- **File Upload Restrictions**: Image type and size limitations

## Development Setup

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
git clone https://github.com/[username]/roskilde-trade-app.git
cd roskilde-trade-app/frontend
npm install
```

### Environment Configuration
```bash
# Create .env file with Firebase configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development Server
```bash
npm run dev
# Serves on http://localhost:5173
```

### Code Quality
```bash
npm run lint    # ESLint analysis
npm run build   # Production build
npm run preview # Preview production build
```

## Build & Deployment

### Production Build
```bash
cd frontend
npm run build
# Output: dist/ directory (952.96 kB bundle, 256.93 kB gzipped)
```

### Firebase Deployment
```bash
firebase login
firebase deploy --only hosting
# Deploys to Firebase Hosting with CDN
```

### Deployment Pipeline
1. **Code Push**: Push to `live` branch triggers deployment
2. **Build Process**: Vite production build with optimizations
3. **Firebase Deploy**: Automatic deployment to hosting
4. **CDN Distribution**: Global edge caching
5. **Domain Mapping**: Custom domain (rosswap.dk) with SSL

### Performance Metrics
- **First Contentful Paint**: Optimized with progressive loading
- **Largest Contentful Paint**: Image optimization and lazy loading
- **Time to Interactive**: Code splitting and tree shaking
- **Bundle Analysis**: 2383 modules with dependency optimization

---

**Technical Documentation Version**: 1.0
**Last Updated**: Production deployment with full feature set
**Codebase Status**: Production-ready with comprehensive GDPR compliance