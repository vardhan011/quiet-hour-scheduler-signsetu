import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

// Enhanced options for SSL/TLS compatibility
const options = {
    // SSL Configuration
    tls: true,
    tlsAllowInvalidCertificates: true, // For development
    tlsAllowInvalidHostnames: true,    // For development

    // Connection settings
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,

    // Retry configuration
    retryWrites: true,
    retryReads: true,

    // Additional MongoDB options
    authSource: 'admin',
    ssl: true,
    sslValidate: false // For development - set to true in production
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
                throw error
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
            throw error
        })
}

export default clientPromise
