<?php
/**
 * Plugin Name: RVLH Multi-Institute Chatbot
 * Plugin URI:  https://rvlearninghub.com
 * Description: Intelligent multi-campus admissions assistant and dual-write lead engine for RV Learning Hub. Supports all 8 PU College campuses, course discovery, hostel disambiguation, and synchronized telemetry with Node.js/MongoDB Atlas dashboard.
 * Version:     1.0.0
 * Author:      RV Educational Institutions (RSST)
 * Author URI:  https://rvei.edu.in
 * License:     GPL-2.0+
 * Text Domain: rvlh-chatbot
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class RVLH_Chatbot_Plugin {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Activation & Table Setup
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Asset Enqueueing
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));

        // Admin Settings Menu
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));

        // REST API Routes
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    /**
     * Create local MySQL tables on activation for local lead backup & audit trail
     */
    public function activate_plugin() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $leads_table = $wpdb->prefix . 'rvlh_leads';
        $events_table = $wpdb->prefix . 'rvlh_events';

        $sql_leads = "CREATE TABLE IF NOT EXISTS $leads_table (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            session_id VARCHAR(100) NOT NULL,
            institute_id VARCHAR(50) NOT NULL DEFAULT 'rvlh',
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(255) DEFAULT '',
            grade VARCHAR(100) DEFAULT '',
            campus_name VARCHAR(255) DEFAULT '',
            course_title VARCHAR(255) DEFAULT '',
            lead_data LONGTEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY institute_idx (institute_id),
            KEY session_idx (session_id)
        ) $charset_collate;";

        $sql_events = "CREATE TABLE IF NOT EXISTS $events_table (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            session_id VARCHAR(100) NOT NULL,
            institute_id VARCHAR(50) NOT NULL DEFAULT 'rvlh',
            event_type VARCHAR(100) NOT NULL,
            meta_data LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY institute_idx (institute_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_leads);
        dbDelta($sql_events);
    }

    /**
     * Enqueue CSS and JS assets on the frontend
     */
    public function enqueue_frontend_assets() {
        $plugin_url = plugin_dir_url(__FILE__);
        $version = '1.0.0';

        // 1. Enqueue Stylesheet
        wp_enqueue_style(
            'rvlh-chatbot-css',
            $plugin_url . 'rvlh-chatbot.css',
            array(),
            $version
        );

        // 2. Enqueue Knowledge Base
        wp_enqueue_script(
            'rvlh-kb-js',
            $plugin_url . 'rvlh-knowledge-base.js',
            array(),
            $version,
            true
        );

        // 3. Enqueue Telemetry Client
        wp_enqueue_script(
            'rvlh-telemetry-js',
            $plugin_url . 'telemetry.js',
            array(),
            $version,
            true
        );

        // 4. Enqueue Conversational Engine
        wp_enqueue_script(
            'rvlh-engine-js',
            $plugin_url . 'rvlh-engine.js',
            array('rvlh-kb-js', 'rvlh-telemetry-js'),
            $version,
            true
        );

        // 5. Enqueue UI Widget
        wp_enqueue_script(
            'rvlh-widget-js',
            $plugin_url . 'rvlh-chatbot.js',
            array('rvlh-engine-js'),
            $version,
            true
        );

        // Pass Settings to Frontend Window Object
        $vercel_url = get_option('rvlh_vercel_url', 'https://chatbot-dashboard.vercel.app');
        $api_key = get_option('rvlh_api_key', 'rvlh_key_12345');

        wp_localize_script('rvlh-widget-js', 'RVLH_CONFIG', array(
            'wpRestUrl' => esc_url_raw(rest_url('rvlh-chatbot/v1')),
            'vercelUrl' => esc_url_raw($vercel_url),
            'apiKey'    => sanitize_text_field($api_key),
            'instituteId' => 'rvlh'
        ));
    }

    /**
     * Admin Menu
     */
    public function register_admin_menu() {
        add_menu_page(
            'RVLH Chatbot Settings',
            'RVLH Chatbot',
            'manage_options',
            'rvlh-chatbot-settings',
            array($this, 'render_settings_page'),
            'dashicons-format-chat',
            25
        );
    }

    public function register_settings() {
        register_setting('rvlh_settings_group', 'rvlh_vercel_url');
        register_setting('rvlh_settings_group', 'rvlh_api_key');
        register_setting('rvlh_settings_group', 'rvlh_admin_email');
    }

    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>RVLH Multi-Institute Chatbot Settings</h1>
            <p>Configure the dual-write endpoint connecting to your Vercel/MongoDB Atlas Command Center.</p>
            <form method="post" action="options.php">
                <?php settings_fields('rvlh_settings_group'); ?>
                <?php do_settings_sections('rvlh_settings_group'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Vercel Node.js Backend URL</th>
                        <td>
                            <input type="url" name="rvlh_vercel_url" value="<?php echo esc_attr(get_option('rvlh_vercel_url', 'https://chatbot-dashboard.vercel.app')); ?>" class="regular-text" />
                            <p class="description">Enter without trailing slash (e.g. <code>https://your-domain.vercel.app</code>)</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Institute API Key</th>
                        <td>
                            <input type="text" name="rvlh_api_key" value="<?php echo esc_attr(get_option('rvlh_api_key', 'rvlh_key_12345')); ?>" class="regular-text" />
                            <p class="description">The master key validating telemetry requests against your MongoDB backend.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Admissions Email for Notifications</th>
                        <td>
                            <input type="email" name="rvlh_admin_email" value="<?php echo esc_attr(get_option('rvlh_admin_email', 'admissions.rvlh@rvei.edu.in')); ?>" class="regular-text" />
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    /**
     * Register REST API Endpoints for Local Telemetry & Leads
     */
    public function register_rest_routes() {
        register_rest_route('rvlh-chatbot/v1', '/telemetry', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_rest_telemetry'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('rvlh-chatbot/v1', '/leads', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_rest_lead_submit'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('rvlh-chatbot/v1', '/leads-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_rest_get_leads'),
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ));

        register_rest_route('rvlh-chatbot/v1', '/brain-query', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_rest_brain_query'),
            'permission_callback' => '__return_true'
        ));
    }

    public function handle_rest_brain_query($request) {
        $params = $request->get_json_params();
        $vercel_url = get_option('rvlh_vercel_url', '');

        // If a Vercel/Node backend is configured, forward to /api/brain
        if (!empty($vercel_url)) {
            $remote_url = trailingslashit($vercel_url) . 'api/brain';
            $response = wp_remote_post($remote_url, array(
                'headers' => array('Content-Type' => 'application/json'),
                'body'    => json_encode($params),
                'timeout' => 15
            ));

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                return rest_ensure_response(json_decode(wp_remote_retrieve_body($response), true));
            }
        }

        // Fallback counseling response if backend is offline
        return rest_ensure_response(array(
            'success' => true,
            'source' => 'wp_local_counselor',
            'message' => "Thank you for reaching out to **RV Learning Hub**!\n\nWhether you are preparing for **JEE, NEET, KCET, or Commerce (CA Foundation)**, we offer synchronized coaching across our 8 PU College campuses in Karnataka.\n\nPlease share your phone number or call **080-2663 2000** to speak directly with an academic counselor.",
            'suggestedQuickChips' => array(
                array('label' => '🏫 Explore 8 Campuses', 'action' => 'explore_campuses'),
                array('label' => '📚 View Courses', 'action' => 'explore_courses'),
                array('label' => '📝 Request Counselor Callback', 'action' => 'open_lead_form')
            )
        ));
    }

    public function handle_rest_telemetry($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $events = isset($params['events']) ? $params['events'] : array($params);
        $table = $wpdb->prefix . 'rvlh_events';

        foreach ($events as $e) {
            $wpdb->insert($table, array(
                'session_id'   => sanitize_text_field(isset($e['sessionId']) ? $e['sessionId'] : ''),
                'institute_id' => sanitize_text_field(isset($e['instituteId']) ? $e['instituteId'] : 'rvlh'),
                'event_type'   => sanitize_text_field(isset($e['eventType']) ? $e['eventType'] : 'interaction'),
                'meta_data'    => json_encode(isset($e['metaData']) ? $e['metaData'] : array()),
                'created_at'   => current_time('mysql')
            ));
        }

        return rest_ensure_response(array('success' => true, 'count' => count($events)));
    }

    public function handle_rest_lead_submit($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $lead_data = isset($params['leadData']) ? $params['leadData'] : (isset($params['data']) ? $params['data'] : array());

        $table = $wpdb->prefix . 'rvlh_leads';
        $wpdb->insert($table, array(
            'session_id'   => sanitize_text_field(isset($params['sessionId']) ? $params['sessionId'] : ''),
            'institute_id' => sanitize_text_field(isset($params['instituteId']) ? $params['instituteId'] : 'rvlh'),
            'name'         => sanitize_text_field(isset($lead_data['name']) ? $lead_data['name'] : ''),
            'phone'        => sanitize_text_field(isset($lead_data['phone']) ? $lead_data['phone'] : ''),
            'email'        => sanitize_email(isset($lead_data['email']) ? $lead_data['email'] : ''),
            'grade'        => sanitize_text_field(isset($lead_data['grade']) ? $lead_data['grade'] : ''),
            'campus_name'  => sanitize_text_field(isset($lead_data['campus']) ? $lead_data['campus'] : ''),
            'course_title' => sanitize_text_field(isset($lead_data['course']) ? $lead_data['course'] : ''),
            'lead_data'    => json_encode($lead_data),
            'created_at'   => current_time('mysql')
        ));

        // Optional: Send Instant Email Notification
        $admin_email = get_option('rvlh_admin_email', 'admissions.rvlh@rvei.edu.in');
        $subject = 'New RVLH Chatbot Inquiry: ' . sanitize_text_field(isset($lead_data['name']) ? $lead_data['name'] : '');
        $message = "A new student lead has been captured via RVLH Chatbot:\n\n" .
                   "Name: " . ($lead_data['name'] ?? '-') . "\n" .
                   "Phone: " . ($lead_data['phone'] ?? '-') . "\n" .
                   "Campus: " . ($lead_data['campus'] ?? '-') . "\n" .
                   "Course: " . ($lead_data['course'] ?? '-') . "\n" .
                   "Grade: " . ($lead_data['grade'] ?? '-') . "\n\n" .
                   "View leads in your RVLH Command Center Dashboard.";
        
        wp_mail($admin_email, $subject, $message);

        return rest_ensure_response(array('success' => true, 'id' => $wpdb->insert_id));
    }

    public function handle_rest_get_leads() {
        global $wpdb;
        $table = $wpdb->prefix . 'rvlh_leads';
        $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 100", ARRAY_A);

        $normalized = array_map(function($r) {
            return array(
                'id'          => $r['id'],
                'instituteId' => $r['institute_id'],
                'timestamp'   => $r['created_at'],
                'createdAt'   => $r['created_at'],
                'data'        => json_decode($r['lead_data'], true),
                'leadData'    => json_decode($r['lead_data'], true)
            );
        }, $rows);

        return rest_ensure_response($normalized);
    }
}

// Initialize Plugin
RVLH_Chatbot_Plugin::get_instance();
