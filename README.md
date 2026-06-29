# Brisbane Audit API

Simple endpoint that receives audit data from your routine and stores it.

## Setup

1. **Set your API token** in environment:
   ```
   export AUDIT_API_TOKEN=your_secret_token_here
   ```

2. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```
   python app.py
   ```

Server runs on `http://localhost:5000`

## Usage

Send a POST request to append audit data:

```bash
curl -X POST http://localhost:5000/api/audit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Example Business",
    "category": "Plumber",
    "phone": "0712345678",
    "email": "contact@example.com",
    "package": "Package 1 - Digital Foundation",
    "timestamp": "2026-06-29T10:50:00Z"
  }'
```

**Response:**
```json
{"status": "success", "message": "Audit appended"}
```

## From Your Routine

In Claude Code, add this to your routine:

```javascript
const response = await fetch('YOUR_DEPLOYED_URL/api/audit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    business_name: businessName,
    category: category,
    phone: phone,
    email: email,
    package: package,
    timestamp: new Date().toISOString()
  })
});
```

## Data Storage

Audit data is stored in `data/audits.json` as a JSON array. Each routine run appends a new entry.

## Bulk Import

To load historical audit data:

```bash
python bulk_import.py /path/to/your/brisbane_Digital_Audit_*.xlsx
```

This reads Excel files and appends all rows to `data/audits.json`.

## Deployment

Deploy to any service that supports Python (Vercel, Railway, Replit, AWS Lambda, etc.).

Set the `AUDIT_API_TOKEN` environment variable in your deployment platform.
