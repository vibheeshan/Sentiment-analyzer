# 🔧 BrandPulse - Troubleshooting & Debugging Guide

## Common Issues & Solutions

### Issue 1: "ModuleNotFoundError" or "ImportError"

**Error:**

```
ModuleNotFoundError: No module named 'streamlit'
ImportError: cannot import name 'DatabaseManager'
```

**Causes:**

- Dependencies not installed
- Wrong Python environment
- Module caching issue

**Solutions:**

```bash
# 1. Reinstall dependencies
pip install -r requirements.txt

# 2. Verify installation
python verify_modules.py

# 3. Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
rm -rf .streamlit/cache

# 4. Restart terminal and try again
streamlit run app/main.py
```

---

### Issue 2: "AttributeError: 'DatabaseManager' object has no attribute 'get_user_info'"

**Error:**

```
AttributeError: 'DatabaseManager' object has no attribute 'get_user_info'
```

**Cause:**

- Python bytecode cache loading old module version

**Solution:**

```bash
# Clear all Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete

# Clear Streamlit cache
rm -rf .streamlit/cache

# Verify method exists
python verify_modules.py

# Restart app
streamlit run app/main.py
```

**Verification:**

```bash
python -c "from backend.database import DatabaseManager; db = DatabaseManager(); print(hasattr(db, 'get_user_info'))"
# Expected output: True
```

---

### Issue 3: App Runs Slow or Freezes

**Symptoms:**

- Analysis takes too long
- Charts don't render
- Memory usage high

**Causes:**

- Large dataset (>1000 reviews)
- Model loading taking time
- First run (downloading models)

**Solutions:**

```bash
# 1. Use smaller dataset (start with 100-200 reviews)
# 2. Use "In-Browser" AI mode (faster, less accurate)
# 3. Close background applications
# 4. Check system resources
python -c "import psutil; print(psutil.virtual_memory())"

# 5. Clear Streamlit cache
rm -rf .streamlit/cache

# 6. Use fresh database (optional)
rm sentiment_monitor.db
streamlit run app/main.py
```

**Performance Tips:**

- First run: Models download (2-5 minutes)
- Subsequent runs: Faster (cached models)
- Browser mode: <50 reviews per second
- Cloud mode: Requires API (not configured)

---

### Issue 4: File Upload Fails

**Symptoms:**

- File won't load
- "Error loading file" message
- File size limits exceeded

**Causes:**

- Invalid CSV/JSON format
- File size >10MB
- Corrupted file
- Encoding issues

**Solutions:**

```bash
# 1. Check file format
file your_data.csv      # Should be text
file your_data.json     # Should be text

# 2. Check file size
ls -lh your_data.csv    # Should be <10MB

# 3. Validate CSV format
python -c "import pandas as pd; df = pd.read_csv('your_data.csv'); print(f'Rows: {len(df)}, Cols: {len(df.columns)}')"

# 4. Validate JSON format
python -c "import json; json.load(open('your_data.json'))"

# 5. Try converting CSV encoding
# Windows: Use Notepad++, save as UTF-8
# Linux: iconv -f ISO-8859-1 -t UTF-8 file.csv > file_utf8.csv

# 6. Use sample data
# data/sample_data.csv or data/sample_data.json
```

**Valid CSV Format:**

```csv
text,date,source
"Review text here",2025-01-15,amazon
"Another review",2025-01-14,twitter
```

**Valid JSON Format:**

```json
[
  { "text": "Review text here", "date": "2025-01-15" },
  { "text": "Another review", "date": "2025-01-14" }
]
```

---

### Issue 5: Wrong Results or Low Confidence

**Symptoms:**

- Sentiments don't match text
- Confidence scores too low (<60%)
- Emotions incorrect

**Causes:**

- Poor text quality
- Slang/colloquial language
- Multiple sentiments in one review
- Non-English text
- Context-dependent meaning

**Solutions:**

```bash
# 1. Check data quality
# - Remove emojis: ❌
# - Remove special chars: ❌
# - Use complete sentences: ✅
# - Keep original language: ✅

# 2. Manual review
# View samples in "Details" tab
# Read original text vs classified sentiment

# 3. Enable fake review detection
# Check if reviews are authentic

# 4. Use confidence filters
# Only trust >80% confidence
# Manually review 60-80% range
# Ignore <60% (likely false)
```

**Text Quality Guidelines:**

```
❌ Poor: "good!!!!!!! amazing@@@@"
✅ Good: "Really good product, amazing quality"

❌ Poor: "tbh kinda meh ngl"
✅ Good: "To be honest, I think it's mediocre"

❌ Poor: "🔥🔥🔥 FIRE DEAL 🔥🔥🔥"
✅ Good: "Great deal, highly recommend"
```

