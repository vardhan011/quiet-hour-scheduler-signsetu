import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

// Clean, working options
const options = {
    // SSL Configuration (simplified)
    tls: true,

    // Connection settings
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,

    // Retry configuration
    retryWrites: true,
    retryReads: true
}

let client
let clientPromise

console.log('MongoDB: Initializing connection...')

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
            .then(client => {
                console.log('MongoDB: Connected successfully')
                return client
            })
            .catch(error => {
                console.error('MongoDB: Connection failed:', error.message)
                return null // Return null instead of throwing
            })
    }
    clientPromise = global._mongoClientPromise
} else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
        .then(client => {
            console.log('MongoDB: Connected successfully')
            return client
        })
        .catch(error => {
            console.error('MongoDB: Connection failed:', error.message)
            return null // Return null instead of throwing
        })
}

export default clientPromise
