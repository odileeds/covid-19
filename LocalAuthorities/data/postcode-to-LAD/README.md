# Postcodes to Local Authority mapping

NHS Digital have NHS 111 data with the first 4 characters of the postcode. They want to release the data by Local Authority. But UK geography is tricky and postcode areas don't line up with Local Authorities. 

There is a [postcode lookup file from the ONS](https://geoportal.statistics.gov.uk/datasets/postcode-to-output-area-to-lower-layer-super-output-area-to-middle-layer-super-output-area-to-local-authority-district-february-2020-lookup-in-the-uk) which can be downloaded and extracted. A perl script parses this big file and trims each postcode to 4 characters (remove space first) and saves the number of postcodes in each corresponding Local Authority to [a JSON file](postcode-to-lad.json).



## Method

1. Download the extract the [postcode lookup file from the ONS](https://geoportal.statistics.gov.uk/datasets/postcode-to-output-area-to-lower-layer-super-output-area-to-middle-layer-super-output-area-to-local-authority-district-february-2020-lookup-in-the-uk). This results in a ~395MB file (`PCD_OA_LSOA_MSOA_LAD_FEB20_UK_LU.csv`) containing every postcode along with their corresponding `oa11cd`, `lsoa11cd`, `msoa11cd`, `ladcd`, `lsoa11nm`, `msoa11nm`, `ladnm`, and `ladnmw` fields. **The ONS provide one Local Authority for each postcode but you should note that that isn't strictly guaranteed in reality.**
2. Process each line of this file to extract the first four characters of the postcode. Note that I first remove any spaces as my guess was that NHS Digital didn't include the space as one of the four characters.
3. For each four-character postcode keep a note of how many times it appears in each Local Authority (`ladcd`).
4. Create a JSON file containing an object that uses the four-character postcode as the key and then each Local Authority listed with how many times it is connected with that four-character postcode.
