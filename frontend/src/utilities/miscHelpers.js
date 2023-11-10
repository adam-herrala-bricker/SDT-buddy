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
    const intA = Number(a.rowNum)
    const intB = Number(b.rowNum)

    if (intA > intB) {
        return 1
    } else if (intA < intB) {
        return -1
    } else {
        return 0
    }
}