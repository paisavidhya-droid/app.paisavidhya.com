// src/pdf/PFCReportPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// (Optional) add your brand font if you have one
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const pct = (x) => (isFinite(x) ? `${x.toFixed(1)}%` : "-");

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, color: "#111" /*, fontFamily: 'Inter'*/ },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 10, color: "#666", marginBottom: 12 },
  row: { flexDirection: "row" },
  cardRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    marginRight: 6,
    fontSize: 10,
  },
  section: { marginBottom: 14 },
  card: { borderWidth: 1, borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, 
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 140,
  },
  cardLabel: { fontSize: 9, color: "#666" },
  cardValue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  table: { borderWidth: 1, borderStyle: "solid", borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 6,
  },
tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" },
  th: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    fontWeight: 700,
    padding: 8,
    fontSize: 10,
  },
  td: { flex: 1, padding: 8, fontSize: 10 },
  insightsItem: { marginBottom: 6 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 24,
    right: 24,
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default function PFCReportPDF({
  info,
  totals,
  totalIncome,
  breakdownPct,
  kpis,
  insights,
  actions,
}) {
  const {
    savingsRate,
    emiLoad,
    surplusPct,
    fixedTotal,
    variableTotal,
    needsPct,
    wantsPct,
    savingPct,
    totalExpenses,
    surplus,
  } = kpis;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.h1}>PFC Report</Text>
          <Text style={styles.sub}>
            {info?.name || "—"}
            {info?.city ? ` • ${info.city}` : ""}
            {info?.gender ? ` • ${info.gender}` : ""}
          </Text>
          <View style={styles.row}>
            <Text style={styles.badge}>Income ₹{inr.format(totalIncome)}</Text>
            <Text style={styles.badge}>
              Expenses ₹{inr.format(totalExpenses)}
            </Text>
            <Text style={styles.badge}>Surplus ₹{inr.format(surplus)}</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={[styles.section, styles.cardRow]}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Savings Rate</Text>
            <Text style={styles.cardValue}>{pct(savingsRate)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>EMI Load</Text>
            <Text style={styles.cardValue}>{pct(emiLoad)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>% Needs (H+F+T)</Text>
            <Text style={styles.cardValue}>
              {totalExpenses
                ? pct(
                    ((totals.Housing + totals.Food + totals.Transport) /
                      totalExpenses) *
                      100
                  )
                : "-"}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Surplus % of Income</Text>
            <Text style={styles.cardValue}>{pct(surplusPct)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Fixed vs Variable</Text>
            <Text style={styles.cardValue}>
              ₹{inr.format(fixedTotal)} / ₹{inr.format(variableTotal)}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>50/30/20 (N/W/S)</Text>
            <Text style={styles.cardValue}>{`${Math.round(
              needsPct
            )}/${Math.round(wantsPct)}/${Math.round(savingPct)}`}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Investments as % of Expenses</Text>
            <Text style={styles.cardValue}>
              {totalExpenses
                ? pct((kpis.savingAmt / totalExpenses) * 100)
                : "-"}
            </Text>
          </View>
        </View>

        {/* Breakdown Table */}
        <View style={styles.section}>
          <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
            Expense Breakdown
          </Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={styles.th}>Category</Text>
              <Text style={styles.th}>Amount (₹)</Text>
              <Text style={styles.th}>Share</Text>
            </View>
            {Object.entries(totals)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <View key={k} style={styles.tr}>
                  <Text style={styles.td}>{k}</Text>
                  <Text style={styles.td}>{inr.format(v)}</Text>
                  <Text style={styles.td}>{breakdownPct(k)}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Insights */}
        {insights?.length > 0 && (
          <View style={styles.section} wrap>
            <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Insights
            </Text>
            {insights.map((it, i) => (
              <View key={i} style={styles.insightsItem}>
                <Text style={{ fontWeight: 700 }}>{it.title}</Text>
                <Text>{it.detail}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        {actions?.length > 0 && (
          <View style={styles.section} wrap>
            <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              Your 30-Day Action Plan
            </Text>
            {actions.map((t, i) => (
              <Text key={i}>{`${i + 1}. ${t}`}</Text>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by PaisaVidhya • {info?.name || "—"} •{" "}
          {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}
