export interface PostalOfficeInfo {
  name: string;
  district: string;
  state: string;
  deliveryStatus: string;
}

export interface PinCodeLookupResult {
  success: boolean;
  postOfficeName?: string;
  postOffices: PostalOfficeInfo[];
  district: string;
  state: string;
  message?: string;
}

// Built-in directory of major Indian PIN prefix mappings and landmark postal hubs across all Indian States & Union Territories
const ALL_INDIA_PIN_MAP: Record<string, { name: string; state: string; district?: string }> = {
  // Delhi
  '110001': { name: 'New Delhi GPO / Connaught Place', state: 'DELHI' },
  '110002': { name: 'A.G.C.R / Daryaganj', state: 'DELHI' },
  '110003': { name: 'Aliganj / CGO Complex / Golf Links', state: 'DELHI' },
  '110004': { name: 'Rashtrapati Bhawan', state: 'DELHI' },
  '110005': { name: 'Anand Parbat / Bank Street', state: 'DELHI' },
  '110006': { name: 'Chandni Chowk / Delhi GPO', state: 'DELHI' },
  '110007': { name: 'Delhi University / Roop Nagar', state: 'DELHI' },
  '110008': { name: 'Patel Nagar / Dada Ghosh Bhawan', state: 'DELHI' },
  '110009': { name: 'GTB Nagar / Model Town', state: 'DELHI' },
  '110010': { name: '505 A.B. Workshop / Delhi Cantt', state: 'DELHI' },
  '110011': { name: 'Nirman Bhawan / South Avenue', state: 'DELHI' },
  '110012': { name: 'IARI Pusa / Inderpuri', state: 'DELHI' },
  '110013': { name: 'Hazrat Nizamuddin / Dargah Sharif', state: 'DELHI' },
  '110014': { name: 'Jangpura / Ashram', state: 'DELHI' },
  '110015': { name: 'Mansarover Garden / Ramesh Nagar', state: 'DELHI' },
  '110016': { name: 'Green Park / Hauz Khas', state: 'DELHI' },
  '110017': { name: 'Chirag Delhi / Malviya Nagar', state: 'DELHI' },
  '110018': { name: 'A.G.I. Vikaspuri / Tilak Nagar', state: 'DELHI' },
  '110019': { name: 'Alaknanda / Kalkaji / Nehru Place', state: 'DELHI' },
  '110020': { name: 'Okhla Industrial Area', state: 'DELHI' },
  '110021': { name: 'Anand Niketan / Chanakyapuri', state: 'DELHI' },
  '110022': { name: 'R.K. Puram / Ramakrishna Puram', state: 'DELHI' },
  '110023': { name: 'Kidwai Nagar / Netaji Nagar', state: 'DELHI' },
  '110024': { name: 'Lajpat Nagar / Amar Colony', state: 'DELHI' },
  '110025': { name: 'Jamia Nagar / Sukhdev Vihar', state: 'DELHI' },
  '110026': { name: 'Punjabi Bagh / Shivaji Park', state: 'DELHI' },
  '110027': { name: 'Rajouri Garden / Subhash Nagar', state: 'DELHI' },
  '110028': { name: 'Naraina Industrial Area', state: 'DELHI' },
  '110029': { name: 'Safdarjung Enclave / Ansari Nagar', state: 'DELHI' },
  '110030': { name: 'Mehrauli / Chhatarpur', state: 'DELHI' },
  '110031': { name: 'Gandhi Nagar / Geeta Colony', state: 'DELHI' },
  '110032': { name: 'Shahdara / Babarpur / Loni Road', state: 'DELHI' },
  '110033': { name: 'Adarsh Nagar / Jahangirpuri', state: 'DELHI' },
  '110034': { name: 'Shakurpur / Maurya Enclave', state: 'DELHI' },
  '110035': { name: 'Keshav Puram / Inderlok', state: 'DELHI' },
  '110036': { name: 'Alipur / Mukhmelpur', state: 'DELHI' },
  '110037': { name: 'Mahipalpur / IGI Airport', state: 'DELHI' },
  '110038': { name: 'Airforce Rajokri', state: 'DELHI' },
  '110039': { name: 'Bawana', state: 'DELHI' },
  '110040': { name: 'Narela / Narela Town', state: 'DELHI' },
  '110041': { name: 'Nangloi / Sultanpuri', state: 'DELHI' },
  '110042': { name: 'Samaipur / Badli / Hyderpur', state: 'DELHI' },
  '110043': { name: 'Najafgarh / Kair', state: 'DELHI' },
  '110044': { name: 'Ali / Tughlakabad / Badarpur', state: 'DELHI' },
  '110045': { name: 'Bagrola / Palam Village', state: 'DELHI' },
  '110046': { name: 'Nangal Raya / Sagar Pur', state: 'DELHI' },
  '110047': { name: 'Arjangarh / Dera', state: 'DELHI' },
  '110048': { name: 'Greater Kailash / CR Park', state: 'DELHI' },
  '110049': { name: 'Andrews Ganj / Masjid Moth', state: 'DELHI' },
  '110051': { name: 'Krishna Nagar / Azad Nagar', state: 'DELHI' },
  '110052': { name: 'Ashok Vihar / Wazirpur', state: 'DELHI' },
  '110053': { name: 'Bhajanpura / Yamuna Vihar', state: 'DELHI' },
  '110054': { name: 'Civil Lines / Timarpur', state: 'DELHI' },
  '110055': { name: 'Amrit Kaur Market / Swami Ram Tirath Nagar', state: 'DELHI' },
  '110056': { name: 'S.B. Depot', state: 'DELHI' },
  '110057': { name: 'Vasant Vihar', state: 'DELHI' },
  '110058': { name: 'Janakpuri / D Block', state: 'DELHI' },
  '110059': { name: 'Uttam Nagar / Matiala', state: 'DELHI' },
  '110060': { name: 'Pusa Road / Rajendra Nagar', state: 'DELHI' },
  '110061': { name: 'Bijwasan', state: 'DELHI' },
  '110062': { name: 'A.F. Tughlakabad / Khanpur', state: 'DELHI' },
  '110063': { name: 'Paschim Vihar / Madipur', state: 'DELHI' },
  '110064': { name: 'Hari Nagar / Mayapuri', state: 'DELHI' },
  '110065': { name: 'East of Kailash / CRRI', state: 'DELHI' },
  '110066': { name: 'R.K. Puram Sector 1-12', state: 'DELHI' },
  '110067': { name: 'Munirka / JNU Campus', state: 'DELHI' },
  '110068': { name: 'IGNOU Campus', state: 'DELHI' },
  '110069': { name: 'UPSC / Shahjahan Road', state: 'DELHI' },
  '110070': { name: 'Vasant Kunj', state: 'DELHI' },
  '110071': { name: 'Chhawla', state: 'DELHI' },
  '110072': { name: 'CRPF Jharoda Kalan', state: 'DELHI' },
  '110073': { name: 'Dhansa / Raota Ujwa', state: 'DELHI' },
  '110074': { name: 'Fatehpur Beri', state: 'DELHI' },
  '110075': { name: 'Dwarka Sector 6-10', state: 'DELHI' },
  '110076': { name: 'Sarita Vihar / Badarpur Border', state: 'DELHI' },
  '110077': { name: 'Dwarka Sector 12-19', state: 'DELHI' },
  '110078': { name: 'Dwarka Sector 3-5', state: 'DELHI' },
  '110081': { name: 'Kanjhawala', state: 'DELHI' },
  '110082': { name: 'Khera Kalan', state: 'DELHI' },
  '110083': { name: 'Mangolpuri', state: 'DELHI' },
  '110084': { name: 'Burari', state: 'DELHI' },
  '110085': { name: 'Rohini Sector 1-9', state: 'DELHI' },
  '110086': { name: 'Sultanpuri', state: 'DELHI' },
  '110087': { name: 'Sunder Vihar / Peera Garhi', state: 'DELHI' },
  '110088': { name: 'Shalimar Bagh', state: 'DELHI' },
  '110091': { name: 'Mayur Vihar Phase 1-3', state: 'DELHI' },
  '110092': { name: 'Anand Vihar / Laxmi Nagar', state: 'DELHI' },
  '110093': { name: 'Nand Nagari / GTB Hospital', state: 'DELHI' },
  '110094': { name: 'Karawal Nagar / Sonia Vihar', state: 'DELHI' },
  '110095': { name: 'Dilshad Garden / Vivek Vihar', state: 'DELHI' },
  '110096': { name: 'Vasundhara Enclave / Ghazipur', state: 'DELHI' },

  // Haryana & Punjab
  '121001': { name: 'Faridabad NIT / Old Faridabad', state: 'HARYANA' },
  '121002': { name: 'Faridabad CBS / Sector 15', state: 'HARYANA' },
  '121003': { name: 'Amar Nagar Faridabad / Mathura Road', state: 'HARYANA' },
  '121004': { name: 'Ballabhgarh / Sector 2-3', state: 'HARYANA' },
  '121005': { name: 'Faridabad Sector 22', state: 'HARYANA' },
  '121006': { name: 'Faridabad Sector 7-8', state: 'HARYANA' },
  '122001': { name: 'Gurgaon HO / Civil Lines / Old Gurgaon', state: 'HARYANA' },
  '122002': { name: 'DLF Phase 1-4 Gurgaon', state: 'HARYANA' },
  '122003': { name: 'Gurgaon Sector 45 / South City', state: 'HARYANA' },
  '122005': { name: 'Air Force Gurgaon', state: 'HARYANA' },
  '122101': { name: 'Badshahpur / Sohna Road', state: 'HARYANA' },
  '122102': { name: 'Bhondsi Gurgaon', state: 'HARYANA' },
  '122103': { name: 'Sohna Gurgaon', state: 'HARYANA' },
  '122104': { name: 'Ferozepur Jhirka', state: 'HARYANA' },
  '122105': { name: 'Tauru / Nuh', state: 'HARYANA' },
  '122107': { name: 'Nuh Mewat', state: 'HARYANA' },
  '123001': { name: 'Narnaul / Mahendragarh', state: 'HARYANA' },
  '123401': { name: 'Rewari / Bawal Road', state: 'HARYANA' },
  '124001': { name: 'Rohtak HO / Model Town', state: 'HARYANA' },
  '124103': { name: 'Jhajjar / Silani Gate', state: 'HARYANA' },
  '124507': { name: 'Bahadurgarh / Sector 6', state: 'HARYANA' },
  '125001': { name: 'Hisar HO / Auto Market', state: 'HARYANA' },
  '125005': { name: 'Hisar Model Town / Cantonment', state: 'HARYANA' },
  '125055': { name: 'Sirsa HO / Begu Road', state: 'HARYANA' },
  '126102': { name: 'Jind HO / Railway Road', state: 'HARYANA' },
  '127021': { name: 'Bhiwani HO / Halu Bazar', state: 'HARYANA' },
  '131001': { name: 'Sonipat HO / Model Town', state: 'HARYANA' },
  '132001': { name: 'Karnal HO / Model Town', state: 'HARYANA' },
  '132103': { name: 'Panipat HO / GT Road', state: 'HARYANA' },
  '133001': { name: 'Ambala Cantt / Sadar Bazar', state: 'HARYANA' },
  '134003': { name: 'Ambala City / Model Town', state: 'HARYANA' },
  '134109': { name: 'Panchkula Sector 8-15', state: 'HARYANA' },
  '135001': { name: 'Yamuna Nagar / Jagadhri', state: 'HARYANA' },
  '136027': { name: 'Kaithal / Jind Road', state: 'HARYANA' },
  '136118': { name: 'Kurukshetra / Birla Mandir', state: 'HARYANA' },
  '140001': { name: 'Ropar / Rupnagar', state: 'PUNJAB' },
  '140112': { name: 'Chamkaur Sahib', state: 'PUNJAB' },
  '140301': { name: 'Kharar / Mohali', state: 'PUNJAB' },
  '140401': { name: 'Rajpura Town', state: 'PUNJAB' },
  '140406': { name: 'Sirhind Mandi', state: 'PUNJAB' },
  '141001': { name: 'Ludhiana HO / Civil Lines / Clock Tower', state: 'PUNJAB' },
  '141002': { name: 'Model Town Ludhiana', state: 'PUNJAB' },
  '141003': { name: 'Millerganj / Industrial Area Ludhiana', state: 'PUNJAB' },
  '141008': { name: 'Ludhiana Central / Shivpuri', state: 'PUNJAB' },
  '142001': { name: 'Moga HO / GT Road', state: 'PUNJAB' },
  '143001': { name: 'Amritsar HO / Golden Temple / Town Hall', state: 'PUNJAB' },
  '143006': { name: 'Chowk Darbar Sahib Amritsar', state: 'PUNJAB' },
  '143505': { name: 'Batala HO / City', state: 'PUNJAB' },
  '144001': { name: 'Jalandhar City HO / Civil Lines', state: 'PUNJAB' },
  '144005': { name: 'Jalandhar Cantt', state: 'PUNJAB' },
  '144401': { name: 'Phagwara / GT Road', state: 'PUNJAB' },
  '144601': { name: 'Kapurthala HO', state: 'PUNJAB' },
  '145001': { name: 'Pathankot HO / Dalhousie Road', state: 'PUNJAB' },
  '146001': { name: 'Hoshiarpur HO / Model Town', state: 'PUNJAB' },
  '147001': { name: 'Patiala HO / The Mall / Baradari', state: 'PUNJAB' },
  '148001': { name: 'Sangrur HO', state: 'PUNJAB' },
  '148023': { name: 'Malerkotla', state: 'PUNJAB' },
  '151001': { name: 'Bathinda HO / GT Road', state: 'PUNJAB' },
  '152001': { name: 'Firozpur Cantt HO', state: 'PUNJAB' },
  '152116': { name: 'Abohar / Nai Abadi', state: 'PUNJAB' },
  '152123': { name: 'Fazilka', state: 'PUNJAB' },
  '160001': { name: 'Chandigarh GPO / Sector 17', state: 'CHANDIGARH' },
  '160017': { name: 'Chandigarh Sector 22 / Bus Stand', state: 'CHANDIGARH' },
  '160055': { name: 'Mohali Sector 55-62 / Phase 3-7', state: 'PUNJAB' },

  // Himachal Pradesh, J&K, Uttarakhand
  '171001': { name: 'Shimla GPO / Mall Road', state: 'HIMACHAL PRADESH' },
  '171002': { name: 'Chhota Shimla / Secretariat', state: 'HIMACHAL PRADESH' },
  '173212': { name: 'Solan HO / Mall Road', state: 'HIMACHAL PRADESH' },
  '175001': { name: 'Mandi HO / Paddal', state: 'HIMACHAL PRADESH' },
  '175101': { name: 'Kullu HO / Dhalpur', state: 'HIMACHAL PRADESH' },
  '175131': { name: 'Manali / Mall Road', state: 'HIMACHAL PRADESH' },
  '176001': { name: 'Kangra / Dharamshala', state: 'HIMACHAL PRADESH' },
  '176215': { name: 'Dharamshala Kotwali Bazar', state: 'HIMACHAL PRADESH' },
  '180001': { name: 'Jammu Tawi / Raghunath Bazar', state: 'JAMMU AND KASHMIR' },
  '180004': { name: 'Gandhi Nagar Jammu', state: 'JAMMU AND KASHMIR' },
  '182101': { name: 'Udhampur HO', state: 'JAMMU AND KASHMIR' },
  '182301': { name: 'Katra Vaishno Devi', state: 'JAMMU AND KASHMIR' },
  '190001': { name: 'Srinagar GPO / Lal Chowk', state: 'JAMMU AND KASHMIR' },
  '190006': { name: 'Naseem Bagh / Hazratbal Srinagar', state: 'JAMMU AND KASHMIR' },
  '192101': { name: 'Anantnag HO', state: 'JAMMU AND KASHMIR' },
  '193101': { name: 'Baramulla HO', state: 'JAMMU AND KASHMIR' },
  '194101': { name: 'Leh Ladakh', state: 'JAMMU AND KASHMIR' },
  '248001': { name: 'Dehradun GPO / Rajpur Road', state: 'UTTARAKHAND' },
  '248002': { name: 'Clement Town Dehradun', state: 'UTTARAKHAND' },
  '249201': { name: 'Rishikesh / Muni Ki Reti', state: 'UTTARAKHAND' },
  '249401': { name: 'Haridwar HO / Har Ki Pauri', state: 'UTTARAKHAND' },
  '263001': { name: 'Nainital HO / Mallital', state: 'UTTARAKHAND' },
  '263139': { name: 'Haldwani / Bareilly Road', state: 'UTTARAKHAND' },

  // Uttar Pradesh
  '201001': { name: 'Ghaziabad HO / Navyug Market', state: 'UTTAR PRADESH' },
  '201002': { name: 'Kavi Nagar Ghaziabad', state: 'UTTAR PRADESH' },
  '201009': { name: 'Ghaziabad City / Model Town', state: 'UTTAR PRADESH' },
  '201010': { name: 'Sahibabad Industrial Area', state: 'UTTAR PRADESH' },
  '201301': { name: 'Noida Sector 1-18', state: 'UTTAR PRADESH' },
  '201303': { name: 'Noida Sector 37 / Botanical Garden', state: 'UTTAR PRADESH' },
  '201307': { name: 'Noida Sector 34 / City Center', state: 'UTTAR PRADESH' },
  '202001': { name: 'Aligarh HO / Center Point', state: 'UTTAR PRADESH' },
  '202002': { name: 'Aligarh Muslim University (AMU)', state: 'UTTAR PRADESH' },
  '208001': { name: 'Kanpur HO / Mall Road / Parade', state: 'UTTAR PRADESH' },
  '208002': { name: 'Nawabganj / GSVM College Kanpur', state: 'UTTAR PRADESH' },
  '208012': { name: 'R.K. Nagar Kanpur / Govind Nagar', state: 'UTTAR PRADESH' },
  '209206': { name: 'Ghatampur Kanpur', state: 'UTTAR PRADESH' },
  '211001': { name: 'Allahabad / Prayagraj HO / Civil Lines', state: 'UTTAR PRADESH' },
  '211002': { name: 'Allahabad High Court / University', state: 'UTTAR PRADESH' },
  '221001': { name: 'Varanasi HO / Kashi Vishwanath / Cantt', state: 'UTTAR PRADESH' },
  '221005': { name: 'Banaras Hindu University (BHU)', state: 'UTTAR PRADESH' },
  '226001': { name: 'Lucknow GPO / Hazratganj / Aminabad', state: 'UTTAR PRADESH' },
  '226002': { name: 'Charbagh / Dilkusha Lucknow', state: 'UTTAR PRADESH' },
  '226010': { name: 'Gomti Nagar Lucknow', state: 'UTTAR PRADESH' },
  '226016': { name: 'Indira Nagar Lucknow', state: 'UTTAR PRADESH' },
  '242001': { name: 'Shahjahanpur HO', state: 'UTTAR PRADESH' },
  '243001': { name: 'Bareilly HO / Civil Lines', state: 'UTTAR PRADESH' },
  '244001': { name: 'Moradabad HO / Civil Lines', state: 'UTTAR PRADESH' },
  '245101': { name: 'Hapur HO', state: 'UTTAR PRADESH' },
  '247001': { name: 'Saharanpur HO', state: 'UTTAR PRADESH' },
  '250001': { name: 'Meerut Cantt / Begum Bridge', state: 'UTTAR PRADESH' },
  '250002': { name: 'Meerut City HO', state: 'UTTAR PRADESH' },
  '273001': { name: 'Gorakhpur HO / Golghar', state: 'UTTAR PRADESH' },
  '281001': { name: 'Mathura HO / Krishna Janmabhoomi', state: 'UTTAR PRADESH' },
  '281121': { name: 'Vrindavan', state: 'UTTAR PRADESH' },
  '282001': { name: 'Agra HO / Tajganj / Sadar Bazar', state: 'UTTAR PRADESH' },
  '282002': { name: 'Raja Mandi / Civil Court Agra', state: 'UTTAR PRADESH' },
  '284001': { name: 'Jhansi HO / Fort', state: 'UTTAR PRADESH' },

  // Rajasthan
  '302001': { name: 'Jaipur GPO / MI Road / Pink City', state: 'RAJASTHAN' },
  '302002': { name: 'Tripolia Bazar / City Palace Jaipur', state: 'RAJASTHAN' },
  '302003': { name: 'Johri Bazar Jaipur', state: 'RAJASTHAN' },
  '302004': { name: 'Raja Park / Tilak Nagar Jaipur', state: 'RAJASTHAN' },
  '302005': { name: 'Jaipur Secretariat / High Court', state: 'RAJASTHAN' },
  '302006': { name: 'Ajmer Road / Civil Lines Jaipur', state: 'RAJASTHAN' },
  '302012': { name: 'Jhotwara / Khatipura Jaipur', state: 'RAJASTHAN' },
  '302015': { name: 'Bapu Nagar / Gandhi Nagar Jaipur', state: 'RAJASTHAN' },
  '302016': { name: 'Shastri Nagar Jaipur', state: 'RAJASTHAN' },
  '302017': { name: 'Malviya Nagar Jaipur', state: 'RAJASTHAN' },
  '302018': { name: 'Durgapura Jaipur', state: 'RAJASTHAN' },
  '302020': { name: 'Mansarovar Jaipur', state: 'RAJASTHAN' },
  '302021': { name: 'Vaishali Nagar Jaipur', state: 'RAJASTHAN' },
  '305001': { name: 'Ajmer HO / Dargah Sharif', state: 'RAJASTHAN' },
  '305022': { name: 'Pushkar / Pushkar Bazar', state: 'RAJASTHAN' },
  '306401': { name: 'Pali Marwar HO / Surajpole', state: 'RAJASTHAN' },
  '311001': { name: 'Bhilwara HO / City', state: 'RAJASTHAN' },
  '312001': { name: 'Chittorgarh HO / Fort', state: 'RAJASTHAN' },
  '313001': { name: 'Udaipur City / Lake Palace / Shastri Circle', state: 'RAJASTHAN' },
  '321001': { name: 'Bharatpur HO / Fort', state: 'RAJASTHAN' },
  '324001': { name: 'Kota HO / Nayapura / Chambal', state: 'RAJASTHAN' },
  '334001': { name: 'Bikaner HO / Kote Gate', state: 'RAJASTHAN' },
  '342001': { name: 'Jodhpur HO / Clock Tower', state: 'RAJASTHAN' },
  '342003': { name: 'Jalori Gate Jodhpur', state: 'RAJASTHAN' },
  '344001': { name: 'Barmer HO', state: 'RAJASTHAN' },
  '345001': { name: 'Jaisalmer Fort HO', state: 'RAJASTHAN' },

  // Gujarat
  '360001': { name: 'Rajkot HO / Dharmendra Road', state: 'GUJARAT' },
  '360002': { name: 'Bhakti Nagar Rajkot', state: 'GUJARAT' },
  '361001': { name: 'Jamnagar HO / Digjam', state: 'GUJARAT' },
  '362001': { name: 'Junagadh HO / Girnar', state: 'GUJARAT' },
  '363001': { name: 'Surendranagar HO', state: 'GUJARAT' },
  '364001': { name: 'Bhavnagar HO / Wadhwa', state: 'GUJARAT' },
  '370001': { name: 'Bhuj Kutch HO', state: 'GUJARAT' },
  '370201': { name: 'Gandhidham Kutch', state: 'GUJARAT' },
  '380001': { name: 'Ahmedabad GPO / Relief Road', state: 'GUJARAT' },
  '380006': { name: 'Ellisbridge / Navrangpura Ahmedabad', state: 'GUJARAT' },
  '380009': { name: 'Navrangpura / Ashram Road Ahmedabad', state: 'GUJARAT' },
  '380015': { name: 'Satellite / Vastrapur Ahmedabad', state: 'GUJARAT' },
  '382010': { name: 'Gandhinagar Sector 1-30 / Sachivalaya', state: 'GUJARAT' },
  '384001': { name: 'Mehsana HO', state: 'GUJARAT' },
  '387001': { name: 'Nadiad HO / Ashram Road', state: 'GUJARAT' },
  '388001': { name: 'Anand HO / Amul Dairy', state: 'GUJARAT' },
  '390001': { name: 'Vadodara HO / Raopura / Mandvi', state: 'GUJARAT' },
  '390002': { name: 'Fatehganj Vadodara', state: 'GUJARAT' },
  '392001': { name: 'Bharuch HO', state: 'GUJARAT' },
  '394210': { name: 'Pandesara / Surat Udhna', state: 'GUJARAT' },
  '395001': { name: 'Surat HO / Chowk Bazar', state: 'GUJARAT' },
  '395002': { name: 'Sagrampura / Textile Market Surat', state: 'GUJARAT' },
  '395003': { name: 'Varachha Road / Surat City', state: 'GUJARAT' },
  '396001': { name: 'Valsad HO', state: 'GUJARAT' },
  '396191': { name: 'Vapi Industrial Town', state: 'GUJARAT' },

  // Maharashtra & Goa
  '400001': { name: 'Mumbai GPO / Fort / Marine Drive', state: 'MAHARASHTRA' },
  '400004': { name: 'Girgaon / Charni Road Mumbai', state: 'MAHARASHTRA' },
  '400008': { name: 'Mumbai Central / Byculla', state: 'MAHARASHTRA' },
  '400014': { name: 'Dadar HO / Shivaji Park Mumbai', state: 'MAHARASHTRA' },
  '400050': { name: 'Bandra West Mumbai', state: 'MAHARASHTRA' },
  '400051': { name: 'Bandra Kurla Complex (BKC) Mumbai', state: 'MAHARASHTRA' },
  '400053': { name: 'Andheri West / Lokhandwala Mumbai', state: 'MAHARASHTRA' },
  '400069': { name: 'Andheri East / MIDC Mumbai', state: 'MAHARASHTRA' },
  '400076': { name: 'Powai / IIT Bombay', state: 'MAHARASHTRA' },
  '400092': { name: 'Borivali West Mumbai', state: 'MAHARASHTRA' },
  '400601': { name: 'Thane HO / Naupada', state: 'MAHARASHTRA' },
  '400703': { name: 'Vashi Navi Mumbai', state: 'MAHARASHTRA' },
  '403001': { name: 'Panaji HO / Altinho', state: 'GOA' },
  '403507': { name: 'Mapusa / Calangute', state: 'GOA' },
  '403601': { name: 'Margao HO / Salcete', state: 'GOA' },
  '403802': { name: 'Vasco-da-Gama / Mormugao', state: 'GOA' },
  '411001': { name: 'Pune HO / Station / Camp', state: 'MAHARASHTRA' },
  '411004': { name: 'Deccan Gymkhana / Shivajinagar Pune', state: 'MAHARASHTRA' },
  '411014': { name: 'Viman Nagar / Kalyani Nagar Pune', state: 'MAHARASHTRA' },
  '411028': { name: 'Hadapsar / Magarpatta Pune', state: 'MAHARASHTRA' },
  '411038': { name: 'Kothrud Pune', state: 'MAHARASHTRA' },
  '411057': { name: 'Hinjewadi IT Park Pune', state: 'MAHARASHTRA' },
  '413001': { name: 'Solapur HO', state: 'MAHARASHTRA' },
  '414001': { name: 'Ahmednagar HO', state: 'MAHARASHTRA' },
  '415001': { name: 'Satara HO', state: 'MAHARASHTRA' },
  '416001': { name: 'Kolhapur HO / Shahupuri', state: 'MAHARASHTRA' },
  '421001': { name: 'Kalyan / Ulhasnagar', state: 'MAHARASHTRA' },
  '422001': { name: 'Nashik HO / Panchavati', state: 'MAHARASHTRA' },
  '424001': { name: 'Dhule HO', state: 'MAHARASHTRA' },
  '425001': { name: 'Jalgaon HO', state: 'MAHARASHTRA' },
  '431001': { name: 'Aurangabad (Chhatrapati Sambhajinagar) HO', state: 'MAHARASHTRA' },
  '440001': { name: 'Nagpur GPO / Civil Lines / Sitabuldi', state: 'MAHARASHTRA' },
  '444001': { name: 'Akola HO', state: 'MAHARASHTRA' },
  '444601': { name: 'Amravati HO', state: 'MAHARASHTRA' },

  // Madhya Pradesh & Chhattisgarh
  '450001': { name: 'Khandwa HO', state: 'MADHYA PRADESH' },
  '452001': { name: 'Indore GPO / Rajwada / MG Road', state: 'MADHYA PRADESH' },
  '452010': { name: 'Vijay Nagar Indore', state: 'MADHYA PRADESH' },
  '456001': { name: 'Ujjain HO / Mahakaleshwar', state: 'MADHYA PRADESH' },
  '457001': { name: 'Ratlam HO / Station', state: 'MADHYA PRADESH' },
  '462001': { name: 'Bhopal GPO / TT Nagar', state: 'MADHYA PRADESH' },
  '462016': { name: 'Shivaji Nagar Bhopal', state: 'MADHYA PRADESH' },
  '462023': { name: 'Govindpura Bhopal', state: 'MADHYA PRADESH' },
  '470001': { name: 'Sagar HO / Cantt', state: 'MADHYA PRADESH' },
  '474001': { name: 'Gwalior HO / Lashkar / Morar', state: 'MADHYA PRADESH' },
  '482001': { name: 'Jabalpur HO / Civil Lines', state: 'MADHYA PRADESH' },
  '486001': { name: 'Rewa HO', state: 'MADHYA PRADESH' },
  '490001': { name: 'Bhilai Sector 1-10 / Civic Centre', state: 'CHHATTISGARH' },
  '491001': { name: 'Durg HO / Station', state: 'CHHATTISGARH' },
  '492001': { name: 'Raipur GPO / Jaistambh Chowk', state: 'CHHATTISGARH' },
  '495001': { name: 'Bilaspur HO / Gole Bazar', state: 'CHHATTISGARH' },
  '495677': { name: 'Korba Town', state: 'CHHATTISGARH' },

  // Andhra Pradesh & Telangana
  '500001': { name: 'Hyderabad GPO / Abids / Koti', state: 'ANDHRA PRADESH' },
  '500003': { name: 'Secunderabad / Rashtrapati Road', state: 'ANDHRA PRADESH' },
  '500032': { name: 'Gachibowli / Hitec City Hyderabad', state: 'ANDHRA PRADESH' },
  '500034': { name: 'Banjara Hills Hyderabad', state: 'ANDHRA PRADESH' },
  '500081': { name: 'Madhapur / Cyberabad Hyderabad', state: 'ANDHRA PRADESH' },
  '506001': { name: 'Warangal HO / Hanamkonda', state: 'ANDHRA PRADESH' },
  '509001': { name: 'Mahabubnagar HO', state: 'ANDHRA PRADESH' },
  '515001': { name: 'Anantapur HO / Collectorate', state: 'ANDHRA PRADESH' },
  '516001': { name: 'Kadapa (Cuddapah) HO', state: 'ANDHRA PRADESH' },
  '517501': { name: 'Tirupati HO / Alipiri', state: 'ANDHRA PRADESH' },
  '517504': { name: 'Tirumala Hill Temple', state: 'ANDHRA PRADESH' },
  '518001': { name: 'Kurnool HO / Raj Vihar', state: 'ANDHRA PRADESH' },
  '520001': { name: 'Vijayawada HO / Governorpet / Benz Circle', state: 'ANDHRA PRADESH' },
  '522001': { name: 'Guntur HO / Arundelpet / Brodipet', state: 'ANDHRA PRADESH' },
  '524001': { name: 'Nellore HO / Trunk Road', state: 'ANDHRA PRADESH' },
  '530001': { name: 'Visakhapatnam HO / Beach Road / Jagadamba', state: 'ANDHRA PRADESH' },
  '533001': { name: 'Kakinada HO / Main Road', state: 'ANDHRA PRADESH' },
  '533101': { name: 'Rajahmundry HO', state: 'ANDHRA PRADESH' },
  '534001': { name: 'Eluru HO', state: 'ANDHRA PRADESH' },

  // Karnataka
  '560001': { name: 'Bangalore GPO / MG Road / Vidhana Soudha', state: 'KARNATAKA' },
  '560002': { name: 'Bangalore City HO / Chickpet', state: 'KARNATAKA' },
  '560004': { name: 'Basavanagudi / Gandhi Bazaar Bangalore', state: 'KARNATAKA' },
  '560008': { name: 'Ulsoor / Halasuru Bangalore', state: 'KARNATAKA' },
  '560011': { name: 'Jayanagar 3rd-4th Block Bangalore', state: 'KARNATAKA' },
  '560025': { name: 'Richmond Town / Brigade Road Bangalore', state: 'KARNATAKA' },
  '560034': { name: 'Koramangala 1st-8th Block Bangalore', state: 'KARNATAKA' },
  '560038': { name: 'Indiranagar 100ft Road Bangalore', state: 'KARNATAKA' },
  '560041': { name: 'Jayanagar South / 9th Block Bangalore', state: 'KARNATAKA' },
  '560066': { name: 'Whitefield / ITPL Bangalore', state: 'KARNATAKA' },
  '560068': { name: 'Bommanahalli / Electronic City Bangalore', state: 'KARNATAKA' },
  '560076': { name: 'Bannerghatta Road / BTM Layout Bangalore', state: 'KARNATAKA' },
  '560100': { name: 'Electronic City Phase 1 & 2 Bangalore', state: 'KARNATAKA' },
  '562106': { name: 'Anekal / Attibele', state: 'KARNATAKA' },
  '562110': { name: 'Devanahalli / Airport Road', state: 'KARNATAKA' },
  '563101': { name: 'Kolar HO', state: 'KARNATAKA' },
  '570001': { name: 'Mysore HO / KR Circle / Palace', state: 'KARNATAKA' },
  '571201': { name: 'Madikeri / Coorg', state: 'KARNATAKA' },
  '572101': { name: 'Tumkur HO / City', state: 'KARNATAKA' },
  '573201': { name: 'Hassan HO / Bus Stand', state: 'KARNATAKA' },
  '574201': { name: 'Puttur / Mangalore Rural', state: 'KARNATAKA' },
  '575001': { name: 'Mangalore HO / Hampankatta', state: 'KARNATAKA' },
  '576101': { name: 'Udupi HO / Car Street', state: 'KARNATAKA' },
  '576119': { name: 'Manipal University Campus', state: 'KARNATAKA' },
  '577001': { name: 'Davanagere HO', state: 'KARNATAKA' },
  '577201': { name: 'Shimoga (Shivamogga) HO', state: 'KARNATAKA' },
  '580001': { name: 'Dharwad HO', state: 'KARNATAKA' },
  '580020': { name: 'Hubli HO / Traffic Island', state: 'KARNATAKA' },
  '581301': { name: 'Karwar HO', state: 'KARNATAKA' },
  '583101': { name: 'Bellary (Ballari) HO', state: 'KARNATAKA' },
  '585101': { name: 'Gulbarga (Kalaburagi) HO', state: 'KARNATAKA' },
  '586101': { name: 'Bijapur (Vijayapura) HO', state: 'KARNATAKA' },
  '590001': { name: 'Belgaum (Belagavi) HO / Camp', state: 'KARNATAKA' },

  // Tamil Nadu
  '600001': { name: 'Chennai GPO / George Town / Parrys', state: 'TAMILNADU' },
  '600002': { name: 'Anna Salai (Mount Road) Chennai', state: 'TAMILNADU' },
  '600004': { name: 'Mylapore / Santhome Chennai', state: 'TAMILNADU' },
  '600017': { name: 'T. Nagar (Thyagaraya Nagar) Chennai', state: 'TAMILNADU' },
  '600018': { name: 'Teynampet / Eldams Road Chennai', state: 'TAMILNADU' },
  '600028': { name: 'R.A. Puram / Foreshore Estate Chennai', state: 'TAMILNADU' },
  '600034': { name: 'Nungambakkam High Road Chennai', state: 'TAMILNADU' },
  '600040': { name: 'Anna Nagar Chennai', state: 'TAMILNADU' },
  '600084': { name: 'Kilpauk / Chetpet Chennai', state: 'TAMILNADU' },
  '600096': { name: 'Perungudi / OMR IT Corridor Chennai', state: 'TAMILNADU' },
  '605001': { name: 'Pondicherry (Puducherry) HO', state: 'TAMILNADU' },
  '606001': { name: 'Vriddhachalam HO', state: 'TAMILNADU' },
  '606601': { name: 'Tiruvannamalai HO / Temple', state: 'TAMILNADU' },
  '607001': { name: 'Cuddalore HO / Beach', state: 'TAMILNADU' },
  '613001': { name: 'Thanjavur HO / Palace', state: 'TAMILNADU' },
  '614601': { name: 'Pattukkottai HO', state: 'TAMILNADU' },
  '620001': { name: 'Tiruchirappalli (Trichy) HO / Cantonment', state: 'TAMILNADU' },
  '620002': { name: 'Rockfort / Teppakulam Trichy', state: 'TAMILNADU' },
  '624001': { name: 'Dindigul HO / Fort', state: 'TAMILNADU' },
  '624601': { name: 'Palani Temple Town HO', state: 'TAMILNADU' },
  '625001': { name: 'Madurai HO / Meenakshi Amman Temple', state: 'TAMILNADU' },
  '627001': { name: 'Tirunelveli Junction HO', state: 'TAMILNADU' },
  '628001': { name: 'Tuticorin (Thoothukudi) HO / Port', state: 'TAMILNADU' },
  '629001': { name: 'Nagercoil HO / Court Road', state: 'TAMILNADU' },
  '629702': { name: 'Kanyakumari / Vivekanandapuram', state: 'TAMILNADU' },
  '632001': { name: 'Vellore HO / Fort', state: 'TAMILNADU' },
  '635001': { name: 'Krishnagiri HO', state: 'TAMILNADU' },
  '636001': { name: 'Salem HO / Four Roads', state: 'TAMILNADU' },
  '637001': { name: 'Namakkal HO', state: 'TAMILNADU' },
  '638001': { name: 'Erode HO / Bus Stand', state: 'TAMILNADU' },
  '639001': { name: 'Karur HO / Bus Stand', state: 'TAMILNADU' },
  '641001': { name: 'Coimbatore HO / Town Hall', state: 'TAMILNADU' },
  '641002': { name: 'R.S. Puram Coimbatore', state: 'TAMILNADU' },
  '641601': { name: 'Tirupur HO / Cotton Market', state: 'TAMILNADU' },
  '643001': { name: 'Ooty (Udhagamandalam) HO / Commercial Road', state: 'TAMILNADU' },

  // Kerala
  '670001': { name: 'Kannur HO / Fort Road', state: 'KERALA' },
  '671121': { name: 'Kasaragod HO', state: 'KERALA' },
  '673001': { name: 'Kozhikode (Calicut) HO / Mananchira', state: 'KERALA' },
  '676505': { name: 'Malappuram HO / Civil Station', state: 'KERALA' },
  '678001': { name: 'Palakkad HO / Fort', state: 'KERALA' },
  '680001': { name: 'Thrissur HO / Swaraj Round', state: 'KERALA' },
  '682001': { name: 'Kochi (Cochin) / Fort Kochi / Marine Drive', state: 'KERALA' },
  '682011': { name: 'Ernakulam HO / MG Road', state: 'KERALA' },
  '685501': { name: 'Idukki / Munnar', state: 'KERALA' },
  '686001': { name: 'Kottayam HO / Baker Junction', state: 'KERALA' },
  '688001': { name: 'Alappuzha (Alleppey) HO', state: 'KERALA' },
  '689101': { name: 'Pathanamthitta / Thiruvalla HO', state: 'KERALA' },
  '691001': { name: 'Kollam (Quilon) HO / Chinnakada', state: 'KERALA' },
  '695001': { name: 'Thiruvananthapuram (Trivandrum) GPO', state: 'KERALA' },

  // West Bengal & North-East
  '700001': { name: 'Kolkata GPO / BBD Bagh / Dalhousie', state: 'WEST BENGAL' },
  '700019': { name: 'Ballygunge / Gariahat Kolkata', state: 'WEST BENGAL' },
  '700027': { name: 'Alipore HO / National Library Kolkata', state: 'WEST BENGAL' },
  '700091': { name: 'Salt Lake City / Sector V Kolkata', state: 'WEST BENGAL' },
  '711101': { name: 'Howrah HO / Station', state: 'WEST BENGAL' },
  '712201': { name: 'Serampore Hooghly', state: 'WEST BENGAL' },
  '713201': { name: 'Durgapur City Centre', state: 'WEST BENGAL' },
  '713301': { name: 'Asansol HO / GT Road', state: 'WEST BENGAL' },
  '721301': { name: 'Kharagpur / IIT Campus', state: 'WEST BENGAL' },
  '734001': { name: 'Siliguri HO / Hill Cart Road', state: 'WEST BENGAL' },
  '734101': { name: 'Darjeeling HO / Mall', state: 'WEST BENGAL' },
  '744101': { name: 'Port Blair / Aberdeen Bazar', state: 'ANDAMAN AND NICOBAR' },
  '751001': { name: 'Bhubaneswar GPO / Secretariat', state: 'ORISSA' },
  '753001': { name: 'Cuttack GPO / Choudhury Bazar', state: 'ORISSA' },
  '756001': { name: 'Balasore HO / Station', state: 'ORISSA' },
  '769001': { name: 'Rourkela HO / Steel City', state: 'ORISSA' },
  '781001': { name: 'Guwahati GPO / Pan Bazar / Fancy Bazar', state: 'ASSAM' },
  '785001': { name: 'Jorhat HO / Garali', state: 'ASSAM' },
  '786001': { name: 'Dibrugarh HO / Graham Bazar', state: 'ASSAM' },
  '790001': { name: 'Bomdila / West Kameng', state: 'ARUNACHAL PRADESH' },
  '791111': { name: 'Itanagar HO / AP Secretariat', state: 'ARUNACHAL PRADESH' },
  '793001': { name: 'Shillong GPO / Police Bazar', state: 'MEGHALAYA' },
  '795001': { name: 'Imphal HO / Paona Bazar', state: 'MANIPUR' },
  '796001': { name: 'Aizawl HO / Bara Bazar', state: 'MIZORAM' },
  '797001': { name: 'Kohima HO / Main Town', state: 'NAGALAND' },
  '799001': { name: 'Agartala HO / Tripura', state: 'TRIPURA' },

  // Bihar & Jharkhand
  '800001': { name: 'Patna GPO / Fraser Road / Station', state: 'BIHAR' },
  '800004': { name: 'Bankipur / Patna University', state: 'BIHAR' },
  '800008': { name: 'Patna City / Chowk', state: 'BIHAR' },
  '803101': { name: 'Bihar Sharif HO / Nalanda', state: 'BIHAR' },
  '812001': { name: 'Bhagalpur HO / Adampur', state: 'BIHAR' },
  '814112': { name: 'Baidyanath Deoghar HO / Temple', state: 'JHARKHAND' },
  '824101': { name: 'Aurangabad Bihar HO', state: 'BIHAR' },
  '826001': { name: 'Dhanbad HO / Bank More', state: 'JHARKHAND' },
  '827001': { name: 'Bokaro Steel City Sector 1-4', state: 'JHARKHAND' },
  '831001': { name: 'Jamshedpur / Bistupur / Sakchi', state: 'JHARKHAND' },
  '834001': { name: 'Ranchi GPO / Main Road / Doranda', state: 'JHARKHAND' },
  '842001': { name: 'Muzaffarpur HO / Motijheel', state: 'BIHAR' },
  '845401': { name: 'Motihari HO / East Champaran', state: 'BIHAR' },
  '846001': { name: 'Darbhanga HO / Laheriasarai', state: 'BIHAR' },
  '848101': { name: 'Samastipur HO', state: 'BIHAR' },
  '851101': { name: 'Begusarai HO', state: 'BIHAR' },
  '854301': { name: 'Purnea HO / Line Bazar', state: 'BIHAR' },
  '855107': { name: 'Kishanganj HO', state: 'BIHAR' },
};

