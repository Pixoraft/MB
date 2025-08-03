# Meta Build - Personal Productivity and Self-Improvement Web App

## Overview

Meta Build is a comprehensive full-stack personal productivity and self-improvement web application designed to help users track and manage various aspects of their daily life. The application includes six core modules: Dashboard (overview), Daily Tasks, Workout tracking, Mind Workouts, Daily Routines, and Development Tracker for goals. Built with modern web technologies, it features a clean, responsive interface with real-time data visualization through charts and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes
- **Charts**: Chart.js integration for data visualization (pie charts, bar charts)
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the entire stack for consistency
- **API Design**: RESTful API structure with dedicated routes for each feature module
- **Development**: Hot module replacement via Vite in development mode
- **Build Process**: ESBuild for production bundling with platform-specific optimizations

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **Schema Management**: Shared schema definitions using Zod for validation across client and server
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Local Storage**: Client-side localStorage utilities for user preferences and temporary data

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Security**: Built-in middleware for request logging and error handling
- **Client State**: Theme preferences and user settings stored locally

### External Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **UI Framework**: Radix UI primitives for accessible components
- **Charts**: Chart.js for data visualization
- **Development Tools**: Vite for development server and build tooling
- **Validation**: Zod for runtime type checking and schema validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with class-variance-authority for component variants

The application follows a modular architecture with clear separation between frontend and backend concerns. The shared schema ensures type safety across the entire stack, while the component-based frontend architecture promotes reusability and maintainability. The use of modern tools like Drizzle ORM and TanStack Query provides excellent developer experience with type inference and automatic cache invalidation.