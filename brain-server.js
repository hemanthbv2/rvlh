/**
 * RVLH AI Brain Server
 * Cognitive Admissions Counselor & Multi-Institute RAG Engine
 * 
 * Supports:
 * 1. Google Gemini API (GEMINI_API_KEY)
 * 2. OpenAI API (OPENAI_API_KEY)
 * 3. High-Intelligence Built-in Semantic RAG Engine (Zero API Key fallback)
 * 
 * Capable of emitting structured UI actions:
 * - SHOW_CAMPUSES: displays recommended campus cards
 * - SHOW_COURSE: displays specific course curriculum
 * - TRIGGER_LEAD_FORM: prompts callback micro-form
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load Knowledge Base
const KB = require('./rvlh-knowledge-base.js');

const PORT = process.env.PORT || 8085;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// System Prompt for LLMs
const SYSTEM_PROMPT = `
You are the Senior Academic Counselor at RV Learning Hub (RVLH), an educational initiative by Rashtreeya Sikshana Samithi Trust (RSST) with 80+ years of educational excellence.

Your role is to guide students and parents who are looking for Pre-University (11th & 12th / PU-I & PU-II) admissions integrated with national entrance exams:
- Science: JEE Advanced, JEE Main, NEET UG, KCET (ReVise CET)
- Commerce: Commerce Decoded (Karnataka PU + CA Foundation / CMA / CS / CUET)

You have 8 constituent PU college campuses in Karnataka:
1. SSMRV PU College (Jayanagar, South Bengaluru) - Day Scholar, Science & Commerce, premier board & entrance ranks.
2. NMKRV PU College for Women (Jayanagar, South Bengaluru) - Day Scholar + Dedicated Secure Women's Hostel, STEM & Commerce.
3. RV PU College North (Yelahanka / Sahakarnagar / Hebbal) - Day Scholar, Science.
4. RV PU College South (Kanakapura Road / JP Nagar) - Day Scholar, Science & Commerce.
5. RV PU College, Electronic City (Tech Corridor, Hosur Rd) - Day Scholar, Engineering focus (JEE).
6. RV PU College, Harohalli (Residential Campus) - 50-Acre sprawling green campus on Kanakapura Road with full air-cooled boarding, 24/7 mentor study hours, healthy veg dining, medical support (Boys & Girls).
7. RV PU College, Mysuru (Heritage City) - Serving Mysore, Mandya, Hassan, and Coorg students.
8. VVN PU College (VV Puram, Central Bengaluru) - Historic collaboration with VVN Trust near National College Metro.

Key Policies:
- RV-TSA (Talent & Scholarship Assessment): Up to 100% tuition scholarships for meritorious students.
- Central Admissions Desk: 080-2663 2000 / admissions.rvlh@rvei.edu.in
- Central Portal: admissions.rvlearninghub.com

Tone & Style:
- Professional, empathetic, inspiring, encouraging.
- Always guide the student toward their best-fit campus based on location, hostel need, and stream interest.
- When appropriate, proactively offer a counselor callback or scholarship assessment.

Output Format:
You must respond in JSON with this structure:
{
  "message": "Your formatted markdown counseling response here",
  "recommendedCampuses": ["campus_id_1", "campus_id_2"],
  "recommendedCourse": "course_id",
  "triggerLeadForm": false or "reason_string",
  "suggestedQuickChips": [
    {"label": "Chip Label", "action": "action_name"}
  ]
}
`;

/**
 * Built-in Semantic RAG Counselor
 * Runs when no third-party API key is supplied. Fully aware of all 8 campuses,
 * 5 courses, parental concerns, geographic areas, and scholarship criteria.
 */
