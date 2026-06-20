import React from "react";

export default function Dashboard({ lead }) {
  if (!lead) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>—</div>
          <p style={styles.empty}>Insights appear here once the conversation starts.</p>
        </div>
      </div>
    );
  }

  const {
    profile,
    score,
    tier,
    scoreReasoning,
    recommendedProducts,
    stage,
    handoff,
    existingCustomer,
  } = lead;

  return (
    <div style={styles.container}>
      <div style={styles.headRow}>
        <h2 style={styles.heading}>Live lead insights</h2>
        <div style={styles.stageBadge}>{formatStage(stage)}</div>
      </div>

      {existingCustomer && (
        <Section title="Existing customer recognised">
          <div style={styles.customerCard}>
            <div style={styles.customerTopRow}>
              <div>
                <div style={styles.customerName}>{existingCustomer.name}</div>
                <div style={styles.customerMeta}>
                  Customer since {existingCustomer.relationshipSince} · ID{" "}
                  {existingCustomer.customerId}
                </div>
              </div>
            </div>
            <div style={styles.customerSubheading}>Existing products</div>
            <ul style={styles.list}>
              {existingCustomer.existingProducts.map((p) => (
                <li key={p} style={styles.listItem}>
                  {p}
                </li>
              ))}
            </ul>
            <div style={styles.customerSubheading}>Recent activity</div>
            <ul style={styles.list}>
              {existingCustomer.recentActivity.map((a, i) => (
                <li key={i} style={styles.listItem}>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section title="Profile">
        <Row label="Occupation" value={profile?.occupation} />
        <Row label="Primary goal" value={profile?.primaryGoal} />
        <Row label="Urgency" value={profile?.urgency} />
        <Row label="Risk appetite" value={profile?.riskAppetite} />
      </Section>

      <Section title="Qualification score">
        {score !== null && score !== undefined ? (
          <div style={styles.scorePanel}>
            <ScoreGauge score={score} tier={tier} />
            <div style={styles.scoreSide}>
              <div style={{ ...styles.tierBadge, ...tierStyle(tier) }}>
                {tier?.toUpperCase()}
              </div>
              {scoreReasoning && <p style={styles.note}>{scoreReasoning}</p>}
            </div>
          </div>
        ) : (
          <p style={styles.note}>Not yet scored — keep the conversation going.</p>
        )}
      </Section>

      <Section title="Recommended products">
        {recommendedProducts && recommendedProducts.length > 0 ? (
          <ul style={styles.productList}>
            {recommendedProducts.map((p) => (
              <li key={p} style={styles.productItem}>
                {formatProductId(p)}
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.note}>No recommendation yet.</p>
        )}
      </Section>

      {handoff && (
        <Section title="Human handoff flagged">
          <p style={styles.handoffNote}>{handoff.reason}</p>
        </Section>
      )}
    </div>
  );
}

// Signature element: an arc gauge instead of a flat progress bar, reading
// score as a dial rather than a loading state.
function ScoreGauge({ score, tier }) {
  const size = 92;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = tierStyle(tier).background;

  return (
    <div style={styles.gaugeWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div style={styles.gaugeLabel}>
        <span style={styles.gaugeScore}>{clamped}</span>
        <span style={styles.gaugeMax}>/100</span>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value || "—"}</span>
    </div>
  );
}

function formatStage(stage) {
  const map = {
    conversation_started: "Conversation started",
    existing_customer_identified: "Existing customer identified",
    qualifying: "Qualifying lead",
    scored: "Lead scored",
    recommended: "Product recommended",
    handoff_requested: "Handoff requested",
  };
  return map[stage] || stage;
}

function formatProductId(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function tierStyle(tier) {
  if (tier === "hot") return { background: "var(--color-danger)", color: "#fff" };
  if (tier === "warm") return { background: "var(--color-warm)", color: "#fff" };
  return { background: "var(--color-cold)", color: "#fff" };
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "380px",
    fontFamily: "var(--font-body)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "22px",
    background: "var(--color-surface)",
    boxShadow: "var(--shadow-lifted)",
  },
  emptyState: { textAlign: "center", padding: "32px 12px" },
  emptyIcon: {
    fontFamily: "var(--font-display)",
    fontSize: "28px",
    color: "var(--color-border)",
    marginBottom: "8px",
  },
  empty: { color: "var(--color-slate-light)", fontSize: "13px", margin: 0 },
  headRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "18px",
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: "17px",
    fontWeight: 600,
    margin: 0,
    color: "var(--color-navy-deep)",
  },
  stageBadge: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--color-navy)",
    background: "var(--color-cold-soft)",
    padding: "5px 11px",
    borderRadius: "999px",
    whiteSpace: "nowrap",
  },
  section: { marginBottom: "20px" },
  sectionTitle: {
    fontSize: "11.5px",
    fontWeight: 700,
    color: "var(--color-slate-light)",
    textTransform: "uppercase",
    marginBottom: "10px",
    letterSpacing: "0.6px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13.5px",
    padding: "7px 0",
    borderBottom: "1px solid var(--color-border-soft)",
  },
  rowLabel: { color: "var(--color-slate)" },
  rowValue: { color: "var(--color-navy-deep)", fontWeight: 600 },
  scorePanel: { display: "flex", alignItems: "center", gap: "16px" },
  gaugeWrap: { position: "relative", width: "92px", height: "92px", flexShrink: 0 },
  gaugeLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeScore: {
    fontFamily: "var(--font-mono)",
    fontSize: "22px",
    fontWeight: 700,
    color: "var(--color-navy-deep)",
    lineHeight: 1,
  },
  gaugeMax: { fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-slate-light)" },
  scoreSide: { flex: 1, minWidth: 0 },
  tierBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    padding: "4px 11px",
    borderRadius: "999px",
    letterSpacing: "0.4px",
  },
  note: { fontSize: "12.5px", color: "var(--color-slate)", marginTop: "8px", lineHeight: 1.5 },
  list: { margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--color-slate)" },
  listItem: { marginBottom: "5px", lineHeight: 1.4 },
  productList: { margin: 0, padding: 0, listStyle: "none" },
  productItem: {
    fontSize: "13.5px",
    fontWeight: 600,
    color: "var(--color-navy)",
    background: "var(--color-warm-soft)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "9px 12px",
    marginBottom: "6px",
  },
  handoffNote: { fontSize: "13px", color: "var(--color-danger)", margin: 0, lineHeight: 1.5 },
  customerCard: {
    background: "var(--color-paper)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "13px 15px",
  },
  customerTopRow: { marginBottom: "4px" },
  customerName: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: "15px",
    color: "var(--color-navy-deep)",
  },
  customerMeta: { fontSize: "11.5px", color: "var(--color-slate-light)", marginTop: "1px" },
  customerSubheading: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--color-slate-light)",
    textTransform: "uppercase",
    marginTop: "12px",
    marginBottom: "5px",
    letterSpacing: "0.4px",
  },
};