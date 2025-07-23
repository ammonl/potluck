# Grillaften

Grillaften is a web application designed to manage  potluck events. It allows users to register items they plan to bring, view other participants' contributions, and manage the event details. The application is built using React, TypeScript, and Supabase for backend services.

## Features

- **User Authentication**: Secure login and registration using Supabase Auth.
- **Real-time Updates**: Automatically updates the event data as users make changes.
- **Multi-language Support**: Supports English and Danish languages.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Admin Panel**: Manage event details and view all registrations.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- Supabase account for backend services.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ammonl/grillaften
   cd grillaften
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project in Supabase.
   - Set up the database using the provided SQL migration files.
   - Configure the Supabase URL and API key in your environment variables.

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Preview the production build**:
   ```bash
   npm run preview
   ```

### Project Structure

- **src/**: Contains the main application code.
  - **components/**: Reusable React components.
  - **hooks/**: Custom React hooks.
  - **lib/**: Supabase client setup.
  - **utils/**: Utility functions for database operations and translations.
- **public/**: Static assets.
- **supabase/**: SQL migration files for database setup.

### Dependencies

- **React**: Frontend library for building user interfaces.
- **React Router**: For routing and navigation.
- **Supabase**: Backend as a service for authentication and database.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **OpenAI**: Integration for AI-powered features.

### Dev Dependencies

- **Vite**: Build tool for faster development.
- **TypeScript**: Typed superset of JavaScript.
- **ESLint**: Linter for identifying and fixing problems in JavaScript code.
