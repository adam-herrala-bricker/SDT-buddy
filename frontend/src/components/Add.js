
import React, { useState } from 'react';

// Add component
const Add = ({ handleInputChange, handleAddDatum, newDatum, entryMode, currentBulkData, handleBulkDataChange, handleCSVUpload, csvColumnMappings, setCsvColumnMappings, rowNumber }) => {
  const entryFields = ['subject', 'condition', 'stimulus', 'response'];
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  }

  const handleColumnMappingChange = (field, value) => {
    setCsvColumnMappings({ ...csvColumnMappings, [field]: value });
  };

  // Bulk entry mode
  if (entryMode === 'bulk') {
    return (
      <div>
        <h2>Add new data (bulk entry mode)</h2>
        <p>structure each line: trialNumber;subject;condition;stimulus;response</p>
        <p><b>IMPORTANT: don't repeat trial numbers!</b></p>
        <textarea value={currentBulkData} onChange={handleBulkDataChange} rows='10' cols='40'></textarea>
      </div>
    );
  }

  // CSV upload mode
  if (entryMode === 'csv') {
    return (
      <div>
        <h2>Add new data (CSV upload mode)</h2>

        <h3>Please Choose CSV File To Upload</h3>
        <input type='file' accept='.csv' onChange={handleFileSelect} />

        <h3>Please Input Your Column Names</h3>
        <div>
<input 
  placeholder="Subject Column" 
  value={csvColumnMappings.subject}
  onChange={(e) => handleColumnMappingChange('subject', e.target.value)} 
/>
<input 
  placeholder="Condition Column" 
  value={csvColumnMappings.condition}
  onChange={(e) => handleColumnMappingChange('condition', e.target.value)} 
/>
<input 
  placeholder="Stimulus Column" 
  value={csvColumnMappings.stimulus}
  onChange={(e) => handleColumnMappingChange('stimulus', e.target.value)} 
/>
<input 
  placeholder="Response Column" 
  value={csvColumnMappings.response}
  onChange={(e) => handleColumnMappingChange('response', e.target.value)} 
/>
        </div>
        <button onClick={() => handleCSVUpload(selectedFile, csvColumnMappings)}>Upload</button>
      </div>
    );
  }

  // Single entry mode
  return (
    <div>
      <h2>Add new data (single entry mode)</h2>
      <form onSubmit={handleAddDatum} autoComplete='off' className='single-entry-container'>
        <div className='single-entry-field'>
          <b>trial number</b>
          <input id='trialNumber' value={rowNumber} readOnly />
        </div>
        {entryFields.map(i => (
          <div key={i} className='single-entry-field'>
            <b>{i}</b>
            <input id={i} value={newDatum[i]} onChange={handleInputChange} />
          </div>
        ))}
        <div className='single-entry-field'>
          <button type='submit'>add</button>
        </div>
      </form>
    </div>
  );
};

export default Add;
