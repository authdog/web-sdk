# Vue App with Authdog

This is an example Vue.js application demonstrating how to use the Authdog Vue SDK.

## Features

- Vue 3 with Composition API
- Vue Router for navigation
- TypeScript support
- Authdog authentication integration
- Responsive design

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Set up your Authdog credentials:
   - Replace `pk_your_public_key_here` in the components with your actual public key
   - Configure your Authdog environment

3. Start the development server:

```bash
bun dev
```

4. Open your browser and navigate to `http://localhost:3001`

## Usage

### Authentication Flow

1. **Home Page**: Shows authentication status
2. **Login Page**: Redirects to Authdog for authentication
3. **Profile Page**: Displays user information after authentication

### Key Components

- `AuthdogProvider`: Wraps the app to provide authentication context
- `useSession()`: Composable to access session information
- `useUser()`: Composable to fetch and manage user data
- `useSignIn()`: Composable to handle sign-in flow
- `useSignOut()`: Composable to handle sign-out

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AUTHDOG_PUBLIC_KEY=pk_your_public_key_here
VITE_AUTHDOG_SECRET_KEY=sk_your_secret_key_here
```

## Project Structure

```
src/
├── components/     # Reusable Vue components
├── views/         # Page components
│   ├── Home.vue
│   ├── Profile.vue
│   └── Login.vue
├── router/        # Vue Router configuration
├── App.vue        # Root component
├── main.ts        # Application entry point
└── style.css      # Global styles
```

## Development

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run type-check` - Run TypeScript type checking
