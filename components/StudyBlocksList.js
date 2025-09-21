'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudyBlocksList({ refreshTrigger }) {
    const [studyBlocks, setStudyBlocks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStudyBlocks()

        // Auto-refresh every 30 seconds to catch email status updates
        const interval = setInterval(fetchStudyBlocks, 30000)
        return () => clearInterval(interval)
    }, [refreshTrigger])

    const fetchStudyBlocks = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user?.id) {
                console.error('No user session found')
                setStudyBlocks([])
                return
            }

            // FIX: Add userId parameter to the URL
            const response = await fetch(`/api/study-blocks?userId=${session.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const data = await response.json()

            if (response.ok) {
                setStudyBlocks(data.studyBlocks || [])
            } else {
                console.error('Failed to fetch study blocks:', data.error)
                setStudyBlocks([])
            }
        } catch (error) {
            console.error('Error fetching study blocks:', error)
            setStudyBlocks([])
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTimeUntil = (dateString) => {
        const now = new Date()
        const sessionTime = new Date(dateString)
        const diffMs = sessionTime - now

        if (diffMs < 0) return { text: 'Completed', isPast: true, isImmediate: false }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours > 0) return { text: `In ${diffHours}h ${diffMinutes}m`, isPast: false, isImmediate: false }
        if (diffMinutes > 10) return { text: `In ${diffMinutes}m`, isPast: false, isImmediate: false }
        if (diffMinutes > 0) return { text: `In ${diffMinutes}m`, isPast: false, isImmediate: true }
        return { text: 'Starting now!', isPast: false, isImmediate: true }
    }

    // Enhanced status badge with dynamic updates
    const getStatusBadge = (block) => {
        const timeInfo = getTimeUntil(block.start_time)
        const now = new Date()
        const sessionTime = new Date(block.start_time)
        const minutesUntil = Math.floor((sessionTime - now) / (1000 * 60))

        // Past sessions
        if (timeInfo.isPast) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    ✅ Completed
                </span>
            )
        }

        // Email sent (reminded)
        if (block.reminder_sent) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 animate-pulse">
                    📧 Email Sent
                </span>
            )
        }

        // About to send email (9-11 minutes before)
        if (minutesUntil >= 9 && minutesUntil <= 11) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 animate-bounce">
                    ⏰ Sending Email...
                </span>
            )
        }

        // Starting soon (less than 10 minutes)
        if (timeInfo.isImmediate) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                    🚨 Starting Soon!
                </span>
            )
        }

        // Regular scheduled
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                ⏳ Scheduled
            </span>
        )
    }

    // Get dynamic message for each block
    const getStatusMessage = (block) => {
        const now = new Date()
        const sessionTime = new Date(block.start_time)
        const minutesUntil = Math.floor((sessionTime - now) / (1000 * 60))

        if (minutesUntil < 0) return 'Session completed'

        if (block.reminder_sent) {
            const sentAt = new Date(block.reminder_sent_at)
            return `Email sent at ${sentAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        }

        if (minutesUntil >= 9 && minutesUntil <= 11) {
            return 'Email reminder being sent now...'
        }

        if (minutesUntil <= 5) {
            return 'Get ready! Session starting very soon!'
        }

        return `Email reminder in ${minutesUntil - 10} minutes`
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your study sessions...</p>
            </div>
        )
    }

    if (studyBlocks.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No study sessions yet</h3>
                <p className="text-gray-600">Create your first study block above to get started!</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Your Study Sessions</h2>
                            <p className="text-sm text-gray-600">{studyBlocks.length} session{studyBlocks.length !== 1 ? 's' : ''} scheduled</p>
                        </div>
                    </div>

                    {/* Live update indicator */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live updates</span>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {studyBlocks.map((block) => {
                    const timeInfo = getTimeUntil(block.start_time)
                    const now = new Date()
                    const minutesUntil = Math.floor((new Date(block.start_time) - now) / (1000 * 60))

                    return (
                        <div
                            key={block._id}
                            className={`px-6 py-4 hover:bg-gray-50 transition-all duration-200 ${minutesUntil >= 9 && minutesUntil <= 11 && !block.reminder_sent ? 'bg-yellow-50' : ''
                                } ${timeInfo.isImmediate && !timeInfo.isPast ? 'bg-red-50' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start space-x-4">
                                        {/* Dynamic status dot */}
                                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${timeInfo.isPast ? 'bg-gray-300' :
                                            block.reminder_sent ? 'bg-green-400 animate-pulse' :
                                                minutesUntil >= 9 && minutesUntil <= 11 ? 'bg-yellow-400 animate-bounce' :
                                                    timeInfo.isImmediate ? 'bg-red-400 animate-pulse' : 'bg-blue-400'
                                            }`}></div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {block.title}
                                            </h3>
                                            <div className="space-y-1 text-gray-600">
                                                <p className="text-sm font-medium">
                                                    📅 {formatDateTime(block.start_time)} • {block.duration} minutes
                                                </p>
                                                <p className="text-sm">
                                                    {timeInfo.text}
                                                </p>
                                                {/* Dynamic status message */}
                                                <p className={`text-xs italic ${block.reminder_sent ? 'text-green-600' :
                                                    minutesUntil >= 9 && minutesUntil <= 11 ? 'text-yellow-600' :
                                                        timeInfo.isImmediate ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    {getStatusMessage(block)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4">
                                    {getStatusBadge(block)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-center text-xs text-gray-600">
                    💡 Updates automatically every 30 seconds • Email reminders sent 10 minutes before each session
                </p>
            </div>
        </div>
    )
}