/**
 * Validates and looks up any Indian 6-digit PIN code across the nation.
 * Checks local database first, then queries the official India Post Postal PIN Code API.
 */
export async function lookupPinCode(pincode: string): Promise<PinCodeLookupResult> {
  const cleanPin = pincode.trim().replace(/\D/g, '');

  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      success: false,
      postOffices: [],
      district: '',
      state: '',
      message: 'Please enter a valid Indian PIN code.',
    };
  }

  // 1. Instant check against local All India Postal Directory
  if (ALL_INDIA_PIN_MAP[cleanPin]) {
    const record = ALL_INDIA_PIN_MAP[cleanPin];
    return {
      success: true,
      postOfficeName: record.name,
      postOffices: [
        {
          name: record.name,
          district: record.district || record.name,
          state: record.state,
          deliveryStatus: 'Delivery',
        },
      ],
      district: record.district || record.name,
      state: record.state,
    };
  }

  // 2. Query the live India Post API (api.postalpincode.in)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].Status === 'Success' &&
      Array.isArray(data[0].PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const offices: PostalOfficeInfo[] = data[0].PostOffice.map((po: any) => ({
        name: po.Name,
        district: po.District || '',
        state: (po.State || '').toUpperCase(),
        deliveryStatus: po.DeliveryStatus || 'Delivery',
      }));

      const first = offices[0];
      return {
        success: true,
        postOfficeName: first.name,
        postOffices: offices,
        district: first.district,
        state: first.state,
      };
    }
  } catch (_err) {
    // If network fails, determine state mathematically from the first digit (postal zone)
  }

  // 3. Indian Postal Circle Fallback based on official 6-digit allocation rules
  const first2 = parseInt(cleanPin.substring(0, 2), 10);
  const stateFromZone = getStateFromPinPrefix(first2);

  if (stateFromZone) {
    return {
      success: true,
      postOfficeName: `Area Hub (PIN: ${cleanPin})`,
      postOffices: [
        {
          name: `Area Hub ${cleanPin}`,
          district: stateFromZone,
          state: stateFromZone,
          deliveryStatus: 'Delivery',
        },
      ],
      district: stateFromZone,
      state: stateFromZone,
    };
  }

  return {
    success: false,
    postOffices: [],
    district: '',
    state: '',
    message: 'Please enter a valid Indian PIN code.',
  };
}

