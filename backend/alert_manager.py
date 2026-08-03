"""
Alert Manager for BrandPulse
Evaluates analysis results against configurable thresholds and raises alerts.
Supports: in-app (DB), optional email (SMTP), optional Slack (webhook).
"""
from typing import List, Dict, Optional
from datetime import datetime
import json
import os


# ── Thresholds ────────────────────────────────────────────────────────────────
DEFAULT_THRESHOLDS = {
    'negative_pct_critical': 60.0,   # % negative → critical alert
    'negative_pct_warning':  40.0,   # % negative → warning alert
    'neutral_pct_low':       20.0,   # % neutral below this → spike alert
    'fake_pct_warning':      10.0,   # % suspicious reviews → alert
    'confidence_low':        55.0,   # avg confidence below this → alert
}

SEVERITY_COLORS = {
    'critical': '🔴',
    'warning':  '🟡',
    'info':     '🔵',
    'success':  '🟢',
}


# ── Core AlertManager ─────────────────────────────────────────────────────────
class AlertManager:
    def __init__(self, thresholds: Optional[Dict] = None):
        self.thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

    # ── Rule evaluation ───────────────────────────────────────────

    def evaluate_analysis(
        self,
        user_id: int,
        analysis_id: int,
        analysis_name: str,
        summary: Dict
    ) -> List[Dict]:
        """
        Evaluate a completed analysis against all alert rules.

        Returns a list of alert dicts:
          { alert_type, severity, message, analysis_id }
        """
        alerts = []
        total = summary.get('total_entries', 0) or 1

        pos   = summary.get('positive_count', 0) or 0
        neg   = summary.get('negative_count', 0) or 0
        neu   = summary.get('neutral_count', 0)  or 0
        conf  = summary.get('avg_confidence', 100.0) or 100.0
        fake  = summary.get('fake_reviews', 0) or 0

        neg_pct  = (neg  / total) * 100
        neu_pct  = (neu  / total) * 100
        fake_pct = (fake / total) * 100
        pos_pct  = (pos  / total) * 100

        # Rule 1: Critical negative surge
        if neg_pct >= self.thresholds['negative_pct_critical']:
            alerts.append({
                'alert_type': 'sentiment_drop_critical',
                'severity': 'critical',
                'message': (
                    f"CRITICAL: {analysis_name} — {neg_pct:.1f}% of reviews are negative "
                    f"(threshold: {self.thresholds['negative_pct_critical']}%). "
                    f"Immediate attention required."
                ),
                'analysis_id': analysis_id,
            })
        # Rule 2: Warning negative spike
        elif neg_pct >= self.thresholds['negative_pct_warning']:
            alerts.append({
                'alert_type': 'sentiment_drop_warning',
                'severity': 'warning',
                'message': (
                    f"WARNING: {analysis_name} — {neg_pct:.1f}% negative sentiment "
                    f"exceeds the {self.thresholds['negative_pct_warning']}% warning threshold."
                ),
                'analysis_id': analysis_id,
            })

        # Rule 3: Low neutral percentage (polarised spike)
        if neu_pct < self.thresholds['neutral_pct_low'] and total >= 10:
            alerts.append({
                'alert_type': 'polarisation_spike',
                'severity': 'warning',
                'message': (
                    f"SPIKE: {analysis_name} — only {neu_pct:.1f}% neutral reviews. "
                    f"Audience sentiment is highly polarised."
                ),
                'analysis_id': analysis_id,
            })

        # Rule 4: Fake/suspicious reviews
        if fake_pct >= self.thresholds['fake_pct_warning']:
            alerts.append({
                'alert_type': 'fake_review_detected',
                'severity': 'warning',
                'message': (
                    f"QUALITY: {analysis_name} — {fake_pct:.1f}% of reviews flagged as suspicious "
                    f"(threshold: {self.thresholds['fake_pct_warning']}%)."
                ),
                'analysis_id': analysis_id,
            })

        # Rule 5: Low model confidence
        if conf < self.thresholds['confidence_low']:
            alerts.append({
                'alert_type': 'low_confidence',
                'severity': 'info',
                'message': (
                    f"INFO: {analysis_name} — average model confidence is {conf:.1f}%, "
                    f"below the {self.thresholds['confidence_low']}% threshold. "
                    f"Results may be less reliable."
                ),
                'analysis_id': analysis_id,
            })

        # Rule 6: Positive milestone
        if pos_pct >= 80.0 and total >= 5:
            alerts.append({
                'alert_type': 'positive_milestone',
                'severity': 'success',
                'message': (
                    f"GREAT NEWS: {analysis_name} — {pos_pct:.1f}% positive sentiment! "
                    f"Outstanding brand perception."
                ),
                'analysis_id': analysis_id,
            })

        return alerts

    # ── Persistence ───────────────────────────────────────────────

    def persist_alerts(self, user_id: int, alerts: List[Dict]) -> List[int]:
        """Save alerts to the database. Returns list of created alert IDs."""
        from backend.database import DatabaseManager
        db = DatabaseManager()
        ids = []
        for alert in alerts:
            aid = db.create_alert(
                user_id=user_id,
                alert_type=alert['alert_type'],
                severity=alert['severity'],
                message=alert['message'],
                analysis_id=alert.get('analysis_id')
            )
            ids.append(aid)
        return ids

    # ── Optional: Email notification ──────────────────────────────

    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Send an email alert via SMTP.
        Reads SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD from environment.
        Returns True on success, False on failure.
        """
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            host     = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
            port     = int(os.environ.get('SMTP_PORT', 587))
            sender   = os.environ.get('SMTP_EMAIL', '')
            password = os.environ.get('SMTP_PASSWORD', '')

            if not sender or not password:
                return False  # SMTP not configured

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From']    = sender
            msg['To']      = to_email

            html_body = f"""
            <html><body>
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;
                        border:1px solid #e2e8f0;border-radius:8px;">
                <h2 style="color:#0ea5e9;">🎯 BrandPulse Alert</h2>
                <p style="color:#334155;font-size:16px;">{body}</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                <p style="color:#94a3b8;font-size:12px;">
                    Sent by BrandPulse · <a href="#">Manage alerts</a>
                </p>
            </div>
            </body></html>
            """
            msg.attach(MIMEText(html_body, 'html'))

            with smtplib.SMTP(host, port) as server:
                server.starttls()
                server.login(sender, password)
                server.sendmail(sender, to_email, msg.as_string())

            return True
        except Exception as e:
            print(f"Email alert failed: {e}")
            return False

    # ── Optional: Slack notification ──────────────────────────────

    def send_slack(self, message: str, webhook_url: Optional[str] = None) -> bool:
        """
        Post an alert to a Slack webhook.
        Falls back to SLACK_WEBHOOK_URL env var if webhook_url not provided.
        """
        try:
            import urllib.request
            url = webhook_url or os.environ.get('SLACK_WEBHOOK_URL', '')
            if not url:
                return False

            payload = json.dumps({'text': f'*BrandPulse Alert*\n{message}'}).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=payload,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status == 200
        except Exception as e:
            print(f"Slack alert failed: {e}")
            return False

    # ── High-level: evaluate + persist + optionally notify ────────

    def process_analysis_alerts(
        self,
        user_id: int,
        analysis_id: int,
        analysis_name: str,
        summary: Dict,
        email: Optional[str] = None,
        slack_webhook: Optional[str] = None,
    ) -> List[Dict]:
        """
        Full pipeline: evaluate rules → persist to DB → optionally send email/Slack.
        Returns the list of triggered alert dicts.
        """
        alerts = self.evaluate_analysis(user_id, analysis_id, analysis_name, summary)
        if alerts:
            self.persist_alerts(user_id, alerts)
            if email:
                critical = [a for a in alerts if a['severity'] == 'critical']
                warnings  = [a for a in alerts if a['severity'] == 'warning']
                if critical or warnings:
                    combined = '\n'.join([a['message'] for a in critical + warnings])
                    self.send_email(email, f"[BrandPulse] Alerts for {analysis_name}", combined)
            if slack_webhook:
                for alert in alerts:
                    icon = SEVERITY_COLORS.get(alert['severity'], '⚪')
                    self.send_slack(f"{icon} {alert['message']}", slack_webhook)
        return alerts


# ── Factory ───────────────────────────────────────────────────────────────────
def get_alert_manager(thresholds: Optional[Dict] = None) -> AlertManager:
    return AlertManager(thresholds=thresholds)
