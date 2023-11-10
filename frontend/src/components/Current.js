//component for displaying current data loaded into the app
import { useState } from 'react'
import { sorterer } from '../utilities/miscHelpers'


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
  
  //compoent for displaying each row of data
  const Row = ({currentData, deleteMode, deleteRow }) => {
    //Get that data sorted!
    const displayData = currentData.sort(sorterer)
    
    if (!deleteMode) {
      return(
        displayData.map(entry =>
          <tr key = {`${entry.subject}-${entry.rowNum}`}>
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
        <tr key = {`${entry.subject}-${entry.rowNum}`}>
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
  const Current = ({currentData, deleteMode, deleteRow }) => {
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
            <Row currentData = {filteredData} deleteMode = {deleteMode} deleteRow = {deleteRow}/>
          </tbody>
        </table>
      </div>
    )
  }

export default Current