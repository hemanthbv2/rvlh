/**
 * RVLH Chatbot - Conversational State Machine & Decision Engine
 * Handles user intent classification, campus context switching, course matching,
 * multi-intent disambiguation, and progressive lead capture.
 */

class RVLHEngine {
  constructor(kb, telemetryClient) {
    this.kb = kb || (typeof RVLH_KB !== 'undefined' ? RVLH_KB : null);
    this.telemetry = telemetryClient || null;
    
    // Session State
    this.state = {
      activeCampus: null,      // Currently focused campus object
      activeCourse: null,      // Currently focused course object
      awaitingLeadField: null, // If sequentially asking for fields, or modal form
      leadData: {
        name: '',
        phone: '',
        email: '',
        grade: '',
        campusId: '',
        courseId: ''
      },
      hasSubmittedLead: false
    };

    // Load from sessionStorage if existing
    this.restoreSession();
  }

  restoreSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem('rvlh_chat_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.activeCampusId) {
            this.state.activeCampus = this.kb.institutes.find(i => i.id === parsed.activeCampusId) || null;
          }
          if (parsed.activeCourseId) {
            this.state.activeCourse = this.kb.courses.find(c => c.id === parsed.activeCourseId) || null;
          }
          this.state.hasSubmittedLead = !!parsed.hasSubmittedLead;
        }
      }
    } catch (e) {
      console.warn('[RVLH Engine] Session restore error:', e);
    }
  }

  saveSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('rvlh_chat_state', JSON.stringify({
          activeCampusId: this.state.activeCampus ? this.state.activeCampus.id : null,
          activeCourseId: this.state.activeCourse ? this.state.activeCourse.id : null,
          hasSubmittedLead: this.state.hasSubmittedLead
        }));
      }
    } catch (e) {}
  }

  // --- Initial Welcome Message ---
  getWelcomePayload() {
    const campusContextMsg = this.state.activeCampus 
      ? `\n\n📌 *Currently exploring:* **${this.state.activeCampus.name}**`
      : '';

    return {
      type: 'bot',
      text: `👋 **Welcome to RV Learning Hub**\n\n*RSST Educational Initiative • 8 PU Campuses Across Karnataka*\n\nWe provide integrated Pre-University education synchronized with national entrance coaching:\n\n• **Science Tracks:** JEE Advanced, JEE Main, NEET UG, KCET\n\n• **Commerce Tracks:** CA Foundation, CMA, CS, CUET${campusContextMsg}\n\nSelect a topic below or type your question:`,
      quickChips: [
        { label: '🏫 Explore 8 Campuses', action: 'explore_campuses' },
        { label: '📅 Upcoming Events', action: 'view_events' },
        { label: '📚 Find a Course', action: 'explore_courses' },
        { label: '👨‍🏫 Director & Faculty', action: 'view_faculty' },
        { label: '🏡 Hostel & Boarding', action: 'ask_hostel' },
        { label: '💰 Fees & Scholarships', action: 'ask_fees' }
      ],
      suggestedPrompts: [
        { label: '📅 Upcoming events & scholarship test dates', query: 'what are the upcoming events and scholarship tests' },
        { label: '✨ Compare Day Scholar vs Harohalli Residential', query: 'Compare day scholar and harohalli residential routine' },
        { label: '🌐 Show all pages & website links', query: 'show all website pages and links' }
      ]
    };
  }

  // --- Action Dispatcher ---
  handleAction(action, payload = {}) {
    this.logTelemetry('action_click', { action, payload });

    switch (action) {
      case 'explain_everything':
        return this.explainEverything();

      case 'view_schedules':
        return this.explainDailySchedule();

      case 'compare_campuses':
        return this.compareCampuses();

      case 'explore_campuses':
        return this.renderCampusesList();

      case 'select_campus':
        return this.selectCampus(payload.campusId);

      case 'explore_courses':
        return this.renderCoursesList();

      case 'select_course':
        return this.selectCourse(payload.courseId);

      case 'ask_hostel':
        return this.handleHostelInquiry();

      case 'ask_fees':
        return this.handleFeesInquiry();

      case 'ask_race':
        return this.handleRaceInquiry();

      case 'ask_kcet':
        return this.handleKcetInquiry();

      case 'open_lead_form':
        return this.renderLeadForm(payload.reason || 'counselor_request');

      case 'reset_context':
        this.state.activeCampus = null;
        this.state.activeCourse = null;
        this.saveSession();
        return this.getWelcomePayload();

      case 'locate_nearest':
        return this.renderLocationFinder();

      case 'view_events':
        return this.handleEventsInquiry();

      case 'view_faculty':
        return this.handleFacultyInquiry();

      case 'view_campuses_page':
        return this.handleCampusesPageInquiry();

      case 'view_courses_page':
        return this.handleCoursesPageInquiry();

      case 'view_hostels_page':
        return this.handleHostelInquiry();

      case 'view_admissions_page':
        return this.handleAdmissionsPageInquiry();

      case 'view_contact_page':
        return this.handleContactPageInquiry();

      case 'view_home_page':
        return this.handleHomePageInquiry();

      case 'view_all_pages':
        return this.handleSiteMapInquiry();

      case 'filter_campuses':
        return this.filterCampusesByProgram(payload.programKey || 'jee');

      case 'navigate_page':
        if (typeof window !== 'undefined' && payload.url) {
          window.location.href = payload.url;
        }
        return { type: 'bot', text: `Opening [${payload.url}](${payload.url})...` };

      default:
        return this.handleUserQuery(action);
    }
  }

  // --- Comprehensive Master Explainer ---
  explainEverything() {
    this.logTelemetry('explain_everything');
    const text = `🌟 **The Complete Guide to RV Learning Hub (RVLH)**\n\n` +
      `### 1. What is RV Learning Hub?\n` +
      `Backed by **RSST (80+ years of historic legacy)**, RVLH integrates Karnataka Pre-University (PU) Board education with premier entrance exam preparation (**JEE, NEET, KCET & CA Foundation**). Students cover board theory and entrance objective drills under **one synchronized college timetable**—no evening tuition stress!\n\n` +
      `### 2. Our 8 Constituent PU Campuses:\n` +
      `• **SSMRV PU College (Jayanagar, South Blr):** Co-ed Day Scholar, top board & entrance ranks in Science & Commerce.\n` +
      `• **NMKRV PU College (Jayanagar, South Blr):** Dedicated Women's institution with on-campus secure hostel.\n` +
      `• **RV PU College North (Yelahanka / Hebbal):** Serving North Bangalore with modern CBT test labs.\n` +
      `• **RV PU College South (Kanakapura Rd / JP Nagar):** Science & Commerce center near Green Line Metro.\n` +
      `• **RV PU College, Electronic City:** High-focus tech corridor engineering entrance preparation.\n` +
      `• **RV PU College, Harohalli (Residential):** 50-acre green residential campus with air-cooled hostels & 24/7 mentor study.\n` +
      `• **RV PU College, Mysuru:** Cultural capital campus serving Mysore, Mandya & Coorg.\n` +
      `• **VVN PU College (VV Puram):** Historic collaboration with VVN Trust near National College Metro.\n\n` +
      `### 3. 5 Decoded Coaching Tracks:\n` +
      `• **JEE Advanced:** Target top 1,000 ranks for IITs & NITs.\n` +
      `• **JEE Main + KCET:** Dual focus on 98%+ in PU Boards and seats in RVCE/NITs.\n` +
      `• **NEET UG Decoded:** Line-by-line NCERT mapping and OMR speed tests for MBBS/BDS.\n` +
      `• **Commerce Decoded:** Integrated PU Commerce with CA Foundation, CMA, CS & CUET.\n` +
      `• **ReVise CET:** Intensive 30-60 day crash revision for 12th students.\n\n` +
      `### 4. Scholarships & Admissions:\n` +
      `> [!SCHOLARSHIP] Up to 100% Tuition Fee Waiver available through the **RV-TSA** scholarship exam based on merit and 10th marks!\n\n` +
      `What would you like to explore in detail?`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🏫 View All 8 Campuses', action: 'explore_campuses' },
        { label: '⏱️ Compare Day vs Residential Timetable', action: 'view_schedules' },
        { label: '📊 Compare Key Campuses', action: 'compare_campuses' },
        { label: '💰 Check Scholarship Slabs', action: 'ask_fees' },
        { label: '📝 Request Counselor Callback', action: 'open_lead_form' }
      ]
    };
  }

  // --- Daily Schedule & Timetable Explainer ---
  explainDailySchedule() {
    this.logTelemetry('view_schedules');
    const day = this.kb.dailySchedules.dayScholar;
    const res = this.kb.dailySchedules.residential;

    const dayRows = day.timings.map(t => `• **${t.time}**: ${t.activity}`).join('\n');
    const resRows = res.timings.map(t => `• **${t.time}**: ${t.activity}`).join('\n');

    const text = `⏱️ **Synchronized Timetables at RVLH**\n\n` +
      `### ☀️ Day Scholar Daily Routine (SSMRV, NMKRV, North, South, E-City, VVN)\n` +
      `*Balanced academic hours with zero clash between board and entrance coaching:*\n\n${dayRows}\n\n` +
      `---\n\n` +
      `### 🌙 Harohalli 50-Acre Residential Routine (24/7 Immersive)\n` +
      `*Distraction-free environment with faculty residing on campus:*\n\n${resRows}`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🏡 Explore Harohalli Residential', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '🚌 Check Day Scholar Bus Routes', action: 'explore_campuses' },
        { label: '📝 Inquire About Hostel Admissions', action: 'open_lead_form', payload: { reason: 'hostel_schedule' } }
      ]
    };
  }

  // --- Compare Key Campuses ---
  compareCampuses() {
    this.logTelemetry('compare_campuses');
    const text = `📊 **Comparative Matrix of RVLH Campuses**\n\n` +
      `| Campus | Zone | Type | Hostel | Key Strengths |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **SSMRV PU** | South Blr | Co-ed Day | 🚫 Day Bus | Top 10 State Ranks in Science & Commerce |\n` +
      `| **NMKRV PU** | South Blr | Women Only | ✅ On-Campus | Dedicated women's hostel + Metro adjacent |\n` +
      `| **Harohalli** | Kanakapura | Residential | ✅ 50-Acre | Full boarding, 24/7 mentor study hours |\n` +
      `| **RV North** | North Blr | Co-ed Day | 🚫 Day Bus | Serving Yelahanka/Hebbal, CBT test lab |\n` +
      `| **RV E-City** | Tech Corridor| Co-ed Day | 🚫 Day Bus | Engineering entrance focus (IIT/NIT) |\n` +
      `| **VVN PU** | Central Blr | Co-ed Day | 🚫 Metro Walk| Historic heritage near National College |\n\n` +
      `*Tell me your locality or stream preference, and I will recommend the ideal campus!*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🏡 Inquire Harohalli Residential', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '🏛️ Inquire SSMRV (Jayanagar)', action: 'select_campus', payload: { campusId: 'ssmrv' } },
        { label: '👩 Inquire NMKRV (Women)', action: 'select_campus', payload: { campusId: 'nmkrv' } },
        { label: '📝 Speak to Admissions Counselor', action: 'open_lead_form' }
      ]
    };
  }

  // --- Render All 8 Campuses ---
  renderCampusesList() {
    const campuses = this.kb.institutes.map(inst => ({
      id: inst.id,
      title: inst.shortName,
      name: inst.name,
      location: inst.location,
      type: inst.campusType,
      hasHostel: inst.hasHostel,
      streams: inst.streamsOffered
    }));

    return {
      type: 'bot',
      text: `📍 **RVLH Integrated Campuses (8 Locations)**\nExplore our constituent PU colleges offering synchronized board + entrance preparation. Select any campus to view courses, facilities, and contact details:`,
      cardsType: 'campus_list',
      cards: campuses,
      quickChips: [
        { label: '🏡 Residential (Harohalli)', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '👩 Women Only (NMKRV)', action: 'select_campus', payload: { campusId: 'nmkrv' } },
        { label: '🔍 Find Nearest to Me', action: 'locate_nearest' },
        { label: '📊 Compare All Campuses', action: 'compare_campuses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Select a Specific Campus ---
  selectCampus(campusId) {
    const campus = this.kb.institutes.find(i => i.id === campusId);
    if (!campus) {
      return { type: 'bot', text: 'Sorry, that campus was not found. Please choose from the list.' };
    }

    this.state.activeCampus = campus;
    this.saveSession();
    this.logTelemetry('campus_selected', { campusId: campus.id, campusName: campus.name });

    const hostelBadge = campus.hasHostel ? '✅ Hostel Available' : '🚫 Day-Scholar Campus (No in-campus hostel)';
    const streamList = campus.streamsOffered.map(s => `• ${s}`).join('\n');
    const rvlhProgramsList = campus.rvlhPrograms.map(p => `• ${p}`).join('\n');

    let text = `🏛️ **${campus.name}**\n` +
      `📍 *${campus.address}*\n` +
      `🏷️ **Type:** ${campus.campusType} (${hostelBadge})\n\n` +
      `📖 **Streams Offered:**\n${streamList}\n\n` +
      `🎯 **RVLH Coaching Programs Available:**\n${rvlhProgramsList}\n\n` +
      `💡 *${campus.hostelNote}*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📝 Inquire / Apply for this Campus', action: 'open_lead_form', payload: { campusId: campus.id } },
        { label: '📚 View Course Details', action: 'explore_courses' },
        { label: '🔄 Change Campus', action: 'explore_campuses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Render All 5 Courses ---
  renderCoursesList() {
    const courses = this.kb.courses.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      duration: c.duration,
      targetExams: c.targetExams
    }));

    return {
      type: 'bot',
      text: `📚 **RVLH Decoded Coaching Programs**\nChoose a course to see curriculum features, exam targets, and offering campuses:`,
      cardsType: 'course_list',
      cards: courses,
      quickChips: [
        { label: '🧪 Science / Engineering (JEE)', action: 'select_course', payload: { courseId: 'jee_adv' } },
        { label: '🩺 Medical (NEET UG)', action: 'select_course', payload: { courseId: 'neet_ug' } },
        { label: '📊 Commerce (CA/CS/CUET)', action: 'select_course', payload: { courseId: 'commerce' } },
        { label: '⚡ ReVise CET (Crash)', action: 'select_course', payload: { courseId: 'revise_cet' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Select a Specific Course ---
  selectCourse(courseId) {
    const course = this.kb.courses.find(c => c.id === courseId);
    if (!course) {
      return { type: 'bot', text: 'Course details could not be found.' };
    }

    this.state.activeCourse = course;
    this.saveSession();
    this.logTelemetry('course_selected', { courseId: course.id, courseTitle: course.title });

    // Campuses that offer this course
    const offeringCampuses = this.kb.institutes
      .filter(i => course.campuses.includes(i.id))
      .map(i => `• **${i.shortName}** (${i.location})`)
      .join('\n');

    const featuresList = course.features.map(f => `✓ ${f}`).join('\n');

    let text = `🎓 **${course.title}**\n` +
      `⏱️ **Duration:** ${course.duration}\n` +
      `🎯 **Target Exams:** ${course.targetExams.join(' | ')}\n\n` +
      `✨ **Key Highlights:**\n${featuresList}\n\n` +
      `🏫 **Available at these Campuses:**\n${offeringCampuses}`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📝 Get Syllabus & Fee Details', action: 'open_lead_form', payload: { courseId: course.id } },
        { label: '🏫 Choose a Campus', action: 'explore_campuses' },
        { label: '📚 Other Courses', action: 'explore_courses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Hostel Disambiguation ---
  handleHostelInquiry() {
    if (this.state.activeCampus) {
      const c = this.state.activeCampus;
      return {
        type: 'bot',
        text: `🏡 **Hostel Information for ${c.name}:**\n\n${c.hasHostel ? '✅ **Hostel Available:**' : '🚫 **Day-Scholar Campus:**'}\n${c.hostelNote}\n\n*If you need a dedicated residential campus, our 50-acre Kanakapura Road campus (RV PU Harohalli) has comprehensive residential boarding for both boys & girls.*\n\n👉 *Click below or [Visit Hostels & Residential Page](hostels.html) to view full hostel amenities:*`,
        quickChips: [
          { label: '🏡 Open Hostels Page', action: 'navigate_page', payload: { url: 'hostels.html' } },
          { label: '🏡 View Harohalli Residential Campus', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
          { label: '📝 Request Hostel Fee Details', action: 'open_lead_form' },
          { label: '🏫 Check Another Campus', action: 'explore_campuses' }
        ]
      };
    }

    // Generic inquiry -> Disambiguate between Residential Harohalli, NMKRV Women Hostel, and Day Colleges
    return {
      type: 'bot',
      text: `🏡 **RVLH Accommodation & Hostels**\n\nBecause RVLH operates multiple institutes across Bengaluru and Mysuru, hostel options depend on your chosen college:\n\n1. 🌟 **RV PU College, Harohalli (Residential):** Flagship 50-acre green campus with air-cooled hostels, healthy veg food, 24/7 mentor study hours & medical clinic (Boys & Girls).\n2. 🏢 **NMKRV PU College (Jayanagar):** Dedicated secure on-campus women's hostel.\n3. 🚌 **City Day Campuses (SSMRV, RV North, South, E-City, VVN):** Day-scholar campuses with dedicated bus routes across Bangalore.\n\n👉 *Click below or [Visit Hostels & Residential Page](hostels.html) to view room photos, dining, and boarding facilities:*`,
      quickChips: [
        { label: '🏡 Open Hostels & Boarding Page', action: 'navigate_page', payload: { url: 'hostels.html' } },
        { label: '🏡 Harohalli Residential Campus', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '👩 NMKRV Women Hostel (Jayanagar)', action: 'select_campus', payload: { campusId: 'nmkrv' } },
        { label: '📞 Speak to Admissions Desk', action: 'open_lead_form' }
      ]
    };
  }

  // --- Fees & Scholarship Inquiry ---
  handleFeesInquiry() {
    const campusName = this.state.activeCampus ? ` at ${this.state.activeCampus.name}` : '';
    const courseName = this.state.activeCourse ? ` for ${this.state.activeCourse.title}` : '';

    return {
      type: 'bot',
      text: `💰 **Tuition & Scholarship Details${campusName}${courseName}**\n\nRVLH fees are structured transparently based on:\n• Selected Academic Track (JEE / NEET / Commerce)\n• Campus Option (Day Scholar vs. Full Boarding at Harohalli)\n\n🌟 **Up to 100% Scholarship Available!**\nThrough the **RV-TSA (Talent & Scholarship Assessment)**, deserving students receive substantial tuition fee waivers based on performance.\n\n👉 *Click below or [Visit Scholarships & Fees Page](admissions.html) to calculate your scholarship tier and view exact fee breakdowns:*`,
      quickChips: [
        { label: '🎓 Open Scholarships & Fees Page', action: 'navigate_page', payload: { url: 'admissions.html' } },
        { label: '📥 Get Detailed Fee Sheet', action: 'open_lead_form', payload: { reason: 'fee_sheet' } },
        { label: '📝 Register for RV-TSA Scholarship', action: 'open_lead_form', payload: { reason: 'scholarship' } },
        { label: '🏫 Check Campuses', action: 'explore_campuses' }
      ]
    };
  }

  // --- Events & Calendar Inquiry ---
  handleEventsInquiry() {
    this.logTelemetry('events_inquiry');
    const events = this.kb.events || [];
    
    const eventBullets = events.slice(0, 4).map(e => {
      return `• **${e.date}** — **${e.title}**\n  📍 *${e.location}* | 🏷️ \`${e.category}\`\n  ${e.description.slice(0, 110)}...`;
    }).join('\n\n');

    const text = `📅 **Upcoming Academic Events, Masterclasses & Open Houses**\n\n` +
      `RV Learning Hub regularly hosts talent assessment scholarship tests, entrance exam strategy workshops, and campus tours for students and parents:\n\n` +
      `${eventBullets}\n\n` +
      `👉 *Click below or [Visit the Events Page](events.html) to view the complete schedule, test dates, and reserve seats online:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📅 Open Events & Calendar Page', action: 'navigate_page', payload: { url: 'events.html' } },
        { label: '🎓 Register for RV-TSA Exam', action: 'open_lead_form', payload: { reason: 'event_rv_tsa' } },
        { label: '🏡 Book Harohalli Campus Tour', action: 'open_lead_form', payload: { reason: 'event_tour' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Campuses Page Inquiry ---
  handleCampusesPageInquiry() {
    this.logTelemetry('campuses_page_inquiry');
    const text = `🏛️ **RVLH 8 Constituent PU College Campuses**\n\n` +
      `RV Learning Hub operates 8 constituent PU institutions under the governance of RSST (80+ years legacy) across Bengaluru and Mysuru:\n\n` +
      `• **South Bengaluru:** SSMRV PU College (Jayanagar, Co-ed) & NMKRV PU College for Women (with on-campus hostel).\n` +
      `• **North Bengaluru:** RV PU College North (Yelahanka / Hebbal).\n` +
      `• **East / Tech Corridor:** RV PU College Electronic City (Hosur Rd).\n` +
      `• **South Corridor:** RV PU College South (Kanakapura Road / JP Nagar).\n` +
      `• **Residential Flagship:** RV PU College Harohalli (50-Acre green boarding campus with 24/7 faculty supervision).\n` +
      `• **Central Bengaluru:** VVN PU College (VV Puram, near Metro).\n` +
      `• **Heritage City:** RV PU College Mysuru.\n\n` +
      `All campuses provide synchronized Karnataka PU Board theory + entrance coaching under one college timetable.\n\n` +
      `👉 *Click below or [View the 8 Campuses Directory](campuses.html) for detailed photos, bus routes, and facilities:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🏛️ Open 8 Campuses Directory', action: 'navigate_page', payload: { url: 'campuses.html' } },
        { label: '📊 Compare All Campuses', action: 'compare_campuses' },
        { label: '🏡 Harohalli Residential', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Courses & Academic Tracks Page Inquiry ---
  handleCoursesPageInquiry() {
    this.logTelemetry('courses_page_inquiry');
    const text = `📚 **Decoded Synchronized Academic Tracks (5 Programs)**\n\n` +
      `At RVLH, competitive entrance coaching runs inside regular college hours with zero timetable clash:\n\n` +
      `• **JEE Advanced (IIT/NIT Track):** 2-year deep concept synthesis, high-difficulty subjective drills, and CBT diagnostics.\n` +
      `• **JEE Main + KCET:** Dual focus on scoring 98%+ in PU Boards and securing top engineering seats in RVCE/NITs.\n` +
      `• **NEET UG Decoded (Medical):** Line-by-line NCERT dissection, diagrams mastery, and OMR speed testing for MBBS.\n` +
      `• **Commerce Decoded (CA/CS/CMA):** Integrated PU Commerce (EBAC/MEBA) with concurrent CA Foundation preparation.\n` +
      `• **ReVise CET (Crash Batch):** High-intensity 30–60 day formula revision and simulated mock tests for 12th students.\n\n` +
      `👉 *Click below or [Explore Full Courses & Tracks Page](courses.html) for syllabi, faculty, and weekly schedules:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📚 Open Courses Page', action: 'navigate_page', payload: { url: 'courses.html' } },
        { label: '🎯 RACE Entrance Exam', action: 'ask_race' },
        { label: '🚀 KCET Coaching & RVCE', action: 'ask_kcet' },
        { label: '🚀 Campuses with JEE', action: 'filter_campuses', payload: { programKey: 'jee' } },
        { label: '🩺 Campuses with NEET', action: 'filter_campuses', payload: { programKey: 'neet_ug' } },
        { label: '📊 Campuses with Commerce', action: 'filter_campuses', payload: { programKey: 'commerce' } }
      ]
    };
  }

  // --- RACE Exam Inquiry Handler (Data directly from rvlearninghub.com/race/) ---
  handleRaceInquiry() {
    this.logTelemetry('race_exam_inquiry');
    const text = `🎯 **RACE — Selection Test for RV Educational Institutions' PU Colleges**\n\n` +
      `*(Source: Official RV Learning Hub Portal — [rvlearninghub.com/race](https://rvlearninghub.com/race/))*\n\n` +
      `**RACE** is a selection test for admission into RV Educational Institutions’ PU Colleges. Students who enrol can choose and receive coaching for board exams as well as competitive exams such as **JEE, NEET, KCET, CA Foundation, CMA, and CLAT**.\n\n` +
      `### 🌟 Key Pillars of the Programme:\n` +
      `• **For Ambitious 10th Graders:** Ideal for students aiming to excel in competitive exams such as JEE, NEET, KCET, CA, and CMA.\n` +
      `• **Mastery of Concepts:** Gain a deep understanding of concepts to stand out among your peers.\n` +
      `• **Efficient Time Management:** Designed for students interested in an integrated programme that maximises learning while optimising time.\n` +
      `• **Learn with the Best:** A chance to study alongside the most talented and driven peers in your city, learning from highly experienced and renowned educators dedicated to your success.\n\n` +
      `### 🏫 Participating PU Campuses:\n` +
      `• SSMRV PU College, Bengaluru\n` +
      `• NMKRV PU College, Bengaluru\n` +
      `• RV PU College North, Bengaluru\n` +
      `• RV PU College South, Bengaluru\n` +
      `• RV PU College, Electronic City\n` +
      `• RV PU College, Harohalli\n` +
      `• RV PU College, Mysuru\n` +
      `• VVN PU College, Bengaluru\n\n` +
      `### 📞 Contact & Registration:\n` +
      `• **Admissions Portal:** [admissions.rvlearninghub.com](https://admissions.rvlearninghub.com)\n` +
      `• **Helpline:** **080 2663 2000** / **+91 83173 46585**\n` +
      `• **Email:** admissions.rvlh@rvei.edu.in`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📝 Register on Portal', action: 'navigate_page', payload: { url: 'https://admissions.rvlearninghub.com' } },
        { label: '🚀 KCET Coaching & RVCE', action: 'ask_kcet' },
        { label: '🏛️ Explore Campuses', action: 'explore_campuses' },
        { label: '📞 Speak with Academic Counselor', action: 'open_lead_form', payload: { reason: 'race_inquiry' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- KCET Coaching Inquiry Handler (Data directly from rvlearninghub.com/kcet/) ---
  handleKcetInquiry() {
    this.logTelemetry('kcet_inquiry');
    const text = `🚀 **KCET Coaching Classes | RV Learning Hub**\n\n` +
      `*(Source: Official RV Learning Hub Portal — [rvlearninghub.com/kcet](https://rvlearninghub.com/kcet/))*\n\n` +
      `The **Karnataka Common Entrance Test (KCET)** is a state-level exam administered by the **Karnataka Examination Authority (KEA)** for undergraduate admissions in Karnataka. This entrance test allows eligible students to secure seats in various engineering courses offered by colleges and universities across the state (including premier institutions like **RV College of Engineering - RVCE**).\n\n` +
      `### 🎯 Programme Highlights:\n` +
      `• **For Ambitious 10th Graders:** Ideal for students aiming to excel in KCET and secure seats in colleges of their choice.\n` +
      `• **Concept Mastery:** Deep foundational understanding of Physics, Chemistry, and Mathematics/Biology to stand out among peers.\n` +
      `• **Integrated Efficiency:** An integrated curriculum that maximises learning while optimising study hours without external tuition burden.\n` +
      `• **Renowned Educators:** Dedicated coaching from highly experienced national faculty.\n\n` +
      `### 📝 4-Step Admission Process:\n` +
      `1. **Application:** Students must fill out the application form and complete registration.\n` +
      `2. **Selection & Centre Confirmation:** Based on the application, admission will be confirmed for the selected course and centre.\n` +
      `3. **Fee Payment:** The fee requirement must be paid once the application is accepted and confirmed.\n` +
      `4. **Class Commencement:** Enrolled students will begin their classes as per the start date of the scheduled batch.\n\n` +
      `### 📞 Central Admissions Desk:\n` +
      `• **Helpline:** **080 2663 2000** / **+91 83173 46585**\n` +
      `• **Email:** admissions.rvlh@rvei.edu.in`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🚀 Campuses with KCET & JEE', action: 'filter_campuses', payload: { programKey: 'kcet' } },
        { label: '🎯 RACE Selection Test', action: 'ask_race' },
        { label: '🏎️ ReVise CET Crash Course', action: 'select_course', payload: { courseId: 'revise_cet' } },
        { label: '📝 Request KCET Admission Guidance', action: 'open_lead_form', payload: { reason: 'kcet_inquiry' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Admissions & Scholarships Page Inquiry ---
  handleAdmissionsPageInquiry() {
    this.logTelemetry('admissions_page_inquiry');
    const text = `🎓 **RV-TSA Scholarships, Fees & Admissions 2026-27**\n\n` +
      `Deserving students can access world-class integrated education through RSST's merit-based scholarship framework:\n\n` +
      `• **RV-TSA Scholarship Exam:** Offers up to **100% tuition fee waiver** based on national talent assessment performance.\n` +
      `• **Merit Slabs:** 10th Board score waivers (95%+ marks qualify for top tier scholarships).\n` +
      `• **Fee Transparency:** Day Scholar integrated tuition (~₹1.2L–₹1.8L/yr) vs 50-Acre Harohalli Residential boarding (~₹2.8L–₹3.5L/yr).\n` +
      `• **4-Step Admission:** 1) Online Application → 2) RV-TSA Assessment → 3) Counselor Interview → 4) Seat Confirmation.\n\n` +
      `👉 *Click below or [Visit Scholarships & Admissions Page](admissions.html) to calculate your scholarship slab and apply:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🎓 Open Scholarships & Fees Page', action: 'navigate_page', payload: { url: 'admissions.html' } },
        { label: '📝 Apply for Admissions 2026-27', action: 'open_lead_form', payload: { reason: 'admissions_apply' } },
        { label: '💰 Request Exact Fee Sheet', action: 'open_lead_form', payload: { reason: 'fee_sheet' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Contact & Helplines Page Inquiry ---
  handleContactPageInquiry() {
    this.logTelemetry('contact_page_inquiry');
    const text = `📞 **Admissions Contact & Campus Desks**\n\n` +
      `Connect directly with the RV Learning Hub central admissions counselors or visit any constituent campus:\n\n` +
      `• **Central RSST Helpline:** **080-2663 2000**\n` +
      `• **Admissions Email:** admissions.rvlh@rvei.edu.in\n` +
      `• **Central Headquarters:** RV Teachers College Building, Bull Temple Road, Basavanagudi, Bengaluru 560004.\n` +
      `• **Working Hours:** Monday to Saturday, 09:00 AM – 05:30 PM IST.\n` +
      `• **Local Campus Desks:** Direct helpdesks available at all 8 campuses (SSMRV, NMKRV, North, South, E-City, Harohalli, Mysuru, VVN).\n\n` +
      `👉 *Click below or [Visit Contact & Campus Desks Page](contact.html) for Google Maps locations and directions:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📞 Open Contact Page', action: 'navigate_page', payload: { url: 'contact.html' } },
        { label: '📝 Request Counselor Callback', action: 'open_lead_form', payload: { reason: 'callback' } },
        { label: '💬 Chat on WhatsApp', action: 'open_whatsapp' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Home Page Inquiry ---
  handleHomePageInquiry() {
    this.logTelemetry('home_page_inquiry');
    const text = `🏠 **RV Learning Hub Flagship Portal**\n\n` +
      `The main RVLH portal provides a comprehensive overview of RSST's 85-year educational legacy and synchronized PU curriculum:\n\n` +
      `• **Executive Overview:** Integrated PU Board + competitive coaching eliminating external tuition.\n` +
      `• **Results & Rankers:** Top state ranks across Science (JEE/NEET/KCET) and Commerce (CA Foundation).\n` +
      `• **Campus Locator:** Interactive finder for our 8 constituent PU colleges in Karnataka.\n` +
      `• **Student Testimonials & Virtual Tour:** Insights from alumni and current batch scholars.\n\n` +
      `👉 *Click below or [Open RVLH Home Page](index.html) to view the homepage:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🏠 Open Home Page', action: 'navigate_page', payload: { url: 'index.html' } },
        { label: '🌟 Comprehensive RVLH Guide', action: 'explain_everything' },
        { label: '🏛️ Explore 8 Campuses', action: 'explore_campuses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Site Directory / All Pages Inquiry ---
  handleSiteMapInquiry() {
    this.logTelemetry('sitemap_inquiry');
    const pages = (this.kb.sitePages && this.kb.sitePages.length > 0) ? this.kb.sitePages : [
      { key: 'home', title: 'Home', url: 'index.html', brief: 'Institutional overview, rankers, and curriculum highlights.' },
      { key: 'campuses', title: '8 Campuses Directory', url: 'campuses.html', brief: 'Directory of all 8 constituent PU colleges in Bengaluru & Mysuru.' },
      { key: 'courses', title: 'Courses & Tracks', url: 'courses.html', brief: 'JEE Advanced, JEE Main, NEET, Commerce Decoded, ReVise CET.' },
      { key: 'faculty', title: 'Faculty & Leadership', url: 'faculty.html', brief: 'Director Mr. Mayur Goyal, RSST governance & mentorship pillars.' },
      { key: 'events', title: 'Events & Calendar', url: 'events.html', brief: 'RV-TSA scholarship dates, masterclasses & Harohalli open house tours.' },
      { key: 'hostels', title: 'Residential & Hostels', url: 'hostels.html', brief: '50-acre Harohalli residential campus & NMKRV women hostel.' },
      { key: 'admissions', title: 'Scholarships & Fees', url: 'admissions.html', brief: 'RV-TSA merit slabs up to 100% waiver & online application.' },
      { key: 'contact', title: 'Contact & Desks', url: 'contact.html', brief: 'Central RSST desk, 080-2663 2000, campus addresses & maps.' }
    ];

    const list = pages.map(p => `• **[${p.title}](${p.url})** — *${p.brief}*`).join('\n\n');

    const text = `🌐 **RV Learning Hub — Complete Website Navigation & Page Links**\n\n` +
      `Here is the quick guide to all pages available on our website. Click any link below or use the buttons to navigate directly:\n\n` +
      `${list}\n\n` +
      `*Which page would you like to explore?*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '📅 Events & Calendar', action: 'navigate_page', payload: { url: 'events.html' } },
        { label: '🏛️ 8 Campuses Directory', action: 'navigate_page', payload: { url: 'campuses.html' } },
        { label: '📚 Courses & Tracks', action: 'navigate_page', payload: { url: 'courses.html' } },
        { label: '👨‍🏫 Faculty & Leadership', action: 'navigate_page', payload: { url: 'faculty.html' } },
        { label: '🏡 Residential Hostels', action: 'navigate_page', payload: { url: 'hostels.html' } },
        { label: '🎓 Scholarships & Fees', action: 'navigate_page', payload: { url: 'admissions.html' } },
        { label: '📞 Contact & Desks', action: 'navigate_page', payload: { url: 'contact.html' } }
      ]
    };
  }

  // --- Location Finder Helper ---
  renderLocationFinder() {
    return {
      type: 'bot',
      text: `📍 **Find Your Nearest RVLH Campus**\nSelect your preferred zone or city area:`,
      quickChips: [
        { label: '📍 South Bengaluru (Jayanagar/JP Nagar)', action: 'select_campus', payload: { campusId: 'ssmrv' } },
        { label: '📍 North Bengaluru (Yelahanka/Hebbal)', action: 'select_campus', payload: { campusId: 'rv_north' } },
        { label: '📍 Electronic City / Hosur Road', action: 'select_campus', payload: { campusId: 'rv_ecity' } },
        { label: '📍 Central Bengaluru (VV Puram)', action: 'select_campus', payload: { campusId: 'vvn' } },
        { label: '📍 Kanakapura Rd / Outskirts (Residential)', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
        { label: '📍 Mysuru City', action: 'select_campus', payload: { campusId: 'rv_mysuru' } }
      ]
    };
  }

  // --- Faculty & Academic Leadership Inquiry ---
  handleFacultyInquiry() {
    this.logTelemetry('faculty_inquiry');
    const dir = (this.kb.central && this.kb.central.director) ? this.kb.central.director : {
      name: "Mr. Mayur Goyal",
      title: "Director, RV Learning Hub (RVLH)",
      assistantDirector: "Mr. Srivatsa PV",
      governingTrust: "Rashtreeya Sikshana Samithi Trust (RSST)"
    };

    const text = `👨‍🏫 **RV Learning Hub Academic Leadership & Faculty**\n\n` +
      `• **Director:** **${dir.name}**\n` +
      `• **Designation:** ${dir.title}\n` +
      `• **Assistant Director:** ${dir.assistantDirector || 'Mr. Srivatsa PV'}\n` +
      `• **Governing Body:** ${dir.governingTrust || 'Rashtreeya Sikshana Samithi Trust (RSST)'}\n\n` +
      `### 🌟 The Decoded Faculty Mentorship Standard:\n` +
      `Under Director **Mr. Mayur Goyal**'s leadership, RVLH has established an elite faculty model drawn from premier IITs, NITs, and medical academies:\n\n` +
      `1. **Zero-Clash Parallel Teaching:** Same master teachers handle PU Board derivations and entrance exam shortcut masterclasses under one timetable.\n` +
      `2. **Daily 1-on-1 Doubt Clinics (3:15 PM - 4:15 PM):** Dedicated personal doubt clearance before leaving campus.\n` +
      `3. **Diagnostic Evaluation:** Weekly CBT and OMR tests analyzed question-by-question with academic mentors.\n\n` +
      `👉 *Click below or visit our [Faculty & Leadership Page](faculty.html) for detailed mentorship profiles:*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '🌐 Open Faculty & Leadership Page', action: 'navigate_page', payload: { url: 'faculty.html' } },
        { label: '📞 Speak with Academic Counselor', action: 'open_lead_form', payload: { reason: 'faculty_counseling' } },
        { label: '🏫 Explore 8 Campuses', action: 'explore_campuses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Source of Information & Curriculum Governance Inquiry ---
  handleSourceOfInfo() {
    this.logTelemetry('source_inquiry');
    const text = `ℹ️ **Source of Academic Schedules & Institutional Information**\n\n` +
      `All information presented by this assistant is compiled directly from the official **RSST (Rashtreeya Sikshana Samithi Trust)** and **RV Learning Hub (RVLH)** curriculum guidelines:\n\n` +
      `• **Synchronized Academic Timetable (8:15 AM - 4:15 PM):** Formulated under the leadership of Director **Mr. Mayur Goyal** to eliminate clashes between Karnataka PU Board lectures and national competitive coaching (JEE/NEET/CA).\n` +
      `• **8 Constituent Campuses:** Direct constituent PU colleges governed by RSST across Bengaluru and Mysuru.\n` +
      `• **Hostel Guidelines:** Derived from the 50-Acre Harohalli Residential Campus handbook and NMKRV Women's Hostel protocols.\n` +
      `• **Admissions & RV-TSA:** Based on official RSST talent search scholarship criteria (up to 100% tuition waiver).\n\n` +
      `*If your specific campus follows a customized local timing, our academic counselor can verify your campus-specific section handbook.*`;

    return {
      type: 'bot',
      text: text,
      quickChips: [
        { label: '👨‍🏫 View Director & Leadership', action: 'view_faculty' },
        { label: '⏱️ View Day vs Residential Timetable', action: 'view_schedules' },
        { label: '📞 Speak with Academic Counselor', action: 'open_lead_form', payload: { reason: 'info_source' } },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Filter Campuses by Specific Academic Program / Entrance Exam ---
  filterCampusesByProgram(programKey) {
    this.logTelemetry('filter_campuses', { programKey });

    let filterTag = programKey || 'jee';
    let title = '';
    let intro = '';

    if (programKey === 'jee_adv' || programKey === 'advanced') {
      filterTag = 'jee_adv';
      title = '🚀 Campuses Offering Course 1: JEE Advanced (Main + KCET Decoded) + PU Board';
      intro = 'The following **5 premier RVLH PU colleges** offer our specialized 2-Year integrated **JEE Advanced** coaching batch:';
    } else if (programKey === 'kcet' || programKey.includes('cet')) {
      filterTag = 'kcet';
      title = '🚀 Campuses Offering KCET Decoded Coaching (Gateway to RVCE)';
      intro = 'KCET integrated coaching is offered across **ALL 8 RVLH PU Campuses**, synchronizing Karnataka PU Board theory with KCET speed-solving drills for premier RVCE seats:';
    } else if (programKey.includes('commerce') || programKey.includes('ca') || programKey.includes('clat')) {
      filterTag = 'commerce';
      title = '📊 Campuses Offering Course 4: Commerce Decoded (CA Foundation + CLAT + PU Board)';
      intro = 'Here are the **7 RVLH campuses** offering integrated **Commerce Decoded (Commerce + CA + CLAT + PU Board)**:\n\n*(Offered at North, South, SSMRV, NMKRV, Harohalli Residential, E-City, and Mysuru. Note: VVN PU College offers Science only.)*';
    } else if (programKey.includes('neet') || programKey.includes('medical')) {
      filterTag = 'neet_ug';
      title = '🩺 Campuses Offering Course 3: NEET UG + KCET + PU Board Course';
      intro = 'Here are the RVLH PU colleges offering synchronized **NEET UG Medical (MBBS/BDS) & KCET allied science** preparation across **ALL 8 Campuses**:';
    } else {
      filterTag = 'jee_main';
      title = '🚀 Campuses Offering Course 2: JEE (Main + KCET Decoded) + PU Board';
      intro = 'Here are the RVLH constituent PU colleges offering synchronized **JEE Main & KCET** entrance preparation across **ALL 8 Campuses**:';
    }

    // Filter institutes
    const filteredInstitutes = this.kb.institutes.filter(inst => {
      if (!inst.courseIds) return true;
      if (filterTag === 'kcet') {
        return inst.courseIds.includes('jee_main') || inst.courseIds.includes('jee_adv') || inst.courseIds.includes('neet_ug') || inst.courseIds.includes('revise_cet');
      }
      if (filterTag === 'jee') {
        return inst.courseIds.includes('jee_adv') || inst.courseIds.includes('jee_main');
      }
      return inst.courseIds.includes(filterTag);
    });

    const cards = filteredInstitutes.map(inst => ({
      id: inst.id,
      title: inst.shortName,
      name: inst.name,
      location: inst.location,
      type: inst.campusType,
      hasHostel: inst.hasHostel,
      streams: inst.streamsOffered
    }));

    const campusBulletList = filteredInstitutes
      .map(i => `• **${i.shortName}** (${i.location}) — *${i.campusType}*`)
      .join('\n');

    const text = `${title}\n\n${intro}\n\n${campusBulletList}\n\n*Swipe through the campus cards below or select one to view detailed curriculum & admissions:*`;

    return {
      type: 'bot',
      text: text,
      cardsType: 'campus_list',
      cards: cards,
      quickChips: [
        { label: `📝 Inquire / Apply for ${title.split(' ')[1] || 'Coaching'}`, action: 'open_lead_form', payload: { reason: `filter_${filterTag}` } },
        { label: '📊 Compare These Campuses', action: 'compare_campuses' },
        { label: '🏫 View All 8 Campuses', action: 'explore_campuses' },
        { label: '🔙 Main Menu', action: 'reset_context' }
      ]
    };
  }

  // --- Lead Form Trigger ---
  renderLeadForm(reason = 'general') {
    const defaultCampus = this.state.activeCampus ? this.state.activeCampus.name : '';
    const defaultCourse = this.state.activeCourse ? this.state.activeCourse.title : '';

    return {
      type: 'bot',
      text: `📝 **Connect with an RVLH Academic Counselor**\nPlease share your contact information. Our senior counselor will provide college admissions brochures, exact fee structures, and scholarship criteria.`,
      formType: 'lead_form',
      formData: {
        reason,
        preferredCampus: defaultCampus,
        preferredCourse: defaultCourse,
        campusOptions: this.kb.institutes.map(i => ({ id: i.id, name: i.name })),
        courseOptions: this.kb.courses.map(c => ({ id: c.id, title: c.title }))
      }
    };
  }

  // --- Submit Lead Form ---
  async submitLead(formData) {
    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      return { success: false, error: 'Please enter a valid full name.' };
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    const payload = {
      instituteId: formData.campusId || (this.state.activeCampus ? this.state.activeCampus.id : 'rvlh_general'),
      sessionId: this.getSessionId(),
      eventType: 'form_submit',
      leadData: {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: (formData.email || '').trim(),
        grade: formData.grade || '10th Passed / Moving to PU-I',
        campus: formData.campusName || (this.state.activeCampus ? this.state.activeCampus.name : 'Not Specified'),
        course: formData.courseTitle || (this.state.activeCourse ? this.state.activeCourse.title : 'General Inquiry'),
        source: 'RVLH Multi-Institute Chatbot',
        timestamp: new Date().toISOString()
      }
    };

    // Dispatch Telemetry & Lead Storage
    if (this.telemetry) {
      await this.telemetry.sendLead(payload);
    }

    this.state.hasSubmittedLead = true;
    this.saveSession();

    return {
      success: true,
      botResponse: {
        type: 'bot',
        text: `🎉 **Thank you, ${formData.name}!**\n\nYour inquiry has been successfully sent to the **${payload.leadData.campus}** admissions desk.\n\nOne of our senior academic counselors will call you at **+91 ${cleanPhone}** shortly.\n\nIn the meantime, you can also:\n• Call us directly: **080-2663 2000**\n• Visit our portal: [admissions.rvlearninghub.com](https://admissions.rvlearninghub.com)`,
        quickChips: [
          { label: '💬 Chat on WhatsApp', action: 'open_whatsapp', payload: { phone: cleanPhone } },
          { label: '🏫 Explore Other Campuses', action: 'explore_campuses' },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      }
    };
  }

  // --- Check if a specific program is offered at a specific campus ---
  checkProgramAtCampus(q) {
    // 1. Detect Campus
    let campusId = null;
    if (q.includes('ssmrv')) {
      campusId = 'ssmrv';
    } else if (q.includes('nmkrv')) {
      campusId = 'nmkrv';
    } else if (q.includes('harohalli') || q.includes('kanakapura')) {
      campusId = 'rv_harohalli';
    } else if (q.includes('electronic city') || q.includes('ecity')) {
      campusId = 'rv_ecity';
    } else if (q.includes('north') || q.includes('yelahanka') || q.includes('hebbal')) {
      campusId = 'rv_north';
    } else if (q.includes('south') || q.includes('jp nagar')) {
      campusId = 'rv_south';
    } else if (q.includes('mysore') || q.includes('mysuru')) {
      campusId = 'rv_mysuru';
    } else if (q.includes('vvn') || q.includes('vv puram')) {
      campusId = 'vvn';
    }

    if (!campusId) return null;

    const campus = this.kb.institutes.find(c => c.id === campusId);
    if (!campus) return null;

    // 2. Check for Hostel / Boarding Inquiries at this Campus
    if (q.includes('hostel') || q.includes('boarding') || q.includes('stay') || q.includes('room') || q.includes('accommodation')) {
      this.logTelemetry('campus_hostel_inquiry', { campusId });
      if (campusId === 'rv_harohalli') {
        return {
          type: 'bot',
          text: `🏡 **Yes, absolutely! RV PU College Harohalli is a premier 50-Acre Residential Campus with full boarding facilities.**\n\n` +
            `• **Separate Hostels:** Modern, secure, air-cooled hostel blocks for both boys and girls.\n` +
            `• **24/7 Faculty Mentorship:** Evening supervised mentor study hours (6:30 PM - 9:30 PM) with resident faculty on standby.\n` +
            `• **Health & Wellness:** 24/7 medical clinic with resident nurse, hygienic vegetarian dining planned by nutritionists, and vast sports grounds (cricket, football, basketball).\n\n` +
            `📍 **Location:** Kanakapura Highway (distraction-free green environment).`,
          quickChips: [
            { label: '📝 Inquire Harohalli Hostel Admission', action: 'open_lead_form', payload: { reason: 'harohalli_hostel' } },
            { label: '🏡 View Harohalli Details', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
            { label: '⏱️ View 24/7 Daily Schedule', action: 'view_schedules' },
            { label: '🔙 Main Menu', action: 'reset_context' }
          ]
        };
      } else if (campusId === 'nmkrv') {
        return {
          type: 'bot',
          text: `🏡 **Yes! NMKRV PU College for Women has a secure, dedicated on-campus Women's Hostel.**\n\n` +
            `• **Security & Safety:** Biometric entry, 24/7 CCTV surveillance, and resident lady wardens.\n` +
            `• **Facilities:** Hygienic vegetarian dining hall, study lounge, and Wi-Fi access.\n` +
            `• **Location:** Located right inside the campus boundary in Jayanagar 3rd Block (adjacent to South End Circle Metro Station).`,
          quickChips: [
            { label: '📝 Inquire for NMKRV Hostel', action: 'open_lead_form', payload: { reason: 'nmkrv_hostel' } },
            { label: '🏛️ View NMKRV Details', action: 'select_campus', payload: { campusId: 'nmkrv' } },
            { label: '🔙 Main Menu', action: 'reset_context' }
          ]
        };
      } else if (campusId === 'rv_mysuru') {
        return {
          type: 'bot',
          text: `🏡 **Yes! RV PU College Mysuru offers verified hostel and boarding support** for outstation students coming from Mandya, Hassan, and Coorg.\n\nDay-scholar facilities with city bus transit are also fully operational.`,
          quickChips: [
            { label: '📝 Inquire for Mysuru Boarding', action: 'open_lead_form', payload: { reason: 'mysuru_hostel' } },
            { label: '🏛️ View Mysuru Details', action: 'select_campus', payload: { campusId: 'rv_mysuru' } },
            { label: '🔙 Main Menu', action: 'reset_context' }
          ]
        };
      } else {
        return {
          type: 'bot',
          text: `ℹ️ **No, ${campus.name} is a Day Scholar campus and does not have an in-campus hostel.**\n\n` +
            `However, ${campus.shortName} operates extensive college bus transit across Bengaluru routes.\n\n` +
            `For students requiring full residential boarding with 24/7 faculty mentorship, RSST provides our **50-Acre Harohalli Residential Campus** (or NMKRV Women's Hostel for female students in Jayanagar).`,
          quickChips: [
            { label: '🏡 Explore Harohalli 50-Acre Residential', action: 'select_campus', payload: { campusId: 'rv_harohalli' } },
            { label: `🚌 View ${campus.shortName} Bus Routes`, action: 'select_campus', payload: { campusId: campus.id } },
            { label: '📝 Speak to Admissions Counselor', action: 'open_lead_form' }
          ]
        };
      }
    }

    // 3. Check for Gender / Boys / Girls Inquiries
    if (q.includes('boy') || q.includes('girl') || q.includes('women') || q.includes('female') || q.includes('male') || q.includes('coed') || q.includes('co-ed')) {
      this.logTelemetry('campus_gender_inquiry', { campusId });
      if (campusId === 'nmkrv') {
        return {
          type: 'bot',
          text: `👩 **NMKRV PU College is exclusively an institution for Women.**\n\n` +
            `Male students cannot enroll at NMKRV. However, all **7 other RV PU Colleges** under RSST are fully **Co-educational (Co-ed)** and welcome both boys and girls:\n` +
            `• **SSMRV PU College** (Jayanagar 4th T Block — right next door!)\n` +
            `• **RV PU College South** (Kanakapura Road)\n` +
            `• **RV PU College North** (Yelahanka / Hebbal)\n` +
            `• **RV PU College, Electronic City**\n` +
            `• **RV PU College, Harohalli (Residential)**\n` +
            `• **RV PU College, Mysuru**\n` +
            `• **VVN PU College, Bengaluru**`,
          quickChips: [
            { label: '🏛️ Explore SSMRV (Co-ed Jayanagar)', action: 'select_campus', payload: { campusId: 'ssmrv' } },
            { label: '🏫 View All Co-ed Campuses', action: 'explore_campuses' },
            { label: '📝 Speak to Counselor', action: 'open_lead_form' }
          ]
        };
      } else {
        return {
          type: 'bot',
          text: `👥 **Yes! ${campus.name} is a Co-educational (Co-ed) campus**, open to both boys and girls for Science and Commerce streams.\n\n` +
            `*(Note: Only NMKRV PU College in Jayanagar is exclusively for women).*`,
          quickChips: [
            { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
            { label: '📚 View Courses Offered', action: 'explore_courses' },
            { label: '📝 Apply for Admission', action: 'open_lead_form' }
          ]
        };
      }
    }

    // 4. Check for Bus / Transit Inquiries at this Campus
    if (q.includes('bus') || q.includes('transport') || q.includes('route') || q.includes('commute')) {
      this.logTelemetry('campus_transport_inquiry', { campusId });
      const routes = (campus.transportRoutes && campus.transportRoutes.length > 0) 
        ? campus.transportRoutes.join(', ') 
        : 'Major city arterial roads';
      return {
        type: 'bot',
        text: `🚌 **Yes! College bus transit is available for ${campus.name}.**\n\n` +
          `• **Key Routes & Localities Covered:** ${routes}.\n` +
          `• **Safety:** GPS-tracked college buses with dedicated drivers and safety escorts.\n` +
          `• **Schedule:** Morning arrival by 8:15 AM and evening departure at 4:15 PM after doubt-clearing clinics.`,
        quickChips: [
          { label: `📞 Inquire About ${campus.shortName} Bus Routes`, action: 'open_lead_form', payload: { reason: `${campus.id}_transport` } },
          { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 5. Detect Program
    let programType = null;
    if (q.includes('neet') || q.includes('medical') || q.includes('doctor') || q.includes('mbbs') || q.includes('biology')) {
      programType = 'neet';
    } else if (q.includes('jee adv') || q.includes('jee advanced') || q.includes('iit') || (q.includes('advanced') && q.includes('jee'))) {
      programType = 'jee_adv';
    } else if (q.includes('jee') || q.includes('engineering') || q.includes('nit')) {
      programType = 'jee_main';
    } else if (q.includes('kcet') || q.includes(' cet') || q === 'cet' || q.includes('rvce') || q.includes('comedk')) {
      programType = 'kcet';
    } else if (q.includes('commerce') || q.includes('ca ') || q.includes('clat') || q.includes('cma') || q.includes('cs ') || q.includes('law') || q.includes('ipmat') || q.includes('account')) {
      programType = 'commerce';
    }

    if (!programType) return null;

    this.logTelemetry('program_at_campus_inquiry', { campusId, programType });

    // Handle NEET (Offered across ALL 8 Campuses)
    if (programType === 'neet') {
      return {
        type: 'bot',
        text: `🩺 **Yes, absolutely! NEET UG coaching is offered at ${campus.name}.**\n\n` +
          `At **${campus.name}**, we provide **Course 3: NEET UG + KCET + PU Board Course** with the **PCMB (Physics, Chemistry, Mathematics, Biology)** stream.\n\n` +
          `### 🌟 Key Highlights at ${campus.name}:\n` +
          `• **Synchronized Timetable:** Karnataka State PU Board theory + NEET entrance coaching under one unified schedule (no external coaching or tuition fatigue).\n` +
          `• **100% NCERT Mastery:** In-depth line-by-line coverage for Biology and Chemistry.\n` +
          `• **NTA Mock Drills & OMR Analytics:** Regular weekend full-length simulation tests with negative marking control.\n` +
          `• **Dual Advantage:** Prepares students simultaneously for **NEET UG (MBBS/BDS)** and **KCET Medical/Allied Sciences** (Veterinary, Agriculture, Pharmacy, etc.).\n\n` +
          `📍 **Campus Type:** ${campus.campusType} (${campus.hasHostel ? 'Hostel Available' : 'Day Scholar with College Bus Transit'})\n` +
          `📌 **Address:** ${campus.address}`,
        quickChips: [
          { label: `📝 Inquire for ${campus.shortName} NEET Batch`, action: 'open_lead_form', payload: { reason: `${campus.id}_neet_inquiry` } },
          { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
          { label: '🩺 Explore Course 3: NEET UG', action: 'select_course', payload: { courseId: 'neet_ug' } },
          { label: '🏫 All Campuses Offering NEET', action: 'filter_campuses', payload: { programKey: 'neet' } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // Handle JEE Advanced (Offered at 5 campuses: North, South, E-City, Mysuru, NMKRV)
    if (programType === 'jee_adv') {
      const hasJeeAdv = ['rv_north', 'rv_south', 'rv_mysuru', 'rv_ecity', 'nmkrv'].includes(campusId);
      if (hasJeeAdv) {
        return {
          type: 'bot',
          text: `🚀 **Yes! JEE Advanced (IIT Track) is offered at ${campus.name}.**\n\n` +
            `At **${campus.name}**, we offer **Course 1: JEE Advanced (Main + KCET Decoded) + PU Board**.\n\n` +
            `• **Objective:** Designed for ambitious students aiming for top 1,000 all-India ranks in JEE Advanced to secure seats in premier IITs.\n` +
            `• **Streams:** Science (PCMB or PCMC).\n` +
            `• **Zero-Clash Timetable:** PU board syllabus + advanced multi-concept problem solving conducted concurrently under one timetable.\n\n` +
            `📍 **Location:** ${campus.address}`,
          quickChips: [
            { label: `📝 Apply for ${campus.shortName} JEE Adv`, action: 'open_lead_form', payload: { reason: `${campus.id}_jeeadv_inquiry` } },
            { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
            { label: '🚀 View Course 1: JEE Advanced', action: 'select_course', payload: { courseId: 'jee_adv' } },
            { label: '🏫 5 Campuses with JEE Adv', action: 'filter_campuses', payload: { programKey: 'jee_adv' } }
          ]
        };
      } else {
        return {
          type: 'bot',
          text: `ℹ️ **At ${campus.name}, we offer Course 2: JEE (Main + KCET Decoded) + PU Board**, which thoroughly prepares students for JEE Main, top NITs, IIITs, and KCET ranks for RVCE.\n\n` +
            `If you are specifically seeking **Course 1: JEE Advanced (IIT focus)**, it is offered at these 5 RV campuses:\n` +
            `• **RV PU College North, Bengaluru**\n` +
            `• **RV PU College South, Bengaluru**\n` +
            `• **RV PU College, Electronic City**\n` +
            `• **RV PU College, Mysuru**\n` +
            `• **NMKRV PU College, Bengaluru**`,
          quickChips: [
            { label: `🚀 View Course 2 at ${campus.shortName}`, action: 'select_campus', payload: { campusId: campus.id } },
            { label: '🏫 View 5 JEE Advanced Campuses', action: 'filter_campuses', payload: { programKey: 'jee_adv' } },
            { label: '📝 Speak to Academic Counselor', action: 'open_lead_form' }
          ]
        };
      }
    }

    // Handle JEE Main / Engineering (Offered at ALL 8 Campuses)
    if (programType === 'jee_main') {
      return {
        type: 'bot',
        text: `🚀 **Yes, absolutely! JEE Main & Engineering entrance coaching is offered at ${campus.name}.**\n\n` +
          `At **${campus.name}**, we provide **Course 2: JEE (Main + KCET Decoded) + PU Board** (and Course 1 JEE Advanced if applicable).\n\n` +
          `• **Streams:** Science (PCMB, PCMC)\n` +
          `• **Target:** Dual mastery of scoring 98%+ in Karnataka State PU Board and securing 99+ percentile in JEE Main for premier NITs, IIITs, and top KCET ranks for RVCE.\n\n` +
          `📍 **Location:** ${campus.address}`,
        quickChips: [
          { label: `📝 Inquire for ${campus.shortName} JEE Batch`, action: 'open_lead_form', payload: { reason: `${campus.id}_jee_inquiry` } },
          { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
          { label: '🚀 Explore Course 2: JEE Main', action: 'select_course', payload: { courseId: 'jee_main' } }
        ]
      };
    }

    // Handle KCET / CET (Offered at ALL 8 Campuses)
    if (programType === 'kcet') {
      return {
        type: 'bot',
        text: `🚀 **Yes, definitely! KCET Coaching is offered at ${campus.name}.**\n\n` +
          `KCET preparation is seamlessly integrated into both **Course 1 & Course 2 (Engineering)** and **Course 3 (Medical & Allied Sciences)** at **${campus.name}**.\n\n` +
          `• **Target:** Securing single-digit state ranks to enter **RV College of Engineering (RVCE)** under subsidized government quota fees.\n` +
          `• **Speed Training:** Mastering solving 60 MCQs in 80 minutes without negative marking.\n\n` +
          `📍 **Location:** ${campus.address}`,
        quickChips: [
          { label: `📝 Apply for ${campus.shortName} KCET Batch`, action: 'open_lead_form', payload: { reason: `${campus.id}_kcet_inquiry` } },
          { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
          { label: '🏎️ ReVise CET Crash Course', action: 'select_course', payload: { courseId: 'revise_cet' } }
        ]
      };
    }

    // Handle Commerce / CA / CLAT (Offered at 7 Campuses - Not at VVN)
    if (programType === 'commerce') {
      const hasCommerce = ['rv_north', 'rv_south', 'ssmrv', 'nmkrv', 'rv_harohalli', 'rv_ecity', 'rv_mysuru'].includes(campusId);
      if (hasCommerce) {
        return {
          type: 'bot',
          text: `📊 **Yes! Commerce Decoded Programme (Commerce + CA Foundation + CLAT) is offered at ${campus.name}.**\n\n` +
            `At **${campus.name}**, we offer **Course 4: Commerce Decoded Programme** with:\n` +
            `• **Combinations:** ABMS (Accountancy, Business Studies, Basic Maths, Statistics) & ABME (with Economics).\n` +
            `• **Integrated Coaching:** CA Foundation + CLAT (Law) + IPMAT + CUET led by practicing Chartered Accountants and advocates.\n\n` +
            `📍 **Location:** ${campus.address}`,
          quickChips: [
            { label: `📝 Apply for ${campus.shortName} Commerce`, action: 'open_lead_form', payload: { reason: `${campus.id}_commerce_inquiry` } },
            { label: `🏛️ View ${campus.shortName} Details`, action: 'select_campus', payload: { campusId: campus.id } },
            { label: '📊 View Course 4: Commerce Decoded', action: 'select_course', payload: { courseId: 'commerce' } }
          ]
        };
      } else {
        return {
          type: 'bot',
          text: `ℹ️ **No, Commerce is not offered at ${campus.name}.**\n\n` +
            `**${campus.name}** exclusively offers **Science streams (PCMB & PCMC)** with JEE Main & NEET/KCET preparation.\n\n` +
            `However, **Course 4: Commerce Decoded (CA Foundation + CLAT)** is offered at **7 other RV campuses**:\n` +
            `• **SSMRV PU College, Bengaluru (Jayanagar 4th T Block)**\n` +
            `• **NMKRV PU College for Women, Bengaluru (Jayanagar 3rd Block)**\n` +
            `• **RV PU College South, Bengaluru**\n` +
            `• **RV PU College North, Bengaluru**\n` +
            `• **RV PU College, Electronic City**\n` +
            `• **RV PU College, Harohalli** (Residential)\n` +
            `• **RV PU College, Mysuru**`,
          quickChips: [
            { label: '🏛️ SSMRV Commerce Campus', action: 'select_campus', payload: { campusId: 'ssmrv' } },
            { label: '👩 NMKRV Women Campus', action: 'select_campus', payload: { campusId: 'nmkrv' } },
            { label: '🏫 View All 7 Commerce Campuses', action: 'filter_campuses', payload: { programKey: 'commerce' } }
          ]
        };
      }
    }

    return null;
  }

  // --- Natural Language Query Handler (Free Text & Short Abbreviations) ---
  async handleUserQuery(queryText) {
    if (!queryText || typeof queryText !== 'string') return this.getWelcomePayload();
    const raw = queryText.trim();
    const q = raw.toLowerCase().replace(/[?!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
    this.logTelemetry('user_message', { query: queryText });

    // 0. Warm Human Greetings
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'namaskara', 'good morning', 'good afternoon', 'good evening', 'hey there', 'greetings'];
    if (greetings.includes(q) || q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ')) {
      return {
        type: 'bot',
        text: `👋 **Hello and a warm welcome to RV Learning Hub!**\n\nI'm your senior academic admissions guide. Whether you are exploring **11th/PU-I admissions**, preparing for **KCET & RVCE**, **JEE (Main/Adv)**, **NEET UG**, **Commerce (CA/CLAT)**, or inquiring about **RACE entrance scholarships**, I'm delighted to assist you!\n\nHow can I help you today? You can type any question or pick a quick option below:`,
        quickChips: [
          { label: '🎯 RACE Entrance Exam', action: 'ask_race' },
          { label: '🚀 KCET Coaching & RVCE', action: 'ask_kcet' },
          { label: '🏫 Explore 8 Campuses', action: 'explore_campuses' },
          { label: '📚 View All Courses', action: 'explore_courses' },
          { label: '💰 Fees & Scholarships', action: 'ask_fees' },
          { label: '📞 Speak with Counselor', action: 'open_lead_form' }
        ]
      };
    }

    // 0.1 Gratitude & Politeness
    if (q === 'thanks' || q === 'thank you' || q.includes('thank you') || q.includes('thanks a lot') || q === 'ok' || q === 'okay' || q === 'cool' || q === 'great' || q === 'super' || q === 'awesome') {
      return {
        type: 'bot',
        text: `You're very welcome! 😊 It's our absolute pleasure to assist you. If you or your parents have any more questions about admissions, cutoffs, or campus visits, please feel free to ask anytime.\n\nYou can also speak directly with our senior counseling desk at **080-2663 2000**.`,
        quickChips: [
          { label: '📝 Book Campus Visit', action: 'open_lead_form', payload: { reason: 'campus_visit' } },
          { label: '🏛️ Explore Campuses', action: 'explore_campuses' },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 0.2 Specific Program-at-Campus Inquiries (e.g. "whether neet is in rvpu south", "is neet in south", "is commerce in vvn")
    const programAtCampusMatch = this.checkProgramAtCampus(q);
    if (programAtCampusMatch) {
      return programAtCampusMatch;
    }

    // 1. RACE Exam / Scholarship / Entrance Test Inquiries & Abbreviations
    const isRaceQuery = q === 'race' || 
      q === 'race exam' || 
      q === 'race test' || 
      q.includes('race') || 
      q === 'rv-tsa' || 
      q === 'tsa' || 
      q === 'rvtsa' ||
      q.includes('entrance test') || 
      q.includes('scholarship test') || 
      q.includes('admission test') || 
      q.includes('aptitude test') || 
      q.includes('entrance exam') ||
      q.includes('scholarship exam');

    if (isRaceQuery) {
      return this.handleRaceInquiry();
    }

    // 2. KCET Inquiries & Abbreviations
    const isKcetQuery = q === 'kcet' || 
      q === 'cet' || 
      q === 'kea' || 
      q === 'k-cet' || 
      q.includes('kcet') || 
      q === 'revise cet' || 
      q.includes('revise cet') || 
      q.includes('cet coaching') || 
      q.includes('cet exam') || 
      q.includes('cet marks') || 
      q.includes('cet rank') ||
      q.includes('cet test');

    if (isKcetQuery) {
      return this.handleKcetInquiry();
    }

    // 2.1 RVCE / Engineering College Inquiries
    if (q === 'rvce' || q.includes('rvce') || q.includes('rv college of engineering') || q.includes('bmsce') || q.includes('msrit')) {
      return {
        type: 'bot',
        text: `🏛️ **Pathways to RV College of Engineering (RVCE) via RVLH**\n\nRV College of Engineering (RVCE) is Karnataka's #1 ranked engineering college under RSST. The most cost-effective and prestigious way to secure a seat at RVCE is by achieving a **top 100 KCET Rank** for government quota subsidized fees (~₹1 Lakh/year vs higher private/mgmt fees).\n\n### 🚀 How RVLH Prepares You for RVCE:\n• **Course 1: JEE Advanced (Main + KCET Decoded):** Top-tier IIT/NIT & RVCE coaching at North, South, E-City, Mysuru, and NMKRV.\n• **Course 2: JEE Main + KCET Decoded:** High-yield KCET drills across **ALL 8 Campuses**.\n• **ReVise CET Crash Course:** 30–60 day intensive revision right before KCET.\n• **Zero-Clash Timetable:** Both board theory (derivations) and entrance speed drills (60 MCQs in 80 mins) taught in college hours.\n\nWould you like guidance on which RVLH campus is best located for you?`,
        quickChips: [
          { label: '🚀 KCET Coaching Details', action: 'ask_kcet' },
          { label: '🏛️ Campuses with KCET & JEE', action: 'filter_campuses', payload: { programKey: 'kcet' } },
          { label: '📝 Request RVCE Cutoff Guide', action: 'open_lead_form', payload: { reason: 'rvce_guidance' } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 2.2 CLAT & Law Inquiries
    if (q === 'clat' || q === 'law' || q.includes('clat') || q.includes('law entrance') || q.includes('nlu') || q.includes('nlsiu')) {
      return {
        type: 'bot',
        text: `⚖️ **CLAT & Integrated Law Coaching at RVLH**\n\nFor students aspiring to enter premier National Law Universities (like NLSIU Bengaluru, NALSAR, and WBNUJS), RVLH offers **Course 4: Commerce Decoded Programme (Commerce + CA + CLAT + PU Board)**.\n\n### 🌟 Highlights of the Integrated CLAT Track:\n• **Dual Professional Advantage:** Prepares you simultaneously for **CLAT (Law)** and **CA Foundation** along with Karnataka State PU Board Commerce.\n• **Curriculum Coverage:** Legal reasoning, logical deduction, current affairs/GK, reading comprehension, and elementary quantitative techniques.\n• **Master Mentors:** Classes guided by senior legal minds, advocates, and practicing CAs.\n• **Offered at 7 Campuses:** RV North, RV South, SSMRV (Jayanagar), NMKRV (Jayanagar), RV Electronic City, RV PU Harohalli, and RV PU Mysuru. *(Note: Not offered at VVN)*\n\nWould you like to explore our Commerce & Law batches?`,
        quickChips: [
          { label: '📊 View Course 4: Commerce & CLAT', action: 'select_course', payload: { courseId: 'commerce' } },
          { label: '🏫 7 Campuses with Commerce & CLAT', action: 'filter_campuses', payload: { programKey: 'commerce' } },
          { label: '📝 Speak to Law & Commerce Counselor', action: 'open_lead_form', payload: { reason: 'clat_inquiry' } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 2.3 Science Streams & Abbreviations (PCMB / PCMC)
    if (q === 'pcmb' || q === 'pcmc' || q === 'science' || q.includes('pcmb') || q.includes('pcmc') || q.includes('science stream')) {
      return {
        type: 'bot',
        text: `🔬 **Science Streams at RV Learning Hub (PCMB & PCMC)**\n\nAll 8 RVLH PU Campuses offer Karnataka State Pre-University Science with integrated national entrance coaching:\n\n• **PCMB (Physics, Chemistry, Maths, Biology):** Ideal for students keeping options open for both **Medical (NEET UG)** and **Engineering (KCET / JEE)**, or agriculture/veterinary/biotechnology.\n• **PCMC (Physics, Chemistry, Maths, Computer Science):** Ideal for pure engineering aspirants targeting **IITs, NITs, IIITs, and RVCE**.\n\n### 📘 Integrated Science Courses:\n1. **Course 1: JEE Advanced (Main + KCET Decoded)** (North, South, E-City, Mysuru, NMKRV)\n2. **Course 2: JEE (Main + KCET Decoded)** (All 8 Campuses)\n3. **Course 3: NEET UG + KCET + PU Board** (All 8 Campuses)\n4. **ReVise CET Crash Course** (All 8 Campuses)\n\nWhich combination (PCMB or PCMC) are you leaning toward?`,
        quickChips: [
          { label: '🚀 Course 1: JEE Advanced', action: 'select_course', payload: { courseId: 'jee_adv' } },
          { label: '🚀 Course 2: JEE Main + KCET', action: 'select_course', payload: { courseId: 'jee_main' } },
          { label: '🩺 Course 3: NEET UG + KCET', action: 'select_course', payload: { courseId: 'neet_ug' } },
          { label: '🏛️ Explore 8 Campuses', action: 'explore_campuses' }
        ]
      };
    }

    // 2.4 Commerce Streams & Abbreviations (EBAC / MEBA / PEAC / CA)
    if (q === 'ebac' || q === 'meba' || q === 'peac' || q === 'ca' || q === 'cpt' || q === 'cma' || q === 'cs' || q.includes('ca foundation') || q.includes('chartered')) {
      return {
        type: 'bot',
        text: `📊 **Commerce & Professional Finance Streams at RVLH**\n\nRVLH offers **Course 4: Commerce Decoded Programme (Commerce + CA + CLAT + PU Board)** across **7 constituent campuses**:\n• **Combinations Offered:** EBAC (Economics, Business Studies, Accountancy, Computer Science) and MEBA (Basic Maths, Economics, Business Studies, Accountancy).\n• **Professional Coaching:** Concurrent preparation for **CA Foundation (ICAI)**, **CMA Foundation**, **CS (CSEET)**, and **CLAT (Law)**.\n• **CUET Training:** Built-in guidance for admissions into SRCC, St. Xavier's, Christ University, and Hindu College.\n• **Available Campuses:** RV North, RV South, SSMRV, NMKRV, RV Electronic City, RV Harohalli, and RV Mysuru. *(Note: Not at VVN)*\n\nWould you like to speak to our commerce academic head?`,
        quickChips: [
          { label: '📊 Explore Commerce Decoded', action: 'select_course', payload: { courseId: 'commerce' } },
          { label: '🏫 7 Campuses with Commerce', action: 'filter_campuses', payload: { programKey: 'commerce' } },
          { label: '📝 Request CA Foundation Brochure', action: 'open_lead_form', payload: { reason: 'ca_commerce_inquiry' } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 2.5 PU / PUC / 11th / 10th Transition Inquiries
    if (q === 'pu' || q === 'puc' || q === 'puc 1' || q === 'puc 2' || q === 'pu-i' || q === 'pu-ii' || q === '11th' || q === '12th' || q === '10th' || q === 'sslc' || q === 'cbse' || q === 'icse' || q === 'admission' || q === 'admissions' || q === 'apply' || q === 'register' || q === 'seat' || q === 'seats' || q === 'cutoff') {
      return {
        type: 'bot',
        text: `🎓 **Pre-University Admissions 2026-27 at RV Learning Hub**\n\nAdmissions for 11th Grade / PU-I are now open across all **8 RV PU Colleges** under RSST for students completing Class 10 (SSLC, CBSE, or ICSE):\n\n### 🌟 The 4 Synchronized Decoded Courses:\n• 📘 **Course 1: JEE Advanced (Main + KCET Decoded) + PU Board** (North, South, E-City, Mysuru, NMKRV)\n• 📘 **Course 2: JEE (Main + KCET Decoded) + PU Board** (All 8 Campuses)\n• 📘 **Course 3: NEET UG + KCET + PU Board Course** (All 8 Campuses)\n• 📘 **Course 4: Commerce Decoded Programme (Commerce + CA + CLAT + PU Board)** (7 Campuses - North, South, SSMRV, NMKRV, Harohalli, E-City, Mysuru)\n\n### 📝 4 Easy Steps to Apply:\n1. Take the **RACE Entrance & Scholarship Assessment** (Online or In-Campus).\n2. Unlock up to **100% Tuition Fee Waiver**.\n3. Attend campus counseling with parents to finalize batch & stream.\n4. Complete document verification & seat confirmation.`,
        quickChips: [
          { label: '🎯 Register for RACE Online', action: 'ask_race' },
          { label: '🚀 KCET Coaching & RVCE', action: 'ask_kcet' },
          { label: '🏫 View All 8 Campuses', action: 'explore_campuses' },
          { label: '💰 Check Fees & Scholarships', action: 'ask_fees' },
          { label: '📝 Apply for 2026-27 Admissions', action: 'open_lead_form', payload: { reason: 'pu_admission_apply' } }
        ]
      };
    }

    // 2.6 Bus & Transit Inquiries
    if (q === 'bus' || q === 'transport' || q === 'van' || q === 'route' || q.includes('bus') || q.includes('transport') || q.includes('commute') || q.includes('metro')) {
      return {
        type: 'bot',
        text: `🚌 **College Bus Transit & Metro Connectivity**\n\nRVLH ensures stress-free daily travel for students across Bengaluru and Mysuru:\n\n• **SSMRV (Jayanagar):** Extensive bus routes covering South, Central & West Bangalore (Banashankari, JP Nagar, BTM, Basavanagudi, Vijayanagar).\n• **NMKRV (Jayanagar):** Right next to **South End Circle Metro Station (Green Line)** + dedicated college buses.\n• **RV North (Yelahanka/Hebbal):** Transit routes covering Yelahanka, Sahakarnagar, Hebbal, Manyata tech corridor, and Vidyaranyapura.\n• **RV South (Kanakapura Rd):** Direct transit along Kanakapura Rd, JP Nagar, and Bannerghatta Rd.\n• **RV Electronic City:** Buses across Hosur Rd, E-City Phase 1 & 2, Bommasandra, and HSR Layout.\n• **Harohalli Residential:** Weekend transit shuttle to Bengaluru city centers for residential students.\n• **VVN PU (VV Puram):** 2-minute walk from **National College Metro Station**.\n• **RV Mysuru:** Buses covering Kuvempunagar, Saraswathipuram, Gokulam, and Vijayanagar.\n\nWhich area do you need transit from?`,
        quickChips: [
          { label: '📍 Find Nearest Campus', action: 'locate_nearest' },
          { label: '🏫 Explore Campuses', action: 'explore_campuses' },
          { label: '📞 Ask Transport Desk', action: 'open_lead_form', payload: { reason: 'transport_inquiry' } },
          { label: '🔙 Main Menu', action: 'reset_context' }
        ]
      };
    }

    // 0. Comprehensive Overview / Explain Everything
    if (q.includes('explain everything') || q.includes('all institutes') || q.includes('overview') || q.includes('tell me about rvlh') || q.includes('what is rvlh')) {
      return this.explainEverything();
    }

    // 0.0 All Pages / Sitemap / Navigation Links
    if (q.includes('all pages') || q.includes('sitemap') || q.includes('website link') || q.includes('page link') || q.includes('navigation') || q.includes('pages in website') || q === 'pages' || q === 'links' || q.includes('show all pages') || q.includes('website pages')) {
      return this.handleSiteMapInquiry();
    }

    // 0.1 Events & Academic Calendar Inquiry
    if (q.includes('event') || q.includes('seminar') || q.includes('webinar') || q.includes('open house') || q.includes('workshop') || q.includes('calendar') || q.includes('orientation') || q.includes('conclave') || q.includes('upcoming') || q.includes('events page')) {
      return this.handleEventsInquiry();
    }

    // 0.2 Specific Website Page Requests
    if (q.includes('campus page') || q.includes('campuses page') || q.includes('campuses link') || q.includes('colleges page') || q.includes('campus directory')) {
      return this.handleCampusesPageInquiry();
    }
    if (q.includes('course page') || q.includes('courses page') || q.includes('courses link') || q.includes('tracks page') || q.includes('streams page')) {
      return this.handleCoursesPageInquiry();
    }
    if (q.includes('hostel page') || q.includes('hostels page') || q.includes('hostel link') || q.includes('residential page') || q.includes('boarding page')) {
      return this.handleHostelInquiry();
    }
    if (q.includes('admission page') || q.includes('admissions page') || q.includes('scholarship page') || q.includes('fees page') || q.includes('fee page') || q.includes('scholarships page') || q.includes('admissions link')) {
      return this.handleAdmissionsPageInquiry();
    }
    if (q.includes('contact page') || q.includes('helpline page') || q.includes('contact link') || q.includes('phone page') || q.includes('address page') || q.includes('desk page') || q.includes('contact desk')) {
      return this.handleContactPageInquiry();
    }
    if (q.includes('home page') || q.includes('main page') || q.includes('homepage') || q.includes('index page') || q.includes('website link')) {
      return this.handleHomePageInquiry();
    }

    // 0.3 Timetable & Daily Schedule
    if (q.includes('schedule') || q.includes('timetable') || q.includes('routine') || q.includes('timing') || q.includes('hours')) {
      return this.explainDailySchedule();
    }

    // 0.4 Campus Comparison
    if (q.includes('compare') || q.includes('difference between') || q.includes('which campus is better')) {
      return this.compareCampuses();
    }

    // 0.5 Faculty & Academic Leadership Inquiry
    if (q.includes('faculty') || q.includes('director') || q.includes('teacher') || q.includes('who is the director') || q.includes('principal') || q.includes('staff') || q.includes('professors') || q.includes('mentors') || q.includes('mayur') || q.includes('goyal')) {
      return this.handleFacultyInquiry();
    }

    // 0.6 Source of Information / Authenticity Inquiry
    if (q.includes('where did you get') || q.includes('source') || q.includes('how do you know') || q.includes('where is this info') || q.includes('where is this data') || q.includes('who gave this')) {
      return this.handleSourceOfInfo();
    }

    // 1. Check for specific campus mentions
    if (q.includes('ssmrv')) return this.selectCampus('ssmrv');
    if (q.includes('nmkrv')) return this.selectCampus('nmkrv');
    if (q.includes('harohalli') || q.includes('kanakapura')) return this.selectCampus('rv_harohalli');
    if (q.includes('electronic city') || q.includes('ecity')) return this.selectCampus('rv_ecity');
    if (q.includes('north') || q.includes('yelahanka') || q.includes('hebbal')) return this.selectCampus('rv_north');
    if (q.includes('south') || q.includes('jp nagar')) return this.selectCampus('rv_south');
    if (q.includes('mysore') || q.includes('mysuru')) return this.selectCampus('rv_mysuru');
    if (q.includes('vvn') || q.includes('vv puram')) return this.selectCampus('vvn');

    // 2. Program-Filtered Campus Search
    const isJeeFilter = q === 'jee' || 
      q === 'jee main' || 
      q === 'only jee' || 
      q === 'search jee' || 
      q === 'only search jee' ||
      (q.includes('jee') && (
        q.includes('filter') || q.includes('search') || q.includes('show') || 
        q.includes('college') || q.includes('campus') || q.includes('institute') || 
        q.includes('which') || q.includes('where') || q.includes('only') || 
        q.includes('list') || q.includes('offer') || q.includes('have') || q.includes('has')
      ));

    if (isJeeFilter) {
      if (q.includes('jee adv') || q.includes('iit') || q.includes('advanced')) {
        return this.filterCampusesByProgram('jee_adv');
      }
      return this.filterCampusesByProgram('jee_main');
    }

    const isCommerceFilter = q === 'commerce' || 
      q === 'only commerce' || 
      q === 'search commerce' ||
      (q.includes('commerce') && (
        q.includes('filter') || q.includes('search') || q.includes('show') || 
        q.includes('college') || q.includes('campus') || q.includes('institute') || 
        q.includes('which') || q.includes('where') || q.includes('only') || 
        q.includes('list') || q.includes('offer') || q.includes('have') || q.includes('has')
      ));

    if (isCommerceFilter) {
      return this.filterCampusesByProgram('commerce');
    }

    const isNeetFilter = q === 'neet' || 
      q === 'only neet' || 
      q === 'search neet' ||
      (q.includes('neet') && (
        q.includes('filter') || q.includes('search') || q.includes('show') || 
        q.includes('college') || q.includes('campus') || q.includes('institute') || 
        q.includes('which') || q.includes('where') || q.includes('only') || 
        q.includes('list') || q.includes('offer') || q.includes('have') || q.includes('has')
      ));

    if (isNeetFilter) {
      return this.filterCampusesByProgram('neet_ug');
    }

    // Fallback course detail views
    if (q.includes('medical') || q.includes('mbbs') || q.includes('doctor')) {
      return this.selectCourse('neet_ug');
    }
    if (q.includes('engineering') || q.includes('nit') || q.includes('iit')) {
      return this.selectCourse('jee_main');
    }
    if (q.includes('revise') || q.includes('crash') || q.includes('test series')) {
      return this.selectCourse('revise_cet');
    }

    // 3. Hostel & Accommodation
    if (q.includes('hostel') || q.includes('stay') || q.includes('boarding') || q.includes('room') || q.includes('accommodation') || q.includes('food') || q.includes('mess')) {
      return this.handleHostelInquiry();
    }

    // 4. Fees & Costs
    if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('scholarship') || q.includes('discount') || q.includes('waiver')) {
      return this.handleFeesInquiry();
    }

    // 5. Contact / Phone / Email
    if (q === 'contact' || q === 'phone' || q === 'call' || q === 'email' || q === 'address' || q.includes('helpline') || q.includes('phone number')) {
      return this.handleContactPageInquiry();
    }

    // --- Query the Cognitive AI Brain ---
    return await this.queryBrain(queryText);
  }

  // --- Cognitive Brain Client (RAG & Multi-Institute AI) ---
  async queryBrain(queryText) {
    const brainUrl = (window.RVLH_CONFIG && window.RVLH_CONFIG.brainUrl) || '/api/brain';
    
    try {
      const response = await fetch(brainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          sessionId: this.getSessionId(),
          activeCampus: this.state.activeCampus ? this.state.activeCampus.id : null,
          activeCourse: this.state.activeCourse ? this.state.activeCourse.id : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.message) {
          const result = {
            type: 'bot',
            text: data.message,
            quickChips: data.suggestedQuickChips || []
          };

          // Attach recommended campus cards if emitted by Brain
          if (data.recommendedCampuses && data.recommendedCampuses.length > 0) {
            result.cardsType = 'campus_list';
            result.cards = this.kb.institutes
              .filter(i => data.recommendedCampuses.includes(i.id))
              .map(inst => ({
                id: inst.id,
                title: inst.shortName,
                location: inst.location,
                type: inst.campusType,
                streams: inst.streamsOffered.join(', ')
              }));
          }

          // Attach lead form if high purchase/inquiry intent was flagged by Brain
          if (data.triggerLeadForm) {
            result.formType = 'lead_form';
            result.formData = {
              reason: data.triggerLeadForm,
              preferredCampus: this.state.activeCampus ? this.state.activeCampus.name : '',
              preferredCourse: this.state.activeCourse ? this.state.activeCourse.title : '',
              campusOptions: this.kb.institutes.map(i => ({ id: i.id, name: i.name })),
              courseOptions: this.kb.courses.map(c => ({ id: c.id, title: c.title }))
            };
          }

          return result;
        }
      }
    } catch (err) {
      console.warn('[RVLH Engine] Brain endpoint unreachable, using local fallback:', err);
    }

    // Fallback: Local Rule-Based Matcher
    const q = queryText.toLowerCase().trim();
    for (const faq of this.kb.faqs) {
      if (faq.keywords.some(kw => q.includes(kw))) {
        return {
          type: 'bot',
          text: faq.answer,
          quickChips: [
            { label: '🏫 Explore Campuses', action: 'explore_campuses' },
            { label: '📚 View Courses', action: 'explore_courses' },
            { label: '📝 Speak to Counselor', action: 'open_lead_form' }
          ]
        };
      }
    }

    return {
      type: 'bot',
      text: `I'm here to assist you with everything regarding **RV Learning Hub**!\n\nYou can explore our **8 constituent PU colleges**, discover **JEE/NEET/Commerce** coaching, or ask about **hostels**, **scholarships**, and **fees**.`,
      quickChips: [
        { label: '🏫 View All 8 Campuses', action: 'explore_campuses' },
        { label: '📚 View All Courses', action: 'explore_courses' },
        { label: '🏡 Check Hostel Options', action: 'ask_hostel' },
        { label: '💰 Check Fee Structure', action: 'ask_fees' },
        { label: '📝 Connect with Counselor', action: 'open_lead_form' }
      ]
    };
  }

  // --- Helper to get or create Session ID ---
  getSessionId() {
    let sid = sessionStorage.getItem('rvlh_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem('rvlh_session_id', sid);
    }
    return sid;
  }

  // --- Internal Telemetry Logger ---
  logTelemetry(eventType, metadata = {}) {
    if (this.telemetry && typeof this.telemetry.logEvent === 'function') {
      this.telemetry.logEvent({
        instituteId: this.state.activeCampus ? this.state.activeCampus.id : 'rvlh',
        sessionId: this.getSessionId(),
        eventType,
        metaData: metadata
      });
    }
  }
}

// Export for module/script tag
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RVLHEngine;
} else if (typeof window !== 'undefined') {
  window.RVLHEngine = RVLHEngine;
}
