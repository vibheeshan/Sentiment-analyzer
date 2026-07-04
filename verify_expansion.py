"""
Lightweight verification — tests logic and syntax for all Phase 1 expansion modules.
"""
import sys, traceback, ast

errors = []

# ── Test 1: forecasting_service (pure Python) ──
try:
    from backend.forecasting_service import forecast_sentiment, _holt_linear_trend
    fitted, fcast = _holt_linear_trend([60, 62, 65, 63, 68, 70], forecast_steps=3)
    assert len(fcast) == 3
    result = forecast_sentiment([
        {'date': '2024-01-01', 'sentiment': 'Positive'},
        {'date': '2024-01-02', 'sentiment': 'Positive'},
    ], forecast_days=5)
    print(f"[PASS] forecasting_service: trend={result['trend']}")
except Exception as e:
    errors.append(f"[FAIL] forecasting_service: {e}")

# ── Test 2: alert_manager logic ──
try:
    from backend.alert_manager import get_alert_manager
    mgr = get_alert_manager()
    alerts = mgr.evaluate_analysis(
        user_id=1, analysis_id=99, analysis_name="Test",
        summary={'total_entries': 100, 'positive_count': 20, 'negative_count': 70, 'neutral_count': 10}
    )
    assert len(alerts) >= 1
    print(f"[PASS] alert_manager: evaluated {len(alerts)} alerts successfully")
except Exception as e:
    errors.append(f"[FAIL] alert_manager: {e}")

# ── Test 3: AST syntax checks for all UI and backend files ──
files_to_check = [
    'backend/forecasting_service.py',
    'backend/aspect_sentiment.py',
    'backend/alert_manager.py',
    'app/competitor_benchmarking.py',
    'app/alerts_page.py',
    'app/absa_page.py',
    'app/main.py'
]

for filepath in files_to_check:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            ast.parse(f.read())
        print(f"[PASS] {filepath}: syntax valid")
    except Exception as e:
        errors.append(f"[FAIL] {filepath}: {e}")

print()
if errors:
    print("=== FAILURES ===")
    for e in errors: print(e)
    sys.exit(1)
else:
    print("All expansion logic and syntax checks passed!")
