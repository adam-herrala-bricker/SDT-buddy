const {fullEqualityChecker} = require('../utilities/objectHelper')

//arrays for testing
const emptyA = []
const emptyB = []

const entry1 = {name: 'Dave', city: 'New York', occupation: 'dentist'}
const entry2 = {name: 'Susan', city: 'Boston', occupation: 'writer'}
const entry3 = {name: 'Greg', city: 'Chicago', occupation: 'teacher'}
const entry4 = {name: 'Linda', city: 'Miami', occupation: 'chef'}
const entry4b = {name: 'Linda', city: 'Miami'}

const entryX = {fish: 'trout', size: 3, released: true}
const entryY = {president: 'Nixon', catchPhrase: 'sock it to me'} 

const singleA = [entry1]
const singleB = [entry1]

const tripleA = [entry1, entry2, entry3]
const tripleB = [entry1, entry2, entry3]
const tripleC = [entry3, entry2, entry1]

const quadA = [entry1, entry2, entry3, entry4]
const quadB = [entry2, entry1, entry4, entry3]
const quadC = [entry1, entry2, entry3, entry4b]

const mixedA = [entry1, entryX, entry2, entryY]
const mixedB = [entryX, entryY, entry1, entry2]

const distinctA = [entry1, entry2, entry1]
const distinctB = [entry3, entry4, entry4]

const multipleA = [entry1, entry1, entry1, entry1]


//verify that test arrays are actually unequal as far as JS is concerned
describe('test arrays unequal on JS equality', () => {
    test('emptyA and emptyB', () => {
        expect(emptyA === emptyB).toBe(false)
    })
    
    test('singleA and singleB', () => {
        expect(singleA === singleB).toBe(false)
    })

    test('tripleA and tripleB', () => {
        expect(tripleA === tripleB).toBe(false)
    })

    test('tripleA and tripleC', () => {
        expect(tripleA === tripleB).toBe(false)
    })

    test('quadA and quadB', () => {
        expect(quadA === quadB).toBe(false)
    })

    test('mixedA and mixedB', () => {
        expect(mixedA === mixedB).toBe(false)
    })
})



//returns true for (imo) equal
describe('returns true for equal contents', () => {
    test('stictly equal arrays', () => {
        const result = fullEqualityChecker(quadA, quadA)
        expect(result).toBe(true)
    })
    
    test('empty arrays', () => {
        const result = fullEqualityChecker(emptyA, emptyB)
        expect(result).toBe(true)
    })

    test('same single entry', () => {
        const result = fullEqualityChecker(singleA, singleB)
        expect(result).toBe(true)
    })

    test('same 3 entries, same order', () => {
        const result = fullEqualityChecker(tripleA, tripleB)
        expect(result).toBe(true)
    })

    test('same 3 entries, reversed order', () => {
        const result = fullEqualityChecker(tripleA, tripleC)
        expect(result).toBe(true)
    })

    test('same 4 entries, jumbled order', () => {
        const result = fullEqualityChecker(quadA, quadB)
        expect(result).toBe(true)
    })

    test('entries with mixed properties', () => {
        const result = fullEqualityChecker(mixedA, mixedB)
        expect(result).toBe(true)
    })
})

//doesn't return equal for unequal contents
describe('returns false for unequal contents', () => {
    test('fully distinct entries', () => {
        const result = fullEqualityChecker(distinctA, distinctB)
        expect(result).toBe(false)
    })

    test('A is a proper subset of B', () => {
        const result = fullEqualityChecker(tripleA, quadA)
        expect(result).toBe(false)
    })

    test('B is a proper subset of A', () => {
        const result = fullEqualityChecker(quadA, tripleA)
        expect(result).toBe(false)
    })

    test('A is a multiple of B', () => {
        const result = fullEqualityChecker(multipleA, singleA)
        expect(result).toBe(false)
    })

    test('B is a multiple of A', () => {
        const result = fullEqualityChecker(singleA, multipleA)
        expect(result).toBe(false)
    })

    test('A is missing a single property of B', () => {
        const result = fullEqualityChecker(quadC, quadA)
        expect(result).toBe(true)
    })

    test('B is missing a single property of A', () => {
        const result = fullEqualityChecker(quadA, quadC)
        expect(result).toBe(false)
    })
})