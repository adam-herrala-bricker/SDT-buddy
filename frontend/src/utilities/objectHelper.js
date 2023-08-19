//function to check that two arrays of objects contain all the same objects
const fullEqualityChecker = (arr1, arr2) => {
    let isEqual = false

    //get everything in the same order
    arr1.sort(sortObjects)
    arr2.sort(sortObjects)

    //only need to keep going if they have the same length
    if (arr1.length === arr2.length) {
        if (arr1.every((element, index) => {
            //console.log('arr1',element)
            //console.log('arr2',arr2[index])
            return(singleEqualityChecker(element, arr2[index]))
        })) {
            isEqual = true
        }
    }
    return isEqual

}

//checks if two objects contain all the same key-value pairs
const singleEqualityChecker = (obj1, obj2) => {
    let isEqual = true

    //only need to keep going if they have the same length
    if (obj1.length === obj2.length) {
        Object.keys(obj1).forEach(key => {

            //any instance of missing or different value --> isEqual = false
            if (obj2[key] === undefined | obj1[key] !== obj2[key]) {
                isEqual = false
            }
        })

    } else {
        //different lengths --> guaranteed false
        isEqual = false
    }

    return isEqual
}

//comparison function for sorting arrays of objects
const sortObjects = (a,b) => {
    const stringA = JSON.stringify(a)
    const stringB = JSON.stringify(b)

    if (stringA > stringB) {
        return 1
    } else if (stringA < stringB) {
        return -1
    } else {
        return 0
    }
}

module.exports = {fullEqualityChecker}
