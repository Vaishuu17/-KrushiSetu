import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import API from '../api/axios';

const districtMap = {
  'Andhra Pradesh':['Anantapur','Chittoor','East Godavari','Guntur','Kadapa','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari','Eluru','Palnadu','Bapatla','Anakapalli','Kakinada','Konaseema','Tirupati','Annamayya','Nandyal','Sri Sathya Sai','Alluri Sitharama Raju'],
  'Arunachal Pradesh':['Itanagar','Tawang','Bomdila','Ziro','Pasighat','Tezu','Changlang','Along','Aalo','Daporijo','Roing','Khonsa','Seppa','Namsai','Yingkiong'],
  'Assam':['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','Goalpara','Karimganj','Kokrajhar','Sivasagar','Lakhimpur','Nalbari','Barpeta','Darrang','Sonitpur','Kamrup','Morigaon','Golaghat'],
  'Bihar':['Patna','Gaya','Bhagalpur','Muzaffarpur','Darbhanga','Ara','Saharsa','Sitamarhi','Hajipur','Katihar','Begusarai','Chapra','Munger','Purnia','Nalanda','Madhubani','Samastipur','Buxar','Nawada','Aurangabad','Jehanabad','Araria','Vaishali','Rohtas','Bettiah','Motihari','Siwan','Gopalganj','Kishanganj','Khagaria','Jamui','Lakhisarai','Sheikhpura','Sheohar','Supaul','Madhepura'],
  'Chhattisgarh':['Raipur','Bilaspur','Durg','Bhilai','Korba','Rajnandgaon','Jagdalpur','Ambikapur','Raigarh','Mahasamund','Kanker','Dhamtari','Janjgir-Champa','Kawardha','Kondagaon','Sukma','Bijapur','Narayanpur','Balod','Bemetara','Mungeli','Surajpur','Balrampur','Surguja'],
  'Goa':['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Canacona','Curchorem','Sanguem','Quepem','Pernem','Sattari'],
  'Gujarat':['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Anand','Mehsana','Patan','Junagadh','Porbandar','Kutch','Bharuch','Narmada','Navsari','Valsad','Dang','Tapi','Dahod','Panchmahal','Kheda','Amreli','Surendranagar','Morbi','Dwarka','Gir Somnath','Botad','Aravalli','Mahisagar','Chhota Udaipur','Banaskantha','Sabarkantha'],
  'Haryana':['Gurugram','Faridabad','Hisar','Rohtak','Panipat','Ambala','Karnal','Sonipat','Yamunanagar','Bhiwani','Jind','Kaithal','Sirsa','Rewari','Palwal','Mahendragarh','Panchkula','Fatehabad','Kurukshetra','Jhajjar','Nuh','Charkhi Dadri'],
  'Himachal Pradesh':['Shimla','Manali','Dharamshala','Solan','Mandi','Kullu','Hamirpur','Bilaspur','Una','Chamba','Sirmaur','Kangra','Kinnaur','Lahaul-Spiti'],
  'Jharkhand':['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Hazaribagh','Giridih','Dumka','Chaibasa','Palamu','Ramgarh','Koderma','Chatra','Godda','Sahebganj','Pakur','Latehar','Lohardaga','Gumla','Simdega','Khunti','Seraikela'],
  'Karnataka':['Bengaluru','Mysuru','Hubli-Dharwad','Mangaluru','Belagavi','Davanagere','Ballari','Vijayapura','Hassan','Shivamogga','Tumakuru','Raichur','Bidar','Gulbarga','Mandya','Udupi','Chitradurga','Chikkamagaluru','Kolar','Chamarajanagar','Kodagu','Bagalkot','Gadag','Haveri','Koppal','Ramanagara','Yadgir','Chikkaballapur','Dakshina Kannada','Uttara Kannada'],
  'Kerala':['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Kannur','Alappuzha','Kottayam','Malappuram','Palakkad','Pathanamthitta','Idukki','Ernakulam','Wayanad','Kasaragod'],
  'Madhya Pradesh':['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Rewa','Satna','Ratlam','Dewas','Chhindwara','Hoshangabad','Katni','Vidisha','Shivpuri','Mandsaur','Neemuch','Khandwa','Burhanpur','Khargone','Dhar','Jhabua','Shahdol','Damoh','Panna','Tikamgarh','Chhatarpur','Morena','Bhind','Datia','Balaghat','Seoni','Mandla','Dindori','Anuppur','Umaria','Singrauli','Sidhi','Narsinghpur','Harda','Betul','Agar Malwa','Rajgarh','Shajapur','Ashoknagar','Barwani','Alirajpur'],
  'Maharashtra':['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Kolhapur','Satara','Sangli','Ahmednagar','Thane','Raigad','Ratnagiri','Sindhudurg','Dhule','Jalgaon','Nandurbar','Beed','Latur','Osmanabad','Nanded','Parbhani','Hingoli','Jalna','Buldhana','Akola','Washim','Amravati','Yavatmal','Wardha','Chandrapur','Gadchiroli','Gondia','Bhandara','Palghar'],
  'Manipur':['Imphal','Thoubal','Bishnupur','Churachandpur','Chandel','Ukhrul','Senapati','Tamenglong','Jiribam','Kangpokpi','Noney','Pherzawl','Tengnoupal','Kamjong','Kakching'],
  'Meghalaya':['Shillong','Tura','Jowai','Nongstoin','Williamnagar','Baghmara','Resubelpara','Khliehriat','Nongpoh','Mawkyrwat','Mairang','Ampati'],
  'Mizoram':['Aizawl','Lunglei','Champhai','Serchhip','Kolasib','Lawngtlai','Saiha','Mamit','Hnahthial','Khawzawl','Saitual'],
  'Nagaland':['Kohima','Dimapur','Mokokchung','Tuensang','Wokha','Zunheboto','Phek','Mon','Longleng','Peren','Kiphire','Noklak','Tseminyu','Niuland','Chumoukedima','Shamator'],
  'Odisha':['Bhubaneswar','Cuttack','Rourkela','Sambalpur','Berhampur','Puri','Balasore','Bhadrak','Koraput','Kendujhar','Jharsuguda','Kalahandi','Bolangir','Bargarh','Dhenkanal','Angul','Jajpur','Mayurbhanj','Ganjam','Rayagada','Nabarangpur','Malkangiri','Nayagarh','Kandhamal','Sundargarh','Deogarh','Nuapada','Sonepur','Boudh','Jagatsinghpur','Kendrapara','Khordha'],
  'Punjab':['Amritsar','Ludhiana','Patiala','Jalandhar','Bathinda','Hoshiarpur','Gurdaspur','Ferozepur','Faridkot','Mansa','Mohali','Sangrur','Barnala','Pathankot','Ropar','Nawanshahr','Moga','Muktsar','Kapurthala','Tarn Taran','Fatehgarh Sahib','Fazilka'],
  'Rajasthan':['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Sikar','Bhilwara','Barmer','Tonk','Bundi','Chittorgarh','Dungarpur','Banswara','Pratapgarh','Jhalawar','Baran','Sawai Madhopur','Karauli','Dausa','Dholpur','Bharatpur','Nagaur','Pali','Sirohi','Jalore','Jaisalmer','Hanumangarh','Sri Ganganagar','Churu','Jhunjhunu','Rajsamand'],
  'Sikkim':['Gangtok','Namchi','Gyalshing','Mangan','Pakyong','Soreng'],
  'Tamil Nadu':['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Vellore','Erode','Thoothukkudi','Dindigul','Thanjavur','Tirupur','Kanchipuram','Cuddalore','Nagapattinam','Ramanathapuram','Sivaganga','Virudhunagar','Villupuram','Karur','Perambalur','Ariyalur','Namakkal','Dharmapuri','Krishnagiri','Nilgiris','Tiruvannamalai','Pudukkottai','Tenkasi','Tirupattur','Ranipet','Chengalpattu','Kallakurichi','Mayiladuthurai'],
  'Telangana':['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Nalgonda','Adilabad','Mahbubnagar','Medak','Siddipet','Suryapet','Jagtial','Peddapalli','Kamareddy','Mancherial','Wanaparthy','Nagarkurnool','Jogulamba Gadwal','Sangareddy','Medchal-Malkajgiri','Vikarabad','Mahabubnagar','Rangareddy','Yadadri Bhuvanagiri','Jangaon','Jayashankar Bhupalpally','Mulugu','Narayanpet','Rajanna Sircilla'],
  'Tripura':['Agartala','Udaipur','Dharmanagar','Kailasahar','Belonia','Khowai','Ambassa','Sabroom','Melaghar','Bishalgarh'],
  'Uttar Pradesh':['Lucknow','Agra','Varanasi','Prayagraj','Kanpur','Meerut','Gorakhpur','Aligarh','Bareilly','Mathura','Moradabad','Ghaziabad','Noida','Saharanpur','Jhansi','Firozabad','Muzaffarnagar','Shahjahanpur','Lakhimpur Kheri','Unnao','Rae Bareli','Sitapur','Hardoi','Farrukhabad','Etawah','Mainpuri','Budaun','Rampur','Basti','Ayodhya','Sultanpur','Jaunpur','Mirzapur','Azamgarh','Mau','Gonda','Bahraich','Ballia','Deoria','Kushinagar','Maharajganj','Sant Kabir Nagar','Ambedkar Nagar','Amethi','Pratapgarh','Fatehpur','Hamirpur','Banda','Chitrakoot','Lalitpur','Sonbhadra','Bijnor','Amroha','Sambhal','Kasganj','Etah','Hathras','Bagpat','Bulandshahr','Gautam Buddha Nagar','Hapur','Shamli','Pilibhit','Auraiya','Kannauj','Kanpur Dehat'],
  'Uttarakhand':['Dehradun','Haridwar','Rishikesh','Nainital','Almora','Pithoragarh','Udham Singh Nagar','Roorkee','Haldwani','Pauri Garhwal','Tehri Garhwal','Chamoli','Rudraprayag','Bageshwar','Champawat'],
  'West Bengal':['Kolkata','Darjeeling','Siliguri','Asansol','Durgapur','Bardhaman','Malda','Murshidabad','Nadia','Howrah','Hooghly','Medinipur','Bankura','Purulia','Birbhum','North 24 Parganas','South 24 Parganas','Jalpaiguri','Cooch Behar','Alipurduar','Dinajpur','Jhargram','Paschim Bardhaman','Kalimpong'],
  'Delhi':['New Delhi','Central Delhi','North Delhi','South Delhi','East Delhi','West Delhi','North West Delhi','North East Delhi','South West Delhi','South East Delhi','Shahdara'],
  'Jammu & Kashmir':['Srinagar','Jammu','Anantnag','Baramulla','Pulwama','Kupwara','Udhampur','Rajouri','Poonch','Doda','Kishtwar','Kathua','Samba','Reasi','Ramban','Kulgam','Shopian','Bandipora','Ganderbal','Budgam'],
  'Ladakh':['Leh','Kargil'],
  'Chandigarh':['Chandigarh'],
  'Puducherry':['Puducherry','Karaikal','Mahe','Yanam'],
  'Andaman & Nicobar':['Port Blair','Car Nicobar','Mayabunder','Diglipur','Rangat','Havelock Island'],
  'Dadra Nagar Haveli & Daman Diu':['Silvassa','Daman','Diu'],
  'Lakshadweep':['Kavaratti','Agatti','Amini','Andrott','Minicoy'],
};

