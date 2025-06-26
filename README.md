# RosSwap - Roskilde Festival Trading Platform

A modern React-based trading platform designed for festival-goers to trade items, food, and services. Built with real-time collaboration features and a focus on user experience.

## Live Demo

[RosSwap App](https://roskilde-trade.firebaseapp.com)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Key Components](#key-components)
- [State Management](#state-management)
- [Firebase Integration](#firebase-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

RosSwap is a **single-page application (SPA)** that enables festival attendees to trade items, food, and services with each other. The platform features a Tinder-like swipe interface for discovering items, real-time chat functionality, and a comprehensive item management system.

### Core Features
- **Item Trading**: Post, browse, and trade items with other users
- **Swipe Interface**: Tinder-like discovery experience
- **Real-time Chat**: Instant messaging between users
- **User Authentication**: Google OAuth and email/password login
- **Admin Panel**: Content moderation and platform management
- **Image Upload**: Firebase Storage integration for item photos

## Features

### User Features
- **Authentication**: Google Sign-in and email/password
- **Swipe Discovery**: Tinder-like interface for finding items
- **Real-time Chat**: Instant messaging with item context
- **Like System**: Save favorite items for later
- **Image Upload**: Upload photos for item listings
- **User Profiles**: Manage personal information and preferences

### Admin Features
- **Content Moderation**: Remove inappropriate items
- **Platform Statistics**: View usage metrics
- **User Management**: Monitor user activity

### Technical Features
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Tailwind CSS with custom orange theme
- **Optimistic Updates**: Smooth user experience
- **Analytics**: Firebase Analytics integration

## Technology Stack

### Frontend
- **React 19.0.0** - UI framework
- **Vite 6.2.0** - Build tool and dev server
- **React Router DOM 7.4.0** - Client-side routing
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Framer Motion 12.18.2** - Animation library
- **Lucide React** - Icon library
- **React Swipeable 7.0.2** - Gesture handling

### Backend & Services
- **Firebase 11.5.0** - Complete backend solution
  - **Firebase Authentication** - User management
  - **Firestore** - NoSQL database
  - **Firebase Storage** - File storage
  - **Firebase Analytics** - Usage tracking
  - **Firebase Hosting** - Web hosting

### Development Tools
- **ESLint 9.21.0** - Code linting
- **PostCSS 8.5.3** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

## Architecture

### Context-Based State Management
The application uses React Context API with a layered provider structure:

```
App
├── AuthProvider (User authentication)
├── AdminProvider (Admin role management)
├── ItemsProvider (Item CRUD operations)
├── ChatProvider (Real-time messaging)
└── PopupProvider (Global notifications)
```

### Component Architecture
- **Layout Components**: Navbar, routing structure
- **Feature Components**: SwipePage, ChatPage, ItemList
- **UI Components**: Popup, forms, cards
- **Context Providers**: State management layers

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/roskilde-trade-app.git
   cd roskilde-trade-app
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication, Firestore, Storage, and Analytics
   - Update `src/firebase.js` with your Firebase config

4. **Environment Configuration**
   ```javascript
   // src/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
roskilde-trade-app/
├── firebase.json                 # Firebase hosting config
├── frontend/
│   ├── public/                   # Static assets
│   │   ├── logo.png
│   │   ├── default_pfp.jpg
│   │   └── team/                 # Team member photos
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── About.jsx         # About page
│   │   │   ├── AddItem.jsx       # Item creation form
│   │   │   ├── Admin.jsx         # Admin panel
│   │   │   ├── ChatList.jsx      # Chat overview
│   │   │   ├── ChatPage.jsx      # Individual chat
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── ItemList.jsx      # Item grid view
│   │   │   ├── ItemPage.jsx      # Item details
│   │   │   ├── Liked.jsx         # User's liked items
│   │   │   ├── Login.jsx         # Authentication
│   │   │   ├── LoginRequired.jsx # Route protection
│   │   │   ├── Navbar.jsx        # Navigation
│   │   │   ├── Popup.jsx         # Modal dialogs
│   │   │   ├── Profile.jsx       # User profile
│   │   │   ├── Signup.jsx        # User registration
│   │   │   └── SwipePage.jsx     # Tinder-like interface
│   │   ├── contexts/             # React Context providers
│   │   │   ├── AdminContext.jsx  # Admin state management
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   ├── ChatContext.jsx   # Chat functionality
│   │   │   ├── ItemsContext.jsx  # Item management
│   │   │   └── PopupContext.jsx  # Notification system
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── usePopup.js       # Popup management hook
│   │   ├── App.jsx               # Main application component
│   │   ├── firebase.js           # Firebase configuration
│   │   ├── main.jsx              # Application entry point
│   │   ├── index.css             # Global styles
│   │   └── App.css               # App-specific styles
│   ├── package.json              # Dependencies and scripts
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── eslint.config.js          # ESLint configuration
└── README.md                     # Project documentation
```

## Data Models

### Firestore Collections

#### Users Collection (`users`)
```javascript
{
  uid: string,                    // Firebase Auth UID
  name: string,                   // Display name
  email: string,                  // User email
  photoURL: string,               // Profile picture URL
  createdAt: timestamp,           // Account creation date
  likedItemIds: array,            // Array of liked item IDs
  dislikedItemIds: array          // Array of disliked item IDs
}
```

#### Items Collection (`items`)
```javascript
{
  title: string,                  // Item title
  description: string,            // Item description
  imageUrl: string,               // Item photo URL
  mode: "bytte" | "sælge",        // Trade or sell mode
  userId: string,                 // Creator's user ID
  userName: string,               // Creator's display name
  createdAt: timestamp            // Creation timestamp
}
```

#### Chats Collection (`chats`)
```javascript
{
  itemId: string,                 // Associated item ID
  itemName: string,               // Item title
  itemImage: string,              // Item photo URL
  participants: [userId1, userId2], // Chat participants
  createdAt: timestamp,           // Chat creation date
  lastMessage: {                  // Most recent message
    text: string,
    timestamp: timestamp,
    senderId: string
  },
  userNames: {                    // Participant names
    [userId]: string
  }
}
```

#### Messages Subcollection (`chats/{chatId}/messages`)
```javascript
{
  senderId: string,               // Message sender
  text: string,                   // Message content
  timestamp: timestamp            // Message timestamp
}
```

#### User Chats Subcollection (`userChats/{userId}/chats`)
```javascript
{
  itemId: string,                 // Associated item ID
  itemName: string,               // Item title
  itemImage: string,              // Item photo URL
  otherUserId: string,            // Other participant's ID
  otherUserName: string,          // Other participant's name
  lastMessage: string,            // Last message text
  lastMessageTime: timestamp,     // Last message timestamp
  unreadCount: number             // Unread messages count
}
```

## Key Components

### Core Components

#### App.jsx
- Main application router with protected routes
- Context provider hierarchy
- Route-based authentication checks

#### Navbar.jsx
- Fixed navigation with slide-out menu
- Real-time unread message counter
- User profile picture and authentication status
- Admin panel access for authorized users

#### SwipePage.jsx
- Tinder-like interface for item discovery
- Gesture-based interaction using `react-swipeable`
- Framer Motion animations for smooth transitions
- Fisher-Yates shuffle algorithm for random item presentation
- Like/dislike functionality with user preference tracking

#### ChatPage.jsx
- Real-time messaging interface
- Auto-scrolling message container
- Message timestamp formatting with `date-fns`
- Chat initialization and metadata management
- Item context display in chat header

#### AddItem.jsx
- Item creation form with image upload
- Firebase Storage integration
- Form validation and error handling
- Trade/sell mode selection

### Context Providers

#### AuthContext.jsx
- Firebase Authentication state management
- User data synchronization with Firestore
- Authentication state persistence
- User profile data enhancement

#### ItemsContext.jsx
- Real-time item subscription management
- CRUD operations for trading items
- Like/dislike functionality
- User preference tracking
- Category filtering and search

#### ChatContext.jsx
- Complex chat system with dual data structure
- Real-time message synchronization
- Unread message counting
- Chat initialization and metadata management
- User-specific chat overview

#### AdminContext.jsx
- Client-side admin role management
- Hardcoded admin email validation
- Admin action logging
- Platform statistics tracking

#### PopupContext.jsx
- Global notification system
- Multiple popup types (info, success, error, confirm)
- Custom hook for easy access
- Consistent UI across the application

## State Management

### Context Architecture
The application uses a layered context architecture for state management:

1. **AuthProvider**: Manages user authentication and profile data
2. **AdminProvider**: Handles admin roles and permissions
3. **ItemsProvider**: Manages item data and user interactions
4. **ChatProvider**: Handles real-time messaging and chat state
5. **PopupProvider**: Manages global notifications and dialogs

### Real-time Synchronization
- Firestore `onSnapshot` listeners for live data updates
- Automatic UI updates when data changes
- Optimistic updates for better user experience
- Proper cleanup of subscriptions

### Custom Hooks
- `usePopup`: Manages popup state and provides convenience methods
- Context-specific hooks for easy state access

## Firebase Integration

### Authentication
- Google OAuth integration
- Email/password authentication
- Automatic user document creation
- Persistent login state

### Firestore Database
- Real-time data synchronization
- Complex queries and filtering
- Subcollection management for scalability
- Optimized data structure for performance

### Firebase Storage
- Image upload and management
- Automatic URL generation
- CDN delivery for fast loading
- Security rules for access control

### Firebase Hosting
- Single-page application hosting
- Custom domain support
- Automatic HTTPS
- Global CDN distribution

## Deployment

### Firebase Hosting Configuration
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Build Process
1. **Development**: `npm run dev` - Vite dev server
2. **Production Build**: `npm run build` - Optimized build
3. **Preview**: `npm run preview` - Local production preview
4. **Deploy**: `firebase deploy` - Deploy to Firebase Hosting

### Environment Setup
- Firebase project configuration
- Security rules for Firestore and Storage
- Authentication providers setup
- Analytics configuration

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- ESLint configuration for code standards
- Prettier integration for code formatting
- TypeScript-ready setup (currently using JSX)
- Modular component architecture

### Performance Optimizations
- Lazy loading of images
- Real-time subscriptions with proper cleanup
- Optimistic updates for better perceived performance
- Component memoization where appropriate

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use meaningful component and variable names
- Add comments for complex logic
- Maintain consistent code formatting

### Testing
- Test all user flows
- Verify real-time functionality
- Check mobile responsiveness
- Validate Firebase integration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

- **Philipp Zhuravlev** - Lead Developer
- **Criller Hylle** - Co-developer
- **Hannah** - Team Member
- **Lilian** - Team Member
- **Akkash** - Team Member

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the Firebase documentation for backend issues

---

**Built with love for the Roskilde Festival community**