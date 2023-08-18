//keeping all the code for calculating and displaying the SDT metrics seperated here
import {useState, useEffect} from 'react'
import {probit} from 'simple-statistics'

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
    const rowIDs = ['HR', 'MR', 'CRR', 'FAR', 'dPrimeLit', 'dPrimeCor', 'cLit', 'cCor']
    const defaultMetrics = {metric : {cond: 'metric', HR: 'HR', MR: 'MR', CRR: 'CRR', FAR: 'FAR', dPrimeLit: "d' (literal)", dPrimeCor: "d' (corrected)", cLit: "c (literal)", cCor: "c (corrected)"}}

    const [metrics, setMetrics] = useState(defaultMetrics)


    //event handler for updating
    const updateAll = () => {
        //array of unique condition names
        const conditionsSet = new Set(currentData.map(i => i.condition))
        const conditionsArray = Array.from(conditionsSet)

        hrCalculator(conditionsArray)

    }

    //execute updateAll everytime currentData changes
    // eslint-disable-next-line
    useEffect(updateAll, [currentData])

    //function for d'
    const dPrime = (HR, FAR) => {return((probit(HR) - probit(FAR)).toFixed(3))}
    
    //function for criterion
    const criterion = (HR, FAR) => {return(-.5*(probit(HR) + probit(FAR)).toFixed(3))}

    //main function for calcuations
    const hrCalculator = (conditionsArray) => {
        const allConditions = conditionsArray.concat('overall')

        const newMetrics = allConditions.reduce((accumulator, condition) => {
            //filter if condition given
            const condData = condition === 'overall' ? currentData : currentData.filter(i => i.condition === condition)
            
            //calculate HR and MR
            const yesResponsesStim = condData.filter(i => i.response === "1" & i.stimulus === "1").length
            const stimTrials = condData.filter(i => i.stimulus === "1").length

            const hitRate = (yesResponsesStim/stimTrials).toFixed(3)
            const missRate = (1-hitRate).toFixed(3)

            //calculate CRR and FAR
            const yesResponsesNoStim = condData.filter(i => i.response === '1' & i.stimulus === '0').length
            const noStimTrials = condData.filter(i => i.stimulus === '0').length

            const faRate = (yesResponsesNoStim/noStimTrials).toFixed(3)
            const crRate = (1-faRate).toFixed(3)

            //literal d' and criterion
            const dPrimeLit = dPrime(hitRate, faRate)
            const cLit = criterion(hitRate, faRate)
            
            //corrected d' and criterion
            const adjustedHR = hitRate === '1.000' ? (stimTrials-1)/stimTrials : hitRate
            const adjustedFAR = faRate === '0.000' ? 1/noStimTrials : faRate
            const dPrimeCor = dPrime(adjustedHR, adjustedFAR)
            const cCor = criterion(adjustedHR, adjustedFAR)


            return({...accumulator, [condition]: {cond: [condition], HR: hitRate, MR: missRate, CRR: crRate, FAR: faRate, dPrimeLit : dPrimeLit, dPrimeCor: dPrimeCor, cLit: cLit, cCor: cCor}})
    
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
            <h2>Accuracy metrics</h2>
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