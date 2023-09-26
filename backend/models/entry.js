const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const datumSchema = new mongoose.Schema(
    {
        rowNum: {type : String, required : true},
        subject: {type: String, required : true},
        condition: {type : String, required: true},
        stimulus: {type : String, maxLength : 1, required: true, enum : ['1', '0']},
        response: {type : String, maxLength : 1, required: true, enum : ['1', '0']} 
    }
)

const entrySchema = new mongoose.Schema({data: [datumSchema]})


entrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v

        returnedObject.data.forEach(i => delete i._id)
    }
})

module.exports = mongoose.model('Entry', entrySchema)