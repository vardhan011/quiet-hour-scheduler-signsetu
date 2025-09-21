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

        console.log('=== API TIMEZONE DEBUG ===')
        console.log('Received data:', body)
        console.log('Raw start_time:', body.start_time)

        // FIX: Handle the datetime-local string properly
        // If it's a datetime-local string like "2025-09-21T18:20"
        let startTimeDate
        if (body.start_time.includes('T') && !body.start_time.includes('Z')) {
            // It's a datetime-local string, treat as local time
            startTimeDate = new Date(body.start_time)
            console.log('Treating as local time:', startTimeDate)
        } else {
            // It's already an ISO string
            startTimeDate = new Date(body.start_time)
            console.log('Treating as ISO time:', startTimeDate)
        }

        console.log('Final date object:', startTimeDate)
        console.log('Date toString:', startTimeDate.toString())
        console.log('==========================')

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
            start_time: startTimeDate, // Use the processed date
            duration: parseInt(body.duration),
            reminder_sent: false,
            created_at: new Date()
        }

        console.log('Study block to save:', studyBlock)

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

export async function DELETE(request) {
    try {
        console.log('DELETE /api/study-blocks: Starting...')

        const client = await clientPromise

        if (!client) {
            console.error('DELETE /api/study-blocks: Database client is null')
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const db = client.db("quiet_hours")
        const { searchParams } = new URL(request.url)
        const blockId = searchParams.get('id')
        const userId = searchParams.get('userId')

        if (!blockId || !userId) {
            return NextResponse.json({
                error: 'Block ID and User ID are required'
            }, { status: 400 })
        }

        // Delete only if it belongs to the user
        const result = await db.collection("study_blocks").deleteOne({
            _id: new ObjectId(blockId),
            user_id: userId
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({
                error: 'Study block not found or access denied'
            }, { status: 404 })
        }

        console.log('DELETE /api/study-blocks: Deleted block with ID:', blockId)

        return NextResponse.json({
            success: true,
            message: 'Study block deleted successfully'
        })

    } catch (error) {
        console.error('DELETE /api/study-blocks error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to delete study block: ' + error.message
        }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        console.log('PUT /api/study-blocks: Starting...')

        const client = await clientPromise

        if (!client) {
            console.error('PUT /api/study-blocks: Database client is null')
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const db = client.db("quiet_hours")
        const body = await request.json()

        if (!body.id || !body.user_id) {
            return NextResponse.json({
                error: 'Block ID and User ID are required'
            }, { status: 400 })
        }

        const updateData = {
            title: body.title,
            start_time: new Date(body.start_time),
            duration: parseInt(body.duration),
            updated_at: new Date()
        }

        // Update only if it belongs to the user
        const result = await db.collection("study_blocks").updateOne(
            {
                _id: new ObjectId(body.id),
                user_id: body.user_id
            },
            { $set: updateData }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: 'Study block not found or access denied'
            }, { status: 404 })
        }

        console.log('PUT /api/study-blocks: Updated block with ID:', body.id)

        return NextResponse.json({
            success: true,
            message: 'Study block updated successfully'
        })

    } catch (error) {
        console.error('PUT /api/study-blocks error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to update study block: ' + error.message
        }, { status: 500 })
    }
}
