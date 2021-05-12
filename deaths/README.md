# Deaths

This part of the repo uses deaths data from ONS. These have to be updated manually each Tuesday:

* [Death registrations and occurrences by local authority and health board](https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/causesofdeath/datasets/deathregistrationsandoccurrencesbylocalauthorityandhealthboard)
* [Deaths registered weekly in England and Wales](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/datasets/weeklyprovisionalfiguresondeathsregisteredinenglandandwales) for breakdowns by age group
* [Average of 2015-19](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/adhocs/11485fiveyearaverageweeklydeathsbysexandagegroupenglandandwalesdeathsoccurringbetween2015and2019)


1. Open the [Deaths registered weekly in England and Wales](https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/datasets/weeklyprovisionalfiguresondeathsregisteredinenglandandwales) file
2. Trim the `Weekly figures 2021` and `Covid-19 - Weekly registrations` sheets to match `deaths-all-2021.tsv` and `deaths-covid-2021.tsv`.
3. Run `perl deaths.pl` in this directory.
4. Edit [index.html](index.html) to update the date to that included in the file
5. Open the [Death registrations and occurrences by local authority and health board](https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/causesofdeath/datasets/deathregistrationsandoccurrencesbylocalauthorityandhealthboard) and export the `Registrations - all data` Sheet to [../LocalAuthorities/data/deaths/deaths-2021-registrations.csv](../LocalAuthorities/data/deaths/deaths-2021-registrations.csv).
6. Trim excess lines of commas
7. Run `perl phe.pl` from the [LocalAuthorities/data/](../LocalAuthorities/data/) directory.