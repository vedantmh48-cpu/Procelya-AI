import { useState } from 'react'
import { BookOpen, Zap, Network, PlaySquare, Braces, FolderKanban, Settings, KeyRound, Bell, LayoutDashboard, ChevronRight, Terminal, GitBranch, AlertTriangle, CheckCircle2, MessageSquare, Mail, Phone, HelpCircle, Send, Star, ExternalLink } from 'lucide-react'

const WA_NUMBER = '919028076580'

const Section = ({ id, icon: Icon, color, title, subtitle, children }) => (
  <div className="panel" id={id} style={{ marginBottom: 24 }}>
    <header className="panel-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`stat-icon ${color}`} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} />
        </span>
        <div>
          <div className="eyebrow">{subtitle}</div>
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>
      </div>
    </header>
    <div style={{ padding: '0 20px 20px' }}>{children}</div>
  </div>
)

const Step = ({ n, title, desc }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
    <span style={{ minWidth: 26, height: 26, borderRadius: '50%', background: 'var(--flame)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{n}</span>
    <div><strong style={{ display: 'block', marginBottom: 2 }}>{title}</strong><small style={{ opacity: 0.7 }}>{desc}</small></div>
  </div>
)

const Tag = ({ children, color = 'flame' }) => (
  <span className={`activity-badge ${color}`} style={{ marginRight: 6, marginBottom: 6, display: 'inline-block' }}>{children}</span>
)

const toc = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'builder', label: 'Workflow Builder' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'executions', label: 'Executions' },
  { id: 'functions', label: 'Functions' },
  { id: 'projects', label: 'Projects' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'settings', label: 'Settings' },
  { id: 'step-types', label: 'Step Types' },
  { id: 'input-mapping', label: 'Input Mapping' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'failure-handling', label: 'Failure Handling' },
  { id: 'sse-streaming', label: 'Real-Time Streaming' },
  { id: 'tips', label: 'Tips & Tricks' },
  { id: 'help-feedback', label: 'Help & Feedback' },
  { id: 'contact', label: 'Contact Us' },
]

