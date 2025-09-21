import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect().catch((err) => {
            console.error('MongoDB connection error:', err)
            return null
        })
    }
    clientPromise = global._mongoClientPromise
} else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect().catch((err) => {
        console.error('MongoDB connection error:', err)
        return null
    })
}

export default clientPromise
