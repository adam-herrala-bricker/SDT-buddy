require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Entry = require('./models/entry')


//middleware!!
app.use(cors())
app.use(express.json())
app.use(express.static('../frontend/build')) //path to static build on FE

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postRes')) //'tiny' formatting plus our custom job
//add token to morgan for logging POST request only
morgan.token('postRes', function (req ) {
    if(req.method === 'POST') {
        return(
            JSON.stringify(req.body)
        )
    }
    return(' ')
})

//dummy data for testing

//Handling requests to server

//get request to load data for all subjects (users won't see this)
//UPDATE: Removed this so cheeky students can't get a list of every ID on the server

/*
app.get('/api/subjects', (request, response) => {
    Entry.find({}).then(entries => {response.json(entries)})
})
*/

//get request for loading data from single subject
app.get('/api/subjects/:id', (request, response, next) => {
    Entry.findById(request.params.id)
    .then(entry => {
        if (entry) {
            response.json(entry)
        } else {
            response.status(404).send({error: 'invaild load key'})
        }
    })
    .catch(error => next(error))
})

//post request for creating new (empty) entry --> so users can have unique subject ID for saving later
app.post('/api/subjects', (request, response) => {
    const newEntry = new Entry({data : []}) // prevent method from ever being uses to do anything else
    newEntry.save().then(savedPerson => {
        response.json(savedPerson)
    })

})

//put request for saving data (using put bc we want it to do the same thing everytime --> replace old w new dataset)
app.put('/api/subjects/:id', (request, response, next) => {
    const body = request.body
    const thisID = request.params.id
    const updates = {data : body.data}

    Entry.findByIdAndUpdate(thisID, updates, {overwrite: true, runValidators: true})
        .then(() => {response.json(updates)
        })    
        .catch(error => next(error))
})



//Error handling middleware (needs to go at end!)
const errorHandler = (error, request, response, next) => {
    console.error('error:', error.message)
    console.log(error)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'Invalid key.' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'This error is usually raised when trying to save a stimulus or response other than 1 or 0.'})
    }

    next(error)
}

app.use(errorHandler)

//send out to port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})