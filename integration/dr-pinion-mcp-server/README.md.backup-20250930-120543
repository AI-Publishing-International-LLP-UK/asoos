# Dr. Pinion - Bulk File Ingestion

Drop 1000+ files and search them instantly!

## Quick Setup (5 minutes)

1. **Install dependencies:**
   ```bash
   cd /Users/as/asoos/integration/dr-pinion-mcp-server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file
   echo "PINECONE_API_KEY=your-pinecone-key" > .env
   echo "OPENAI_API_KEY=your-openai-key" >> .env
   ```

3. **Drop your files and GO:**
   ```bash
   # Put all your ChatGPT/Claude/document files in a folder
   # Then run this ONE command:
   node bulk-ingest.js /path/to/your/1000files
   ```

## Example Usage

```bash
# Ingest ChatGPT conversations
node bulk-ingest.js /Users/as/Downloads/chatgpt-conversations

# Ingest Claude conversations  
node bulk-ingest.js /Users/as/Documents/claude-exports

# Ingest mixed documents
node bulk-ingest.js /Users/as/research-documents
```

## What it handles automatically:
- ✅ ChatGPT export JSON files
- ✅ Claude conversation files
- ✅ Text files (.txt, .md)
- ✅ CSV files
- ✅ HTML files
- ✅ Any text-based document

## After ingestion:

Start Dr. Pinion server:
```bash
npm start
```

Search your files:
```bash
curl -X POST https://mcp.pinecone.2100.cool/mcp/search \
  -H "Content-Type: application/json" \
  -d '{"query": "what did I discuss about AI?", "topK": 5}'
```

## File Processing Stats

The system will process:
- **100 files per batch** (to avoid rate limits)
- **Automatically detects** file types
- **Preserves metadata** (filename, source, timestamps)
- **Creates embeddings** for semantic search
- **Handles errors gracefully** (skips corrupted files)

## Deploy to Production

```bash
# Deploy containerized Dr. Pinion to Cloud Run
chmod +x deploy.sh
./deploy.sh
```

Now your files are accessible at: `https://mcp.pinecone.2100.cool`

---

**That's it!** Drop your files, run one command, and search millions of conversations instantly.