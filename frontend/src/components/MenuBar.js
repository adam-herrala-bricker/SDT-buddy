import Notifications from './Notifications'

const MenuBar = ({
    handleCreateNew,
    handleSave, 
    saveStatus, 
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
            <button onClick = {toggleEntryMode}>toggle entry mode</button>
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