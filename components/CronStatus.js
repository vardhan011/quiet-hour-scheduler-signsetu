// components/CronStatus.js
'use client'
import { useState, useEffect } from 'react'

export default function CronStatus() {
    const [lastRun, setLastRun] = useState(null)
    const [loading, setLoading] = useState(false)

    const checkCronStatus = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/cron/send-reminders')
            const data = await response.json()
            setLastRun({
                timestamp: data.timestamp,
                details: data.details,
                message: data.message
            })
        } catch (error) {
            console.error('Failed to check CRON status:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">📡 Email Reminder System</h3>
                    {lastRun && (
                        <p className="text-sm text-gray-600">
                            Last checked: {new Date(lastRun.timestamp).toLocaleString()}
                        </p>
                    )}
                    {lastRun?.details && (
                        <p className="text-sm text-green-600">
                            Found {lastRun.details.total_blocks_found} blocks, sent {lastRun.details.emails_sent} emails
                        </p>
                    )}
                </div>
                <button
                    onClick={checkCronStatus}
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                    {loading ? 'Checking...' : 'Check Now'}
                </button>
            </div>
        </div>
    )
}