export default function HowToUseView({ scrollToSection }) {
  const [feedback, setFeedback] = useState({ type: 'bug', message: '', rating: 0, hover: 0 })
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' })
  const [contactSent, setContactSent] = useState(false)

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // auto-scroll if parent passes a section
  useState(() => { if (scrollToSection) setTimeout(() => scrollTo(scrollToSection), 100) }, [scrollToSection])

  const submitFeedback = (e) => {
    e.preventDefault()
    if (!feedback.message.trim()) return
    setFeedbackSent(true)
    setFeedback({ type: 'bug', message: '', rating: 0, hover: 0 })
    setTimeout(() => setFeedbackSent(false), 4000)
  }

  const submitContact = (e) => {
    e.preventDefault()
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) return
    const text = `*Procelya AI Contact*
Name: ${contact.name}
Email: ${contact.email}
Subject: ${contact.subject || 'N/A'}
Message: ${contact.message}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
    setContactSent(true)
    setContact({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setContactSent(false), 4000)
  }

  return (
    <div className="dashboard">
      <div className="dash-head">
        <div>
          <h1>How to Use Procelya AI</h1>
          <p>Complete guide covering every feature of the platform.</p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <header className="panel-head">
          <div><div className="eyebrow">NAVIGATION</div><h2>Table of Contents</h2></div>
        </header>
        <div style={{ padding: '0 20px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {toc.map(({ id, label }) => (
            <button key={id} className="ghost" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }} onClick={() => scrollTo(id)}>
              <ChevronRight size={13} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Section id="getting-started" icon={BookOpen} color="flame" title="Getting Started" subtitle="OVERVIEW">
        <p style={{ marginBottom: 16, opacity: 0.8 }}>Procelya AI turns plain-English business requirements into fully executable, multi-step workflows powered by Google Gemini AI.</p>
        <Step n={1} title="Register & Set Up Your Business" desc="Create an account, then complete the business onboarding (name, industry, size, country)." />
        <Step n={2} title="Open the Workflow Builder" desc="Navigate to Workflow Builder in the sidebar and describe your requirement in plain English." />
        <Step n={3} title="Detect & Accept" desc="Click Detect — the AI generates a structured workflow. Review it, then click Accept to save it to the database." />
        <Step n={4} title="Trigger & Watch" desc="Fill in the trigger payload and click Run. Watch each step execute live via SSE streaming." />
        <Step n={5} title="Explore Other Sections" desc="Use Workflows, Executions, Functions, Projects, API Keys, and Settings to manage everything." />
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <strong>Demo Credentials</strong>
          <pre style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.8 }}>Email: admin@procelya.ai{'\n'}Password: admin123</pre>
        </div>
      </Section>

      {/* Dashboard */}
      <Section id="dashboard" icon={LayoutDashboard} color="blue" title="Dashboard" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>The Dashboard gives you a real-time overview of your entire automation platform.</p>
        <Step n={1} title="Stat Cards" desc="See total workflows, executions, success rate, and average run time at a glance." />
        <Step n={2} title="Execution Trend Chart" desc="Bar chart showing recent workflow executions and their durations." />
        <Step n={3} title="Top Workflows" desc="Lists your most recently created workflows with run counts and success rates." />
        <Step n={4} title="Recent Activity Feed" desc="Live feed of the latest execution events — completed, failed, or running." />
        <Step n={5} title="Quick Shortcuts" desc="One-click buttons to jump to New Workflow, My Workflows, Executions, or API Keys." />
      </Section>

      {/* Workflow Builder */}
      <Section id="builder" icon={Zap} color="flame" title="Workflow Builder" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>The core of Procelya AI — describe a requirement and get a fully structured, executable workflow.</p>
        <Step n={1} title="Describe Your Requirement" desc='Type a plain-English business requirement, e.g. "When an order is placed, notify the vendor, create an invoice, update inventory."' />
        <Step n={2} title="Click Detect" desc="The backend calls Gemini 1.5 Flash (or the rule-based fallback) and returns a structured Workflow IR." />
        <Step n={3} title="Review the Flow Diagram" desc="An interactive React Flow diagram renders all steps, conditions, and connections. Hover nodes for details." />
        <Step n={4} title="AI Edit Panel" desc="Use the AI Edit Panel to refine individual steps using natural language without re-detecting the whole workflow." />
        <Step n={5} title="Accept or Discard" desc="Click Accept to persist the workflow to MongoDB, or Discard to start over." />
        <Step n={6} title="Configure Trigger Payload" desc="Fill in the JSON payload fields that will be passed as trigger data when the workflow runs." />
        <Step n={7} title="Run the Workflow" desc="Click Run — each step executes in real time and results stream back via SSE." />
        <Step n={8} title="Export" desc="Download the workflow as JSON or PDF using the export buttons in the toolbar." />
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <strong>No API Key?</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.75 }}>If <code>AI_API_KEY</code> is not configured in the backend, the platform automatically uses the built-in rule-based workflow detector.</p>
        </div>
      </Section>

      {/* Workflows */}
      <Section id="workflows" icon={Network} color="green" title="Workflows" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Manage all saved workflows in one place.</p>
        <Step n={1} title="Browse Workflows" desc="See all workflows saved to MongoDB with their name, trigger event, step count, and status." />
        <Step n={2} title="Search & Filter" desc="Use the global search bar in the top bar to filter workflows by name or description." />
        <Step n={3} title="View Details" desc="Click any workflow to expand its step list, input mappings, and conditions." />
        <Step n={4} title="Trigger from Here" desc="Run any saved workflow directly from the Workflows view without going back to the Builder." />
        <Step n={5} title="Delete Workflows" desc="Remove workflows you no longer need. This also removes associated execution runs." />
      </Section>

      {/* Executions */}
      <Section id="executions" icon={PlaySquare} color="purple" title="Executions" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Full history of every workflow run with step-level detail.</p>
        <Step n={1} title="Run List" desc="Every execution is listed with its workflow name, status (COMPLETED / FAILED), start time, and total duration." />
        <Step n={2} title="Step Breakdown" desc="Expand any run to see each step's status, duration, input, output, and error (if any)." />
        <Step n={3} title="Status Badges" desc={<><Tag>COMPLETED</Tag><Tag color="failed">FAILED</Tag><Tag color="running">RUNNING</Tag> — color-coded for quick scanning.</>} />
        <Step n={4} title="Re-run" desc="Trigger the same workflow again directly from the execution detail view." />
      </Section>

      {/* Functions */}
      <Section id="functions" icon={Braces} color="blue" title="Functions" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>The Function Registry holds all named functions that workflow steps can call.</p>
        <Step n={1} title="Browse Functions" desc="See all registered functions with their name, description, and expected input/output schema." />
        <Step n={2} title="Function Names in Steps" desc='When a workflow step has actionType "function", it calls a function by name from this registry.' />
        <Step n={3} title="Built-in Functions" desc="Procelya ships with functions like SendEmail, NotifyVendor, GenerateInvoice, UpdateInventory, and more." />
        <Step n={4} title="Safe Execution" desc="All functions run inside a sandboxed handler — no arbitrary code execution on the server." />
      </Section>

      {/* Projects */}
      <Section id="projects" icon={FolderKanban} color="green" title="Projects" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Projects group workflows and provide context to the AI detector.</p>
        <Step n={1} title="Project Context" desc="Each project has a context document (seeded via npm run seed) that tells the AI what schemas, functions, and operations are available." />
        <Step n={2} title="Switch Projects" desc="Use the project switcher in the top bar to change the active project context." />
        <Step n={3} title="Scoped Detection" desc="When you detect a workflow, it is scoped to the active project — the AI only uses that project's registered assets." />
        <Step n={4} title="Manage Projects" desc="Create, rename, or archive projects from the Projects view." />
      </Section>

      {/* Notifications */}
      <Section id="notifications" icon={Bell} color="purple" title="Notifications" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>In-app notification center for system and workflow events.</p>
        <Step n={1} title="Notification Feed" desc="All system alerts, workflow completions, failures, and account events appear here." />
        <Step n={2} title="Mark as Read" desc="Click a notification to mark it read. Use 'Mark All Read' to clear the badge." />
        <Step n={3} title="Notification Types" desc={<><Tag>success</Tag><Tag color="failed">error</Tag><Tag color="running">info</Tag> — each type is color-coded.</>} />
      </Section>

      {/* API Keys */}
      <Section id="api-keys" icon={KeyRound} color="flame" title="API Keys" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Manage access tokens for external integrations.</p>
        <Step n={1} title="Generate a Key" desc="Click 'New API Key', give it a name and optional expiry, and copy the generated token." />
        <Step n={2} title="Scoped Access" desc="Each key can be scoped to specific projects or operations." />
        <Step n={3} title="Revoke Keys" desc="Delete any key instantly to revoke access — useful when rotating credentials." />
        <Step n={4} title="Usage" desc="Pass the key as a Bearer token in the Authorization header when calling the Procelya REST API." />
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <code style={{ fontSize: 12 }}>Authorization: Bearer &lt;your-api-key&gt;</code>
        </div>
      </Section>

      {/* Settings */}
      <Section id="settings" icon={Settings} color="blue" title="Settings" subtitle="SECTION">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Manage your account, business profile, and platform preferences.</p>
        <Step n={1} title="Profile" desc="Update your display name, email, and avatar initials." />
        <Step n={2} title="Business Profile" desc="Edit your business name, industry, size, website, country, and phone number." />
        <Step n={3} title="Change Password" desc="Enter your current password and set a new one (minimum 6 characters)." />
        <Step n={4} title="Theme" desc="Toggle between Dark and Light mode — preference is saved to localStorage." />
        <Step n={5} title="Danger Zone" desc="Delete your account or reset all data from the danger zone section." />
      </Section>

      {/* Step Types */}
      <Section id="step-types" icon={GitBranch} color="green" title="Workflow Step Types" subtitle="REFERENCE">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Every step in a workflow has an <code>actionType</code> that determines how it executes.</p>
        {[
          { type: 'function', desc: 'Calls a named function from the Function Registry (e.g. SendEmail, NotifyVendor).' },
          { type: 'operation', desc: 'Calls a named operation (e.g. UpdateInventory, ProcessPayment) from the Operation Registry.' },
          { type: 'formCreate', desc: 'Creates a new record in a schema (e.g. create an Invoice document in MongoDB).' },
          { type: 'formUpdate', desc: 'Updates an existing record matched by a condition.' },
          { type: 'formDelete', desc: 'Deletes a record matched by a condition.' },
        ].map(({ type, desc }) => (
          <div key={type} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <code style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap' }}>{type}</code>
            <small style={{ opacity: 0.75, paddingTop: 2 }}>{desc}</small>
          </div>
        ))}
      </Section>

      {/* Input Mapping */}
      <Section id="input-mapping" icon={Terminal} color="purple" title="Input Mapping" subtitle="REFERENCE">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Steps can reference data from the trigger payload or previous step outputs using template syntax.</p>
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
          <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7 }}>{`// From trigger payload
"customerId": "{{trigger.customerId}}"

// From a previous step's output
"invoiceId": "{{step-002.invoiceId}}"

// Nested field
"vendorName": "{{trigger.order.vendor_name}}"`}</pre>
        </div>
        <small style={{ opacity: 0.7 }}>The execution engine resolves all <code>{'{{}}'}</code> references before passing inputs to each step.</small>
      </Section>

      {/* Conditions */}
      <Section id="conditions" icon={AlertTriangle} color="flame" title="Conditions" subtitle="REFERENCE">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Steps can have a <code>condition</code> that must pass before the step executes.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {['==', '!=', '>', '<', '>=', '<=', 'contains', 'exists'].map(op => (
            <code key={op} style={{ background: 'var(--surface2)', padding: '3px 10px', borderRadius: 4, fontSize: 13 }}>{op}</code>
          ))}
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '14px 16px' }}>
          <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7 }}>{`"condition": {
  "field": "trigger.payment_status",
  "operator": "==",
  "value": "received"
}`}</pre>
        </div>
      </Section>

      {/* Failure Handling */}
      <Section id="failure-handling" icon={AlertTriangle} color="purple" title="Failure Handling" subtitle="REFERENCE">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Each step defines what happens when it fails via <code>onFailure</code>.</p>
        {[
          { action: 'abort', desc: 'Stop the entire workflow immediately and mark it FAILED.' },
          { action: 'skip', desc: 'Skip this step and continue to the next one.' },
          { action: 'redirect', desc: 'Jump to a specific step by stepId (e.g. an error-handling step).' },
        ].map(({ action, desc }) => (
          <div key={action} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <code style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap' }}>{action}</code>
            <small style={{ opacity: 0.75, paddingTop: 2 }}>{desc}</small>
          </div>
        ))}
      </Section>

      {/* SSE Streaming */}
      <Section id="sse-streaming" icon={CheckCircle2} color="green" title="Real-Time Streaming (SSE)" subtitle="REFERENCE">
        <p style={{ opacity: 0.8, marginBottom: 14 }}>Workflow execution results are streamed live to the UI using Server-Sent Events.</p>
        <Step n={1} title="step_started" desc="Fired when a step begins — the node in the flow diagram turns orange." />
        <Step n={2} title="step_completed" desc="Fired when a step finishes — includes status, duration, input, output, and any error." />
        <Step n={3} title="workflow_completed" desc="Fired when all steps finish — the overall run is marked COMPLETED or FAILED." />
        <Step n={4} title="Execution Log" desc="The live log panel below the diagram shows each event as it arrives with timestamps and expandable I/O." />
        <Step n={5} title="Stop / Pause / Resume" desc="Use the control buttons to stop the SSE stream, pause execution, or resume a paused run." />
      </Section>

      {/* Tips */}
      <Section id="tips" icon={Zap} color="flame" title="Tips & Tricks" subtitle="PRO TIPS">
        {[
          'Use specific, action-oriented language in your requirement — "notify", "create", "update", "send" — for better AI detection.',
          'If detection produces unexpected steps, use the AI Edit Panel to refine individual steps without re-running detection.',
          'The rule-based fallback works offline — no Gemini API key needed for basic workflows.',
          'Export workflows as JSON to version-control them in Git alongside your codebase.',
          'Use the PDF export to share workflow documentation with non-technical stakeholders.',
          'Seed the backend with npm run seed to populate sample project context before your first detection.',
          'The trigger payload editor accepts any JSON — match the field names your workflow steps reference via {{trigger.*}}.',
          'Check the Executions view after every run to inspect step-level I/O and debug failures.',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Zap size={14} style={{ color: 'var(--flame)', marginTop: 2, flexShrink: 0 }} />
            <small style={{ opacity: 0.8, lineHeight: 1.6 }}>{tip}</small>
          </div>
        ))}
      </Section>

      {/* Help & Feedback */}
      <Section id="help-feedback" icon={HelpCircle} color="blue" title="Help & Feedback" subtitle="SUPPORT">
        <p style={{ opacity: 0.8, marginBottom: 20 }}>Found a bug, have a suggestion, or want to rate your experience? Let us know below.</p>

        {/* FAQ */}
        <div style={{ marginBottom: 24 }}>
          <strong style={{ display: 'block', marginBottom: 12 }}>Frequently Asked Questions</strong>
          {[
            { q: 'Why is workflow detection returning unexpected steps?', a: 'Try rephrasing your requirement with more specific action verbs. Use the AI Edit Panel to refine individual steps after detection.' },
            { q: 'The backend is offline — can I still use the platform?', a: 'Yes. The demo mode uses a built-in rule-based detector and local state. No backend is required for basic exploration.' },
            { q: 'How do I add my own functions to the registry?', a: 'Edit functionRegistry.js in the backend engine folder and register your handler. Restart the server to pick up changes.' },
            { q: 'Can I export and re-import workflows?', a: 'You can export as JSON and manually POST it to /api/workflow/create. A UI import feature is on the roadmap.' },
            { q: 'Why does SSE streaming stop mid-run?', a: 'Check your network connection and ensure the backend is running. The Stop button also closes the SSE stream intentionally.' },
            { q: 'How do I reset the demo data?', a: 'Use the project switcher → Reset option in the top bar, or clear localStorage in your browser DevTools.' },
          ].map(({ q, a }, i) => (
            <details key={i} style={{ marginBottom: 10, background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{q}</summary>
              <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>{a}</p>
            </details>
          ))}
        </div>

        {/* Resources */}
        <div style={{ marginBottom: 24 }}>
          <strong style={{ display: 'block', marginBottom: 12 }}>Resources</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'GitHub Repository', href: 'https://github.com/vedantmh48-cpu/Procelya-AI', icon: ExternalLink },
              { label: 'Live Demo', href: 'https://vedantmh48-cpu.github.io/Procelya-AI/', icon: ExternalLink },
              { label: 'Gemini AI Docs', href: 'https://ai.google.dev/', icon: ExternalLink },
              { label: 'React Flow Docs', href: 'https://reactflow.dev/', icon: ExternalLink },
            ].map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--surface2)', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: 'inherit' }}>
                <Icon size={13} />{label}
              </a>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <strong style={{ display: 'block', marginBottom: 12 }}>Submit Feedback</strong>
        {feedbackSent
          ? <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--green, #22c55e)', marginBottom: 6 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Thanks for your feedback!</p>
            </div>
          : <form onSubmit={submitFeedback}>
              {/* Type */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {['bug', 'suggestion', 'praise', 'other'].map(t => (
                  <button type="button" key={t}
                    className={feedback.type === t ? 'flame-btn' : 'ghost'}
                    style={{ fontSize: 12, padding: '5px 14px', textTransform: 'capitalize' }}
                    onClick={() => setFeedback(f => ({ ...f, type: t }))}>
                    {t}
                  </button>
                ))}
              </div>
              {/* Star Rating */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={22}
                    fill={(feedback.hover || feedback.rating) >= s ? 'var(--flame)' : 'none'}
                    stroke={(feedback.hover || feedback.rating) >= s ? 'var(--flame)' : 'currentColor'}
                    style={{ cursor: 'pointer', opacity: 0.85 }}
                    onMouseEnter={() => setFeedback(f => ({ ...f, hover: s }))}
                    onMouseLeave={() => setFeedback(f => ({ ...f, hover: 0 }))}
                    onClick={() => setFeedback(f => ({ ...f, rating: s }))}
                  />
                ))}
                <small style={{ marginLeft: 8, opacity: 0.6, alignSelf: 'center' }}>
                  {feedback.rating ? ['','Poor','Fair','Good','Great','Excellent'][feedback.rating] : 'Rate your experience'}
                </small>
              </div>
              <textarea
                rows={4}
                placeholder="Describe your feedback, bug, or suggestion..."
                value={feedback.message}
                onChange={e => setFeedback(f => ({ ...f, message: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'inherit', fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <button type="submit" className="flame-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14}/>Submit Feedback
              </button>
            </form>
        }
      </Section>

      {/* Contact Us */}
      <Section id="contact" icon={Mail} color="green" title="Contact Us" subtitle="GET IN TOUCH">
        <p style={{ opacity: 0.8, marginBottom: 20 }}>Have a question, partnership inquiry, or need enterprise support? Reach out directly.</p>

        {/* Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: Mail, label: 'Email', value: 'procelyaai@gmail.com', href: 'mailto:procelyaai@gmail.com', color: 'var(--flame)' },
            { icon: Phone, label: 'Phone', value: '+91 90280 76580', href: 'tel:+919028076580', color: '#22c55e' },
            { icon: MessageSquare, label: 'GitHub Issues', value: 'Open an issue', href: 'https://github.com/vedantmh48-cpu/Procelya-AI/issues', color: '#6366f1' },
          ].map(({ icon: Icon, label, value, href, color }) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 36, height: 36, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color }} />
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: 13 }}>{label}</strong>
                {href
                  ? <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 12, opacity: 0.75, color: 'inherit' }}>{value}</a>
                  : <small style={{ opacity: 0.75 }}>{value}</small>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <strong style={{ display: 'block', marginBottom: 12 }}>Send a Message</strong>
        {contactSent
          ? <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--green, #22c55e)', marginBottom: 6 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Message received! We'll get back to you within 24 hours.</p>
            </div>
          : <form onSubmit={submitContact}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input
                  placeholder="Your name"
                  value={contact.name}
                  onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'inherit', fontSize: 13 }}
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={contact.email}
                  onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'inherit', fontSize: 13 }}
                />
              </div>
              <input
                placeholder="Subject"
                value={contact.subject}
                onChange={e => setContact(c => ({ ...c, subject: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'inherit', fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <textarea
                rows={4}
                placeholder="Your message..."
                value={contact.message}
                onChange={e => setContact(c => ({ ...c, message: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'inherit', fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
              />
              <button type="submit" className="flame-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14}/>Send Message
              </button>
            </form>
        }
      </Section>
    </div>
  )
}
