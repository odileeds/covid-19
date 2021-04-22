# ICS/STP vaccine data

Weekly [vaccine data from NHS England](https://www.england.nhs.uk/statistics/statistical-work-areas/covid-19-vaccinations/) released under OGLv3

## Boundaries

  * [STP (April 2020) ultra generalised boundaries from ONS](https://geoportal.statistics.gov.uk/datasets/sustainability-and-transformation-partnerships-april-2020-boundaries-en-buc) see [Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson](Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson)
  * [MSOA (December 2011) super generalised boundaries from ONS]() see [Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson](Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson)

## Population data

  * STP/ICS populations can be found from [Clinical Commissioning Group population estimates from ONS](https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/clinicalcommissioninggroupmidyearpopulationestimates) (mid 2019) see [CCG-STP-ages-population.csv](CCG-STP-ages-population.csv);
  * MSOA populations using ONS 2019 estimates see [MSOA-ages-population.csv](MSOA-ages-population.csv);
  * MSOA populations using National Immunisation Management Service (NIMS) estimates see [NIMS-MSOA-population.csv](NIMS-MSOA-population.csv)
  * LTLA populations using National Immunisation Management Service (NIMS) estimates see [NIMS-LTLA-population.csv](NIMS-LTLA-population.csv)


## Updating

1. Download weekly data from [NHS England](https://www.england.nhs.uk/statistics/statistical-work-areas/covid-19-vaccinations/)
2. Export ICS/STP sheet as `data/vaccinations-YYYYMMDD.csv` and tidy it up to match previous weeks
3. Change `Lancashire and South Cumbria ICS` to `Healthier Lancashire and South Cumbria` and `Sussex Health and Care Partnership` to `Sussex and East Surrey Health and Care Partnership`
4. Edit [vaccines.pl](vaccines.pl) with correct values for `$vaccinedate`, `$vaccinedatenice`, `$vaccineperiod` and update all the age categories as necessary.
5. Extract NIMS MSOA populations
6. Extract NIMS LTLA populations
7. Run [populations.pl]
8. Extract MSOA vaccine data as `data/vaccinations-MSOA-YYYYMMDD.csv`
9. Extract LTLA data as `data/vaccinations-LTLA-YYYYMMDD.csv`
10. Run vaccines.pl
11. Edit [phe.pl](../LocalAuthorities/data/phe.pl) and edit age groups in NIMS section.
12. Run phe.pl
13. Update `vaccines/inc/covid-19-vaccine-nhs-stp.json` and `vaccines/inc/covid-19-vaccine-msoa.json` files.