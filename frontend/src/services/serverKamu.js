//lil buddy to handle requests to the server from the frontend
import axios from 'axios'

const baseUrl = '/api/subjects'

const createNew = () => {
    const request = axios.post(baseUrl) //body doesn't matter bc it's creating an empty entry
    return request.then(response => response.data)
}

const saveData = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

const loadData = (id) => {
    const request = axios.get(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

export default {createNew, saveData, loadData}