import streamlit as st
import plotly.express as px
import pandas as pd
from backend.database import DatabaseManager
from backend.alert_manager import get_alert_manager, DEFAULT_THRESHOLDS, SEVERITY_COLORS


def show_alerts_page():
    """Full-featured Alerts & Notifications management page"""

    db = DatabaseManager()
    user_id = st.session_state.user_id

    st.markdown("<h1 class='main-header'>🔔 Alerts & Notifications</h1>", unsafe_allow_html=True)
    st.markdown(
        "<p style='color:#64748b;'>Monitor sentiment thresholds and receive automatic notifications when your brand health changes.</p>",
        unsafe_allow_html=True
    )

    # ── Tabs ──
    tab_inbox, tab_settings, tab_test = st.tabs(["📥 Alert Inbox", "⚙️ Thresholds", "🧪 Test Alert"])

    # ─────────────────────────────────────────────────────────────────────────
    with tab_inbox:
        unread_count = db.count_unread_alerts(user_id)
        col_title, col_action = st.columns([3, 1])
        with col_title:
            if unread_count > 0:
                st.markdown(f"### 📬 {unread_count} unread alert(s)")
            else:
                st.markdown("### 📭 All caught up!")
        with col_action:
            if st.button("✅ Mark All Read", use_container_width=True):
                db.mark_all_alerts_read(user_id)
                st.rerun()

        alerts = db.get_user_alerts(user_id, limit=50)

        if not alerts:
            st.info("No alerts yet. Run an analysis to start monitoring.")
        else:
            # Summary donut
            severity_counts = {}
            for a in alerts:
                sev = a.get('severity', 'info')
                severity_counts[sev] = severity_counts.get(sev, 0) + 1

            color_map = {'critical': '#EF4444', 'warning': '#F59E0B', 'info': '#3B82F6', 'success': '#10B981'}
            fig = px.pie(
                values=list(severity_counts.values()),
                names=list(severity_counts.keys()),
                color=list(severity_counts.keys()),
                color_discrete_map=color_map,
                title="Alert Distribution",
                hole=0.5
            )
            fig.update_traces(textinfo='percent+label')
            st.plotly_chart(fig, use_container_width=True, key="alerts_donut")

            st.divider()

            # Filter
            show_filter = st.selectbox("Filter by severity", ["All", "critical", "warning", "info", "success"])
            filtered = alerts if show_filter == "All" else [a for a in alerts if a.get('severity') == show_filter]

            for alert in filtered:
                sev   = alert.get('severity', 'info')
                icon  = SEVERITY_COLORS.get(sev, '⚪')
                is_unread = alert.get('status') == 'unread'
                bg_color  = {
                    'critical': '#FEF2F2',
                    'warning':  '#FFFBEB',
                    'info':     '#EFF6FF',
                    'success':  '#F0FDF4',
                }.get(sev, '#F8FAFC')
                border_color = color_map.get(sev, '#CBD5E1')

                col_msg, col_btn = st.columns([5, 1])
                with col_msg:
                    st.markdown(f"""
                    <div style='padding:12px 16px; background:{bg_color}; border-left:4px solid {border_color};
                                border-radius:6px; margin:6px 0; {"font-weight:600;" if is_unread else ""}'>
                        {icon} &nbsp;<strong>{alert.get('alert_type','').replace('_',' ').title()}</strong>
                        {"&nbsp;🆕" if is_unread else ""}<br>
                        <span style='color:#475569;font-size:13px;'>{alert.get('message','')}</span><br>
                        <span style='color:#94a3b8;font-size:11px;'>{alert.get('triggered_at','')[:19]}</span>
                    </div>
                    """, unsafe_allow_html=True)
                with col_btn:
                    if is_unread:
                        if st.button("Read", key=f"read_{alert['id']}"):
                            db.mark_alert_read(alert['id'])
                            st.rerun()

    # ─────────────────────────────────────────────────────────────────────────
    with tab_settings:
        st.subheader("⚙️ Alert Thresholds")
        st.markdown(
            "<p style='color:#64748b;font-size:13px;'>Customize when alerts are triggered. Changes apply to future analyses.</p>",
            unsafe_allow_html=True
        )

        col1, col2 = st.columns(2)
        with col1:
            neg_critical = st.slider(
                "🔴 Critical: Negative % threshold",
                min_value=20, max_value=90,
                value=int(DEFAULT_THRESHOLDS['negative_pct_critical']),
                step=5,
                help="Trigger a CRITICAL alert when negative reviews exceed this percentage."
            )
            neg_warning = st.slider(
                "🟡 Warning: Negative % threshold",
                min_value=10, max_value=80,
                value=int(DEFAULT_THRESHOLDS['negative_pct_warning']),
                step=5,
                help="Trigger a WARNING alert when negative reviews exceed this percentage."
            )
            neutral_low = st.slider(
                "⚡ Polarisation: Neutral % minimum",
                min_value=5, max_value=50,
                value=int(DEFAULT_THRESHOLDS['neutral_pct_low']),
                step=5,
                help="Alert when neutral sentiment drops below this (high polarisation)."
            )

        with col2:
            fake_warn = st.slider(
                "🚨 Fake Review: suspicious % threshold",
                min_value=5, max_value=50,
                value=int(DEFAULT_THRESHOLDS['fake_pct_warning']),
                step=5,
                help="Alert when suspicious review percentage exceeds this."
            )
            conf_low = st.slider(
                "📉 Confidence: minimum confidence %",
                min_value=30, max_value=80,
                value=int(DEFAULT_THRESHOLDS['confidence_low']),
                step=5,
                help="Alert when average model confidence falls below this."
            )

        st.divider()
        st.subheader("📧 Notification Channels")

        smtp_email = st.text_input(
            "Email to receive critical alerts",
            placeholder="alerts@yourcompany.com",
            help="Set SMTP_EMAIL and SMTP_PASSWORD environment variables to enable."
        )
        slack_url = st.text_input(
            "Slack Webhook URL",
            placeholder="https://hooks.slack.com/services/...",
            type="password",
            help="Set SLACK_WEBHOOK_URL environment variable to enable."
        )

        if st.button("💾 Save Settings", type="primary"):
            st.session_state['alert_thresholds'] = {
                'negative_pct_critical': neg_critical,
                'negative_pct_warning':  neg_warning,
                'neutral_pct_low':       neutral_low,
                'fake_pct_warning':      fake_warn,
                'confidence_low':        conf_low,
            }
            if smtp_email:
                st.session_state['alert_email'] = smtp_email
            if slack_url:
                st.session_state['alert_slack'] = slack_url
            st.success("✅ Alert settings saved for this session!")

    # ─────────────────────────────────────────────────────────────────────────
    with tab_test:
        st.subheader("🧪 Test Alert Rules")
        st.markdown(
            "<p style='color:#64748b;font-size:13px;'>Simulate an analysis result to preview which alerts would be triggered.</p>",
            unsafe_allow_html=True
        )

        t_col1, t_col2 = st.columns(2)
        with t_col1:
            t_total   = st.number_input("Total reviews", min_value=1, value=100, step=10)
            t_pos     = st.number_input("Positive count",  min_value=0, value=30, step=5)
            t_neg     = st.number_input("Negative count",  min_value=0, value=65, step=5)
        with t_col2:
            t_neu     = st.number_input("Neutral count",   min_value=0, value=5,  step=5)
            t_conf    = st.number_input("Avg confidence %", min_value=0.0, value=72.0, step=5.0)
            t_fake    = st.number_input("Suspicious reviews", min_value=0, value=8, step=1)

        if st.button("▶️ Run Simulation", type="primary"):
            thresholds = st.session_state.get('alert_thresholds', DEFAULT_THRESHOLDS)
            mgr = get_alert_manager(thresholds)
            sim_summary = {
                'total_entries':  t_total,
                'positive_count': t_pos,
                'negative_count': t_neg,
                'neutral_count':  t_neu,
                'avg_confidence': t_conf,
                'fake_reviews':   t_fake,
            }
            sim_alerts = mgr.evaluate_analysis(
                user_id=user_id,
                analysis_id=0,
                analysis_name="Simulation",
                summary=sim_summary
            )

            if sim_alerts:
                st.warning(f"**{len(sim_alerts)} alert(s) would be triggered:**")
                for a in sim_alerts:
                    icon = SEVERITY_COLORS.get(a['severity'], '⚪')
                    st.markdown(f"- {icon} `{a['alert_type']}` — {a['message']}")
            else:
                st.success("✅ No alerts would be triggered with these values.")
