# Perfect Bank - Frontend

A modern React TypeScript frontend for the Online Banking System.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router v6** for navigation
- **React Hook Form** for form handling
- **React Query** for API state management
- **Axios** for HTTP requests
- **Vite** for build tooling

## 📁 Project Structure

```
src/
├── api/            # Axios configuration
├── components/     # Reusable UI components
├── constants/      # App constants and enums
├── context/        # React contexts (Auth, Theme)
├── hooks/          # Custom React hooks
├── layouts/        # Page layouts
├── pages/          # Route-level pages
├── routes/         # Route configuration
├── services/       # API service layer
├── theme/          # Material-UI theme
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update API base URL if needed

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🔐 Authentication

The app uses JWT-based authentication with role-based access control:

- **Customer**: Account management, transactions
- **BranchManager**: Approvals, branch operations
- **Admin**: Full system access

## 🎯 Features

### Customer Features
- ✅ Login/Logout
- ✅ Dashboard with account overview
- ✅ View accounts and balances
- ✅ Create new accounts
- 🚧 Make deposits, withdrawals, transfers
- 🚧 View transaction history
- 🚧 Download statements

### Staff Features
- ✅ Role-based dashboard
- 🚧 Approve pending accounts
- 🚧 Approve pending transactions
- 🚧 Process deposits
- 🚧 Generate reports

## 🔄 API Integration

All API calls are handled through service layers:
- `authService` - Authentication
- `accountService` - Account operations
- `transactionService` - Transaction operations

## 🎨 UI/UX

- Material Design components
- Responsive layout
- Role-based navigation
- Loading states and error handling
- Form validation

## 🚧 Development Status

**Completed:**
- ✅ Project setup and architecture
- ✅ Authentication system
- ✅ Dashboard layouts
- ✅ Account management (view/create)
- ✅ Role-based routing

**In Progress:**
- 🚧 Transaction forms
- 🚧 Approval workflows
- 🚧 Statement generation

**Planned:**
- 📋 Advanced filtering
- 📋 Real-time notifications
- 📋 Dark theme support
- 📋 PWA features

## 🔗 Backend Integration

Ensure the backend API is running on `https://localhost:7245` before starting the frontend.

## 📝 Code Standards

Following the established React coding standards:
- Functional components with hooks
- TypeScript for type safety
- Material-UI for consistent design
- Clean architecture principles
- Proper error handling