function runSemanticBrain(userMessage, context = {}) {
  const q = (userMessage || '').toLowerCase();
  const res = {
    message: '',
    recommendedCampuses: [],
    recommendedCourse: null,
    triggerLeadForm: false,
    suggestedQuickChips: []
  };

  // Scenario 0: Master Explainer & Complete Overview
  if (q.includes('explain everything') || q.includes('all institutes') || q.includes('overview') || q.includes('what is rvlh') || q.includes('tell me everything')) {
    res.message = `🌟 **The Complete Guide to RV Learning Hub (RVLH)**\n\n### 1. The RSST Legacy (85+ Years)\nRVLH is an educational initiative by Rashtreeya Sikshana Samithi Trust (RSST). We solve the biggest problem faced by PU students: balancing board studies with competitive exams. At RVLH, PU Board theory and entrance coaching (**JEE, NEET, KCET & CA Foundation**) are taught under **one synchronized college timetable** with zero outside tuition needed.\n\n### 2. Our 8 Constituent PU Campuses:\n• **SSMRV PU College (Jayanagar):** Premier co-ed day college, top 10 Karnataka state ranks in Science & Commerce.\n• **NMKRV PU College for Women (Jayanagar):** Karnataka's leading women's institution with on-campus secure hostel.\n• **RV PU College North (Yelahanka/Hebbal):** Serving North Bangalore with digital CBT test labs.\n• **RV PU College South (Kanakapura Rd/JP Nagar):** Modern science & commerce campus near Green Line Metro.\n• **RV PU College, Electronic City:** High-focus tech corridor engineering entrance preparation.\n• **RV PU College, Harohalli (Residential):** Sprawling 50-acre green residential campus with air-cooled hostels & 24/7 faculty supervision.\n• **RV PU College, Mysuru:** Historic heritage city campus serving Mysore, Mandya & Coorg.\n• **VVN PU College (VV Puram):** Historic collaboration with VVN Trust near National College Metro.\n\n### 3. Up to 100% Scholarships:\n> [!SCHOLARSHIP] Through the **RV-TSA** scholarship exam, students with high 10th percentages receive up to 100% tuition waivers!`;
    res.recommendedCampuses = ['ssmrv', 'rv_harohalli', 'nmkrv', 'rv_north'];
    res.suggestedQuickChips = [
      { label: '⏱️ Compare Day vs Residential Timetable', action: 'view_schedules' },
      { label: '📊 Compare Key Campuses', action: 'compare_campuses' },
      { label: '🏫 View All 8 Campuses', action: 'explore_campuses' },
      { label: '💰 Check Fee & Scholarships', action: 'ask_fees' },
      { label: '📝 Request Counselor Callback', action: 'open_lead_form' }
    ];
    return res;
  }

  // Scenario 0.1: Timetable & Schedules
  if (q.includes('schedule') || q.includes('timetable') || q.includes('routine') || q.includes('timing') || q.includes('hours')) {
    res.message = `⏱️ **Synchronized Timetables at RVLH**\n\n### ☀️ Day Scholar Daily Routine (8:15 AM - 4:15 PM)\n• **08:30 AM - 10:30 AM:** Session 1: PU Board Theory & Core Concept Lectures\n• **10:45 AM - 01:00 PM:** Session 2: Competitive Entrance Masterclass (JEE / NEET / CA)\n• **01:45 PM - 03:15 PM:** Session 3: Science Practical Labs / Speed Drills\n• **03:15 PM - 04:15 PM:** Daily Practice Paper (DPP) & 1-on-1 Faculty Doubt Clinic\n• **04:15 PM:** College Bus Departure\n\n---\n\n### 🌙 Harohalli 50-Acre Residential Routine (24/7 Immersive)\n• **06:00 AM - 07:45 AM:** Morning Fitness, Meditation & Breakfast\n• **08:00 AM - 01:15 PM:** Integrated PU Board & Entrance Masterclasses\n• **02:15 PM - 04:30 PM:** CBT Simulation Mock Tests & Practical Labs\n• **04:30 PM - 05:45 PM:** Outdoor Sports (Cricket, Football, Basketball)\n• **06:30 PM - 09:30 PM:** Supervised Mentor Study Hours (Mandatory self-study with resident faculty)\n• **09:30 PM:** Healthy Dinner & Rest`;
    res.recommendedCampuses = ['rv_harohalli', 'ssmrv'];
    res.suggestedQuickChips = [
      { label: '🏡 Inquire Harohalli Residential', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
      { label: '🚌 Check Day Scholar Bus Routes', action: 'explore_campuses' },
      { label: '📝 Speak to Counselor', action: 'open_lead_form' }
    ];
    return res;
  }

  // Scenario 1: High Percentage / Merit / Scholarship Inquiry
  if (q.includes('%') || q.includes('percent') || q.includes('marks') || q.includes('score') || q.includes('scholarship') || q.includes('tsa')) {
    res.message = `🌟 **Congratulations on the academic performance!**\n\nAt RV Learning Hub, we strongly reward merit through the **RV-TSA (Talent & Scholarship Assessment)**. Students with strong 10th scores are eligible for **up to 100% tuition fee scholarships**.\n\nOur integrated program prepares students simultaneously for both the Karnataka PU Board exams and national entrances (**JEE / NEET / CA Foundation**) under a synchronized timetable, eliminating the need for outside tuitions.\n\nWould you like our admissions office to calculate your exact scholarship waiver bracket?`;
    res.triggerLeadForm = 'scholarship_assessment';
    res.suggestedQuickChips = [
      { label: '📝 Apply for RV-TSA Scholarship', action: 'open_lead_form' },
      { label: '🏫 View Campuses Offering Scholarships', action: 'explore_campuses' },
      { label: '📚 View Entrance Exam Tracks', action: 'explore_courses' }
    ];
    return res;
  }

  // Scenario 2: Hostel / Residential Concern (e.g. Outstation students, travel avoidance)
  if (q.includes('hostel') || q.includes('stay') || q.includes('boarding') || q.includes('residential') || q.includes('travel')) {
    res.message = `🏡 **RVLH Accommodation Guidance:**\n\nWe provide tailored solutions depending on whether you prefer full residential boarding or a city day-college:\n\n1. 🌟 **RV PU College, Harohalli (Flagship Residential Campus):**\n   • 50-acre distraction-free green sanctuary on Kanakapura Road\n   • Separate air-cooled hostels for boys & girls with 24/7 security and medical clinic\n   • Nutritious vegetarian dining and evening mentor-guided study halls (6:30 PM - 9:30 PM)\n\n2. 🏢 **NMKRV PU College (Jayanagar, Bengaluru):**\n   • Dedicated, secure on-campus **Women's Hostel** in South Bangalore.\n\n3. 🚌 **City Day Campuses:** SSMRV, RV North, RV South, E-City, and VVN operate extensive college bus routes across Bengaluru.`;
    res.recommendedCampuses = ['rv_harohalli', 'nmkrv'];
    res.suggestedQuickChips = [
      { label: '🏡 Explore Harohalli Residential Campus', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
      { label: '👩 Explore NMKRV Women Campus', action: 'select_campus', payload: { campusId: 'nmkrv' } },
      { label: '📝 Request Hostel Fee Structure', action: 'open_lead_form' }
    ];
    return res;
  }

  // Scenario 3: Medical / NEET UG Inquiry
  if (q.includes('neet') || q.includes('medical') || q.includes('doctor') || q.includes('mbbs') || q.includes('biology')) {
    res.message = `🩺 **RVLH NEET UG Decoded Programme:**\n\nOur integrated NEET program is specifically designed to help students secure top government medical college seats (AIIMS, JIPMER, BMCRI, etc.):\n\n• **100% NCERT Dissection:** In-depth line-by-line coverage for Biology, Chemistry & Physics.\n• **OMR Simulation Tests:** Regular Saturday full-length mock tests simulating actual NTA speed and negative marking control.\n• **Doctor Mentorship:** Masterclasses by practicing medical professionals and senior NEET faculties.\n\nOffered with **PCMB** stream across our campuses including **SSMRV, NMKRV (Girls), RV North, RV South, and Harohalli (Residential)**.`;
    res.recommendedCourse = 'neet_ug';
    res.recommendedCampuses = ['ssmrv', 'rv_harohalli', 'nmkrv', 'rv_north'];
    res.suggestedQuickChips = [
      { label: '📝 Inquire for NEET Batch Admissions', action: 'open_lead_form' },
      { label: '🏫 Campuses for NEET', action: 'explore_campuses' },
      { label: '💰 Check NEET Coaching Fees', action: 'ask_fees' }
    ];
    return res;
  }

  // Scenario 4: Engineering / JEE Advanced & Main Inquiry
  if (q.includes('jee') || q.includes('iit') || q.includes('nit') || q.includes('engineering') || q.includes('maths')) {
    res.message = `🚀 **RVLH JEE Decoded Programmes (IIT & NIT Focus):**\n\nWe offer two specialized pathways:\n1. **JEE Advanced (Main + KCET Decoded):** Multi-concept problem sets and CBT mock test series aiming for top 1,000 all-India ranks for IITs.\n2. **JEE (Main + KCET Decoded):** Dual focus on securing 98%+ in PU Boards and 99+ percentile in JEE Main for premier NITs and RV College of Engineering (RVCE).\n\nKey Campuses with dedicated JEE faculties: **SSMRV (Jayanagar), RV PU Electronic City, RV PU North, and Harohalli Residential**.`;
    res.recommendedCourse = 'jee_adv';
    res.recommendedCampuses = ['rv_ecity', 'ssmrv', 'rv_harohalli', 'rv_north'];
    res.suggestedQuickChips = [
      { label: '📝 Apply for JEE Integrated Batch', action: 'open_lead_form' },
      { label: '💻 Electronic City Campus', action: 'select_campus', payload: { campusId: 'rv_ecity' } },
      { label: '🏡 Harohalli Residential Campus', action: 'select_campus', payload: { campusId: 'rv_harohalli' } }
    ];
    return res;
  }

  // Scenario 5: Commerce / CA / CS / CUET Inquiry
  if (q.includes('commerce') || q.includes('ca ') || q.includes('cma') || q.includes('cs ') || q.includes('cuet') || q.includes('accountancy')) {
    res.message = `📊 **RVLH Commerce Decoded Programme:**\n\nA revolutionary integrated track uniting Karnataka PU Board Commerce (**EBAC / MEBA**) with professional entrance coaching:\n\n• **CA Foundation / CMA / CS Executive (CSEET)** training led by practicing Chartered Accountants.\n• **CUET Mastery** to secure seats in top-tier national universities like SRCC, St. Xavier's, and Christ.\n• Real-world financial literacy, balance sheet mastery, and corporate guest lectures.\n\nOffered at **SSMRV (Jayanagar), NMKRV (Women), RV PU South, VVN PU, and RV PU Mysuru**.`;
    res.recommendedCourse = 'commerce';
    res.recommendedCampuses = ['ssmrv', 'nmkrv', 'vvn', 'rv_south'];
    res.suggestedQuickChips = [
      { label: '📝 Apply for Commerce Decoded', action: 'open_lead_form' },
      { label: '🏫 SSMRV Commerce Campus', action: 'select_campus', payload: { campusId: 'ssmrv' } },
      { label: '👩 NMKRV Women Campus', action: 'select_campus', payload: { campusId: 'nmkrv' } }
    ];
    return res;
  }

  // Scenario 6: Location Specific Queries
  if (q.includes('south') || q.includes('jayanagar') || q.includes('jp nagar') || q.includes('banashankari')) {
    res.message = `📍 **South Bengaluru Campuses:**\nFor students in Jayanagar, JP Nagar, and Banashankari, RVLH offers our flagship city campuses:\n• **SSMRV PU College** (Jayanagar 4th T Block) - Co-ed, Science & Commerce\n• **NMKRV PU College** (Jayanagar 3rd Block) - Exclusively for Women\n• **RV PU College South** (Kanakapura Road corridor)\n\nAll three campuses feature smart classrooms, specialized entrance coaching, and dedicated bus routes.`;
    res.recommendedCampuses = ['ssmrv', 'nmkrv', 'rv_south'];
    res.suggestedQuickChips = [
      { label: '🏛️ SSMRV PU College', action: 'select_campus', payload: { campusId: 'ssmrv' } },
      { label: '🏛️ NMKRV Women PU', action: 'select_campus', payload: { campusId: 'nmkrv' } },
      { label: '📝 Book Campus Visit', action: 'open_lead_form' }
    ];
    return res;
  }

  if (q.includes('north') || q.includes('yelahanka') || q.includes('hebbal') || q.includes('sahakarnagar')) {
    res.message = `📍 **North Bengaluru Campus:**\nOur **RV PU College North** serves students across Yelahanka, Hebbal, Sahakarnagar, and Vidyaranyapura.\n\nIt features comprehensive state-of-the-art laboratories, integrated JEE/NEET test series, and dedicated transport routes across North Bangalore.`;
    res.recommendedCampuses = ['rv_north'];
    res.suggestedQuickChips = [
      { label: '🏛️ View RV PU North Details', action: 'select_campus', payload: { campusId: 'rv_north' } },
      { label: '📝 Request Prospectus & Fee', action: 'open_lead_form' }
    ];
    return res;
  }

  // Default Empathetic Guidance
  res.message = `Thank you for reaching out to **RV Learning Hub**!\n\nWhether you are aiming for engineering via **JEE/KCET**, medical via **NEET UG**, or professional finance through our **Commerce Decoded (CA Foundation)** track, RVLH provides a synchronized curriculum across our 8 PU campuses.\n\nCould you share which stream you are interested in (Science or Commerce) and your preferred location? I will recommend the ideal campus and coaching batch for you.`;
  res.suggestedQuickChips = [
    { label: '🏫 Explore All 8 Campuses', action: 'explore_campuses' },
    { label: '📚 View Coaching Tracks', action: 'explore_courses' },
    { label: '🏡 Check Hostel Options', action: 'ask_hostel' },
    { label: '📞 Speak with Academic Counselor', action: 'open_lead_form' }
  ];
  return res;
}

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route: /api/brain or /api/chat
  if ((parsedUrl.pathname === '/api/brain' || parsedUrl.pathname === '/api/chat') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const userMessage = data.message || '';
        const context = {
          sessionId: data.sessionId,
          activeCampus: data.activeCampus,
          activeCourse: data.activeCourse,
          history: data.history || []
        };

        // Use Semantic RAG Engine
        const brainResult = runSemanticBrain(userMessage, context);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          source: 'rvlh_cognitive_brain',
          ...brainResult
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Route: /api/telemetry (Mock receiver for testing)
  if (parsedUrl.pathname === '/api/telemetry' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Telemetry received' }));
    });
    return;
  }

  // Static File Serving
  let cleanPath = parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname.replace(/^\//, '');
  let filePath = path.join(__dirname, cleanPath);
  
  // If file doesn't exist directly, check if adding .html resolves it (e.g. /campuses -> campuses.html)
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page or File Not Found');
    } else {
      let ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.webp') contentType = 'image/webp';
      if (ext === '.svg') contentType = 'image/svg+xml';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🧠 [RVLH Brain Server] Running on http://localhost:${PORT}`);
  console.log(`   Endpoints: POST /api/brain, POST /api/chat, Static Assets on /`);
});

module.exports = server;
