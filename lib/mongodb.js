import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
    // SSL/TLS Configuration
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,

    // Connection Configuration
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,

    // Retry Configuration
    retryWrites: true,
    retryReads: true,

    // Additional SSL Options
    sslValidate: true
}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the value is preserved across module reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    // In production mode, it's best to not use a global variable
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

export default clientPromise
