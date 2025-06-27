# RosSwap - Roskilde Festival Trading Platform

A React 19-based progressive web application for peer-to-peer trading of items, food, and services at Roskilde Festival. Built with Firebase backend services and optimized for mobile-first responsive design.

## Live Demo

[RosSwap Production App](https://roskilde-trade.firebaseapp.com)

## Table of Contents

- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Authentication System](#authentication-system)
- [Data Models & Database Schema](#data-models--database-schema)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Real-time Synchronization](#real-time-synchronization)
- [Performance Optimizations](#performance-optimizations)
- [Development Setup](#development-setup)
- [Build & Deployment](#build--deployment)
- [Security Implementation](#security-implementation)
- [Testing & Quality Assurance](#testing--quality-assurance)

## System Architecture

### Application Type
Single-page application (SPA) with client-side routing using React Router DOM v7.4.0

### Core Functionality
- **Discovery System**: Tinder-like swipe interface with Fisher-Yates shuffle algorithm for randomized item presentation
- **Real-time Messaging**: WebSocket-based chat system with Firestore real-time listeners
- **Content Management**: Admin panel with hardcoded role-based access control
- **Bug Reporting**: Integrated feedback system with screenshot upload capability
- **Image Management**: Firebase Storage integration with loading optimizations

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

### Development Dependencies
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

### Build System
- **Vite 6.2.0**: Module bundler and development server with hot module replacement
- **PostCSS 8.5.3**: CSS processing pipeline with Autoprefixer for vendor prefixes
- **ESLint 9.21.0**: Static code analysis with React-specific rules

### Backend Services (Firebase 11.5.0)
- **Firebase Authentication**: OAuth 2.0 with Google provider + email/password
- **Firestore Database**: NoSQL document store with real-time synchronization
- **Firebase Storage**: File storage service for image uploads
- **Firebase Hosting**: Static web hosting with CDN distribution

## Authentication System

### Implementation Details
- **Google OAuth**: Implemented via `signInWithPopup` API
- **User Document Creation**: Automatic Firestore user document creation on first sign-in
- **Session Persistence**: Firebase Auth state persistence across browser sessions
- **Profile Enhancement**: Firestore data merged with Firebase Auth user object

### Authentication Flow
```javascript
// firebase.js - Authentication implementation
const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date(),
    });
  }
};
```

## Data Models & Database Schema

### Firestore Collections Structure

#### users/{userId}
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  name: string;                   // Display name from OAuth
  email: string;                  // Primary email address
  photoURL: string;               // Profile image URL
  createdAt: Timestamp;           // Account creation timestamp
  likedItemIds?: string[];        // Array of liked item document IDs
  dislikedItemIds?: string[];     // Array of disliked item document IDs
}
```

#### items/{itemId}
```typescript
interface Item {
  title: string;                  // Item title (max length enforced client-side)
  description: string;            // Item description
  imageUrl: string;               // Firebase Storage download URL
  mode: "bytte" | "sælge";        // Trading mode (Danish: trade/sell)
  userId: string;                 // Creator's Firebase Auth UID
  userName: string;               // Creator's display name (denormalized)
  createdAt: FieldValue;          // Server timestamp
}
```

#### chats/{chatId}
```typescript
interface Chat {
  itemId: string;                 // Associated item document ID
  itemName: string;               // Item title (denormalized)
  itemImage: string;              // Item image URL (denormalized)
  participants: string[];         // Array of participant UIDs [sender, recipient]
  createdAt: FieldValue;          // Server timestamp
  lastMessage: {                  // Last message metadata
    text: string;
    timestamp: FieldValue;
    senderId: string;
  } | null;
  userNames: {                    // Participant display names (denormalized)
    [userId: string]: string;
  };
}
```

#### chats/{chatId}/messages/{messageId} (Subcollection)
```typescript
interface Message {
  senderId: string;               // Message sender UID
  text: string;                   // Message content
  timestamp: FieldValue;          // Server timestamp
}
```

#### userChats/{userId}/chats/{chatId} (Subcollection)
```typescript
interface UserChat {
  itemId: string;                 // Associated item ID
  itemName: string;               // Item title (denormalized)
  itemImage: string;              // Item image URL (denormalized)
  otherUserId: string;            // Other participant UID
  otherUserName: string;          // Other participant display name
  lastMessage: string;            // Last message text
  lastMessageTime: FieldValue;    // Last message timestamp
  unreadCount: number;            // Unread message counter
}
```

#### bugReports/{reportId}
```typescript
interface BugReport {
  description: string;            // Bug description (max 1000 chars)
  userId: string;                 // Reporter UID
  userEmail: string;              // Reporter email
  userName: string;               // Reporter display name
  userAgent: string;              // Browser user agent string
  url: string;                    // Page URL where bug occurred
  imageUrl?: string;              // Optional screenshot Firebase Storage URL
  status: "open" | "resolved";    // Bug report status
  createdAt: FieldValue;          // Server timestamp
}
```

### Database Query Patterns

#### Real-time Subscriptions
```javascript
// Items subscription with ordering
const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
const unsubscribe = onSnapshot(q, (snapshot) => {
  const itemsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setItems(itemsData);
});
```

#### Array Field Operations
```javascript
// Like/dislike functionality using Firestore array operations
await updateDoc(userRef, {
  likedItemIds: arrayUnion(itemId),     // Add to array
  dislikedItemIds: arrayRemove(itemId)  // Remove from array
});
```

## Component Architecture

### Context Provider Hierarchy
```
App
├── AuthProvider (Firebase Auth state)
├── AdminProvider (Role-based access control)
├── ItemsProvider (Item CRUD operations)
├── ChatProvider (Real-time messaging)
└── PopupProvider (Global notification system)
```

### Key Components Implementation

#### SwipePage.jsx - Discovery Algorithm
```javascript
// Fisher-Yates shuffle implementation
const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }
  return array;
};

// Framer Motion drag gestures
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(e, { offset }) => {
    if (offset.x > 50) handleSwipe(item, 'like');
    else if (offset.x < -50) handleSwipe(item, 'dislike');
  }}
>
```

#### LoadingPlaceholder.jsx - Image Optimization
```javascript
// Progressive image loading with fallback
const LoadingPlaceholder = ({ src, fallbackSrc = "/default_pfp.jpg" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="relative">
      {isLoading && <div className="animate-pulse bg-gray-200" />}
      <img
        src={hasError ? fallbackSrc : src}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true); }}
      />
    </div>
  );
};
```

#### Chat System - Dual Data Structure
- **Global chats collection**: Shared chat metadata and message subcollections
- **User-specific subcollections**: Denormalized chat data for efficient user queries
- **Unread message counting**: Client-side increment/decrement operations

## State Management

### Context-Based Architecture
No external state management library (Redux/Zustand) - uses React Context API with custom hooks

#### ItemsContext Implementation
```javascript
// Real-time Firestore synchronization
const [items, setItems] = useState([]);
useEffect(() => {
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const itemsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(itemsData);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

#### AuthContext User Enhancement
```javascript
// Merge Firestore data with Firebase Auth user object
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        // Mutate Firebase Auth user object directly
        if (!currentUser.displayName) currentUser.displayName = data.name;
        if (!currentUser.photoURL) currentUser.photoURL = data.photoURL;
      }
      setUser(currentUser);
    }
  });
  return unsubscribe;
}, []);
```

## Real-time Synchronization

### Firestore Listeners
- **onSnapshot**: Real-time document and collection updates
- **Connection Management**: Network state detection with offline handling
- **Listener Cleanup**: Proper unsubscribe patterns to prevent memory leaks

### Optimistic Updates
- **Like/Dislike Actions**: Immediate UI updates before Firestore write confirmation
- **Message Sending**: Local state updates with server synchronization
- **Error Handling**: Rollback mechanisms for failed operations

## Performance Optimizations

### Image Loading Strategy
- **LoadingPlaceholder Component**: Progressive loading with skeleton screens
- **Fallback Images**: Automatic fallback to default assets on load failure
- **CDN Optimization**: Firebase Storage automatic CDN distribution

### Bundle Optimization
- **Vite Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Route-based code splitting with React.lazy (not currently implemented)
- **Asset Optimization**: Automatic minification and compression

### Database Query Optimization
- **Firestore Indexes**: Composite indexes for complex queries
- **Query Limitations**: 10-item limit for Firestore "in" queries
- **Data Denormalization**: Strategic data duplication for read performance

## Development Setup

### Prerequisites
- Node.js 18+ with npm package manager
- Firebase CLI for deployment
- Git for version control

### Local Development
```bash
# Clone repository
git clone https://github.com/your-username/roskilde-trade-app.git
cd roskilde-trade-app

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Configuration
Firebase configuration is hardcoded in `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAq_FHFKZ0NMTB3Z51RkSeWn9aif7RPdLk",
  authDomain: "roskilde-trade.firebaseapp.com",
  projectId: "roskilde-trade",
  storageBucket: "roskilde-trade.firebasestorage.app",
  messagingSenderId: "599145097942",
  appId: "1:599145097942:web:b62b1a858afa8c22eaf777",
  measurementId: "G-NS34C8F4EE"
};
```

### ESLint Configuration
```javascript
// eslint.config.js - ES Module configuration
export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];
```

## Build & Deployment

### Build Process
```bash
# Production build
npm run build

