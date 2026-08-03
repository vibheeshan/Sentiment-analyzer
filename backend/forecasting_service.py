"""
Sentiment Forecasting Service
Uses Holt's Linear Trend (Double Exponential Smoothing) — no external stats libraries required.
"""
from typing import List, Dict, Tuple
from datetime import datetime, timedelta


def _holt_linear_trend(series: List[float], alpha: float = 0.3, beta: float = 0.2, forecast_steps: int = 7) -> Tuple[List[float], List[float]]:
    """
    Holt's Linear Trend (Double Exponential Smoothing).
    
    Args:
        series: Historical values (at least 2 points required).
        alpha: Level smoothing factor (0 < alpha < 1).
        beta:  Trend smoothing factor (0 < beta < 1).
        forecast_steps: Number of future steps to project.
    
    Returns:
        (fitted, forecast) — fitted values over the training range, then forecasted values.
    """
    if len(series) < 2:
        # Not enough data — repeat last value
        last = series[0] if series else 50.0
        return series[:], [last] * forecast_steps

    # Initialise level and trend
    level = series[0]
    trend = series[1] - series[0]
    fitted = [level + trend]

    for val in series[1:]:
        prev_level = level
        level = alpha * val + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
        fitted.append(level + trend)

    # Project forward
    forecast = []
    for h in range(1, forecast_steps + 1):
        forecast.append(level + h * trend)

    # Clamp to [0, 100]
    fitted = [max(0.0, min(100.0, v)) for v in fitted]
    forecast = [max(0.0, min(100.0, v)) for v in forecast]

    return fitted, forecast


def forecast_sentiment(
    entries: List[Dict],
    forecast_days: int = 7,
    alpha: float = 0.3,
    beta: float = 0.2
) -> Dict:
    """
    Given a list of analysis entry dicts (with 'date' and 'sentiment' keys),
    compute a daily positive-sentiment percentage time-series and forecast future values.

    Args:
        entries: List of dicts with keys: 'date' (str or None), 'sentiment' (str).
        forecast_days: Number of future days to project.
        alpha: Holt level smoothing coefficient.
        beta:  Holt trend smoothing coefficient.

    Returns:
        {
            'historical_dates': [str, ...],
            'historical_values': [float, ...],
            'forecast_dates': [str, ...],
            'forecast_values': [float, ...],
            'trend': 'Rising' | 'Falling' | 'Stable',
            'trend_magnitude': float,  # percentage points change projected
            'data_points': int
        }
    """
    if not entries:
        return _empty_forecast(forecast_days)

    # ── Bucket entries by date ──
    daily_buckets: Dict[str, List[str]] = {}
    today = datetime.now().date()

    for e in entries:
        raw_date = e.get('date') if isinstance(e, dict) else _row_get(e, 'date')
        sentiment = e.get('sentiment') if isinstance(e, dict) else _row_get(e, 'sentiment')

        date_key = _parse_date(raw_date, today)
        if date_key not in daily_buckets:
            daily_buckets[date_key] = []
        daily_buckets[date_key].append(str(sentiment or 'Neutral'))

    if not daily_buckets:
        return _empty_forecast(forecast_days)

    # ── Build contiguous date range ──
    sorted_dates = sorted(daily_buckets.keys())
    start = datetime.strptime(sorted_dates[0], '%Y-%m-%d').date()
    end = datetime.strptime(sorted_dates[-1], '%Y-%m-%d').date()

    all_dates = []
    current = start
    while current <= end:
        all_dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)

    # ── Compute daily positive % (fill missing days with 50.0) ──
    historical_values = []
    for d in all_dates:
        sentiments = daily_buckets.get(d, [])
        if sentiments:
            pos_pct = (sum(1 for s in sentiments if s == 'Positive') / len(sentiments)) * 100
        else:
            pos_pct = 50.0
        historical_values.append(round(pos_pct, 1))

    # ── Run Holt's smoothing ──
    fitted, forecast_values = _holt_linear_trend(
        historical_values, alpha=alpha, beta=beta, forecast_steps=forecast_days
    )

    # ── Generate forecast date labels ──
    last_date = datetime.strptime(all_dates[-1], '%Y-%m-%d').date()
    forecast_dates = [
        (last_date + timedelta(days=i + 1)).strftime('%Y-%m-%d')
        for i in range(forecast_days)
    ]

    # ── Trend classification ──
    if len(forecast_values) >= 2:
        magnitude = round(forecast_values[-1] - forecast_values[0], 1)
    else:
        magnitude = 0.0

    if magnitude > 3:
        trend = 'Rising'
    elif magnitude < -3:
        trend = 'Falling'
    else:
        trend = 'Stable'

    return {
        'historical_dates': all_dates,
        'historical_values': historical_values,
        'forecast_dates': forecast_dates,
        'forecast_values': [round(v, 1) for v in forecast_values],
        'trend': trend,
        'trend_magnitude': magnitude,
        'data_points': len(entries)
    }


def _parse_date(raw: str, fallback) -> str:
    """Try to parse date string into YYYY-MM-DD, falling back to today."""
    if not raw:
        return str(fallback)
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.strptime(str(raw)[:10], fmt[:len(fmt.split('%')[0]) + 8]).strftime('%Y-%m-%d')
        except ValueError:
            continue
    # Last resort: just use the first 10 chars if they look like a date
    try:
        parsed = str(raw)[:10]
        datetime.strptime(parsed, '%Y-%m-%d')
        return parsed
    except Exception:
        return str(fallback)


def _row_get(row, key: str):
    """Safely get a value from a sqlite3.Row or dict."""
    try:
        return row[key]
    except (KeyError, IndexError, TypeError):
        return None


def _empty_forecast(forecast_days: int) -> Dict:
    """Return a blank forecast structure when no data is available."""
    today = datetime.now().date()
    forecast_dates = [
        (today + timedelta(days=i + 1)).strftime('%Y-%m-%d')
        for i in range(forecast_days)
    ]
    return {
        'historical_dates': [],
        'historical_values': [],
        'forecast_dates': forecast_dates,
        'forecast_values': [50.0] * forecast_days,
        'trend': 'Stable',
        'trend_magnitude': 0.0,
        'data_points': 0
    }
