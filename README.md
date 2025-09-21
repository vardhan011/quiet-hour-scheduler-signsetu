# Quiet Hours - Study Scheduler

A modern study session scheduler with automated email reminders built for the SignSetu technical assignment.

## 🚀 Live Demo

**Production URL:** [https://quiet-hour-scheduler-signsetu.vercel.app/](https://quiet-hour-scheduler-signsetu.vercel.app/)

## 📋 Features

- **User Authentication** - Secure login/signup with Supabase
- **Study Session Scheduling** - Create and manage study blocks with custom durations
- **Automated Email Reminders** - Get notified 10 minutes before each session
- **Real-time Updates** - Live countdown timers and status indicators
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smart Status Tracking** - Visual indicators for upcoming, active, and completed sessions

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 with React Server Components
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Authentication:** Supabase Auth
- **Email Service:** EmailJS
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 🎯 Key Functionality

### Authentication Flow
- Email/password registration and login
- Session management with Supabase
- Protected routes and user-specific data

### Study Session Management
- Create study sessions with title, date/time, and duration
- Visual countdown timers showing time until session starts
- Smart status badges (Scheduled, Starting Soon, Email Sent, Completed)
- Real-time UI updates every 30 seconds

### Email Reminder System
- Automated reminders sent 10 minutes before each session
- Beautiful HTML email templates with session details
- EmailJS integration for reliable delivery
- Manual trigger system for testing

## 🏗️ Architecture

### Frontend Components
- `StudyBlockForm` - Session creation interface
- `StudyBlocksList` - Display and manage sessions
- `Dashboard` - Main application interface
- `AuthForm` - Login/registration handling

### Backend APIs
- `/api/study-blocks` - CRUD operations for study sessions
- `/api/cron/send-reminders` - Email reminder automation
- MongoDB integration for data persistence

### Database Schema