function getStateFromPinPrefix(prefix2: number): string | null {
  if (prefix2 === 11) return 'DELHI';
  if (prefix2 >= 12 && prefix2 <= 13) return 'HARYANA';
  if (prefix2 >= 14 && prefix2 <= 15) return 'PUNJAB';
  if (prefix2 === 16) return 'CHANDIGARH';
  if (prefix2 === 17) return 'HIMACHAL PRADESH';
  if (prefix2 >= 18 && prefix2 <= 19) return 'JAMMU AND KASHMIR';
  if (prefix2 >= 20 && prefix2 <= 28) return 'UTTAR PRADESH';
  if (prefix2 >= 30 && prefix2 <= 34) return 'RAJASTHAN';
  if (prefix2 >= 36 && prefix2 <= 39) return 'GUJARAT';
  if (prefix2 >= 40 && prefix2 <= 44) return 'MAHARASHTRA';
  if (prefix2 >= 45 && prefix2 <= 48) return 'MADHYA PRADESH';
  if (prefix2 === 49) return 'CHHATTISGARH';
  if (prefix2 >= 50 && prefix2 <= 53) return 'ANDHRA PRADESH';
  if (prefix2 >= 56 && prefix2 <= 59) return 'KARNATAKA';
  if (prefix2 >= 60 && prefix2 <= 64) return 'TAMILNADU';
  if (prefix2 >= 67 && prefix2 <= 69) return 'KERALA';
  if (prefix2 >= 70 && prefix2 <= 74) return 'WEST BENGAL';
  if (prefix2 >= 75 && prefix2 <= 77) return 'ORISSA';
  if (prefix2 === 78) return 'ASSAM';
  if (prefix2 === 79) return 'NORTH EAST';
  if (prefix2 >= 80 && prefix2 <= 85) return 'BIHAR';
  return null;
}
