import React, { useState } from "react";
import ChatWidget from "./components/ChatWidget.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  const [lead, setLead] = useState(null);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brandMark}>S</div>
          <div>
            <h1 style={styles.h1}>Saarthi</h1>
            <p style={styles.tagline}>AI onboarding concierge, built for SBI</p>
          </div>
          <div style={styles.eventBadge}>SBI Hackathon 2026</div>
        </div>
      </header>

      <main style={styles.main}>
        <ChatWidget onLeadUpdate={setLead} />
        <Dashboard lead={lead} />
      </main>

      <footer style={styles.footer}>
        Prototype for Global Fintech Fest 2026 — Customer Acquisition, Agentic AI &amp; Emerging Tech
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--color-paper)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1px solid var(--color-border)",
    background: "var(--color-surface)",
  },
  headerInner: {
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandMark: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-navy)",
    color: "var(--color-gold-soft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: 600,
  },
  h1: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: "22px",
    fontWeight: 600,
    color: "var(--color-navy-deep)",
    letterSpacing: "0.2px",
  },
  tagline: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    color: "var(--color-slate)",
  },
  eventBadge: {
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.3px",
    color: "var(--color-navy)",
    background: "var(--color-cold-soft)",
    border: "1px solid var(--color-border)",
    padding: "6px 12px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },
  main: {
    flex: 1,
    maxWidth: "1080px",
    width: "100%",
    margin: "0 auto",
    padding: "32px 24px 48px",
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--color-slate-light)",
    padding: "18px 24px 28px",
  },
};