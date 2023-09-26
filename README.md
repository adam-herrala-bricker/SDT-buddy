# SDT-buddy

SDT buddy is a web app designed to easily calculate simple metrics commonly used in Signal Detection Theory: hit rate, miss rate, false alarm rate, correct rejection rate, d', and decision criterion.

Link: https://psychophysics-app.utu.fi/

Included funtionality:
- Two modes of DATA ENTRY: Add data trial-by-trial or all at once in a .csv format.
- Quickly delete individual lines of data with DELETE MODE.
- Save data to a database and retrieve later using a unique ID key.

Encoding data:
- Condition names can be anything you want. SDT buddy will automatically group trials with the same name.
- "Stimulus" and "response" only take 1 and 0. "Stimulus" encodes whether a stimulus in the target class was presented, 
and "response" encodes whether a participant response for the target stimulus class was registered.
- When adding trials in bulk entry mode, each trial must be on its own line, with no empty lines.
- Each line should be structured: <rowNumber;condition;stimulus;response>
- Do not include header rows when entering bulk data.
- **IMPORTANT:** Row number must be unique for every trial, otherwise the application may not function correctly.
Single entry mode will force this, but bulk entry may not.

Note also that **under no circumstances** should this be used in research applications. I designed it only as a pedagogical tool for my psychophysics course at the University of Turku—something students can use to quickly check whether their analysis pipelines are outputting the correct results.
