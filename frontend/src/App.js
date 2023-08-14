import {useState} from 'react'
import DisplayMetrics from './components/metrics'
import serverKamu from './services/serverKamu'

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
const TableHeader = () => {
  return(
    <thead>
    <tr>
      <th>trial number</th>
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
  //bulk entry mode
  if (bulkEntry) {
    return(
      <div>
        <h2>Add new data (bulk entry mode)</h2>
        <p>structure each line: trialNumber;condition;stimulus;response</p>
        <p>important: don't repeat trial numbers!</p>
        <textarea value={currentBulkData} onChange = {handleBulkDataChange}rows='10' cols='40'></textarea>
      </div>
    )
  }
  //single entry mode
  return(
    <div>
      <h2>Add new data (single entry mode)</h2>
      <form onSubmit={handleAddDatum} autoComplete='off'>
        <table>
          <TableHeader />
          <tbody>
            <tr>
              <td><input id = 'trialNumber' value = {rowNumber} readOnly/></td>
              <td><input id = 'condition' value = {newDatum.condition} onChange = {handleInputChange}/></td>
              <td><input id = 'stimulus' value = {newDatum.stimulus} onChange = {handleInputChange}/></td>
              <td><input id = 'response' value = {newDatum.response} onChange = {handleInputChange} /></td>
              <td><button type = 'submit' >add</button></td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  )
}

//compoent for displaying each row of data
const Row = ({currentData, deleteMode, deleteRow}) => {
  if (!deleteMode) {
    return(
      currentData.map(entry =>
        <tr key = {entry.rowNum}>
          <td>{entry.rowNum}</td>
          <td>{entry.condition}</td>
          <td>{entry.stimulus}</td>
          <td>{entry.response}</td>
        </tr>
        )
    )
  }
  return (
    currentData.map(entry =>
      <tr key = {entry.rowNum}>
        <td>{entry.rowNum}</td>
        <td>{entry.condition}</td>
        <td>{entry.stimulus}</td>
        <td>{entry.response}</td>
        <td><button onClick = {() => deleteRow(entry.rowNum)}>-</button></td>
      </tr>
      )
  )
  
  
}

//component for displaying data currently loaded into the app
const Current = ({currentData, deleteMode, deleteRow}) => {
  //show nothing if nothing to show
  if (currentData.length === 0) {
    return(
      <div>
        <h2>Current data</h2>
        <p>no data to display</p>
      </div>
    )
  }

  return(
    <div>
      <h2>Current data</h2>
      <table>
        <TableHeader />
        <tbody>
          <Row currentData = {currentData} deleteMode = {deleteMode} deleteRow = {deleteRow}/>
        </tbody>
      </table>
    </div>
  )
}


const App = () => {
  //states
  const emptyDatum = {rowNum : '', condition : '', stimulus : '', response : ''}
  const [currentData, setCurrentData] = useState([])
  const [newDatum, setNewDatum] = useState (emptyDatum)
  const [deleteMode, setDeleteMode] = useState(false)
  const [bulkEntry, setEntryMode] = useState(false) //whether app is in bulk entry mode
  const [currentBulkData, setCurrentBulkData] = useState('') //value of text in bulk entry
  const [rowNumber, setRowNumber] = useState(1)
  const [loadKey, setLoadKey] = useState('enter key . . .')

  //helper functions
  //this converts arrays to objects in the bulk data change handler
  const arrayToObject = (arr) => {
    return({rowNum : arr[0], condition : arr[1], stimulus : arr[2], response : arr[3]})
  }
  //this converts an array of data objects to a string for the switch to bulk entry mode
  const arrayToString = (arr) => {
    const newString = arr
      .map(i => Object.values(i))
      .map(i => i.join(';'))
      .join('\n')
    return(newString)
  }

  //event handlers
  const handleInputChange = (event) => {
    const currentInput = event.target.value
    const column = event.target.id
    setNewDatum({...newDatum, [column] : currentInput}) //note the syntax on column to use the variable value
  }

  const handleAddDatum = (event) => {
    event.preventDefault() //this stops the form submit from re-loading the page
    //add unique row number for use in "key" prop in table 
    const datumToAdd = {...newDatum, rowNum : rowNumber} //need new variable to avoid async issues . . .
    setCurrentData(currentData.concat(datumToAdd))
    //avoid bug where mashing "add" sends multiple entries to currentData
    setNewDatum(emptyDatum)
    setRowNumber(rowNumber + 1)
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
  }

  const handleKeyChange = (event) => {
    setLoadKey(event.target.value)
  }

  const handleCreateNew = () => {
    serverKamu
    .createNew()
    .then(response => {
      setLoadKey(response.id)
    })
  }

  const handleSave = () => {
    const dataToSave = {data: currentData} 
    serverKamu
    .saveData(loadKey, dataToSave) 
    .then(response => {console.log(response)})//will want visual feedback on save
    .catch(error => console.log(error))

    //will 100% need better error handling here too
  }

  const handleLoad = () => {
    serverKamu
    .loadData(loadKey)
    .then(response => {setCurrentData(response.data)})
  }


  return(
    <div>
      <h1>SDT Buddy</h1>
      <button onClick = {handleCreateNew}>new save key</button>
      <button onClick = {handleSave}>save dataset</button>
      <button onClick = {toggleEntryMode}>toggle entry mode</button>
      <button onClick = {toggleDeleteMode}>toggle edit mode</button>
      <button onClick = {handleReset}>reset application</button>
      <Load loadKey = {loadKey} handleKeyChange = {handleKeyChange} handleLoad = {handleLoad}/>
      <Add handleInputChange = {handleInputChange} handleBulkDataChange = {handleBulkDataChange} handleAddDatum = {handleAddDatum} newDatum = {newDatum} bulkEntry={bulkEntry} currentBulkData = {currentBulkData} rowNumber = {rowNumber}/>
      <div className = 'flexbox-container'>
        <Current currentData = {currentData} deleteMode = {deleteMode} deleteRow = {deleteRow}/>
        <DisplayMetrics currentData = {currentData}/>
      </div>
    </div>
  )
}


export default App
