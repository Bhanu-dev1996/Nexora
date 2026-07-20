# AI Features Documentation

## NovaCRM AI — Enterprise AI-Powered CRM Platform

**Version:** 1.0
**Last Updated:** July 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [AI Copilot](#2-ai-copilot)
3. [Smart Search](#3-smart-search)
4. [Email Generator](#4-email-generator)
5. [Proposal Generator](#5-proposal-generator)
6. [Meeting Summary](#6-meeting-summary)
7. [Call Summary](#7-call-summary)
8. [AI Lead Scoring](#8-ai-lead-scoring)
9. [Deal Prediction](#9-deal-prediction)
10. [Next Best Action](#10-next-best-action)
11. [Customer Insights](#11-customer-insights)
12. [Sales Forecast](#12-sales-forecast)
13. [Document Summarization](#13-document-summarization)
14. [AI Chat](#14-ai-chat)
15. [Natural Language Search](#15-natural-language-search)
16. [Model Selection & Costs](#16-model-selection--costs)
17. [Error Handling & Resilience](#17-error-handling--resilience)

---

## 1. Architecture Overview

### AI Service Architecture

~~~
Frontend (React)
  AI Copilot | Smart Search | AI Chat | NLP Search
       |            |            |          |
       v            v            v          v
API Gateway (Express) - POST /api/ai/* - Rate Limit - Auth
       |
       v
AI Orchestration Layer
  [Route Decision Engine]  [Context Builder]  [Prompt Template Store]
       |
       +-- GPT-4: Complex reasoning, sales analysis, code gen
       +-- Gemini: Multimodal, audio transcription, document analysis
       |
       v
Vector Database (pgvector) - Lead, contact, deal embeddings
~~~

### Request Flow

1. User triggers AI feature (chat, generate, search, analyze)
2. Frontend sends request to /api/ai/{feature}
3. Rate limiter checks quota (per user, per org, per model)
4. Auth middleware validates permissions
5. AI Orchestrator receives request, builds context
6. Context Builder fetches relevant CRM data (leads, deals, contacts)
7. Route Decision Engine selects model (GPT-4 or Gemini)
8. Prompt Template Store selects appropriate template
9. LLM call is made with context + prompt
10. Response is parsed, validated, enriched with CRM data
11. Usage is logged (tokens, cost, latency)
12. Response returned to frontend

---

## 2. AI Copilot

### Description

The AI Copilot is a context-aware assistant embedded throughout the NovaCRM interface. It understands the user current screen, recent activity, and CRM data to provide proactive suggestions, answer questions, and execute natural language commands.

### Features

| Feature | Description |
|---------|-------------|
| Context-Aware Help | Understands current page and offers relevant tips |
| Natural Language Commands | "Create a deal for Acme Corp worth $50k" |
| Proactive Suggestions | "This lead has not been contacted in 5 days" |
| Data Q&A | "What is the total pipeline value this quarter?" |
| Quick Actions | "Send follow-up email to John about the proposal" |
| Onboarding Assistant | Guides new users through features and best practices |

### Context Building

The Copilot gathers context from:
- **Current page:** URL, route params, visible data
- **User state:** Role, recent actions, preferences
- **CRM state:** Open deals, pending tasks, overdue leads
- **Time context:** Time of day, day of week, season
- **Org context:** Industry, size, configured integrations

---

## 3. Smart Search

### Description

Smart Search provides a unified search experience across all CRM entities (leads, contacts, companies, deals, emails, notes, documents). It combines traditional full-text search with AI-powered semantic search for highly relevant results.

### Search Types

| Type | Technology | Use Case |
|------|-----------|----------|
| Keyword Search | PostgreSQL tsvector | Exact matches, name lookups |
| Semantic Search | pgvector + embeddings | "Find leads similar to Acme Corp" |
| Hybrid Search | Combined ranking | Default search behavior |
| Fuzzy Search | pg_trgm | Handles typos and partial matches |
| Faceted Search | PostgreSQL filters | "Leads from tech industry, score > 80" |

### Entity Recognition

Smart Search automatically recognizes and categorizes entities in user queries:

| Entity | Examples |
|--------|----------|
| Person | "John Smith", "j.smith@email.com" |
| Company | "Acme Corp", "Microsoft" |
| Deal Stage | "negotiation", "closed won" |
| Date | "this week", "last month", "Q3 2026" |
| Amount | "$50k", "over $100k" |
| Status | "qualified", "new", "lost" |
| Location | "New York", "remote" |

---

## 4. Email Generator

### Description

Generates professional emails for sales communication. Supports template-based generation and AI-powered customization based on context (lead info, deal stage, communication history).

### Generation Modes

| Mode | Description |
|------|-------------|
| Template-Based | Select from pre-approved templates, auto-fill with CRM data |
| AI Generated | GPT-4 creates personalized email from scratch |
| AI Enhanced | User writes draft, AI improves tone/clarity |
| Reply Assistant | Analyzes received email, suggests responses |
| Sequence Builder | Creates multi-step email sequences |

### Tone Customization

| Tone | Use Case |
|------|----------|
| Professional | Initial outreach, formal proposals |
| Friendly | Follow-ups, check-ins |
| Urgent | Limited-time offers, expiring deals |
| Appreciative | Thank-you, post-meeting |
| Persuasive | Sales pitches, feature highlights |
| Concise | Quick updates, confirmations |

---

## 5. Proposal Generator

### Description

Creates professional sales proposals from deal data. Combines pre-built templates with AI-generated content, brand assets, and dynamic pricing tables. Exports to PDF.

### Features

| Feature | Description |
|---------|-------------|
| Template Library | Industry-specific proposal templates |
| Auto-Population | Fills proposal with deal, contact, and product data |
| AI Content Generation | Writes executive summaries, value propositions |
| Pricing Tables | Dynamic pricing based on selected products/services |
| Brand Customization | Company logo, colors, fonts, and styling |
| Approval Workflow | Internal review before sending to client |
| E-Sign Integration | DocuSign/Hellosign from within proposals |
| PDF Export | Downloadable, shareable PDF documents |
| Analytics | Track when client opens proposal |

### Proposal Structure

~~~
COVER PAGE (logo, client name, date)
EXECUTIVE SUMMARY (AI-generated - needs, solution, outcomes)
SCOPE OF WORK (products, deliverables, timeline)
PRICING (line items, discounts, total, payment terms)
TERMS & CONDITIONS
SIGNATURE SECTION
~~~

---

## 6. Meeting Summary

### Description

Automatically transcribes and summarizes meetings. Integrates with Google Calendar and Microsoft Outlook to join meetings, capture audio, and generate structured summaries with action items.

### Pipeline

~~~
Audio Input (meeting recording/real-time)
  |
  v
[Audio Preprocessing] - Noise reduction, speaker diarization
  |
  v
[Speech-to-Text / Gemini] - Real-time transcription, timestamps
  |
  v
[AI Summarization / GPT-4] - Key topics, decisions, action items
  |
  v
[Structured Output] - Meeting note, tasks, deal update, email to attendees
~~~

### Output Structure

The meeting summary includes: title, date, duration, attendee list, full transcript, key topics discussed, decisions made, action items with assignees and due dates, and next steps. All action items are automatically created as tasks in the CRM and linked to related deals and contacts.

---

## 7. Call Summary

### Description

Analyzes recorded sales calls to extract key information. Uses speech-to-text transcription followed by AI analysis to identify talking points, sentiment, objections, and follow-ups.

### Features

| Feature | Description |
|---------|-------------|
| Call Recording | Import call audio files (MP3, WAV, M4A) |
| Transcription | Full transcript with speaker labels |
| Key Points | AI extracts main discussion topics |
| Sentiment Analysis | Customer sentiment throughout call |
| Objection Detection | Identifies and categorizes objections |
| Talk Ratio | Speaker time distribution analysis |
| Follow-ups | Automatically creates tasks from call |
| Scoring | Call quality scoring (manager view) |

---

## 8. AI Lead Scoring

### Description

Machine learning-based lead scoring system that evaluates leads based on engagement, fit, and intent signals. Scores update in real-time as new data arrives.

### Scoring Factors

| Category | Weight | Factors |
|----------|--------|---------|
| Engagement | 35% | Email opens/clicks, website visits, demo requests, content downloads |
| Firmographic Fit | 25% | Industry, company size, revenue, location, job title |
| Behavioral Intent | 25% | Search keywords, competitor research, pricing page visits |
| Timing | 10% | Budget cycle, contract renewal dates, recent funding |
| Relationship | 5% | Existing contact network, past interactions |

### Score Categories

| Score Range | Category | Action |
|-------------|----------|--------|
| 80-100 | Hot | Priority contact, high-intent |
| 60-79 | Warm | Nurture, schedule demo |
| 40-59 | Cool | Automated nurture campaign |
| 20-39 | Cold | Re-engagement campaign |
| 0-19 | Inactive | Archive or remove |

### Real-Time Updates

Lead scores update in real-time based on:
- **Website visits:** Score +5 for pricing page, +3 for features
- **Email engagement:** +2 for open, +5 for click
- **Content download:** +10 for case studies, +15 for whitepapers
- **Demo request:** +30 immediately
- **Negative signals:** -10 for competitor mention, -5 for unsubscribe

---

## 9. Deal Prediction

### Description

Predicts deal outcomes including win probability, expected close date, and risk factors. Uses historical deal data and current deal progression to generate predictions.

### Prediction Outputs

| Prediction | Description |
|-----------|-------------|
| Win Probability | % likelihood of winning the deal |
| Expected Close Date | Estimated date based on deal progression |
| Predicted Value | Expected deal value (accounting for discount probability) |
| Risk Factors | Key risks that could impact the deal |
| Recommendations | Specific actions to improve win likelihood |

### Risk Factor Analysis

Common risk factors detected: competitor involvement, stalled progression (30+ days in same stage), budget concerns, no decision-maker access, and low engagement. Each factor includes severity level and recommended mitigation.

---

## 10. Next Best Action

### Description

AI-powered recommendation engine that suggests the most impactful action for each lead or deal. Recommendations are based on predictive analysis of what actions are most likely to advance the deal.

### Recommendation Categories

| Category | Examples |
|----------|----------|
| Contact | "Call John - no contact in 7 days" |
| Email | "Send proposal follow-up" |
| Task | "Create quote for Acme Corp" |
| Meeting | "Schedule demo with technical team" |
| Content | "Share ROI case study with decision maker" |
| Internal | "Update deal stage to negotiation" |

---

## 11. Customer Insights

### Description

AI-powered customer analytics providing deep insights into customer behavior, churn prediction, lifetime value estimation, and engagement patterns.

### Insight Types

| Insight | Description | Data Sources |
|---------|-------------|--------------|
| Behavioral Analysis | Interaction patterns, feature usage, engagement trends | Activity logs, email events, login frequency |
| Churn Prediction | Likelihood of customer churn within next 90 days | Support tickets, login frequency, NPS scores |
| Lifetime Value | Estimated LTV based on historical and current behavior | Deal value, subscription tier, tenure |
| Health Score | Composite customer health metric | Support satisfaction, product usage, payment history |
| Expansion Opportunity | Recommendations for upselling or cross-selling | Product usage gaps, team growth, feature requests |

### Churn Prediction Signals

Risk signals include: declining login frequency (2+ weeks), reduced feature usage, increased support tickets, dropping NPS score, decreasing email engagement, billing complaints, competitor activity detection, and key user churn.

---

## 12. Sales Forecast

### Description

AI-powered revenue forecasting that predicts future sales based on pipeline data, historical trends, and external factors. Provides actionable insights for quota management and resource planning.

### Forecast Models

| Model | Time Horizon | Use Case |
|-------|-------------|----------|
| Pipeline-based | Current quarter | Weighted pipeline x probability |
| Historical | 4 quarters | Seasonal trend analysis |
| AI-enhanced | 6-12 months | Pattern recognition + external factors |
| Rolling | Ongoing | 90-day forward-looking |

### Forecast Categories

- **Commit:** Deals with 90%+ probability
- **Best Case:** Deals with 50-90% probability
- **Pipeline:** Deals with 25-50% probability
- **Upside:** Deals with <25% probability

---

## 13. Document Summarization

### Description

AI-powered document summarization that extracts key information from long documents including contracts, proposals, emails, and support tickets.

### Supported Documents

| Document Type | Input Format | Output |
|--------------|-------------|--------|
| Contracts | PDF, DOCX | Key terms, obligations, dates |
| Proposals | PDF | Pricing, scope, timeline |
| Emails | HTML, text | Key points, action items |
| Support tickets | Text | Issue summary, resolution |
| Meeting notes | Text | Decisions, action items |

### Summarization Types

| Type | Description | Max Input |
|------|-------------|-----------|
| TL;DR | Single sentence summary | 5 pages |
| Bullet Points | Key points as bullets | 20 pages |
| Structured | Section-by-section summary | 100 pages |
| Q&A | Question-answer format | 50 pages |
| Executive | Executive-level brief | 100 pages |

---

## 14. AI Chat

### Description

Conversational interface that allows users to interact with their CRM data through natural language. Supports complex queries, data manipulation, and workflow execution.

### Chat Capabilities

| Capability | Example |
|-----------|---------|
| Data Queries | "Show me all leads from the tech industry" |
| Data Manipulation | "Update John deal stage to negotiation" |
| Report Generation | "Create a report on Q2 performance by region" |
| Workflow Execution | "Send an email to all warm leads about our webinar" |
| Cross-Reference | "Find contacts who work at companies with deals > $50k" |
| Aggregations | "What is the average deal size this month?" |
| Trend Analysis | "How has our conversion rate changed this quarter?" |

---

## 15. Natural Language Search

### Description

Allows users to ask questions about their CRM data in plain English and receive structured answers. Powered by GPT-4 for query understanding and pgvector for semantic search.

### Query Examples

| User Query | Transformed Intent |
|-----------|-------------------|
| "Who are my top 10 leads?" | SELECT * FROM leads WHERE owner = me ORDER BY score DESC LIMIT 10 |
| "What deals did I close last month?" | SELECT * FROM deals WHERE status = closed_won AND close_date = last_month |
| "Show contacts from companies with deals over $100k" | JOIN contacts + companies + deals WHERE deals.value > 100000 |
| "How many leads came from the website this week?" | SELECT COUNT(*) FROM leads WHERE source = WEBSITE AND created_at >= this_week |
| "Which deals are stuck in negotiation?" | SELECT * FROM deals WHERE stage = negotiation AND updated_at < NOW() - 30 days |

### Query Understanding Pipeline

User query passes through: Entity Extraction (identify entities and attributes), Intent Classification (determine action and filters), SQL Generation (build database query), and Result Formatting (present structured response).

---

## 16. Model Selection & Costs

### Model Routing

| Task | Primary Model | Fallback | Rationale |
|------|--------------|----------|-----------|
| Complex reasoning | GPT-4 | Gemini 1.5 Pro | Superior reasoning and instruction following |
| Sales analysis | GPT-4 | Gemini | Better business context understanding |
| Code generation | GPT-4 | N/A | Best-in-class code generation |
| Multimodal (images) | Gemini 1.5 Pro | GPT-4 Vision | Better vision capabilities |
| Audio transcription | Gemini | Whisper | Native audio support in Gemini |
| Text summarization | GPT-4 Turbo | Gemini 1.5 Flash | Balance of quality and speed |
| Email generation | GPT-4 Turbo | N/A | Professional tone consistency |
| Document analysis | Gemini 1.5 Pro | GPT-4 Turbo | Handles larger context windows |
| Search embeddings | text-embedding-3-small | N/A | Optimized for search use case |

### Cost Management

Token usage is tracked per request including model, prompt tokens, completion tokens, total tokens, cost in USD, userId, organizationId, and feature name. Cost optimization strategies include: model tiering (route simple tasks to cheaper models), caching common queries, setting reasonable max_tokens limits, pruning context to only relevant CRM data, batch processing similar requests, per-user token quotas, and usage alerts.

---

## 17. Error Handling & Resilience

### Error Types

| Error Type | HTTP Status | Handling |
|-----------|-------------|----------|
| Model unavailable | 503 | Retry with fallback model |
| Rate limited | 429 | Retry after exponential backoff delay |
| Context too long | 400 | Truncate context and retry |
| Invalid response | 500 | Retry with temperature=0 |
| Timeout | 504 | Retry with smaller context |
| Token limit | 400 | Split into chunks |
| Content filter | 400 | Rephrase and retry |

### Retry Logic

Retry strategy uses exponential backoff (1s, 2s, 4s, max 10s) with up to 3 attempts. On model service errors (503), the system automatically switches to the fallback model.

### Circuit Breaker

If a model fails 5+ times in 60 seconds, the circuit opens and requests route to the fallback model for 30 seconds. After 30 seconds, a probe request is sent. If successful, the circuit closes. If still failing, the circuit remains open.

### Fallback Chain

Primary (GPT-4) → Fallback (Gemini Pro) → Simple heuristic → Error response

---

*This document is maintained by the NovaCRM AI Team. Last reviewed: July 2026.*
