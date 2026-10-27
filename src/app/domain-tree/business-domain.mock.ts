import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

import { BUSINESS_DOMAIN_PROPERTY, LEVEL_SEPARATOR } from './business-domain.service';

const RESPONSE_DELAY_MS = 300;
const PATH_FILTER = new RegExp(`${BUSINESS_DOMAIN_PROPERTY} = '((?:[^']|'')*)'`);

const SERIES_BY_SUBDOMAIN: Record<string, [id: string, title: string][]> = {
  'Biodiversity & Ecosystems^Ecosystem Condition & Restoration': [
    [
      'b7b1fa67-6591-48cf-b88b-a8357fe0383a',
      'Annual above ground vegetation productivity and trends',
    ],
    [
      '02741372-8b9a-4469-a169-773a098812cf',
      'Annual start of vegetation growing season and trends',
    ],
    ['e1a99795-cc88-46fc-90ac-dae2bec6960b', 'Annual vegetation growing season length and trends'],
    [
      'b967dae7-783b-44eb-a3eb-727e3b8fc060',
      'High Resolution Vegetation Phenology and Productivity (LAEA)',
    ],
    [
      'b6cc3b37-0686-4bb1-b8c3-3c08520743c3',
      'High Resolution Vegetation Phenology and Productivity (UTM WGS84)',
    ],
    ['47e902f8-8237-415b-91fc-6d1522b11417', 'Medium Resolution Net Primary Production'],
  ],
  'Biodiversity & Ecosystems^Habitats & Ecosystems': [
    ['11db8d14-f167-4cd5-9205-95638dfd9618', 'Biogeographical regions'],
    ['319eec5c-4aad-49ba-8b5a-a815372fcc75', 'Carbon storage'],
    [
      'd8b47719-9213-485a-845b-db1bfe93598d',
      'Conservation status of habitat types and species: datasets from Article 17, Habitats Directive 92/43/EEC reporting',
    ],
    ['d8dd768f-9bc4-4002-9386-0aef2c516f76', 'Corine biotopes'],
    ['e6c5dc03-4df2-4f43-a423-792ed9b4a9d3', 'Ecological groups of habitats and species'],
    ['573ff9d5-6889-407f-b3fc-cfe3f9e23941', 'Ecosystem types of Europe'],
    ['c8c4144a-8c0e-4686-9422-80dbf86bc0cb', 'Environmental zones in Europe'],
    [
      '638330ea-90e6-4e41-81ea-e70f25ae7117',
      'EUNIS habitat classification and crosswalks (tabular data)',
    ],
    ['1b87cddc-2593-40cc-a341-426246cc7c38', 'EUNIS habitat classification documentation'],
    ['ce3e4bf4-e929-404a-88c7-37f2c614fd1d', 'EUNIS habitat distribution plots (spatial data)'],
    [
      '220be9b6-bf67-4ea0-b976-65ca57a863b5',
      'EUNIS habitat probability - modelled distribution (spatial data)',
    ],
    [
      'adbb2781-2d4d-4a6c-8ce1-875bae0f6703',
      'EUNIS habitat suitability - modelled distribution (spatial data)',
    ],
    ['123d0c9a-a6fa-4f2d-b887-5d8e5468faed', 'EUNIS habitats'],
    ['de2276d8-e295-4cd7-89c9-88812065db87', 'European Red List of Habitats - enhanced by EEA'],
    ['b9399908-557a-47a8-954a-958dabeaf1b6', 'Extended wetland ecosystem layer'],
    [
      'd182caa1-7dfc-46d2-8c73-04516b6b1f7e',
      'Global Biodiversity Framework (GBF) - Indicator A.2 Extent of natural ecosystems in EU-27',
    ],
    ['5de8734b-1640-4af0-a4df-2778e39bc4e1', 'Green Infrastructure Elements'],
    ['242c4623-4827-4f14-8bad-0126a8e0df5b', 'Management of Annex I habitats'],
    [
      '1384d67c-0b62-4d61-bc0d-315e7042729f',
      'Results from survey on the status of habitat mapping in EEA member and cooperating countries and overview of INSPIRE habitat data inventory',
    ],
  ],
  'Biodiversity & Ecosystems^Invasive Alien Species': [
    [
      '0719ab41-814f-4598-8dc1-e8096856b9ca',
      'Invasive Alien Species reporting under EU Regulation 1143/2014',
    ],
  ],
  'Biodiversity & Ecosystems^Protected Areas': [
    [
      'a6f975ce-c4a8-4398-b80e-2354854e93f2',
      '[EU SDG 14_10] Surface of the marine protected areas',
    ],
    [
      '5bd82900-cb8e-43b9-9e8d-d00dd1edce10',
      '[EU SDG 15_20] Surface of the terrestrial protected areas',
    ],
    [
      '5e4aec6c-a05c-4bbf-9ccf-7b477cdaa2ef',
      'Marine Protected Areas (MPA) in EEA marine assessment areas',
    ],
    [
      '6fc8ad2d-195d-40f4-bdec-576e7d1268e4',
      'Natura 2000 data - the European network of protected sites',
    ],
    ['df7f30a8-9bdd-491f-b586-28fbf8b7a6cd', 'Protected Areas'],
    ['a95b6d2d-2d41-4c27-9d1d-d15bbf29d27e', 'World Protected Areas'],
  ],
  'Biodiversity & Ecosystems^Species': [
    [
      '2003bd10-b838-4f74-a4bc-365af5762f88',
      '[SEBI006] Proportion of local breeds classified as being at risk of extinction in Europe',
    ],
    ['eba8e170-5899-47e5-b4d9-d8e98ddb80a8', '[SEBI027] Common bird index in Europe'],
    ['9b3a6dc3-5d72-4dd3-be68-91ef6df2601d', '[SEBI028] Grassland butterfly index in Europe'],
    ['202f3c2e-54a9-4ff4-a1da-ed7ca524f634', 'European Red Lists of species'],
    [
      '96e1b9b1-ee94-4547-ad61-8059df7240bf',
      'Population trend of bird species: datasets from Article 12, Birds Directive 2009/147/EC reporting',
    ],
  ],
  'Circular Economy, Resources & Clean Industry^Production & Industry': [
    [
      '1250fc6c-cf9a-4158-a5e9-d7680d55e5b2',
      '[INDP003] Industrial pollutant releases to air in Europe',
    ],
    [
      '67b842c1-b87e-45ad-8428-80bfa4d489b2',
      '[INDP005] Industrial pollutant releases to water in Europe',
    ],
    [
      '0ed58e4f-2f9c-426c-aead-d78ad7fd375a',
      'Diffuse Air Releases (Art 8) under the European Pollutant Release and Transfer Register (E-PRTR) Regulation',
    ],
    [
      '9405f714-8015-4b5b-a63c-280b82861b3d',
      'Industrial Reporting under the Industrial Emissions Directive 2010/75/EU and European Pollutant Release and Transfer Register Regulation (EC) No 166/2006',
    ],
    [
      'b37addc8-b60e-4304-ae49-eba5828a9163',
      'Reported information on large combustion plants under the Energy Community Treaty',
    ],
  ],
  'Circular Economy, Resources & Clean Industry^Products & Consumption': [
    ['236e91f9-1809-4562-bbd4-5d813f661f35', 'Single-use Plastics'],
    ['4c13388f-a801-46d7-b05b-f7a388f18413', 'Weighted impacts of EU consumption'],
  ],
  'Circular Economy, Resources & Clean Industry^Secondary Materials & Circularity': [
    ['a115fb0a-5163-4456-83fa-ca79980cf706', '[SUSO001] Eco-innovation index'],
    ['a93425a2-6523-428b-8414-7ef176267db5', 'Circular Economy'],
    [
      '0686c969-093c-450a-ac59-847a53d83ee6',
      'Reuse flows according to the implementing decision (EU) 2021/19',
    ],
  ],
  'Climate Change Impacts, Risks & Adaptation^Adaptation & Resilience': [
    ['f9222c1e-3210-4315-bcb7-cb59ae1ac5d8', 'Adaptation Policies and Actions'],
    [
      '39c29341-50d9-4881-8f34-9ef3ebf3a645',
      'Cities participating in EU-funded projects on adaptation',
    ],
    ['4c7e0758-3710-418e-bb57-042f7caa1db0', 'City adaptation initiatives'],
    ['915c98d3-fda1-413a-a1f3-7b45434bba91', 'National adaptation and health policy review'],
    [
      'c7d0421d-8205-4b5f-add6-0557488c6e2a',
      'National climate change adaptation planning and strategies datasets',
    ],
    [
      '7f9cf593-8cbd-447b-9ddf-757791050b00',
      'NECPR: Progress to targets for adaptation (Annex III) dataset',
    ],
  ],
  'Climate Change Impacts, Risks & Adaptation^Climate Hazards & Extremes': [
    ['7c1baff0-2976-4e51-ba37-f3c27b1f824a', 'Annual number of Cooling Degree Days'],
    ['96c234ac-0d4b-4e20-aaf5-c5c0b9d92e9b', 'Area inundated with sea level rise'],
    ['3b8c4652-400b-48d8-86ff-3b925fd4bbbb', 'Areas burnt by wildfires'],
    [
      '22152085-847a-448b-a444-c112dea84612',
      'Change in the frequency of flooding events under projected sea level rise',
    ],
    ['1e006660-816d-49da-aaa8-d44cb305efee', 'Climate related hazards'],
    ['f2a24bf5-2a7c-42ec-a148-b2a7025a1782', 'Current and projections of Fire Weather Index'],
    ['b67d6289-bc0b-486b-b4ce-d08eb397d337', 'European Ground Motion Service (EGMS)'],
    ['f4d8f368-5707-4b62-aeb5-55d9c8a71a75', 'Forest fire danger'],
    ['e59749ca-6afb-4647-9c69-df607642c7a8', 'Probability of Hot days and tropical nights'],
    ['b6b9d4f4-80a6-4204-ba03-907c8a524452', 'Projected changes in heavy precipitation in winter'],
    [
      'b85129e3-d53e-4d06-943d-c9fa3bf5391f',
      'Soil moisture deficit during vegetation growing season',
    ],
  ],
  'Climate Change Impacts, Risks & Adaptation^Climate Impacts & Vulnerability': [
    ['1fac8253-3df7-4408-b5fa-a6f2dc524182', '[EU SDG 13_40] Climate related economic losses'],
    ['c7c868d8-95dc-4f23-9dde-4cdc2738cc4d', '[EU SDG 15_42] Drought impact on ecosystems'],
    ['771f1ecf-b5ba-403b-8e00-08b23f9ba04c', 'Adaptive Capacity'],
    [
      'e0f67f9d-e3c7-4c89-b752-a40e72af6ccb',
      'Climate change impacts, exposures, and vulnerabilities, Lancet Countdown indicators',
    ],
    [
      '7b6f98a9-8b45-4510-a3b0-90a1f2f0401e',
      'Climatic suitability index modelling for tiger mosquito (Aedes albopictus)',
    ],
    [
      '77389680-ecd2-4f56-926f-8106061a5570',
      'Economic losses from climate-related extremes in Europe',
    ],
    ['890fbce5-f06e-495a-88c7-b26707c2653f', 'Impacts of Climate Change'],
    ['5884f314-84a9-4f53-a745-d94d7a53e8b1', 'Vulnerability to climate change'],
  ],
  'Climate Change Impacts, Risks & Adaptation^Climate Risk': [
    ['3cba3946-2f1c-48eb-9ede-dfc476f0f17f', 'Exposure to climate hazards'],
  ],
  'Climate Change Mitigation & Energy^Energy Production & Supply': [
    [
      '1fd08152-1371-4274-8091-b50467738376',
      'Approximated estimates for the share of gross final consumption of renewable energy sources',
    ],
    ['31d10900-5930-492e-907d-235ddb0277aa', 'Fuel Quality Directive'],
    [
      'becb2c5e-1597-4da6-8b21-cfc32de70f14',
      'NECPR: Additional Reporting Obligations in the area of Renewable Energy (Annex XVI) dataset',
    ],
    [
      'a5604568-e36e-4f8e-aa19-6a767862ec23',
      'NECPR: Progress to targets for renewable energy (Annex II) dataset',
    ],
  ],
  'Climate Change Mitigation & Energy^Energy Transition & Decarbonisation': [
    [
      '15c54e0c-6b5f-4a9f-9d8d-12003136c0fd',
      'Application of the Emissions Trading Directive 2003/87/EC (Article 21)',
    ],
    ['de803073-7dff-4c75-af40-166ba6c16e95', 'CO2 Intensity of Electricity Generation'],
    [
      '56d1a80f-5a49-4c90-9a3b-4054a5705da9',
      'Estimated effects of increased RES consumption since 2005 on fossil fuels and GHG emissions',
    ],
    [
      '6f1efaf1-ae32-48cb-b962-0891f84b1f5f',
      'Integrated Climate and Energy Policies and Measures (PaMs)',
    ],
    [
      'addd66ff-d8a9-49da-a8f3-757241c9df22',
      'National systems for policies and measures and greenhouse gas projections',
    ],
  ],
  'Climate Change Mitigation & Energy^Energy Use & Efficiency': [
    [
      'd4943227-c1c2-430d-8cb3-bebc2dd8666c',
      'Approximated estimates for the primary and final consumption of energy',
    ],
    [
      '8a5b8e36-7a64-49cc-9578-b1970eaf0b3b',
      'NECPR: Additional Reporting Obligations in the area of Energy Efficiency (Annex XVII) dataset',
    ],
    [
      '0a0ecbc0-cc09-4f20-aa73-955bcb975773',
      'NECPR: Progress to targets for energy efficiency (Annex IV) dataset',
    ],
  ],
  'Climate Change Mitigation & Energy^Greenhouse Gas Emissions': [
    [
      'd22b842a-53f7-4c63-aa94-74d5fa1f4d40',
      '[EU SDG 13_10] Domestic net greenhouse gas emissions (including LULUCF)',
    ],
    [
      '7a7b55ec-51fd-4b95-94a6-533470c142a0',
      '[EU SDG 13_10a] Domestic greenhouse gas emissions (excluding LULUCF)',
    ],
    [
      '4b099c9b-bfb9-4499-9140-7b1ffa639b2f',
      '[EU SDG 13_11] EU net greenhouse gas emissions (according to EU climate policies and targets)',
    ],
    [
      '4732d4ec-960d-4e25-aece-8a3ca52ce170',
      '[EU SDG 13_21] Net greenhouse gas emissions of the Land use, Land use change and Forestry (LULUCF) sector',
    ],
    [
      'f6e68f73-b494-4f8c-8c73-8a153a53f64a',
      'Approximated Greenhouse gas emissions inventories datasets',
    ],
    [
      '98f04097-26de-4fca-86c4-63834818c0c0',
      'European Union Emissions Trading System (EU ETS) data from the Union Registry',
    ],
    ['40c24059-bdc4-4f3c-b363-6e974b7ae769', 'Fluorinated greenhouse gases'],
    [
      '3b7fe76c-524a-439a-bfd2-a6e4046302a2',
      'Greenhouse gas emissions and removals inventories datasets',
    ],
    [
      'e9ce7eb8-8439-4f2f-96f8-279a36c5fa7a',
      'Greenhouse gas emissions under the Effort Sharing Legislation',
    ],
    [
      '4b8d94a4-aed7-4e67-a54c-0623a50f48e8',
      'National projections of anthropogenic greenhouse gas emissions by sources and removals by sinks dataset',
    ],
    [
      '440d87de-8b0b-4609-a7e9-0bbd8b6dcf2a',
      'NECPR: Progress to targets for greenhouse gas emissions and removals (Annex I) dataset',
    ],
  ],
  'Climate Change Mitigation & Energy^Mitigation Finance': [
    [
      'fbc1e575-35ec-44f5-b669-3066fd885d93',
      '[EU SDG 13_70] Green bond issuance by type of issuer',
    ],
    [
      'a4443de0-8ff0-435c-99a9-72634327aae6',
      '[EU SDG 13_70a] Green bond issuance by corporates and governments',
    ],
    ['9cde4c5f-3365-4715-b4ef-ce2a4efade62', '[SUFI002] Fossil fuel subsidies in Europe'],
    [
      'd702153d-e2d0-4a0b-a2e1-06ed3a43d07c',
      "Member States' use of revenues from the auctioning of EU ETS allowances",
    ],
    ['ad7d6e00-cf43-40f1-9794-dad9849c7c9c', 'Support to developing countries'],
    [
      'b7ed573c-10f0-4a10-b029-afb87920f622',
      'Use of revenues from carbon price mechanisms datasets',
    ],
  ],
  'Freshwater & Water Management^Floods & Droughts': [
    ['254a8583-e34f-4324-bbdf-1fbda7a3d222', 'EEA potential flood-prone area extent'],
    [
      '9b7b6eb4-ac38-40a8-bb91-7c92da523bc9',
      'Floods Reference Spatial Datasets reported under Floods Directive',
    ],
  ],
  'Freshwater & Water Management^Snow & Ice': [
    [
      '5283d0e5-222b-42bf-9a1f-23205bef6060',
      'Copernicus High Resolution Water Snow and Ice Monitoring layers',
    ],
    ['b5c68a06-5dcf-42e5-baad-94f861189f91', 'High Resolution River and Lake Ice Extent'],
    ['45e60a9f-f08b-47a9-97b6-21805cf22940', 'High Resolution Snow and Ice'],
    [
      '603f419b-f9ca-4642-b043-4a333cc91b02',
      'High Resolution Snow and Ice Monitoring: Persistent Snow Area',
    ],
  ],
  'Freshwater & Water Management^Water Bodies & Ecological Status': [
    [
      'd6981ae9-938d-43a9-9c75-c694149f4c8e',
      '[EU SDG 14_40] Bathing waters with excellent quality',
    ],
    ['c3858959-90da-4c1b-b9ca-492db0e514df', 'Bathing Water Directive - Status of bathing water'],
    ['7bd881f0-59ca-4f0a-a43c-7e0cd0c66d6c', 'Waterbase - Biology'],
    ['c2c99dcc-ebe2-4dd7-9248-0219a82f6eb3', 'WISE EIONET Spatial Datasets'],
    ['dc1b1cdf-5fa0-4535-8c89-10cc051e00db', 'WISE Water Framework Directive Database'],
    [
      '2f198cd5-9cc6-4d4f-a2a1-3ad3f647aea5',
      'WISE WFD groundwater body horizons reported under Water Framework Directive',
    ],
    [
      '06c3dcab-77bd-462b-b19e-32ac72d9155d',
      'WISE WFD Protected Areas under the Water Framework Directive',
    ],
    [
      '1003d7ae-bb0b-4828-bccf-0093134b094c',
      'WISE WFD Quality Elements status reported under Water Framework Directive',
    ],
    [
      'a50d10f6-e0f6-496b-a6e2-27eb5ad204e8',
      'WISE WFD Reference Spatial Datasets reported under Water Framework Directive',
    ],
    [
      '5ee22fbc-fa6c-49a0-836c-9cbd202eaff9',
      'WISE WFD Reference Spatial Datasets reported under Water Framework Directive 2010',
    ],
    [
      'ff3e1971-494d-4fa5-a57c-660e0f35d451',
      'WISE WFD Reference Spatial Datasets reported under Water Framework Directive 2016',
    ],
    [
      '73ab1aa2-2f69-4881-941d-4429875ca715',
      'WISE WFD Reference Spatial Datasets reported under Water Framework Directive 2022',
    ],
    ['3ccf2fe3-40e3-4968-a54c-5a59510fa5a3', 'WISE WFD surface water body centrelines'],
  ],
  'Freshwater & Water Management^Water Quality & Pollution': [
    ['bd6a37dd-ddec-4446-8d03-95fbaf0896e9', '[EU SDG 06_30] Biochemical oxygen demand in rivers'],
    ['ff63d80d-a1e8-414b-9a42-6b35d54fff30', '[EU SDG 06_40] Nitrate in groundwater'],
    ['473eace8-03e8-4265-8ba2-c0a3f7e5431f', '[EU SDG 06_50] Phosphate in rivers'],
    [
      'b8ac388d-ca32-4074-8d6d-df81d1bea863',
      '[EU SDG 06_70] Pesticides in rivers, lakes and groundwater in Europe',
    ],
    ['5bd950b1-52b9-42f3-b0d7-bf51ff3056b7', 'Waterbase - Emissions'],
    ['fbf3717c-cd7b-4785-933a-d0cf510542e1', 'Waterbase - Water Quality ICM'],
    ['208518d1-ffe3-4981-9cae-13264cd9c32c', 'Waterbase WISE State of Environment (SoE)'],
    ['f618b4b7-6464-40b4-9a61-a1115affda0b', 'WISE Statistics'],
  ],
  'Freshwater & Water Management^Water Resources & Hydrology': [
    [
      '6c086807-f88f-4978-9823-c4b17bb52400',
      '[EU SDG 06_60] Water exploitation index, plus (WEI+)',
    ],
    ['2e782ca5-c7b2-4b48-8928-03031b642176', 'EU-Hydro'],
    [
      'a9844d0c-6dfb-4c0c-a693-7d991cc82e6e',
      'European catchments and Rivers network system (Ecrins)',
    ],
    ['8a575e54-c51c-430b-99ba-3ba809f6b949', 'HRL Water and Wetness'],
    [
      'ed2490e5-ac7f-4061-a8af-e6648b047ba8',
      'Hydrographic vector features digitised from historical topographic maps',
    ],
    [
      'bf73da3d-40dc-4f18-9ff0-2ccc7acb53ed',
      'Seasonal Water Exploitation Index plus (WEI+) at country level',
    ],
    [
      '5a980253-9e62-4004-830e-ae7a985237b9',
      'Seasonal Water Exploitation Index plus (WEI+) at sub unit level',
    ],
    [
      '135a19fd-f799-44d7-bbd0-30ccade42553',
      'Seasonal Water Exploitation Index plus (WEI+) at the river basin scale',
    ],
    ['4d59470c-b3bd-4b06-9cc0-2515b29f56cc', 'Water exploitation Index plus (WEI+)'],
    ['a4324714-784a-4763-b8b9-b8939ead87fe', 'Waterbase - Water Quantity'],
    ['e64928db-e6c1-4acc-bab0-7722bb50075f', 'WISE Water Accounts for Europe'],
  ],
  'Freshwater & Water Management^Water Use, Supply & Sanitation': [
    ['441544a8-1d7c-4bbf-867b-c255c8fcdfc5', 'Total annual use of water (m3 per capita)'],
    ['7c22ae09-4827-4a7b-a190-1504a22cf094', 'Waterbase - UWWTD: Agglomerations'],
    ['21874828-fa7a-4e7e-8a0a-52ec7d92f99f', 'Waterbase - UWWTD: Discharge Points'],
    ['6ffd0af1-64eb-4cce-9970-0028e01ee64e', 'Waterbase - UWWTD: Treatment Plants'],
    [
      '6244937d-1c2c-47f5-bdf1-33ca01ff1715',
      'Waterbase - UWWTD: Urban Waste Water Treatment Directive – reported data',
    ],
  ],
  'Land, Agriculture, Soil & Forestry^Agriculture & Food Systems': [
    ['a0aacdd2-46b2-485a-ac49-162936d84395', 'Agricultural area'],
    ['228b4a99-f85a-465a-8188-dcdd9d5d3238', 'Grazing livestock in semi-natural areas'],
    ['1bd26e8f-8ea0-45e0-b6bf-9ed2baff5d28', 'High Nature Value (HNV) farmland'],
    ['2ab2ccc4-4a75-4780-9817-9ce001f98bde', 'HRL Crop Types'],
    ['fb798311-a581-4437-bae2-16d503677f02', 'HRL Croplands'],
    ['25c2a639-60c9-48f9-a1dd-6fca56eb5c21', 'HRL Cropping Patterns'],
    ['69a59cd8-d22f-4b76-a672-867ce92e1855', 'HRL Grassland Mowing Events'],
    ['b3ea4f87-3472-4c29-9724-78585b416188', 'Intensification trend of agroecosystems'],
    ['e2b9e0ca-bbb1-4102-9f70-8e8b4e5fbaac', 'Total and trends nutrient input to agroecosystems'],
    ['c8187fa6-fada-43a3-b017-e567e045525d', 'Woody landscape features on agricultural land'],
  ],
  'Land, Agriculture, Soil & Forestry^Forests & Forestry': [
    ['e43ec245-8c6d-4c17-8818-a4ed96d290dd', 'Carpathian Environment Outlook (KEO)'],
    [
      '2c26ccc9-0ae2-4b42-bd83-7e1b68dfe6e4',
      'Copernicus HRL Forests and Corine Land Cover Forest products',
    ],
    ['a63402db-544b-4dda-ab9a-b5a044ad2f92', 'Forest Area based on Copernicus HRL Forest products'],
    [
      '9f23dfd3-8581-4142-8fc1-1cafa431dd0f',
      'Forests and other wooded land in EEA38 member states',
    ],
    ['7e5a685c-7890-47da-910b-2942f06a287a', 'HRL Dominant Leaf Type'],
    ['3c73f63b-fc23-4c87-be10-3aeceb870971', 'HRL Forest Type'],
    ['88cc412e-3012-42ff-93df-9f3bd3a8bebe', 'HRL Tree Cover and Forests'],
    ['b8a5a51f-0c8e-44bc-bac2-2afa6b9444da', 'HRL Tree Cover Density'],
    ['22f3116c-9d23-423e-86aa-6baa24db76fc', 'Natural assemblage tree species indicator dataset'],
    ['f56fe6f0-f29f-49d5-8e00-e7730f0fd105', 'Pressures on forest ecosystems'],
    [
      '5e834abf-808e-40f0-a32c-2a70d326f4fc',
      'Richness index of forest - related species and habitats',
    ],
  ],
  'Land, Agriculture, Soil & Forestry^Land Cover & Land Use': [
    ['d62ade7a-9c9c-405e-b88e-6ce0410d6a4f', 'CLCplus Backbone'],
    ['224d8866-50cd-4931-bd32-7fd665599523', 'CLCplus Instances'],
    ['a5144888-ee2a-4e5d-a7b0-2bbf21656348', 'Corine Land Cover'],
    ['a55d9224-a326-4cb1-9b9c-3a324520341a', 'Corine Land Cover accounting layer'],
    ['95ea46c6-59ca-4c2c-9c9e-cd529035b914', 'Corine Land Cover in Eastern Partnership Countries'],
    ['48b6f8a7-9e5a-4865-bd05-59c29348b5fb', 'European Mountain areas'],
    ['e268380f-2b92-4a2c-93fd-17f3d9be42a4', 'GlobCorine'],
    ['b373dc38-325f-483d-9c6c-efb0d50b2ddb', 'HRL Grassland and Herbaceous'],
    ['82d8f687-3ef1-4b84-89ef-5a1e646137f8', 'HRL Grasslands'],
    ['a3bb6014-54a8-4bd4-871e-e6718e8f2726', 'HRL Small Landscape Features'],
    ['c08082b2-4640-4b55-bc2e-f14cc0d685e6', 'Land Accounts (LEAC) PHARE Data'],
    [
      '6cc26c0a-fc1a-45e7-ac62-7438f186b7dc',
      'Land Cover and Land Cover Change in selected hot-spots outside Europe',
    ],
    ['bb4a1a65-fba0-4b54-bb6e-848c69728332', 'Land cover flows'],
    [
      '9d0b51f9-047d-4af1-89eb-3756e46ffc53',
      'Landscape fragmentation Effective Mesh Density time series',
    ],
    ['886719fc-8112-4cea-8579-33819dea8415', 'Landscape fragmentation Effective Mesh Size'],
    ['dcaf2e2c-e555-4eeb-a4a7-fb589e518027', 'LEAC reference mask'],
    ['85448806-1cd8-4fdf-95f5-fe13e1371943', 'Riparian Zones'],
    ['e006507d-15c8-49e6-959c-53b61facd873', 'Urban Atlas'],
  ],
  'Land, Agriculture, Soil & Forestry^Soil': [
    ['33029ced-43e7-421a-8df1-1660fd590b74', '[EU SDG 11_32] Soil sealing index'],
    ['1f2be20d-437a-46b9-af15-77b12868c52e', 'Carbon accumulation rates in coastal soils'],
    [
      'edbbd466-b845-4e4c-acf9-905ec5e28766',
      'Concentrations of heavy metals and nutrients in agricultural soils',
    ],
    ['7610cfd3-7af0-4f11-8622-26ec9c1a6fb4', 'EIONET questionnaire on national contaminated sites'],
    ['768fc389-3649-4c7a-a095-90ec6f87670e', 'ESDAC Topsoil Soil Organic Carbon (LUCAS) for EU25'],
    ['39f5e4ac-d80a-4e6e-ab89-2feb74907eb0', 'Global Soil Organic Carbon Estimates'],
    ['b7a037c5-4c0a-47df-8d5d-17d0ce8e1fee', 'Harmonized imperviousness time series'],
    ['7c172c04-3a6a-4939-b27b-dc65e13b0690', 'Heavy metals in European topsoils'],
    [
      '423502a1-8839-4768-bf86-c89658e2226a',
      'High Resolution Layer: Imperviousness Density Accounting Layer',
    ],
    ['e613abf4-c655-4bd2-a5d4-7770dc32da9c', 'HRL Imperviousness'],
    ['f4139814-3808-4c88-b27b-9a69c6f86c16', 'Natural susceptibility to compaction'],
    [
      '412aa739-0b2e-4482-b74d-dcf84fb29f04',
      'Potential of soils to serve as a soil biodiversity pool',
    ],
    ['19de0c87-3f65-4922-aa81-7b3e339a9c0c', 'Saline and Sodic Soils in the European Union'],
    [
      '0abe80be-f39f-4435-b270-2c849ac7a172',
      'Soil maps of European Food Safety Authority Data (EFSA)',
    ],
  ],
  'Land, Agriculture, Soil & Forestry^Urban & Settlement Structure': [
    ['42783031-34d5-4b38-b9ba-a0783723053c', 'European Settlement Map'],
    ['bf175d04-8441-4ed2-b089-9636ecf19353', 'Urban Morphological Zones within cities'],
    ['2ca9f8a9-095a-4b83-87d1-e7751bc0484e', 'Urban Sprawl (LEAC Grid)'],
  ],
  'Marine, Coastal & Fisheries^Coastal Systems': [
    ['46fccbdc-d848-47a7-a58d-2aabc21c07cf', 'Coastal Zones'],
    ['f8f0730f-152a-44a1-8ca4-56a7787d1889', 'Coastal zones derived from Corine Land Cover'],
    ['af40333f-9e94-4926-a4f0-0a787f1d2b8f', 'EEA coastline for analysis'],
    ['ba6d7fe6-c79f-48c7-b738-f78260730538', 'Eurosion – Coastal erosion and defence'],
    ['76fdf8b2-aa1a-4507-894b-f4308667ed43', 'Lacoast - Land cover change in coastal areas'],
  ],
  'Marine, Coastal & Fisheries^Marine Ecosystems & Biodiversity': [
    ['fa0c9a5d-90e4-4c56-bc54-7382309441b0', "Biodiversity condition in Europe's seas (BEAT+)"],
    ['b6b9f3bc-463c-4971-99f2-12ec21c3bf58', "Ecosystem health status in Europe's seas (MESH+)"],
    [
      'c59a8b43-15e0-4823-9095-14e8663d8dad',
      'Temporal development of the Lusitanina/Boreal species ratio',
    ],
  ],
  'Marine, Coastal & Fisheries^Marine Pressures & Pollution': [
    ['eab57bb2-dbe0-47bb-aa29-903d2cc1e841', 'Assessment of contamination status using CHASE+'],
    [
      'da908581-778e-4b3f-b1f4-1fbbd9642ffb',
      "Combined effects of pressures on marine species and habitats in Europe's seas",
    ],
    ['7a6f335f-97c4-4eaf-820c-8b4a091047ce', "Eutrophication in Europe's seas (HEAT+)"],
    ['fc3a040f-ee73-4747-97c1-458c02108cf5', 'Marine litter'],
    ['8775b34c-bc10-4a6c-b446-f01b521bba85', "Marine non-indigenous species in Europe's seas"],
    [
      'bbf623f8-fc12-4aa6-9cb9-20823ffd6178',
      "Multiple pressures and their combined effects in Europe's seas",
    ],
  ],
  'Marine, Coastal & Fisheries^Marine Use & Management': [
    ['940c7194-ce7b-45ba-ad22-0d47cc2b5c9e', 'EEA marine assessment areas'],
    ['5b2ef50c-7823-4f99-94bf-23956eed3c34', 'EEA marine assessment areas buffer zones'],
    ['a35e113a-fe10-4e20-9c49-7dc5b47b16b5', 'EEA Marine Assessment Grid'],
    ['8586cc6f-6f93-4a19-941d-57f1f6d44bdf', 'EEA Marine waters for analysis'],
    [
      'bbd22b73-946e-45fc-b88c-981bf739fcff',
      'Marine Reporting Units used in Marine Strategy Framework Directive (MSFD)',
    ],
    [
      'af3978b8-2c4a-4ebd-bc7a-be969ae7660e',
      'Marine waters used in Marine Strategy Framework Directive (MSFD)',
    ],
    ['7144675c-5c84-456f-92e0-8f832239d880', 'MSFD regions and subregions'],
    ['d09a1d82-8e11-4448-85a5-e2613aeccf57', 'Regional seas around Europe'],
  ],
  'Pollution & Environmental Health^Air Pollutant Emissions': [
    ['553fba18-e6ff-46b2-9f91-08fae87adf12', '[EU SDG 02_60] Ammonia emissions from agriculture'],
    [
      'c26ff55c-3497-4ab8-9290-3cb7a8b95a87',
      'Large point source (LPS) emissions data by source category (GNFR) - NECD and CLRTAP',
    ],
    [
      '2f8a584f-3175-42e5-ae33-a08c5535c9ae',
      'National Emission reduction Commitments Directive (NECD) policies and measures database',
    ],
    [
      'dcc8cc36-e670-4b05-87c4-b29385e23d85',
      'National Emission reductions Commitments (NEC) Directive emission inventory data',
    ],
    [
      '5be6cebc-ed2b-4496-be59-93736fc4ad78',
      'National emissions reported to the Convention on Long-range Transboundary Air Pollution (LRTAP Convention)',
    ],
    [
      '46576efa-7f0f-4fca-a606-97c40641078c',
      'National gridded data of emissions by source category (GNFR) - NECD and CLRTAP',
    ],
  ],
  'Pollution & Environmental Health^Air Quality': [
    ['778ef9f5-6293-4846-badd-56a29c70880d', 'Air Quality download service'],
    ['3b390c9c-f321-490a-b25a-ae93b2ed80c1', 'Air Quality e-Reporting (AQ e-Reporting)'],
    ['3a558715-59c0-41ea-9045-d21ad9c99025', 'Air Quality Zones and Agglomerations'],
    [
      'b51e1091-4459-4a1e-8dbc-dd7a30949b90',
      'European air quality data (interpolated data and station points)',
    ],
    [
      '82700fbd-2953-467b-be0a-78a520c3a7ef',
      'European air quality data (interpolated data) - Series',
    ],
    ['58747c05-5e7d-4d2a-90cd-a6ab46057fa0', 'Interpolated air quality data'],
    ['34bd02bf-be87-4122-b9a2-1e846c27a786', 'NO2, European air quality data, (interpolated data)'],
    ['4850bb5f-5a73-4e0e-9169-60fd3a59996b', 'NOx, European air quality data, (interpolated data)'],
    ['c816f363-a892-4f62-86d1-0460437bc023', 'O3, European air quality data, (interpolated data)'],
    [
      'abc66a42-b595-4e0f-9772-b862dc454e9f',
      'PM10, European air quality data, (interpolated data)',
    ],
    [
      '938bea70-07fc-47e9-8559-8a09f7f92494',
      'PM2.5, European air quality data, (interpolated data)',
    ],
    ['320a0d39-430c-44a4-8e15-e6894e50edc8', 'POD, European air quality data, (interpolated data)'],
  ],
  'Pollution & Environmental Health^Chemicals': [
    ['3bc5984e-6efd-4f21-b429-b34eb8faef3f', 'Ozone-depleting substances'],
  ],
  'Pollution & Environmental Health^Environmental Exposure & Health': [
    [
      '6628e569-49a6-412f-a6a9-cca8ecafee5e',
      '[EU SDG 11_52] Premature deaths due to exposure to fine particulate matter (PM2.5)',
    ],
    ['49930245-dc33-4c47-93b8-9512f0622ebc', 'Air Quality Health Risk Assessments'],
    ['f735fb1c-895d-4ea4-9dd7-fc7fdff6fbc8', 'Burden of disease of air pollution'],
  ],
  'Pollution & Environmental Health^Environmental Noise': [
    [
      '6da6c1ac-0f68-469c-b2eb-635869810618',
      '[TERM005] Urban population exposed to harmful levels of long-term road traffic noise',
    ],
    [
      'c952f520-8d71-42c9-b74c-b7eb002f939b',
      'Noise data reported under Environmental Noise Directive (END)',
    ],
  ],
  'Reference Data^Administrative Boundaries': [
    ['8569f5ec-49bd-420f-8877-32b09cae12c7', 'Copernicus Border Expert'],
    ['4ffc29d4-d09c-41f1-924b-c6abf77a1fbf', 'Copernicus Boundary Layers with 250m buffer'],
    ['94438969-2dd5-4ba3-b708-e4d29a8b7699', 'EEA Administrative Boundaries'],
    ['4a221224-6280-431b-9324-25c7ef9ff30e', 'EuroBoundaryMap'],
    ['1438a2d6-ec0b-4df4-a8c4-ce83b135bfa3', 'Functional Urban Area (FUA) boundaries'],
    [
      'fce1a084-df72-4331-9919-fb0b46c58d3c',
      'Geographic Information System of the European Commission (GISCO)',
    ],
    ['0485e41f-77ea-429c-be98-4097b16786f2', 'Local Administrative Units (LAU)'],
    [
      'a5857b35-9d27-4d42-94b7-4d141ee5b550',
      'Refined degree of urbanisation in Europe (DEGURBA level 2)',
    ],
  ],
  'Reference Data^Basemaps': [
    ['0c73bf39-37c5-4017-8fc0-5489cfcfddc2', 'EEA basemap'],
    ['b555b6e2-97e7-47dc-b78c-ae079e310970', 'EEA map templates for static maps'],
    ['0ab52ae4-eeb5-47b8-9ac3-ad518cbef455', 'European Image Mosaic'],
    ['9d387a53-a4fa-4f1d-91d6-f33d96614d4d', 'Natural Earth Data'],
  ],
  'Reference Data^Elevation': [
    ['357f686f-1939-4652-8e79-c9ac7a1c5da6', 'Elevation map of Europe based on GTOPO30'],
    [
      'd0a1dedf-e1df-4e36-a80c-5667002b4057',
      'SRTM90 - The Shuttle Radar Topography Mission DEM100',
    ],
  ],
  'Reference Data^Reference Grids': [
    ['3c362237-daa4-45e2-8c16-aaadfb1a003b', 'EEA Reference grid'],
    ['b1343670-afaf-4eae-b2fd-a35c1f28a259', 'EMEP grids reprojected by EEA'],
    [
      '7138cfda-b7cf-471b-b126-9505aba3e48d',
      'European and Mediterranean Basin extract of LandScan Global Population Database',
    ],
    ['790f8af5-55a2-4e29-9222-ba4793824130', 'Population in cities'],
  ],
  'Transport & Mobility^Maritime & Inland Waterway Transport': [
    ['d8d2c4f2-e529-4d98-bdce-3e16b9bf0064', 'Emissions in European shipping areas'],
    [
      'fe16b236-694d-4c58-aa0e-505856557f17',
      'European Maritime Transport Environmental Report 2021 - underpinning datasets',
    ],
  ],
  'Transport & Mobility^Road Transport': [
    [
      '5d252092-d328-40d8-bca2-c0734bd6143b',
      '[EU SDG 13_31] Average CO2 emissions per km from new passenger cars',
    ],
    [
      'c52f7b51-c1cf-43e5-9a66-3eea19f6385a',
      'Monitoring of CO2 emissions from heavy-duty vehicles - Regulation (EU) 2018/956',
    ],
    [
      '13f5615a-0524-4a18-9666-7165e55c11ba',
      'Monitoring of CO2 emissions from heavy-duty vehicles - Regulation (EU) 2019/1242',
    ],
    [
      'fa8b1229-3db6-495d-b18e-9c9b3267c02b',
      'Monitoring of CO2 emissions from passenger cars Regulation (EU) 2019/631',
    ],
    [
      '9636827c-bd0c-40f5-814e-c4065c11c9a0',
      'Monitoring of CO2 emissions from vans - Regulation (EU) No 2019/631',
    ],
    ['1c1ffad2-34c3-471b-bd69-dd013cdd7b80', 'Real world emissions from cars and vans'],
  ],
};

