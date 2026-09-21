/**
 * RVLH Dual-Write Telemetry Client
 * Synchronizes interaction events, campus clicks, queries, and leads to both:
 * 1. WordPress REST API (Local MySQL database)
 * 2. Vercel Node.js Backend (MongoDB Atlas multi-tenant store)
 * 
 * Adheres strictly to chatbot_architecture key normalization guidelines:
 * - Maps `createdAt` / `leadData` <-> `timestamp` / `data`
 */

class RVLHTelemetry {
  constructor(config = {}) {
    this.wpRestUrl = config.wpRestUrl || (window.RVLH_CONFIG && window.RVLH_CONFIG.wpRestUrl) || '/wp-json/rvlh-chatbot/v1';
    this.vercelUrl = config.vercelUrl || (window.RVLH_CONFIG && window.RVLH_CONFIG.vercelUrl) || '';
    this.instituteId = config.instituteId || 'rvlh';
    this.apiKey = config.apiKey || (window.RVLH_CONFIG && window.RVLH_CONFIG.apiKey) || 'rvlh_key_12345';
    
    this.queue = [];
    this.batchInterval = 5000; // Flush every 5 seconds
    this.timer = null;

    this.init();
  }

  init() {
    // Start periodic flusher
    this.timer = setInterval(() => this.flush(), this.batchInterval);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
    }
  }

  /**
   * Log interaction event (clicks, intent choices, queries)
   */
  logEvent(eventObj) {
    const normalized = {
      instituteId: eventObj.instituteId || this.instituteId,
      sessionId: eventObj.sessionId || 'sess_anonymous',
      eventType: eventObj.eventType || 'interaction',
      interactionId: eventObj.interactionId || '',
      queryText: eventObj.queryText || '',
      metaData: eventObj.metaData || {},
      timestamp: new Date().toISOString(),
      // Normalized key for Mongoose schemas
      createdAt: new Date().toISOString()
    };

    this.queue.push(normalized);
  }

  /**
   * Send high-priority lead submission immediately to both backends
   */
  async sendLead(leadPayload) {
    const timestamp = new Date().toISOString();

    // Normalized payload adhering to both schemas
    const dualPayload = {
      instituteId: leadPayload.instituteId || this.instituteId,
      sessionId: leadPayload.sessionId,
      eventType: 'form_submit',
      
      // Node / MongoDB format
      leadData: leadPayload.leadData,
      createdAt: timestamp,

      // WordPress MySQL format
      data: leadPayload.leadData,
      timestamp: timestamp,

      sourceUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    console.log('[RVLH Telemetry] Ingesting lead:', dualPayload);

    // 1. Post to WordPress REST API
    const wpPromise = this.postToEndpoint(
      `${this.wpRestUrl.replace(/\/$/, '')}/leads`,
      dualPayload
    ).catch(err => console.warn('[RVLH Telemetry] WP lead ingest failed:', err));

    // 2. Post to Vercel Node.js / MongoDB Backend (if configured)
    let vercelPromise = Promise.resolve();
    if (this.vercelUrl) {
      const cleanVercelUrl = this.vercelUrl.replace(/\/$/, '');
      vercelPromise = this.postToEndpoint(
        `${cleanVercelUrl}/api/telemetry`,
        dualPayload,
        { 'x-api-key': this.apiKey }
      ).catch(err => console.warn('[RVLH Telemetry] Vercel lead ingest failed:', err));
    }

    return Promise.allSettled([wpPromise, vercelPromise]);
  }

  /**
   * Flush queued interaction events
   */
  async flush(isImmediate = false) {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    const payload = {
      instituteId: this.instituteId,
      events: eventsToSend
    };

    // Use sendBeacon if unloading and available
    if (isImmediate && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${this.wpRestUrl.replace(/\/$/, '')}/telemetry`, blob);
        if (this.vercelUrl) {
          navigator.sendBeacon(`${this.vercelUrl.replace(/\/$/, '')}/api/telemetry`, blob);
        }
        return;
      } catch (e) {
        // Fallback to fetch
      }
    }

    // Normal async batch dispatch
    // 1. WordPress REST API
    this.postToEndpoint(
      `${this.wpRestUrl.replace(/\/$/, '')}/telemetry`,
      payload
    ).catch(err => {
      // Re-queue on failure if not unloading
      if (!isImmediate) {
        this.queue.unshift(...eventsToSend);
      }
    });

    // 2. Vercel Backend
    if (this.vercelUrl) {
      this.postToEndpoint(
        `${this.vercelUrl.replace(/\/$/, '')}/api/telemetry`,
        payload,
        { 'x-api-key': this.apiKey }
      ).catch(err => {});
    }
  }

  async postToEndpoint(url, data, customHeaders = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      throw err;
    }
  }
}

// Export for module/script tag
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RVLHTelemetry;
} else if (typeof window !== 'undefined') {
  window.RVLHTelemetry = RVLHTelemetry;
}
