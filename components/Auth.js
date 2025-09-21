'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState('')

    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { data, error } = await supabase.auth.signUp({ email, password })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Check your email for the confirmation link!')
        }
        setLoading(false)
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setMessage(error.message)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {isSignUp ? 'Sign up for Quiet Hours' : 'Sign in to continue'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your password"
                                required
                                minLength={6}
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.includes('Check your email') || message.includes('Success')
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        </p>
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setMessage('')
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
