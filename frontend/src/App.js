import {useState, useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { notifier } from './reducers/notificationReducer'
import HelpText from './components/HelpText'
import MenuBar from './components/MenuBar'
import Load from './components/Load'
import Add from './components/Add';
import Current from './components/Current';
import DisplayMetrics from './components/DisplayMetrics'
import TTestComponent from './components/TTestComponent'
import Papa from "papaparse"
import Notifications from './components/Notifications'
import sdtCalculator from './utilities/sdtCalculator'
import { arrayToObject, arrayToString, sorterer } from './utilities/miscHelpers'
import { validateColumnMappings, processCSVData, remapValue } from './utilities/csvHelpers'
import serverKamu from './services/serverKamu'
import {fullEqualityChecker} from './utilities/objectHelper'



const App = () => {
  //states
  const emptyDatum = {rowNum : '', subject : 'S', condition : '', stimulus : '', response : ''}
  const [currentData, setCurrentData] = useState([])
  const [newDatum, setNewDatum] = useState (emptyDatum)
  const [deleteMode, setDeleteMode] = useState(false)
  const [entryMode, setEntryMode] = useState('csv')
  const [currentBulkData, setCurrentBulkData] = useState('') //value of text in bulk entry
  const [rowNumber, setRowNumber] = useState(1)
  const [loadKey, setLoadKey] = useState('enter key . . .')
  const [saveStatus, setSaveStatus] = useState('untracked')
  const [displayHelp, setDisplayHelp] = useState(false)
  const [notificationText, setNotificationText] = useState('text')
  const [thisSubject, setThisSubject] = useState('all')
  const [mappingData, setMappingData] = useState({ sharedMap: {} });
  const [conditions, setConditions] = useState([]);
  const [subjectMetrics, setSubjectMetrics] = useState({});
  const [tTestCondition1, setTTestCondition1] = useState('');
  const [tTestCondition2, setTTestCondition2] = useState('');
  
  const initialColumnMappings = { // using initialColumMappings in order for handleReset to handle the input fields
  subject: '',
  condition: '',
  stimulus: '',
  response: '',
  };
  const [csvColumnMappings, setCsvColumnMappings] = useState(initialColumnMappings);

  useEffect(() => {
    const uniqueConditions = Array.from(new Set(currentData.map(item => item.condition))).filter(Boolean);
    const uniqueSubjects = Array.from(new Set(currentData.map(item => item.subject)));

    const { subjectMetrics: newSubjectMetrics } = sdtCalculator(currentData, uniqueConditions, uniqueSubjects, thisSubject);
    setSubjectMetrics(newSubjectMetrics);

    if (uniqueConditions.length >= 2) {
      setTTestCondition1(uniqueConditions[0]);
      setTTestCondition2(uniqueConditions[1]);
    } else {
      setTTestCondition1('');
      setTTestCondition2('');
    }
  }, [currentData, thisSubject]);


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


  const handleCSVUpload = (file, csvColumnMappings, currentRowNumber, updateRowNumber) => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const csvHeaders = result.meta.fields; //checks the csv columns for matching
          const missingColumns = validateColumnMappings(csvColumnMappings, csvHeaders);
  
          if (missingColumns.length > 0) {
            dispatch(notifier(`Missing columns in CSV for: ${missingColumns.join(', ')}`, 'error', 5));
            return;
          }
  
          processCSVData(result, csvColumnMappings, currentRowNumber, updateRowNumber, setCurrentData, setMappingData, remapValue);
        },
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
    }
  };


  const handleReset = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the application? This will clear all current data.");
  
    if (confirmReset) {
      setCurrentData([]);
      setNewDatum(emptyDatum);
      setDeleteMode(false);
      setRowNumber(1);
      setCurrentBulkData('');
      setLoadKey('enter key . . .');
      setSaveStatus('untracked');
      setDisplayHelp(false);
      setThisSubject('all');
      setTTestCondition1('');
      setTTestCondition2('');

      setCsvColumnMappings(initialColumnMappings);

      
  
      dispatch(notifier('App reset', 'confirm', 5));
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode)
  }

  const toggleEntryMode = (newMode) => {
    setEntryMode(newMode);
    if (newMode === 'bulk') {
      setCurrentBulkData(arrayToString(currentData));
    } else if (newMode === 'single' || newMode === 'csv') {
      const currentRowNumbers = currentData.map(i => i.rowNum);
      setRowNumber(currentRowNumbers.length === 0 ? 1 : Math.max(...currentRowNumbers) + 1);
    }
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
      if (entryMode == 'bulk') {
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


return (
  <div className='root-container'>
      <div>
        <MenuBar 
          handleCreateNew={handleCreateNew}
          handleSave={handleSave}
          saveStatus={saveStatus}
	  entryMode={entryMode}
          toggleEntryMode={toggleEntryMode}
          toggleDeleteMode={toggleDeleteMode}
          handleReset={handleReset}
          displayHelp={displayHelp}
          setDisplayHelp={setDisplayHelp}
          notificationText={notificationText}
          setNotificationText={setNotificationText}
        />
      <h1>SDT Kamu</h1>
      {displayHelp && <HelpText />}
      <Load loadKey={loadKey} handleKeyChange={handleKeyChange} handleLoad={handleLoad}/>
      <Add 
        handleInputChange={handleInputChange} 
        handleBulkDataChange={handleBulkDataChange} 
        handleAddDatum={handleAddDatum}
        handleCSVUpload={(file, mappings) => handleCSVUpload(file, mappings, rowNumber, setRowNumber)}
	csvColumnMappings={csvColumnMappings}
        setCsvColumnMappings={setCsvColumnMappings}
        newDatum={newDatum} 
        entryMode={entryMode} 
        currentBulkData={currentBulkData} 
        rowNumber={rowNumber}
      />
      <div className='tables-container'>
        <Current 
          currentData={currentData} 
          deleteMode={deleteMode} 
          deleteRow={deleteRow} 
          sorterer={sorterer} 
          mappingData={mappingData}
        />
        <DisplayMetrics
          currentData={currentData}
          thisSubject={thisSubject}
          conditions={conditions}
          setThisSubject={setThisSubject}
        />
        {thisSubject === 'all' && (
          <TTestComponent 
              dPrimeCorValuesCond1={subjectMetrics[tTestCondition1]?.dPrimeCor || []}
              dPrimeCorValuesCond2={subjectMetrics[tTestCondition2]?.dPrimeCor || []}
              cCorValuesCond1={subjectMetrics[tTestCondition1]?.cCor || []}
              cCorValuesCond2={subjectMetrics[tTestCondition2]?.cCor || []}
          />
        )}
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
