//keeping all the code for calculating and displaying the SDT metrics seperated here
import {useState, useEffect} from 'react'

import sdtCalculator from '../utilities/sdtCalculator'

const HeaderRow = ({metrics}) => {
    return(
        Object.keys(metrics).map(i =><th key = {i}>{i === 'metric' ? '' : i}</th>) //don't want a column called "metric"
    )
}

const StandardRow = ({metrics, rowID}) => {
    return(
        Object.values(metrics)
        .map(i => <td key={i.cond}>{ isNaN(i[rowID]) ? '-' : i[rowID].toString() }</td>)
    )

}

const Columnizer = ({metrics, rowIDs, defaultMetrics}) => {
    
    return(
        rowIDs.map(i => <tr key = {i}><td key='metric'>{defaultMetrics['metric'][i]}</td><StandardRow metrics={metrics} rowID={i}/></tr>)
    )
}

const DisplayMetrics = ({currentData, thisSubject, setThisSubject}) => {
    const rowIDs = ['HR', 'MR', 'CRR', 'FAR', 'dPrimeLit', 'dPrimeCor', 'cLit', 'cCor']
    const defaultMetrics = {metric : {cond: 'metric', HR: 'HR', MR: 'MR', CRR: 'CRR', FAR: 'FAR', dPrimeLit: "d' (literal)", dPrimeCor: "d' (corrected)", cLit: "c (literal)", cCor: "c (corrected)"}}

    const [metrics, setMetrics] = useState(defaultMetrics)

    //Array of unique subjects (plus 'all')
    const subjects = Array.from(new Set(currentData.map(i => i.subject))).concat('all')

    //event handler for updating
    const updateAll = () => {
        //array of unique condition names
        const conditionsSet = new Set(currentData.map(i => i.condition))
        const conditionsArray = Array.from(conditionsSet)
        const allConditions = conditionsArray.concat('overall')

        const newMetrics = sdtCalculator(currentData, allConditions, subjects, thisSubject)

        setMetrics(newMetrics)
    }

    //execute updateAll everytime currentData changes (coming back to this, useEffect probably isn't the right method here . . .)
    // eslint-disable-next-line
    useEffect(updateAll, [currentData, thisSubject])

    //only display if something to display
    if (currentData.length === 0) {
        return(null)
    }
    return(
        <div className='stats-container'>
            <h2>Accuracy metrics</h2>
            <div className = 's-button-container'>
                {subjects.map(i => 
                    <button key = {i} onClick = {() => setThisSubject(i)} className = {thisSubject === i ? 'dark-button' : null}>{i}</button>
                )}
            </div>
            <table>
                <thead className='boader-head'>
                    <tr>
                    <th></th>
                    <HeaderRow metrics = {metrics}/>
                    </tr>
                </thead>
                <tbody>
                    <Columnizer metrics = {metrics} rowIDs ={rowIDs} defaultMetrics = {defaultMetrics}/>
                </tbody>
            </table>
        </div>
        
    )
}

export default DisplayMetrics