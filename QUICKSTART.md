# 🚀 BrandPulse - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Installation

```bash
python verify_modules.py
```

Expected output:

```
✓ ALL CHECKS PASSED - Ready to run!
```

### 3. Clear Cache (if experiencing issues)

```bash
# Windows/PowerShell:
Get-ChildItem -Path . -Include __pycache__ -Recurse -Force | Remove-Item -Recurse -Force
rm -r .streamlit/cache -Force -ErrorAction SilentlyContinue

# Linux/Mac:
find . -type d -name __pycache__ -exec rm -rf {} +
rm -rf .streamlit/cache
```

### 4. Run the Application

```bash
streamlit run app/main.py
```

This will start the app at: **http://localhost:8501**

---

## First Time Setup

### Create Your Account

1. Go to http://localhost:8501
2. Click "Sign Up" tab
3. Enter:
   - Username (3+ characters)
   - Email address
   - Password (6+ characters)
   - Confirm password
4. Click "Create Account"

### Sign In

1. Go to http://localhost:8501
2. Click "Sign In" tab
3. Enter username and password
4. Click "Sign In"

---

## Create Your First Analysis

### Option 1: Upload CSV/JSON

1. Click "📝 New Analysis"
2. Select "Upload File"
3. Click "Choose a file" and select CSV or JSON
4. Review the preview
5. Select the text column to analyze
6. Enter analysis name
7. Choose AI mode (Browser or Cloud)
8. Check optional features (Emotion Detection, etc.)
9. Click "🚀 Analyze Now"

### Option 2: Paste Text

1. Click "📝 New Analysis"
2. Select "Paste Text"
3. Paste reviews (one per line)
4. Enter analysis name
5. Choose AI mode
6. Check optional features
7. Click "🚀 Analyze Now"

---

## Understanding Results

### Results Tabs

**📊 Overview**

- Key metrics (Total, Positive %, Negative %, Confidence)
- Emotion distribution (if enabled)
- Emotion breakdown chart

**📈 Charts**

- Sentiment distribution pie chart
- Top keywords bar chart
- Word cloud visualization

**💡 Insights**

- AI-generated insights
- Key findings and recommendations
- Alerts and warnings

**📋 Details**

- Full data table
- Filters (sentiment, search)
- Export options

### Interpreting Sentiments

- 🟢 **Positive** (Green): Happy, satisfied customers
- 🔴 **Negative** (Red): Unhappy, frustrated customers
- ⚫ **Neutral** (Gray): Objective, factual reviews

### Confidence Scores

- **90-100%**: Very reliable
- **75-90%**: Generally reliable
- **60-75%**: Consider manual review
- **<60%**: May need verification

---

## Features Overview

### Core Features

✅ Sentiment Analysis (Positive/Negative/Neutral)
✅ Emotion Detection (Joy/Anger/Sadness/Surprise/Trust)
✅ Keyword Extraction (Top keywords from reviews)
✅ Word Cloud (Visual keyword frequency)
✅ Data Export (CSV, Excel)

### Advanced Features

✅ Change Detection (Sentiment trend spikes)
✅ Fake Review Detection (Identify suspicious reviews)
✅ AI-Generated Insights (Automatic analysis)
✅ Multi-analysis Dashboard (View all past analyses)
✅ Secure Authentication (User accounts)

---

## Common Issues & Solutions

### Issue: "Module not found" Error

**Solution:**

```bash
python verify_modules.py
pip install -r requirements.txt
```

### Issue: "get_user_info" AttributeError

**Solution:** Clear Python cache

```bash
# Remove __pycache__ folders
find . -type d -name __pycache__ -exec rm -rf {} +
# Clear Streamlit cache
rm -rf .streamlit/cache
# Restart app
streamlit run app/main.py
```

### Issue: App runs slow

**Solutions:**

- Use "In-Browser" AI mode for small datasets (<1000)
- Use "Cloud" mode for large datasets
- Limit analysis to 500-1000 entries
- Close other applications

### Issue: File won't upload

**Solutions:**

- Check file format (CSV or JSON)
- Ensure file size <10MB
- Verify file is not corrupted
- Try CSV format (simpler than JSON)

### Issue: Results don't look right

**Solutions:**

- Review the original data quality
- Check text column selection
- Look at sample entries in Details tab
- Enable Fake Review Detection to check data quality

---

## Data Format Examples

### CSV Format

```csv
text,date,source
"Great product, arrived fast!",2025-01-15,Amazon
"Terrible quality, not worth it",2025-01-14,Amazon
"Average, nothing special",2025-01-13,Amazon
```

### JSON Format

```json
[
  { "text": "Great product!", "date": "2025-01-15" },
  { "text": "Bad quality", "date": "2025-01-14" },
  { "text": "Average", "date": "2025-01-13" }
]
```

### Text Format (Paste)

```
Great product, arrived fast!
Terrible quality, not worth it
Average, nothing special
```

---

## Tips for Best Results

### Data Quality

- Use 100+ reviews for statistical significance
- Mix positive and negative reviews
- Natural language (avoid bullet points)
- Include dates if tracking changes

### Analysis Settings

- ✅ Always enable Emotion Detection
- ✅ Always enable Keyword Extraction
- ☑️ Enable Fake Review Detection if unsure about data
- Use Cloud mode for large datasets (>1000 entries)

### Interpreting Results

1. Check AI Insights panel first
2. Look at top keywords (what customers mention most)
3. Review sample entries (click to expand)
4. Compare confidence scores (higher = more reliable)
5. Check emotion distribution (customer mood)

---

## Next Steps

### Explore Features

1. Create multiple analyses
2. Compare results in Dashboard
3. Export results to Excel
4. Share insights with team

### Use Cases

- Monitor customer satisfaction
- Track competitor sentiment
- Analyze product feedback
- Manage brand reputation
- Identify service improvements

### Advanced

- Set up automated monitoring
- Create custom sentiment categories
- Integrate with data sources
- Build dashboards from exports

---

## Support & Help

### Troubleshooting

- Check logs in terminal
- Verify Python installation: `python --version`
- Check dependencies: `python verify_modules.py`

### Documentation

- [FEATURE_GUIDE.md](FEATURE_GUIDE.md) - Complete feature documentation
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical implementation details

### Performance Tips

- Start with 100-500 reviews
- Increase batch size gradually
- Use browser mode for quick analysis
- Use cloud mode for accuracy

---

## Database Info

The app uses SQLite (local database):

- File: `sentiment_monitor.db`
- Location: Project root directory
- Stores: Users, analyses, results, summaries
- No setup needed (auto-created)

---

## Security Notes

✅ Passwords are hashed (SHA256)
✅ User data is isolated
✅ Local database (no cloud storage)
✅ Session-based authentication
✅ CSRF protection enabled

---

**Version:** 1.0
**Last Updated:** February 2025

For more information, see [FEATURE_GUIDE.md](FEATURE_GUIDE.md)
