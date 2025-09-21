// app/api/test-cron/route.js
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Call your CRON function manually
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/cron/send-reminders`)
        const data = await response.json()

        return NextResponse.json({
            message: 'CRON test completed',
            result: data
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'CRON test failed', details: error.message },
            { status: 500 }
        )
    }
}
