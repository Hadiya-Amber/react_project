# Perfect Bank - Banking Management System

A comprehensive banking management system built with React (Frontend) and Node.js (Backend).

## Features

### Frontend (React + TypeScript + Vite)
- **Multi-Role Dashboard**: Customer, Branch Manager, and Admin interfaces
- **Account Management**: Create and manage different account types (Savings, Current, Minor)
- **Transaction System**: Deposits, withdrawals, transfers with real-time processing
- **Security Features**: Role-based access control, secure authentication
- **Modern UI**: Material-UI components with professional design
- **Performance Optimized**: React 19 with concurrent features

### Backend (Node.js + Express + TypeScript)
- **RESTful API**: Comprehensive banking operations API
- **Database Integration**: SQL Server with Entity Framework-like ORM
- **Authentication**: JWT-based secure authentication
- **Role Management**: Multi-tier user roles and permissions
- **Transaction Processing**: Real-time transaction handling
- **Data Validation**: Comprehensive input validation and sanitization

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Material-UI (MUI)
- React Router
- Axios
- Context API for state management

### Backend
- Node.js
- Express.js
- TypeScript
- SQL Server
- JWT Authentication
- bcrypt for password hashing
- Express Validator

## Project Structure

```
Perfect/
├── Frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── theme/         # UI theme configuration
│   └── package.json
├── Backend/           # Node.js backend application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- SQL Server

### Installation

1. Clone the repository
```bash
git clone https://github.com/Hadiya-Amber/react_project.git
cd react_project
```

2. Install Frontend dependencies
```bash
cd Frontend
npm install
```

3. Install Backend dependencies
```bash
cd ../Backend
npm install
```

4. Set up environment variables
```bash
# Backend/.env
DATABASE_URL=your_sql_server_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend/.env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development servers

Backend:
```bash
cd Backend
npm run dev
```

Frontend:
```bash
cd Frontend
npm run dev
```

## Features Overview

### User Roles
- **Customer**: Account management, transactions, profile settings
- **Branch Manager**: Customer account approval, transaction oversight
- **Admin**: System-wide management, branch operations, user management

### Account Types
- **Savings Account**: Personal savings with interest
- **Current Account**: Business transactions
- **Minor Account**: For customers under 18 years

### Transaction Types
- Cash Deposits
- Cash Withdrawals
- Fund Transfers
- Bill Payments
- Account-to-account transfers

## Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password hashing
- CORS protection
- Rate limiting

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any questions or support, please contact the development team.