# AmarNursery Frontend

A modern React.js frontend for the AmarNursery plant e-commerce platform.

## Features

- ✅ Modern React 18 with Hooks
- ✅ Redux Toolkit for state management
- ✅ Material-UI (MUI) for components
- ✅ React Router for navigation
- ✅ Responsive design
- ✅ Environment-based configuration
- ✅ Clean, dependency-free architecture

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   npm run setup
   # This copies .env.example to .env
   ```

3. **Update environment variables:**
   Edit `.env` file with your actual API URL:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_NAME` - Application name
- `REACT_APP_VERSION` - Application version

## Project Structure

```
src/
├── app/                 # Redux store configuration
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── cart/           # Shopping cart components
│   ├── common/         # Common/shared components
│   ├── layout/         # Layout components
│   └── products/       # Product-related components
├── features/           # Redux slices
├── pages/              # Page components
├── styles/             # Theme and styling
└── utils/              # Utilities
    ├── api.js          # API functions
    ├── config.js       # Configuration
    └── storage.js      # localStorage utilities
```

## Key Components

### Authentication
- Login/Register with form validation
- JWT token management
- Protected routes

### Products
- Product listing with pagination
- Product details
- Search and filtering
- Shopping cart functionality

### Layout
- Responsive header with navigation
- Mobile-friendly drawer
- Footer with links

## API Integration

The frontend is designed to work with the AmarNursery backend API. All API calls are centralized in `utils/api.js` and can be easily configured via environment variables.

### API Functions Available:
- `userAPI` - User registration, login, profile management
- `productAPI` - Product listing, details, reviews
- `categoryAPI` - Product categories
- `orderAPI` - Order management

## Dependencies Removed

This frontend has been cleaned of all hardcoded dependencies:

- ❌ No hardcoded admin credentials
- ❌ No admin-specific components or routes
- ❌ No hardcoded API URLs
- ❌ No hardcoded sample data
- ❌ No localStorage access without utility functions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run setup` - Setup environment file

### Adding New Features

1. Create components in appropriate `components/` subdirectory
2. Add pages to `pages/` directory
3. Add Redux slices to `features/` directory
4. Update routing in `App.jsx`
5. Add API functions to `utils/api.js`

## Production Build

```bash
npm run build
```

The build folder contains the production-ready files.

## Contributing

1. Follow the existing code structure
2. Use the provided utilities for storage and API calls
3. Maintain responsive design principles
4. Test on both desktop and mobile devices
