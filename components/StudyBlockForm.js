'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function StudyBlockForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        start_time: '',
        duration: 30
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user) {
                alert('Please log in to create study blocks')
                return
            }

            // FIX: Include user data in the request
            const studyBlockData = {
                ...formData,
                user_id: session.user.id,
                user_email: session.user.email
            }

            console.log('Submitting study block:', studyBlockData)

            const response = await fetch('/api/study-blocks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(studyBlockData) // Use studyBlockData instead of formData
            })

            const data = await response.json()

            if (response.ok) {
                setFormData({ title: '', start_time: '', duration: 30 })
                if (onSuccess) onSuccess()
                alert('✅ Study session scheduled successfully!')
            } else {
                alert('Error: ' + data.error)
                console.error('API Error:', data)
            }
        } catch (error) {
            alert('Error: ' + error.message)
            console.error('Request Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        return now.toISOString().slice(0, 16)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Schedule Study Session</h2>
                    <p className="text-gray-600">Plan your focused learning time</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Study Topic
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Math Practice, Physics Review"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min={getCurrentDateTime()}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                        </label>
                        <select
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1.5 hours</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">📧 Email Reminder</p>
                            <p>You will receive an email 10 minutes before your session starts</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    {loading ? 'Creating...' : 'Schedule Study Block'}
                </button>
            </form>
        </div>
    )
}
