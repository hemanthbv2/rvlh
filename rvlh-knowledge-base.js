/**
 * RV Learning Hub (RVLH) - Comprehensive Multi-Institute Knowledge Base
 * Exhaustive data covering all 8 PU colleges, 5 academic coaching tracks,
 * fee structures, scholarship slabs, daily routines, transport, and admissions.
 */

const RVLH_KB = {
  central: {
    name: "RV Learning Hub (RVLH)",
    parentTrust: "Rashtreeya Sikshana Samithi Trust (RSST)",
    foundedYear: 1940,
    legacy: "85+ years of historic educational excellence across Karnataka",
    mission: "Synchronizing Karnataka State Pre-University board curriculum with premier national entrance coaching (JEE, NEET, CA Foundation, KCET) under one unified timetable.",
    headquarters: {
      address: "131/78, Sunkenahalli, Bull Temple Road, Bengaluru – 560019",
      phone: ["080-2663 2000", "+91 83173 46585"],
      email: "admissions.rvlh@rvei.edu.in",
      portalUrl: "https://admissions.rvlearninghub.com",
      website: "https://rvlearninghub.com",
      workingHours: "Monday to Saturday: 8:30 AM - 6:00 PM"
    },
    pedagogy: {
      name: "The Decoded Methodology",
      pillars: [
        {
          title: "Zero-Clash Synchronized Curriculum",
          desc: "PU Board syllabus (theory & derivations) and competitive entrance concepts (shortcuts & speed drills) are taught by the same master faculty in parallel—eliminating outside tuition stress."
        },
        {
          title: "Elite National Faculty",
          desc: "Lecturers drawn from top IITs, NITs, senior medical academies, and practicing Chartered Accountants with 12+ years of proven entrance mentorship."
        },
        {
          title: "AI-Powered Test Analytics",
          desc: "Weekly Computer-Based Tests (CBT) and OMR drills with question-level diagnostic reports analyzing accuracy, negative marks, and speed per subject."
        },
        {
          title: "Daily 1-on-1 Doubt Resolution Clinics",
          desc: "Dedicated faculty clinic hours every day after lectures to ensure zero conceptual backlog before progressing to the next chapter."
        }
      ]
    },
    scholarships: {
      name: "RV-TSA (RVLH Talent & Scholarship Assessment)",
      description: "Merit-based tuition fee waivers designed to ensure financial constraints never prevent talented students from studying at RV.",
      slabs: [
        {
          tier: "Platinum Scholar",
          criteria: "96% and above in 10th Board (SSLC/CBSE/ICSE) OR Top 5% in RV-TSA",
          waiver: "100% Tuition Fee Waiver"
        },
        {
          tier: "Gold Scholar",
          criteria: "91% to 95.9% in 10th Board OR Top 15% in RV-TSA",
          waiver: "50% Tuition Fee Waiver"
        },
        {
          tier: "Silver Scholar",
          criteria: "85% to 90.9% in 10th Board OR Top 30% in RV-TSA",
          waiver: "25% Tuition Fee Waiver"
        },
        {
          tier: "Sports & Special Talent",
          criteria: "National / State level representation in recognized sports or Olympiads",
          waiver: "Up to 50% Special Scholarship"
        }
      ]
    },
    admissionSteps: [
      { step: 1, title: "Online Registration", desc: "Submit application on admissions.rvlearninghub.com or via this chatbot." },
      { step: 2, title: "RV-TSA Scholarship Test", desc: "Appear for the online or in-campus diagnostic scholarship assessment." },
      { step: 3, title: "Counseling & Campus Tour", desc: "Meet senior academic heads with your parents to select stream & batch." },
      { step: 4, title: "Document Verification", desc: "Verification of 10th marks card, transfer certificate, and photo ID." },
      { step: 5, title: "Seat Confirmation", desc: "Payment of admission fee and allocation of batch, books, and uniform." }
    ],
    director: {
      name: "Mr. Mayur Goyal",
      title: "Director, RV Learning Hub (RVLH)",
      organization: "Rashtreeya Sikshana Samithi Trust (RSST)",
      assistantDirector: "Mr. Srivatsa PV",
      vision: "Empowering Karnataka's Pre-University students through synchronized competitive coaching (JEE, NEET, CA, KCET) integrated seamlessly into the PU Board academic calendar.",
      governingTrust: "Rashtreeya Sikshana Samithi Trust (RSST)",
      president: "Dr. M.P. Shyam (President, RSST)",
      secretary: "Dr. (h.c.) A.V.S. Murthy (Hon. Secretary, RSST)",
      facultyPageUrl: "faculty.html"
    }
  },

  // Schedules
  dailySchedules: {
    dayScholar: {
      title: "Day Scholar Schedule (SSMRV, NMKRV, North, South, E-City, VVN)",
      timings: [
        { time: "08:15 AM - 08:30 AM", activity: "Campus Arrival & Morning Assembly / Meditation" },
        { time: "08:30 AM - 10:30 AM", activity: "Session 1: PU Board Theory & Core Concept Lectures" },
        { time: "10:30 AM - 10:45 AM", activity: "Short Refreshment Break" },
        { time: "10:45 AM - 01:00 PM", activity: "Session 2: Competitive Entrance Decoded Masterclass (JEE / NEET / CA)" },
        { time: "01:00 PM - 01:45 PM", activity: "Lunch Break" },
        { time: "01:45 PM - 03:15 PM", activity: "Session 3: Science Practical Labs / Case Studies / Speed Drills" },
        { time: "03:15 PM - 04:15 PM", activity: "Daily Practice Paper (DPP) & 1-on-1 Faculty Doubt Clinic" },
        { time: "04:15 PM", activity: "College Bus Departure" }
      ]
    },
    residential: {
      title: "Harohalli Residential Campus 24/7 Immersive Schedule",
      timings: [
        { time: "06:00 AM - 06:45 AM", activity: "Wake Up, Morning Jog & Yoga / Fitness" },
        { time: "06:45 AM - 07:45 AM", activity: "Freshen Up & Nutritious Vegetarian Breakfast" },
        { time: "08:00 AM - 01:15 PM", activity: "Academic Session: Integrated PU Board Theory & Advanced Problem Solving" },
        { time: "01:15 PM - 02:15 PM", activity: "Healthy Balanced Lunch & Campus Relaxation" },
        { time: "02:15 PM - 04:30 PM", activity: "Advanced CBT Simulation Tests / Laboratory Practicals" },
        { time: "04:30 PM - 05:45 PM", activity: "Evening Outdoor Sports (Cricket, Football, Basketball, Badminton)" },
        { time: "05:45 PM - 06:30 PM", activity: "Evening Tea & Snacks" },
        { time: "06:30 PM - 09:30 PM", activity: "Supervised Mentor Study Hours (Mandatory self-study with faculty on standby)" },
        { time: "09:30 PM - 10:15 PM", activity: "Nutritious Dinner & Peer Discussion" },
        { time: "10:30 PM", activity: "Lights Out & Rest" }
      ]
    }
  },

  // 8 Constituent PU Colleges under RVLH
  institutes: [
    {
      id: "ssmrv",
      name: "SSMRV PU College",
      shortName: "SSMRV",
      location: "Jayanagar 4th T Block, Bengaluru",
      address: "No. 17, 26th Main, 36th Cross, 4th 'T' Block, Jayanagar, Bengaluru - 560041",
      campusType: "Day Scholar (Co-ed)",
      zone: "South Bengaluru",
      landmark: "Near Jayanagar 4th T Block Bus Terminus",
      hasHostel: false,
      hostelNote: "SSMRV operates extensive dedicated bus fleets covering all major South, Central, and West Bengaluru routes. Outstation students seeking boarding are enrolled in our Harohalli Residential Campus.",
      streamsOffered: ["Science (PCMB, PCMC)", "Commerce (EBAC, MEBA)"],
      courseIds: ["jee_adv", "jee_main", "neet_ug", "commerce"],
      rvlhPrograms: ["JEE Advanced (Main + KCET)", "JEE Main + KCET Decoded", "NEET UG Decoded", "Commerce Decoded Programme"],
      description: "One of Karnataka's most acclaimed Pre-University institutions with a decades-long record of top 10 State PU Board ranks and high percentages in JEE & NEET.",
      highlights: [
        "Smart digital lecture theaters",
        "Cutting-edge Physics, Chemistry, Biology & Computer Labs",
        "Air-conditioned student study library with entrance archives",
        "Unmatched track record of sending students to RVCE, BMSCE, and Bangalore Medical College"
      ],
      transportRoutes: ["Banashankari", "JP Nagar", "BTM Layout", "Basavanagudi", "Kanakapura Road", "Vijayanagar"]
    },
    {
      id: "nmkrv",
      name: "NMKRV PU College for Women",
      shortName: "NMKRV",
      location: "Jayanagar 3rd Block, Bengaluru",
      address: "3rd Block, Jayanagar, Bengaluru - 560011",
      campusType: "Day Scholar & Residential (Exclusively Women)",
      zone: "South Bengaluru",
      landmark: "Opposite South End Circle Metro Station",
      hasHostel: true,
      hostelNote: "Dedicated secure on-campus Women's Hostel with biometric entry, 24/7 CCTV surveillance, resident wardens, and hygienic vegetarian dining.",
      streamsOffered: ["Science (PCMB, PCMC)", "Commerce (EBAC, MEBA, PEAC)"],
      courseIds: ["jee_main", "neet_ug", "commerce"],
      rvlhPrograms: ["JEE Main + KCET Decoded", "NEET UG Decoded", "Commerce Decoded Programme"],
      description: "Karnataka's benchmark women's institution empowering girl students in STEM and Commerce with academic rigor and personal leadership training.",
      highlights: [
        "Directly adjacent to South End Circle Metro Station (Green Line)",
        "Secure women's hostel inside the campus boundary",
        "Specialized girl student mentorship in medicine & finance",
        "High success rate in CA Foundation and NEET medical entrance"
      ],
      transportRoutes: ["Metro connectivity across all Bangalore lines", "Dedicated college buses from South & Central Bangalore"]
    },
    {
      id: "rv_north",
      name: "RV PU College North",
      shortName: "RV PU North",
      location: "North Bengaluru (Yelahanka / Sahakarnagar / Hebbal)",
      address: "North Campus, Bangalore North, Bengaluru",
      campusType: "Day Scholar (Co-ed)",
      zone: "North Bengaluru",
      landmark: "Easily accessible from Airport Road, Yelahanka & Hebbal flyover",
      hasHostel: false,
      hostelNote: "Day-scholar center equipped with college transport serving Yelahanka, Sahakarnagar, Hebbal, Jalahalli, and Vidyaranyapura.",
      streamsOffered: ["Science (PCMB, PCMC)"],
      courseIds: ["jee_adv", "jee_main", "neet_ug", "revise_cet"],
      rvlhPrograms: ["JEE Advanced (Main + KCET)", "JEE Main + KCET Decoded", "NEET UG Decoded", "ReVise CET"],
      description: "Established to bring the prestigious RV educational quality to students residing in North Bengaluru with integrated high-rank coaching.",
      highlights: [
        "Modern campus built with open-space architecture",
        "Computer-Based Testing (CBT) digital laboratory",
        "Experienced national faculty permanently stationed at North campus",
        "High focus on engineering and medical entrance speed techniques"
      ],
      transportRoutes: ["Yelahanka New Town", "Sahakarnagar", "Hebbal", "Manyata Tech Park corridor", "Vidyaranyapura"]
    },
    {
      id: "rv_south",
      name: "RV PU College South",
      shortName: "RV PU South",
      location: "South Bengaluru (Kanakapura Road / JP Nagar)",
      address: "South Campus, Bengaluru South, Karnataka",
      campusType: "Day Scholar (Co-ed)",
      zone: "South Bengaluru",
      landmark: "Near Kanakapura Road Metro Line",
      hasHostel: false,
      hostelNote: "Day-scholar facility with comprehensive bus transit covering South Bengaluru.",
      streamsOffered: ["Science (PCMB, PCMC)", "Commerce (EBAC)"],
      courseIds: ["jee_adv", "jee_main", "neet_ug", "commerce"],
      rvlhPrograms: ["JEE Advanced (Main + KCET)", "JEE Main + KCET Decoded", "NEET UG Decoded", "Commerce Decoded Programme"],
      description: "State-of-the-art South Bengaluru campus equipped with forward-looking labs and rigorous coaching pedagogy for science & commerce aspirants.",
      highlights: [
        "Smart digital classrooms with interactive boards",
        "Intensive problem-solving sessions and formula mind-maps",
        "Proximity to Green Line Metro for convenient daily commute"
      ],
      transportRoutes: ["Kanakapura Road", "JP Nagar (all phases)", "Kumaraswamy Layout", "Bannerghatta Road"]
    },
    {
      id: "rv_ecity",
      name: "RV PU College, Electronic City",
      shortName: "RV PU Electronic City",
      location: "Electronic City Phase 1, Bengaluru",
      address: "Electronic City Phase 1 / Tech Corridor, Bengaluru - 560100",
      campusType: "Day Scholar (Co-ed)",
      zone: "East / South-East Bengaluru",
      landmark: "Adjacent to Electronic City Tech Corridor",
      hasHostel: false,
      hostelNote: "Day college catering to students along Hosur Road, Electronic City, BTM, and Bommasandra.",
      streamsOffered: ["Science (PCMB, PCMC)"],
      courseIds: ["jee_adv", "jee_main", "neet_ug"],
      rvlhPrograms: ["JEE Advanced (Main + KCET)", "JEE Main + KCET Decoded", "NEET UG Decoded"],
      description: "Located in the heart of Bengaluru's Silicon Hub, designed for future engineers and technologists aiming for top-tier IITs, NITs, and IIITs.",
      highlights: [
        "Tech-integrated learning environment",
        "High focus on JEE Advanced conceptual rigor and physics modeling",
        "Fast-track connectivity via elevated expressway and upcoming Yellow Line Metro"
      ],
      transportRoutes: ["Electronic City Phase 1 & 2", "Bommasandra", "HSR Layout", "BTM Layout", "Hosur Road"]
    },
    {
      id: "rv_harohalli",
      name: "RV PU College, Harohalli (Residential)",
      shortName: "RV PU Harohalli",
      location: "Harohalli, Kanakapura Highway",
      address: "RV Vidyaniketan Post, Harohalli, Ramanagara Dist / Kanakapura Road, Karnataka",
      campusType: "Residential & Day Boarding (Co-ed)",
      zone: "Outskirts / Kanakapura Corridor",
      landmark: "Serene, sprawling 50+ acre green campus on Kanakapura Highway",
      hasHostel: true,
      hostelNote: "Premier 50-acre residential campus! Features separate air-cooled boys' and girls' hostels with 24/7 medical room, hygienic vegetarian dining, sports grounds, and evening supervised study halls.",
      streamsOffered: ["Science (PCMB, PCMC)"],
      courseIds: ["jee_adv", "jee_main", "neet_ug"],
      rvlhPrograms: ["JEE Advanced (Main + KCET)", "JEE Main + KCET Decoded", "NEET UG Decoded"],
      description: "A world-class residential and integrated learning sanctuary away from city distractions. Ideal for serious entrance exam aspirants who thrive in a disciplined, 24/7 mentor-supervised environment.",
      highlights: [
        "Complete distraction-free 50-acre eco-friendly green campus",
        "Evening mentor study hours (6:30 PM - 9:30 PM) with resident faculty",
        "Nutritious vegetarian meals planned by sports nutritionists",
        "Full medical clinic with resident nurse and doctor on call",
        "Expansive athletic grounds: cricket pitch, football, basketball, tennis, indoor gym"
      ],
      transportRoutes: ["Weekend transport shuttle to Bengaluru city centers for residential students", "Day boarding buses along Kanakapura corridor"]
    },
    {
      id: "rv_mysuru",
      name: "RV PU College, Mysuru",
      shortName: "RV PU Mysuru",
      location: "Mysuru City, Karnataka",
      address: "Heritage Campus, Mysuru, Karnataka - 570001",
      campusType: "Day Scholar & Local Boarding Support",
      zone: "Mysuru Region",
      landmark: "Accessible from all parts of Mysore city",
      hasHostel: true,
      hostelNote: "Tie-up boarding facilities available for outstation students from Mandya, Hassan, and Coorg.",
      streamsOffered: ["Science (PCMB, PCMC)", "Commerce (EBAC)"],
      courseIds: ["jee_main", "neet_ug", "commerce", "revise_cet"],
      rvlhPrograms: ["JEE Main + KCET Decoded", "NEET UG Decoded", "Commerce Decoded Programme", "ReVise CET"],
      description: "Brings RV's benchmark academic excellence to the heritage city of Mysuru, offering localized integrated coaching for Karnataka CET, NEET, and JEE.",
      highlights: [
        "Senior master faculty rotated from RV Bangalore headquarters",
        "Proven track record in KCET & NEET state ranks in the Mysore region",
        "Spacious campus library with entrance prep resources"
      ],
      transportRoutes: ["Covering all major localities in Mysore City: Vijayanagar, Kuvempunagar, Saraswathipuram, Gokulam"]
    },
    {
      id: "vvn",
      name: "VVN PU College, Bengaluru",
      shortName: "VVN PU College",
      location: "VV Puram, Central Bengaluru",
      address: "V.V. Puram, Bengaluru - 560004",
      campusType: "Day Scholar (Co-ed)",
      zone: "Central / South Bengaluru",
      landmark: "Near National College Metro Station & VV Puram cultural center",
      hasHostel: false,
      hostelNote: "Day scholar institution in central Bangalore. Conveniently connected by Green Line Metro.",
      streamsOffered: ["Science (PCMB, PCMC)", "Commerce (EBAC, MEBA)"],
      courseIds: ["jee_main", "neet_ug", "commerce"],
      rvlhPrograms: ["JEE Main + KCET Decoded", "NEET UG Decoded", "Commerce Decoded Programme"],
      description: "A prestigious educational collaboration between V.V.N. Trust and RV Educational Institutions (RVEI) under an official MoU, uniting a century of educational heritage with modern decoded coaching.",
      highlights: [
        "Prime central city location with 2-minute walk from National College Metro Station",
        "Heritage educational institution combined with modern decoded coaching methodology",
        "Affordable fee structure with high return on academic outcomes"
      ],
      transportRoutes: ["Connected by Namma Metro Green Line", "Central BMTC bus terminal proximity"]
    }
  ],

  // 5 Core Academic Tracks
  courses: [
    {
      id: "jee_adv",
      title: "JEE Advanced (Main + KCET Decoded)",
      category: "Science (Engineering)",
      duration: "2-Year Integrated (PU-I + PU-II)",
      targetExams: ["JEE Advanced (IITs)", "JEE Main (NITs/IIITs)", "KCET (RVCE, BMSCE, MSRIT)", "BITS / COMEDK"],
      eligibility: "Completed 10th standard (min 75% in Science & Maths recommended)",
      keySubjects: ["Physics", "Chemistry", "Mathematics"],
      features: [
        "Rigorous multi-concept problem sets targeting top 1,000 national ranks in JEE Advanced",
        "Deep foundational conceptual drills aligning board curriculum with IIT-JEE standards",
        "150+ simulated online computer-based tests (CBT) mirroring the real NTA/IIT interface",
        "Masterclasses by senior IIT alumni and subject experts",
        "Weekly rank analysis and micro-level negative marking rectification"
      ],
      campuses: ["ssmrv", "rv_north", "rv_south", "rv_ecity", "rv_harohalli"]
    },
    {
      id: "jee_main",
      title: "JEE (Main + KCET Decoded)",
      category: "Science (Engineering)",
      duration: "2-Year Integrated (PU-I + PU-II)",
      targetExams: ["JEE Main", "KCET", "COMEDK", "State Engineering Entrances"],
      eligibility: "Completed 10th standard",
      keySubjects: ["Physics", "Chemistry", "Mathematics"],
      features: [
        "Balanced dual focus on securing 98%+ in Karnataka PU Board and 99+ percentile in JEE Main",
        "Karnataka CET shortcut methods, speed-maths, and time management hacks",
        "Comprehensive question banks with 15+ years of solved past papers",
        "Guaranteed readiness for admission into premier colleges like RVCE"
      ],
      campuses: ["ssmrv", "nmkrv", "rv_north", "rv_south", "rv_ecity", "rv_harohalli", "rv_mysuru", "vvn"]
    },
    {
      id: "neet_ug",
      title: "NEET UG Decoded",
      category: "Medical",
      duration: "2-Year Integrated (PU-I + PU-II)",
      targetExams: ["NEET UG (MBBS/BDS)", "AIIMS", "JIPMER", "Veterinary & Agri Entrances"],
      eligibility: "Completed 10th standard with Biology interest",
      keySubjects: ["Physics", "Chemistry", "Biology (Botany & Zoology)"],
      features: [
        "100% line-by-line NCERT dissection & memorization mapping",
        "Extensive diagram-based reasoning and assertion-reason mastery",
        "Speed-training to solve 180 questions within 180 minutes with zero panic",
        "Special doctor mentorship sessions and clinical orientation",
        "Full-length OMR sheet mock drills every alternate Saturday"
      ],
      campuses: ["ssmrv", "nmkrv", "rv_north", "rv_south", "rv_ecity", "rv_harohalli", "rv_mysuru", "vvn"]
    },
    {
      id: "commerce",
      title: "Commerce Decoded Programme",
      category: "Commerce & Professional Finance",
      duration: "2-Year Integrated (PU-I + PU-II)",
      targetExams: ["CA Foundation (ICAI)", "CMA Foundation", "CS Executive Entrance (CSEET)", "CUET (Central Universities)"],
      eligibility: "Completed 10th standard",
      keySubjects: ["Accountancy", "Business Studies", "Economics", "Statistics / Basic Maths"],
      features: [
        "Seamless integration of Karnataka PU Board Commerce syllabus with CA Foundation modules",
        "Classes led by practicing Chartered Accountants and financial analysts",
        "Practical financial literacy, balance sheet analysis, and business aptitude",
        "CUET coaching to enter top commerce colleges like SRCC, St. Xavier's, and Christ University",
        "Guest lectures by corporate CFOs and RV alumni"
      ],
      campuses: ["ssmrv", "nmkrv", "rv_south", "rv_mysuru", "vvn"]
    },
    {
      id: "revise_cet",
      title: "ReVise CET",
      category: "Fast-Track Revision / Crash",
      duration: "Fast-Track Intensive (30 to 60 Days before KCET)",
      targetExams: ["KCET (Karnataka Common Entrance Test)"],
      eligibility: "Students studying in or completed 12th / PU-II",
      keySubjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      features: [
        "High-yield formula revision and shortcut problem-solving techniques",
        "Chapter-wise quick-glance mind maps and cheat sheets",
        "Daily 60-minute simulated timed mock tests with detailed video solutions",
        "Focus on high-weightage topics to maximize score in minimum time"
      ],
      campuses: ["ssmrv", "rv_north", "rv_mysuru", "vvn"]
    }
  ],

  // Frequently Asked Questions
  faqs: [
    {
      question: "How do I apply for admission to RV Learning Hub?",
      keywords: ["apply", "admission", "process", "enroll", "registration", "form", "steps"],
      answer: "Admissions to RVLH for 2026-27 are open online!\n\n1. Submit application online at **admissions.rvlearninghub.com** or leave your details in this chat.\n2. Appear for the **RV-TSA Scholarship Test**.\n3. Attend personal counseling at your chosen campus with parents.\n4. Complete document verification and confirm seat."
    },
    {
      question: "Which campuses have hostel facilities?",
      keywords: ["hostel", "boarding", "stay", "accommodation", "residential", "room", "food"],
      answer: "For a complete residential experience, **RV PU College, Harohalli** is our flagship 50-acre residential campus with separate air-cooled hostels for boys and girls, 24/7 medical clinic, and evening mentor study hours.\n\nAdditionally, **NMKRV PU College** in Jayanagar offers a secure on-campus women's hostel. All our other city colleges are day-scholar campuses with extensive bus connectivity."
    },
    {
      question: "What is the fee structure for integrated coaching?",
      keywords: ["fee", "fees", "cost", "price", "installment", "structure", "amount"],
      answer: "Fee structures depend on:\n• The track (JEE Advanced, NEET UG, or Commerce Decoded)\n• Campus type (Day Scholar vs Harohalli Full Boarding)\n\nDay Scholar tuition ranges between ₹1.2L - ₹1.8L/year, while Harohalli Residential (including boarding, lodging, food & 24/7 coaching) is around ₹2.8L - ₹3.5L/year.\n\n🌟 **Up to 100% Scholarship is available** via the RV-TSA assessment test! Share your contact details to receive the exact fee brochure."
    },
    {
      question: "Can I prepare for both PU Board exams and NEET/JEE without stress?",
      keywords: ["integrated", "board", "pu board", "stress", "schedule", "syllabus", "timing", "clash"],
      answer: "Yes! That is why RVLH was created. In traditional setups, students attend college and then rush to separate coaching classes in the evening. At RVLH, PU Board theory and objective entrance problem-solving are integrated into a single unified college timetable. You don't need any outside tuition."
    },
    {
      question: "Where is the nearest RVLH campus to me?",
      keywords: ["near", "nearest", "location", "area", "distance", "bus", "transport", "zone"],
      answer: "RVLH operates 8 campuses:\n• **South Bengaluru:** SSMRV (Jayanagar), NMKRV (Women - Jayanagar), RV PU South (Kanakapura Rd)\n• **Central Bengaluru:** VVN PU College (VV Puram)\n• **North Bengaluru:** RV PU College North (Yelahanka/Hebbal)\n• **East / Tech Hub:** RV PU College, Electronic City\n• **Residential Campus:** RV PU College, Harohalli (50-Acre green sanctuary on Kanakapura Rd)\n• **Heritage City:** RV PU College, Mysuru\n\nTell me which area you live in and I will guide you to the closest campus!"
    }
  ],

  // Upcoming Events, Seminars & Open Houses
  events: [
    {
      id: "rv_tsa_exam_2026",
      title: "RV-TSA Scholarship & Talent Assessment Exam 2026-27 (Phase 1)",
      category: "Scholarship Test",
      date: "Sunday, October 11, 2026",
      time: "10:00 AM - 12:30 PM",
      location: "All 8 RVLH Campuses & Online CBT Mode",
      eligibility: "Students currently in 10th Grade (Moving to PU-I)",
      description: "National talent assessment offering up to 100% tuition scholarships for 2-Year integrated JEE, NEET, and Commerce coaching. Evaluates logical aptitude, science, and mathematics concepts.",
      badge: "🔥 Up to 100% Scholarship",
      link: "admissions.html#apply"
    },
    {
      id: "jee_decoded_masterclass",
      title: "Masterclass: Cracking JEE Advanced in Your First Attempt",
      category: "Academic Masterclass",
      date: "Saturday, October 17, 2026",
      time: "11:00 AM - 01:00 PM",
      location: "SSMRV Auditorium, Jayanagar & Live Stream",
      eligibility: "Aspiring Engineering Students & Parents",
      description: "Conducted by Director Mr. Mayur Goyal and senior IITians. Deconstructs multi-concept problems, board-to-entrance transition, and time optimization techniques.",
      badge: "⭐ Free Masterclass",
      link: "faculty.html"
    },
    {
      id: "harohalli_campus_open_house",
      title: "50-Acre Harohalli Residential Sanctuary Open House & Tour",
      category: "Campus Immersion Tour",
      date: "Sunday, October 25, 2026",
      time: "09:30 AM - 03:30 PM",
      location: "RV PU College, Harohalli (Kanakapura Road)",
      eligibility: "Students seeking residential boarding & parents",
      description: "Experience world-class residential boarding life firsthand. Guided tours of air-cooled dormitories, modern science labs, dining facilities, and 24/7 faculty study pods. Complimentary lunch provided.",
      badge: "🏡 Guided Campus Tour",
      link: "hostels.html"
    },
    {
      id: "neet_medical_blueprint",
      title: "NEET UG 2027 Strategy Workshop: 680+ Score Blueprint",
      category: "Medical Seminar",
      date: "Saturday, November 07, 2026",
      time: "02:30 PM - 05:00 PM",
      location: "RV PU College North (Yelahanka) & Online",
      eligibility: "Medical Aspirants (10th/11th Students)",
      description: "In-depth workshop on NCERT line-by-line decoding, Biology diagram mastery, and eliminating negative marking in Physics & Chemistry.",
      badge: "🩺 Medical Blueprint",
      link: "courses.html"
    },
    {
      id: "commerce_finance_summit",
      title: "Commerce Decoded: Career Horizons in CA, CMA, CS & Global Finance",
      category: "Commerce Summit",
      date: "Sunday, November 15, 2026",
      time: "10:30 AM - 01:00 PM",
      location: "NMKRV College for Women, Mangala Mantapa, Jayanagar",
      eligibility: "Commerce Aspirants & Parents",
      description: "Panel discussion with leading Chartered Accountants and RSST commerce mentors on completing CA Foundation alongside Karnataka PU Board without gap years.",
      badge: "📊 Finance Career Summit",
      link: "courses.html"
    },
    {
      id: "parent_counseling_conclave",
      title: "RSST Parents & Students Career Guidance Conclave 2026",
      category: "Counseling Conclave",
      date: "Sunday, November 29, 2026",
      time: "10:00 AM - 02:00 PM",
      location: "RSST Central Headquarters, Bull Temple Road, Basavanagudi",
      eligibility: "Open to All 10th Students & Parents",
      description: "One-on-one diagnostic career mapping with senior academic advisors, stream selection clarity (PCMB vs PCMC vs Commerce), and scholarship verification.",
      badge: "📍 Central RSST Event",
      link: "contact.html"
    }
  ],

  // Website Pages Directory (for direct chatbot navigation & smart page links)
  sitePages: [
    {
      key: "events",
      title: "Events & Calendar",
      url: "events.html",
      icon: "📅",
      brief: "Upcoming academic seminars, RV-TSA scholarship exam dates, 50-acre Harohalli open house tours, and JEE/NEET masterclasses.",
      actionLabel: "📅 Open Events Page"
    },
    {
      key: "campuses",
      title: "8 Campuses Directory",
      url: "campuses.html",
      icon: "🏛️",
      brief: "Complete guide to all 8 constituent PU colleges in Bengaluru and Mysuru with bus routes, facilities, and contact desks.",
      actionLabel: "🏛️ Open 8 Campuses Directory"
    },
    {
      key: "courses",
      title: "Decoded Courses & Tracks",
      url: "courses.html",
      icon: "📚",
      brief: "5 synchronized academic streams (JEE Advanced, JEE Main, NEET UG, Commerce Decoded, ReVise CET) with integrated board hours.",
      actionLabel: "📚 Open Courses Page"
    },
    {
      key: "faculty",
      title: "Faculty & Leadership",
      url: "faculty.html",
      icon: "👨‍🏫",
      brief: "Leadership spotlight on Director Mr. Mayur Goyal, RSST trust governance, and our 4 Decoded mentorship pillars.",
      actionLabel: "👨‍🏫 Open Faculty Page"
    },
    {
      key: "hostels",
      title: "Residential & Hostels",
      url: "hostels.html",
      icon: "🏡",
      brief: "50-Acre Harohalli Residential Campus with 24/7 study pods and dining, plus secure NMKRV Women's Hostel in Jayanagar.",
      actionLabel: "🏡 Open Hostels Page"
    },
    {
      key: "admissions",
      title: "Scholarships & Fees",
      url: "admissions.html",
      icon: "🎓",
      brief: "RV-TSA merit scholarship slabs (up to 100% tuition waiver), 2026-27 fee breakdowns, and direct online application.",
      actionLabel: "🎓 Open Scholarships & Fees Page"
    },
    {
      key: "contact",
      title: "Contact & Helplines",
      url: "contact.html",
      icon: "📞",
      brief: "RSST central headquarters at Bull Temple Road (080-2663 2000), admissions counseling desks, and campus maps.",
      actionLabel: "📞 Open Contact Page"
    },
    {
      key: "home",
      title: "RVLH Home Portal",
      url: "index.html",
      icon: "🏠",
      brief: "Flagship overview of RV Learning Hub under RSST (85+ years legacy), rankers showcase, and campus comparison.",
      actionLabel: "🏠 Open Home Page"
    }
  ]
};

// Export for Node environments if required, or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RVLH_KB;
} else if (typeof window !== 'undefined') {
  window.RVLH_KB = RVLH_KB;
}
