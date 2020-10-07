# Dashboard

The [Local Authority COVID-19 dashboard](https://odileeds.github.io/covid-19/LocalAuthorities/dashboard/) shows summary stats (and basic graphs) for UK Local Authorities*. It relies on data sourced from several places. A few times a day a script `[phe.pl](../data/phe.pl)` is run which updates this directory and sub-directories storeing the current state in [JSON files per Local Authority](data/).

## Sources

The data are sourced from:

* __restrictions__ from the [House of Commons Library's CSV file of restrictions](https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/commonslibrary-coronavirus-restrictions-data.csv) (they also have [a nice map](https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/))
* __cases__ from the [Public Health England API](https://coronavirus.data.gov.uk/developers-guide)
* __deaths__ from the [Office of National Statistics weekly death data](https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions/)
* __populations__ from [ONS population estimates for England](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/localauthoritiesinenglandtable2) and [a conversion file on DropBox](https://www.dropbox.com/s/s2en5rf72zpdbag/Health%20Board%20to%20LA%20Look%20Up.xlsx?dl=0). These are extracted to [populations.csv](../data/populations.csv).


## Data

The data directory contains each Local Authority's data in JSON format:

```[type=javascript]
{
	"name":"Harrogate",
	"population": 160644,
	"restrictions":{
		"src": "https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/",
		"updated": "2020-10-06T16:07:25Z",
		"url": {"local":"","national":"https://www.gov.uk/government/publications/coronavirus-outbreak-faqs-what-you-can-and-cant-do/coronavirus-outbreak-faqs-what-you-can-and-cant-do"},
		"local": {},
		"national": {
			"businessclosures": true,
			"openinghours": true,
			"raves": true,
			"ruleofsix": true
		}
	},
	"deaths":{
		"src": "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions/24",
		"updated": "2020-10-06",
		"all": 1447,
		"cov": 208,
		"weeks":[
			{"txt":"Week 39","all":27,"cov":0},
			{"txt":"Week 38","all":34,"cov":0},
			{"txt":"Week 37","all":34,"cov":1},
			.
			.
			.
		]
	},
	"cases": {
		"src":"https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=ltla;areaCode=E07000165&structure=%7B%22date%22:%22date%22,%22areaName%22:%22areaName%22,%22areaCode%22:%22areaCode%22,%22newCasesBySpecimenDate%22:%22newCasesBySpecimenDate%22,%22cumCasesBySpecimenDate%22:%22cumCasesBySpecimenDate%22,%22cumCasesBySpecimenDateRate%22:%22cumCasesBySpecimenDateRate%22%7D&format=json",
		"updated":"2020-10-06T14:16:39Z",
		"type":"SpecimenDate",
		"n": 208,
		"days":[
			{"date":"2020-10-05","day":2,"tot":1230},
			{"date":"2020-10-04","day":17,"tot":1228},
			{"date":"2020-10-03","day":24,"tot":1211},
			.
			.
			.
		]
	}
}
```

where:
* `name` is the human-friendly name
* `population` is the population (latest estimates)
* `restrictions` is:
  * `src` is the link to the source
  * `updated` comes from the HEAD request for the HoC CSV file
  * `url` gives URLs to documentation for both `local` and `national` restrictions
  * `local` can have the properties `ruleofsix`, `householdmixing`, `raves`, `stayinglocal`, `stayinghome`, `notstayingaway`, `businessclosures`, `openinghours` (if true)
  * `national` can have the properties `ruleofsix`, `householdmixing`, `raves`, `stayinglocal`, `stayinghome`, `notstayingaway`, `businessclosures`, `openinghours`, `gatherings` (if true). The HoC rows for "Rest of England", "Scotland", "Rest of Wales" are used to set Local Authorities that haven't been explicitly set.
* `deaths` has been summed by Local Authority District with `all` being the total of all deaths in that week and `cov` being the total of COVID-related deaths in that week.
  * `src` is the link to the source documentation (ONS create a new CSV file each week that contains everything)
  * `updated` is the date given on the source documentation above (may not be when the data are up to)
  * `all` gives the cumulative total for all types of death
  * `cov` gives the cumulative total for deaths associated with COVID
  * `weeks` is an array of weekly data:
    * `txt` is the text describing the week (at the moment these are things like `Week 01`)
	* `all` gives the total of all types of death in this named week
	* `cov` gives the total of COVID-related death in this named week
* `cases` is:
  * `src` the link to the source
  * `updated` the date taken from the HEAD request for the API
  * `type` is `SpecimenDate` (just to be explicit)
  * `n` is the number of `days` included
  * `days` is an array of days where:
    * `date` is the ISO8601 date
	* `day` is the `newCasesBySpecimenDate` from the PHE API
	* `tot` is the `cumCasesBySpecimenDate` from the PHE API


## Graphs

The `svg` sub-directory contains an SVG graph of cumulative cases per 100,000 for each authority. These will be re-generated when the data files are.


*where possible