function fmtAadhaar(val) {
  let v = val.replace(/\D/g,'').substring(0,12);
  return [v.slice(0,4),v.slice(4,8),v.slice(8,12)].filter(Boolean).join(' ');
}

export default function Register() {
  const navigate = useNavigate();
  const { loginFarmer, loginAdmin, loginBuyer } = useAuth();

  const [mode, setMode] = useState('signup'); // signup | login
  const [signupRole, setSignupRole] = useState('farmer');
  const [loginRole, setLoginRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showPass, setShowPass] = useState({});

  // Farmer signup state
  const [fs, setFs] = useState({ name:'', password:'', phone:'', aadhaar:'', state:'', district:'', land:'', crop:'', income:'' });
  const [fsErr, setFsErr] = useState({});

  // Admin signup state
  const [as, setAs] = useState({ name:'', empId:'', username:'', password:'', department:'', phone:'' });
  const [asErr, setAsErr] = useState({});

  // Farmer login state
  const [fl, setFl] = useState({ phone:'', password:'' });
  const [flErr, setFlErr] = useState({});

  // Admin login state
  const [al, setAl] = useState({ username:'', password:'' });
  const [alErr, setAlErr] = useState({});

  // Buyer signup state
  const [bs, setBs] = useState({ name:'', password:'', phone:'', businessName:'', businessType:'', state:'', district:'' });
  const [bsErr, setBsErr] = useState({});

  // Buyer login state
  const [bl, setBl] = useState({ phone:'', password:'' });
  const [blErr, setBlErr] = useState({});

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500); };

  const togglePass = (field) => setShowPass(p => ({...p,[field]:!p[field]}));

  const farmerRegister = async () => {
    let err = {};
    if (!fs.name) err.name = 'Name is required';
    if (!/^\d{10}$/.test(fs.phone)) err.phone = 'Enter valid 10-digit number';
    if (fs.aadhaar.replace(/\s/g,'').length !== 12) err.aadhaar = 'Enter valid 12-digit Aadhaar';
    if (!fs.state) err.state = 'Please select state';
    if (!fs.district) err.district = 'Please select district';
    if (!fs.crop) err.crop = 'Please select a crop';
    if (fs.password.length < 6) err.password = 'Min 6 characters required';
    setFsErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/farmer', { ...fs, aadhaar: fs.aadhaar.replace(/\s/g,'') });
      loginFarmer(data.farmer, data.token);
      toast('Welcome ' + data.farmer.name + '! Kisan Dashboard ready 🌾');
      setTimeout(() => navigate('/farmer'), 500);
    } catch(e) {
      toast('❌ ' + (e.response?.data?.message || 'Registration failed'));
    }
    setLoading(false);
  };

  const adminRegister = async () => {
    let err = {};
    if (!as.name) err.name = 'Name required';
    if (!as.empId) err.empId = 'Employee ID required';
    if (!as.username) err.username = 'Username required';
    if (as.password.length < 6) err.password = 'Min 6 chars required';
    if (!as.department) err.department = 'Please select department';
    if (!/^\d{10}$/.test(as.phone)) err.phone = 'Valid 10-digit number required';
    setAsErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/admin', as);
      loginAdmin(data.admin, data.token);
      toast('Admin registered & logged in 🔐');
      setTimeout(() => navigate('/admin'), 500);
    } catch(e) {
      toast('❌ ' + (e.response?.data?.message || 'Registration failed'));
    }
    setLoading(false);
  };

  const farmerLoginFn = async () => {
    let err = {};
    if (!fl.phone) err.phone = 'Please enter mobile or Aadhaar';
    if (fl.password.length < 6) err.password = 'Min 6 character password';
    setFlErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login/farmer', fl);
      loginFarmer(data.farmer, data.token);
      toast('Welcome back ' + data.farmer.name + '! 🌾');
      setTimeout(() => navigate('/farmer'), 500);
    } catch(e) {
      const msg = e.response?.data?.message || 'Invalid credentials';
      setFlErr({ phone: msg, password: 'Check your password' });
      toast('❌ ' + msg);
    }
    setLoading(false);
  };

  const adminLoginFn = async () => {
    let err = {};
    if (!al.username) err.username = 'Username required';
    if (!al.password) err.password = 'Password required';
    setAlErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login/admin', al);
      loginAdmin(data.admin, data.token);
      toast('Welcome Admin ' + al.username + '! 🔐');
      setTimeout(() => navigate('/admin'), 500);
    } catch(e) {
      setAlErr({ username: 'Invalid credentials', password: 'Wrong password' });
    }
    setLoading(false);
  };

  const buyerRegister = async () => {
    let err = {};
    if (!bs.name) err.name = 'Name required';
    if (!/^\d{10}$/.test(bs.phone)) err.phone = 'Enter valid 10-digit number';
    if (!bs.businessType) err.businessType = 'Select business type';
    if (!bs.state) err.state = 'Select state';
    if (!bs.district) err.district = 'Select district';
    if (bs.password.length < 6) err.password = 'Min 6 characters';
    setBsErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register/buyer', bs);
      loginBuyer(data.buyer, data.token);
      toast('Welcome ' + data.buyer.name + '! Buyer Dashboard ready 🛒');
      setTimeout(() => navigate('/buyer'), 500);
    } catch(e) { toast('❌ ' + (e.response?.data?.message || 'Registration failed')); }
    setLoading(false);
  };

  const buyerLoginFn = async () => {
    let err = {};
    if (!bl.phone) err.phone = 'Enter mobile number';
    if (bl.password.length < 6) err.password = 'Min 6 characters';
    setBlErr(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login/buyer', bl);
      loginBuyer(data.buyer, data.token);
      toast('Welcome back ' + data.buyer.name + '! 🛒');
      setTimeout(() => navigate('/buyer'), 500);
    } catch(e) {
      setBlErr({ phone: 'Invalid credentials', password: 'Check password' });
      toast('❌ ' + (e.response?.data?.message || 'Invalid credentials'));
    }
    setLoading(false);
  };

  return (
    <div className="page active" id="page-register">
      {toastMsg && <div className="toast show">{toastMsg}</div>}
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🌾 <span>KrushiSetu</span></div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSelector />
          <a onClick={() => navigate('/')} style={{ color: '#c8e6c9', cursor: 'pointer' }}>← Back to Home</a>
        </div>
      </nav>

      <div className="reg-page">
        <div className="reg-box">
          <div className="reg-header">
            <div className="reg-logo">🌾 <span>KrushiSetu</span></div>
            <div style={{fontSize:'.82rem',color:'#a5d6a7',marginTop:'.2rem'}}>Kisan se Bazaar tak – Sab kuch ek Setu par</div>
            <div className="reg-toggle">
              <button className={mode==='signup'?'active':''} onClick={() => setMode('signup')}>📝 Sign Up</button>
              <button className={mode==='login'?'active':''} onClick={() => setMode('login')}>🔐 Login</button>
            </div>
          </div>

          <div className="reg-body">
            {/* SIGNUP FORM */}
            <div className={`reg-form${mode==='signup'?' active':''}`} id="reg-signup">
              <div className="reg-role-tabs">
                <button className={`reg-role-tab${signupRole==='farmer'?' active':''}`} onClick={() => setSignupRole('farmer')}>👨‍🌾 Farmer</button>
                <button className={`reg-role-tab${signupRole==='buyer'?' active':''}`} onClick={() => setSignupRole('buyer')}>🛒 Buyer</button>
                <button className={`reg-role-tab${signupRole==='admin'?' active':''}`} onClick={() => setSignupRole('admin')}>👨‍💼 Admin</button>
              </div>

              {signupRole === 'farmer' && (
                <div id="reg-farmer-fields">
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Full Name *</label>
                      <input value={fs.name} onChange={e=>setFs({...fs,name:e.target.value})} placeholder="Ramesh Kumar Patel" type="text"/>
                      {fsErr.name && <div className="reg-err" style={{display:'block'}}>{fsErr.name}</div>}
                    </div>
                    <div className="reg-field pass-wrap">
                      <label>Password *</label>
                      <input value={fs.password} onChange={e=>setFs({...fs,password:e.target.value})} placeholder="Min 6 characters" type={showPass.fp?'text':'password'}/>
                      <button className="reg-eye" type="button" onClick={() => togglePass('fp')}>{showPass.fp?'🙈':'👁️'}</button>
                      {fsErr.password && <div className="reg-err" style={{display:'block'}}>{fsErr.password}</div>}
                    </div>
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Mobile Number *</label>
                      <input value={fs.phone} onChange={e=>setFs({...fs,phone:e.target.value})} maxLength="10" placeholder="10-digit mobile no." type="tel"/>
                      {fsErr.phone && <div className="reg-err" style={{display:'block'}}>{fsErr.phone}</div>}
                    </div>
                    <div className="reg-field">
                      <label>Aadhaar Number *</label>
                      <input value={fs.aadhaar} onChange={e=>setFs({...fs,aadhaar:fmtAadhaar(e.target.value)})} maxLength="14" placeholder="XXXX XXXX XXXX" type="text"/>
                      {fsErr.aadhaar && <div className="reg-err" style={{display:'block'}}>{fsErr.aadhaar}</div>}
                    </div>
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>State *</label>
                      <select value={fs.state} onChange={e=>setFs({...fs,state:e.target.value,district:''})}>
                        <option value="">Select State</option>
                        {Object.keys(districtMap).map(s=><option key={s}>{s}</option>)}
                      </select>
                      {fsErr.state && <div className="reg-err" style={{display:'block'}}>{fsErr.state}</div>}
                    </div>
                    <div className="reg-field">
                      <label>District *</label>
                      <select value={fs.district} onChange={e=>setFs({...fs,district:e.target.value})}>
                        <option value="">Select District</option>
                        {(districtMap[fs.state]||[]).map(d=><option key={d}>{d}</option>)}
                      </select>
                      {fsErr.district && <div className="reg-err" style={{display:'block'}}>{fsErr.district}</div>}
                    </div>
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Land Area (Acres) *</label>
                      <input value={fs.land} onChange={e=>setFs({...fs,land:e.target.value})} min="0.1" placeholder="5.5" step="0.1" type="number"/>
                    </div>
                    <div className="reg-field">
                      <label>Primary Crop *</label>
                      <select value={fs.crop} onChange={e=>setFs({...fs,crop:e.target.value})}>
                        <option value="">Select Crop</option>
                        <optgroup label="🌾 Cereals & Millets">
                          <option>Wheat (गेहूं)</option><option>Rice (धान)</option><option>Maize (मक्का)</option>
                          <option>Bajra (बाजरा)</option><option>Jowar (ज्वार)</option><option>Ragi (रागी)</option>
                          <option>Barley (जौ)</option><option>Oats (जई)</option><option>Foxtail Millet (कंगनी)</option>
                          <option>Pearl Millet (बाजरा)</option><option>Finger Millet (मंडुआ)</option>
                        </optgroup>
                        <optgroup label="🫘 Pulses & Legumes">
                          <option>Chana / Chickpea (चना)</option><option>Arhar / Tur Dal (अरहर)</option>
                          <option>Moong Dal (मूंग)</option><option>Urad Dal (उड़द)</option><option>Masoor Dal (मसूर)</option>
                          <option>Rajma (राजमा)</option><option>Lobia / Cowpea (लोबिया)</option><option>Moth Bean (मोठ)</option>
                          <option>Horse Gram (कुलथी)</option><option>Peas (मटर)</option>
                        </optgroup>
                        <optgroup label="🌻 Oilseeds">
                          <option>Soybean (सोयाबीन)</option><option>Groundnut (मूंगफली)</option><option>Mustard (सरसों)</option>
                          <option>Sunflower (सूरजमुखी)</option><option>Sesame (तिल)</option><option>Linseed (अलसी)</option>
                          <option>Castor (अरंडी)</option><option>Safflower (कुसुम)</option><option>Niger Seed (रामतिल)</option>
                          <option>Coconut (नारियल)</option><option>Palm Oil</option>
                        </optgroup>
                        <optgroup label="💰 Cash Crops">
                          <option>Sugarcane (गन्ना)</option><option>Cotton (कपास)</option><option>Jute (जूट)</option>
                          <option>Tobacco (तम्बाकू)</option><option>Tea (चाय)</option><option>Coffee (कॉफी)</option>
                          <option>Rubber (रबर)</option>
                        </optgroup>
                        <optgroup label="🥬 Vegetables">
                          <option>Onion (प्याज)</option><option>Tomato (टमाटर)</option><option>Potato (आलू)</option>
                          <option>Brinjal (बैंगन)</option><option>Cauliflower (फूलगोभी)</option><option>Cabbage (पत्तागोभी)</option>
                          <option>Okra / Lady Finger (भिंडी)</option><option>Bottle Gourd (लौकी)</option>
                          <option>Bitter Gourd (करेला)</option><option>Pumpkin (कद्दू)</option>
                          <option>Spinach (पालक)</option><option>Carrot (गाजर)</option><option>Radish (मूली)</option>
                          <option>Green Peas (हरी मटर)</option><option>Garlic (लहसुन)</option><option>Ginger (अदरक)</option>
                          <option>Cucumber (खीरा)</option><option>Drumstick (सहजन)</option><option>Sweet Potato (शकरकंद)</option>
                        </optgroup>
                        <optgroup label="🍎 Fruits">
                          <option>Mango (आम)</option><option>Banana (केला)</option><option>Grapes (अंगूर)</option>
                          <option>Orange (संतरा)</option><option>Apple (सेब)</option><option>Papaya (पपीता)</option>
                          <option>Guava (अमरूद)</option><option>Pomegranate (अनार)</option><option>Lemon / Lime (नींबू)</option>
                          <option>Watermelon (तरबूज)</option><option>Litchi (लीची)</option><option>Jackfruit (कटहल)</option>
                          <option>Pineapple (अनानास)</option><option>Sapota / Chikoo (चीकू)</option>
                          <option>Custard Apple (सीताफल)</option><option>Strawberry</option><option>Kiwi</option>
                          <option>Dragon Fruit</option><option>Coconut (नारियल)</option><option>Dates (खजूर)</option>
                        </optgroup>
                        <optgroup label="🌶️ Spices & Condiments">
                          <option>Turmeric (हल्दी)</option><option>Chili (मिर्च)</option><option>Coriander (धनिया)</option>
                          <option>Cumin (जीरा)</option><option>Fenugreek (मेथी)</option><option>Black Pepper (काली मिर्च)</option>
                          <option>Cardamom (इलायची)</option><option>Clove (लौंग)</option><option>Cinnamon (दालचीनी)</option>
                          <option>Fennel (सौंफ)</option><option>Ajwain (अजवाइन)</option><option>Nutmeg (जायफल)</option>
                          <option>Saffron (केसर)</option><option>Vanilla</option>
                        </optgroup>
                        <optgroup label="🌿 Flowers & Plantation">
                          <option>Marigold (गेंदा)</option><option>Rose (गुलाब)</option><option>Jasmine (चमेली)</option>
                          <option>Arecanut / Supari (सुपारी)</option><option>Betel Leaf (पान)</option>
                          <option>Bamboo (बांस)</option><option>Sandalwood (चंदन)</option><option>Teak (सागवान)</option>
                          <option>Aloe Vera (एलोवेरा)</option><option>Neem (नीम)</option>
                          <option>Mushroom (मशरूम)</option>
                        </optgroup>
                        <optgroup label="🐄 Fodder & Others">
                          <option>Berseem (बरसीम)</option><option>Napier Grass</option><option>Lucerne (रिजका)</option>
                          <option>Hemp (भांग/सन)</option><option>Flax (अलसी)</option><option>Sericulture / Silk</option>
                        </optgroup>
                      </select>
                      {fsErr.crop && <div className="reg-err" style={{display:'block'}}>{fsErr.crop}</div>}
                    </div>
                  </div>
                  <div className="reg-field">
                    <label>Annual Income (₹)</label>
                    <input value={fs.income} onChange={e=>setFs({...fs,income:e.target.value})} placeholder="120000" type="number"/>
                  </div>
                  <button className="reg-submit" onClick={farmerRegister} disabled={loading}>
                    {loading ? '⏳ Registering...' : '🌾 Register as Farmer'}
                  </button>
                </div>
              )}

              {signupRole === 'buyer' && (
                <div id="reg-buyer-fields">
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Full Name *</label>
                      <input value={bs.name} onChange={e=>setBs({...bs,name:e.target.value})} placeholder="Business Owner Name" type="text"/>
                      {bsErr.name && <div className="reg-err" style={{display:'block'}}>{bsErr.name}</div>}
                    </div>
                    <div className="reg-field pass-wrap">
                      <label>Password *</label>
                      <input value={bs.password} onChange={e=>setBs({...bs,password:e.target.value})} placeholder="Min 6 characters" type={showPass.bp?'text':'password'}/>
                      <button className="reg-eye" type="button" onClick={() => togglePass('bp')}>{showPass.bp?'🙈':'👁️'}</button>
                      {bsErr.password && <div className="reg-err" style={{display:'block'}}>{bsErr.password}</div>}
                    </div>
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Mobile Number *</label>
                      <input value={bs.phone} onChange={e=>setBs({...bs,phone:e.target.value})} maxLength="10" placeholder="10-digit mobile" type="tel"/>
                      {bsErr.phone && <div className="reg-err" style={{display:'block'}}>{bsErr.phone}</div>}
                    </div>
                    <div className="reg-field">
                      <label>Business Name</label>
                      <input value={bs.businessName} onChange={e=>setBs({...bs,businessName:e.target.value})} placeholder="Your Business/Shop Name" type="text"/>
                    </div>
                  </div>
                  <div className="reg-field">
                    <label>Business Type *</label>
                    <select value={bs.businessType} onChange={e=>setBs({...bs,businessType:e.target.value})}>
                      <option value="">Select Type</option>
                      <option>Retailer</option><option>Wholesaler</option><option>Restaurant / Hotel</option>
                      <option>Exporter</option><option>Food Processor</option><option>Supermarket Chain</option>
                      <option>Online Platform</option><option>Individual Buyer</option>
                    </select>
                    {bsErr.businessType && <div className="reg-err" style={{display:'block'}}>{bsErr.businessType}</div>}
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>State *</label>
                      <select value={bs.state} onChange={e=>setBs({...bs,state:e.target.value,district:''})}>
                        <option value="">Select State</option>
                        {Object.keys(districtMap).map(s=><option key={s}>{s}</option>)}
                      </select>
                      {bsErr.state && <div className="reg-err" style={{display:'block'}}>{bsErr.state}</div>}
                    </div>
                    <div className="reg-field">
                      <label>District *</label>
                      <select value={bs.district} onChange={e=>setBs({...bs,district:e.target.value})}>
                        <option value="">Select District</option>
                        {(districtMap[bs.state]||[]).map(d=><option key={d}>{d}</option>)}
                      </select>
                      {bsErr.district && <div className="reg-err" style={{display:'block'}}>{bsErr.district}</div>}
                    </div>
                  </div>
                  <button className="reg-submit" onClick={buyerRegister} disabled={loading} style={{background:'#1565C0'}}>
                    {loading ? '⏳ Registering...' : '🛒 Register as Buyer'}
                  </button>
                </div>
              )}

              {signupRole === 'admin' && (
                <div id="reg-admin-fields">
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Admin Name *</label>
                      <input value={as.name} onChange={e=>setAs({...as,name:e.target.value})} placeholder="Admin Full Name" type="text"/>
                      {asErr.name && <div className="reg-err" style={{display:'block'}}>{asErr.name}</div>}
                    </div>
                    <div className="reg-field">
                      <label>Employee ID *</label>
                      <input value={as.empId} onChange={e=>setAs({...as,empId:e.target.value})} placeholder="GOV-12345" type="text"/>
                      {asErr.empId && <div className="reg-err" style={{display:'block'}}>{asErr.empId}</div>}
                    </div>
                  </div>
                  <div className="reg-2col">
                    <div className="reg-field">
                      <label>Username *</label>
                      <input value={as.username} onChange={e=>setAs({...as,username:e.target.value})} placeholder="admin_username" type="text"/>
                      {asErr.username && <div className="reg-err" style={{display:'block'}}>{asErr.username}</div>}
                    </div>
                    <div className="reg-field pass-wrap">
                      <label>Password *</label>
                      <input value={as.password} onChange={e=>setAs({...as,password:e.target.value})} placeholder="Strong password" type={showPass.ap?'text':'password'}/>
                      <button className="reg-eye" type="button" onClick={() => togglePass('ap')}>{showPass.ap?'🙈':'👁️'}</button>
                      {asErr.password && <div className="reg-err" style={{display:'block'}}>{asErr.password}</div>}
                    </div>
                  </div>
                  <div className="reg-field">
                    <label>Department *</label>
                    <select value={as.department} onChange={e=>setAs({...as,department:e.target.value})}>
                      <option value="">Select Department</option>
                      <option>Agriculture Department</option><option>Rural Development</option>
                      <option>Cooperative Society</option><option>Bank/NABARD</option><option>District Collectorate</option>
                    </select>
                    {asErr.department && <div className="reg-err" style={{display:'block'}}>{asErr.department}</div>}
                  </div>
                  <div className="reg-field">
                    <label>Mobile Number *</label>
                    <input value={as.phone} onChange={e=>setAs({...as,phone:e.target.value})} maxLength="10" placeholder="10-digit mobile" type="tel"/>
                    {asErr.phone && <div className="reg-err" style={{display:'block'}}>{asErr.phone}</div>}
                  </div>
                  <button className="reg-submit" onClick={adminRegister} disabled={loading} style={{background:'#1a1a2e'}}>
                    {loading ? '⏳ Registering...' : '🔐 Register as Admin'}
                  </button>
                </div>
              )}
            </div>

            {/* LOGIN FORM */}
            <div className={`reg-form${mode==='login'?' active':''}`} id="reg-login">
              <div className="reg-role-tabs">
                <button className={`reg-role-tab${loginRole==='farmer'?' active':''}`} onClick={() => setLoginRole('farmer')}>👨‍🌾 Farmer</button>
                <button className={`reg-role-tab${loginRole==='buyer'?' active':''}`} onClick={() => setLoginRole('buyer')}>🛒 Buyer</button>
                <button className={`reg-role-tab${loginRole==='admin'?' active':''}`} onClick={() => setLoginRole('admin')}>👨‍💼 Admin</button>
              </div>

              {loginRole === 'farmer' && (
                <div id="login-farmer-fields">
                  <div className="reg-field">
                    <label>Mobile Number / Aadhaar</label>
                    <input value={fl.phone} onChange={e=>setFl({...fl,phone:e.target.value})} placeholder="10-digit mobile or Aadhaar" type="text"/>
                    {flErr.phone && <div className="reg-err" style={{display:'block'}}>{flErr.phone}</div>}
                  </div>
                  <div className="reg-field pass-wrap">
                    <label>Password</label>
                    <input value={fl.password} onChange={e=>setFl({...fl,password:e.target.value})} placeholder="Your password" type={showPass.flp?'text':'password'}/>
                    <button className="reg-eye" type="button" onClick={() => togglePass('flp')}>{showPass.flp?'🙈':'👁️'}</button>
                    {flErr.password && <div className="reg-err" style={{display:'block'}}>{flErr.password}</div>}
                  </div>
                  <div style={{background:'#E8F5E9',borderRadius:'10px',padding:'.75rem',marginBottom:'.75rem',fontSize:'.8rem',color:'var(--primary-dark)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem'}}>
                    <div>💡 <b>Demo:</b> 9876543210 / kisan123</div>
                    <button type="button" onClick={() => setFl({ phone: '9876543210', password: 'kisan123' })} style={{ background: '#2E7D32', color: '#fff', border: 'none', padding: '.25rem .6rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      ⚡ Auto-Fill
                    </button>
                  </div>
                  <button className="reg-submit" onClick={farmerLoginFn} disabled={loading}>
                    {loading ? '⏳ Logging in...' : '🌾 Login to Dashboard'}
                  </button>
                </div>
              )}

              {loginRole === 'buyer' && (
                <div id="login-buyer-fields">
                  <div className="reg-field">
                    <label>Mobile Number</label>
                    <input value={bl.phone} onChange={e=>setBl({...bl,phone:e.target.value})} placeholder="10-digit mobile" type="text"/>
                    {blErr.phone && <div className="reg-err" style={{display:'block'}}>{blErr.phone}</div>}
                  </div>
                  <div className="reg-field pass-wrap">
                    <label>Password</label>
                    <input value={bl.password} onChange={e=>setBl({...bl,password:e.target.value})} placeholder="Your password" type={showPass.blp?'text':'password'}/>
                    <button className="reg-eye" type="button" onClick={() => togglePass('blp')}>{showPass.blp?'🙈':'👁️'}</button>
                    {blErr.password && <div className="reg-err" style={{display:'block'}}>{blErr.password}</div>}
                  </div>
                  <div style={{background:'#E3F2FD',borderRadius:'10px',padding:'.75rem',marginBottom:'.75rem',fontSize:'.8rem',color:'#0D47A1',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem'}}>
                    <div>💡 <b>Demo Buyer:</b> 9988776655 / buyer123</div>
                    <button type="button" onClick={() => setBl({ phone: '9988776655', password: 'buyer123' })} style={{ background: '#1565C0', color: '#fff', border: 'none', padding: '.25rem .6rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      ⚡ Auto-Fill
                    </button>
                  </div>
                  <button className="reg-submit" onClick={buyerLoginFn} disabled={loading} style={{background:'#1565C0'}}>
                    {loading ? '⏳ Logging in...' : '🛒 Login as Buyer'}
                  </button>
                </div>
              )}

              {loginRole === 'admin' && (
                <div id="login-admin-fields">
                  <div className="reg-field">
                    <label>Admin Username</label>
                    <input value={al.username} onChange={e=>setAl({...al,username:e.target.value})} placeholder="admin username" type="text"/>
                    {alErr.username && <div className="reg-err" style={{display:'block'}}>{alErr.username}</div>}
                  </div>
                  <div className="reg-field pass-wrap">
                    <label>Password</label>
                    <input value={al.password} onChange={e=>setAl({...al,password:e.target.value})} placeholder="••••••••" type={showPass.alp?'text':'password'}/>
                    <button className="reg-eye" type="button" onClick={() => togglePass('alp')}>{showPass.alp?'🙈':'👁️'}</button>
                    {alErr.password && <div className="reg-err" style={{display:'block'}}>{alErr.password}</div>}
                  </div>
                  <div style={{background:'rgba(46,125,50,.07)',borderRadius:'10px',padding:'.75rem',marginBottom:'.75rem',fontSize:'.8rem',color:'var(--primary-dark)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem'}}>
                    <div>🔑 <b>Demo Admin:</b> yash / yash@123</div>
                    <button type="button" onClick={() => setAl({ username: 'yash', password: 'yash@123' })} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '.25rem .6rem', borderRadius: '4px', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      ⚡ Auto-Fill
                    </button>
                  </div>
                  <button className="reg-submit" onClick={adminLoginFn} disabled={loading} style={{background:'#1a1a2e'}}>
                    {loading ? '⏳ Logging in...' : '🔐 Access Admin Panel'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="reg-footer" id="reg-footer-msg">
            {mode === 'signup'
              ? <>Already have account? <a onClick={() => setMode('login')} style={{cursor:'pointer'}}>Login here</a></>
              : <>New user? <a onClick={() => setMode('signup')} style={{cursor:'pointer'}}>Register here</a></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
