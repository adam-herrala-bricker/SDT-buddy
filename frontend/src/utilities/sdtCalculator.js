import {mean, probit} from 'simple-statistics'

//function for d'
const dPrime = (HR, FAR) => {
    //need to re-introduce Infinity bc of the way probit is coded
    if (HR === 1 || FAR === 0) {
        return Infinity
    }

    return((probit(HR) - probit(FAR)))
}

//function for criterion
const criterion = (HR, FAR) => {
    //re-introduce Infinity as in dPrime()
    if (HR === 1 || FAR === 0) {
        return Infinity
    }

    return(-.5*(probit(HR) + probit(FAR)))

}

//helper function for returning the mean of an object only if it's an array (otherwise returns the object)
const meanIfArray = (item) => {
    //non-empty array
    if (Array.isArray(item) && item.length > 0) {
        return mean(item.map(i => Number(i))).toFixed(3)
    }

    return item
}

//helper function for taking array with objects of array and returning the means of those arrays in the same position
const convertArraysToMeans = (metricObject) => {
    const conditions = Object.keys(metricObject)

    const returnObject = conditions.reduce((accumulator, condition) => {
        const theseKeys = Object.keys(metricObject[condition])

        const returnEntry = theseKeys.reduce((accumulator, key) => {
            return {...accumulator, [key]: meanIfArray(metricObject[condition][key])}
        }, {})

        return {...accumulator, [condition]: returnEntry}
    }, {})

    return returnObject
}

//default export
const sdtCalculator = (currentData, allConditions, subjects, thisSubject) => {
    //object for an emptry condition
    const emptyCondition = {
        HR: [],
        MR: [],
        CRR: [],
        FAR: [],
        dPrimeLit: [], 
        dPrimeCor: [], 
        cLit: [], 
        cCor: []
    }

    //object with empty entries for all conditions
    const emptyMetrics = allConditions.reduce((accumulator, condition) => {
        return {...accumulator, [condition]: {...emptyCondition, cond: condition}}
    }, {})
    
    //array of subjects included in this calaculation (doing it this way to allow for mean if subjects === 'all')
    const subjectsToReduce = thisSubject === 'all' ? subjects.filter(i => i !== 'all') : [thisSubject]
    
    //reduce over array of conditions
    const groupMetrics = allConditions.reduce((accumulator, condition) => {

        //reduce over array of subjects
        const subjectMetrics = subjectsToReduce.reduce((accumulator, subject) => {
            //filter for given subject (unless thisSubject === 'all')
            const subjectData = currentData.filter(i => i.subject === subject)
        
            //filter if condition given
            const condData = condition === 'overall' ? subjectData : subjectData.filter(i => i.condition === condition)

            //calculate HR and MR
            const yesResponsesStim = condData.filter(i => i.response === "1" & i.stimulus === "1").length
            const stimTrials = condData.filter(i => i.stimulus === "1").length
        
            const hitRate = (yesResponsesStim/stimTrials)
            const missRate = (1-hitRate)
        
            //calculate CRR and FAR
            const yesResponsesNoStim = condData.filter(i => i.response === '1' & i.stimulus === '0').length
            const noStimTrials = condData.filter(i => i.stimulus === '0').length
        
            const faRate = (yesResponsesNoStim/noStimTrials)
            const crRate = (1-faRate)
        
            //literal d' and criterion
            const dPrimeLit = dPrime(hitRate, faRate)
            const cLit = criterion(hitRate, faRate)
            
            //corrected d' and criterion
            const adjustedHR = hitRate === 1 ? (stimTrials-1)/stimTrials : hitRate
            const adjustedFAR = faRate === 0 ? 1/noStimTrials : faRate
            const dPrimeCor = dPrime(adjustedHR, adjustedFAR)
            const cCor = criterion(adjustedHR, adjustedFAR)
            
            return({
                ...accumulator, 
                [condition]: {
                    cond: [condition], 
                    HR: [...accumulator[condition].HR, hitRate], 
                    MR: [...accumulator[condition].MR, missRate], 
                    CRR: [...accumulator[condition].CRR, crRate], 
                    FAR: [...accumulator[condition].FAR, faRate], 
                    dPrimeLit: [...accumulator[condition].dPrimeLit, dPrimeLit], 
                    dPrimeCor: [...accumulator[condition].dPrimeCor, dPrimeCor], 
                    cLit: [...accumulator[condition].cLit ,cLit], 
                    cCor: [...accumulator[condition].cCor, cCor]
                }})

        }, emptyMetrics)
        
        return({
            ...accumulator,
            [condition]: {
                cond: condition,
                HR: [...accumulator[condition].HR, ...subjectMetrics[condition].HR],
                MR: [...accumulator[condition].MR, ...subjectMetrics[condition].MR],
                CRR: [...accumulator[condition].CRR, ...subjectMetrics[condition].CRR],
                FAR: [...accumulator[condition].FAR, ...subjectMetrics[condition].FAR],
                dPrimeLit: [...accumulator[condition].dPrimeLit, ...subjectMetrics[condition].dPrimeLit],
                dPrimeCor: [...accumulator[condition].dPrimeCor, ...subjectMetrics[condition].dPrimeCor],
                cLit: [...accumulator[condition].cLit, ...subjectMetrics[condition].cLit],
                cCor: [...accumulator[condition].cCor, ...subjectMetrics[condition].cCor]
            }
       
        })

    }, emptyMetrics)

    const meanMetrics = convertArraysToMeans(groupMetrics)

    return {
	    meanMetrics,
	    subjectMetrics: groupMetrics
    }
}



export default sdtCalculator

