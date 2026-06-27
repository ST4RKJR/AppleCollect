# Claw - Product Feedback to PRD AI Agent

Claw is an autonomous AI agent that ingests raw product feedback (text or CSV), categorizes it (Bug, Feature Request, Complaint, Praise), groups similar items, assigns priority, and synthesizes a structured Product Requirements Document (PRD).

If the agent has low confidence in categorizing an item, it flags it for human review.

This project was built as an internship assignment for Eko.

## Features
- **CSV & Text Ingestion**: Easily paste feedback or upload CSV files.
- **Autonomous Reasoning**: Uses LLM logic to classify, group, and prioritize.
- **Metrics Dashboard**: Displays total items, bug counts, feature requests, etc.
- **Human-in-the-loop**: Flags ambiguous feedback for manual review.
- **PRD Generation**: One-click PRD synthesis based on aggregated insights.
- **Modern, Sleek UI**: Built with React and a custom glassmorphic dark theme.

## Folder Structure
- `/frontend`: React application (Vite)
- `/backend`: Node.js + Express application

## Prerequisites
- Node.js (v16 or higher)
- npm

## Setup & Running Locally

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd claw/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Add your Gemini API key:
   - Open `backend/.env`
   - Set `GEMINI_API_KEY=your_api_key_here`
   - *Note: If no API key is provided, the backend will safely fallback to using mock AI responses so you can still test the UI flow.*
4. Start the server:
   ```bash
   node src/index.js
   ```
   The backend will run on `http://localhost:3001`

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd claw/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL (usually `http://localhost:5173`) in your browser.

## Tech Stack
- **Frontend**: React, Vite, Lucide React (Icons), Vanilla CSS
- **Backend**: Node.js, Express, Multer, @google/genai