---

### Issue 6: Database Errors

**Symptoms:**

- "Database is locked"
- "No such table"
- Data not saving

**Causes:**

- Database file corrupted
- Multiple instances accessing DB
- Missing tables
- Wrong path

**Solutions:**

```bash
# 1. Check database exists
ls -la sentiment_monitor.db

# 2. Backup current database
cp sentiment_monitor.db sentiment_monitor.db.backup

# 3. Verify database integrity
sqlite3 sentiment_monitor.db "PRAGMA integrity_check;"
# Output should be: ok

# 4. Check table structure
sqlite3 sentiment_monitor.db ".tables"
# Should show: analyses analysis_entries analysis_summary users

# 5. Close all instances
# Kill streamlit: Ctrl+C in terminal
# Wait 5 seconds
# Restart: streamlit run app/main.py

# 6. Recreate database (last resort)
rm sentiment_monitor.db
python -c "from backend.database import DatabaseManager; db = DatabaseManager()"
streamlit run app/main.py
```

**Database Check Script:**

```bash
python -c "
from backend.database import DatabaseManager
db = DatabaseManager()
print('✓ Database initialized')
print('✓ Tables created')
"
```

---

### Issue 7: Authentication Problems

**Symptoms:**

- Can't sign up
- Can't sign in
- Forgot password
- Session expires

**Causes:**

- Invalid username/email format
- Password too short
- Database issues
- Session timeout

**Solutions:**

```bash
# 1. Check requirements
# Username: 3+ characters
# Email: valid@email.com
# Password: 6+ characters

# 2. Verify database
python -c "from backend.database import DatabaseManager; db = DatabaseManager(); print('✓ DB OK')"

# 3. Check user creation
sqlite3 sentiment_monitor.db "SELECT username, email FROM users LIMIT 5;"

# 4. Reset database (admin only)
# Remove sentiment_monitor.db
# Restart app
# Create new account

# 5. Check session state
# Streamlit sidebar should show username
# If not, try refreshing (Ctrl+R)
```

---

### Issue 8: Visualization/Chart Problems

**Symptoms:**

- Charts don't display
- Word cloud won't load
- Empty charts
- Plotly error

**Causes:**

- No data to visualize
- Insufficient entries
- Plotly version issue
- Browser compatibility

**Solutions:**

```bash
# 1. Check data exists
# In "Details" tab, verify table has rows
# If empty, run new analysis

# 2. Check chart requirements
# Pie chart: Need sentiment distribution
# Bar chart: Need 2+ categories
# Word cloud: Need 50+ words

# 3. Update plotly
pip install --upgrade plotly

# 4. Try different browser
# Chrome/Firefox/Safari all supported
# Clear browser cache: Ctrl+Shift+Delete

# 5. Restart Streamlit with debug
streamlit run app/main.py --logger.level=debug
```

---

### Issue 9: Memory Issues

**Symptoms:**

- "Out of memory" error
- App crashes during analysis
- System becomes very slow
- Streamlit restarts

**Causes:**

- Very large dataset (>10000)
- Model loading takes all RAM
- Too many analyses loaded
- Insufficient system memory

**Solutions:**

```bash
# 1. Check available memory
python -c "import psutil; print(f'Available: {psutil.virtual_memory().available / 1e9:.1f}GB')"

# 2. Reduce dataset size
# Start with <500 reviews
# Test, then increase gradually

# 3. Use browser mode (smaller footprint)
# Less accurate but faster

# 4. Close background apps
# Browser tabs
# Other applications
# Especially heavy programs

# 5. Clear cache
rm -rf .streamlit/cache
rm -rf ~/.cache/transformers

# 6. Increase system memory swap
# Add virtual memory/page file
```

**Recommended System Requirements:**

- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB for models and cache
- CPU: Multi-core processor
- Network: For cloud mode (if used)

---

### Issue 10: First-Run Performance

**Symptoms:**

- Takes 2-5 minutes to start
- Downloads are happening
- Memory spike on startup

**Cause:**

- Models downloading from HuggingFace
- One-time initialization
- Normal behavior

**Solution:**

```bash
# This is NORMAL on first run
# 1st run: 2-5 minutes (downloading models)
# 2nd run: 5-10 seconds (cached models)
# 3rd+ run: <5 seconds (instant)

# Watch the terminal for progress
# Models downloading from huggingface.co
# Approximately 1-2 GB download

# Ensure stable internet connection
# Don't close the application
# Wait for "You can now view your Streamlit app"
```

---

## 🔍 DEBUGGING TECHNIQUES

### Enable Debug Logging

```bash
streamlit run app/main.py --logger.level=debug
```

