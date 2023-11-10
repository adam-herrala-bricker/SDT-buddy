const Load = ({loadKey, handleKeyChange, handleLoad}) => {
    return(
      <div>
        <h2>Load existing dataset</h2>
        <input id='inputKey' size='25' value={loadKey} onChange= {handleKeyChange}/>
        <button onClick = {handleLoad}>load</button>
      </div>
    )
  }

  export default Load