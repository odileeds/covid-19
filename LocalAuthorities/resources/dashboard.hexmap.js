/*!
	Dashboard plugin to show a hex map
	Written by Stuart Lowe (ODI Leeds)
 */
(function(S){

	var name = "hexmap";
	// An init function for the plugin
	function init(){

		// Build hexmap
		var LA2UTLA = { "E06000001":{"id":"E06000001","n":"Hartlepool"},"E06000002":{"id":"E06000002","n":"Middlesbrough"},"E06000003":{"id":"E06000003","n":"Redcar and Cleveland"},"E06000004":{"id":"E06000004","n":"Stockton-on-Tees"},"E06000005":{"id":"E06000005","n":"Darlington"},"E06000006":{"id":"E06000006","n":"Halton"},"E06000007":{"id":"E06000007","n":"Warrington"},"E06000008":{"id":"E06000008","n":"Blackburn with Darwen"},"E06000009":{"id":"E06000009","n":"Blackpool"},"E06000010":{"id":"E06000010","n":"Kingston upon Hull, City of"},"E06000011":{"id":"E06000011","n":"East Riding of Yorkshire"},"E06000012":{"id":"E06000012","n":"North East Lincolnshire"},"E06000013":{"id":"E06000013","n":"North Lincolnshire"},"E06000014":{"id":"E06000014","n":"York"},"E06000015":{"id":"E06000015","n":"Derby"},"E06000016":{"id":"E06000016","n":"Leicester"},"E06000017":{"id":"E06000017","n":"Rutland"},"E06000018":{"id":"E06000018","n":"Nottingham"},"E06000019":{"id":"E06000019","n":"Herefordshire, County of"},"E06000020":{"id":"E06000020","n":"Telford and Wrekin"},"E06000021":{"id":"E06000021","n":"Stoke-on-Trent"},"E06000022":{"id":"E06000022","n":"Bath and North East Somerset"},"E06000023":{"id":"E06000023","n":"Bristol, City of"},"E06000024":{"id":"E06000024","n":"North Somerset"},"E06000025":{"id":"E06000025","n":"South Gloucestershire"},"E06000026":{"id":"E06000026","n":"Plymouth"},"E06000027":{"id":"E06000027","n":"Torbay"},"E06000028":{"id":"E06000028","n":"Bournemouth"},"E06000029":{"id":"E06000029","n":"Poole"},"E06000030":{"id":"E06000030","n":"Swindon"},"E06000031":{"id":"E06000031","n":"Peterborough"},"E06000032":{"id":"E06000032","n":"Luton"},"E06000033":{"id":"E06000033","n":"Southend-on-Sea"},"E06000034":{"id":"E06000034","n":"Thurrock"},"E06000035":{"id":"E06000035","n":"Medway"},"E06000036":{"id":"E06000036","n":"Bracknell Forest"},"E06000037":{"id":"E06000037","n":"West Berkshire"},"E06000038":{"id":"E06000038","n":"Reading"},"E06000039":{"id":"E06000039","n":"Slough"},"E06000040":{"id":"E06000040","n":"Windsor and Maidenhead"},"E06000041":{"id":"E06000041","n":"Wokingham"},"E06000042":{"id":"E06000042","n":"Milton Keynes"},"E06000043":{"id":"E06000043","n":"Brighton and Hove"},"E06000044":{"id":"E06000044","n":"Portsmouth"},"E06000045":{"id":"E06000045","n":"Southampton"},"E06000046":{"id":"E06000046","n":"Isle of Wight"},"E06000047":{"id":"E06000047","n":"County Durham"},"E06000049":{"id":"E06000049","n":"Cheshire East"},"E06000050":{"id":"E06000050","n":"Cheshire West and Chester"},"E06000051":{"id":"E06000051","n":"Shropshire"},"E06000052":{"id":"E06000052","n":"Cornwall"},"E06000053":{"id":"E06000053","n":"Isles of Scilly"},"E06000054":{"id":"E06000054","n":"Wiltshire"},"E06000055":{"id":"E06000055","n":"Bedford"},"E06000056":{"id":"E06000056","n":"Central Bedfordshire"},"E06000057":{"id":"E06000057","n":"Northumberland"},"E07000004":{"id":"E10000002","n":"Buckinghamshire"},"E07000005":{"id":"E10000002","n":"Buckinghamshire"},"E07000146":{"id":"E10000020","n":"Norfolk"},"E07000147":{"id":"E10000020","n":"Norfolk"},"E07000148":{"id":"E10000020","n":"Norfolk"},"E07000149":{"id":"E10000020","n":"Norfolk"},"E07000150":{"id":"E10000021","n":"Northamptonshire"},"E07000151":{"id":"E10000021","n":"Northamptonshire"},"E07000152":{"id":"E10000021","n":"Northamptonshire"},"E07000153":{"id":"E10000021","n":"Northamptonshire"},"E07000154":{"id":"E10000021","n":"Northamptonshire"},"E07000155":{"id":"E10000021","n":"Northamptonshire"},"E07000156":{"id":"E10000021","n":"Northamptonshire"},"E07000163":{"id":"E10000023","n":"North Yorkshire"},"E07000164":{"id":"E10000023","n":"North Yorkshire"},"E07000165":{"id":"E10000023","n":"North Yorkshire"},"E07000166":{"id":"E10000023","n":"North Yorkshire"},"E07000167":{"id":"E10000023","n":"North Yorkshire"},"E07000168":{"id":"E10000023","n":"North Yorkshire"},"E07000169":{"id":"E10000023","n":"North Yorkshire"},"E07000170":{"id":"E10000024","n":"Nottinghamshire"},"E07000171":{"id":"E10000024","n":"Nottinghamshire"},"E07000172":{"id":"E10000024","n":"Nottinghamshire"},"E07000173":{"id":"E10000024","n":"Nottinghamshire"},"E07000174":{"id":"E10000024","n":"Nottinghamshire"},"E07000175":{"id":"E10000024","n":"Nottinghamshire"},"E07000176":{"id":"E10000024","n":"Nottinghamshire"},"E07000177":{"id":"E10000025","n":"Oxfordshire"},"E07000178":{"id":"E10000025","n":"Oxfordshire"},"E07000179":{"id":"E10000025","n":"Oxfordshire"},"E07000180":{"id":"E10000025","n":"Oxfordshire"},"E07000181":{"id":"E10000025","n":"Oxfordshire"},"E07000187":{"id":"E10000027","n":"Somerset"},"E07000188":{"id":"E10000027","n":"Somerset"},"E07000189":{"id":"E10000027","n":"Somerset"},"E07000190":{"id":"E10000027","n":"Somerset"},"E07000191":{"id":"E10000027","n":"Somerset"},"E07000192":{"id":"E10000028","n":"Staffordshire"},"E07000193":{"id":"E10000028","n":"Staffordshire"},"E07000194":{"id":"E10000028","n":"Staffordshire"},"E07000195":{"id":"E10000028","n":"Staffordshire"},"E07000196":{"id":"E10000028","n":"Staffordshire"},"E07000197":{"id":"E10000028","n":"Staffordshire"},"E07000198":{"id":"E10000028","n":"Staffordshire"},"E07000199":{"id":"E10000028","n":"Staffordshire"},"E07000200":{"id":"E10000029","n":"Suffolk"},"E07000201":{"id":"E10000029","n":"Suffolk"},"E07000202":{"id":"E10000029","n":"Suffolk"},"E07000203":{"id":"E10000029","n":"Suffolk"},"E07000204":{"id":"E10000029","n":"Suffolk"},"E07000205":{"id":"E10000029","n":"Suffolk"},"E07000206":{"id":"E10000029","n":"Suffolk"},"E07000207":{"id":"E10000030","n":"Surrey"},"E07000208":{"id":"E10000030","n":"Surrey"},"E07000209":{"id":"E10000030","n":"Surrey"},"E07000210":{"id":"E10000030","n":"Surrey"},"E07000211":{"id":"E10000030","n":"Surrey"},"E07000212":{"id":"E10000030","n":"Surrey"},"E07000213":{"id":"E10000030","n":"Surrey"},"E07000214":{"id":"E10000030","n":"Surrey"},"E07000215":{"id":"E10000030","n":"Surrey"},"E07000216":{"id":"E10000030","n":"Surrey"},"E07000217":{"id":"E10000030","n":"Surrey"},"E07000218":{"id":"E10000031","n":"Warwickshire"},"E07000219":{"id":"E10000031","n":"Warwickshire"},"E07000220":{"id":"E10000031","n":"Warwickshire"},"E07000221":{"id":"E10000031","n":"Warwickshire"},"E07000222":{"id":"E10000031","n":"Warwickshire"},"E07000223":{"id":"E10000032","n":"West Sussex"},"E07000224":{"id":"E10000032","n":"West Sussex"},"E07000225":{"id":"E10000032","n":"West Sussex"},"E07000226":{"id":"E10000032","n":"West Sussex"},"E07000227":{"id":"E10000032","n":"West Sussex"},"E07000228":{"id":"E10000032","n":"West Sussex"},"E07000229":{"id":"E10000032","n":"West Sussex"},"E07000234":{"id":"E10000034","n":"Worcestershire"},"E07000235":{"id":"E10000034","n":"Worcestershire"},"E07000236":{"id":"E10000034","n":"Worcestershire"},"E07000237":{"id":"E10000034","n":"Worcestershire"},"E07000238":{"id":"E10000034","n":"Worcestershire"},"E07000239":{"id":"E10000034","n":"Worcestershire"},"E07000240":{"id":"E10000015","n":"Hertfordshire"},"E07000241":{"id":"E10000015","n":"Hertfordshire"},"E07000242":{"id":"E10000015","n":"Hertfordshire"},"E07000243":{"id":"E10000015","n":"Hertfordshire"},"E07000244":{"id":"E10000029","n":"Suffolk"},"E07000245":{"id":"E10000029","n":"Suffolk"},"E07000246":{"id":"E10000027","n":"Somerset"},"E08000001":{"id":"E08000001","n":"Bolton"},"E08000002":{"id":"E08000002","n":"Bury"},"E08000003":{"id":"E08000003","n":"Manchester"},"E08000004":{"id":"E08000004","n":"Oldham"},"E08000005":{"id":"E08000005","n":"Rochdale"},"E08000006":{"id":"E08000006","n":"Salford"},"E08000007":{"id":"E08000007","n":"Stockport"},"E08000008":{"id":"E08000008","n":"Tameside"},"E08000009":{"id":"E08000009","n":"Trafford"},"E08000010":{"id":"E08000010","n":"Wigan"},"E08000011":{"id":"E08000011","n":"Knowsley"},"E08000012":{"id":"E08000012","n":"Liverpool"},"E08000013":{"id":"E08000013","n":"St. Helens"},"E08000014":{"id":"E08000014","n":"Sefton"},"E08000015":{"id":"E08000015","n":"Wirral"},"E08000016":{"id":"E08000016","n":"Barnsley"},"E08000017":{"id":"E08000017","n":"Doncaster"},"E08000018":{"id":"E08000018","n":"Rotherham"},"E08000019":{"id":"E08000019","n":"Sheffield"},"E08000021":{"id":"E08000021","n":"Newcastle upon Tyne"},"E08000022":{"id":"E08000022","n":"North Tyneside"},"E08000023":{"id":"E08000023","n":"South Tyneside"},"E08000024":{"id":"E08000024","n":"Sunderland"},"E08000025":{"id":"E08000025","n":"Birmingham"},"E08000026":{"id":"E08000026","n":"Coventry"},"E08000027":{"id":"E08000027","n":"Dudley"},"E08000028":{"id":"E08000028","n":"Sandwell"},"E08000029":{"id":"E08000029","n":"Solihull"},"E08000030":{"id":"E08000030","n":"Walsall"},"E08000031":{"id":"E08000031","n":"Wolverhampton"},"E08000032":{"id":"E08000032","n":"Bradford"},"E08000033":{"id":"E08000033","n":"Calderdale"},"E08000034":{"id":"E08000034","n":"Kirklees"},"E08000035":{"id":"E08000035","n":"Leeds"},"E08000036":{"id":"E08000036","n":"Wakefield"},"E08000037":{"id":"E08000037","n":"Gateshead"},"E09000001":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000002":{"id":"E09000002","n":"Barking and Dagenham"},"E09000003":{"id":"E09000003","n":"Barnet"},"E09000004":{"id":"E09000004","n":"Bexley"},"E09000005":{"id":"E09000005","n":"Brent"},"E09000006":{"id":"E09000006","n":"Bromley"},"E09000007":{"id":"E09000007","n":"Camden"},"E09000008":{"id":"E09000008","n":"Croydon"},"E09000009":{"id":"E09000009","n":"Ealing"},"E09000010":{"id":"E09000010","n":"Enfield"},"E09000011":{"id":"E09000011","n":"Greenwich"},"E09000012":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000013":{"id":"E09000013","n":"Hammersmith and Fulham"},"E09000014":{"id":"E09000014","n":"Haringey"},"E09000015":{"id":"E09000015","n":"Harrow"},"E09000016":{"id":"E09000016","n":"Havering"},"E09000017":{"id":"E09000017","n":"Hillingdon"},"E09000018":{"id":"E09000018","n":"Hounslow"},"E09000019":{"id":"E09000019","n":"Islington"},"E09000020":{"id":"E09000020","n":"Kensington and Chelsea"},"E09000021":{"id":"E09000021","n":"Kingston upon Thames"},"E09000022":{"id":"E09000022","n":"Lambeth"},"E09000023":{"id":"E09000023","n":"Lewisham"},"E09000024":{"id":"E09000024","n":"Merton"},"E09000025":{"id":"E09000025","n":"Newham"},"E09000026":{"id":"E09000026","n":"Redbridge"},"E09000027":{"id":"E09000027","n":"Richmond upon Thames"},"E09000028":{"id":"E09000028","n":"Southwark"},"E09000029":{"id":"E09000029","n":"Sutton"},"E09000030":{"id":"E09000030","n":"Tower Hamlets"},"E09000031":{"id":"E09000031","n":"Waltham Forest"},"E09000032":{"id":"E09000032","n":"Wandsworth"},"E09000033":{"id":"E09000033","n":"Westminster"},"W06000001":{"id":"W06000001","n":"Isle of Anglesey"},"W06000002":{"id":"W06000002","n":"Gwynedd"},"W06000003":{"id":"W06000003","n":"Conwy"},"W06000004":{"id":"W06000004","n":"Denbighshire"},"W06000005":{"id":"W06000005","n":"Flintshire"},"W06000006":{"id":"W06000006","n":"Wrexham"},"W06000008":{"id":"W06000008","n":"Ceredigion"},"W06000009":{"id":"W06000009","n":"Pembrokeshire"},"W06000010":{"id":"W06000010","n":"Carmarthenshire"},"W06000011":{"id":"W06000011","n":"Swansea"},"W06000012":{"id":"W06000012","n":"Neath Port Talbot"},"W06000013":{"id":"W06000013","n":"Bridgend"},"W06000014":{"id":"W06000014","n":"Vale of Glamorgan"},"W06000015":{"id":"W06000015","n":"Cardiff"},"W06000016":{"id":"W06000016","n":"Rhondda Cynon Taf"},"W06000018":{"id":"W06000018","n":"Caerphilly"},"W06000019":{"id":"W06000019","n":"Blaenau Gwent"},"W06000020":{"id":"W06000020","n":"Torfaen"},"W06000021":{"id":"W06000021","n":"Monmouthshire"},"W06000022":{"id":"W06000022","n":"Newport"},"W06000023":{"id":"W06000023","n":"Powys"},"W06000024":{"id":"W06000024","n":"Merthyr Tydfil"},"E07000006":{"id":"E10000002","n":"Buckinghamshire"},"E07000007":{"id":"E10000002","n":"Buckinghamshire"},"E07000008":{"id":"E10000003","n":"Cambridgeshire"},"E07000009":{"id":"E10000003","n":"Cambridgeshire"},"E07000010":{"id":"E10000003","n":"Cambridgeshire"},"E07000011":{"id":"E10000003","n":"Cambridgeshire"},"E07000012":{"id":"E10000003","n":"Cambridgeshire"},"E07000026":{"id":"E10000006","n":"Cumbria"},"E07000027":{"id":"E10000006","n":"Cumbria"},"E07000028":{"id":"E10000006","n":"Cumbria"},"E07000029":{"id":"E10000006","n":"Cumbria"},"E07000030":{"id":"E10000006","n":"Cumbria"},"E07000031":{"id":"E10000006","n":"Cumbria"},"E07000032":{"id":"E10000007","n":"Derbyshire"},"E07000033":{"id":"E10000007","n":"Derbyshire"},"E07000034":{"id":"E10000007","n":"Derbyshire"},"E07000035":{"id":"E10000007","n":"Derbyshire"},"E07000036":{"id":"E10000007","n":"Derbyshire"},"E07000037":{"id":"E10000007","n":"Derbyshire"},"E07000038":{"id":"E10000007","n":"Derbyshire"},"E07000039":{"id":"E10000007","n":"Derbyshire"},"E07000040":{"id":"E10000008","n":"Devon"},"E07000041":{"id":"E10000008","n":"Devon"},"E07000042":{"id":"E10000008","n":"Devon"},"E07000043":{"id":"E10000008","n":"Devon"},"E07000044":{"id":"E10000008","n":"Devon"},"E07000045":{"id":"E10000008","n":"Devon"},"E07000046":{"id":"E10000008","n":"Devon"},"E07000047":{"id":"E10000008","n":"Devon"},"E07000048":{"id":"E10000009","n":"Dorset"},"E07000049":{"id":"E10000009","n":"Dorset"},"E07000050":{"id":"E10000009","n":"Dorset"},"E07000051":{"id":"E10000009","n":"Dorset"},"E07000052":{"id":"E10000009","n":"Dorset"},"E07000053":{"id":"E10000009","n":"Dorset"},"E07000061":{"id":"E10000011","n":"East Sussex"},"E07000062":{"id":"E10000011","n":"East Sussex"},"E07000063":{"id":"E10000011","n":"East Sussex"},"E07000064":{"id":"E10000011","n":"East Sussex"},"E07000065":{"id":"E10000011","n":"East Sussex"},"E07000066":{"id":"E10000012","n":"Essex"},"E07000067":{"id":"E10000012","n":"Essex"},"E07000068":{"id":"E10000012","n":"Essex"},"E07000069":{"id":"E10000012","n":"Essex"},"E07000070":{"id":"E10000012","n":"Essex"},"E07000071":{"id":"E10000012","n":"Essex"},"E07000072":{"id":"E10000012","n":"Essex"},"E07000073":{"id":"E10000012","n":"Essex"},"E07000074":{"id":"E10000012","n":"Essex"},"E07000075":{"id":"E10000012","n":"Essex"},"E07000076":{"id":"E10000012","n":"Essex"},"E07000077":{"id":"E10000012","n":"Essex"},"E07000078":{"id":"E10000013","n":"Gloucestershire"},"E07000079":{"id":"E10000013","n":"Gloucestershire"},"E07000080":{"id":"E10000013","n":"Gloucestershire"},"E07000081":{"id":"E10000013","n":"Gloucestershire"},"E07000082":{"id":"E10000013","n":"Gloucestershire"},"E07000083":{"id":"E10000013","n":"Gloucestershire"},"E07000084":{"id":"E10000014","n":"Hampshire"},"E07000085":{"id":"E10000014","n":"Hampshire"},"E07000086":{"id":"E10000014","n":"Hampshire"},"E07000087":{"id":"E10000014","n":"Hampshire"},"E07000088":{"id":"E10000014","n":"Hampshire"},"E07000089":{"id":"E10000014","n":"Hampshire"},"E07000090":{"id":"E10000014","n":"Hampshire"},"E07000091":{"id":"E10000014","n":"Hampshire"},"E07000092":{"id":"E10000014","n":"Hampshire"},"E07000093":{"id":"E10000014","n":"Hampshire"},"E07000094":{"id":"E10000014","n":"Hampshire"},"E07000095":{"id":"E10000015","n":"Hertfordshire"},"E07000096":{"id":"E10000015","n":"Hertfordshire"},"E07000098":{"id":"E10000015","n":"Hertfordshire"},"E07000099":{"id":"E10000015","n":"Hertfordshire"},"E07000102":{"id":"E10000015","n":"Hertfordshire"},"E07000103":{"id":"E10000015","n":"Hertfordshire"},"E07000105":{"id":"E10000016","n":"Kent"},"E07000106":{"id":"E10000016","n":"Kent"},"E07000107":{"id":"E10000016","n":"Kent"},"E07000108":{"id":"E10000016","n":"Kent"},"E07000109":{"id":"E10000016","n":"Kent"},"E07000110":{"id":"E10000016","n":"Kent"},"E07000111":{"id":"E10000016","n":"Kent"},"E07000112":{"id":"E10000016","n":"Kent"},"E07000113":{"id":"E10000016","n":"Kent"},"E07000114":{"id":"E10000016","n":"Kent"},"E07000115":{"id":"E10000016","n":"Kent"},"E07000116":{"id":"E10000016","n":"Kent"},"E07000117":{"id":"E10000017","n":"Lancashire"},"E07000118":{"id":"E10000017","n":"Lancashire"},"E07000119":{"id":"E10000017","n":"Lancashire"},"E07000120":{"id":"E10000017","n":"Lancashire"},"E07000121":{"id":"E10000017","n":"Lancashire"},"E07000122":{"id":"E10000017","n":"Lancashire"},"E07000123":{"id":"E10000017","n":"Lancashire"},"E07000124":{"id":"E10000017","n":"Lancashire"},"E07000125":{"id":"E10000017","n":"Lancashire"},"E07000126":{"id":"E10000017","n":"Lancashire"},"E07000127":{"id":"E10000017","n":"Lancashire"},"E07000128":{"id":"E10000017","n":"Lancashire"},"E07000129":{"id":"E10000018","n":"Leicestershire"},"E07000130":{"id":"E10000018","n":"Leicestershire"},"E07000131":{"id":"E10000018","n":"Leicestershire"},"E07000132":{"id":"E10000018","n":"Leicestershire"},"E07000133":{"id":"E10000018","n":"Leicestershire"},"E07000134":{"id":"E10000018","n":"Leicestershire"},"E07000135":{"id":"E10000018","n":"Leicestershire"},"E07000136":{"id":"E10000019","n":"Lincolnshire"},"E07000137":{"id":"E10000019","n":"Lincolnshire"},"E07000138":{"id":"E10000019","n":"Lincolnshire"},"E07000139":{"id":"E10000019","n":"Lincolnshire"},"E07000140":{"id":"E10000019","n":"Lincolnshire"},"E07000141":{"id":"E10000019","n":"Lincolnshire"},"E07000142":{"id":"E10000019","n":"Lincolnshire"},"E07000143":{"id":"E10000020","n":"Norfolk"},"E07000144":{"id":"E10000020","n":"Norfolk"},"E07000145":{"id":"E10000020","n":"Norfolk"},"E06000052":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"},"E06000053":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"}}
		var populations = {"E06000047":261868,"E06000005":52038,"E06000001":45595,"E06000002":69360,"E06000057":157458,"E06000003":67005,"E06000004":97817,"E11000007":562806,"E08000037":99993,"E08000021":153228,"E08000022":100815,"E08000023":73517,"E08000024":135253,"E12000002":3635677,"E06000008":74692,"E06000009":69099,"E06000049":188259,"E06000050":168531,"E06000006":63180,"E06000007":104600,"E10000006":246514,"E07000026":48360,"E07000027":33007,"E07000028":53079,"E07000029":33916,"E07000030":26365,"E07000031":51788,"E11000001":1414020,"E08000001":142564,"E08000002":94008,"E08000003":281159,"E08000004":117599,"E08000005":110478,"E08000006":131692,"E08000007":144160,"E08000008":111837,"E08000009":116684,"E08000010":163839,"E10000017":604149,"E07000117":43947,"E07000118":59697,"E07000119":39869,"E07000120":40117,"E07000121":72362,"E07000122":45686,"E07000123":72494,"E07000124":29969,"E07000125":35393,"E07000126":54364,"E07000127":55353,"E07000128":54898,"E11000002":702634,"E08000011":71704,"E08000012":251081,"E08000014":133092,"E08000013":89518,"E08000015":157240,"E12000003":2728776,"E06000011":167888,"E06000010":131762,"E06000012":78392,"E06000013":85773,"E06000014":103887,"E10000023":304577,"E07000163":27731,"E07000164":44912,"E07000165":78384,"E07000166":28274,"E07000167":27393,"E07000168":53166,"E07000169":44717,"E11000003":703853,"E08000016":122739,"E08000017":156275,"E08000018":131172,"E08000019":293666,"E11000006":1152644,"E08000032":266598,"E08000033":103606,"E08000034":218888,"E08000035":390347,"E08000036":173204,"E12000004":2415416,"E06000015":127751,"E06000016":181356,"E06000018":170287,"E06000017":20584,"E10000007":396158,"E07000032":63073,"E07000033":39983,"E07000034":51439,"E07000035":35555,"E07000036":57006,"E07000037":45855,"E07000038":49919,"E07000039":53329,"E10000018":353079,"E07000129":50607,"E07000130":94602,"E07000131":46665,"E07000132":56357,"E07000133":25120,"E07000134":52275,"E07000135":27453,"E10000019":376368,"E07000136":35577,"E07000137":69918,"E07000138":49875,"E07000139":57695,"E07000140":47309,"E07000141":69039,"E07000142":46955,"E10000021":377468,"E07000150":36255,"E07000151":43369,"E07000152":47511,"E07000153":50937,"E07000154":112926,"E07000155":46715,"E07000156":39756,"E10000024":412366,"E07000170":63715,"E07000171":58805,"E07000172":57204,"E07000173":58086,"E07000174":54355,"E07000175":60747,"E07000176":59454,"E12000005":2967551,"E06000019":96483,"E06000051":161847,"E06000021":129933,"E06000020":90362,"E10000028":439045,"E07000192":50334,"E07000193":60487,"E07000194":51823,"E07000195":65020,"E07000196":56449,"E07000197":68726,"E07000198":48811,"E07000199":37396,"E10000031":287255,"E07000218":32804,"E07000219":64079,"E07000220":54402,"E07000221":63968,"E07000222":72003,"E11000005":1467046,"E08000025":571590,"E08000026":193181,"E08000027":158366,"E08000028":164440,"E08000029":106003,"E08000030":141374,"E08000031":132094,"E10000034":295579,"E07000234":49402,"E07000235":38738,"E07000236":42336,"E07000237":50429,"E07000238":64236,"E07000239":50438,"E12000006":3094152,"E06000055":85970,"E06000056":143088,"E06000032":108450,"E06000031":103650,"E06000033":90619,"E06000034":87275,"E10000003":329326,"E07000008":65365,"E07000009":44314,"E07000010":51409,"E07000011":89370,"E07000012":78869,"E10000012":731915,"E07000066":91199,"E07000067":74579,"E07000068":37172,"E07000069":43977,"E07000070":88847,"E07000071":98130,"E07000072":63869,"E07000073":42486,"E07000074":32043,"E07000075":43247,"E07000076":71594,"E07000077":44771,"E10000015":584211,"E07000095":46940,"E07000096":76583,"E07000242":73398,"E07000098":50406,"E07000099":65829,"E07000240":72570,"E07000243":43442,"E07000102":45449,"E07000103":48268,"E07000241":61327,"E10000020":450967,"E07000143":70410,"E07000144":64065,"E07000145":49504,"E07000146":74710,"E07000147":51531,"E07000148":71020,"E07000149":69727,"E10000029":378681,"E07000200":45153,"E07000201":33837,"E07000202":68460,"E07000203":51621,"E07000204":57129,"E07000205":64387,"E07000206":58095,"E12000007":4526035,"E09000007":137911,"E09000001":4925,"E09000012":142522,"E09000001-12":147447,"E09000013":93441,"E09000014":137843,"E09000019":123495,"E09000020":78701,"E09000022":166355,"E09000023":152633,"E09000025":190893,"E09000028":162255,"E09000030":173895,"E09000032":158701,"E09000033":138765,"E09000002":106958,"E09000003":198805,"E09000004":120850,"E09000005":171383,"E09000006":161089,"E09000008":188497,"E09000009":171783,"E09000010":164697,"E09000011":148230,"E09000015":125866,"E09000016":126019,"E09000017":155844,"E09000018":139184,"E09000021":88190,"E09000024":101943,"E09000026":155440,"E09000027":96541,"E09000029":100961,"E09000031":141424,"E12000008":4553812,"E06000036":61188,"E06000043":147993,"E06000046":70187,"E06000035":138286,"E06000042":134266,"E06000044":110557,"E06000038":83000,"E06000039":76130,"E06000045":130700,"E06000037":78445,"E06000040":75109,"E06000041":84808,"E10000002":267645,"E07000004":101346,"E07000005":46811,"E07000006":33918,"E07000007":85570,"E10000011":271718,"E07000061":50374,"E07000062":45408,"E07000063":50547,"E07000064":46973,"E07000065":78415,"E10000014":679293,"E07000084":87108,"E07000085":59130,"E07000086":65160,"E07000087":57055,"E07000088":42267,"E07000089":48293,"E07000090":61799,"E07000091":86863,"E07000092":47853,"E07000093":62140,"E07000094":61625,"E10000016":784442,"E07000105":64429,"E07000106":82150,"E07000107":56241,"E07000108":59291,"E07000109":52380,"E07000110":85846,"E07000111":59055,"E07000112":56569,"E07000113":75171,"E07000114":69472,"E07000115":65190,"E07000116":58648,"E10000025":347408,"E07000177":75283,"E07000178":78448,"E07000179":70137,"E07000180":68934,"E07000181":54606,"E10000030":588322,"E07000207":66420,"E07000208":39286,"E07000209":74547,"E07000210":42548,"E07000211":73305,"E07000212":43422,"E07000213":49418,"E07000214":44144,"E07000215":42956,"E07000216":61771,"E07000217":50505,"E10000032":424316,"E07000223":31243,"E07000224":78585,"E07000225":59044,"E07000226":57225,"E07000227":70762,"E07000228":73805,"E07000229":53652,"E12000009":2802870,"E06000022":97185,"E06000028":98666,"E06000023":236712,"E06000052":280755,"E06000053":1021,"E06000024":105552,"E06000026":131798,"E06000029":74868,"E06000025":143292,"E06000030":112706,"E06000027":67195,"E06000054":252710,"E10000008":396241,"E07000040":71871,"E07000041":66245,"E07000042":40711,"E07000043":47977,"E07000044":42273,"E07000045":65737,"E07000046":33926,"E07000047":27502,"E10000009":210385,"E07000048":24485,"E07000049":43991,"E07000050":35229,"E07000051":23739,"E07000052":50000,"E07000053":32941,"E10000013":316534,"E07000078":57847,"E07000079":44439,"E07000080":43112,"E07000081":64642,"E07000082":59319,"E07000083":47175,"E10000027":277249,"E07000187":56766,"E07000188":61084,"E07000189":83139,"E07000190":59167,"E07000191":17094};
		var lookup = {};
		for(la in LA2UTLA){
			id = LA2UTLA[la].id;
			if(!lookup[id]) lookup[id] = {'n': LA2UTLA[la].n, 'LA':{} };
			lookup[id].LA[la] = true;
		}
		
		function process(type,data,attr){
			type = "COVID-19";
			if(!this.data[type]) this.data[type] = {};

			if(data.length > 0){
				total = 0;
				for(var i = 0; i < data.length; i++){
					code = data[i]['GSS_CD'];
					// Fix for Cornwall and Hackney in the PHE data
					if(code && code == "E06000052") data[i]['GSS_CD'] = "E06000052-3";
					if(code && code == "E09000012") data[i]['GSS_CD'] = "E09000001-12";
				}

				for(var i = 0; i < data.length; i++){
					code = data[i]['GSS_CD'];
					if(code){
						cases = parseInt(data[i]['TotalCases'].replace(/\,/g,""));	// Remove commas from numbers
						total += cases;
						percapita = (populations[code]) ? 1e5*cases/populations[code] : 0;
						if(!this.hex.hexes[code]){
							if(lookup[code]){
								if(!lookup[code].LA) console.warn(lookup[code]);
								n = Object.keys(lookup[code].LA).length;
								lastring = '';
								for(var la in lookup[code].LA){
									lastring += '<li>'+(this.hex.hexes[la] ? this.hex.hexes[la].attributes.title : '?')+'</li>';
								}
								for(var la in lookup[code].LA){
									this.data[type][la] = {
										'cases': cases/n,
										'percapita': percapita,
										'title':data[i]['GSS_NM'],
										'desc':'<strong>Total cases:</strong> '+cases+'.<br /><strong>Population (2020):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.<br /><strong>Includes:</strong> <ul>'+lastring+'</ul>'
									};
								}
							}else{
								console.warn('No hex for '+code+' and no UTLA lookup');
							}
						}else{
							this.data[type][code] = {
								'cases': cases,
								'percapita': percapita,
								'title':data[i]['GSS_NM'],
								'desc':'<strong>Total cases:</strong> '+cases+'.<br /><strong>Population (2020):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.'
							};
						}
					}
				}
			}else{
				for(var r in this.hex.hexes) this.data[type][r] = {};
			}
			now = new Date();
			if(S('#updated').length == 0) S('#'+this.id).prepend('<div id="updated">?</div>');
			S('#updated').html('Total: '+total.toLocaleString());
		}
		
		function render(title,region,data,attr){
			var r;
			var p = "";
			var lbl = "";
			var img = "";
			var wincolour = "";
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
						if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
						if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale("Viridis8",_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					}
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
						if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
						if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale("Viridis8",_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					}
					return '';
				}
			}
		}
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
					this.regions[region] = _obj.hexes[region].attributes.title.toLowerCase();
				}
			}
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
				this.highlight(regions,n);
			};
			this.pick = function(value){
				console.log('pick',_obj.hexes[value].el);
				// Trigger the click event on the appropriate hex
				if(_obj.hexes[value]) _obj.hexes[value].el.trigger('click');
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

	/*
		this.autoscale = function(){
			var min = 1e100;
			var max = -1e100;
			for(var region in this.mapping.hexes){
				if(typeof this.values[region]==="number"){
					if(this.values[region] < min) min = this.values[region];
					if(this.values[region] > max) max = this.values[region];
				}
			}
			this.min = min;
			this.max = max;
			return this;
		}
	*/
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
								//this.paper.clip({'path':h.path,'type':'path'}).attr({'id':'hex-'+region+'-clip'});
							}
						}

						// Attach events
						this.labels[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
							.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.labels[region]},events.mouseout)
							.on('click',{type:'hex',hexmap:this,region:region,me:this.labels[region],data:this.mapping.hexes[region]},events.click);

					}
					this.setHexStyle(region);
					this.hexes[region].attr({'stroke':this.style['default'].stroke,'stroke-opacity':this.style['default']['stroke-opacity'],'stroke-width':this.style['default']['stroke-width'],'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
					//this.hexes[region].attr({'fill-opacity':this.style.selected['fill-opacity'],'fill':(this.hexes[region].selected ? this.style.selected.fill||this.hexes[region].fillcolour : this.style.default.fill),'stroke':'#ffffff','stroke-width':1.5,'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
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
			el = document.querySelector('input[name="view"]:checked');
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
			S('.infobubble').remove();
			S('body').removeClass('modal');
			return this;
		};
		
		this.openActive = function(region){

			var previous = this.hex.selected;
			var current = region;
			if(this.hex.search.active) this.hex.search.active = false;//this.hex.search.toggle();

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
					l = {'label':title,'class':cls,'color':''};
				}
				var c = (l.color||'');
				var t = (l.color ? Colour.getColour(c)['text'] : 'black');
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
			el = document.querySelector('input[name="view"]:checked');
			id = el.id;
			e.data.me.setType(id,el.getAttribute('data'),true);
		});

		S(document).on('keypress',function(e){
			//if(e.originalEvent.charCode==109) S('#savesvg').trigger('click');     // M
			//if(e.originalEvent.charCode==104) S('#save').trigger('click');     // H
		});
		

		this.loadResults = function(type,dtype,callback){
			if(!type) type = "GE2015-results";

			if(!this.data) this.data = {};
			this.data[dtype] = {};
			if(!this.hex.data) this.hex.data = {};
			this.hex.data[dtype] = {};

			if(this.views[type]){
				file = this.views[type].file;

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
						if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
					}
				});
				
				/*
				if(!_parent.cache[file]){
					console.info('Getting '+this.views[type].file +' for '+type+' ('+dtype+')');
					S().ajax(file,{
						'this': this,
						'callback': callback,
						'dataType':(this.views[type].file.indexOf(".json") > 0 ? 'json':'text'),
						'type': type,
						'dtype': dtype,
						'cache': (typeof this.views[type].live==="boolean" ? !this.views[type].live : true),
						'process': this.views[type].process,
						'success': function(d,attr){
							// Convert to JSON if CSV
							if(attr.dataType=="text") d = CSV.toJSON(d);
							attr.timestamp = getTimestamp(attr.header);
							_parent.cache[attr.url] = d;
							// Process the data
							attr.process.call(this,attr.type,d,attr);
							if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
						},
						'error': function(e,attr){
							console.error('Unable to load '+attr.url);
							attr.timestamp = "?";
							// Process the data
							attr.process.call(this,attr.type,[],attr);
							if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
						}
					});
				}else{
					console.log('Using cached data');
					// Process the data
					this.views[type].process.call(this,type,_parent.cache[file],{'this':this});
					if(typeof callback==="function") callback.call(this,type,dtype);
				}*/
				
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