# Build output directory
frontend/dist/

# Preview production build locally
npm run preview
```

### Firebase Hosting Configuration
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Deployment Pipeline
```bash
# Build and deploy to Firebase Hosting
npm run build
firebase deploy
```

## Security Implementation

### Admin Access Control
Hardcoded admin email addresses in `AdminContext.jsx`:
```javascript
const ADMIN_EMAILS = [
  "philippzhuravlev@gmail.com",
  "crillerhylle@gmail.com"
];
```

### Client-Side Security Limitations
- **Admin Role Validation**: Client-side only (vulnerable to manipulation)
- **Firestore Security Rules**: Not documented (server-side validation required)
- **Authentication State**: Vulnerable to client-side tampering

### Recommended Security Improvements
1. Implement server-side admin role validation
2. Add Firestore Security Rules documentation
3. Implement proper RBAC (Role-Based Access Control)
4. Add rate limiting for API operations

## Testing & Quality Assurance

### Current Testing Status
- **Unit Tests**: Not implemented
- **Integration Tests**: Not implemented
- **E2E Tests**: Not implemented

### Code Quality Tools
- **ESLint**: Configured with React-specific rules
- **Prettier**: Not configured
- **TypeScript**: Not implemented (using JSX)

### Bug Reporting System
Integrated bug reporting with:
- Screenshot upload capability
- Automatic user context capture (browser, URL, timestamp)
- Admin dashboard for bug report management
- Status tracking (open/resolved)

## Project Structure

```
roskilde-trade-app/
├── firebase.json                     # Firebase Hosting configuration
├── frontend/
│   ├── public/                       # Static assets
│   │   ├── logo-compressed.png       # Optimized logo asset
│   │   ├── default_pfp.jpg          # Fallback profile image
│   │   └── team/                     # Team member photos
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── SwipePage.jsx        # Fisher-Yates shuffle + Framer Motion
│   │   │   ├── ChatPage.jsx         # Real-time messaging interface
│   │   │   ├── BugReport.jsx        # Bug reporting with screenshot upload
│   │   │   ├── Admin.jsx            # Admin dashboard with statistics
│   │   │   ├── LoadingPlaceholder.jsx # Progressive image loading
│   │   │   └── [other components]
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Firebase Auth state management
│   │   │   ├── ItemsContext.jsx     # Item CRUD with Firestore arrays
│   │   │   ├── ChatContext.jsx      # Dual chat data structure
│   │   │   ├── AdminContext.jsx     # Hardcoded role-based access
│   │   │   └── PopupContext.jsx     # Global notification system
│   │   ├── hooks/
│   │   │   └── usePopup.js          # Custom popup state management
│   │   ├── firebase.js              # Firebase SDK configuration
│   │   ├── App.jsx                  # Router and provider hierarchy
│   │   └── main.jsx                 # Application entry point
│   ├── package.json                 # Dependencies and scripts
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── eslint.config.js            # ESLint ES Module configuration
└── README.md                        # Technical documentation
```

## Database Relationships

```
users (collection)
├── {userId} (document)
    ├── likedItemIds: string[]       # References to items collection
    └── dislikedItemIds: string[]    # References to items collection

