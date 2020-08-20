# Data

## Confirmed cases

~~Tom White compiles [UK historical data](https://github.com/tomwhite/covid-19-uk-data) from the various national agencies (England, Wales, Scotland, Northern Ireland). Previously we took data for England direct from the Public Health England dashboard but on 14th April they changed how that works and it no longer has a fixed URL to download the latest data from. We only use [Tom's UK data now](https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv). To keep page load down, we are creating [a processed version of Tom's data](utla.json) every 15 minutes.~~

Following Tom White taking the [understandable decision](https://github.com/tomwhite/covid-19-uk-data/issues/68) to stop maintaining a compilation of UK-wide local data, [Giles Dring now grabs cases data](https://github.com/odileeds/covid-19-uk-datasets) for England and Scotland from their respective sources. The definition of cases may vary between England and Scotland and over time.

## Populations

### England

~~[Public Health England](https://www.gov.uk/government/publications/covid-19-track-coronavirus-cases) provide [COVID-19 cases as a CSV](https://www.arcgis.com/home/item.html?id=b684319181f94875a6879bbc833ca3a6).~~ [Confirmed cases for England, Wales, Scotland, and Northern Ireland](https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv) are collated by Tom White.

The populations for England mostly come from [ONS population estimates](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/localauthoritiesinenglandtable2) extracted to [populations.csv](populations.csv). We have extracted values for `All ages` in `2020` and included the following additions:

* Created an UTLA `E09000001-12` composed of City of London (`E09000001`) and `Hackney (`E09000012`);
* Created an UTLA `E06000052-3` composed of Cornwall (`E06000052`) and Isles of Scilly (`E06000053`);
* Converted Dorset from `E10000009` to `E06000059`;
* Combined the populations of Bournemouth (`E06000028`), Christchurch (`E07000048`) and Poole (`E06000029`) into `E06000058`.
* Combined the populations of Aylesbury Vale (`E07000004`), Chiltern (`E07000005`), South Bucks (`E07000006`) and Wycombe (`E07000007`) into `E06000060`.
* Added [a population for East Suffolk](https://www.citypopulation.de/en/uk/eastofengland/admin/E07000244__east_suffolk/) (`E07000244`) estimated at 2018-06-30.
* Added [a population for West Suffolk](https://www.citypopulation.de/en/uk/admin/suffolk/E07000245__west_suffolk/) (`E07000245`) estimated at 2018-06-30.
* Added [a population for Somerset West and Taunton](https://www.citypopulation.de/en/uk/admin/somerset/E07000246__somerset_west_and_taunton/) (`E07000246`) estimated at 2018-06-30.
* Added [a population for Westminster and City of London](https://en.wikipedia.org/wiki/Cities_of_London_and_Westminster_%28UK_Parliament_constituency%29) estimated in 2011

### Wales, Scotland, and Northern Ireland

[Confirmed cases for Wales, Scotland, and Northern Ireland](https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv) are collated by Tom White.

The populations for Wales, Scotland, and Northern Ireland along with Health Board conversions for Wales and Scotland are from [a conversion file on DropBox](https://www.dropbox.com/s/s2en5rf72zpdbag/Health%20Board%20to%20LA%20Look%20Up.xlsx?dl=0).
