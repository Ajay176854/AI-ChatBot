'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ChatBot.module.css';

const PURPOSE_OPTIONS = [
  { id: 'services', label: 'Explore Services', icon: '💼' },
  { id: 'career',   label: 'Career Opportunities', icon: '🚀' },
];

const SERVICES = [
  { id: 'ai-chatbot',   label: 'AI Chatbot Development',  icon: '🤖' },
  { id: 'web-dev',      label: 'Web Development',          icon: '🌐' },
  { id: 'ai-product',   label: 'AI Product Development',   icon: '🧠' },
  { id: 'ai-marketing', label: 'AI Digital Marketing',     icon: '📈' },
];

const EMPLOYEE_OPTIONS = [
  { id: 'micro',     label: '1 – 10',     desc: 'Micro / Startup',       icon: '🌱' },
  { id: 'small',     label: '10 – 50',    desc: 'Small Business',         icon: '🏢' },
  { id: 'medium',    label: '50 – 100',   desc: 'Growing Company',        icon: '📊' },
  { id: 'mid-large', label: '100 – 500',  desc: 'Mid-size Enterprise',    icon: '🏗️' },
  { id: 'large',     label: '500+',       desc: 'Large Enterprise',       icon: '🌐' },
];

const BASE_PACKAGES = {
  'AI Chatbot Development': [
    { tier: 'Starter',      color: '#22d3ee', basePrice: 75000,  features: ['Rule-based chatbot (up to 10 flows)', 'Web widget + WhatsApp integration', 'Basic NLP intent recognition', 'Admin panel (read-only)', '1 month post-launch support'] },
    { tier: 'Professional', color: '#a78bfa', basePrice: 160000, popular: true, features: ['AI-powered NLP chatbot (unlimited flows)', 'Multi-channel: Web, WhatsApp, Messenger', 'CRM / Lead management integration', 'Analytics & conversation insights', 'Custom branding & UI', '3 months post-launch support'] },
    { tier: 'Enterprise',   color: '#f472b6', basePrice: 310000, features: ['GPT-4 / Custom LLM integration', 'Voice + Text multi-modal chatbot', 'Enterprise CRM & ERP integration', 'White-label solution', 'Dedicated account manager', 'SLA-backed 24/7 support (6 months)'] },
  ],
  'Web Development': [
    { tier: 'Starter',      color: '#22d3ee', basePrice: 50000,  features: ['Up to 5-page responsive website', 'Mobile-first design', 'Basic SEO setup', 'Contact form integration', '1 month support'] },
    { tier: 'Professional', color: '#a78bfa', basePrice: 120000, popular: true, features: ['Full custom web application', 'Admin dashboard & CMS', 'REST API & database integration', 'Payment gateway integration', 'Advanced SEO & analytics', '3 months support'] },
    { tier: 'Enterprise',   color: '#f472b6', basePrice: 250000, features: ['Enterprise-grade architecture', 'Microservices & cloud deployment', 'Multi-tenant SaaS platform', 'CI/CD pipeline setup', 'Security audit & compliance', '6 months SLA support'] },
  ],
  'AI Product Development': [
    { tier: 'Starter',      color: '#22d3ee', basePrice: 120000, features: ['MVP AI product (1 core feature)', 'Pre-trained model integration', 'Basic data pipeline', 'Simple API layer', '1 month support'] },
    { tier: 'Professional', color: '#a78bfa', basePrice: 280000, popular: true, features: ['Full AI product with custom model', 'MLOps pipeline & monitoring', 'Data collection & labeling toolkit', 'User-facing SaaS UI', 'Cloud deployment (AWS/GCP)', '3 months support'] },
    { tier: 'Enterprise',   color: '#f472b6', basePrice: 550000, features: ['End-to-end AI platform', 'Custom LLM / Foundational model training', 'Advanced MLOps & auto-retraining', 'Enterprise security & compliance', 'Dedicated AI engineer team', '6 months SLA support'] },
  ],
  'AI Digital Marketing': [
    { tier: 'Starter',      color: '#22d3ee', basePrice: 35000,  features: ['AI-powered SEO audit & strategy', 'Social media content calendar', 'Basic ad campaign setup', 'Monthly performance report', '1 month engagement'] },
    { tier: 'Professional', color: '#a78bfa', basePrice: 80000,  popular: true, features: ['Full AI content marketing strategy', 'Automated ad campaign management', 'Email marketing automation', 'Competitor tracking & insights', 'Bi-weekly strategy calls', '3 months engagement'] },
    { tier: 'Enterprise',   color: '#f472b6', basePrice: 180000, features: ['360° AI digital marketing suite', 'Predictive analytics & audience targeting', 'AI-generated content at scale', 'Cross-platform brand management', 'Dedicated marketing team', '6 months engagement + CRO'] },
  ],
};

