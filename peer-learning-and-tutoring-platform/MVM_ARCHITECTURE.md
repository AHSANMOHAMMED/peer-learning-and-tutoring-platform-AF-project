# MVM (Model-View-ViewModel) Architecture Implementation

## Overview

This project implements the Model-View-ViewModel (MVM) architectural pattern to provide a clean separation of concerns, maintainable codebase, and reactive state management for the PeerLearn platform.

## Architecture Components

### Frontend (Client)

#### 📁 Models (`src/models/`)
**Purpose**: Define data structures and business logic for entities

- **User.js**: User entity with authentication methods, role checking, and profile management
- **Tutor.js**: Tutor entity with subjects, availability, rating management
- **Booking.js**: Booking entity with status management, time handling, and validation

**Features**:
- Data validation and transformation
- Computed properties (getters)
- Business logic methods
- API response parsing
- JSON serialization

#### 🧠 ViewModels (`src/viewmodels/`)
**Purpose**: Manage state and business logic between Views and Models

- **AuthViewModel**: Authentication state, login/register/logout operations
- **TutorViewModel**: Tutor data management, search, filtering, CRUD operations
- **BookingViewModel**: Booking lifecycle management, status updates, filtering

**Features**:
- Reactive state management with observer pattern
- Loading and error state handling
- Data transformation and validation
- API integration
- Pagination and filtering support

#### 👁️ Views (`src/views/`)
**Purpose**: UI components that consume ViewModels and render data

- **LoginView**: Login form with authentication integration
- **RegisterView**: Registration form with role-based fields
- **Future Views**: Dashboard, TutorList, BookingManagement, etc.

**Features**:
- Clean separation from business logic
- Reactive UI updates
- Form validation
- Loading and error states
- User interaction handling

#### 🌐 Services (`src/services/`)
**Purpose**: API communication layer

- **api.js**: Axios configuration, interceptors, error handling
- **authService.js**: Authentication API calls
- **tutorService.js**: Tutor-related API calls
- **bookingService.js**: Booking-related API calls

**Features**:
- Centralized API configuration
- Request/response interceptors
- Error handling and transformation
- Authentication token management
- File upload support

#### 🔄 Context (`src/contexts/`)
**Purpose**: Global state management and dependency injection

- **AuthContext.js**: Authentication state provider for the entire app

**Features**:
- Global authentication state
- Dependency injection for ViewModels
- Automatic authentication check on app load

### Backend (Server)

#### 📊 Models (`server/models/`)
**Purpose**: Database schema definitions and data validation

- **User.js**: User schema with password hashing, validation, indexes

**Features**:
- Mongoose schema definitions
- Data validation and constraints
- Password hashing with bcrypt
- Virtual properties and methods
- Database indexes for performance

#### 🎮 Controllers (`server/controllers/`)
**Purpose**: Request handling and business logic

- **authController.js**: Authentication operations (register, login, password reset)

**Features**:
- Request validation
- Business logic implementation
- Error handling
- JWT token generation
- Security measures

#### 🛡️ Middleware (`server/middleware/`)
**Purpose**: Request processing and security

- **auth.js**: JWT authentication, role-based authorization

**Features**:
- Token verification
- User authentication
- Role-based access control
- Optional authentication support

#### 🛣️ Routes (`server/routes/`)
**Purpose**: API endpoint definitions and validation

- **auth.js**: Authentication routes with validation rules

**Features**:
- Route definitions
- Input validation with express-validator
- Controller mapping
- Error handling

## Data Flow

### Authentication Flow
```
View (LoginView) → ViewModel (AuthViewModel) → Service (authService) → API → Controller (authController) → Model (User)
```

### Data Retrieval Flow
```
API Response → Service → ViewModel → Model → View (UI Update)
```

### State Management Flow
```
User Action → View → ViewModel → State Update → View Re-render
```

## Key Benefits

### 1. **Separation of Concerns**
- **Views**: Only handle UI and user interactions
- **ViewModels**: Manage state and business logic
- **Models**: Define data structures and validation
- **Services**: Handle API communication

### 2. **Reactive State Management**
- Observer pattern implementation in ViewModels
- Automatic UI updates when state changes
- Consistent state across components

### 3. **Testability**
- Each layer can be tested independently
- Mock services for unit testing
- Isolated business logic in ViewModels

### 4. **Maintainability**
- Clear code organization
- Reduced coupling between components
- Easy to add new features

### 5. **Scalability**
- Modular architecture supports growth
- Reusable ViewModels and Services
- Consistent patterns across features

## Usage Examples

### Using AuthViewModel in a Component
```jsx
import { useAuthViewModel } from '../viewmodels/AuthViewModel';

function MyComponent() {
  const { user, login, logout, isLoading, error } = useAuthViewModel();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Navigate to dashboard
    }
  };
  
  return (
    // JSX with reactive state
  );
}
```

### Creating a New ViewModel
```javascript
export class ExampleViewModel {
  constructor() {
    this.data = [];
    this.isLoading = false;
    this.listeners = [];
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
  }
  
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }
  
  async fetchData() {
    this.setLoading(true);
    try {
      const response = await apiService.get('/api/data');
      this.setData(response.data);
    } catch (error) {
      this.setError(error.message);
    }
  }
}
```

## Next Steps

1. **Complete Authentication**: Add email verification, social login
2. **Tutor Management**: Implement tutor profiles, subjects, availability
3. **Booking System**: Create booking flow, session management
4. **Real-time Features**: Add WebSocket integration for live sessions
5. **Testing**: Implement unit and integration tests
6. **Performance**: Add caching, optimization, and monitoring

## Best Practices

### Frontend
- Keep Views focused on UI logic only
- Use ViewModels for all state management
- Implement proper error handling in ViewModels
- Use TypeScript for better type safety (future enhancement)
- Follow consistent naming conventions

### Backend
- Validate all inputs at the controller level
- Use middleware for cross-cutting concerns
- Implement proper error handling and logging
- Use environment variables for configuration
- Follow RESTful API design principles

This MVM architecture provides a solid foundation for building a scalable, maintainable, and feature-rich peer learning platform.
