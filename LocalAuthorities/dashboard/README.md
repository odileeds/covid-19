# Dashboard data

We have a job that updates the data each day and stores the current state in [JSON files per Local Authority](data/). The data are sourced from:

* __restrictions__ from the [House of Commons Library's CSV file of restrictions](https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/commonslibrary-coronavirus-restrictions-data.csv) (they also have [a nice map](https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/))
* __cases__ from the [Public Health England API](https://coronavirus.data.gov.uk/developers-guide)
* __deaths__ from the [Office of National Statistics weekly death data](https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions/)
