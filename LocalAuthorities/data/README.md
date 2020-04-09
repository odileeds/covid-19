# Data

## Populations

### England

[Public Health England](https://www.gov.uk/government/publications/covid-19-track-coronavirus-cases) provide [COVID-19 cases as a CSV](https://www.arcgis.com/home/item.html?id=b684319181f94875a6879bbc833ca3a6).

The populations for England come from [ONS population estimates](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationprojections/datasets/localauthoritiesinenglandtable2) extracted to [populations.csv](populations.csv). We have extracted values for `All ages` in `2020` and included the following additions:

* Created an UTLA `E09000001-12` composed of City of London (`E09000001`) and `Hackney (`E09000012`);
* Created an UTLA `E06000052-3` composed of Cornwall (`E06000052`) and Isles of Scilly (`E06000053`);
* Converted Dorset from `E10000009` to `E06000059`;
* Combined the populations of Bournemouth (`E06000028`), Christchurch (`E07000048`) and Poole (`E06000029`) into `E06000058`.

### Wales, Scotland, and Northern Ireland

[Confirmed cases for Wales, Scotland, and Northern Ireland](https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv) are collated by Tom White.

The populations for Wales, Scotland, and Northern Ireland along with Health Board conversions for Wales and Scotland are from [a conversion file on DropBox](https://www.dropbox.com/s/s2en5rf72zpdbag/Health%20Board%20to%20LA%20Look%20Up.xlsx?dl=0).