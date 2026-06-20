import React, { useState, useEffect, useRef } from "react";
import { startLead, sendChatMessage } from "../api/chatApi.js";

export default function ChatWidget({ onLeadUpdate }) {
  const [leadId, setLeadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Start a fresh lead/session on mount
    async function init() {
      try {
        const { leadId, lead } = await startLead();
        setLeadId(leadId);
        if (onLeadUpdate) onLeadUpdate(lead);
        setMessages([
          {
            role: "model",
            text: "Hi, I'm Saarthi. If you're already an SBI customer, share your customer ID (e.g. SBI1001) and I'll personalise things for you. Otherwise, just tell me — are you looking to save, invest, borrow, or protect something important?",
          },
        ]);
      } catch (err) {
        setConnectionError(true);
        setMessages([
          {
            role: "model",
            text: "I couldn't reach the server just now. Please make sure the backend is running on port 5000, then refresh this page.",
          },
        ]);
      }
    }
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-grow the textarea up to a max height, purely presentational
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  async function handleSend() {
    if (!input.trim() || !leadId || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const { reply, lead } = await sendChatMessage(leadId, userText);
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
      if (onLeadUpdate) onLeadUpdate(lead);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Something went wrong on that last message. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = input.trim().length > 0 && leadId && !loading;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>S</div>
          <span
            style={{
              ...styles.statusDot,
              background: connectionError ? "var(--color-danger)" : "var(--color-success)",
            }}
            aria-hidden="true"
          />
        </div>
        <div>
          <div style={styles.title}>Saarthi</div>
          <div style={styles.subtitle}>
            {connectionError ? "Disconnected" : "AI onboarding concierge"}
          </div>
        </div>
      </div>

      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubbleRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.botBubble),
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.bubbleRow}>
            <div style={{ ...styles.bubble, ...styles.botBubble, ...styles.typingBubble }}>
              <span style={styles.typingDot} />
              <span style={{ ...styles.typingDot, animationDelay: "0.15s" }} />
              <span style={{ ...styles.typingDot, animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          rows={1}
          disabled={connectionError}
        />
        <button
          style={{
            ...styles.sendBtn,
            ...(canSend ? {} : styles.sendBtnDisabled),
          }}
          onClick={handleSend}
          disabled={!canSend}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes saarthiTypingPulse {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "620px",
    width: "100%",
    maxWidth: "480px",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    fontFamily: "var(--font-body)",
    boxShadow: "var(--shadow-lifted)",
    background: "var(--color-surface)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 18px",
    background: "var(--color-navy)",
    color: "#fff",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-gold)",
    color: "var(--color-navy-deep)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "16px",
  },
  statusDot: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "2px solid var(--color-navy)",
  },
  title: { fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "16px" },
  subtitle: { fontSize: "12px", opacity: 0.75, marginTop: "1px" },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "var(--color-paper)",
  },
  bubbleRow: { display: "flex", width: "100%" },
  bubble: {
    maxWidth: "78%",
    padding: "11px 15px",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  userBubble: {
    background: "var(--color-navy)",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  botBubble: {
    background: "var(--color-surface)",
    color: "var(--color-navy-deep)",
    border: "1px solid var(--color-border)",
    borderBottomLeftRadius: "4px",
  },
  typingBubble: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "13px 16px",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--color-slate-light)",
    animation: "saarthiTypingPulse 1.2s infinite ease-in-out",
    display: "inline-block",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    padding: "14px",
    borderTop: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "var(--color-navy-deep)",
    lineHeight: 1.4,
    maxHeight: "120px",
  },
  sendBtn: {
    background: "var(--color-gold)",
    color: "var(--color-navy-deep)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "10px 18px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: "filter 0.15s ease",
  },
  sendBtnDisabled: {
    background: "var(--color-border)",
    color: "var(--color-slate-light)",
    cursor: "not-allowed",
  },
};