# System Diagrams

This directory contains visual diagrams for the AI Collaborator Matching system in Mermaid format.

## Diagrams

### 1. Architecture Diagram (`architecture.mmd`)
Shows the complete system architecture across all layers:
- Frontend components (React)
- Backend API endpoints (Express)
- Service layer (Matching & AI services)
- Database layer (PostgreSQL)
- External AI services (Claude/GPT-4)

### 2. Matching Flow (`matching-flow.mmd`)
Complete user journey from setup to collaboration:
- Setup phase (connect accounts, set location)
- Matching algorithm execution
- AI analysis process
- Outreach generation
- Status tracking

### 3. Database Schema (`database-schema.mmd`)
Entity-relationship diagram showing:
- Users table structure
- Social Accounts table
- Collaborator Matches table
- Relationships and foreign keys

### 4. Geographic Matching (`geographic-matching.mmd`)
Detailed visualization of the geographic search algorithm:
- Bounding box calculation
- Database query
- Haversine distance calculation
- Result sorting

## How to View

### Option 1: GitHub (Automatic Rendering)
GitHub automatically renders Mermaid diagrams. Just view the `.mmd` files in the GitHub web interface.

### Option 2: Mermaid Live Editor
1. Go to https://mermaid.live/
2. Copy the contents of any `.mmd` file
3. Paste into the editor
4. View and export as PNG/SVG

### Option 3: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open any `.mmd` file
3. Click "Open Preview" button

### Option 4: Export to PNG/SVG

Using Mermaid CLI:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Export to PNG
mmdc -i architecture.mmd -o architecture.png

# Export to SVG
mmdc -i matching-flow.mmd -o matching-flow.svg

# Export all at once
mmdc -i architecture.mmd -o architecture.png
mmdc -i matching-flow.mmd -o matching-flow.png
mmdc -i database-schema.mmd -o database-schema.png
mmdc -i geographic-matching.mmd -o geographic-matching.png
```

### Option 5: Embed in Markdown

To embed in markdown files:

```markdown
```mermaid
[paste diagram content here]
```
```

## Diagram Updates

To modify diagrams:
1. Edit the `.mmd` file
2. Test in Mermaid Live Editor
3. Commit changes
4. Re-export images if needed

## Mermaid Documentation

- Official Docs: https://mermaid.js.org/
- Flowchart Syntax: https://mermaid.js.org/syntax/flowchart.html
- ER Diagram Syntax: https://mermaid.js.org/syntax/entityRelationshipDiagram.html
