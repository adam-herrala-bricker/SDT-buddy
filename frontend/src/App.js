import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { notifier } from './reducers/notificationReducer'
import HelpText from './components/HelpText'
import MenuBar from './components/MenuBar'
import Load from './components/Load'
import Add from './components/Add'
import Current from './components/Current'
import DisplayMetrics from './components/DisplayMetrics'
import serverKamu from './services/serverKamu'

import { fullEqualityChecker } from './utilities/objectHelper'
import { arrayToObject, arrayToString } from './utilities/miscHelpers'


const App = () => {
  //states
  const emptyDatum = {rowNum : '', subject : 'S', condition : '', stimulus : '', response : ''}
  const [currentData, setCurrentData] = useState([])
  const [newDatum, setNewDatum] = useState (emptyDatum)
  const [deleteMode, setDeleteMode] = useState(false)
  const [bulkEntry, setEntryMode] = useState(false) //whether app is in bulk entry mode
  const [currentBulkData, setCurrentBulkData] = useState('') //value of text in bulk entry
  const [rowNumber, setRowNumber] = useState(1)
  const [loadKey, setLoadKey] = useState('enter key . . .')
  const [saveStatus, setSaveStatus] = useState('untracked')
  const [displayHelp, setDisplayHelp] = useState(false)
  const [notificationText, setNotificationText] = useState('text')
  const [thisSubject, setThisSubject] = useState('all')

  const dispatch = useDispatch() //for notification reducer

  //event handlers
  const handleInputChange = (event) => {
    const currentInput = event.target.value
    const column = event.target.id
    //check for incorrect data format
    if ((column === 'stimulus' | column === 'response') & (currentInput !== '1' & currentInput !== '0') & currentInput !== ''){
      dispatch(notifier('entry must be 0 or 1', 'error', 5))
    } else {
      setNewDatum({...newDatum, [column] : currentInput}) //note the syntax on column to use the variable value
    }
  }

  const handleAddDatum = (event) => {
    event.preventDefault() //this stops the form submit from re-loading the page
    //add unique row number for use in "key" prop in table 
    const datumToAdd = {...newDatum, rowNum : rowNumber.toString()} //need new variable to avoid async issues . . .
    setCurrentData(currentData.concat(datumToAdd))
    //avoid bug where mashing "add" sends multiple entries to currentData
    setNewDatum(emptyDatum)
    setRowNumber(rowNumber + 1)
    
    dispatch(notifier('new trial added', 'confirm', 5))
  }

  const handleBulkDataChange = (event) => {
    const currentBulkEntry = event.target.value
    setCurrentBulkData(currentBulkEntry)
    const structuredBulkEntry = currentBulkEntry
      .split('\n')
      .map(i => i.split(';'))
      .map(i => arrayToObject(i))
    setCurrentData(structuredBulkEntry)
  }

  const handleReset = () => {
    //note: may want to throw a confirmation alert here at some point
    setCurrentData([])
    setNewDatum(emptyDatum)
    setDeleteMode(false)
    setRowNumber(1)
    setCurrentBulkData('')
    setLoadKey('enter key . . .')
    setSaveStatus('untracked')
    setDisplayHelp(false)
    setThisSubject('all')
    
    dispatch(notifier('app reset', 'confirm', 5))
  }

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode)
  }

  const toggleEntryMode = () => {
    if (!bulkEntry) { //switching to bulk --> set bulk data displayed
      setCurrentBulkData(arrayToString(currentData))
    } else { //switching to single --> update row number counter to avoid doubling up
      const currentRowNumbers = currentData.map(i=>i.rowNum)
      setRowNumber(currentRowNumbers.length === 0 ? 1 : Math.max(...currentRowNumbers) + 1) //max function gives -inf for empty array
    }
    setEntryMode(!bulkEntry)
  }

  const deleteRow = (rowNum) => {
    const newData = currentData.filter(i => i.rowNum !== rowNum)
    setCurrentData(newData)
    setCurrentBulkData(arrayToString(newData))
    dispatch(notifier('trial deleted', 'confirm', 5))
  }

  const handleKeyChange = (event) => {
    setLoadKey(event.target.value)
  }

  const handleCreateNew = () => {
    serverKamu
    .createNew()
    .then(response => {
      setLoadKey(response.id)
      dispatch(notifier('new save key created', 'confirm', 5))
    })
    .catch(error => {
      dispatch(notifier(`Error creating save key: ${error.message}`, 'error', 10))
    })
  }

  const handleSave = () => {
    if (loadKey.length > 0) { //don't do anything if no load key
      const dataToSave = {data: currentData} 
      serverKamu
      .saveData(loadKey, dataToSave) 
      .then(() => {
        setSaveStatus('saved')
        dispatch(notifier('data saved', 'confirm', 5))
      })
      .catch(error => {
        dispatch(notifier(`${error.message}. ${error.response.data.error}`, 'error', 10))
     })
    }
  }

  const handleLoad = () => {
    loadKey.length > 0 &&
    serverKamu
    .loadData(loadKey)
    .then(response => {
      setCurrentData(response.data)
      const responseRows = response.data.map(i => i.rowNum)
      setRowNumber(responseRows.length === 0 ? 1 : Math.max(...responseRows) + 1)

      //need to seperately load bulk data if in bulk mode
      if (bulkEntry) {
        setCurrentBulkData(arrayToString(response.data))
      }

      dispatch(notifier('data loaded', 'confirm', 5))
    })
    .catch(error => {
      dispatch(notifier(`${error.message}. ${error.response.data.error}`, 'error', 10))
    })
  }

  //more robust way of determining what visual feedback to render re. save status
  const checkForUnsavedChanges = () => {
    //only checking if the key is the right length and there is current data
    if (loadKey.length === 24 & currentData.length > 0) {
      serverKamu
      .loadData(loadKey)
      .then(response => {
        const foundData = response.data
        if (fullEqualityChecker(foundData, currentData)) {
          setSaveStatus('saved')
        } else {
          setSaveStatus('unsaved')
        }
      })
      .catch(() => {
        setSaveStatus('untracked')
        dispatch(notifier('unable to connect to server', 'error', 5))
      })
    } else { //not in the right state for saving
      setSaveStatus('untracked')
    }
  }

  useEffect(checkForUnsavedChanges, [loadKey, currentData])


  return(
    <div className = 'root-container'>
      <div>
        <MenuBar 
          handleCreateNew = {handleCreateNew}
          handleSave = {handleSave}
          saveStatus = {saveStatus}
          toggleEntryMode = {toggleEntryMode}
          toggleDeleteMode = {toggleDeleteMode}
          handleReset = {handleReset}
          displayHelp = {displayHelp}
          setDisplayHelp = {setDisplayHelp}
          notificationText = {notificationText}
          setNotificationText = {setNotificationText}
          />
        <h1>SDT Kamu</h1>
        {displayHelp && <HelpText />}
        <Load loadKey = {loadKey} handleKeyChange = {handleKeyChange} handleLoad = {handleLoad}/>
        <Add handleInputChange = {handleInputChange} handleBulkDataChange = {handleBulkDataChange} handleAddDatum = {handleAddDatum} newDatum = {newDatum} bulkEntry={bulkEntry} currentBulkData = {currentBulkData} rowNumber = {rowNumber}/>
        <div className = 'tables-container'>
          <Current currentData = {currentData} deleteMode = {deleteMode} deleteRow = {deleteRow}/>
          <DisplayMetrics currentData = {currentData} thisSubject = {thisSubject} setThisSubject = {setThisSubject}/>
        </div>
      </div>
      <div>
        <footer>
          SDT Kamu developed by Adam Herrala Bricker for TBMC3001 Psychophysics: Theory and Application. University of Turku. 2023. 
        </footer>
      </div>
    </div>
  )
}


export default App