const SUBDOMAIN_PATHS = Object.keys(SERIES_BY_SUBDOMAIN);

const domainOf = (path: string): string => path.slice(0, path.indexOf(LEVEL_SEPARATOR));

const seriesCount = (path: string): number => SERIES_BY_SUBDOMAIN[path].length;

const facetBuckets = (): { value: string; count: number }[] => {
  const domains = [...new Set(SUBDOMAIN_PATHS.map(domainOf))];
  return [
    ...domains.map((domain) => ({
      value: domain,
      count: SUBDOMAIN_PATHS.filter((path) => domainOf(path) === domain)
        .map(seriesCount)
        .reduce((total, count) => total + count, 0),
    })),
    ...SUBDOMAIN_PATHS.map((path) => ({ value: path, count: seriesCount(path) })),
  ];
};

const seriesUnder = (path: string) =>
  SUBDOMAIN_PATHS.filter((candidate) => candidate === path || domainOf(candidate) === path)
    .flatMap((candidate) =>
      SERIES_BY_SUBDOMAIN[candidate].map(([id, title]) => ({
        id,
        type: 'Feature',
        geometry: null,
        properties: { title, [BUSINESS_DOMAIN_PROPERTY]: [domainOf(candidate), candidate] },
      })),
    )
    .sort((a, b) => a.properties.title.localeCompare(b.properties.title));

const respond = (body: object) =>
  of(new HttpResponse({ status: 200, body })).pipe(delay(RESPONSE_DELAY_MS));

export const mockBusinessDomains: HttpInterceptorFn = (request, next) => {
  if (request.params.get('facets') === BUSINESS_DOMAIN_PROPERTY) {
    return respond({
      type: 'FeatureCollection',
      features: [],
      numberMatched: SUBDOMAIN_PATHS.map(seriesCount).reduce((total, count) => total + count, 0),
      facets: {
        [BUSINESS_DOMAIN_PROPERTY]: {
          type: 'term',
          property: BUSINESS_DOMAIN_PROPERTY,
          buckets: facetBuckets(),
        },
      },
    });
  }
  const path = PATH_FILTER.exec(request.params.get('filter') ?? '')?.[1];
  if (path === undefined) return next(request);
  const features = seriesUnder(path.replaceAll("''", "'"));
  return respond({
    type: 'FeatureCollection',
    features,
    numberMatched: features.length,
    numberReturned: features.length,
  });
};
