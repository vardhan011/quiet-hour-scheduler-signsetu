import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import clientPromise from '../../../../lib/mongodb'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
    try {
        console.log('🔄 CRON: Checking for study block reminders...')

        const client = await clientPromise
        const db = client.db("quiet_hours")

        // Calculate time window: now + 10 minutes (with 1-minute buffer)
        const now = new Date()
        const nineMinutesFromNow = new Date(now.getTime() + 9 * 60 * 1000)
        const elevenMinutesFromNow = new Date(now.getTime() + 11 * 60 * 1000)

        console.log(`⏰ Current time: ${now.toISOString()}`)
        console.log(`⏰ Looking for blocks between ${nineMinutesFromNow.toISOString()} and ${elevenMinutesFromNow.toISOString()}`)

        // Find study blocks starting in 9-11 minutes that haven't been reminded
        const upcomingBlocks = await db.collection("study_blocks").find({
            start_time: {
                $gte: nineMinutesFromNow,
                $lte: elevenMinutesFromNow
            },
            reminder_sent: { $ne: true }
        }).toArray()

        console.log(`📝 Found ${upcomingBlocks.length} blocks needing reminders`)

        let emailsSent = 0

        // Send email for each block
        for (const block of upcomingBlocks) {
            try {
                console.log(`📧 Sending reminder for "${block.title}" to kevinstor143@gmail.com`)

                const { data, error } = await resend.emails.send({
                    from: 'Quiet Hours <noreply@resend.dev>',
                    to: ['kevinstor143@gmail.com'], // Your verified email
                    subject: `🔔 Study session "${block.title}" starts in 10 minutes!`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: white; font-size: 32px;">📚</div>
                  </div>
                  <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">Study Time Reminder!</h1>
                </div>
                
                <!-- Alert -->
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">⏰</div>
                  <p style="margin: 0; color: #92400e; font-size: 18px; font-weight: bold;">
                    Your study session starts in 10 minutes!
                  </p>
                </div>
                
                <!-- Session Details -->
                <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0;">
                  <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">📋 Session Details</h2>
                  <table style="width: 100%; border-spacing: 0;">
                    <tr>
                      <td style="padding: 12px 0; color: #6b7280; font-weight: 500; width: 30%;">📝 Topic:</td>
                      <td style="padding: 12px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${block.title}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">🕐 Start Time:</td>
                      <td style="padding: 12px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${new Date(block.start_time).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #6b7280; font-weight: 500;">⏱️ Duration:</td>
                      <td style="padding: 12px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${block.duration} minutes</td>
                    </tr>
                  </table>
                </div>
                
                <!-- Call to Action -->
                <div style="text-align: center; margin: 32px 0;">
                  <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                  <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px;">Get Ready to Focus!</h3>
                  <p style="color: #6b7280; margin: 0; font-size: 16px;">
                    Find a quiet space, gather your materials, and prepare for productive learning.
                  </p>
                </div>
                
                <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                <div style="text-align: center;">
                  <p style="color: #9ca3af; font-size: 14px; margin: 8px 0;">
                    📧 This is an automated reminder from Quiet Hours Scheduler
                  </p>
                  <p style="color: #9ca3af; font-size: 14px; margin: 8px 0;">
                    SignSetu Assignment Demo • Built with Next.js, Supabase & MongoDB
                  </p>
                </div>
              </div>
            </div>
          `
                })

                if (error) {
                    console.error(`❌ Email error:`, error)
                    continue
                }

                // Mark reminder as sent
                await db.collection("study_blocks").updateOne(
                    { _id: block._id },
                    {
                        $set: {
                            reminder_sent: true,
                            reminder_sent_at: new Date()
                        }
                    }
                )

                emailsSent++
                console.log(`✅ Reminder sent successfully!`)

            } catch (emailError) {
                console.error(`❌ Failed to send email for block ${block._id}:`, emailError)
            }
        }

        const response = {
            success: true,
            message: `Processed ${upcomingBlocks.length} reminders, sent ${emailsSent} emails`,
            timestamp: new Date().toISOString(),
            details: {
                total_blocks_found: upcomingBlocks.length,
                emails_sent: emailsSent,
                current_time: now.toISOString(),
                time_window: {
                    from: nineMinutesFromNow.toISOString(),
                    to: elevenMinutesFromNow.toISOString()
                }
            }
        }

        console.log('✅ CRON job completed:', response)
        return NextResponse.json(response)

    } catch (error) {
        console.error('💥 CRON job failed:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}
