/**
 * RVLH Multi-Institute Chatbot - Pro UI Controller
 * Features:
 * - Widescreen Maximize / Minimize toggle
 * - Category Quick Filter Nav Toolbar
 * - Rich Markdown Table, Schedule, and List parsing
 * - Voice Input (Web Speech Recognition)
 * - Dynamic Campus & Course Carousels
 * - In-Chat Lead Micro-Form
 */

(function () {
  class RVLHWidget {
    constructor() {
      this.isOpen = false;
      this.isExpanded = false;
      this.engine = null;
      this.telemetry = null;
      this.container = null;
      this.messagesEl = null;
      this.inputEl = null;
      this.contextBarEl = null;
      this.recognition = null;
      this.isListening = false;

      this.init();
    }

    init() {
      // 1. Initialize Telemetry & Engine
      if (typeof RVLHTelemetry !== 'undefined') {
        this.telemetry = new RVLHTelemetry();
      }
      if (typeof RVLHEngine !== 'undefined') {
        this.engine = new RVLHEngine(window.RVLH_KB, this.telemetry);
      }

      // 2. Inject DOM Elements
      this.renderWidgetDOM();

      // 3. Init Speech Recognition
      this.initSpeechRecognition();

      // 4. Bind Event Listeners
      this.bindEvents();

      // 5. Render Initial Bot Greeting
      this.displayInitialGreeting();

      // 6. Auto-Open & Transparent Background Support
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('nobg') === '1' || urlParams.get('transparent') === '1' || document.body.dataset.nobg === 'true') {
        document.documentElement.style.background = 'transparent';
        document.body.style.background = 'transparent';
        document.body.style.backgroundColor = 'transparent';
      }
      if (urlParams.get('open') === '1' || urlParams.get('chat') === '1' || urlParams.get('auto') === '1' || document.body.dataset.autoOpen === 'true' || window.AUTO_OPEN_CHATBOT) {
        setTimeout(() => this.toggleChat(true), 50);
      }
    }

    renderWidgetDOM() {
      let root = document.getElementById('rvlh-widget-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'rvlh-widget-root';
        document.body.appendChild(root);
      }
      this.container = root;

      root.innerHTML = `
        <!-- Floating Launcher (FAB) -->
        <div class="rvlh-fab-container">
          <div class="rvlh-fab-badge" id="rvlh-fab-badge">
            <span class="rvlh-fab-badge-dot"></span>
            <span>Admissions Open '26-27</span>
          </div>
          <button class="rvlh-fab-btn" id="rvlh-fab-toggle" aria-label="Open RVLH Chatbot">
            <svg viewBox="0 0 24 24" id="rvlh-fab-icon">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <circle cx="8" cy="9" r="1.5"/>
              <circle cx="12" cy="9" r="1.5"/>
              <circle cx="16" cy="9" r="1.5"/>
            </svg>
          </button>
        </div>

        <!-- Chat Window Window -->
        <div class="rvlh-chat-window" id="rvlh-chat-window">
          <!-- Header -->
          <div class="rvlh-chat-header">
            <div class="rvlh-header-info">
              <div class="rvlh-header-avatar">
                <span class="rvlh-avatar-text">RV</span>
                <span class="rvlh-avatar-pulse"></span>
              </div>
              <div class="rvlh-header-text">
                <div class="rvlh-title-row">
                  <h3>RV Learning Hub</h3>
                  <span class="rvlh-verified-badge" title="RSST Official Institution">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#3b82f6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </span>
                </div>
                <div class="rvlh-header-status">
                  <span class="rvlh-status-dot"></span>
                  <span>Admissions & Counseling AI • RSST</span>
                </div>
              </div>
            </div>
            <div class="rvlh-header-actions">
              <!-- Widescreen Expand Toggle -->
              <button class="rvlh-icon-btn" id="rvlh-expand-btn" title="Expand to widescreen" aria-label="Toggle Widescreen">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" id="rvlh-expand-icon">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>
              <!-- Reset Chat -->
              <button class="rvlh-icon-btn" id="rvlh-reset-btn" title="Restart conversation" aria-label="Restart Conversation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
              <!-- Close Chat -->
              <button class="rvlh-icon-btn" id="rvlh-close-btn" title="Close chat" aria-label="Close Chat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Category Quick Filter Toolbar with Arrow Controls -->
          <div class="rvlh-category-nav-wrapper">
            <button class="rvlh-cat-scroll-btn prev" id="rvlh-cat-prev" title="Scroll left" aria-label="Scroll Categories Left">‹</button>
            <div class="rvlh-category-nav" id="rvlh-category-nav">
              <button class="rvlh-nav-tab active" data-filter="all">🌟 Overview</button>
              <button class="rvlh-nav-tab" data-filter="events">📅 Events</button>
              <button class="rvlh-nav-tab" data-filter="campuses">🏫 Campuses</button>
              <button class="rvlh-nav-tab" data-filter="science">🚀 JEE & NEET</button>
              <button class="rvlh-nav-tab" data-filter="commerce">📊 Commerce</button>
              <button class="rvlh-nav-tab" data-filter="hostel">🏡 Hostels</button>
              <button class="rvlh-nav-tab" data-filter="scholarship">💰 Scholarships</button>
              <button class="rvlh-nav-tab" data-filter="schedule">⏱️ Timetable</button>
            </div>
            <button class="rvlh-cat-scroll-btn next" id="rvlh-cat-next" title="Scroll right" aria-label="Scroll Categories Right">›</button>
          </div>

          <!-- Active Campus Context Bar (Dynamic) -->
          <div class="rvlh-context-bar" id="rvlh-context-bar" style="display:none;">
            <div class="rvlh-context-text">Exploring Campus: <span id="rvlh-active-campus-label">-</span></div>
            <button class="rvlh-context-clear" id="rvlh-clear-campus">Switch Campus ✕</button>
          </div>

          <!-- Messages Area -->
          <div class="rvlh-messages-area" id="rvlh-messages-area"></div>

          <!-- Footer Input -->
          <div class="rvlh-chat-footer">
            <form id="rvlh-chat-form">
              <div class="rvlh-input-container">
                <input 
                  type="text" 
                  class="rvlh-input-field" 
                  id="rvlh-input-field" 
                  placeholder="Ask about 8 campuses, JEE/NEET, Harohalli, fees..." 
                  autocomplete="off"
                />
                <!-- Voice Mic Button -->
                <button type="button" class="rvlh-mic-btn" id="rvlh-mic-btn" title="Speak to ask question" aria-label="Voice Input">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
                <!-- Send Button -->
                <button type="submit" class="rvlh-send-btn" id="rvlh-send-btn" aria-label="Send message">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
            <div class="rvlh-quick-contact-bar">
              <a href="tel:08026632000" class="rvlh-quick-link" title="Call Admissions Desk">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.12z"/></svg>
                <span>080-2663 2000</span>
              </a>
              <span class="rvlh-footer-dot">•</span>
              <a href="https://wa.me/918317346585?text=Hi%20RVLH%20Admissions%2C%20I%20have%20an%20inquiry%20regarding%20integrated%20PU%20coaching" target="_blank" class="rvlh-quick-link" title="Chat on WhatsApp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                <span>WhatsApp Desk</span>
              </a>
              <span class="rvlh-footer-dot">•</span>
              <a href="https://admissions.rvlearninghub.com" target="_blank" class="rvlh-quick-link" title="Apply Online">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>Apply Online</span>
              </a>
            </div>
          </div>
        </div>
      `;

      this.messagesEl = document.getElementById('rvlh-messages-area');
      this.inputEl = document.getElementById('rvlh-input-field');
      this.contextBarEl = document.getElementById('rvlh-context-bar');
    }

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN';

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (this.inputEl) {
            this.inputEl.value = transcript;
            document.getElementById('rvlh-chat-form').dispatchEvent(new Event('submit'));
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          const micBtn = document.getElementById('rvlh-mic-btn');
          if (micBtn) micBtn.classList.remove('listening');
        };

        this.recognition.onerror = () => {
          this.isListening = false;
          const micBtn = document.getElementById('rvlh-mic-btn');
          if (micBtn) micBtn.classList.remove('listening');
        };
      }
    }

    bindEvents() {
      const toggleBtn = document.getElementById('rvlh-fab-toggle');
      const badge = document.getElementById('rvlh-fab-badge');
      const closeBtn = document.getElementById('rvlh-close-btn');
      const resetBtn = document.getElementById('rvlh-reset-btn');
      const expandBtn = document.getElementById('rvlh-expand-btn');
      const chatForm = document.getElementById('rvlh-chat-form');
      const clearCampusBtn = document.getElementById('rvlh-clear-campus');
      const micBtn = document.getElementById('rvlh-mic-btn');

      toggleBtn.addEventListener('click', () => this.toggleChat());
      badge.addEventListener('click', () => this.toggleChat(true));
      closeBtn.addEventListener('click', () => this.toggleChat(false));
      
      expandBtn.addEventListener('click', () => this.toggleExpand());

      resetBtn.addEventListener('click', () => {
        this.messagesEl.innerHTML = '';
        const payload = this.engine.handleAction('reset_context');
        this.updateContextBar();
        this.appendBotPayload(payload);
      });

      clearCampusBtn.addEventListener('click', () => {
        const payload = this.engine.handleAction('reset_context');
        this.updateContextBar();
        this.appendBotPayload(payload);
      });

      // Quick Category Toolbar
      const tabs = document.querySelectorAll('.rvlh-nav-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const filter = tab.getAttribute('data-filter');
          this.handleCategoryClick(filter);
        });
      });

      // Category Nav Scroll Controls
      const catPrev = document.getElementById('rvlh-cat-prev');
      const catNext = document.getElementById('rvlh-cat-next');
      const categoryNav = document.getElementById('rvlh-category-nav');
      if (categoryNav) {
        if (catPrev) {
          catPrev.addEventListener('click', () => {
            categoryNav.scrollBy({ left: -140, behavior: 'smooth' });
          });
        }
        if (catNext) {
          catNext.addEventListener('click', () => {
            categoryNav.scrollBy({ left: 140, behavior: 'smooth' });
          });
        }
        categoryNav.addEventListener('wheel', (e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            categoryNav.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }

      // Voice Mic Button
      micBtn.addEventListener('click', () => {
        if (!this.recognition) {
          alert('Speech recognition is not supported in this browser. Please type your message.');
          return;
        }
        if (this.isListening) {
          this.recognition.stop();
        } else {
          this.isListening = true;
          micBtn.classList.add('listening');
          this.recognition.start();
        }
      });

      // Chat Form Submit
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = this.inputEl.value.trim();
        if (!text) return;

        this.appendUserMessage(text);
        this.inputEl.value = '';

        // Show typing indicator with Brain pulse
        this.showTypingIndicator('🧠 RVLH Brain is analyzing...');
        try {
          const response = await this.engine.handleUserQuery(text);
          this.removeTypingIndicator();
          this.updateContextBar();
          this.appendBotPayload(response);
        } catch (err) {
          this.removeTypingIndicator();
          this.appendBotPayload({
            type: 'bot',
            text: 'I encountered an issue connecting to the admissions server. Please try again or call our helpline at **080-2663 2000**.'
          });
        }
      });
    }

    toggleChat(forceState = null) {
      this.isOpen = forceState !== null ? forceState : !this.isOpen;
      const windowEl = document.getElementById('rvlh-chat-window');
      const iconEl = document.getElementById('rvlh-fab-icon');
      const badgeEl = document.getElementById('rvlh-fab-badge');

      if (this.isOpen) {
        document.body.classList.add('rvlh-chat-open');
        windowEl.classList.add('open');
        if (badgeEl) badgeEl.style.display = 'none';
        iconEl.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
        setTimeout(() => this.inputEl && this.inputEl.focus(), 300);
        if (this.telemetry) this.telemetry.logEvent({ eventType: 'chat_opened' });
      } else {
        document.body.classList.remove('rvlh-chat-open');
        windowEl.classList.remove('open');
        if (badgeEl) badgeEl.style.display = 'flex';
        iconEl.innerHTML = '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/><circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="9" r="1.5"/><circle cx="16" cy="9" r="1.5"/>';
      }
    }

    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      const windowEl = document.getElementById('rvlh-chat-window');
      const iconEl = document.getElementById('rvlh-expand-icon');

      if (this.isExpanded) {
        windowEl.classList.add('expanded');
        iconEl.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>';
      } else {
        windowEl.classList.remove('expanded');
        iconEl.innerHTML = '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>';
      }
    }

    handleCategoryClick(category) {
      this.showTypingIndicator('Fetching information...');
      setTimeout(async () => {
        this.removeTypingIndicator();
        let payload;
        switch (category) {
          case 'events':
            payload = this.engine.handleEventsInquiry();
            break;
          case 'campuses':
            payload = this.engine.handleAction('explore_campuses');
            break;
          case 'science':
            payload = this.engine.handleAction('select_course', { courseId: 'jee_adv' });
            break;
          case 'commerce':
            payload = this.engine.handleAction('select_course', { courseId: 'commerce' });
            break;
          case 'hostel':
            payload = this.engine.handleAction('ask_hostel');
            break;
          case 'scholarship':
            payload = this.engine.handleAction('ask_fees');
            break;
          case 'schedule':
            payload = await this.engine.handleUserQuery('tell me about daily schedule and timetable');
            break;
          default:
            payload = await this.engine.handleUserQuery('explain everything about RVLH');
            break;
        }
        this.updateContextBar();
        this.appendBotPayload(payload);
      }, 250);
    }

    displayInitialGreeting() {
      if (!this.engine) return;
      const greeting = this.engine.getWelcomePayload();
      this.updateContextBar();
      this.appendBotPayload(greeting, true);
    }

    updateContextBar() {
      if (!this.contextBarEl || !this.engine) return;
      if (this.engine.state.activeCampus) {
        this.contextBarEl.style.display = 'flex';
        document.getElementById('rvlh-active-campus-label').textContent = this.engine.state.activeCampus.shortName;
      } else {
        this.contextBarEl.style.display = 'none';
      }
    }

    appendUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'rvlh-msg-row user';
      row.innerHTML = `<div class="rvlh-bubble">${this.escapeHtml(text)}</div>`;
      this.messagesEl.appendChild(row);
      this.scrollToBottom();
    }

    appendBotPayload(payload, isInitial = false) {
      if (!payload) return;

      const row = document.createElement('div');
      row.className = 'rvlh-msg-row bot';

      // 1. Text Message with Rich Markdown Rendering
      if (payload.text) {
        const bubble = document.createElement('div');
        bubble.className = 'rvlh-bubble';
        bubble.innerHTML = this.renderRichMarkdown(payload.text);
        row.appendChild(bubble);
      }

      // 2. Campus Cards Carousel
      if (payload.cardsType === 'campus_list' && payload.cards) {
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'rvlh-carousel-wrapper';

        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'rvlh-cards-scroll';

        payload.cards.forEach(card => {
          const cardEl = document.createElement('div');
          cardEl.className = 'rvlh-campus-card';
          
          let badgeClass = 'rvlh-badge-blue';
          let badgeText = card.type || 'Day Scholar';
          if (card.hasHostel) {
            badgeClass = 'rvlh-badge-gold';
            badgeText = card.id === 'rv_harohalli' ? '🏡 50-Acre Residential' : '👩 Women\'s Hostel';
          }

          let tagsHtml = '';
          if (Array.isArray(card.streams)) {
            tagsHtml = card.streams.map(s => {
              const clean = s.includes('Science') ? 'Science' : s.includes('Commerce') ? 'Commerce' : s;
              return `<span class="rvlh-tag">${this.escapeHtml(clean)}</span>`;
            }).join('');
          } else if (card.streams) {
            tagsHtml = `<span class="rvlh-tag">${this.escapeHtml(card.streams)}</span>`;
          }

          cardEl.innerHTML = `
            <div class="rvlh-card-top">
              <span class="rvlh-badge ${badgeClass}">${this.escapeHtml(badgeText)}</span>
              <div class="rvlh-campus-card-title">${this.escapeHtml(card.title)}</div>
              <div class="rvlh-campus-card-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>${this.escapeHtml(card.location)}</span>
              </div>
            </div>
            <div class="rvlh-card-tags">
              ${tagsHtml}
            </div>
            <button class="rvlh-campus-btn" data-campus-id="${card.id}">
              <span>Explore Campus</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          `;
          cardEl.querySelector('.rvlh-campus-btn').addEventListener('click', () => {
            this.handleCardAction('select_campus', { campusId: card.id });
          });
          scrollContainer.appendChild(cardEl);
        });

        carouselWrapper.appendChild(scrollContainer);

        // Sleek carousel navigation controls
        const controls = document.createElement('div');
        controls.className = 'rvlh-carousel-controls';
        controls.innerHTML = `
          <button class="rvlh-carousel-arrow prev" title="Scroll left" aria-label="Previous Campuses">‹</button>
          <span class="rvlh-carousel-counter">${payload.cards.length} Campuses Available</span>
          <button class="rvlh-carousel-arrow next" title="Scroll right" aria-label="Next Campuses">›</button>
        `;
        controls.querySelector('.prev').addEventListener('click', () => {
          scrollContainer.scrollBy({ left: -250, behavior: 'smooth' });
        });
        controls.querySelector('.next').addEventListener('click', () => {
          scrollContainer.scrollBy({ left: 250, behavior: 'smooth' });
        });
        carouselWrapper.appendChild(controls);

        row.appendChild(carouselWrapper);
      }

      // 3. Course Cards Carousel
      if (payload.cardsType === 'course_list' && payload.cards) {
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'rvlh-carousel-wrapper';

        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'rvlh-cards-scroll';

        payload.cards.forEach(card => {
          const cardEl = document.createElement('div');
          cardEl.className = 'rvlh-campus-card';
          
          const isScience = (card.category || '').includes('Science');
          const badgeClass = isScience ? 'rvlh-badge-blue' : 'rvlh-badge-gold';
          const examsText = Array.isArray(card.targetExams) ? card.targetExams.slice(0, 3).join(', ') : (card.targetExams || '');

          cardEl.innerHTML = `
            <div class="rvlh-card-top">
              <span class="rvlh-badge ${badgeClass}">${this.escapeHtml(card.category || 'Integrated Track')}</span>
              <div class="rvlh-campus-card-title">${this.escapeHtml(card.title)}</div>
              <div class="rvlh-campus-card-loc">
                <span>⏱️ ${this.escapeHtml(card.duration || '2-Year Integrated')}</span>
              </div>
            </div>
            <div class="rvlh-card-desc">
              <strong>Target Exams:</strong> ${this.escapeHtml(examsText)}
            </div>
            <button class="rvlh-campus-btn" data-course-id="${card.id}">
              <span>View Curriculum</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          `;
          cardEl.querySelector('.rvlh-campus-btn').addEventListener('click', () => {
            this.handleCardAction('select_course', { courseId: card.id });
          });
          scrollContainer.appendChild(cardEl);
        });

        carouselWrapper.appendChild(scrollContainer);

        // Sleek carousel navigation controls
        const controls = document.createElement('div');
        controls.className = 'rvlh-carousel-controls';
        controls.innerHTML = `
          <button class="rvlh-carousel-arrow prev" title="Scroll left" aria-label="Previous Courses">‹</button>
          <span class="rvlh-carousel-counter">${payload.cards.length} Coaching Programs</span>
          <button class="rvlh-carousel-arrow next" title="Scroll right" aria-label="Next Courses">›</button>
        `;
        controls.querySelector('.prev').addEventListener('click', () => {
          scrollContainer.scrollBy({ left: -250, behavior: 'smooth' });
        });
        controls.querySelector('.next').addEventListener('click', () => {
          scrollContainer.scrollBy({ left: 250, behavior: 'smooth' });
        });
        carouselWrapper.appendChild(controls);

        row.appendChild(carouselWrapper);
      }

      // 4. In-Chat Lead Capture Form
      if (payload.formType === 'lead_form' && payload.formData) {
        const formEl = document.createElement('div');
        formEl.className = 'rvlh-inchat-form';
        const d = payload.formData;

        formEl.innerHTML = `
          <div class="rvlh-form-header">
            <span>📝 Academic Counselor Callback</span>
          </div>
          <form id="rvlh-lead-capture-form">
            <div class="rvlh-form-group">
              <label class="rvlh-form-label">Student / Parent Name *</label>
              <input type="text" class="rvlh-form-input" name="name" placeholder="Full Name" required />
            </div>
            <div class="rvlh-form-group">
              <label class="rvlh-form-label">Mobile Number *</label>
              <input type="tel" class="rvlh-form-input" name="phone" placeholder="10-digit Mobile Number" required pattern="[0-9]{10}" />
            </div>
            <div class="rvlh-form-group">
              <label class="rvlh-form-label">Current Grade / Board</label>
              <select class="rvlh-form-select" name="grade">
                <option value="10th (SSLC / CBSE / ICSE)">10th Grade (Entering PU-I)</option>
                <option value="11th / PU-I">11th Grade (Entering PU-II)</option>
                <option value="12th / PU-II (Crash/Revision)">12th Grade (ReVise CET / NEET)</option>
              </select>
            </div>
            <div class="rvlh-form-group">
              <label class="rvlh-form-label">Preferred Campus</label>
              <select class="rvlh-form-select" name="campusId">
                <option value="">-- Select Preferred Campus --</option>
                ${d.campusOptions.map(c => `<option value="${c.id}" ${d.preferredCampus.includes(c.name) ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="rvlh-form-group">
              <label class="rvlh-form-label">Target Course / Stream</label>
              <select class="rvlh-form-select" name="courseId">
                <option value="">-- Select Program --</option>
                ${d.courseOptions.map(co => `<option value="${co.id}">${co.title}</option>`).join('')}
              </select>
            </div>
            <button type="submit" class="rvlh-form-submit-btn">Request Counselor Callback</button>
          </form>
        `;

        formEl.querySelector('#rvlh-lead-capture-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const form = e.target;
          const btn = form.querySelector('.rvlh-form-submit-btn');
          btn.textContent = 'Submitting...';
          btn.disabled = true;

          const campusSelect = form.elements['campusId'];
          const courseSelect = form.elements['courseId'];

          const formData = {
            name: form.elements['name'].value,
            phone: form.elements['phone'].value,
            grade: form.elements['grade'].value,
            campusId: campusSelect.value,
            campusName: campusSelect.options[campusSelect.selectedIndex]?.text || '',
            courseId: courseSelect.value,
            courseTitle: courseSelect.options[courseSelect.selectedIndex]?.text || ''
          };

          const result = await this.engine.submitLead(formData);
          formEl.remove();

          if (result.success) {
            this.appendBotPayload(result.botResponse);
          } else {
            this.appendBotPayload({ type: 'bot', text: `⚠️ ${result.error}` });
          }
        });

        row.appendChild(formEl);
      }

      // 5. Smart Chips
      if (payload.quickChips && payload.quickChips.length > 0) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'rvlh-chips-container';

        payload.quickChips.forEach(chip => {
          const btn = document.createElement('button');
          btn.className = 'rvlh-chip';
          btn.setAttribute('data-action', chip.action || '');

          // Add accent class for important actions
          if (chip.action && (chip.action.includes('lead') || chip.action.includes('fees') || chip.action.includes('hostel') || chip.action.includes('scholarship'))) {
            btn.classList.add('rvlh-chip-gold');
          }

          btn.textContent = chip.label;
          btn.addEventListener('click', async () => {
            this.appendUserMessage(chip.label);
            this.showTypingIndicator('Analyzing...');
            try {
              let res;
              if (chip.action && this.engine[chip.action]) {
                res = await this.engine[chip.action](chip.payload || {});
              } else {
                res = await this.engine.handleAction(chip.action, chip.payload || {});
              }
              this.removeTypingIndicator();
              this.updateContextBar();
              this.appendBotPayload(res);
            } catch (err) {
              this.removeTypingIndicator();
            }
          });
          chipsContainer.appendChild(btn);
        });

        row.appendChild(chipsContainer);
      }

      this.messagesEl.appendChild(row);
      if (isInitial) {
        this.messagesEl.scrollTop = 0;
      } else {
        this.scrollToMessage(row);
      }
    }

    scrollToMessage(row) {
      if (!row || !this.messagesEl) return;
      setTimeout(() => {
        const topPos = row.offsetTop - 12;
        this.messagesEl.scrollTo({
          top: Math.max(0, topPos),
          behavior: 'smooth'
        });
      }, 60);
    }

    handleCardAction(action, payload) {
      this.showTypingIndicator();
      setTimeout(async () => {
        this.removeTypingIndicator();
        const res = await this.engine.handleAction(action, payload);
        this.updateContextBar();
        this.appendBotPayload(res);
      }, 300);
    }

    showTypingIndicator(label = null) {
      this.removeTypingIndicator();
      const indicator = document.createElement('div');
      indicator.id = 'rvlh-typing';
      indicator.className = 'rvlh-msg-row bot';
      const labelHtml = label ? `<span style="font-size:12px; color:#93c5fd; font-weight:700; margin-right:10px;">${this.escapeHtml(label)}</span>` : '';
      indicator.innerHTML = `
        <div class="rvlh-typing-indicator" style="display:inline-flex; align-items:center;">
          ${labelHtml}
          <div class="rvlh-typing-dot"></div>
          <div class="rvlh-typing-dot"></div>
          <div class="rvlh-typing-dot"></div>
        </div>
      `;
      this.messagesEl.appendChild(indicator);
      this.scrollToBottom();
    }

    removeTypingIndicator() {
      const el = document.getElementById('rvlh-typing');
      if (el) el.remove();
    }

    renderRichMarkdown(text) {
      if (!text) return '';
      let raw = text;

      // Handle custom Alert Boxes
      raw = raw.replace(/> \[!(NOTE|TIP|IMPORTANT|WARNING|SCHOLARSHIP)\]\s*([\s\S]*?)(?=(\n\n|$))/g, (match, type, content) => {
        return `<div class="rvlh-alert-box"><strong>${type}:</strong> ${content.trim()}</div>`;
      });

      // Escape basic HTML
      let html = this.escapeHtml(raw);

      // Restore custom alert box tags
      html = html.replace(/&lt;div class=&quot;rvlh-alert-box&quot;&gt;([\s\S]*?)&lt;\/div&gt;/g, '<div class="rvlh-alert-box">$1</div>');
      html = html.replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong>$1</strong>');

      // Headings
      html = html.replace(/^### (.*?)$/gm, '<h4 style="font-size:15px; font-weight:700; color:#f59e0b; margin:12px 0 6px 0;">$1</h4>');
      html = html.replace(/^## (.*?)$/gm, '<h3 style="font-size:16px; font-weight:800; color:#fff; margin:14px 0 8px 0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">$1</h3>');

      // Bold & Italic
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Links
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, href) => {
        const isExternal = href.startsWith('http://') || href.startsWith('https://');
        const target = isExternal ? '_blank' : '_self';
        return `<a href="${href}" target="${target}" style="color:#60a5fa; font-weight:600; text-decoration:underline;">${linkText}</a>`;
      });

      // Bullet lists
      html = html.replace(/^(?:•|-)\s+(.*)$/gm, '<li>$1</li>');
      html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="rvlh-markdown-list">$1</ul>');
      // Clean up adjacent ULs
      html = html.replace(/<\/ul>\s*<ul class="rvlh-markdown-list">/g, '');

      // Numbered lists
      html = html.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');

      // Linebreaks - clean paragraph separation
      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/\n/g, '<br/>');

      return `<p>${html}</p>`;
    }

    escapeHtml(string) {
      const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return String(string).replace(/[&<>"']/g, (s) => entityMap[s]);
    }

    scrollToBottom() {
      if (this.messagesEl) {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      }
    }
  }

  // Self-mount on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.RVLHWidgetInstance = new RVLHWidget();
    });
  } else {
    window.RVLHWidgetInstance = new RVLHWidget();
  }
})();
