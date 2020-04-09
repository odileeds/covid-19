# Postcodes to Local Authority mapping

NHS Digital have NHS 111 data with the first 4 characters of the postcode. They want to release the data by Local Authority. But UK geography is tricky and postcode areas don't line up with Local Authorities. 

There is a [postcode lookup file from the ONS](https://geoportal.statistics.gov.uk/datasets/postcode-to-output-area-to-lower-layer-super-output-area-to-middle-layer-super-output-area-to-local-authority-district-february-2020-lookup-in-the-uk) which can be downloaded and extracted. A perl sript parses this big file and trims each postcode to 4 characters (remove space first) and saves the number of postcodes in each corresponding Local Authority to [a JSON file](postcode-to-lad.json);