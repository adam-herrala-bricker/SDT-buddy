//keeping all the code for calculating and displaying the SDT metrics seperated here
import {useState, useEffect} from 'react'

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

const DisplayMetrics = ({currentData}) => {
    //const rowIDs = ['HR', 'MR', 'CRR', 'FAR', 'dPrimeLit', 'dPrimeCor', 'cLit', 'cCor']
    const rowIDs = ['HR', 'MR']
    const defaultMetrics = {metric : {cond: 'metric', HR: 'HR', MR: 'MR', CRR: 'CRR', FAR: 'FAR', dPrimeLit: "d' (literal)", dPrimeCor: "d' (corrected)", cLit: "c (literal)", cCor: "c (corrected)"}}

    const [metrics, setMetrics] = useState(defaultMetrics)


    //event handler for updating
    const updateAll = () => {
        //array of unique condition names
        const conditionsSet = new Set(currentData.map(i => i.condition))
        const conditionsArray = Array.from(conditionsSet)

        hrCalculator(conditionsArray)

    }

    useEffect(updateAll, [currentData])

    //helper functions for calcuations
    const hrCalculator = (conditionsArray) => {
        const allConditions = conditionsArray.concat('overall')
        console.log(allConditions)

        const newMetrics = allConditions.reduce((accumulator, condition) => {
            //console.log('accumulator',accumulator)
            //console.log('condition', condition)
            //filter if condition given
            const condData = condition === 'overall' ? currentData : currentData.filter(i => i.condition === condition)
            
            const yesResponsesStim = condData.filter(i => i.response === "1" & i.stimulus === "1").length
            const stimTrials = condData.filter(i => i.stimulus === "1").length

            const hitRate = (yesResponsesStim/stimTrials).toFixed(3)
            const missRate = (1-hitRate).toFixed(3)

            return({...accumulator, [condition]: {cond: [condition], HR: hitRate, MR: missRate}})
    
        }, {})

        //newMetrics['metric'] = defaultMetrics.metric
        setMetrics(newMetrics)
    }

    //only display if something to display
    if (currentData.length === 0) {
        return(null)
    }
    return(
        <div>
            <h2>Metrics</h2>
            <table>
                <thead>
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