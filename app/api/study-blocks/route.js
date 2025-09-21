import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(request) {
    try {
        console.log('GET /api/study-blocks: Starting...')

        const client = await clientPromise

        if (!client) {
            console.error('GET /api/study-blocks: Database client is null')
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const db = client.db("quiet_hours")

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        console.log('GET /api/study-blocks: userId =', userId)

        if (!userId) {
            console.error('GET /api/study-blocks: Missing userId parameter')
            return NextResponse.json({
                error: 'User ID is required',
                debug: 'Make sure to include ?userId=<user_id> in the URL'
            }, { status: 400 })
        }

        const studyBlocks = await db.collection("study_blocks").find({
            user_id: userId
        }).sort({ start_time: 1 }).toArray()

        console.log(`GET /api/study-blocks: Found ${studyBlocks.length} blocks for user ${userId}`)

        return NextResponse.json({
            success: true,
            studyBlocks: studyBlocks
        })

    } catch (error) {
        console.error('GET /api/study-blocks error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch study blocks: ' + error.message
        }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        console.log('POST /api/study-blocks: Starting...')

        const client = await clientPromise

        if (!client) {
            console.error('POST /api/study-blocks: Database client is null')
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const db = client.db("quiet_hours")
        const body = await request.json()

        console.log('POST /api/study-blocks: Received data:', body)

        // Validate required fields
        if (!body.user_id || !body.user_email || !body.title || !body.start_time) {
            return NextResponse.json({
                error: 'Missing required fields: user_id, user_email, title, start_time'
            }, { status: 400 })
        }

        const studyBlock = {
            user_id: body.user_id,
            user_email: body.user_email,
            title: body.title,
            start_time: new Date(body.start_time),
            duration: parseInt(body.duration),
            reminder_sent: false,
            created_at: new Date()
        }

        const result = await db.collection("study_blocks").insertOne(studyBlock)

        console.log('POST /api/study-blocks: Created block with ID:', result.insertedId)

        return NextResponse.json({
            success: true,
            id: result.insertedId,
            studyBlock: { ...studyBlock, _id: result.insertedId }
        })

    } catch (error) {
        console.error('POST /api/study-blocks error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to create study block: ' + error.message
        }, { status: 500 })
    }
}
