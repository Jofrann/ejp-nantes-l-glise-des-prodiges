import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./workspaces.css";
export function WorkspaceChart({
  data,
  valueKey = "count",
  label = "Activité enregistrée",
}) {
  return data.some((p) => p[valueKey] != null && p[valueKey] > 0) ? (
    <div className="ws-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: -20, right: 12, top: 16, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#e7ecee" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#657580" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#657580" }}
          />
          <Tooltip
            formatter={(v) => [v, label]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e7ecee" }}
          />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke="#426b88"
            fill="#edf2f5"
            strokeWidth={2}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div className="ws-empty">
      {data.some((p) => p[valueKey] != null)
        ? "Aucune activité comptabilisée sur cette période."
        : "Les courbes apparaîtront avec les premières données renseignées."}
    </div>
  );
}
export function WorkspaceMetrics({ items }) {
  return (
    <div className="ws-metrics">
      {items.map(([label, value, detail]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value ?? "—"}</strong>
          <small>{detail}</small>
        </div>
      ))}
    </div>
  );
}
export function WorkspaceReadState({ loading, error, reload }) {
  return (
    <div className="ws-empty" role={error ? "alert" : "status"}>
      {loading ? (
        "Préparation de votre espace…"
      ) : (
        <>
          <p>{error}</p>
          <button className="ws-button" onClick={reload}>
            Réessayer
          </button>
        </>
      )}
    </div>
  );
}
