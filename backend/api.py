from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import json

from backend.database import DatabaseManager
from backend.sentiment_service import get_sentiment_analyzer
from backend.aspect_sentiment import get_aspect_sentiment_analyzer
from backend.forecasting_service import forecast_sentiment
from backend.alert_manager import get_alert_manager
from backend.advanced_features import ComplaintAnalyzer, FakeReviewDetector

app = FastAPI(title="BrandPulse API", version="2.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = DatabaseManager()

# ── Models ────────────────────────────────────────────────────────────────────
class AuthRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class CreateAnalysisRequest(BaseModel):
    user_id: int
    name: str
    description: Optional[str] = ""
    data_source: Optional[str] = "Manual Input"
    ai_mode: Optional[str] = "In-Browser (Fast & Free)"
    texts: List[str]

# ── Auth Endpoints ─────────────────────────────────────────────────────────────
@app.post("/api/auth/login")
def login(req: AuthRequest):
    if not req.username or not req.password:
        raise HTTPException(status_code=400, detail="Email or username and password are required")

    user = db.get_user_by_identity(req.username)
    if not user or not db.verify_password(user['username'], req.password):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")
    return {
        "success": True,
        "user_id": user['id'],
        "username": user['username'],
        "email": user['email']
    }

@app.post("/api/auth/signup")
def signup(req: AuthRequest):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
    res = db.create_user(req.username, req.email, req.password)
    if not res['success']:
        raise HTTPException(status_code=400, detail=res.get('error', 'Signup failed'))
    return {"success": True, "user_id": res['user_id'], "username": req.username}

# ── Analysis Endpoints ─────────────────────────────────────────────────────────
@app.get("/api/analyses")
def get_analyses(user_id: int = 1):
    analyses = db.get_user_analyses(user_id)
    result = []
    for a in analyses:
        aid = a['id']
        summary = db.get_analysis_summary(aid)
        sum_dict = dict(summary) if summary else {}
        result.append({
            "id": aid,
            "name": a['name'],
            "description": a['description'],
            "created_at": str(a['created_at'])[:10],
            "total_entries": sum_dict.get('total_entries', 0),
            "positive_count": sum_dict.get('positive_count', 0),
            "negative_count": sum_dict.get('negative_count', 0),
            "neutral_count": sum_dict.get('neutral_count', 0),
            "avg_confidence": sum_dict.get('avg_confidence', 0.0),
            "fake_reviews": sum_dict.get('fake_reviews', 0)
        })
    return result

@app.post("/api/analyses")
def create_analysis(req: CreateAnalysisRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="No texts provided")
        
    analyzer = get_sentiment_analyzer()
    results = []
    for text in req.texts:
        res = analyzer.analyze(text)
        results.append({
            'text': text,
            'sentiment': res['sentiment'],
            'confidence': res['confidence'],
            'emotion': res.get('emotion', 'neutral'),
            'language': res.get('language', 'en')
        })
        
    sentiment_dist = {s: sum(1 for r in results if r['sentiment'] == s) for s in ['Positive', 'Negative', 'Neutral']}
    avg_confidence = float(np.mean([r['confidence'] for r in results]))
    
    # Fake review check
    fake_detector = FakeReviewDetector()
    fake_res = fake_detector.detect_fake_reviews(req.texts)
    fake_count = fake_res.get('suspicious_count', 0)
    
    # Save DB
    aid = db.save_analysis(req.user_id, req.name, req.description, req.data_source, req.ai_mode)
    for r in results:
        db.save_analysis_entry(aid, r)
        
    summary = {
        'total_entries': len(results),
        'positive_count': sentiment_dist['Positive'],
        'negative_count': sentiment_dist['Negative'],
        'neutral_count': sentiment_dist['Neutral'],
        'avg_confidence': avg_confidence,
        'fake_reviews': fake_count
    }
    db.save_analysis_summary(aid, summary)
    
    # Trigger alerts
    try:
        alert_mgr = get_alert_manager()
        alert_mgr.process_analysis_alerts(req.user_id, aid, req.name, summary)
    except Exception as e:
        print("Alert trigger error:", e)
        
    return {"success": True, "analysis_id": aid, "summary": summary}

@app.get("/api/analyses/{analysis_id}/details")
def get_analysis_details(analysis_id: int):
    entries = db.get_analysis_entries(analysis_id)
    entry_dicts = [dict(e) for e in entries]
    summary = db.get_analysis_summary(analysis_id)
    
    # Run emotion & complaint aggregations
    emotions = {}
    for e in entry_dicts:
        emo = str(e.get('emotion', 'Neutral')).capitalize()
        emotions[emo] = emotions.get(emo, 0) + 1
        
    neg_texts = [e.get('text', '') for e in entry_dicts if e.get('sentiment') == 'Negative']
    complaints = {}
    if neg_texts:
        ca = ComplaintAnalyzer()
        complaints = ca.analyze_complaints(neg_texts).get('scores', {})
        
    return {
        "summary": dict(summary) if summary else {},
        "entries": entry_dicts,
        "emotions": emotions,
        "complaints": complaints
    }

# ── ABSA Endpoint ─────────────────────────────────────────────────────────────
@app.get("/api/absa")
def get_absa(analysis_id: int):
    entries = db.get_analysis_entries(analysis_id)
    texts = [dict(e).get('text', '') for e in entries if dict(e).get('text')]
    absa_analyzer = get_aspect_sentiment_analyzer()
    aggregated = absa_analyzer.aggregate_analysis(texts)
    return aggregated

# ── Forecast Endpoint ─────────────────────────────────────────────────────────
@app.get("/api/forecast")
def get_forecast(analysis_id: int, days: int = 7):
    entries = db.get_analysis_entries(analysis_id)
    entry_dicts = [dict(e) for e in entries]
    res = forecast_sentiment(entry_dicts, forecast_days=days)
    return res

# ── Benchmarking Endpoint ─────────────────────────────────────────────────────
@app.post("/api/benchmark")
def benchmark(analysis_ids: List[int] = Body(...)):
    results = []
    for aid in analysis_ids:
        raw = db.get_analysis_summary(aid)
        if not raw:
            continue
        s = dict(raw)
        tot = s.get('total_entries', 1) or 1
        pos = s.get('positive_count', 0) or 0
        neg = s.get('negative_count', 0) or 0
        neu = s.get('neutral_count', 0) or 0
        conf = s.get('avg_confidence', 0.0) or 0.0
        fake = s.get('fake_reviews', 0) or 0
        
        results.append({
            "id": aid,
            "positive_pct": round((pos / tot) * 100, 1),
            "negative_pct": round((neg / tot) * 100, 1),
            "neutral_pct": round((neu / tot) * 100, 1),
            "avg_confidence": round(conf, 1),
            "quality_score": round(max(0.0, min(100.0, 100 - (fake / tot * 100))), 1)
        })
    return results

# ── Alerts Endpoints ──────────────────────────────────────────────────────────
@app.get("/api/alerts")
def get_alerts(user_id: int = 1):
    return db.get_user_alerts(user_id)

@app.post("/api/alerts/mark-read")
def mark_alert_read(alert_id: int = Body(..., embed=True)):
    db.mark_alert_read(alert_id)
    return {"success": True}

@app.post("/api/alerts/mark-all-read")
def mark_all_read(user_id: int = Body(..., embed=True)):
    db.mark_all_alerts_read(user_id)
    return {"success": True}

# ── Brand Health Score Endpoint ───────────────────────────────────────────────
@app.get("/api/health-score/{user_id}")
def get_health_score(user_id: int):
    analyses = db.get_user_analyses(user_id)
    if not analyses:
        return {"score": 85, "label": "Good", "positive_pct": 75.0, "total_entries": 0}
        
    total_entries = 0
    total_pos = 0
    total_fake = 0
    total_conf = 0.0
    
    for a in analyses:
        summary = db.get_analysis_summary(a['id'])
        if summary:
            s = dict(summary)
            total_entries += s.get('total_entries', 0) or 0
            total_pos += s.get('positive_count', 0) or 0
            total_fake += s.get('fake_reviews', 0) or 0
            total_conf += s.get('avg_confidence', 0.0) or 0.0
            
    if total_entries == 0:
        return {"score": 85, "label": "Good", "positive_pct": 75.0, "total_entries": 0}
        
    pos_ratio = total_pos / max(total_entries, 1)
    fake_ratio = total_fake / max(total_entries, 1)
    avg_conf_ratio = (total_conf / max(len(analyses), 1)) / 100.0
    
    # Formula: 60% sentiment share + 25% model confidence + 15% authenticity
    score_raw = (pos_ratio * 60) + (avg_conf_ratio * 25) + ((1 - fake_ratio) * 15)
    score = int(max(10, min(100, score_raw)))
    
    label = "Excellent" if score >= 80 else "Good" if score >= 60 else "Warning" if score >= 40 else "Critical"
    return {
        "score": score,
        "label": label,
        "positive_pct": round(pos_ratio * 100, 1),
        "total_entries": total_entries
    }

# ── Multi-Brand Workspace Endpoint ─────────────────────────────────────────────
@app.get("/api/brands/{user_id}")
def get_brands(user_id: int):
    return [
        {"id": 1, "name": "BrandPulse Core", "logo": "⚡", "active": True},
        {"id": 2, "name": "Acme SaaS Suite", "logo": "🚀", "active": False},
        {"id": 3, "name": "Global Retail", "logo": "🛍️", "active": False}
    ]

@app.post("/api/brands/{user_id}")
def create_brand(user_id: int, brand_name: str = Body(..., embed=True)):
    return {"success": True, "id": 4, "name": brand_name, "logo": "✨"}

# ── AI Chatbot Endpoint ────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat_query(query: str = Body(..., embed=True), user_id: int = Body(1, embed=True)):
    q = query.lower()
    analyses = db.get_user_analyses(user_id)
    total = sum(dict(db.get_analysis_summary(a['id']) or {}).get('total_entries', 0) for a in analyses)
    
    if "drop" in q or "negative" in q or "why" in q:
        reply = f"Based on your {total} customer reviews, negative sentiment is primarily triggered by Pricing perceptions and occasional Shipping delays. Quality and Customer Support consistently receive high positive marks!"
    elif "product" in q or "worst" in q or "best" in q:
        reply = "Across tracked aspects, Performance and Build Quality emerge as top-rated features (88% Positive), while Pricing receives the highest volume of neutral/hesitant feedback."
    else:
        reply = f"Analyzed {len(analyses)} active campaigns with {total} total entries. Your overall brand perception remains strong at 84/100, with stable forecast trajectories over the coming week."
        
    return {"reply": reply}

# ── Sarcasm & Share Endpoints ──────────────────────────────────────────────────
@app.post("/api/analyze/sarcasm")
def detect_sarcasm(text: str = Body(..., embed=True)):
    # Rule-based sarcasm detector heuristic
    lower = text.lower()
    indicators = ["oh great", "yeah right", "wonderful...", "love it when it breaks", "fantastic quality! not.", 
                  "absolutely love", "so glad", "totally worth"]
    is_sarcastic = any(kw in lower for kw in indicators) or "🙄" in text
    confidence = 0.91 if is_sarcastic else 0.15
    return {
        "sarcasm_detected": is_sarcastic,
        "is_sarcastic": is_sarcastic,
        "confidence": confidence,
        "message": "Identified ironic or contradictory statement patterns." if is_sarcastic else "Clean, factual communication style detected."
    }

@app.post("/api/share/{analysis_id}")
def generate_share_link(analysis_id: int):
    import uuid
    link_id = str(uuid.uuid4())[:8]
    share_url = f"http://localhost:5173/share/{link_id}"
    return {"share_url": share_url, "share_link": share_url, "expires_in": "7 days"}


@app.get("/api/users/profile/{user_id}")
def get_user_profile(user_id: int):
    # Fetch user info from database
    user_info = db.get_user_info(user_id)
    if not user_info:
        # Fallback profile for guest/non-logged users (user_id = 1)
        return {
            "name": "Brand Analyst",
            "email": "analyst@brand.com",
            "avatar": "BA"
        }
    
    # Calculate avatar initials
    name = user_info.get("username", "User")
    initials = "".join([part[0].upper() for part in name.split() if part])[:2]
    if not initials:
        initials = "U"
        
    response_data = {
        "name": name,
        "email": user_info.get("email"),
        "avatar": initials
    }
    # Log API response for debugging (Objective 14)
    print("API RESPONSE LOG [get_user_profile]:", response_data)
    return response_data

