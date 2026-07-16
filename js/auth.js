/* ================================================================
   FeMOS auth.js — Authentication Engine
   Registration · Login · Session · Profile
================================================================ */

'use strict';

const Auth = (() => {

  /* ── Universities database ── */
  const UNIVERSITIES = [
    { code:'MUST', name:'Mbeya University of Science and Technology',   short:'MUST', type:'Public', location:'Mbeya',         domain:'must.ac.tz',    regPattern:/^\d{14}$/,              regHint:'25101133930002',  campuses:[
      { code:'MC',     name:'Main Campus',   city:'Mbeya',       lat:-8.9000, lng:33.4600 },
      { code:'RKW',    name:'Rukwa Campus',  city:'Sumbawanga',  lat:-7.9647, lng:31.6117 },
      { code:'MTWARA', name:'Mtwara Campus', city:'Mtwara',      lat:-10.2667,lng:40.1833 },
    ]},
    { code:'UDSM', name:'University of Dar es Salaam',                  short:'UDSM', type:'Public', location:'Dar es Salaam', domain:'udsm.ac.tz',    regPattern:/^T\.\d{2}\.\d{3,6}$/,  regHint:'T.24.001', campuses:[
      { code:'MC',   name:'Mlimani Campus',                    city:'Dar es Salaam', lat:-6.7726, lng:39.2316 },
      { code:'MCHS', name:'Mbeya College of Health Sciences',  city:'Mbeya',         lat:-8.9000, lng:33.4600 },
    ]},
    { code:'UDOM', name:'University of Dodoma',                         short:'UDOM', type:'Public', location:'Dodoma',        domain:'udom.ac.tz',    regPattern:/^\d{2}(T|ET)\d{6,8}$/, regHint:'24ET010001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dodoma', lat:-6.1722, lng:35.7395 },
    ]},
    { code:'ARU',  name:'Ardhi University',                             short:'ARU',  type:'Public', location:'Dar es Salaam', domain:'aru.ac.tz',     regPattern:/^AR\d{7,10}$/,          regHint:'AR2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.7600, lng:39.2400 },
    ]},
    { code:'SUA',  name:'Sokoine University of Agriculture',            short:'SUA',  type:'Public', location:'Morogoro',      domain:'sua.ac.tz',     regPattern:/^SUA\d{6,9}$/,          regHint:'SUA202400001', campuses:[
      { code:'MC', name:'Main Campus', city:'Morogoro', lat:-6.8644, lng:37.6628 },
    ]},
    { code:'MUHAS',name:'Muhimbili University of Health & Allied Sciences', short:'MUHAS', type:'Public', location:'Dar es Salaam', domain:'muhas.ac.tz', regPattern:/^MU\d{6,9}$/, regHint:'MU20240001', campuses:[
      { code:'MC',  name:'Muhimbili Campus',                   city:'Dar es Salaam', lat:-6.8002, lng:39.2082 },
      { code:'MOI', name:'Mwanza Referral Hospital Campus',    city:'Mwanza',        lat:-2.5167, lng:32.9000 },
    ]},
    { code:'MU',   name:'Mzumbe University',                            short:'MU',   type:'Public', location:'Morogoro',      domain:'mzumbe.ac.tz',  regPattern:/^MZU\d{6,8}$/, regHint:'MZU2024001', campuses:[
      { code:'MC',  name:'Main Campus',              city:'Morogoro',      lat:-6.9000, lng:37.5000 },
      { code:'DSM', name:'Dar es Salaam Campus',     city:'Dar es Salaam', lat:-6.8000, lng:39.2800 },
      { code:'MBY', name:'Mbeya Campus',             city:'Mbeya',         lat:-8.9000, lng:33.4600 },
    ]},
    { code:'MoCU', name:'Moshi Cooperative University',                 short:'MoCU', type:'Public', location:'Kilimanjaro',   domain:'mocu.ac.tz',    regPattern:/^MCU\d{6,8}$/, regHint:'MCU2024001', campuses:[
      { code:'MC',  name:'Main Campus',          city:'Moshi',         lat:-3.3500, lng:37.3500 },
      { code:'DSM', name:'Dar es Salaam Campus', city:'Dar es Salaam', lat:-6.8000, lng:39.2800 },
    ]},
    { code:'OUT',  name:'Open University of Tanzania',                  short:'OUT',  type:'Public', location:'Dar es Salaam', domain:'out.ac.tz',     regPattern:/^OUT\d{6,10}$/, regHint:'OUT202400001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.8200, lng:39.2500 },
    ]},
    { code:'IFM',  name:'Institute of Finance Management',              short:'IFM',  type:'Public', location:'Dar es Salaam', domain:'ifm.ac.tz',     regPattern:/^IFM\d{6,8}$/, regHint:'IFM2024001', campuses:[
      { code:'MC',  name:'Main Campus',    city:'Dar es Salaam', lat:-8.8100, lng:39.2800 },
      { code:'MBY', name:'Mbeya Campus',   city:'Mbeya',         lat:-8.9000, lng:33.4600 },
      { code:'MTW', name:'Mtwara Campus',  city:'Mtwara',        lat:-10.2667,lng:40.1833 },
    ]},
    { code:'SAUT', name:'St. Augustine University of Tanzania',         short:'SAUT', type:'Private',location:'Mwanza',        domain:'saut.ac.tz',    regPattern:/^SAUT\d{6,8}$/, regHint:'SAUT2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Mwanza', lat:-2.5167, lng:32.9000 },
    ]},
    { code:'DUCE', name:'Dar es Salaam University College of Education', short:'DUCE', type:'Public', location:'Dar es Salaam', domain:'duce.ac.tz',  regPattern:/^DUCE\d{5,8}$/, regHint:'DUCE202400001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.7800, lng:39.2600 },
    ]},
    { code:'CBE',  name:'College of Business Education',                short:'CBE',  type:'Public', location:'Dar es Salaam', domain:'cbe.ac.tz',     regPattern:/^CBE\d{5,8}$/, regHint:'CBE2024001', campuses:[
      { code:'DSM', name:'Dar es Salaam Campus', city:'Dar es Salaam', lat:-6.8100, lng:39.2900 },
      { code:'DDM', name:'Dodoma Campus',         city:'Dodoma',         lat:-6.1722, lng:35.7395 },
    ]},
    { code:'MUCE', name:'Mkwawa University College of Education',       short:'MUCE', type:'Public', location:'Iringa',        domain:'muce.ac.tz',    regPattern:/^MUCE\d{5,8}$/, regHint:'MUCE2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Iringa', lat:-7.7600, lng:35.7000 },
    ]},
    { code:'TPSC', name:'Tanzania Public Service College',              short:'TPSC', type:'Public', location:'Dar es Salaam', domain:'tpsc.ac.tz',    regPattern:/^TPSC\d{5,8}$/, regHint:'TPSC2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.7900, lng:39.2700 },
    ]},
    { code:'HKMU', name:'Hubert Kairuki Memorial University',           short:'HKMU', type:'Private',location:'Dar es Salaam', domain:'hkmu.ac.tz',    regPattern:/^HKM\d{6,8}$/, regHint:'HKM2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.7700, lng:39.2300 },
    ]},
    { code:'RUCU', name:'Ruaha Catholic University',                    short:'RUCU', type:'Private',location:'Iringa',        domain:'rucu.ac.tz',    regPattern:/^RUC\d{6,8}$/, regHint:'RUC2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Iringa', lat:-7.7700, lng:35.6900 },
    ]},
    { code:'TEKU', name:'Teofilo Kisanji University',                   short:'TEKU', type:'Private',location:'Mbeya',         domain:'teku.ac.tz',    regPattern:/^TEK\d{6,8}$/, regHint:'TEK2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Mbeya', lat:-8.9100, lng:33.4500 },
    ]},
    { code:'ISW',  name:'Institute of Social Work',                     short:'ISW',  type:'Public', location:'Dar es Salaam', domain:'isw.ac.tz',     regPattern:/^ISW\d{5,8}$/, regHint:'ISW2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.8300, lng:39.2900 },
    ]},
    { code:'IAA',  name:'Institute of Accountancy Arusha',              short:'IAA',  type:'Public', location:'Arusha',        domain:'iaa.ac.tz',     regPattern:/^IAA\d{5,8}$/, regHint:'IAA2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Arusha', lat:-3.3869, lng:36.6830 },
    ]},
    { code:'NIT',  name:'National Institute of Transport',              short:'NIT',  type:'Public', location:'Dar es Salaam', domain:'nit.ac.tz',     regPattern:/^NIT\d{5,8}$/, regHint:'NIT2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.8000, lng:39.2800 },
    ]},
    { code:'TIA',  name:'Tanzania Institute of Accountancy',            short:'TIA',  type:'Public', location:'Dar es Salaam', domain:'tia.ac.tz',     regPattern:/^TIA\d{5,8}$/, regHint:'TIA2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.8100, lng:39.2700 },
    ]},
    { code:'SUZA', name:'State University of Zanzibar',                 short:'SUZA', type:'Public', location:'Zanzibar',      domain:'suza.ac.tz',    regPattern:/^SUZ\d{5,8}$/, regHint:'SUZ2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Zanzibar', lat:-6.1600, lng:39.2000 },
    ]},
    { code:'AKU',  name:'Aga Khan University',                          short:'AKU',  type:'Private',location:'Dar es Salaam', domain:'aku.edu',       regPattern:/^AKU\d{5,8}$/, regHint:'AKU2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Dar es Salaam', lat:-6.7800, lng:39.2500 },
    ]},
    { code:'CUHAS',name:'Catholic University of Health & Allied Sciences', short:'CUHAS', type:'Private', location:'Mwanza', domain:'cuhas.ac.tz', regPattern:/^CUH\d{5,8}$/, regHint:'CUH2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Mwanza', lat:-2.5000, lng:32.8900 },
    ]},
    { code:'TUMA', name:'Tumaini University Makumira',                  short:'TUMA', type:'Private',location:'Arusha',        domain:'tuma.ac.tz',    regPattern:/^TUM\d{5,8}$/, regHint:'TUM2024001', campuses:[
      { code:'MC', name:'Main Campus', city:'Arusha', lat:-3.4000, lng:36.9000 },
    ]},
  ];

  /* ── MUST Courses (from Almanac) ── */
  const MUST_COURSES = [
    { faculty: 'Faculty of Science & Technology', icon: 'code', depts: [
      { name: 'Computer Science & Engineering', courses: [
        { code:'BCSE', name:'Bachelor of Science in Computer Science & Engineering', years:4, nta:8 },
        { code:'BELE', name:'Bachelor of Science in Electrical Engineering',          years:4, nta:8 },
        { code:'BECE', name:'Bachelor of Science in Electronics & Communication Eng.', years:4, nta:8 },
        { code:'BCIV', name:'Bachelor of Science in Civil Engineering',               years:4, nta:8 },
        { code:'BMEC', name:'Bachelor of Science in Mechanical Engineering',          years:4, nta:8 },
        { code:'BARC', name:'Bachelor of Science in Architecture',                    years:5, nta:8 },
        { code:'BCHE', name:'Bachelor of Science in Chemical & Process Engineering',  years:4, nta:8 },
        { code:'BMIN', name:'Bachelor of Science in Mining Engineering',              years:4, nta:8 },
      ]},
    ]},
    { faculty: 'Faculty of Science', icon: 'search', depts: [
      { name: 'Pure & Applied Sciences', courses: [
        { code:'BSCS', name:'Bachelor of Science in Computer Science',          years:3, nta:8 },
        { code:'BSIT', name:'Bachelor of Science in Information Technology',    years:3, nta:8 },
        { code:'BSNE', name:'Bachelor of Science in Network Engineering',       years:3, nta:8 },
        { code:'BSMA', name:'Bachelor of Science in Mathematics',               years:3, nta:8 },
        { code:'BSPH', name:'Bachelor of Science in Physics',                   years:3, nta:8 },
        { code:'BSMT', name:'Bachelor of Science in Statistics',                years:3, nta:8 },
        { code:'BSBC', name:'Bachelor of Science in Biochemistry',              years:3, nta:8 },
        { code:'BSCH', name:'Bachelor of Science in Chemistry',                 years:3, nta:8 },
      ]},
    ]},
    { faculty: 'Faculty of Business & Management', icon: 'briefcase', depts: [
      { name: 'Business & Management', courses: [
        { code:'BBAM', name:'Bachelor of Business Administration & Management', years:3, nta:8 },
        { code:'BACC', name:'Bachelor of Accounting & Finance',                  years:3, nta:8 },
        { code:'BHRM', name:'Bachelor of Human Resource Management',             years:3, nta:8 },
        { code:'BPRO', name:'Bachelor of Procurement & Logistics Management',    years:3, nta:8 },
        { code:'BMKT', name:'Bachelor of Marketing Management',                  years:3, nta:8 },
        { code:'BECO', name:'Bachelor of Economics',                             years:3, nta:8 },
      ]},
    ]},
    { faculty: 'Faculty of Education', icon: 'book', depts: [
      { name: 'Education', courses: [
        { code:'BEDU', name:'Bachelor of Education (Science)',                  years:3, nta:8 },
        { code:'BEDS', name:'Bachelor of Education (Secondary)',                years:3, nta:8 },
        { code:'BTEC', name:'Bachelor of Technical Education',                  years:3, nta:8 },
        { code:'BSED', name:'Bachelor of Science Education',                    years:3, nta:8 },
      ]},
    ]},
    { faculty: 'Faculty of Earth Sciences & Engineering', icon: 'mapPin', depts: [
      { name: 'Earth Sciences', courses: [
        { code:'BSUR', name:'Bachelor of Science in Surveying & Mapping',       years:4, nta:8 },
        { code:'BGEO', name:'Bachelor of Science in Geology',                   years:3, nta:8 },
        { code:'BENV', name:'Bachelor of Science in Environmental Engineering', years:4, nta:8 },
        { code:'BGIS', name:'Bachelor of Science in GIS & Remote Sensing',      years:3, nta:8 },
        { code:'BMIN2','name':'Bachelor of Science in Mineral Processing',       years:4, nta:8 },
      ]},
    ]},
    { faculty: 'Postgraduate Programmes', icon: 'award', depts: [
      { name: 'Postgraduate', courses: [
        { code:'MSCE',  name:'Master of Science in Computer Engineering',          years:2, nta:9 },
        { code:'MSEE',  name:'Master of Science in Electrical Engineering',        years:2, nta:9 },
        { code:'MSBA',  name:'Master of Science in Business Administration (MBA)', years:2, nta:9 },
        { code:'MSCSE', name:'Master of Science in Computer Science',              years:2, nta:9 },
        { code:'PHDIT', name:'Doctor of Philosophy in Information Technology',     years:3, nta:10 },
        { code:'PHDE',  name:'Doctor of Philosophy in Engineering',                years:3, nta:10 },
      ]},
    ]},
  ];

  /* ── Generic courses for other universities ── */
  const GENERIC_COURSES = [
    { faculty: 'Faculty of Science & Technology', icon: 'code', depts: [{ name: 'Technology', courses: [
      { code:'BCS',  name:'Bachelor of Computer Science',           years:3, nta:8 },
      { code:'BIT',  name:'Bachelor of Information Technology',     years:3, nta:8 },
      { code:'BEE',  name:'Bachelor of Electrical Engineering',     years:4, nta:8 },
      { code:'BCE',  name:'Bachelor of Civil Engineering',          years:4, nta:8 },
      { code:'BME',  name:'Bachelor of Mechanical Engineering',     years:4, nta:8 },
    ]}]},
    { faculty: 'Faculty of Business', icon: 'briefcase', depts: [{ name: 'Business', courses: [
      { code:'BBA',  name:'Bachelor of Business Administration',    years:3, nta:8 },
      { code:'BAF',  name:'Bachelor of Accounting & Finance',       years:3, nta:8 },
      { code:'BEC',  name:'Bachelor of Economics',                  years:3, nta:8 },
      { code:'BHRM', name:'Bachelor of Human Resource Management',  years:3, nta:8 },
    ]}]},
    { faculty: 'Faculty of Education', icon: 'book', depts: [{ name: 'Education', courses: [
      { code:'BED',  name:'Bachelor of Education',                  years:3, nta:8 },
      { code:'BEDS', name:'Bachelor of Education (Secondary)',       years:3, nta:8 },
    ]}]},
    { faculty: 'Faculty of Law', icon: 'shield', depts: [{ name: 'Law', courses: [
      { code:'LLB',  name:'Bachelor of Laws (LLB)',                 years:3, nta:8 },
    ]}]},
    { faculty: 'Faculty of Social Sciences', icon: 'globe', depts: [{ name: 'Social Sciences', courses: [
      { code:'BSS',  name:'Bachelor of Social Sciences',            years:3, nta:8 },
      { code:'BCM',  name:'Bachelor of Communication & Media',      years:3, nta:8 },
      { code:'BSW',  name:'Bachelor of Social Work',                years:3, nta:8 },
    ]}]},
    { faculty: 'Postgraduate', icon: 'award', depts: [{ name: 'Postgraduate', courses: [
      { code:'MBA',  name:'Master of Business Administration',      years:2, nta:9 },
      { code:'MCS',  name:'Master of Computer Science',             years:2, nta:9 },
      { code:'PHD',  name:'Doctor of Philosophy',                   years:3, nta:10},
    ]}]},
  ];

  /* ── Role definitions ── */
  const ROLES = {
    student:      { label: 'Student',                  icon: 'user' },
    lecturer:     { label: 'Lecturer',                 icon: 'teacher' },
    cr:           { label: 'Class Representative (CR)',icon: 'award' },
    hod:          { label: 'Head of Department (HOD)',  icon: 'building' },
    'uni-admin':  { label: 'University Administrator', icon: 'briefcase' },
  };

  /* ── Session management ── */
  const Session = {
    KEY: 'current_session',

    save(user) {
      DB.LS.set(this.KEY, { ...user, loginAt: Date.now() });
    },

    load() {
      return DB.LS.get(this.KEY);
    },

    clear() {
      DB.LS.remove(this.KEY);
    },

    isValid() {
      const s = this.load();
      if (!s) return false;
      // Sessions expire after 30 days
      const maxAge = 30 * 24 * 60 * 60 * 1000;
      return (Date.now() - s.loginAt) < maxAge;
    },
  };

  /* ── Pending users (awaiting approval) ── */
  const Pending = {
    KEY: 'pending_user',
    save(data) { DB.LS.set(this.KEY, data); },
    load()     { return DB.LS.get(this.KEY); },
    clear()    { DB.LS.remove(this.KEY); },
  };

  /* ── Detect university from Reg No input ── */
  function detectUniversity(raw) {
    const input = raw.trim().toUpperCase();

    // Format: UNICODE/REG_NO
    const slashIdx = input.indexOf('/');
    if (slashIdx > 0) {
      const code   = input.slice(0, slashIdx);
      const regNo  = input.slice(slashIdx + 1);
      const uni    = UNIVERSITIES.find(u => u.code === code || u.short === code);
      if (uni) return { uni, regNo, raw: input };
    }

    // Try regex match on whole input (no prefix)
    const cleaned = input.replace(/^[A-Z\-]+\//, '');
    for (const u of UNIVERSITIES) {
      if (u.regPattern && u.regPattern.test(cleaned)) {
        return { uni: u, regNo: cleaned, raw: input };
      }
    }

    // Fallback: 14-digit = MUST
    if (/^\d{14}$/.test(cleaned)) {
      return { uni: UNIVERSITIES[0], regNo: cleaned, raw: input };
    }

    return null;
  }

  /* ── Get courses for a university ── */
  function getCoursesFor(uniCode) {
    return uniCode === 'MUST' ? MUST_COURSES : GENERIC_COURSES;
  }

  /* ── Register a new user ── */
  async function register(data) {
    // data: { firstName, lastName, email, phone, password, regNo,
    //         university (code), universityName, campus (code), campusName,
    //         courseCode, courseName, year, emoji, colorId, role }

    const users = DB.LS.get('users') || [];

    // Check duplicate email
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'That email is already registered. Please sign in instead.' };
    }

    // Check duplicate reg no
    if (users.find(u => u.regNo === data.regNo)) {
      return { ok: false, error: 'That registration number already exists. Contact your supervisor.' };
    }

    const newUser = {
      id:              Utils.ID.short(),
      firstName:       data.firstName.trim(),
      lastName:        data.lastName.trim(),
      name:            `${data.firstName.trim()} ${data.lastName.trim()}`,
      email:           data.email.toLowerCase().trim(),
      phone:           data.phone?.trim() || '',
      password:        data.password, // In production: bcrypt hash
      regNo:           data.regNo,
      role:            data.role || 'student',
      university:      data.university,
      universityName:  data.universityName,
      campusCode:      data.campusCode,
      campusName:      data.campusName,
      courseCode:      data.courseCode,
      courseName:      data.courseName,
      year:            data.year || 1,
      emoji:           data.emoji || '',
      colorId:         data.colorId ?? 0,
      uniqueId:        null,          // assigned after approval
      status:          'pending',     // pending | approved | rejected
      createdAt:       Date.now(),
      approvedAt:      null,
      approvedBy:      null,
    };

    users.push(newUser);
    DB.LS.set('users', users);
    Pending.save(newUser);

    return { ok: true, user: newUser };
  }

  /* ── Approve a pending user ── */
  function approve(userId, approvedBy = 'system') {
    const users  = DB.LS.get('users') || [];
    const idx    = users.findIndex(u => u.id === userId);
    if (idx < 0) return { ok: false, error: 'Student not found.' };

    const user   = users[idx];
    const uid    = Utils.ID.femsUID(user.university, user.campusCode);

    users[idx] = {
      ...user,
      uniqueId:   uid,
      status:     'approved',
      approvedAt: Date.now(),
      approvedBy,
    };

    DB.LS.set('users', users);

    // If this is current pending user, update pending
    const pending = Pending.load();
    if (pending && pending.id === userId) {
      Pending.save(users[idx]);
    }

    return { ok: true, user: users[idx] };
  }

  /* ── Login ── */
  async function login(identifier, password) {
    const SEED_USERS = [
      {
        id: 'demo_student', firstName:'Amina', lastName:'Hassan',
        name:'Amina Hassan', email:'amina.hassan@must.ac.tz',
        phone:'+255712345678', password:'demo123', regNo:'25101133930002',
        role:'student', university:'MUST',
        universityName:'Mbeya University of Science and Technology',
        campusCode:'MC', campusName:'Main Campus',
        courseCode:'BCSE', courseName:'Bachelor of Science in Computer Science & Engineering',
        year:3, emoji:'', colorId:0,
        uniqueId:'FEMOS-MUST-MC-2024-004821', status:'approved',
        createdAt:Date.now()-86400000*60, approvedAt:Date.now()-86400000*59,
      },
      {
        id: 'demo_lecturer', firstName:'David', lastName:'Mkwasa',
        name:'Dr. David Mkwasa', email:'d.mkwasa@must.ac.tz',
        phone:'+255723456789', password:'demo123', regNo:'STAFF/MUST/2018/001',
        role:'lecturer', university:'MUST',
        universityName:'Mbeya University of Science and Technology',
        campusCode:'MC', campusName:'Main Campus',
        courseCode:'BCSE', courseName:'Computer Science & Engineering Dept.',
        year:null, emoji:'', colorId:3,
        uniqueId:'FEMOS-MUST-MC-2018-000042', status:'approved',
        createdAt:Date.now()-86400000*180, approvedAt:Date.now()-86400000*179,
      },
      {
        id: 'demo_admin', firstName:'Admin', lastName:'MUST',
        name:'Admin MUST', email:'admin@must.ac.tz',
        phone:'+255734567890', password:'admin123', regNo:'ADMIN/MUST/001',
        role:'uni-admin', university:'MUST',
        universityName:'Mbeya University of Science and Technology',
        campusCode:'MC', campusName:'Main Campus',
        courseCode:'ADMIN', courseName:'Administration',
        year:null, emoji:'', colorId:5,
        uniqueId:'FEMOS-MUST-MC-2020-000001', status:'approved',
        createdAt:Date.now()-86400000*365, approvedAt:Date.now()-86400000*365,
      },
    ];

    const users   = [...SEED_USERS, ...(DB.LS.get('users') || [])];
    const id_low  = identifier.trim().toLowerCase();

    const user = users.find(u =>
      u.email.toLowerCase() === id_low ||
      u.uniqueId === identifier.trim() ||
      u.regNo   === identifier.trim() ||
      (u.university && `${u.university}/${u.regNo}`.toLowerCase() === id_low)
    );

    if (!user) return { ok: false, error: 'Account not found. Check your email or Unique ID.' };
    if (user.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
    if (user.status === 'pending') return { ok: false, error: 'Your account is still awaiting lecturer approval.', pending: true };
    if (user.status === 'rejected') return { ok: false, error: 'Your application was rejected. Contact your university administrator.', rejected: true };

    Session.save(user);
    return { ok: true, user };
  }

  /* ── Logout ── */
  function logout() {
    Session.clear();
  }

  return {
    UNIVERSITIES,
    MUST_COURSES,
    GENERIC_COURSES,
    ROLES,
    Session,
    Pending,
    detectUniversity,
    getCoursesFor,
    register,
    approve,
    login,
    logout,
  };

})();

window.Auth = Auth;