items (collection)
├── {itemId} (document)
    └── userId: string               # Reference to users collection

chats (collection)
├── {chatId} (document)
    ├── participants: string[]       # References to users collection
    ├── itemId: string              # Reference to items collection
    └── messages (subcollection)
        └── {messageId} (document)

userChats (collection)
├── {userId} (document)
    └── chats (subcollection)
        └── {chatId} (document)     # Denormalized chat data

bugReports (collection)
├── {reportId} (document)
    └── userId: string              # Reference to users collection
```

## Performance Metrics

### Bundle Size Analysis
- **React 19.0.0**: ~45KB (gzipped)
- **Firebase 11.5.0**: ~280KB (gzipped)
- **Framer Motion 12.18.2**: ~95KB (gzipped)
- **Total Bundle Size**: ~500KB (estimated, gzipped)

### Real-time Performance
- **Firestore Connection**: WebSocket-based with automatic reconnection
- **Message Latency**: <100ms (typical)
- **Image Loading**: Progressive with CDN optimization

## Contributing

### Development Standards
- **Component Structure**: Functional components with hooks
- **State Management**: Context API with custom hooks
- **Styling**: Tailwind CSS utility classes
- **File Naming**: PascalCase for components, camelCase for utilities

### Code Review Checklist
1. Firebase listener cleanup implemented
2. Loading states handled properly
3. Error boundaries for async operations
4. Mobile-responsive design maintained
5. Performance optimizations considered

## License

MIT License - Open source project

## Team & Maintenance

- **Lead Developer**: Philipp Zhuravlev (philippzhuravlev@gmail.com)
- **Co-developer**: Christian Hyllested (crillerhylle@gmail.com)
- **Additional Contributors**: Hannah, Lilian, Akkash

## Technical Debt & Future Improvements

### High Priority
1. Implement proper Firestore Security Rules
2. Add server-side admin role validation
3. Implement comprehensive error boundary system
4. Add unit and integration test coverage

### Medium Priority
1. Migrate to TypeScript for better type safety
2. Implement code splitting for better performance
3. Add proper loading states for all async operations
4. Implement proper caching strategy

### Low Priority
1. Add PWA (Progressive Web App) features
2. Implement push notifications
3. Add dark mode support
4. Implement advanced search and filtering