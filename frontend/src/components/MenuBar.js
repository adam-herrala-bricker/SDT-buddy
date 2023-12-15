import Notifications from './Notifications'

const MenuBar = ({
    handleCreateNew,
    handleSave, 
    saveStatus, 
    entryMode,
    toggleEntryMode, 
    toggleDeleteMode, 
    handleReset,
    displayHelp,
    setDisplayHelp,
    notificationText,
    setNotificationText
}) => {

    return(
        <div className = 'menu-container'>
          <div className = 'button-container'>
            <button onClick = {handleCreateNew}>new save key</button>
            <button onClick = {handleSave} className = {saveStatus}>save dataset</button>
            <select value={entryMode} onChange={(e) => toggleEntryMode(e.target.value)} className='menu-dropdown'>
              <option value="single">Single Entry</option>
              <option value="bulk">Bulk Entry</option>
              <option value="csv">CSV Upload</option>
            </select>
            <button onClick = {toggleDeleteMode}>toggle edit mode</button>
            <button onClick = {handleReset}>reset application</button>
            <button onClick = {() => setDisplayHelp(!displayHelp)} className = {displayHelp ? 'dark-button' : ''}>help</button>
          </div>
          <div>
            <Notifications notificationText = {notificationText} setNotificationText = {setNotificationText}/>
          </div>
        </div>
    )
}

export default MenuBar

