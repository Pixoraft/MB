# Meta Build - Personal Productivity and Self-Improvement Web App

## Overview

Meta Build is a comprehensive full-stack personal productivity and self-improvement web application designed to help users track and manage various aspects of their daily life. The application includes six core modules: Dashboard (overview), Daily Tasks, Workout tracking, Mind Workouts, Daily Routines, and Development Tracker for goals. Built with modern web technologies, it features a clean, responsive interface with real-time data visualization through charts and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.
Integration preference: Add new features to existing pages rather than creating separate pages.

## Recent Changes

### August 3, 2025 - Complete Workout System Enhancement
- **Comprehensive 7-Day Full Body Routine**: Added complete workout plan with 44 exercises organized by day:
  - Day 1 (Monday): Push - Chest, Shoulders, Triceps, Abs
  - Day 2 (Tuesday): Pull - Back, Biceps, Forearms, Grip  
  - Day 3 (Wednesday): Legs - Quads, Glutes, Calves
  - Day 4 (Thursday): Core - Six-Pack, Obliques, Stability
  - Day 5 (Friday): Power - Explosive + Grip Veins
  - Day 6 (Saturday): Stretch - Light Sculpting + Relaxing
  - Day 7 (Sunday): Rest - Optional light activities

- **30-Day Arms & Grip Specialized Routine**: Added comprehensive forearm and grip strength program:
  - Monday: High-Volume Gripper (endurance + blood flow)
  - Tuesday: Strength + Static Hold (crushing power + tendon strength)
  - Wednesday: Recovery + Light Pump (recovery with light flow)
  - Thursday: Mixed Monster Circuit (strength + pump combination)
  - Friday: Reverse Focus (balance & injury prevention)
  - Saturday: Max Test & Burnout (testing limits)
  - Sunday: Rest/Recovery (stretching and recovery)

- **Improved Workout Organization**: 
  - Separated workout types (Full Body vs Arms & Grip) in both daily and weekly tabs
  - Daily tab shows workout types in separate organized boxes
  - Weekly tab uses clickable workout type selection before showing day schedules
  - Each workout type shows completion statistics

- **Removed Missed Workouts Feature**: Simplified workout interface by removing missed workout tracking and display (August 3, 2025)

- **Enhanced Current Day Highlighting**: Added visual indicators for current day across all day-based interfaces (August 3, 2025):
  - Workout page weekly day tabs: Ring border and blue dot indicator for today
  - Routine modal day checkboxes: Special background and "Today" badge for current day
  - Workout modal day dropdown: Highlighted current day option with blue styling
  - Calendar component: Already had excellent current day highlighting with gradient and ring

- **Comprehensive Development Goals System**: Created structured roadmap for ₹60K/month Full-Stack Developer goal (August 3, 2025):
  - 1 Yearly Goal: Become ₹60K/month Full-Stack Developer by 2025
  - 3 Monthly Goals: April (Foundation), May (Full-Stack), June (Real Projects)  
  - 12 Weekly Goals: JavaScript → React → Node.js → Portfolio → Auth → Projects → Freelancing
  - Goals automatically initialized based on 2025-2030 career roadmap
  - Each goal includes specific deliverables and skill milestones

- **Professional Interface**: Clean, Microsoft/Google-style design with minimal animations and better visual hierarchy

### August 3, 2025 - Skincare Routine Integration
- Integrated comprehensive skincare, haircare & hygiene routine into existing Daily Routine page
- Added 15 pre-defined skincare routine items covering:
  - Morning routine: Detox drink, ice treatment, face wash, face pack, moisturizer + sunscreen
  - Evening routine: Cleansing, serum, night moisturizer, dark spot treatment
  - Weekly routines: Lip scrub, body exfoliation, ubtan mask, lemon treatment, hair care
- Added skincare tips section with diet recommendations and foods to avoid
- Removed separate skincare page and integrated everything into daily routine structure
- All skincare items use existing routine system with proper categorization (morning/night/weekly)

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