import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET() {
    try {
        console.log('🔄 CRON: Checking for study block reminders with EmailJS...')

        const client = await clientPromise
        const db = client.db("quiet_hours")

        const now = new Date()
        const nineMinutesFromNow = new Date(now.getTime() + 9 * 60 * 1000)
        const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000)

        console.log(`⏰ Looking for blocks between ${nineMinutesFromNow.toISOString()} and ${elevenMinutesFromNow.toISOString()}`)

        const upcomingBlocks = await db.collection("study_blocks").find({
            start_time: {
                $gte: nineMinutesFromNow,
                $lte: elevenMinutesFromNow
            },
            reminder_sent: { $ne: true }
        }).toArray()

        console.log(`📝 Found ${upcomingBlocks.length} blocks needing reminders`)

        let emailsSent = 0

        // Send emails via EmailJS API
        for (const block of upcomingBlocks) {
            try {
                console.log(`📧 Sending EmailJS reminder to ${block.user_email}`)

                const emailPayload = {
                    service_id: process.env.EMAILJS_SERVICE_ID,
                    template_id: process.env.EMAILJS_TEMPLATE_ID,
                    user_id: process.env.EMAILJS_PUBLIC_KEY,
                    template_params: {
                        to_email: block.user_email,
                        to_name: block.user_email.split('@')[0],
                        study_title: block.title,
                        start_time: new Date(block.start_time).toLocaleString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        duration: block.duration,
                        current_time: new Date().toLocaleString('en-IN')
                    }
                }

                const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailPayload)
                })

                if (emailResponse.ok) {
                    await db.collection("study_blocks").updateOne(
                        { _id: block._id },
                        {
                            $set: {
                                reminder_sent: true,
                                reminder_sent_at: new Date(),
                                email_service: 'EmailJS'
                            }
                        }
                    )

                    emailsSent++
                    console.log(`✅ EmailJS sent successfully to ${block.user_email}`)
                } else {
                    const errorText = await emailResponse.text()
                    console.error(`❌ EmailJS failed for ${block.user_email}:`, errorText)
                }

            } catch (emailError) {
                console.error(`❌ Email error for ${block.user_email}:`, emailError)
            }
        }

        const response = {
            success: true,
            message: `Processed ${upcomingBlocks.length} reminders, sent ${emailsSent} emails via EmailJS`,
            timestamp: new Date().toISOString(),
            details: {
                total_blocks_found: upcomingBlocks.length,
                emails_sent: emailsSent,
                email_service: 'EmailJS',
                current_time: now.toISOString(),
                time_window: {
                    from: nineMinutesFromNow.toISOString(),
                    to: elevenMinutesFromNow.toISOString()
                }
            }
        }

        console.log('✅ EmailJS CRON completed:', response)
        return NextResponse.json(response)

    } catch (error) {
        console.error('💥 EmailJS CRON failed:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
