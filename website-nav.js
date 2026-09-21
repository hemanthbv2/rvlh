/**
 * RVLH Website Navigation & Helper Script
 * Handles mobile navigation drawer, active state highlighting,
 * and universal chatbot integration triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById('site-mobile-toggle');
  const mobileDrawer = document.getElementById('site-mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      mobileToggle.innerHTML = isOpen
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    // Close on link click
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        if (mobileToggle) {
          mobileToggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        }
      });
    });
  }

  // 2. Active Link Highlighting
  let currentPath = window.location.pathname.replace(/^\//, '').split('.')[0];
  if (!currentPath || currentPath === '' || currentPath === '/') currentPath = 'index';
  document.querySelectorAll('.site-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const targetPath = href.replace(/^\//, '').split('.')[0] || 'index';
    if (targetPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Universal Chatbot Opener for any campus
window.openChatWithCampus = function(campusId) {
  const fabBtn = document.getElementById('rvlh-fab-toggle');
  const chatWindow = document.getElementById('rvlh-chat-window');

  if (fabBtn && chatWindow) {
    if (!chatWindow.classList.contains('open')) {
      fabBtn.click();
    }
    setTimeout(() => {
      if (window.RVLHWidgetInstance && window.RVLHWidgetInstance.engine) {
        const payload = window.RVLHWidgetInstance.engine.handleAction('select_campus', { campusId });
        window.RVLHWidgetInstance.updateContextBar();
        window.RVLHWidgetInstance.appendBotPayload(payload);
      } else {
        const input = document.getElementById('rvlh-input-field');
        const form = document.getElementById('rvlh-chat-form');
        if (input && form) {
          input.value = campusId;
          form.dispatchEvent(new Event('submit'));
        }
      }
    }, 350);
  }
};

// Universal Chatbot Opener for courses
window.openChatWithCourse = function(courseId) {
  const fabBtn = document.getElementById('rvlh-fab-toggle');
  const chatWindow = document.getElementById('rvlh-chat-window');

  if (fabBtn && chatWindow) {
    if (!chatWindow.classList.contains('open')) {
      fabBtn.click();
    }
    setTimeout(() => {
      if (window.RVLHWidgetInstance && window.RVLHWidgetInstance.engine) {
        const payload = window.RVLHWidgetInstance.engine.handleAction('select_course', { courseId });
        window.RVLHWidgetInstance.updateContextBar();
        window.RVLHWidgetInstance.appendBotPayload(payload);
      } else {
        const input = document.getElementById('rvlh-input-field');
        const form = document.getElementById('rvlh-chat-form');
        if (input && form) {
          input.value = courseId;
          form.dispatchEvent(new Event('submit'));
        }
      }
    }, 350);
  }
};

// Universal Chatbot Trigger with Custom Prompt
window.testBrainPrompt = function(promptText) {
  const fabBtn = document.getElementById('rvlh-fab-toggle');
  const chatWindow = document.getElementById('rvlh-chat-window');

  if (fabBtn && chatWindow) {
    if (!chatWindow.classList.contains('open')) {
      fabBtn.click();
    }
    setTimeout(() => {
      const input = document.getElementById('rvlh-input-field');
      const form = document.getElementById('rvlh-chat-form');
      if (input && form) {
        input.value = promptText;
        form.dispatchEvent(new Event('submit'));
      }
    }, 350);
  }
};
