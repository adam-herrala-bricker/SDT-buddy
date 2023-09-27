const HelpText = () => {

    return(
        <div className = 'text-container'>
            <h2>Using SDT Kamu</h2>
            <ol>
                <h3><li>Overview</li></h3>
                <p>SDT Kamu helps you check whether an analysis pipeline for detection-theoretic metrics (d' and criterion) is outputting the correct values for trial-level data. It is intended for <b>educational purposes only</b> and should not be used as a research tool.</p>
                <h3><li>Computed values</li></h3>
                <ul>
                    <li>Hit Rate (HR)</li>
                    <p>Number of trials the target stimulus is presented <b>AND</b> detected by the participant / number of trials the target stimulus is presented</p>
                    
                    <li>Miss Rate (MR)</li>
                    <p>Number of trials the target stimulus is presented <b>BUT</b> not detected by the participant / number of trials the target stimulus is presented</p>
                    
                    <li>Correct Rejection Rate (CRR)</li>
                    <p>Number of trials the target stimulus is not presented <b>AND</b> the participant reports that the target stimulus was not presented / number of trials that the target stimulus was not presented</p>

                    <li>False Alarm Rate (FAR)</li>
                    <p>Number of trials the target stimulus is not presented <b>BUT</b> the participant reports that the target stimulus was presented / number of trials that the target stimulus was not presented</p>
                    <li>d' (literal)</li>
                    <p>probit(HR) -  probit(FAR)</p>
                    <p>Note: Probit, the inverse of the cumulative distribution function of the standard normal distribution, is also represented as Z(x).</p>

                    <li>d' (corrected)</li>
                    <p>d' calculation with the minimum miss and false alarm count set to 1</p>

                    <li>criterion (literal)</li>
                    <p>-.5*(probit(HR) +  probit(FAR))</p>

                    <li>criterion (corrected)</li>
                    <p>criterion calculation with the minimum miss and false alarm count set to 1</p>
                </ul>
                <h3><li>Entry modes</li></h3>
                <ul>
                    <li>Single entry mode</li>
                    <p>Enter each trial individually. 'Stimulus' encodes whether the target stimulus was presented (1 = yes, 0 = no) and 'response' encodes the participant's response (1 = yes, 0 = no). Note that 0 and 1 are the only values permitted for the 'stimulus' and 'response' fields.</p>
                    <p>Trials from the same condition are grouped automatically.</p>

                    <li>Bulk entry mode</li>
                    <p>Enter csv-structured data with one trial per line. Each line should be ordered: trialNumber;subject;condition;stimulus;response.</p>
                    <p>Use only 0 and 1 in stimulus and response fields. Any other values will cause the metrics to compute incorrectly and prevent data from saving.</p>
                    <p><b>NOTE:</b> There is no automatic trial numbering in bulk entry mode, so it's important to ensure that every trial number is unique. Repeat trial numbers may interfere with the app rendering correctly.</p>
                </ul>

                <h3><li>Numbering subjects</li></h3>
                <p>It is recommended that subjects are numbered uniformly, e.g.: S1, S2, S3, . . . Note that naming a subject 'all' will break the app.</p>
                
                <h3><li>Edit mode</li></h3>
                <p>When edit mode is active, press the minus sign next to a trial to delete it.</p>

                <h3><li>Saving a dataset</li></h3>
                <p>While not necessary in order to use the app, SDT Kamu has the option to save a current dataset for future use.</p>
                <p>To save a dataset for the first time, first click 'new save key' at the top of the page. <b>Keep this save key somewhere you'll remember it,</b> because you'll need it to access saved data in the future.</p>
                <p>Once a save key is generated, SDT Kamu will watch for unsaved changes. If the 'save dataset' button is red, this means there are changes to the dataset not saved to the loaded save key. If 'save dataset' is green, this means that all changes are saved.</p>
                
                <h3><li>Loading an existing dataset</li></h3>
                <p>Load an existing dataset using a previously generated save key. Once the dataset is loaded, SDT Kamu will automatically watch for changes and indicate unsaved changes by turning the 'save dataset' button red.</p>
            </ol>
        </div>
    )

}


export default HelpText