# AGENTS.md - Development Guidelines for Las Rojas

## Project Overview
Las Rojas is a React-based wine e-commerce platform built with Create React App. The application serves Spanish-speaking users with a complete shopping experience including product catalog, user authentication, and admin functionality.

## Development Commands

### Core Commands
```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Run specific test file
npm test -- --testPathPattern=App.test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Package Management
- Primary: `npm` (package-lock.json present)
- Alternative: `pnpm` (pnpm-lock.yaml also available)
- Use `npm install <package>` for new dependencies

## Code Architecture & Structure

### Current Architecture
- **Monolithic Component**: All components currently in `src/App.js` (993 lines)
- **State Management**: React Context API (`AppContext`)
- **Styling**: Inline JavaScript objects (no CSS files)
- **Routing**: None (single-page application with conditional rendering)

### File Organization
```
src/
├── index.js          # React DOM entry point
├── App.js            # Main application (all components)
├── App.css           # Global styles (minimal usage)
├── index.css         # Base styles
├── App.test.js       # Basic test file
├── setupTests.js     # Jest configuration
└── reportWebVitals.js # Performance monitoring
```

## Code Style Guidelines

### JavaScript/React Conventions
- **Language**: JavaScript ES6+ (no TypeScript)
- **Components**: Functional components with hooks
- **Naming**: 
  - Components: PascalCase (`ProductoCard`, `LoginForm`)
  - Functions/Variables: camelCase (`handleLogin`, `usuarioActual`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Imports**: Group imports in order:
  1. React imports
  2. Third-party libraries
  3. Local components/hooks
  4. Utility functions

```javascript
// Correct import order
import React, { useState, useContext } from 'react';
import { LucideShoppingCart, LucideUser } from 'lucide-react';
import { AppContext } from './AppContext';
import { formatPrice } from './utils';
```

### Component Structure
```javascript
const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useContext, etc.)
  const [state, setState] = useState(initialValue);
  const { globalState } = useContext(AppContext);
  
  // 2. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 3. Derived values/computations
  const computedValue = state * 2;
  
  // 4. Conditional rendering logic
  if (condition) {
    return <div>Conditional content</div>;
  }
  
  // 5. Main JSX
  return (
    <div style={styles.container}>
      {/* JSX content */}
    </div>
  );
};

// Styles object (after component)
const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#fff'
  }
};
```

### Styling Conventions
- **Inline Styles Only**: Use JavaScript objects for all styling
- **Style Objects**: Define styles after component declaration
- **Naming**: Use camelCase for style properties
- **Responsive**: Include responsive breakpoints in style objects

```javascript
const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#ffffff',
    '@media (max-width: 768px)': {
      padding: '0.5rem'
    }
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#8B0000', // Wine red
    color: '#ffffff',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#660000'
    }
  }
};
```

## State Management

### Context API Usage
- **Global State**: Use `AppContext` for application-wide state
- **Custom Hook**: Use `useApp()` hook to access context
- **State Structure**: Keep context state flat and organized

```javascript
// Context state structure
const initialState = {
  user: null,
  products: [],
  cart: [],
  isAdmin: false,
  loading: false,
  error: null
};

// Access pattern
const { user, products, setUser, setProducts } = useApp();
```

## Error Handling

### Form Validation
- Validate user inputs before API calls
- Provide clear error messages in Spanish
- Use controlled components for form state

```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!formData.email) newErrors.email = 'El email es requerido';
  if (!formData.password) newErrors.password = 'La contraseña es requerida';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### API Error Handling
- Wrap API calls in try-catch blocks
- Set error state for user feedback
- Log errors for debugging

## Testing Guidelines

### Test Structure
- **Framework**: React Testing Library with Jest
- **Location**: `src/App.test.js` (expand as needed)
- **Naming**: Test files: `ComponentName.test.js`

### Testing Patterns
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const loginButton = screen.getByText('Iniciar Sesión');
  expect(loginButton).toBeInTheDocument();
});

test('handles form submission', () => {
  render(<App />);
  const emailInput = screen.getByLabelText('Email');
  const submitButton = screen.getByText('Iniciar Sesión');
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(submitButton);
  
  // Assert expected behavior
});
```

## Development Best Practices

### Code Organization
- **Current**: All components in `App.js` (acceptable for current size)
- **Future**: Consider splitting into separate component files as the app grows
- **Grouping**: Keep related components and functions together

### Performance
- Use `React.memo()` for components that re-render unnecessarily
- Implement proper loading states
- Optimize re-renders with useCallback/useMemo where needed

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation support
- Maintain good color contrast ratios

## Localization

### Language Requirements
- **Primary Language**: Spanish
- **UI Text**: All user-facing text must be in Spanish
- **Error Messages**: Spanish error messages
- **Comments**: Spanish comments preferred for consistency

### Common Spanish Terms
- User: `usuario`
- Password: `contraseña`
- Email: `email`/`correo`
- Cart: `carrito`
- Product: `producto`
- Price: `precio`
- Login: `iniciar sesión`
- Logout: `cerrar sesión`
- Register: `registrarse`

## Git Workflow

### Commit Messages
- Use Spanish for commit messages when possible
- Format: `type: description` (e.g., `feat: agregar carrito de compras`)
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branch Naming
- Use kebab-case with Spanish when appropriate
- Examples: `feature/carrito-compras`, `fix/login-validation`

## Build & Deployment

### Production Build
- Run `npm run build` before deployment
- Test build locally before deploying
- Ensure all environment variables are properly configured

### Environment Variables
- Use `.env` files for local development
- Prefix with `REACT_APP_` for Create React App
- Never commit sensitive environment data

## Security Considerations

- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for API calls
- Implement proper authentication checks
- Never expose sensitive data in client-side code