/*!
	Dashboard plugin to show a hex map
	Written by Stuart Lowe (ODI Leeds)
 */
(function(S){

	var name = "hexmap";

	// Build hexmap
	var LA2UTLA = {"E06000001":{"id":"E06000001","n":"Hartlepool"},"E06000002":{"id":"E06000002","n":"Middlesbrough"},"E06000003":{"id":"E06000003","n":"Redcar and Cleveland"},"E06000004":{"id":"E06000004","n":"Stockton-on-Tees"},"E06000005":{"id":"E06000005","n":"Darlington"},"E06000006":{"id":"E06000006","n":"Halton"},"E06000007":{"id":"E06000007","n":"Warrington"},"E06000008":{"id":"E06000008","n":"Blackburn with Darwen"},"E06000009":{"id":"E06000009","n":"Blackpool"},"E06000010":{"id":"E06000010","n":"Kingston upon Hull, City of"},"E06000011":{"id":"E06000011","n":"East Riding of Yorkshire"},"E06000012":{"id":"E06000012","n":"North East Lincolnshire"},"E06000013":{"id":"E06000013","n":"North Lincolnshire"},"E06000014":{"id":"E06000014","n":"York"},"E06000015":{"id":"E06000015","n":"Derby"},"E06000016":{"id":"E06000016","n":"Leicester"},"E06000017":{"id":"E06000017","n":"Rutland"},"E06000018":{"id":"E06000018","n":"Nottingham"},"E06000019":{"id":"E06000019","n":"Herefordshire, County of"},"E06000020":{"id":"E06000020","n":"Telford and Wrekin"},"E06000021":{"id":"E06000021","n":"Stoke-on-Trent"},"E06000022":{"id":"E06000022","n":"Bath and North East Somerset"},"E06000023":{"id":"E06000023","n":"Bristol, City of"},"E06000024":{"id":"E06000024","n":"North Somerset"},"E06000025":{"id":"E06000025","n":"South Gloucestershire"},"E06000026":{"id":"E06000026","n":"Plymouth"},"E06000027":{"id":"E06000027","n":"Torbay"},"E06000028":{"id":"E06000028","n":"Bournemouth"},"E06000029":{"id":"E06000029","n":"Poole"},"E06000030":{"id":"E06000030","n":"Swindon"},"E06000031":{"id":"E06000031","n":"Peterborough"},"E06000032":{"id":"E06000032","n":"Luton"},"E06000033":{"id":"E06000033","n":"Southend-on-Sea"},"E06000034":{"id":"E06000034","n":"Thurrock"},"E06000035":{"id":"E06000035","n":"Medway"},"E06000036":{"id":"E06000036","n":"Bracknell Forest"},"E06000037":{"id":"E06000037","n":"West Berkshire"},"E06000038":{"id":"E06000038","n":"Reading"},"E06000039":{"id":"E06000039","n":"Slough"},"E06000040":{"id":"E06000040","n":"Windsor and Maidenhead"},"E06000041":{"id":"E06000041","n":"Wokingham"},"E06000042":{"id":"E06000042","n":"Milton Keynes"},"E06000043":{"id":"E06000043","n":"Brighton and Hove"},"E06000044":{"id":"E06000044","n":"Portsmouth"},"E06000045":{"id":"E06000045","n":"Southampton"},"E06000046":{"id":"E06000046","n":"Isle of Wight"},"E06000047":{"id":"E06000047","n":"County Durham"},"E06000049":{"id":"E06000049","n":"Cheshire East"},"E06000050":{"id":"E06000050","n":"Cheshire West and Chester"},"E06000051":{"id":"E06000051","n":"Shropshire"},"E06000054":{"id":"E06000054","n":"Wiltshire"},"E06000055":{"id":"E06000055","n":"Bedford"},"E06000056":{"id":"E06000056","n":"Central Bedfordshire"},"E06000057":{"id":"E06000057","n":"Northumberland"},"E07000004":{"id":"E10000002","n":"Buckinghamshire"},"E07000005":{"id":"E10000002","n":"Buckinghamshire"},"E07000146":{"id":"E10000020","n":"Norfolk"},"E07000147":{"id":"E10000020","n":"Norfolk"},"E07000148":{"id":"E10000020","n":"Norfolk"},"E07000149":{"id":"E10000020","n":"Norfolk"},"E07000150":{"id":"E10000021","n":"Northamptonshire"},"E07000151":{"id":"E10000021","n":"Northamptonshire"},"E07000152":{"id":"E10000021","n":"Northamptonshire"},"E07000153":{"id":"E10000021","n":"Northamptonshire"},"E07000154":{"id":"E10000021","n":"Northamptonshire"},"E07000155":{"id":"E10000021","n":"Northamptonshire"},"E07000156":{"id":"E10000021","n":"Northamptonshire"},"E07000163":{"id":"E10000023","n":"North Yorkshire"},"E07000164":{"id":"E10000023","n":"North Yorkshire"},"E07000165":{"id":"E10000023","n":"North Yorkshire"},"E07000166":{"id":"E10000023","n":"North Yorkshire"},"E07000167":{"id":"E10000023","n":"North Yorkshire"},"E07000168":{"id":"E10000023","n":"North Yorkshire"},"E07000169":{"id":"E10000023","n":"North Yorkshire"},"E07000170":{"id":"E10000024","n":"Nottinghamshire"},"E07000171":{"id":"E10000024","n":"Nottinghamshire"},"E07000172":{"id":"E10000024","n":"Nottinghamshire"},"E07000173":{"id":"E10000024","n":"Nottinghamshire"},"E07000174":{"id":"E10000024","n":"Nottinghamshire"},"E07000175":{"id":"E10000024","n":"Nottinghamshire"},"E07000176":{"id":"E10000024","n":"Nottinghamshire"},"E07000177":{"id":"E10000025","n":"Oxfordshire"},"E07000178":{"id":"E10000025","n":"Oxfordshire"},"E07000179":{"id":"E10000025","n":"Oxfordshire"},"E07000180":{"id":"E10000025","n":"Oxfordshire"},"E07000181":{"id":"E10000025","n":"Oxfordshire"},"E07000187":{"id":"E10000027","n":"Somerset"},"E07000188":{"id":"E10000027","n":"Somerset"},"E07000189":{"id":"E10000027","n":"Somerset"},"E07000190":{"id":"E10000027","n":"Somerset"},"E07000191":{"id":"E10000027","n":"Somerset"},"E07000192":{"id":"E10000028","n":"Staffordshire"},"E07000193":{"id":"E10000028","n":"Staffordshire"},"E07000194":{"id":"E10000028","n":"Staffordshire"},"E07000195":{"id":"E10000028","n":"Staffordshire"},"E07000196":{"id":"E10000028","n":"Staffordshire"},"E07000197":{"id":"E10000028","n":"Staffordshire"},"E07000198":{"id":"E10000028","n":"Staffordshire"},"E07000199":{"id":"E10000028","n":"Staffordshire"},"E07000200":{"id":"E10000029","n":"Suffolk"},"E07000201":{"id":"E10000029","n":"Suffolk"},"E07000202":{"id":"E10000029","n":"Suffolk"},"E07000203":{"id":"E10000029","n":"Suffolk"},"E07000204":{"id":"E10000029","n":"Suffolk"},"E07000205":{"id":"E10000029","n":"Suffolk"},"E07000206":{"id":"E10000029","n":"Suffolk"},"E07000207":{"id":"E10000030","n":"Surrey"},"E07000208":{"id":"E10000030","n":"Surrey"},"E07000209":{"id":"E10000030","n":"Surrey"},"E07000210":{"id":"E10000030","n":"Surrey"},"E07000211":{"id":"E10000030","n":"Surrey"},"E07000212":{"id":"E10000030","n":"Surrey"},"E07000213":{"id":"E10000030","n":"Surrey"},"E07000214":{"id":"E10000030","n":"Surrey"},"E07000215":{"id":"E10000030","n":"Surrey"},"E07000216":{"id":"E10000030","n":"Surrey"},"E07000217":{"id":"E10000030","n":"Surrey"},"E07000218":{"id":"E10000031","n":"Warwickshire"},"E07000219":{"id":"E10000031","n":"Warwickshire"},"E07000220":{"id":"E10000031","n":"Warwickshire"},"E07000221":{"id":"E10000031","n":"Warwickshire"},"E07000222":{"id":"E10000031","n":"Warwickshire"},"E07000223":{"id":"E10000032","n":"West Sussex"},"E07000224":{"id":"E10000032","n":"West Sussex"},"E07000225":{"id":"E10000032","n":"West Sussex"},"E07000226":{"id":"E10000032","n":"West Sussex"},"E07000227":{"id":"E10000032","n":"West Sussex"},"E07000228":{"id":"E10000032","n":"West Sussex"},"E07000229":{"id":"E10000032","n":"West Sussex"},"E07000234":{"id":"E10000034","n":"Worcestershire"},"E07000235":{"id":"E10000034","n":"Worcestershire"},"E07000236":{"id":"E10000034","n":"Worcestershire"},"E07000237":{"id":"E10000034","n":"Worcestershire"},"E07000238":{"id":"E10000034","n":"Worcestershire"},"E07000239":{"id":"E10000034","n":"Worcestershire"},"E07000240":{"id":"E10000015","n":"Hertfordshire"},"E07000241":{"id":"E10000015","n":"Hertfordshire"},"E07000242":{"id":"E10000015","n":"Hertfordshire"},"E07000243":{"id":"E10000015","n":"Hertfordshire"},"E07000244":{"id":"E10000029","n":"Suffolk"},"E07000245":{"id":"E10000029","n":"Suffolk"},"E07000246":{"id":"E10000027","n":"Somerset"},"E08000001":{"id":"E08000001","n":"Bolton"},"E08000002":{"id":"E08000002","n":"Bury"},"E08000003":{"id":"E08000003","n":"Manchester"},"E08000004":{"id":"E08000004","n":"Oldham"},"E08000005":{"id":"E08000005","n":"Rochdale"},"E08000006":{"id":"E08000006","n":"Salford"},"E08000007":{"id":"E08000007","n":"Stockport"},"E08000008":{"id":"E08000008","n":"Tameside"},"E08000009":{"id":"E08000009","n":"Trafford"},"E08000010":{"id":"E08000010","n":"Wigan"},"E08000011":{"id":"E08000011","n":"Knowsley"},"E08000012":{"id":"E08000012","n":"Liverpool"},"E08000013":{"id":"E08000013","n":"St. Helens"},"E08000014":{"id":"E08000014","n":"Sefton"},"E08000015":{"id":"E08000015","n":"Wirral"},"E08000016":{"id":"E08000016","n":"Barnsley"},"E08000017":{"id":"E08000017","n":"Doncaster"},"E08000018":{"id":"E08000018","n":"Rotherham"},"E08000019":{"id":"E08000019","n":"Sheffield"},"E08000021":{"id":"E08000021","n":"Newcastle upon Tyne"},"E08000022":{"id":"E08000022","n":"North Tyneside"},"E08000023":{"id":"E08000023","n":"South Tyneside"},"E08000024":{"id":"E08000024","n":"Sunderland"},"E08000025":{"id":"E08000025","n":"Birmingham"},"E08000026":{"id":"E08000026","n":"Coventry"},"E08000027":{"id":"E08000027","n":"Dudley"},"E08000028":{"id":"E08000028","n":"Sandwell"},"E08000029":{"id":"E08000029","n":"Solihull"},"E08000030":{"id":"E08000030","n":"Walsall"},"E08000031":{"id":"E08000031","n":"Wolverhampton"},"E08000032":{"id":"E08000032","n":"Bradford"},"E08000033":{"id":"E08000033","n":"Calderdale"},"E08000034":{"id":"E08000034","n":"Kirklees"},"E08000035":{"id":"E08000035","n":"Leeds"},"E08000036":{"id":"E08000036","n":"Wakefield"},"E08000037":{"id":"E08000037","n":"Gateshead"},"E09000001":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000002":{"id":"E09000002","n":"Barking and Dagenham"},"E09000003":{"id":"E09000003","n":"Barnet"},"E09000004":{"id":"E09000004","n":"Bexley"},"E09000005":{"id":"E09000005","n":"Brent"},"E09000006":{"id":"E09000006","n":"Bromley"},"E09000007":{"id":"E09000007","n":"Camden"},"E09000008":{"id":"E09000008","n":"Croydon"},"E09000009":{"id":"E09000009","n":"Ealing"},"E09000010":{"id":"E09000010","n":"Enfield"},"E09000011":{"id":"E09000011","n":"Greenwich"},"E09000012":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000013":{"id":"E09000013","n":"Hammersmith and Fulham"},"E09000014":{"id":"E09000014","n":"Haringey"},"E09000015":{"id":"E09000015","n":"Harrow"},"E09000016":{"id":"E09000016","n":"Havering"},"E09000017":{"id":"E09000017","n":"Hillingdon"},"E09000018":{"id":"E09000018","n":"Hounslow"},"E09000019":{"id":"E09000019","n":"Islington"},"E09000020":{"id":"E09000020","n":"Kensington and Chelsea"},"E09000021":{"id":"E09000021","n":"Kingston upon Thames"},"E09000022":{"id":"E09000022","n":"Lambeth"},"E09000023":{"id":"E09000023","n":"Lewisham"},"E09000024":{"id":"E09000024","n":"Merton"},"E09000025":{"id":"E09000025","n":"Newham"},"E09000026":{"id":"E09000026","n":"Redbridge"},"E09000027":{"id":"E09000027","n":"Richmond upon Thames"},"E09000028":{"id":"E09000028","n":"Southwark"},"E09000029":{"id":"E09000029","n":"Sutton"},"E09000030":{"id":"E09000030","n":"Tower Hamlets"},"E09000031":{"id":"E09000031","n":"Waltham Forest"},"E09000032":{"id":"E09000032","n":"Wandsworth"},"E09000033":{"id":"E09000033","n":"Westminster"},"W06000001":{"id":"W06000001","n":"Isle of Anglesey"},"W06000002":{"id":"W06000002","n":"Gwynedd"},"W06000003":{"id":"W06000003","n":"Conwy"},"W06000004":{"id":"W06000004","n":"Denbighshire"},"W06000005":{"id":"W06000005","n":"Flintshire"},"W06000006":{"id":"W06000006","n":"Wrexham"},"W06000008":{"id":"W06000008","n":"Ceredigion"},"W06000009":{"id":"W06000009","n":"Pembrokeshire"},"W06000010":{"id":"W06000010","n":"Carmarthenshire"},"W06000011":{"id":"W06000011","n":"Swansea"},"W06000012":{"id":"W06000012","n":"Neath Port Talbot"},"W06000013":{"id":"W06000013","n":"Bridgend"},"W06000014":{"id":"W06000014","n":"Vale of Glamorgan"},"W06000015":{"id":"W06000015","n":"Cardiff"},"W06000016":{"id":"W06000016","n":"Rhondda Cynon Taf"},"W06000018":{"id":"W06000018","n":"Caerphilly"},"W06000019":{"id":"W06000019","n":"Blaenau Gwent"},"W06000020":{"id":"W06000020","n":"Torfaen"},"W06000021":{"id":"W06000021","n":"Monmouthshire"},"W06000022":{"id":"W06000022","n":"Newport"},"W06000023":{"id":"W06000023","n":"Powys"},"W06000024":{"id":"W06000024","n":"Merthyr Tydfil"},"E07000006":{"id":"E10000002","n":"Buckinghamshire"},"E07000007":{"id":"E10000002","n":"Buckinghamshire"},"E07000008":{"id":"E10000003","n":"Cambridgeshire"},"E07000009":{"id":"E10000003","n":"Cambridgeshire"},"E07000010":{"id":"E10000003","n":"Cambridgeshire"},"E07000011":{"id":"E10000003","n":"Cambridgeshire"},"E07000012":{"id":"E10000003","n":"Cambridgeshire"},"E07000026":{"id":"E10000006","n":"Cumbria"},"E07000027":{"id":"E10000006","n":"Cumbria"},"E07000028":{"id":"E10000006","n":"Cumbria"},"E07000029":{"id":"E10000006","n":"Cumbria"},"E07000030":{"id":"E10000006","n":"Cumbria"},"E07000031":{"id":"E10000006","n":"Cumbria"},"E07000032":{"id":"E10000007","n":"Derbyshire"},"E07000033":{"id":"E10000007","n":"Derbyshire"},"E07000034":{"id":"E10000007","n":"Derbyshire"},"E07000035":{"id":"E10000007","n":"Derbyshire"},"E07000036":{"id":"E10000007","n":"Derbyshire"},"E07000037":{"id":"E10000007","n":"Derbyshire"},"E07000038":{"id":"E10000007","n":"Derbyshire"},"E07000039":{"id":"E10000007","n":"Derbyshire"},"E07000040":{"id":"E10000008","n":"Devon"},"E07000041":{"id":"E10000008","n":"Devon"},"E07000042":{"id":"E10000008","n":"Devon"},"E07000043":{"id":"E10000008","n":"Devon"},"E07000044":{"id":"E10000008","n":"Devon"},"E07000045":{"id":"E10000008","n":"Devon"},"E07000046":{"id":"E10000008","n":"Devon"},"E07000047":{"id":"E10000008","n":"Devon"},"E07000048":{"id":"E10000009","n":"Dorset"},"E07000049":{"id":"E10000009","n":"Dorset"},"E07000050":{"id":"E10000009","n":"Dorset"},"E07000051":{"id":"E10000009","n":"Dorset"},"E07000052":{"id":"E10000009","n":"Dorset"},"E07000053":{"id":"E10000009","n":"Dorset"},"E07000061":{"id":"E10000011","n":"East Sussex"},"E07000062":{"id":"E10000011","n":"East Sussex"},"E07000063":{"id":"E10000011","n":"East Sussex"},"E07000064":{"id":"E10000011","n":"East Sussex"},"E07000065":{"id":"E10000011","n":"East Sussex"},"E07000066":{"id":"E10000012","n":"Essex"},"E07000067":{"id":"E10000012","n":"Essex"},"E07000068":{"id":"E10000012","n":"Essex"},"E07000069":{"id":"E10000012","n":"Essex"},"E07000070":{"id":"E10000012","n":"Essex"},"E07000071":{"id":"E10000012","n":"Essex"},"E07000072":{"id":"E10000012","n":"Essex"},"E07000073":{"id":"E10000012","n":"Essex"},"E07000074":{"id":"E10000012","n":"Essex"},"E07000075":{"id":"E10000012","n":"Essex"},"E07000076":{"id":"E10000012","n":"Essex"},"E07000077":{"id":"E10000012","n":"Essex"},"E07000078":{"id":"E10000013","n":"Gloucestershire"},"E07000079":{"id":"E10000013","n":"Gloucestershire"},"E07000080":{"id":"E10000013","n":"Gloucestershire"},"E07000081":{"id":"E10000013","n":"Gloucestershire"},"E07000082":{"id":"E10000013","n":"Gloucestershire"},"E07000083":{"id":"E10000013","n":"Gloucestershire"},"E07000084":{"id":"E10000014","n":"Hampshire"},"E07000085":{"id":"E10000014","n":"Hampshire"},"E07000086":{"id":"E10000014","n":"Hampshire"},"E07000087":{"id":"E10000014","n":"Hampshire"},"E07000088":{"id":"E10000014","n":"Hampshire"},"E07000089":{"id":"E10000014","n":"Hampshire"},"E07000090":{"id":"E10000014","n":"Hampshire"},"E07000091":{"id":"E10000014","n":"Hampshire"},"E07000092":{"id":"E10000014","n":"Hampshire"},"E07000093":{"id":"E10000014","n":"Hampshire"},"E07000094":{"id":"E10000014","n":"Hampshire"},"E07000095":{"id":"E10000015","n":"Hertfordshire"},"E07000096":{"id":"E10000015","n":"Hertfordshire"},"E07000098":{"id":"E10000015","n":"Hertfordshire"},"E07000099":{"id":"E10000015","n":"Hertfordshire"},"E07000102":{"id":"E10000015","n":"Hertfordshire"},"E07000103":{"id":"E10000015","n":"Hertfordshire"},"E07000105":{"id":"E10000016","n":"Kent"},"E07000106":{"id":"E10000016","n":"Kent"},"E07000107":{"id":"E10000016","n":"Kent"},"E07000108":{"id":"E10000016","n":"Kent"},"E07000109":{"id":"E10000016","n":"Kent"},"E07000110":{"id":"E10000016","n":"Kent"},"E07000111":{"id":"E10000016","n":"Kent"},"E07000112":{"id":"E10000016","n":"Kent"},"E07000113":{"id":"E10000016","n":"Kent"},"E07000114":{"id":"E10000016","n":"Kent"},"E07000115":{"id":"E10000016","n":"Kent"},"E07000116":{"id":"E10000016","n":"Kent"},"E07000117":{"id":"E10000017","n":"Lancashire"},"E07000118":{"id":"E10000017","n":"Lancashire"},"E07000119":{"id":"E10000017","n":"Lancashire"},"E07000120":{"id":"E10000017","n":"Lancashire"},"E07000121":{"id":"E10000017","n":"Lancashire"},"E07000122":{"id":"E10000017","n":"Lancashire"},"E07000123":{"id":"E10000017","n":"Lancashire"},"E07000124":{"id":"E10000017","n":"Lancashire"},"E07000125":{"id":"E10000017","n":"Lancashire"},"E07000126":{"id":"E10000017","n":"Lancashire"},"E07000127":{"id":"E10000017","n":"Lancashire"},"E07000128":{"id":"E10000017","n":"Lancashire"},"E07000129":{"id":"E10000018","n":"Leicestershire"},"E07000130":{"id":"E10000018","n":"Leicestershire"},"E07000131":{"id":"E10000018","n":"Leicestershire"},"E07000132":{"id":"E10000018","n":"Leicestershire"},"E07000133":{"id":"E10000018","n":"Leicestershire"},"E07000134":{"id":"E10000018","n":"Leicestershire"},"E07000135":{"id":"E10000018","n":"Leicestershire"},"E07000136":{"id":"E10000019","n":"Lincolnshire"},"E07000137":{"id":"E10000019","n":"Lincolnshire"},"E07000138":{"id":"E10000019","n":"Lincolnshire"},"E07000139":{"id":"E10000019","n":"Lincolnshire"},"E07000140":{"id":"E10000019","n":"Lincolnshire"},"E07000141":{"id":"E10000019","n":"Lincolnshire"},"E07000142":{"id":"E10000019","n":"Lincolnshire"},"E07000143":{"id":"E10000020","n":"Norfolk"},"E07000144":{"id":"E10000020","n":"Norfolk"},"E07000145":{"id":"E10000020","n":"Norfolk"},
		"E06000052":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"},
		"E06000053":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"},
		"W06000006":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Wrexham
		"W06000014":{"id":"W11000029","n":"Cardiff and Vale University Health Board"}, // Vale of Glamorgan
		"W06000020":{"id":"W11000028","n":"Aneurin Bevan University Health Board"}, // Torfaen
		"W06000011":{"id":"W11000031","n":"Swansea Bay University Health Board"}, // Swansea
		"W06000016":{"id":"W11000030","n":"Cwm Taf Morgannwg University Health Board"}, // Rhondda Cynon Taf
		"W06000023":{"id":"W11000024","n":"Powys Teaching Health Board"}, // Powys
		"W06000009":{"id":"W11000025","n":"Hywel Dda University Health Board"}, // Pembrokeshire
		"W06000022":{"id":"W11000028","n":"Aneurin Bevan University Health Board"}, // Newport
		"W06000012":{"id":"W11000031","n":"Swansea Bay University Health Board"}, // Neath Port Talbot
		"W06000021":{"id":"W11000028","n":"Aneurin Bevan University Health Board"}, // Monmouthshire
		"W06000024":{"id":"W11000030","n":"Cwm Taf Morgannwg University Health Board"}, // Merthyr Tydfil
		"W06000001":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Isle of Anglesey
		"W06000002":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Gwynedd
		"W06000005":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Flintshire
		"W06000004":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Denbighshire
		"W06000003":{"id":"W11000023","n":"Betsi Cadwaladr University Health Board"}, // Conwy
		"W06000008":{"id":"W11000025","n":"Hywel Dda University Health Board"}, // Ceredigion
		"W06000010":{"id":"W11000025","n":"Hywel Dda University Health Board"}, // Carmarthenshire
		"W06000015":{"id":"W11000029","n":"Cardiff and Vale University Health Board"}, // Cardiff
		"W06000018":{"id":"W11000028","n":"Aneurin Bevan University Health Board"}, // Caerphilly
		"W06000013":{"id":"W11000030","n":"Cwm Taf Morgannwg University Health Board"}, // Bridgend
		"W06000019":{"id":"W11000028","n":"Aneurin Bevan University Health Board"}, // Blaenau Gwent
		"S12000005":{"id":"S08000019","n":"Forth Valley"}, // Clackmannanshire
		"S12000006":{"id":"S08000017","n":"Dumfries and Galloway"}, // Dumfries and Galloway
		"S12000008":{"id":"S08000015","n":"Ayrshire and Arran"}, // East Ayrshire
		"S12000010":{"id":"S08000024","n":"Lothian"}, // East Lothian
		"S12000011":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // East Renfrewshire
		"S12000013":{"id":"S08000028","n":"Western Isles"}, // Na h-Eileanan Siar
		"S12000014":{"id":"S08000019","n":"Forth Valley"}, // Falkirk
		"S12000017":{"id":"S08000022","n":"Highland"}, // Highland
		"S12000018":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // Inverclyde
		"S12000019":{"id":"S08000024","n":"Lothian"}, // Midlothian
		"S12000020":{"id":"S08000020","n":"Grampian"}, // Moray
		"S12000021":{"id":"S08000015","n":"Ayrshire and Arran"}, // North Ayrshire
		"S12000023":{"id":"S08000025","n":"Orkney"}, // Orkney Islands
		"S12000026":{"id":"S08000016","n":"Borders"}, // Scottish Borders
		"S12000027":{"id":"S08000026","n":"Shetland"}, // Shetland Islands
		"S12000028":{"id":"S08000015","n":"Ayrshire and Arran"}, // South Ayrshire
		"S12000029":{"id":"S08000032","n":"Lanarkshire"}, // South Lanarkshire
		"S12000030":{"id":"S08000019","n":"Forth Valley"}, // Stirling
		"S12000033":{"id":"S08000020","n":"Grampian"}, // Aberdeen City
		"S12000034":{"id":"S08000020","n":"Grampian"}, // Aberdeenshire
		"S12000035":{"id":"S08000022","n":"Highland"}, // Argyll and Bute
		"S12000036":{"id":"S08000024","n":"Lothian"}, // City of Edinburgh
		"S12000038":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // Renfrewshire
		"S12000039":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // West Dunbartonshire
		"S12000040":{"id":"S08000024","n":"Lothian"}, // West Lothian
		"S12000041":{"id":"S08000030","n":"Tayside"}, // Angus
		"S12000042":{"id":"S08000030","n":"Tayside"}, // Dundee City
		"S12000045":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // East Dunbartonshire
		"S12000047":{"id":"S08000029","n":"Fife"}, // Fife
		"S12000048":{"id":"S08000030","n":"Tayside"}, // Perth and Kinross
		"S12000049":{"id":"S08000031","n":"Greater Glasgow and Clyde"}, // Glasgow City
		"S12000050":{"id":"S08000032","n":"Lanarkshire"} // North Lanarkshire
	};

	var populations = {"E06000001":93458,"E06000002":140423,"E06000003":137879,"E06000004":198253,"E06000005":106828,"E06000006":129523,"E06000007":210625,"E06000008":149190,"E06000009":139173,"E06000010":261184,"E06000011":342195,"E06000012":159996,"E06000013":173143,"E06000014":211099,"E06000015":258710,"E06000016":360557,"E06000017":40387,"E06000018":333963,"E06000019":195189,"E06000020":181769,"E06000021":257871,"E06000022":195691,"E06000023":471344,"E06000024":217015,"E06000025":289478,"E06000026":264280,"E06000027":137496,"E06000028":194882,"E06000029":152359,"E06000030":225353,"E06000031":205764,"E06000032":213099,"E06000033":184882,"E06000034":176625,"E06000035":279310,"E06000036":123206,"E06000037":158474,"E06000038":164129,"E06000039":150353,"E06000040":151530,"E06000041":172104,"E06000042":271238,"E06000043":293917,"E06000044":216910,"E06000045":255383,"E06000046":143140,"E06000047":531947,"E06000049":384888,"E06000050":346192,"E06000051":326692,"E06000052":577727,"E06000052-3":579794,"E06000053":2067,"E06000054":509964,"E06000055":174720,"E06000056":290053,"E06000057":322852,"E06000058":397716,"E06000059":430378,"E07000004":205426,"E07000005":96274,"E07000006":70083,"E07000007":174143,"E07000008":125473,"E07000009":90623,"E07000010":103621,"E07000011":178911,"E07000012":159205,"E07000026":97960,"E07000027":66720,"E07000028":108682,"E07000029":67923,"E07000030":53164,"E07000031":105351,"E07000032":128575,"E07000033":80938,"E07000034":105012,"E07000035":72332,"E07000036":116230,"E07000037":92932,"E07000038":102071,"E07000039":108164,"E07000040":148493,"E07000041":132228,"E07000042":83533,"E07000043":97703,"E07000044":87706,"E07000045":135846,"E07000046":69352,"E07000047":56249,"E07000048":50475,"E07000049":90662,"E07000050":70931,"E07000051":47867,"E07000052":104094,"E07000053":66348,"E07000061":103866,"E07000062":92984,"E07000063":103925,"E07000064":97304,"E07000065":162447,"E07000066":187964,"E07000067":152370,"E07000068":76383,"E07000069":90500,"E07000070":180245,"E07000071":197246,"E07000072":132284,"E07000073":87425,"E07000074":65305,"E07000075":88232,"E07000076":148624,"E07000077":91604,"E07000078":117416,"E07000079":91983,"E07000080":88006,"E07000081":130515,"E07000082":120685,"E07000083":96277,"E07000084":176563,"E07000085":122560,"E07000086":134262,"E07000087":117070,"E07000088":85168,"E07000089":97493,"E07000090":127786,"E07000091":180498,"E07000092":94623,"E07000093":127425,"E07000094":125809,"E07000095":96976,"E07000096":155839,"E07000098":104850,"E07000099":134049,"E07000102":93152,"E07000103":97077,"E07000105":132420,"E07000106":166305,"E07000107":113887,"E07000108":119640,"E07000109":106722,"E07000110":174062,"E07000111":121415,"E07000112":114211,"E07000113":151965,"E07000114":143349,"E07000115":133233,"E07000116":118848,"E07000117":89278,"E07000118":119522,"E07000119":81343,"E07000120":81251,"E07000121":146127,"E07000122":92041,"E07000123":142620,"E07000124":60954,"E07000125":71887,"E07000126":111051,"E07000127":114479,"E07000128":112428,"E07000129":103703,"E07000130":187556,"E07000131":94635,"E07000132":115023,"E07000133":51281,"E07000134":105669,"E07000135":57250,"E07000136":71202,"E07000137":143102,"E07000138":99548,"E07000139":118349,"E07000140":95886,"E07000141":143347,"E07000142":95898,"E07000143":142019,"E07000144":131671,"E07000145":100097,"E07000146":152654,"E07000147":105800,"E07000148":142790,"E07000149":142705,"E07000150":73307,"E07000151":87464,"E07000152":96251,"E07000153":103649,"E07000154":226702,"E07000155":94907,"E07000156":80721,"E07000163":57173,"E07000164":91480,"E07000165":160644,"E07000166":53189,"E07000167":55846,"E07000168":109422,"E07000169":91149,"E07000170":129825,"E07000171":118634,"E07000172":115012,"E07000173":119267,"E07000174":110247,"E07000175":123532,"E07000176":120396,"E07000177":151724,"E07000178":152996,"E07000179":141881,"E07000180":138229,"E07000181":111060,"E07000187":116606,"E07000188":124482,"E07000189":169316,"E07000190":121889,"E07000191":35369,"E07000192":101594,"E07000193":120212,"E07000194":104858,"E07000195":130792,"E07000196":112757,"E07000197":138122,"E07000198":98723,"E07000199":76454,"E07000200":92538,"E07000201":66673,"E07000202":137012,"E07000203":104153,"E07000204":113773,"E07000205":131963,"E07000206":119789,"E07000207":137027,"E07000208":80555,"E07000209":148940,"E07000210":87095,"E07000211":149936,"E07000212":89096,"E07000213":99813,"E07000214":88983,"E07000215":88285,"E07000216":126137,"E07000217":101087,"E07000218":66440,"E07000219":130406,"E07000220":109181,"E07000221":131536,"E07000222":144062,"E07000223":64298,"E07000224":162919,"E07000225":122616,"E07000226":113531,"E07000227":145250,"E07000228":151785,"E07000229":111283,"E07000234":100512,"E07000235":79657,"E07000236":85118,"E07000237":102160,"E07000238":131412,"E07000239":102244,"E07000240":147895,"E07000241":124585,"E07000242":149828,"E07000243":88214,"E08000001":286952,"E08000002":191841,"E08000003":553905,"E08000004":238525,"E08000005":223372,"E08000006":260804,"E08000007":294053,"E08000008":227556,"E08000009":238813,"E08000010":328790,"E08000011":151092,"E08000012":502326,"E08000013":181622,"E08000014":276782,"E08000015":324533,"E08000016":248707,"E08000017":313762,"E08000018":267215,"E08000019":589710,"E08000021":302680,"E08000022":208486,"E08000023":151394,"E08000024":277540,"E08000025":1152785,"E08000026":378966,"E08000027":323692,"E08000028":331717,"E08000029":217713,"E08000030":287476,"E08000031":265809,"E08000032":540909,"E08000033":210958,"E08000034":441772,"E08000035":795565,"E08000036":352983,"E08000037":202829,"E09000001":8712,"E09000001-12":294433,"E09000002":214681,"E09000003":399641,"E09000004":249590,"E09000005":335439,"E09000006":334612,"E09000007":271803,"E09000008":387684,"E09000009":340940,"E09000010":335481,"E09000011":292964,"E09000012":285721,"E09000013":189193,"E09000014":271984,"E09000015":250751,"E09000016":261922,"E09000017":309310,"E09000018":272978,"E09000019":244497,"E09000020":156243,"E09000021":177731,"E09000022":329631,"E09000023":308582,"E09000024":206431,"E09000025":358969,"E09000026":305599,"E09000027":198843,"E09000028":324164,"E09000029":206866,"E09000030":332101,"E09000031":280316,"E09000032":331971,"E09000033":264039,"E10000002":545925,"E10000003":657833,"E10000006":499800,"E10000007":806253,"E10000008":811109,"E10000009":430378,"E10000011":560525,"E10000012":1498181,"E10000013":644882,"E10000014":1389256,"E10000015":1192465,"E10000016":1596058,"E10000017":1222979,"E10000018":715117,"E10000019":767332,"E10000020":917736,"E10000021":763001,"E10000023":618904,"E10000024":836913,"E10000025":695890,"E10000027":567662,"E10000028":883511,"E10000029":765899,"E10000030":1196953,"E10000031":581624,"E10000032":871682,"E10000034":601103,"E11000001":2844612,"E11000002":1436356,"E11000003":1419395,"E11000005":2958158,"E11000006":2342186,"E11000007":1142928,"E12000001":2674568,"E12000002":7363337,"E12000003":5528103,"E12000004":4882232,"E12000005":5985916,"E12000006":6277257,"E12000007":9039390,"E12000008":9235982,"E12000009":5691687,"E92000001":56678470,"N09000001":142492,"N09000002":214090,"N09000003":341877,"N09000004":144246,"N09000005":150679,"N09000006":116835,"N09000007":144381,"N09000008":138773,"N09000009":147392,"N09000010":180012,"N09000011":160864,"S08000015":369670,"S08000016":115270,"S08000017":148790,"S08000019":306070,"S08000020":584550,"S08000022":321800,"S08000024":897770,"S08000025":22190,"S08000026":22990,"S08000028":26830,"S08000029":371910,"S08000030":416080,"S08000031":1174980,"S08000032":659200,"S12000005":51400,"S12000006":148790,"S12000008":121840,"S12000010":105790,"S12000011":95170,"S12000013":26830,"S12000014":160340,"S12000017":235540,"S12000018":78150,"S12000019":91340,"S12000020":95520,"S12000021":135280,"S12000023":22190,"S12000026":115270,"S12000027":22990,"S12000028":112550,"S12000029":319020,"S12000030":94330,"S12000033":227560,"S12000034":261470,"S12000035":86260,"S12000036":518500,"S12000038":177790,"S12000039":89130,"S12000040":182140,"S12000041":116040,"S12000042":148750,"S12000045":108330,"S12000047":371910,"S12000048":151290,"S12000049":626410,"S12000050":340180,"W06000001":69961,"W06000002":124178,"W06000003":117181,"W06000004":95330,"W06000005":155593,"W06000006":136126,"W06000008":72992,"W06000009":125055,"W06000010":187568,"W06000011":246466,"W06000012":142906,"W06000013":144876,"W06000014":132165,"W06000015":364248,"W06000016":240131,"W06000018":181019,"W06000019":69713,"W06000020":93049,"W06000021":94142,"W06000022":153302,"W06000023":132447,"W06000024":60183,"W11000023":698369,"W11000024":132447,"W11000025":385615,"W11000028":591225,"W11000029":496413,"W11000030":445190,"W11000031":389372};
	var lookup = {};


	function processRow(type,datum){
		var cases,total,percapita,n,lastring,la;
		var code = datum.GSS_CD;
		if(code){
			cases = parseInt(datum.TotalCases.replace(/\,/g,""));	// Remove commas from numbers
			total = cases;
			percapita = (populations[code]) ? 1e5*cases/populations[code] : 0;
			if(!this.hex.hexes[code]){
				if(lookup[code]){
					if(!lookup[code].LA) console.warn(lookup[code]);
					n = Object.keys(lookup[code].LA).length;
					lastring = '';
					for(la in lookup[code].LA){
						if(lookup[code].LA[la]){
							lastring += '<li>'+(this.hex.hexes[la] ? this.hex.hexes[la].attributes.title : '?')+(populations[la] ? ' ('+populations[la].toLocaleString()+')':'')+'</li>';
						}
					}
					for(la in lookup[code].LA){
						if(lookup[code].LA[la]){
							this.data[type][la] = {
								'cases': cases/n,
								'percapita': percapita,
								'title':datum.GSS_NM,
								'desc':'<strong>Total cases:</strong> '+cases+(datum.date ? ' (as of '+datum.date+')':'')+'.<br /><strong>Population ('+(datum.GSS_CD.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.<br /><strong>Includes:</strong> <ul>'+lastring+'</ul>'
							};
						}
					}
				}else{
					console.warn('No hex for '+code+' and no UTLA lookup');
				}
			}else{
				this.data[type][code] = {
					'cases': cases,
					'percapita': percapita,
					'title':datum.GSS_NM,
					'desc':'<strong>Total cases:</strong> '+cases+'.<br /><strong>Population ('+(datum.GSS_CD.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.'
				};
			}
		}
		return total;
	}
	
	function process(type,data,attr){
		var i,r,la,total,code,cases,percapita,n,lastring,now;
		type = "COVID-19";
		if(!this.data[type]) this.data[type] = {};

		if(data.length > 0){
			total = 0;
			for(i = 0; i < data.length; i++){
				code = data[i].GSS_CD;
				// Fix for Cornwall and Hackney in the PHE data
				if(code && code == "E06000052") data[i].GSS_CD = "E06000052-3";
				if(code && code == "E09000012") data[i].GSS_CD = "E09000001-12";
			}

			for(i = 0; i < data.length; i++){
				if(data[i].GSS_CD) total += processRow.call(this,type,data[i]);
			}
		}else{
			for(r in this.hex.hexes){
				if(this.hex.hexes[r]) this.data[type][r] = {};
			}
		}
		now = new Date();
		if(S('#updated').length == 0) S('#'+this.id).prepend('<div id="updated">?</div>');
		S('#updated').html('Total: '+total.toLocaleString());
	}
	

	// An init function for the plugin
	function init(){

		var la,id;
		for(la in LA2UTLA){
			if(LA2UTLA[la]){
				id = LA2UTLA[la].id;
				if(!lookup[id]) lookup[id] = {'n': LA2UTLA[la].n, 'LA':{} };
				lookup[id].LA[la] = true;
			}
		}
		
		function render(title,region,data,attr){
			var lbl = "";
			if(!data) data = {};

			lbl = '<h2 class="popup-title">'+(data.title||title)+'</h2>';
			lbl += (data.desc||'<p>Cases: '+data.cases);

			function postRender(title,region,data){
				S('#tooltip').remove();
			}

			return {'label':lbl,'class':'covid-19','color':'','callback': postRender };
		}

		var views = {
			'COVID-19-percapita':{
				'file': 'https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data',
				'process': process,
				'popup': {
					'render': render
				},
				'key': function(){
					var _obj = this;
					var min = 0;
					var max = -1e100;
					var filter = "percapita";
					var type = "COVID-19";
					for(la in this.data[type]){
						if(this.data[type][la]){
							if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
							if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
						}
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale("Viridis8",_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					};
					return '';
				}
			},
			'COVID-19-cases':{
				'file': 'https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data',
				'process': process,
				'popup': {
					'render': render
				},
				'key': function(){
					var _obj = this;
					var min = 0;
					var max = -1e100;
					var filter = "cases";
					var type = "COVID-19";
					for(la in this.data[type]){
						if(this.data[type][la]){
							if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
							if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
						}
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale("Viridis8",_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					};
					return '';
				}
			}
		};
		this.plugins[name].obj = new ResultsMap('hexmap',{
			'width':700,
			'height':850,
			'padding':0,
			'file':'resources/uk-local-authority-districts-2019.hexjson',
			'views': views,
			'parent': this,
			'search':{'id':'search'}
		});
	}





	/*
		Stuquery SVG Builder
	*/
	function SVG(id,w,h){
		if(!id) return this;
		this.version = "0.1.6";
		this.canvas = S('#'+id);
		this.w = parseInt(w || this.canvas[0].offsetWidth);
		this.h = parseInt(h || this.canvas[0].offsetHeight);
		this.id = id;
		this.canvas.html('<svg height="'+this.h+'" version="1.1" width="'+this.w+'" viewBox="0 0 '+this.w+' '+this.h+'" xmlns="http://www.w3.org/2000/svg"><desc>Created by stuQuery SVG</desc></svg>');
		this.paper = S(this.canvas.find('svg')[0]);

		// Initialise
		this.nodes = [];
		this.clippaths = [];
		this.patterns = [];
		
		var _obj = this;
		var counter = 0;
		
		function Path(path){
			this.path = path;
			this.p = path;
			
			if(typeof path==="string"){
				this.path = path;
				this.p = path;
				var c;
				this.p += '0';
				this.p = this.p.match(/(^|[A-Za-z]| )[^ A-Za-z]+/g);
				var a = this.p[this.p.length-1];
				this.p[this.p.length-1] = a.substring(0,a.length-1);
				for(var i = 0; i < this.p.length; i++){
					if(this.p[i].search(/[A-Za-z]/) == 0){
						c = this.p[i][0];
						this.p[i] = this.p[i].substr(1);
					}else{
						if(this.p[i][0] == ' ') this.p[i] = this.p[i].substr(1);
						c = '';
					}
					this.p[i] = [c,this.p[i].split(/\,/)];
					if(this.p[i][1].length == 2){
						for(var j = 0; j < this.p[i][1].length; j++) this.p[i][1][j] = parseFloat(this.p[i][1][j]);
					}else{
						this.p[i][1] = [];
					}
				}
			}else{
				this.p = path;
				this.path = this.string(path);
			}
			return this;
		}
		Path.prototype.string = function(){
			var str = '';
			for(var i = 0; i < this.p.length; i++){
				str += ((this.p[i][0]) ? this.p[i][0] : ' ')+(this.p[i][1].length > 0 ? this.p[i][1].join(',') : ' ');
			}
			return str;
		};
		function copy(o){
			var out, v, key;
			out = Array.isArray(o) ? [] : {};
			for(key in o){
				if(o[key]){
					v = o[key];
					out[key] = (typeof v === "object") ? copy(v) : v;
				}
			}
			return out;
		}
		Path.prototype.copy = function(){
			return new Path(copy(this.p));
		};
		function Node(inp){
			this.transforms = [];
			// Make a structure to hold the original properties
			this.orig = {};
			this.events = [];
			var i;
			for(i in inp){
				if(inp[i]) this[i] = inp[i];
			}
			for(i in inp){
				if(inp[i]) this.orig[i] = inp[i];
			}
			if(this.path){
				this.path = new Path(this.path);
				this.d = this.path.string();
				this.orig.path = this.path.copy();
				this.orig.d = this.d;
			}
			this.id = _obj.id+'-svg-node-'+counter;
			counter++;

			return this;
		}
		Node.prototype.on = function(type,attr,fn){
			if(!fn && typeof attr==="function"){
				fn = attr;
				attr = {};
			}
			this.events.push({'type':type,'attr':attr,'fn':fn});
			return this;
		};
		Node.prototype.attr = function(attr,arg){
			if(arg){ attr = {}; attr[attr] = arg; }
			if(!this.attributes) this.attributes = {};
			if(!this.el || this.el.length == 0) this.el = S('#'+this.id);
			for(var a in attr){
				if(attr[a]){
					if(typeof attr[a]==="string") attr[a] = attr[a].replace(/\"/g,"\'");
					this.attributes[a] = attr[a];
					this.el.attr(a,attr[a]);
					// Update the path on the element's "d" property
					if(a=="path") this.el.attr('d',(new Path(attr[a])).string());
					if(this.type=="text"){
						// Update any tspan elements' x position
						var tspan = this.el.find('tspan');
						for(var i = 0 ; i < tspan.length; i++) tspan[i].setAttribute('x',(this.attributes.x||this.x));
					}
				}
			}
			this.orig.attributes = JSON.parse(JSON.stringify(this.attributes));
			
			if(this.attributes && this.attributes.id) this.id = this.attributes.id;

			return this;
		};
		Node.prototype.transform = function(ts){
			if(typeof ts.length==="undefined" && typeof ts==="object") ts = [ts];
			if(!this.transforms) this.transforms = [];
			for(var t = 0; t < ts.length; t++) this.transforms.push(ts[t]);
			return this;
		};
		Node.prototype.update = function(){
			if(this.transforms && this.transforms.length > 0){
				var t,p,i,j;

				// Reset path
				if(this.orig.path) this.path = this.orig.path.copy();
				
				// Loop over all the transforms and update properties
				for(t = 0; t < this.transforms.length; t++){
					for(p in this.transforms[t].props){
						// Replace the current value with the original
						if(this.orig[p] && this[p]) this[p] = JSON.parse(JSON.stringify(this.orig[p]));
					}
				}
				// Update attributes to the original ones
				if(this.orig.attributes) this.attributes = JSON.parse(JSON.stringify(this.orig.attributes));

				for(t = 0; t < this.transforms.length; t++){
					if(this.transforms[t].type=="scale"){
						if(this.type == "path"){
							for(i = 0; i < this.orig.path.p.length; i++){
								for(j = 0; j < this.orig.path.p[i][1].length; j++){
									this.path.p[i][1][j] *= this.transforms[t].props[(j%2==0 ? "x": "y")];
								}
							}
							this.path.path = this.path.string();
							this.d = this.path.path;
						}else{
							for(p in this.transforms[t].props){
								if(this[p]) this[p] *= this.transforms[t].props[p];
							}
						}
						if(this.attributes){
							for(p in this.transforms[t].props){
								if(this.attributes[p]) this.attributes[p] *= this.transforms[t].props[p];
							}
						}
					}
				}
			}
			return this;
		};
		this.circle = function(x,y,r){
			this.nodes.push(new Node({'cx':x,'cy':y,'r':r,'type':'circle'}));
			return this.nodes[this.nodes.length-1];
		};
		this.rect = function(x,y,w,h,r){
			if(r) this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'r':r,'rx':r,'ry':r,'type':'rect'}));
			else this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'type':'rect'}));
			return this.nodes[this.nodes.length-1];
		};
		this.path = function(path){
			this.nodes.push(new Node({'path':path,'type':'path'}));
			return this.nodes[this.nodes.length-1];
		};
		this.text = function(x,y,text){
			this.nodes.push(new Node({'x':x,'y':y,'type':'text','text':text}));
			return this.nodes[this.nodes.length-1];
		};
		this.clip = function(o){
			this.clippaths.push(new Node(o));
			return this.clippaths[this.clippaths.length-1];
		};
		this.pattern = function(o){
			this.patterns.push(o);
			return this.patterns[this.patterns.length-1];
		};

		return this;
	}
	SVG.prototype.clear = function(){
		this.nodes = [];
		this.clippaths = [];
		this.patterns = [];
		this.draw();
		return this;
	};
	SVG.prototype.draw = function(head){
		var i,j,e;
		var dom = "<desc>Created by stuQuery SVG</desc>";
		if(this.patterns.length > 0){
			for(i = 0; i < this.patterns.length; i++) dom += this.patterns[i];
		}
		if(this.clippaths.length > 0){
			dom += '<defs>';
			for(i = 0; i < this.clippaths.length; i++){
			
				dom += '<clipPath id="'+this.clippaths[i].id+'">';
				if(this.clippaths[i].type){
					// Update node with any transforms
					this.clippaths[i].update();
					dom += '<'+this.clippaths[i].type;
					// Add properties
					for(j in this.clippaths[i]){
						if(j != "type" && typeof this.clippaths[i][j]!=="object" && typeof this.clippaths[i][j]!=="function" && j != "attributes"){
							dom += ' '+j+'="'+this.clippaths[i][j]+'"';
						}
					}
					dom += ' />';
				}
				dom += '</clipPath>';
			}
			dom += '</defs>';
		}

		function buildChunk(nodes,node){
			
			var n = nodes[node];
			var chunk = "";
			var t = n.type;
			var arr = (n.text) ? n.text.split(/\n/) : [];
			var j,a;
			
			if(n.type){
				chunk += '<'+t;
				// Update node with any transforms
				n.update();
				// Add properties
				for(j in n){
					if(j != "type" && typeof n[j]!=="object" && typeof n[j]!=="function" && j != "attributes"){
						if(j=="text" && arr.length > 1) chunk += '';
						else chunk += ' '+j+'="'+n[j]+'"';
					}
				}
				chunk += ' id="'+n.id+'"';
				// Add attributes
				for(a in n.attributes){
					if(n.attributes[a]) chunk += ' '+a+'="'+(a == "clip-path" ? 'url(#':'')+n.attributes[a]+(a == "clip-path" ? ')':'')+'"';
				}
				// Draw internal parts of a text element
				if(n.text){
					var y = 0;
					var lh = 1.2;
					chunk += '>';
					var off = -0.5 + arr.length*0.5;
					for(a = 0; a < arr.length; a++, y+=lh){
						chunk += '<tspan'+(a==0 ? ' dy="-'+(lh*off)+'em"':' x="'+(n.attributes.x||n.x)+'" dy="'+lh+'em"')+'>'+arr[a]+'</tspan>';
					}
					chunk += '</'+t+'>';
				}else{
					chunk += ' />';
				}
			}
			return chunk;
		}

		// Build the SVG chunks for each node
		for(i = 0; i < this.nodes.length; i++) dom += buildChunk(this.nodes,i);

		this.paper.html(dom);

		// Attach events to DOM
		for(i = 0; i < this.nodes.length; i++){
			if(this.nodes[i].events){
				for(e = 0; e < this.nodes[i].events.length; e++){
					S('#'+this.nodes[i].id).on(this.nodes[i].events[e].type,this.nodes[i].events[e].attr,this.nodes[i].events[e].fn);
				}
			}
		}

		return this;
	};

	// Display a hex map
	// Requires stuquery.svg.js to be loaded first
	// Input structure:
	//    id: the ID for the HTML element to attach this to
	//    width: the width of the SVG element created
	//    height: the height of the SVG element created
	//    padding: an integer number of hexes to leave as padding around the displayed map
	//    showgrid: do we show the background grid?
	//    formatLabel: a function to format the hex label
	//    size: the size of a hexagon in pixels
	function HexMap(attr){

		this.version = "0.4";
		if(!attr) attr  = {};
		this._attr = attr;
		if(S('#'+attr.id).length==0){
			console.warn("Can't find the element to draw into (#"+attr.id+")");
			return {};
		}

		this.w = attr.width || 300;
		this.h = attr.height || 150;
		this.maxw = this.w;
		this.maxh = this.h;
		this.s = attr.size || 10;
		this.aspectratio = this.w/this.h;
		this.id = attr.id;
		this.hexes = {};
		this.min = 0;
		this.max = 1;
		this.padding = (typeof attr.padding==="number" ? attr.padding : 0);
		this.properties = { 'size': (typeof attr.size==="number" ? attr.size : 10) };
		
		var fs = (typeof attr.size==="number" ? attr.size : 10)*0.4;

		if(S('#'+this.id+'-inner').length==0) S('#'+this.id).append('<div id="'+this.id+'-inner"></div>');
		this.el = S('#'+this.id+'-inner');

		this.options = {
			'showgrid':(typeof attr.grid==="boolean" ? attr.grid : false),
			'showlabel':(typeof attr.showlabel==="boolean" ? attr.showlabel : true),
			'formatLabel': (typeof attr.formatLabel==="function" ? attr.formatLabel : function(txt,attr){ return txt.substr(0,3); }),
			'minFontSize': (typeof attr.minFontSize==="number" ? attr.minFontSize : 4)
		};

		this.style = {
			'default': { 'fill': '#cccccc','fill-opacity':(this.options.showlabel ? 0.5 : 1),'font-size':fs,'stroke-width':1.5,'stroke-opacity':1,'stroke':'#ffffff' },
			'highlight': { 'fill': '#1DD3A7' },
			'grid': { 'fill': '#aaa','fill-opacity':0.1 }
		};

		for(var s in attr.style){
			if(attr.style[s]){
				if(!this.style[s]) this.style[s] = {};
				if(attr.style[s].fill) this.style[s].fill = attr.style[s].fill;
				if(attr.style[s]['fill-opacity']) this.style[s]['fill-opacity'] = attr.style[s]['fill-opacity'];
				if(attr.style[s]['font-size']) this.style[s]['font-size'] = attr.style[s]['font-size'];
				if(attr.style[s].stroke) this.style[s].stroke = attr.style[s].stroke;
				if(attr.style[s]['stroke-width']) this.style[s]['stroke-width'] = attr.style[s]['stroke-width'];
				if(attr.style[s]['stroke-opacity']) this.style[s]['stroke-opacity'] = attr.style[s]['stroke-opacity'];
			}
		}
		
		this.mapping = {};

		// Can load a file or a hexjson data structure
		this.load = function(file,attr,fn){
			if(typeof attr==="function" && !fn){
				fn = attr;
				attr = "";
			}
			if(typeof fn !== "function") return this;

			if(typeof file==="string"){
				S(document).ajax(file,{
					'complete': function(data){
						this.setMapping(data);
						this.search.init();
						if(typeof fn==="function") fn.call(this,{'data':attr});
					},
					'error': this.failLoad,
					'this': this,
					'dataType':'json'
				});
			}else if(typeof file==="object"){
				this.setMapping(file);
				this.search.init();
				if(typeof fn==="function") fn.call(this,{'data':attr});
			}
			return this;
		};

		var _obj = this;
		// We'll need to change the sizes when the window changes size
		window.addEventListener('resize', function(event){ _obj.resize(); });
		
		function clone(d){
			return JSON.parse(JSON.stringify(d));
		}

		this.setHexStyle = function(r){
			var h = this.hexes[r];
			var style = clone(this.style['default']);
			var cls = "";

			if(h.active){
				style.fill = h.fillcolour;
				//cls += ' active';
			}
			if(h.hover){
				cls += ' hover';
			}
			if(h.selected){
				for(var p in this.style.selected){
					if(this.style.selected[p]) style[p] = this.style.selected[p];
				}
				cls += ' selected';
			}
			if(this.search.active) cls += (h.highlight) ? ' highlighted' : ' not-highlighted';
			style['class'] = 'hex-cell'+cls;
			h.attr(style);

			this.labels[r].attr({'class':'hex-label'+cls});

			return h;
		};
		
		this.toFront = function(r){
			// Simulate a change of z-index by moving elements to the end of the SVG
			
			// Keep selected items on top
			for(var region in this.hexes){
				if(this.hexes[region].selected){
					this.paper.paper[0].appendChild(this.hexes[region].el[0]);
					this.paper.paper[0].appendChild(this.labels[region].el[0]);
				}
			}
			// Simulate a change of z-index by moving this element (hex and label) to the end of the SVG
			this.paper.paper[0].appendChild(this.hexes[r].el[0]);
			this.paper.paper[0].appendChild(this.labels[r].el[0]);
			return this;
		};

		this.regionToggleSelected = function(r,others){
			this.selected = (this.selected==r) ? "" : r;
			var h = this.hexes[r];
			h.selected = !h.selected;
			this.setHexStyle(r);
			var region;

			// If we've deselected a region, deselect any other regions selected
			if(!h.selected){
				if(others){
					for(region in this.hexes){
						if(this.hexes[region].selected){
							this.hexes[region].selected = false;
							this.setHexStyle(region);
						}
					}
				}
			}
			return this;
		};

		this.regionFocus = function(r){
			var h = this.hexes[r];
			h.hover = true;
			this.setHexStyle(r);
			this.toFront(r);
			return this;
		};

		this.regionBlur = function(r){
			var h = this.hexes[r];
			h.hover = false;
			this.setHexStyle(r);
			return this;
		};

		this.regionActivate = function(r){
			var h = this.hexes[r];
			h.active = true;
			this.setHexStyle(r);
		};

		this.regionDeactivate = function(r){
			var h = this.hexes[r];
			h.active = false;
			this.setHexStyle(r);
		};

		this.regionToggleActive = function(r){
			var h = this.hexes[r];
			h.active = !h.active;
			this.setHexStyle(r);
		};

		this.selectRegion = function(r){
			this.selected = r;
			var h;
			for(var region in this.hexes){
				if(this.hexes[region]){
					h = this.hexes[region];
					if(r.length > 0 && region.indexOf(r)==0){
						h.selected = true;
						this.setHexStyle(region);
					}else{
						h.selected = false;
						this.setHexStyle(region);
					}
				}
			}
			return this;
		};

		// Add events (mouseover, mouseout, click)	
		this.on = function(type,attr,fn){
			if(typeof attr==="function" && !fn){
				fn = attr;
				attr = "";
			}
			if(typeof fn !== "function") return this;
			if(!this.callback) this.callback = {};
			this.callback[type] = { 'fn': fn, 'attr': attr };
			return this;
		};

		// Move the selected hex to the new coordinates
		this.moveTo = function(q,r){
			if(this.selected){
				var dq = q - this.mapping.hexes[this.selected].q;
				var dr = r - this.mapping.hexes[this.selected].r;

				for(var region in this.hexes){
					if(this.hexes[region]){
						if(region.indexOf(this.selected)==0){
							this.hexes[region].selected = true;
						}
						if(this.hexes[region].selected){
							this.mapping.hexes[region].q += dq;
							this.mapping.hexes[region].r += dr;
							var h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
							this.hexes[region].attr({'path':h.path}).update();
							if(this.options.showlabel && this.labels[region]){
								this.labels[region].attr({'x':h.x,'y':h.y+this.style['default']['font-size']/2,'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r}).update();
							}
							this.hexes[region].selected = false;
							this.setHexStyle(region);
						}
					}
				}
				this.selected = "";
			}
		};

		this.size = function(w,h){
			this.el.css({'height':'','width':''});
			w = Math.min(this.w,S('#'+this.id)[0].offsetWidth);
			this.el.css({'height':(w/this.aspectratio)+'px','width':w+'px'});
			this.paper = new SVG(this.id+'-inner',this.maxw,this.maxh);
			w = this.paper.w;
			h = this.paper.h;
			var scale = w/this.w;
			this.properties.size = this.s*scale;
			this.w = w;
			this.h = h;
			this.transform = {'type':'scale','props':{x:w,y:h,cx:w,cy:h,r:w,'stroke-width':w}};
			this.el.css({'height':'','width':''});

			return this;
		};
		
		function Search(attr){

			if(!attr) attr = {};
			this.attr = attr;
			this.el = '';
			this.active = false;
			this.selected = -1;
			this.regions = {};
			
			this.init = function(){
				for(var region in _obj.hexes){
					if(_obj.hexes[region]) this.regions[region] = _obj.hexes[region].attributes.title.toLowerCase();
				}
			};
			this.key = function(str){
				str = str.toLowerCase();
				var regions = {};
				if(str.length > 2){
					for(var region in this.regions){
						if(this.regions[region].indexOf(str)>=0){
							regions[region] = true;
						}
					}
				}
				this.highlight(regions);
			};
			this.pick = function(value){
				// Trigger the click event on the appropriate hex
				if(_obj.hexes[value]) _obj.hexes[value].el.trigger('click');
				else console.warn('No hex for '+value);
			};
			this.highlight = function(rs){
				this.n = 0;
				var region;
				for(region in rs){
					if(rs[region]) this.n++;
				}
				for(region in _obj.hexes){
					if(this.n>0){
						if(rs[region]){
							_obj.hexes[region].highlight = true;//(rs[region]);
							_obj.hexes[region].attr({'class':'hex-cell highlighted'});
						}else{
							_obj.hexes[region].highlight = false;
							_obj.hexes[region].attr({'class':'hex-cell not-highlighted'});
						}
					}else{
						_obj.hexes[region].highlight = false;
						_obj.hexes[region].attr({'class':'hex-cell'});
					}
				}

				return this;
			};

			return this;
		}

		this.resize = function(){
			return this;
		};

		this.initialized = function(){
			this.create().draw();
			S('.spinner').remove();
			return this;
		};

		this.create = function(){
			this.paper.clear();
			this.constructed = false;
			return this;
		};

		this.setMapping = function(mapping){
			this.mapping = mapping;
			if(!this.properties) this.properties = { "x": 100, "y": 100 };
			this.properties.x = this.w/2;
			this.properties.y = this.h/2;
			this.setSize();
			var p = mapping.layout.split("-");
			this.properties.shift = p[0];
			this.properties.orientation = p[1];

			return this.initialized();
		};

		this.setSize = function(size){
			if(size) this.properties.size = size;
			this.properties.s = { 'cos': this.properties.size*Math.sqrt(3)/2, 'sin': this.properties.size*0.5 };
			this.properties.s.c = this.properties.s.cos.toFixed(2);
			this.properties.s.s = this.properties.s.sin.toFixed(2);
			return this;
		};

		this.drawHex = function(q,r,scale){
			if(this.properties){
				if(typeof scale!=="number") scale = 1;
				scale = Math.sqrt(scale);

				var x = this.properties.x + (q * this.properties.s.cos * 2);
				var y = this.properties.y - (r * this.properties.s.sin * 3);

				if(this.properties.orientation == "r"){
					if(this.properties.shift=="odd" && (r&1) == 1) x += this.properties.s.cos;
					if(this.properties.shift=="even" && (r&1) == 0) x += this.properties.s.cos;
				}
				if(this.properties.orientation == "q"){
					if(this.properties.shift=="odd" && ((q&1) == 1)) y += this.properties.s.cos;
					if(this.properties.shift=="even" && ((q&1) == 0)) y += this.properties.s.cos;
				}

				var path = [['M',[x,y]]];
				var cs = this.properties.s.c * scale;
				var ss = this.properties.s.s * scale;
				if(this.properties.orientation == "r"){
					// Pointy topped
					path.push(['m',[cs,-ss]]);
					path.push(['l',[-cs,-ss,-cs,ss,0,(this.properties.size*scale).toFixed(2),cs,ss,cs,-ss]]);
					path.push(['z',[]]);
				}else{
					// Flat topped
					path.push(['m',[-ss,cs]]);
					path.push(['l',[-ss,-cs,ss,cs,(this.properties.size*scale).toFixed(2),0,ss,cs,-ss,cs]]);
					path.push(['z',[]]);
				}
				return { 'path':path, 'x':x, 'y': y };
			}
			return this;
		};

		this.updateColours = function(){
			var fn = (typeof this.setColours==="function") ? this.setColours : function(){ return this.style['default'].fill; };
			for(var region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					this.hexes[region].fillcolour = fn.call(this,region);
					this.setHexStyle(region);
				}
			}

			return this;
		};
		
		this.draw = function(){

			var r,q,h,region;

			var range = { 'r': {'min':1e100,'max':-1e100}, 'q': {'min':1e100,'max':-1e100} };
			for(region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					q = this.mapping.hexes[region].q;
					r = this.mapping.hexes[region].r;
					if(q > range.q.max) range.q.max = q;
					if(q < range.q.min) range.q.min = q;
					if(r > range.r.max) range.r.max = r;
					if(r < range.r.min) range.r.min = r;
				}
			}
			
			// Add padding to range
			range.q.min -= this.padding;
			range.q.max += this.padding;
			range.r.min -= this.padding;
			range.r.max += this.padding;
		
			// q,r coordinate of the centre of the range
			var qp = (range.q.max+range.q.min)/2;
			var rp = (range.r.max+range.r.min)/2;
			
			this.properties.x = (this.w/2) - (this.properties.s.cos * 2 *qp);
			this.properties.y = (this.h/2) + (this.properties.s.sin * 3 *rp);
			
			// Store this for use elsewhere
			this.range = range;
			
			var events = {
				'mouseover': function(e){
					var t = 'mouseover';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				},
				'mouseout': function(e){
					var t = 'mouseout';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				},
				'click': function(e){
					var t = 'click';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				}
			};
			
			if(this.options.showgrid){
				this.grid = [];
			
				for(q = range.q.min; q <= range.q.max; q++){
					for(r = range.r.min; r <= range.r.max; r++){
						h = this.drawHex(q,r);
						this.grid.push(this.paper.path(h.path).attr({'class':'hex-grid','data-q':q,'data-r':r,'fill':(this.style.grid.fill||''),'fill-opacity':(this.style.grid['fill-opacity']||0.1),'stroke':(this.style.grid.stroke||'#aaa'),'stroke-opacity':(this.style.grid['stroke-opacity']||0.2)}));
						this.grid[this.grid.length-1].on('mouseover',{type:'grid',hexmap:this,data:{'r':r,'q':q}},events.mouseover)
							.on('mouseout',{type:'grid',hexmap:this,me:_obj,data:{'r':r,'q':q}},events.mouseout)
							.on('click',{type:'grid',hexmap:this,region:region,me:_obj,data:{'r':r,'q':q}},events.click);
							
						// Make all the clipping areas
						this.paper.clip({'path':h.path,'type':'path'}).attr({'id':'hex-clip-'+q+'-'+r});
					}
				}
			}

			var min = 50000;
			var max = 80000;
			this.values = {};

			for(region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					this.values[region] = (this.mapping.hexes[region].p - min)/(max-min);
					if(this.values[region].value < 0) this.values[region] = 0;
					if(this.values[region].value > 1) this.values[region] = 1;

					h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
					
					if(!this.constructed){
						this.hexes[region] = this.paper.path(h.path).attr({'class':'hex-cell','data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r});
						this.hexes[region].selected = false;
						this.hexes[region].active = true;
						this.hexes[region].attr({'id':'hex-'+region});

						// Attach events
						this.hexes[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
							.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.hexes[region]},events.mouseout)
							.on('click',{type:'hex',hexmap:this,region:region,me:this.hexes[region],data:this.mapping.hexes[region]},events.click);


						if(this.options.showlabel){
							if(!this.labels) this.labels = {};
							if(this.style['default']['font-size'] > this.options.minFontSize){
								this.labels[region] = this.paper.text(h.x,h.y+this.style['default']['font-size']/2,this.options.formatLabel(this.mapping.hexes[region].n,{'size':this.properties.size,'font-size':this.style['default']['font-size']})).attr({'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r,'data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r,'class':'hex-label','text-anchor':'middle','font-size':this.style['default']['font-size']+'px','title':(this.mapping.hexes[region].n || region)});
								this.labels[region].attr({'id':'hex-'+region+'-label'});
							}
						}

						// Attach events
						this.labels[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
							.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.labels[region]},events.mouseout)
							.on('click',{type:'hex',hexmap:this,region:region,me:this.labels[region],data:this.mapping.hexes[region]},events.click);

					}
					this.setHexStyle(region);
					this.hexes[region].attr({'stroke':this.style['default'].stroke,'stroke-opacity':this.style['default']['stroke-opacity'],'stroke-width':this.style['default']['stroke-width'],'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
					this.hexes[region].update();
				}
			}

			if(!this.constructed) this.paper.draw();

			this.constructed = true;

			return this;
		};
		
		S(document).on('keypress',{me:this},function(e){
			e.stopPropagation();
			if(e.originalEvent.charCode==99) e.data.me.selectBySameColour(e);		// C
		});
			

		this.selectBySameColour = function(){
			if(this.selected){
				for(var region in this.hexes){
					if(this.hexes[region].fillcolour==this.hexes[this.selected].fillcolour){
						this.hexes[region].selected = true;
						this.setHexStyle(region);
						//this.hexes[region].attr({'fill':this.style.selected.fill||this.hexes[region].fillcolour,'fill-opacity':this.style.selected['fill-opacity']});
					}
				}
			}
			return this;
		};
			
		this.size();
		if(attr.file) this.load(attr.file);
		
		this.search = new Search(attr.search);

		return this;
	}

	var _parent;

	function ResultsMap(id,attr){
		if(!attr) attr = {};
		if(!attr.padding) attr.padding = 0;
		if(!attr.width || !attr.height || !attr.file || !attr.views) return {};

		this.w = attr.width;
		this.h = attr.height;
		this.aspectratio = attr.width/attr.height;
		this.id = id;
		this.type = "";
		this.files = {};
		this.views = attr.views;
		_parent = attr.parent;
		var _obj = this;

		if(S('#data-selector').length > 0) this.type = S('#data-selector')[0].value;
		if(S('.view-toggle').length > 0) this.type = document.querySelector('input[name="view"]:checked').id;

		this.defaulttype = this.type;


		function updateToggles(){
			S('.view-toggle').parent().removeClass('on').addClass('off');
			S('#'+document.querySelector('input[name="view"]:checked').id).parent().removeClass('off').addClass('on');
			return this;
		}
		
		var t = _parent.qs.hextype;

		if(t){
			// Check if this is in the list
			var options = S('#data-selector option');
			var v,i,ok;
			if(options.length > 0){
				ok = false;
				v = "";
				for(i = 0; i < options.length; i++){
					if(options[i].getAttribute('value')==t){
						ok = true;
					}
				}
				if(ok){
					S('#data-selector')[0].value = t;
					this.type = t;
				}
			}else{
				// Check if this is in the list
				options = S('.view-toggle');

				if(options.length > 0){
					v = "";
					for(i = 0; i < options.length; i++){
						if(options[i].getAttribute('id')==t){
							options[i].checked = true;
							this.type = t;
						}
					}
				}
			}
			updateToggles();
		}

		// Create a hex map
		var attrhex = JSON.parse(JSON.stringify(attr));
		attrhex.id = id;
		attrhex.size = 16;

		this.hex = new HexMap(attrhex);

		this.hex.load(attr.file,{me:this},function(e){
			var el = document.querySelector('input[name="view"]:checked');
			e.data.me.setType(e.data.me.type,el.getAttribute('data'),(e.data.me.type!=e.data.me.defaulttype ? true : false));
		});

		
		// Listen for resizing information
		window.addEventListener('message', function(event){
			_obj.iframe = event.data;
			_obj.positionBubble();
		}, false);

		this.positionBubble = function(){
			if(this.iframe && S('.infobubble').length > 0) S('.infobubble').css({'top':'calc('+(this.iframe.top > 0 ? this.iframe.top : 0)+'px + 1em)','max-height':(this.iframe.height)+'px'});
		};

		this.setType = function(t,d,update){

			// Have we changed type?
			if(t==this.by){
				console.log('no change');
				return this;
			}

			_parent.qs.hextype = t;
			_parent.updateHistory();

			this.updateData(t,d);

			return this;
		};

		this.updateData = function(type,dtype){

			if(!dtype) dtype = document.querySelector('input[name="view"]:checked').getAttribute('data');
			if(this.polling){
				console.info('Stop loop');
				clearInterval(this.polling);
			}

			if(!this.data || !this.data[type]){
				return this.loadResults(type,dtype,function(type,dtype){
					// Set the colours of the map
					this.setColours(type,dtype);
				});
			}else{

				// Set the colours
				this.setColours(type,dtype);
			}
			
			return this;
		};

		// Add events to map
		this.hex.on('mouseover',{'builder':this},function(e){

			e.data.hexmap.regionFocus(e.data.region);

			if(S('#tooltip').length==0) S('#'+e.data.builder.id+'-inner').append('<div id="tooltip"></div>');
			var tooltip = S('#tooltip');
			tooltip.html(e.data.builder.hex.hexes[e.data.region].attributes.title+'</div>');
			var bb = e.data.builder.hex.hexes[e.data.region].el[0].getBoundingClientRect();
			tooltip.css({'position':'absolute','left':''+Math.round(bb.left+(bb.width/2)-S('#'+e.data.builder.id)[0].offsetLeft)+'px','top':''+Math.round(bb.y+bb.height+window.scrollY-S('#'+e.data.builder.id)[0].offsetTop)+'px'});

		}).on('mouseout',{'builder':this},function(e){

			e.data.hexmap.regionBlur(e.data.region);
			S('#tooltip').remove();

		}).on('click',{'builder':this},function(e){

			e.data.builder.openActive(e.data.region);

		});
		
		this.closeActive = function(){
			this.hex.selected = "";
			this.hex.selectRegion('');
			this.hex.search.active = false;
			S('.infobubble').remove();
			S('body').removeClass('modal');
			return this;
		};
		
		this.openActive = function(region){

			var previous = this.hex.selected;
			var current = region;

			this.label(region,previous!=current);
			this.hex.selectRegion(region);

			return this;
		};

		this.label = function(region,reopen){

			var view = this.views[this.by];
			if(!view) return this;
			var popup = view.popup;

			var title = this.hex.hexes[region].el[0].getAttribute('title');

			if(reopen){
				S('.infobubble').remove();
				S('#'+this.id+'').append('<div class="infobubble generalelection"><div class="infobubble_inner"><div class="spinner"><svg width="64" height="64" viewBox="-32 -32 64 64" xmlns="http://www.w3.org/2000/svg" style="transform-origin: center center;"><style>#odilogo-starburst rect2 { transform-origin: center center; -webkit-transform-origin: center center; }</style><g id="odilogo-starburst"><rect width="4" height="25" x="-2" transform="rotate(7)" fill="#2254F4"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(27)" fill="#F9BC26"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(47)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(67)" fill="#D60303"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(87)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(107)" fill="#1DD3A7"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(127)" fill="#EF3AAB"><animate attributeName="height" begin="0s" dur="2s" values="25;20;22;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(147)" fill="#FF6700"><animate attributeName="height" begin="0s" dur="4s" values="25;24;18;23;27;23;29;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(167)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="4s" values="25;15;27;25;24;32;16;24;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(187)" fill="#178CFF"><animate attributeName="height" begin="0s" dur="5s" values="25;18;23;21;31;20;24;21;28;31;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(207)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="3s" values="25;32;16;24;19;27;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(227)" fill="#D73058"><animate attributeName="height" begin="0s" dur="5s" values="25;23;25;28;18;27;24;30;31;28;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(247)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(267)" fill="#67E767"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(287)" fill="#E6007C"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(307)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(327)" fill="#D60303"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(347)" fill="#08DEF9"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect></g><g id="odilogo"><circle cx="-12.8" cy="0" r="6.4" style="fill:black;"></circle><path d="M-7 -6.4 l 6.4 0 c 0 0 6.4 0 6.4 6.4 c 0 6.4 -6.4 6.4 -6.4 6.4 L -7 6.4Z" style="fill:black;"></path><rect width="6.4" height="12.5" x="5.5" y="-6.25" style="fill:black;"></rect></g></svg></div></div></div>');
			}

			function callback(title,region,data,attr){

				if(!attr) attr = {};

				//var lbl = this.hex.mapping.hexes[region].label;
				var l = {};
				if(popup && typeof popup.render==="function"){
					l = popup.render.call(this,title,region,data,attr);
				}else{
					console.warn('No view for '+this.by+'/'+this.bysrc);
					l = {'label':title,'class':'','color':''};
				}
				var c = (l.color||'');
				var t = (l.color ? Colour.getColour(c).text : 'black');
				var txt = l.label;
				txt = txt.replace(/%COLOR%/g,t);
				S('.infobubble_inner').html(txt).css({'width':(l.w ? l.w+'px':''),'height':(l.h ? l.h+'px':'')});
				S('.infobubble').attr('class','infobubble'+(l['class'] ? " "+l['class'] : ''));
				S('.infobubble .close').remove();
				S('.infobubble').prepend('<button class="close button" title="Close constituency information">&times;</button>');
				S('.infobubble .close').on('click',{me:this},function(e){ e.data.me.closeActive(); });
				if(typeof l.callback==="function") l.callback.call(this,title,region,data,attr);
				return this;
			}
			callback.call(this,title,region,this.data[this.bysrc][region]);
			
			S('body').addClass('modal');

			return this;
		};


		// Add events to buttons for colour changing
		S('.view-toggle').on('change',{me:this},function(e){
			updateToggles();
			var el = document.querySelector('input[name="view"]:checked');
			var id = el.id;
			e.data.me.setType(id,el.getAttribute('data'),true);
		});

		S(document).on('keypress',function(e){
			//if(e.originalEvent.charCode==109) S('#savesvg').trigger('click');     // M
			//if(e.originalEvent.charCode==104) S('#save').trigger('click');     // H
		});
		
		this.addSupplemental = function(dtype,data){
			console.log('Add data to hexmap',dtype,data,this.data);
			// Store the supplemental data if provided
			if(typeof data==="object") this.supplemental = data;

			if(!data && this.supplemental){
				// Add the supplemental data
				for(var id in this.supplemental){
					if(this.supplemental[id]){
						if(!this.data[dtype][id]){
							// Build item
							datum = {'GSS_CD':id,'GSS_NM':this.supplemental[id].name,'TotalCases':this.supplemental[id].max+'','date':this.supplemental[id].maxdate.toISOString().substr(0,10)};
							processRow.call(this,dtype,datum);
						}
					}
				}
				
			}
			return this;
		}

		this.loadResults = function(type,dtype,callback){
			
			if(!type) type = "GE2015-results";

			if(!this.data) this.data = {};
			this.data[dtype] = {};
			if(!this.hex.data) this.hex.data = {};
			this.hex.data[dtype] = {};

			if(this.views[type]){
				var file = this.views[type].file;

				_parent.getData(file,{
					'this':this,
					'name': name,
					'callback': callback,
					'dataType':(this.views[type].file.indexOf(".json") > 0 ? 'json':'text'),
					'type': type,
					'dtype': dtype,
					'cache': (typeof this.views[type].live==="boolean" ? !this.views[type].live : true),
					'process':function(d,attr){
						// Convert to JSON if CSV
						if(attr.dataType=="text") d = CSV.toJSON(d);
						function getTimestamp(str){
							var timestamp = "";
							var date;
							str.replace(/last-modified: (.*)/,function(m,p1){ date = p1; });
							if(date){
								date = new Date(date);
								timestamp = (date.getUTCHours() < 10 ? "0" : "")+date.getUTCHours()+':'+(date.getUTCMinutes() < 10 ? "0" : "")+date.getUTCMinutes();
							}
							return timestamp;
						}
						attr.timestamp = getTimestamp(attr.header);
						return d;
					},
					'loaded': function(data,attr){
						if(typeof this.views[attr.type].process==="function") this.views[attr.type].process.call(this,attr.type,data,attr);
						this.addSupplemental(attr.dtype);
						if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
					}
				});
			}
			return this;
		};

		this.setColours = function(type,dtype){
			var i,p,key;
			if(!type) type = "";
			
			if(S('#data-selector').length > 0) S('#data-selector')[0].value = type;
			if(S('.view-toggle').length > 0){
				var options = S('.view-toggle');
				for(i = 0; i < options.length; i++){
					p = S(options[i].parentNode);
					if(options[i].getAttribute('id')==type){
						options[i].checked = true;
						p.addClass('on').removeClass('off');
					}else{
						p.addClass('off').removeClass('on');
					}
				}
			}

			this.by = type;
			this.bysrc = dtype;

			key = "";

			// Set the function for changing the colours and creating the key
			if(this.views[type] && typeof this.views[type].key==="function") key = this.views[type].key.call(this);

			// Update the key
			S('#key').html(key);

			// Update the map colours
			this.hex.updateColours();

			// Re-render the popup?
			if(this.hex.selected) this.label(this.hex.selected); //re-render

			return this;
		};


		return this;
	}


	if(!Dashboard.plugins[name]){
		Dashboard.plugins[name] = {
			init: init,
			version: '1.0'
		};
	}

})(S);