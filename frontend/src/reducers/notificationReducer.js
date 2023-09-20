import { createSlice } from '@reduxjs/toolkit'

const defaultMessage = null
const defaultType = null
const defaultTimeout = null

const asObject = (message, type, timeoutID) => {
    return {message : message, type : type, timeoutID : timeoutID}
}

const notificationSlice = createSlice({
    name : 'notification',
    initialState : asObject(defaultMessage, defaultType, defaultTimeout),
    reducers : {
        setMessage(state, action) {
            const lastTimeoutID = state.timeoutID //keeps stable when mashing notifications
            clearTimeout(lastTimeoutID)

            return({...state, message : action.payload.message, type : action.payload.type})
        },

        setLastTimeoutID(state, action) {
            return({...state, timeoutID : action.payload})
        },

        clearNotification(state, action) {
            return asObject(defaultMessage, defaultType, defaultTimeout) //try to see if initial state works here 
        }
    }
})

export const {setMessage, setLastTimeoutID, clearNotification} = notificationSlice.actions

export const notifier = (message, type, timeout) => {
    return dispatch => {
        dispatch(setMessage({message : message, type : type}))
        
        const thisTimeoutID = setTimeout(() => {
            dispatch(clearNotification())
        },timeout * 1000)
        
        dispatch(setLastTimeoutID(thisTimeoutID))
    }
}

export default notificationSlice.reducer