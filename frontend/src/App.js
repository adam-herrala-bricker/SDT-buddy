import {useState, useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { notifier } from './reducers/notificationReducer'
import DisplayMetrics from './components/metrics'
import HelpText from './components/HelpText'
import Notifications from './components/Notifications'
import serverKamu from './services/serverKamu'
import {fullEqualityChecker} from './utilities/objectHelper'

//component for loading previously saved dataset from DB
const Load = ({loadKey, handleKeyChange, handleLoad}) => {
  return(
    <div>
      <h2>Load existing dataset</h2>
      <input id='inputKey' size='25' value={loadKey} onChange= {handleKeyChange}/>
      <button onClick = {handleLoad}>load</button>
    </div>
  )
}

//mini-component for table headers
const TableHeader = ({className}) => {
  return(
    <thead className={className}>
    <tr>
      <th>trial</th>
      <th>subject</th>
      <th>condition</th>
      <th>stimulus</th>
      <th>response</th>
    </tr>
  </thead>
  )
}

//component for adding new data to the app
//note: turns out setting the value is important; doesn't work right otherwise
const Add = ({handleInputChange, handleAddDatum, newDatum, bulkEntry, currentBulkData, handleBulkDataChange, rowNumber}) => {
  const entryFields = ['subject', 'condition', 'stimulus', 'response']
  
  //bulk entry mode
  if (bulkEntry) {
    return(
      <div>
        <h2>Add new data (bulk entry mode)</h2>
        <p>structure each line: trialNumber;subject;condition;stimulus;response</p>
        <p><b>IMPORTANT: don't repeat trial numbers!</b></p>
        <textarea value={currentBulkData} onChange = {handleBulkDataChange}rows='10' cols='40'></textarea>
      </div>
    )
  }
  //single entry mode
  return(
    <div>
      <h2>Add new data (single entry mode)</h2>
      <form onSubmit={handleAddDatum} autoComplete='off' className='single-entry-container'>
        <div className='single-entry-field'>
          <b>trial number</b>
          <input id = 'trialNumber' value = {rowNumber} readOnly/>
        </div>
        {entryFields.map(i => 
          <div key = {i} className='single-entry-field'>
            <b>{i}</b>
            <input id = {i} value = {newDatum[i]} onChange = {handleInputChange}/>
          </div>
        )}
        <div className='single-entry-field'>
          <button type = 'submit'>add</button>
        </div>
      </form>
    </div>
  )
}

//compoent for displaying each row of data
const Row = ({currentData, deleteMode, deleteRow, sorterer}) => {
  //Get that data sorted!
  const displayData = currentData.sort(sorterer)
  
  if (!deleteMode) {
    return(
      displayData.map(entry =>
        <tr key = {entry.rowNum}>
          <td>{entry.rowNum}</td>
          <td>{entry.subject}</td>
          <td>{entry.condition}</td>
          <td>{entry.stimulus}</td>
          <td>{entry.response}</td>
        </tr>
        )
    )
  }
  return (
    displayData.map(entry =>
      <tr key = {entry.rowNum}>
        <td>{entry.rowNum}</td>
        <td>{entry.subject}</td>
        <td>{entry.condition}</td>
        <td>{entry.stimulus}</td>
        <td>{entry.response}</td>
        <td><button onClick = {() => deleteRow(entry.rowNum)}>-</button></td>
      </tr>
      )
  )
}

//component for displaying data currently loaded into the app
const Current = ({currentData, deleteMode, deleteRow, sorterer}) => {
  const [currentSubject, setCurrentSubject] = useState('all') //tracking subject displayed here
  
  //show nothing if nothing to show
  if (currentData.length === 0) {
    return(
      <div>
        <h2>Current data</h2>
        <p>no data to display</p>
      </div>
    )
  }

  //Array of unique subjects (plus 'all')
  const subjects = Array.from(new Set(currentData.map(i => i.subject))).concat('all')

  //filter data to display just the selected subject
  const filteredData = currentSubject === 'all'
    ? currentData
    : currentData.filter(i => i.subject === currentSubject)

  return(
    <div className = 'stats-container'>
      <h2>Current data</h2>
      <div className = 's-button-container'>
        {subjects.map(i => 
                  <button key = {i} onClick = {() => setCurrentSubject(i)} className = {currentSubject === i ? 'dark-button' : null}>{i}</button>
              )}
      </div>
      <table>
        <TableHeader className='boader-head'/>
        <tbody>
          <Row sorterer = {sorterer} currentData = {filteredData} deleteMode = {deleteMode} deleteRow = {deleteRow}/>
        </tbody>
      </table>
    </div>
  )
}


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

  //helper functions
  //this converts arrays to objects in the bulk data change handler
  const arrayToObject = (arr) => {
    return({rowNum : arr[0], subject : arr[1], condition : arr[2], stimulus : arr[3], response : arr[4]})
  }
  //this converts an array of data objects to a string for the switch to bulk entry mode
  const arrayToString = (arr) => {
    const sortedArray = arr.sort(sorterer)
    const newString = arr
      .map(i => Object.values(i))
      .map(i => i.join(';'))
      .join('\n')
    return(newString)
  }

  //sorting data
  const sorterer = (a,b) => {
    const intA = Number(a.rowNum)
    const intB = Number(b.rowNum)

    if (intA > intB) {
      return 1
    } else if (intA < intB) {
      return -1
    } else {
      return 0
    }
  }

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
        <div className = 'menu-container'>
          <div className = 'button-container'>
            <button onClick = {handleCreateNew}>new save key</button>
            <button onClick = {handleSave} className = {saveStatus}>save dataset</button>
            <button onClick = {toggleEntryMode}>toggle entry mode</button>
            <button onClick = {toggleDeleteMode}>toggle edit mode</button>
            <button onClick = {handleReset}>reset application</button>
            <button onClick = {() => setDisplayHelp(!displayHelp)} className = {displayHelp ? 'dark-button' : ''}>help</button>
          </div>
          <div>
            <Notifications notificationText = {notificationText} setNotificationText = {setNotificationText}/>
          </div>
        </div>
        <h1>SDT Kamu</h1>
        {displayHelp && <HelpText />}
        <Load loadKey = {loadKey} handleKeyChange = {handleKeyChange} handleLoad = {handleLoad}/>
        <Add handleInputChange = {handleInputChange} handleBulkDataChange = {handleBulkDataChange} handleAddDatum = {handleAddDatum} newDatum = {newDatum} bulkEntry={bulkEntry} currentBulkData = {currentBulkData} rowNumber = {rowNumber}/>
        <div className = 'tables-container'>
          <Current currentData = {currentData} deleteMode = {deleteMode} deleteRow = {deleteRow} sorterer = {sorterer}/>
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