### Check Python Version

```bash
python --version
# Should be 3.8 or higher
```

### Verify All Imports

```bash
python -c "
import streamlit
import pandas
import plotly.express
import transformers
print('✓ All imports successful')
"
```

### Test Database Connection

```bash
python -c "
from backend.database import DatabaseManager
db = DatabaseManager()
conn = db.get_connection()
print('✓ Database connection OK')
conn.close()
"
```

### Test Sentiment Analysis

```bash
python -c "
from backend.sentiment_service import get_sentiment_analyzer
analyzer = get_sentiment_analyzer()
result = analyzer.analyze('Great product!')
print(f'Sentiment: {result[\"sentiment\"]}, Confidence: {result[\"confidence\"]}')
"
```

---

## 🛠️ MAINTENANCE TASKS

### Weekly Maintenance

```bash
# 1. Clear old cache files
find . -name "*.pyc" -delete
find . -type d -name __pycache__ -exec rm -rf {} +

# 2. Check disk space
df -h

# 3. Review database size
ls -lh sentiment_monitor.db

# 4. Check for errors
python verify_modules.py
```

### Monthly Maintenance

```bash
# 1. Update dependencies
pip list --outdated
pip install --upgrade -r requirements.txt

# 2. Backup database
cp sentiment_monitor.db "backup_$(date +%Y%m%d).db"

# 3. Check database integrity
sqlite3 sentiment_monitor.db "PRAGMA integrity_check;"

# 4. Clean old temporary files
find . -type f -name "*.tmp" -delete
find . -type f -name ".DS_Store" -delete
```

### Quarterly Maintenance

```bash
# 1. Full cache clear
rm -rf .streamlit/cache
rm -rf ~/.cache/transformers

# 2. Dependency audit
pip-audit

# 3. Security update
pip install --upgrade cryptography

# 4. Archive old data
# Create backup: backup_$(date).tar.gz
# Archive analyses >6 months old
```

---

## 📊 MONITORING

### Check App Status

```bash
# Terminal shows:
# - Local: http://localhost:8501
# - Network: (your IP):8501
# - Is server running correctly? Yes

# Symptoms of problems:
# - Errors in red text
# - Module import failures
# - Connection refused
```

### Monitor System Resources

```bash
# During analysis, watch for:
# - CPU usage: Should spike temporarily
# - Memory: Should return to baseline
# - Disk I/O: Normal during file ops

# Warning signs:
# - Memory keeps increasing (memory leak)
# - CPU at 100% for >5 minutes (stuck)
# - Disk full (clean up cache)
```

### Check Logs

```bash
# Streamlit logs appear in terminal
# Check for:
# - ERROR messages (red)
# - WARNING messages (yellow)
# - INFO messages (white)

# Keep terminal visible while using app
# Helps diagnose issues
```

---

## 📞 QUICK REFERENCE

| Issue               | Solution                          | Time  |
| ------------------- | --------------------------------- | ----- |
| Module not found    | `pip install -r requirements.txt` | 2 min |
| get_user_info error | Clear cache + verify              | 1 min |
| Slow performance    | Restart, reduce size              | 5 min |
| File upload fails   | Check format/size                 | 2 min |
| Wrong results       | Review data quality               | 5 min |
| Database error      | Backup + recreate                 | 2 min |
| Auth problems       | Verify requirements               | 2 min |
| Chart issues        | Check data + clear cache          | 2 min |
| Memory errors       | Reduce size + restart             | 5 min |
| First run slow      | Wait for models                   | 5 min |

---

## 🆘 GETTING HELP

### Before Asking for Help

1. ✅ Run `python verify_modules.py`
2. ✅ Check the error message carefully
3. ✅ Clear cache and restart
4. ✅ Review this guide
5. ✅ Check documentation files

### Help Resources

- **QUICKSTART.md** - Getting started
- **FEATURE_GUIDE.md** - Feature help
- **IMPLEMENTATION.md** - Technical details
- **Terminal error message** - Usually tells you the problem

### Information to Provide

- Error message (exact text)
- Python version (`python --version`)
- OS (Windows/Mac/Linux)
- Steps to reproduce
- What you've already tried

---

## 🎓 LEARNING RESOURCES

### Understanding Sentiment Analysis

- HuggingFace documentation
- BERT model explanations
- NLP tutorials

### Streamlit Documentation

- https://docs.streamlit.io
- Streamlit forum
- GitHub issues

### Python Debugging

- Python documentation
- Stack Overflow
- Python debugging guides

---

**Last Updated**: February 2025
**Version**: 1.0
**Support Level**: Community-based

---

<p align="center">
Trouble getting it working? Check this guide first! 🔧
</p>
