# VisualProof Studio — LinkedIn Post & AI Prompt Templates

This reference guide contains proven, high-converting templates built on the **SARI Hook Framework** (**S**ituation $\rightarrow$ **A**ction $\rightarrow$ **R**esult $\rightarrow$ **I**nsight).

---

## 1. Web Walkthrough Showcase (For Demos, GIFs & HD Videos)

> **Best Used For:** Feature showcases, UI/UX walk-throughs, micro-interaction demos, product releases.
> **Attachment:** 1:1 Square (1080×1080), 4:5 Portrait (1080×1350), or 1.91:1 Landscape GIF/WebM.

```markdown
Most developer demos on LinkedIn have a credibility problem:

They share a GitHub repo link or a static screenshot and expect people to imagine what the UX feels like.

No cursor path. No interaction latency. No proof of what actually happens when you click.

Here is the authentic walkthrough of [Project Name] in action:

• Situation: [1-sentence problem, e.g., Building complex client-side cryptographic tools usually leads to clunky UI or heavy server dependencies.]
• Action: [2-3 technical steps, e.g., Engineered a headless WebCrypto engine with real-time entropy feedback, one-tap phrase switching, and zero-latency device transfer.]
• Result: [Measurable outcome, e.g., Sub-15ms client execution, air-gapped security, and a 60fps responsive mobile experience.]
• Core Insight: [Give away the technical secret for free, e.g., Running entropy recalculation purely inside a Web Worker prevents UI thread stutter during fast re-renders.]

✨ What you’re seeing in the clip:
1. [Interaction 1, e.g., Real-time entropy computation (~105 bits)]
2. [Interaction 2, e.g., Instant passphrase toggle without layout shift]
3. [Interaction 3, e.g., QR transfer modal for offline device handoff]
4. [Interaction 4, e.g., Responsive mobile thumb-reach navigation]

Try the live build yourself: [Insert Live URL]

Engineers & designers: What’s your preferred approach for handling [specific technical challenge]? Let’s discuss below. 👇

#BuildInPublic #WebDevelopment #FrontendEngineering #NextJS #UIUX #SoftwareEngineering
```

---

## 2. System Architecture Deep Dive (For Animated 2D Flowcharts)

> **Best Used For:** Engineering breakdowns, backend & full-stack pipelines, edge computing, latency optimizations.
> **Attachment:** Flowchart GIF / 1080p WebM (Multicolor or Monochrome Blue).

```markdown
Behind every smooth 60fps user experience is an intentional, low-latency pipeline.

Here is the exact request lifecycle & architecture powering [Project Name]:

[Start Client] ➔ [Edge CDN & WAF] ➔ [API Gateway] ➔ [Distributed Storage & Vault] ➔ [200 OK]

How the pipeline executes:

1️⃣ Client Tier: [e.g., Next.js / React SPA with local cryptographic state]
2️⃣ Edge Layer: [e.g., Global Vercel/Cloudflare CDN with WAF inspection & <5ms rate limiting]
3️⃣ API Gateway: [e.g., Node.js / GraphQL schema synchronization]
4️⃣ Security Vault: [e.g., Air-gapped token verification & Zero-Knowledge validation]
5️⃣ Storage Layer: [e.g., PostgreSQL for ACID persistence + Redis for sub-2ms caching]

💡 Architectural Breakdown (SARI):
• Situation: [e.g., Traditional monolithic backends added 250ms+ latency and single-point-of-failure risks.]
• Action: [e.g., Decoupled computation into edge proxies with asynchronous state synchronization.]
• Result: [e.g., 18ms global roundtrip latency, zero server bottlenecks, and 100% air-gapped client security.]
• The Insight: [e.g., Moving non-sensitive validation logic to the edge eliminates 80% of unnecessary database hits.]

Engineers: How are you balancing edge computation vs. centralized database transactions in your current stack?

Explore the live app: [Insert Live URL]

#SoftwareArchitecture #SystemDesign #EdgeComputing #FullStack #BackendEngineering #DevOps
```

---

## 3. Universal AI Content Generation Prompt Template (For Any Project)

> **How to Use:** Paste this entire prompt into ChatGPT, Claude, Gemini, or VisualProof Studio's Prompt Manager. Fill in the `{PROJECT_NAME}`, `{LIVE_URL}`, and variables to instantly produce a tailored LinkedIn post.

```text
You are a Principal Product Engineer and viral technical LinkedIn copywriter. 
Your goal is to write a high-converting, authoritative LinkedIn post about a software project following the SARI Framework.

### PROJECT VARIABLES
- Project Name: {PROJECT_NAME}
- Live App URL: {LIVE_URL}
- Post Type: {POST_TYPE} (Choose: "Web Walkthrough" OR "Architecture Flowchart")
- Tech Stack: {TECH_STACK} (e.g., Next.js, Node.js, PostgreSQL, TailwindCSS)
- The Specific Problem (Situation): {PROBLEM_STATEMENT}
- What Was Built (Action): {TECHNICAL_ACTIONS}
- The Outcome/Metrics (Result): {MEASURABLE_OUTCOME}
- The Core Free Lesson (Insight): {KEY_TECHNICAL_INSIGHT}

### POST WRITING RULES
1. HOOK: Start with an attention-grabbing, contrarian, or high-friction observation (1-2 lines). Avoid generic openers like "Excited to announce..." or "I am thrilled...".
2. SARI SECTION: Strictly format the core story using bullet points:
   • Situation: [Specific real-world friction]
   • Action: [Exact technical/creative steps taken]
   • Result: [Measurable, tangible outcome]
   • Core Insight: [Give away the technical solution for free right in the text]
3. IF POST TYPE = "Web Walkthrough":
   - Include a numbered list of 3-4 micro-interactions shown in the video clip.
4. IF POST TYPE = "Architecture Flowchart":
   - Include a 4-5 stage pipeline list showing how data flows through the system.
5. TECH STACK: Mention the real technologies ({TECH_STACK}) naturally without buzzword stuffing.
6. CALL TO ACTION: Direct link to {LIVE_URL} + an open-ended technical discussion question for software engineers.
7. HASHTAGS: Exactly 5-6 relevant hashtags (#BuildInPublic, #SoftwareEngineering, etc.).

Generate the complete LinkedIn post now:
```

---

## 4. The SARI Framework Cheat Sheet

| Letter | Stage | Core Question to Answer | Example |
| :---: | :--- | :--- | :--- |
| **S** | **Situation** | What was the broken landscape or real pain point? | *"Most dev showcases are static GitHub links nobody clicks."* |
| **A** | **Action** | What concrete technical or creative steps did you execute? | *"Built a Playwright headless recorder with cursor glide and ripple capture."* |
| **R** | **Result** | What was the tangible, measurable metric or outcome? | *"Synthesized 1080p GIFs under 17 seconds with zero blur."* |
| **I** | **Insight** | Give away the core solution for free right in the text. | *"Client-side entropy calculation eliminates all server latency."* |

---

## 5. Live In-App Access

These templates are also directly loaded inside **VisualProof Studio**:
1. Run `run.bat` to launch the studio locally.
2. In **Step 2 (Caption & Prompts)**, click the **"Prompt Manager"** button.
3. Switch between **Launch Announcement**, **Tech Architecture**, **Building in Public**, and **Feature Demo** to load and edit these templates directly inside the UI.