const EMPLOYEE_MULTIPLIERS = { '1 – 10': 1.0, '10 – 50': 1.2, '50 – 100': 1.5, '100 – 500': 1.8, '500+': 2.3 };

function computePackages(service, employeeLabel) {
  const base = BASE_PACKAGES[service] || BASE_PACKAGES['Web Development'];
  const mult = EMPLOYEE_MULTIPLIERS[employeeLabel] || 1.0;
  return base.map((pkg) => ({
    ...pkg,
    price: Math.round(pkg.basePrice * mult),
    gst:   Math.round(pkg.basePrice * mult * 0.18),
    total: Math.round(pkg.basePrice * mult * 1.18),
  }));
}

// ── Flow Steps Framework ──
const INITIAL_STEPS = [
  { id: 'name',    question: "Hi there! 👋 I'm your AI assistant. To get started, could you please tell me your **full name**?", type: 'text', placeholder: 'John Doe', validation: (v) => v.trim().length > 1 },
  { id: 'purpose', question: "Nice to meet you, {name}! 😊 How can we help you today?", type: 'select-purpose' }
];

const SERVICE_STEPS = [
  { id: 'email',     question: "Great choice! What's the best **email address** where we can send your tailored proposal?",              type: 'email',            placeholder: 'john@company.com', validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { id: 'phone',     question: "Perfect! And your **phone number**? We may reach out for a quick discovery call.",                               type: 'tel',              placeholder: '+91 98765 43210',  validation: (v) => v.replace(/\D/g, '').length >= 7 },
  { id: 'company',   question: "Almost there! What is the name of your **company or organisation**?",                                            type: 'text',             placeholder: 'Acme Corp',        validation: (v) => v.trim().length > 1 },
  { id: 'employees', question: "Great! How many **employees** does {company} have? This helps us choose the right plan for your scale.",      type: 'select-employees', placeholder: '',                validation: (v) => v.length > 1 },
  { id: 'service',   question: "Excellent! Which of our **services** are you most interested in? Please select one below.",                       type: 'select-service',   placeholder: '',                 validation: (v) => v.length > 1 },
  { id: 'budget',    question: "Based on your scale, here are our **tailored packages** for {service}. Choose the one that best fits your needs!", type: 'select-budget',    placeholder: '',                 validation: (v) => v.length > 1 },
];

const CAREER_STEPS = [
  { id: 'email',     question: "We are always looking for great talent! 🌟 Please share your **email address**.", type: 'email',  placeholder: 'you@example.com', validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { id: 'resume',    question: "Awesome! Please **upload your resume** below (PDF/DOCX).",                                        type: 'upload', placeholder: '' }
];

function parseMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export default function ChatBot() {
  const [activeSteps, setActiveSteps]         = useState(INITIAL_STEPS);
  const [messages, setMessages]               = useState([]);
  const [currentStep, setCurrentStep]         = useState(0);
  const [input, setInput]                     = useState('');
  const [leadData, setLeadData]               = useState({});
  const [isTyping, setIsTyping]               = useState(false);
  const [inputError, setInputError]           = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [isDone, setIsDone]                   = useState(false);
  const [previewLinks, setPreviewLinks]       = useState(null);
  const [computedPackages, setComputedPackages] = useState([]);
  const [flowType, setFlowType]               = useState(null); // 'services' or 'career'
  
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const fileInputRef   = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 150);
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, computedPackages, isDone, activeSteps, currentStep]);

  // Kick off conversation
  useEffect(() => { setTimeout(() => addBotMessage(INITIAL_STEPS[0].question, {}), 600); }, []);

  function personalise(text, data) {
    return text
      .replace(/{name}/g,    data.name    || 'you')
      .replace(/{company}/g, data.company || 'your company')
      .replace(/{service}/g, data.service || 'the selected service');
  }

  function addBotMessage(text, data) {
    setIsTyping(true);
    const delay = Math.min(800 + text.length * 12, 2200);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text: personalise(text, data), id: Date.now() }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, delay);
  }

  function addUserMessage(text) {
    setMessages((prev) => [...prev, { role: 'user', text, id: Date.now() }]);
  }

  function proceedAfterStep(stepIdx, newData, stepsArray = activeSteps) {
    const nextStep = stepIdx + 1;
    if (nextStep < stepsArray.length) {
      setCurrentStep(nextStep);
      // Precompute packages if next step is budget
      if (stepsArray[nextStep].id === 'budget' && newData.service && newData.employees) {
        setComputedPackages(computePackages(newData.service, newData.employees));
      }
      addBotMessage(stepsArray[nextStep].question, newData);
    } else {
      // Reached the end of the current flow
      setCurrentStep(stepsArray.length);
      
      if (flowType === 'services') {
        addBotMessage("🎉 Fantastic! I have everything I need. Give me a moment while I **generate your personalized proposal** and send it to your email...", newData);
        setTimeout(() => submitProposal(newData), 2500);
      } else if (flowType === 'career') {
        addBotMessage("✅ **Resume received!** Our HR team will review it and update you soon. Best of luck!", newData);
        setIsDone(true);
      }
    }
  }

  // ── Select Handlers ──────────────────────────────────────────────────
  function handlePurposeSelect(action) {
    addUserMessage(`${action.icon} ${action.label}`);
    const newData = { ...leadData, purpose: action.id };
    setLeadData(newData);
    setFlowType(action.id);
    
    let newSteps = [];
    if (action.id === 'services') {
      newSteps = [...INITIAL_STEPS, ...SERVICE_STEPS];
    } else {
      newSteps = [...INITIAL_STEPS, ...CAREER_STEPS];
    }
    
    setActiveSteps(newSteps);
    proceedAfterStep(currentStep, newData, newSteps);
  }

  function handleEmployeeSelect(opt) {
    addUserMessage(`${opt.icon} ${opt.label} employees (${opt.desc})`);
    const newData = { ...leadData, employees: opt.label };
    setLeadData(newData);
    proceedAfterStep(currentStep, newData);
  }

  function handleServiceSelect(svc) {
    addUserMessage(`${svc.icon} ${svc.label}`);
    const newData = { ...leadData, service: svc.label };
    setLeadData(newData);
    proceedAfterStep(currentStep, newData);
  }

  function handleBudgetSelect(pkg) {
    addUserMessage(`✅ ${pkg.tier} Plan — ₹${pkg.total.toLocaleString('en-IN')} (incl. GST)`);
    const newData = { ...leadData, selectedPackage: pkg };
    setLeadData(newData);
    proceedAfterStep(currentStep, newData);
  }
  
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    addUserMessage(`📄 ${file.name}`);
    const newData = { ...leadData, resumeFileName: file.name };
    setLeadData(newData);
    proceedAfterStep(currentStep, newData);
  }

  // ── Text input submit ─────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    const step = activeSteps[currentStep];
    const nonTextTypes = ['select-purpose', 'select-employees', 'select-service', 'select-budget', 'upload'];
    if (nonTextTypes.includes(step?.type)) return;
    
    const val = input.trim();
    if (step.validation && !step.validation(val)) { 
      setInputError(getErrorMsg(step.id)); 
      return; 
    }
    
    setInputError('');
    addUserMessage(val);
    const newData = { ...leadData, [step.id]: val };
    setLeadData(newData);
    setInput('');
    proceedAfterStep(currentStep, newData);
  }

  function getErrorMsg(stepId) {
    const msgs = { name: 'Please enter a valid name.', email: 'Please enter a valid email address.', phone: 'Please enter a valid phone number.', company: 'Please enter your company or organisation name.' };
    return msgs[stepId] || 'Invalid input.';
  }

  // ── API Submission ────────────────────────────────────────────────────
  async function submitProposal(data) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setPreviewLinks(result.preview);
        addBotMessage(`✅ Your proposal has been sent! Check your inbox at **${data.email}**. Our sales team will follow up within 24 business hours. Thank you, ${data.name}!`, data);
      } else {
        addBotMessage(`⚠️ Hiccup: ${result.error}. Please try again or contact us directly.`, data);
      }
    } catch {
      addBotMessage('⚠️ Something went wrong. Please try again shortly.', data);
    } finally {
      setIsSubmitting(false);
      setIsDone(true);
    }
  }

  function restartChat() {
    setMessages([]); setCurrentStep(0); setLeadData({}); setInput(''); setFlowType(null);
    setActiveSteps(INITIAL_STEPS);
    setInputError(''); setIsSubmitting(false); setIsDone(false);
    setPreviewLinks(null); setComputedPackages([]);
    setTimeout(() => addBotMessage(INITIAL_STEPS[0].question, {}), 400);
  }

  const currentStepData = activeSteps[currentStep];
  const progressPercent = Math.min((currentStep / activeSteps.length) * 100, 100);
  const isSelectStep    = ['select-purpose', 'select-employees', 'select-service', 'select-budget', 'upload'].includes(currentStepData?.type);

  return (
    <div className={styles.page}>
      <div className={styles.orb1} /><div className={styles.orb2} /><div className={styles.orb3} />

      <div className={styles.wrapper}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>⚡</div>
              <div className={styles.onlineDot} />
            </div>
            <div>
              <div className={styles.botName}>AI Sales Suite</div>
              <div className={styles.botStatus}>{isTyping ? 'Typing...' : isSubmitting ? 'Generating proposal...' : 'Online'}</div>
            </div>
          </div>
          <div className={styles.headerServices}>
            {SERVICES.map((s) => <span key={s.id} className={styles.servicePill} title={s.label}>{s.icon}</span>)}
          </div>
        </header>

        {/* ── Progress ── */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.progressLabel}>{isDone ? 'Completed ✓' : `Step ${Math.min(currentStep + 1, activeSteps.length)} of ${activeSteps.length}`}</div>

        {/* ── Messages ── */}
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.msgRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}>
              {msg.role === 'bot' && <div className={styles.msgAvatar}>⚡</div>}
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className={`${styles.msgRow} ${styles.botRow}`}>
              <div className={styles.msgAvatar}>⚡</div>
              <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
              </div>
            </div>
          )}

          {/* Purpose selection */}
          {!isTyping && currentStepData?.type === 'select-purpose' && currentStep < activeSteps.length && (
            <div className={styles.serviceGrid}>
              {PURPOSE_OPTIONS.map((action) => (
                <button key={action.id} className={styles.serviceCard} onClick={() => handlePurposeSelect(action)}>
                  <span className={styles.serviceIcon}>{action.icon}</span>
                  <span className={styles.serviceLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Employee count selection */}
          {!isTyping && currentStepData?.type === 'select-employees' && currentStep < activeSteps.length && (
            <div className={styles.employeeGrid}>
              {EMPLOYEE_OPTIONS.map((opt) => (
                <button key={opt.id} className={styles.employeeCard} onClick={() => handleEmployeeSelect(opt)}>
                  <span className={styles.employeeIcon}>{opt.icon}</span>
                  <span className={styles.employeeCount}>{opt.label}</span>
                  <span className={styles.employeeDesc}>{opt.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Service selection */}
          {!isTyping && currentStepData?.type === 'select-service' && currentStep < activeSteps.length && (
            <div className={styles.serviceGrid}>
              {SERVICES.map((svc) => (
                <button key={svc.id} className={styles.serviceCard} onClick={() => handleServiceSelect(svc)}>
                  <span className={styles.serviceIcon}>{svc.icon}</span>
                  <span className={styles.serviceLabel}>{svc.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Budget packages */}
          {!isTyping && currentStepData?.type === 'select-budget' && currentStep < activeSteps.length && computedPackages.length > 0 && (
            <div className={styles.budgetGrid}>
              {computedPackages.map((pkg) => (
                <button key={pkg.tier} className={`${styles.budgetCard} ${pkg.popular ? styles.budgetPopular : ''}`} onClick={() => handleBudgetSelect(pkg)}>
                  {pkg.popular && <div className={styles.popularBadge}>⭐ Most Popular</div>}
                  <div className={styles.budgetTier} style={{ color: pkg.color }}>{pkg.tier}</div>
                  <div className={styles.budgetPrice}>₹{pkg.total.toLocaleString('en-IN')}</div>
                  <div className={styles.budgetPriceSub}>incl. 18% GST · ₹{pkg.price.toLocaleString('en-IN')} + ₹{pkg.gst.toLocaleString('en-IN')}</div>
                  <div className={styles.budgetDivider} style={{ background: `linear-gradient(90deg, ${pkg.color}, transparent)` }} />
                  <ul className={styles.budgetFeatures}>
                    {pkg.features.map((f, i) => (
                      <li key={i} className={styles.budgetFeatureItem}><span className={styles.checkIcon} style={{ color: pkg.color }}>✓</span> {f}</li>
                    ))}
                  </ul>
                  <div className={styles.budgetSelectBtn} style={{ borderColor: pkg.color, color: pkg.color }}>Select {pkg.tier} →</div>
                </button>
              ))}
            </div>
          )}
          
          {/* File Upload (Resume) */}
          {!isTyping && currentStepData?.type === 'upload' && currentStep < activeSteps.length && (
            <div className={styles.uploadArea}>
              <input type="file" id="resume-upload" className={styles.fileInputHidden} onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
              <label htmlFor="resume-upload" className={styles.uploadCard}>
                <span className={styles.uploadIcon}>📎</span>
                <span className={styles.uploadTitle}>Click to Attach Resume</span>
                <span className={styles.uploadDesc}>Supports PDF, DOCX (Max 5MB)</span>
              </label>
            </div>
          )}

          {/* Dev email preview links */}
          {previewLinks && (previewLinks.clientEmail || previewLinks.salesEmail) && (
            <div className={styles.previewBox}>
              <p className={styles.previewTitle}>🔗 Dev Email Previews (Ethereal)</p>
              {previewLinks.clientEmail && <a href={previewLinks.clientEmail} target="_blank" rel="noreferrer" className={styles.previewLink}>View Client Email →</a>}
              {previewLinks.salesEmail  && <a href={previewLinks.salesEmail}  target="_blank" rel="noreferrer" className={styles.previewLink}>View Sales Team Email →</a>}
            </div>
          )}

          {isDone && (
            <div className={styles.finalActionsGrid}>
              <button className={styles.actionBtnOutline} onClick={restartChat}>
                 ↺ Main Menu
              </button>
              <a href="https://aisalessuite.com" target="_blank" rel="noopener noreferrer" className={styles.actionBtnSolid}>
                 Visit Website
              </a>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Text input (hidden on select steps) ── */}
        {!isSelectStep && !isDone && (
          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <div className={styles.inputWrap}>
              <input
                ref={inputRef}
                id={`chat-input-${currentStepData?.id}`}
                type={currentStepData?.type === 'text' || currentStepData?.type === 'tel' || currentStepData?.type === 'email' ? currentStepData.type : 'text'}
                value={input}
                onChange={(e) => { setInput(e.target.value); setInputError(''); }}
                placeholder={currentStepData?.placeholder || 'Type here...'}
                className={`${styles.input} ${inputError ? styles.inputErr : ''}`}
                disabled={isTyping || isSubmitting}
                autoComplete="off"
              />
              {inputError && <div className={styles.errorMsg}>{inputError}</div>}
            </div>
            <button type="submit" id="chat-send-btn" className={styles.sendBtn} disabled={isTyping || isSubmitting || !input.trim()}>
              {isSubmitting ? <span className={styles.spinner} /> : '➤'}
            </button>
          </form>
        )}

        {isSubmitting && (
          <div className={styles.submittingBanner}>
            <span className={styles.spinner} /> Generating PDF & sending emails...
          </div>
        )}
      </div>
    </div>
  );
}
