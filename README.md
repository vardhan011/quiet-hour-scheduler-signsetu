# Quiet Hours Scheduler 

A full-stack Next.js application that helps students schedule focused study time with automated email reminders.

## 🚀 Live Demo

- **Live Application**: [Your Vercel URL]
- **GitHub Repository**: [Your GitHub URL]

## 🎯 Features

- **User Authentication**: Secure sign-up/sign-in with email verification
- **Study Block Management**: Create and manage study sessions
- **Automated Email Reminders**: CRON-based system sends reminders 10 minutes before sessions
- **Real-time Updates**: Instant UI updates when creating new blocks
- **Responsive Design**: Works perfectly on desktop and mobile
- **Clean UI**: Modern, professional interface with Tailwind CSS

## 🛠 Tech Stack (As Required)

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: MongoDB Atlas
- **Email Service**: Resend API
- **CRON Jobs**: Vercel Cron (runs every 2 minutes)
- **Deployment**: Vercel

## 📧 Email Reminder System

The application uses a CRON job that:
- Runs automatically every 2 minutes on Vercel
- Checks for study blocks starting within 10 minutes
- Sends email reminders to users
- Prevents duplicate emails with `reminder_sent` flag
- **No CRON overlap** for individual users (requirement met)

## 🏗 Key Features Implemented

✅ **Next.js** - Full-stack React framework  
✅ **Supabase** - Authentication and row-level events  
✅ **MongoDB** - Data storage for study blocks  
✅ **Email Triggers** - 10-minute reminder system  
✅ **CRON Functions** - Automated background processing  
✅ **No CRON Overlap** - Prevention system implemented  

## 📱 How It Works

1. **Sign Up**: Users create accounts with email verification
2. **Schedule**: Create study blocks with title, time, and duration
3. **Automatic Reminders**: System sends email 10 minutes before each session
4. **Track Progress**: View all scheduled sessions with status indicators

## 🧪 Demo Note

In development mode, all emails are sent to the developer's verified email address due to Resend's free tier restrictions. In production with domain verification, emails would be sent to actual user addresses.

## 🚀 Quick Start

1. Clone and install:
