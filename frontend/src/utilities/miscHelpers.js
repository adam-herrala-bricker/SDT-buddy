//this converts arrays to objects in the bulk data change handler
export const arrayToObject = (arr) => {
    return({rowNum : arr[0], subject : arr[1], condition : arr[2], stimulus : arr[3], response : arr[4]})
  }

  //this converts an array of data objects to a string for the switch to bulk entry mode
export const arrayToString = (arr) => {
    const newString = arr
        .map(i => Object.values(i))
        .map(i => i.join(';'))
        .join('\n')
    return(newString)
}

//sorting data
export const sorterer = (a,b) => {
    const codeA = a.subject ? a.subject[0] : null
    const codeB = b.subject ? b.subject[0] : null
    const restA = a.subject ? Number(a.subject.slice(1,)) : null
    const restB = b.subject ? Number(b.subject.slice(1,)) : null

    let subjectA = a.subject || null
    let subjectB = b.subject || null

    //if encoded like S1, S2, ... --> can sort like ints (so, e.g., S2 will come before S10)
    if (codeA === 'S' && codeB === 'S' && !Number.isNaN(restA) && !Number.isNaN(restB)) {
        subjectA = restA
        subjectB = restB
    }
    
    //sort by subject first
    if (subjectA > subjectB) {
        return 1
    } else if (subjectA < subjectB) {
        return -1
    //then by row number
    } else if (Number(a.rowNum) > Number(b.rowNum)) {
        return 1
    } else if (Number(a.rowNum) > Number(b.rowNum)) {
        return -1
    } else {
        return 0
    }
}