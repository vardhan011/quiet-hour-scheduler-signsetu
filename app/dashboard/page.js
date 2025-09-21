'use client'
import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import StudyBlockForm from '../../components/StudyBlockForm'
import StudyBlocksList from '../../components/StudyBlocksList'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [user, setUser] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user)
        })
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    const handleFormSuccess = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Simple Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Quiet Hours</h1>
                                    <p className="text-sm text-gray-600">Study Scheduler</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Email Reminders Active</h3>
                                <p className="text-gray-600">You will get notified 10 minutes before each study session</p>
                            </div>
                            <div className="ml-auto">
                                <span className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Study Block Form */}
                    <StudyBlockForm onSuccess={handleFormSuccess} />

                    {/* Study Blocks List */}
                    <StudyBlocksList refreshTrigger={refreshTrigger} />
                </main>

                {/* Simple Footer */}
                <footer className="bg-white border-t border-gray-200 mt-16">
                    <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
                        <p>Built for SignSetu Assignment • Next.js + Supabase + MongoDB</p>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    )
}
