const Add = ({handleInputChange, handleAddDatum, newDatum, bulkEntry, currentBulkData, handleBulkDataChange, rowNumber}) => {
    const entryFields = ['subject', 'condition', 'stimulus', 'response']
    
    //bulk entry mode
    if (bulkEntry) {
      return(
        <div>
          <h2>Add new data (bulk entry mode)</h2>
          <p>structure each line: trialNumber;subject;condition;stimulus;response</p>
          <p><b>IMPORTANT: don't repeat trial numbers for the same subject!</b></p>
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

export default Add