import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { supabase } from '../../../lib/supabase'

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'No auth header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = await clientPromise
        const db = client.db("quiet_hours")

        const studyBlocks = await db
            .collection("study_blocks")
            .find({ user_id: user.id })
            .sort({ start_time: 1 })
            .toArray()

        return NextResponse.json({ studyBlocks })
    } catch (error) {
        console.error('GET /api/study-blocks error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { title, start_time, duration } = body

        if (!title || !start_time || !duration) {
            return NextResponse.json(
                { error: 'Title, start_time, and duration are required' },
                { status: 400 }
            )
        }

        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = await clientPromise
        const db = client.db("quiet_hours")

        const studyBlock = {
            user_id: user.id,
            user_email: user.email,
            title,
            start_time: new Date(start_time),
            duration: parseInt(duration),
            created_at: new Date(),
            reminder_sent: false
        }

        const result = await db.collection("study_blocks").insertOne(studyBlock)

        return NextResponse.json({
            success: true,
            id: result.insertedId,
            studyBlock
        })
    } catch (error) {
        console.error('POST /api/study-blocks error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
