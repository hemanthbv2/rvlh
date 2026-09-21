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
      `Backed by **RSST (85+ years of historic legacy)**, RVLH integrates Karnataka Pre-University (PU) Board education with premier entrance exam preparation (**JEE, NEET, KCET & CA Foundation**). Students cover board theory and entrance objective drills under **one synchronized college timetable**—no evening tuition stress!\n\n` +
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
      `RV Learning Hub operates 8 constituent PU institutions under the governance of RSST (85+ years legacy) across Bengaluru and Mysuru:\n\n` +
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
        { label: '🚀 Campuses with JEE', action: 'filter_campuses', payload: { programKey: 'jee' } },
        { label: '🩺 Campuses with NEET', action: 'filter_campuses', payload: { programKey: 'neet_ug' } },
        { label: '📊 Campuses with Commerce', action: 'filter_campuses', payload: { programKey: 'commerce' } }
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
      title = '🚀 Campuses Offering JEE Advanced (IIT/NIT Track)';
      intro = 'The following **5 premier RVLH PU colleges** offer our specialized 2-Year integrated **JEE Advanced** coaching batch:';
    } else if (programKey.includes('jee') || programKey === 'engineering') {
      filterTag = 'jee';
      title = '🚀 Campuses Offering JEE (Main & Advanced) Coaching';
      intro = 'Here are the RVLH constituent PU colleges offering synchronized **JEE Main & Advanced** entrance preparation:';
    } else if (programKey.includes('commerce') || programKey.includes('ca')) {
      filterTag = 'commerce';
      title = '📊 Campuses Offering Commerce (CA Foundation / CS / CUET)';
      intro = 'Here are the **5 RVLH campuses** offering integrated **Commerce (EBAC/MEBA/PEAC)** with CA Foundation preparation.\n\n*(Note: RV North, RV E-City, and Harohalli Residential are pure Science/Engineering centers.)*';
    } else if (programKey.includes('neet') || programKey.includes('medical')) {
      filterTag = 'neet_ug';
      title = '🩺 Campuses Offering NEET UG Medical Coaching';
      intro = 'Here are the RVLH PU colleges offering synchronized **NEET UG Medical (MBBS/BDS)** preparation:';
    } else {
      filterTag = 'jee';
      title = '🚀 Campuses Offering JEE Coaching';
      intro = 'Here are the campuses offering integrated competitive entrance preparation:';
    }

    // Filter institutes
    const filteredInstitutes = this.kb.institutes.filter(inst => {
      if (!inst.courseIds) return true;
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

  // --- Natural Language Query Handler (Free Text) ---
  async handleUserQuery(queryText) {
    if (!queryText || typeof queryText !== 'string') return this.getWelcomePayload();
    const q = queryText.toLowerCase().trim();
    this.logTelemetry('user_message', { query: queryText });

    // 0. Comprehensive Overview / Explain Everything
    if (q.includes('explain everything') || q.includes('all institutes') || q.includes('overview') || q.includes('tell me about rvlh') || q.includes('what is rvlh')) {
      return this.explainEverything();
    }

    // 0.0 All Pages / Sitemap / Navigation Links
    if (q.includes('all pages') || q.includes('sitemap') || q.includes('website link') || q.includes('page link') || q.includes('navigation') || q.includes('pages in website') || q === 'pages' || q === 'links' || q.includes('show all pages') || q.includes('website pages')) {
      return this.handleSiteMapInquiry();
    }

    // 0.1 Events & Academic Calendar Inquiry (tells a bit about events + page link)
    if (q.includes('event') || q.includes('seminar') || q.includes('webinar') || q.includes('open house') || q.includes('workshop') || q.includes('calendar') || q.includes('orientation') || q.includes('conclave') || q.includes('upcoming') || q.includes('events page')) {
      return this.handleEventsInquiry();
    }

    // 0.2 Specific Website Page Requests (shows summary brief + direct page link)
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

    // 2. Program-Filtered Campus Search (When user asks which institutes have JEE / Commerce / NEET)
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
      return this.filterCampusesByProgram('jee');
    }

    const isCommerceFilter = q === 'commerce' || 
      q === 'only commerce' || 
      q === 'search commerce' ||
      (q.includes('commerce') && (
        q.includes('filter') || q.includes('search') || q.includes('show') || 
        q.includes('college') || q.includes('campus') || q.includes('institute') || 
        q.includes('which') || q.includes('where') || q.includes('only') || 
        q.includes('list') || q.includes('offer') || q.includes('have') || q.includes('has')
      )) || q.includes('ca foundation');

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
    if (q.includes('engineering') || q.includes('nit')) {
      return this.selectCourse('jee_main');
    }
    if (q.includes('cma') || q.includes('cs ') || q.includes('cuet') || q.includes('accountancy')) {
      return this.selectCourse('commerce');
    }
    if (q.includes('revise') || q.includes('crash') || q.includes('test series')) {
      return this.selectCourse('revise_cet');
    }

    // 3. Hostel & Accommodation
    if (q.includes('hostel') || q.includes('stay') || q.includes('boarding') || q.includes('room') || q.includes('accommodation')) {
      return this.handleHostelInquiry();
    }

    // 4. Fees & Costs
    if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('scholarship') || q.includes('discount')) {
      return this.handleFeesInquiry();
    }

    // 5. Contact / Phone / Email
    if (q === 'contact' || q === 'phone' || q === 'call' || q === 'email' || q === 'address' || q.includes('helpline')) {
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
