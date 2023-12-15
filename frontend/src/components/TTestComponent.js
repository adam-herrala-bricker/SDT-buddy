import { useState, useEffect } from 'react';
import { tTestTwoSample } from 'simple-statistics';
import { useDispatch } from 'react-redux';
import { notifier } from '../reducers/notificationReducer';

const TTestComponent = ({ dPrimeCorValuesCond1, dPrimeCorValuesCond2, cCorValuesCond1, cCorValuesCond2 }) => {
    const [tTestResultDPrime, setTTestResultDPrime] = useState(null);
    const [tTestResultCCor, setTTestResultCCor] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (dPrimeCorValuesCond1.length < 2 || dPrimeCorValuesCond2.length < 2 || cCorValuesCond1.length < 2 || cCorValuesCond2.length < 2) {
            dispatch(notifier('Upload more subjects for T-Test', 'error', 5));
            setTTestResultDPrime(null);
            setTTestResultCCor(null);
            return;
        }

        const resultDPrime = tTestTwoSample(dPrimeCorValuesCond1, dPrimeCorValuesCond2);
        setTTestResultDPrime(resultDPrime);

        const resultCCor = tTestTwoSample(cCorValuesCond1, cCorValuesCond2);
        setTTestResultCCor(resultCCor);
    }, [dPrimeCorValuesCond1, dPrimeCorValuesCond2, cCorValuesCond1, cCorValuesCond2, dispatch]);

    return (
        <div>
            <h3>T-Test Results</h3>
            {tTestResultDPrime !== null && (
                <>
                    <p>d prime t-Statistic: {tTestResultDPrime?.toFixed(3)}</p>
                    <p>Criterion t-Statistic: {tTestResultCCor?.toFixed(3)}</p>
                </>
            )}
        </div>
    );
};

export default TTestComponent;
