import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowUpRight,
  Users,
  Presentation,
  X,
  ChevronRight,
  Download,
  Target,
  HeartHandshake,
  Church,
  RefreshCw,
} from "lucide-react";
import { Button as SharedButton } from "@/components/ui/button";
import { useFijDashboard } from "@/hooks/useFijDashboard";
import {
  dashboardModel,
  reportFij,
  reportDate,
  weekKey,
} from "@/lib/fijAnalytics";
import { GROWTH_STATUS_LABELS, canReadFijMembers } from "@/lib/fijPermissions";
import FijMemberDialog from "./FijMemberDialog";
import "./fijDashboard.css";

const Button = /** @type {React.ComponentType<any>} */ (SharedButton);

export default function FijVisualDashboard({
  fijs,
  user,
  coordination = false,
}) {
  const [selected, setSelected] = useState("all"),
    [weeks, setWeeks] = useState(8),
    [tab, setTab] = useState("overview"),
    [member, setMember] = useState(null),
    [presentation, setPresentation] = useState(false),
    [search, setSearch] = useState("");
  const data = useFijDashboard(fijs, !!user);
  useEffect(() => {
    if (!presentation) return;
    const candidate = document.querySelector(".serviteur-app");
    const app = candidate instanceof HTMLElement ? candidate : null;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previouslyInert = app?.inert;
    if (app) app.inert = true;
    document.body.style.overflow = "hidden";
    const escape = (e) => {
      if (e.key === "Escape") setPresentation(false);
    };
    document.addEventListener("keydown", escape);
    const frame = requestAnimationFrame(() => {
      const button = document.querySelector(".fij-presentation button");
      if (button instanceof HTMLElement) button.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = previousOverflow;
      if (app) app.inert = previouslyInert;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [presentation]);
  const visibleFijs =
    selected === "all" ? fijs : fijs.filter((f) => f.id === selected);
  const model = useMemo(
    () => dashboardModel({ ...data, fijs: visibleFijs, weeks }),
    [
      data.members,
      data.thursday,
      data.weekly,
      data.entries,
      selected,
      fijs,
      weeks,
    ],
  );
  const base = coordination
    ? "/app/responsabilites/fij-coordination"
    : "/app/responsabilites/fij-pilote";
  const fijBase = coordination ? `${base}/registre` : `${base}/mes-fij`;
  const received = model.activeFijs.filter((f) => model.sent.has(f.id)).length;
  const comparison =
    model.latest.participants != null && model.previous.participants != null
      ? model.latest.participants - model.previous.participants
      : null;
  const growth = Object.entries(GROWTH_STATUS_LABELS).map(([key, name]) => ({
    name,
    count: model.members.filter((m) => m.growth_status === key).length,
  }));
  const unknown = model.members.filter(
    (m) => !GROWTH_STATUS_LABELS[m.growth_status],
  ).length;
  if (unknown) growth.push({ name: "Non renseigné", count: unknown });
  function exportSummary() {
    const csv =
      "\uFEFFSemaine;Participants;Présence (%);CR reçus;Nouveaux visiteurs\n" +
      model.points
        .map((p) =>
          [
            p.key,
            p.participants ?? "",
            p.attendance ?? "",
            p.reports,
            p.visitors ?? "",
          ].join(";"),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "bilan-fij.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function scopeFij(id) {
    setSelected(id);
    setTab("overview");
  }
  const dashboard = (
    <section
      className={`fij-visual ${presentation ? "fij-presentation" : ""}`}
      aria-label={
        coordination
          ? "Tableau de bord coordination FIJ"
          : "Tableau de bord pilote FIJ"
      }
    >
      <div className="fij-toolbar">
        <div className="fij-path">
          Mes responsabilités <ChevronRight size={14} />{" "}
          {coordination ? "Coordination FIJ" : "Pilote FIJ"}
        </div>
        <div className="fij-tools">
          <Button
            variant="outline"
            size="sm"
            onClick={exportSummary}
            disabled={data.loading || !!data.error}
          >
            <Download size={15} /> Bilan CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMember(null);
              setPresentation(!presentation);
            }}
            aria-pressed={presentation}
          >
            {presentation ? <X size={15} /> : <Presentation size={15} />}
            {presentation ? "Quitter la présentation" : "Présenter"}
          </Button>
        </div>
      </div>
      <div className="fij-page-intro">
        <div>
          <p className="fij-kicker">FAMILLES D’IMPACT JEUNES / EJP NANTES</p>
          <h1>
            {coordination
              ? selected === "all"
                ? "Une vision d’ensemble.\nChaque personne compte."
                : visibleFijs[0]?.name
              : selected !== "all"
                ? visibleFijs[0]?.name
                : "Ma FIJ, au fil des vies."}
          </h1>
          <p>
            {coordination
              ? "Comprendre la dynamique. Soutenir les pilotes. Préparer la suite."
              : "Assembler. Connaître. Conduire. Vos repères pour accompagner chacun."}
          </p>
        </div>
        <div className="fij-filters">
          <label>
            Famille
            <select
              aria-label="Famille affichée"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="all">
                {coordination ? "Toutes les FIJ" : "Toutes mes FIJ"}
              </option>
              {fijs.map((f) => (
                <option value={f.id} key={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Période
            <select
              aria-label="Période d’analyse"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            >
              <option value={8}>8 dernières semaines</option>
              <option value={12}>12 dernières semaines</option>
              <option value={26}>26 dernières semaines</option>
            </select>
          </label>
        </div>
      </div>
      {data.loading ? (
        <div className="fij-state" role="status">
          <RefreshCw size={22} className="animate-spin" />
          <h2>Préparation de votre tableau de bord…</h2>
        </div>
      ) : data.error ? (
        <div className="fij-state" role="alert">
          <h2>Données indisponibles</h2>
          <p>{data.error}</p>
          <Button onClick={data.reload}>Réessayer</Button>
        </div>
      ) : !fijs.length ? (
        <div className="fij-state">
          <Users size={30} />
          <h2>
            {coordination
              ? "Aucune FIJ enregistrée"
              : "Aucune FIJ ne vous est attribuée"}
          </h2>
          <p>
            {coordination
              ? "Retrouvez la gestion des familles dans le registre."
              : "La coordination peut vous rattacher à votre famille."}
          </p>
          <Link to={fijBase}>
            Ouvrir {coordination ? "le registre" : "mes FIJ"} →
          </Link>
        </div>
      ) : (
        <>
          {!presentation && (
            <nav
              className="fij-local-tabs"
              aria-label="Vues du tableau de bord"
            >
              {[
                ["overview", "Vue d’ensemble"],
                ["members", "Membres & accompagnement"],
                ...(coordination
                  ? [["operations", "Coordination opérationnelle"]]
                  : []),
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {(tab === "overview" || presentation) && (
            <>
              <div className="fij-metrics">
                <Metric
                  label={coordination ? "FIJ actives" : "Membres de mes FIJ"}
                  value={
                    coordination
                      ? model.activeFijs.length
                      : model.members.length
                  }
                  detail={
                    coordination
                      ? `${visibleFijs.filter((f) => f.status === "paused").length} en pause · ${visibleFijs.filter((f) => f.status === "opening").length} en ouverture`
                      : `${visibleFijs.length} famille${visibleFijs.length > 1 ? "s" : ""} accompagnée${visibleFijs.length > 1 ? "s" : ""}`
                  }
                />
                <Metric
                  label="Participants cette semaine"
                  value={model.latest.participants ?? "—"}
                  detail={
                    comparison == null
                      ? "Comparaison S−1 non disponible"
                      : `${comparison > 0 ? "+" : ""}${comparison} par rapport à S−1 · périmètre déclaré`
                  }
                />
                <Metric
                  label="Présence cette semaine"
                  value={
                    model.latest.attendance == null
                      ? "—"
                      : `${model.latest.attendance} %`
                  }
                  detail="Présents / membres des CR renseignés"
                />
                <Metric
                  label="CR reçus cette semaine"
                  value={`${received} / ${model.activeFijs.length}`}
                  detail="Objectif : tous les CR · sans les brouillons"
                />
              </div>
              <div className="fij-main-grid">
                <article className="fij-chart-panel fij-trend">
                  <div className="fij-section-heading">
                    <div>
                      <span className="fij-kicker">ASSEMBLER</span>
                      <h2>La dynamique des rencontres</h2>
                      <p>Participants par semaine · {weeks} semaines</p>
                    </div>
                    <span className="fij-legend">
                      <i /> Participants
                    </span>
                  </div>
                  {model.points.some((p) => p.participants != null) ? (
                    <div
                      className="fij-chart"
                      role="img"
                      aria-label="Courbe des participants enregistrés par semaine"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={model.points}
                          margin={{ top: 18, right: 18, left: -16, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id={
                                coordination
                                  ? "fij-coord-fill"
                                  : "fij-pilot-fill"
                              }
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#456bdd"
                                stopOpacity={0.22}
                              />
                              <stop
                                offset="100%"
                                stopColor="#456bdd"
                                stopOpacity={0.01}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#e8edf5" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={24}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            formatter={(v) => [v, "Participants"]}
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid #e4e9f0",
                              color: "#172b4b",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="participants"
                            stroke="#456bdd"
                            strokeWidth={3}
                            fill={`url(#${coordination ? "fij-coord-fill" : "fij-pilot-fill"})`}
                            connectNulls={false}
                            isAnimationActive={false}
                            dot={{ r: 3, fill: "#456bdd", strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <ChartEmpty text="Les courbes apparaîtront à partir des premiers CR transmis." />
                  )}
                  <p className="fij-chart-foot">
                    Nouveaux visiteurs cette semaine :{" "}
                    {model.latest.visitors ?? "non renseigné"}. Une semaine sans
                    CR reste vide. Les chiffres décrivent les CR reçus, pas une
                    estimation.
                  </p>
                </article>
                <article className="fij-chart-panel fij-care-panel">
                  <span className="fij-kicker">
                    {coordination ? "PILOTER" : "PRENDRE SOIN"}
                  </span>
                  <h2>
                    {coordination
                      ? "Les points de vigilance"
                      : "Les prochaines attentions"}
                  </h2>
                  <div className="fij-attention">
                    <span className="fij-dot amber" />
                    <div>
                      <b>{model.missing.length} FIJ sans CR cette semaine</b>
                      <p>À vérifier avant la clôture hebdomadaire.</p>
                    </div>
                  </div>
                  <div className="fij-attention">
                    <span className="fij-dot coral" />
                    <div>
                      <b>
                        {model.needsCare.length} membre
                        {model.needsCare.length > 1 ? "s" : ""} à recontacter
                      </b>
                      <p>Au moins trois absences enregistrées à la suite.</p>
                    </div>
                  </div>
                  <div className="fij-attention">
                    <span className="fij-dot blue" />
                    <div>
                      <b>
                        {model.multiplying.length} FIJ avec 13 membres ou plus
                      </b>
                      <p>Préparer la multiplication avec la coordination.</p>
                    </div>
                  </div>
                  {!presentation && (
                    <button
                      className="fij-text-link"
                      onClick={() =>
                        setTab(coordination ? "operations" : "members")
                      }
                    >
                      {coordination
                        ? "Ouvrir le suivi opérationnel"
                        : "Voir les membres"}{" "}
                      <ArrowUpRight size={16} />
                    </button>
                  )}
                </article>
              </div>
              <div className="fij-secondary-grid">
                <article className="fij-chart-panel">
                  <div className="fij-section-heading">
                    <div>
                      <span className="fij-kicker">CONNAÎTRE</span>
                      <h2>Le parcours des membres</h2>
                    </div>
                    <span className="fij-subtle">
                      {model.members.length} membres actifs
                    </span>
                  </div>
                  <div className="fij-growth-bars">
                    {growth.map((g) => (
                      <div className="fij-growth-row" key={g.name}>
                        <span>{g.name}</span>
                        <div>
                          <span
                            style={{
                              width: `${model.members.length ? (g.count / model.members.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <b>{g.count}</b>
                      </div>
                    ))}
                  </div>
                  <p className="fij-chart-foot">
                    Statuts renseignés, sans notation spirituelle ni progression
                    supposée.
                  </p>
                </article>
                <article className="fij-chart-panel">
                  <span className="fij-kicker">CONDUIRE</span>
                  <h2>De l’accueil à l’ancrage</h2>
                  <div className="fij-journey-map">
                    {[
                      ["Attirer", "Créer le lien"],
                      ["Convertir", "Découvrir la foi"],
                      ["Intégrer", "Accueillir en FIJ"],
                      ["Prendre soin", "Accompagner dans la durée"],
                    ].map(([a, b], i) => (
                      <div key={a}>
                        <span className="fij-step">{i + 1}</span>
                        <b>{a}</b>
                        <small>{b}</small>
                      </div>
                    ))}
                  </div>
                  <div className="fij-sunday">
                    <Church size={18} />
                    <div>
                      <b>Lien avec le culte du dimanche</b>
                      <p>
                        Non mesuré : aucune donnée dédiée dans les CR actuels.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {coordination && (
                <article className="fij-chart-panel fij-comparison">
                  <div className="fij-section-heading">
                    <div>
                      <span className="fij-kicker">COMPARER</span>
                      <h2>Les FIJ cette semaine</h2>
                    </div>
                    <span className="fij-subtle">Participants déclarés</span>
                  </div>
                  <div
                    className="fij-chart"
                    role="img"
                    aria-label="Comparaison des participants par FIJ"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={visibleFijs.map((f) => {
                          const r = model.rows.find(
                            (r) =>
                              reportFij(r) === f.id &&
                              weekKey(reportDate(r)) === model.latest.key,
                          );
                          return {
                            name: f.name,
                            participants: r
                              ? (r.present_count ?? r.participants_count ?? 0)
                              : null,
                          };
                        })}
                      >
                        <CartesianGrid vertical={false} stroke="#e8edf5" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(v) => [v, "Participants"]} />
                        <Bar
                          dataKey="participants"
                          fill="#7c94dc"
                          radius={[5, 5, 0, 0]}
                          isAnimationActive={false}
                          maxBarSize={52}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              )}
              {!presentation && (
                <>
                  <div className="fij-section-heading">
                    <h2>
                      {coordination
                        ? "Chaque FIJ, dans son contexte"
                        : "Mon espace de travail"}
                    </h2>
                    <Link to={fijBase} className="fij-text-link">
                      {coordination ? "Registre complet" : "Toutes mes FIJ"}{" "}
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <div className="fij-family-list">
                    {visibleFijs.map((f) => {
                      const count = model.members.filter(
                        (m) => m.fij_id === f.id,
                      ).length;
                      return (
                        <article key={f.id}>
                          <span className="fij-family-icon">
                            <Users size={20} />
                          </span>
                          <div>
                            <h3>{f.name}</h3>
                            <p>
                              {f.pilot_name || "Pilote à renseigner"} · {count}{" "}
                              membres · {f.meeting_day || "Jour à renseigner"}
                            </p>
                          </div>
                          <span
                            className={`fij-status ${model.sent.has(f.id) ? "good" : ""}`}
                          >
                            {model.sent.has(f.id) ? "CR reçu" : "CR attendu"}
                          </span>
                          {coordination && (
                            <button
                              className="fij-text-link"
                              onClick={() => scopeFij(f.id)}
                            >
                              Analyser
                            </button>
                          )}
                          <Link
                            className="fij-open-family"
                            to={`${fijBase}/${f.id}`}
                          >
                            Ouvrir la FIJ <ArrowUpRight size={15} />
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
          {tab === "members" && !presentation && (
            <article className="fij-chart-panel">
              <div className="fij-section-heading">
                <div>
                  <span className="fij-kicker">PERSONNE N’EST UN CHIFFRE</span>
                  <h2>
                    Les membres de{" "}
                    {selected === "all"
                      ? coordination
                        ? "toutes les FIJ"
                        : "mes FIJ"
                      : visibleFijs[0]?.name}
                  </h2>
                </div>
                <label className="fij-search-label">
                  Rechercher
                  <input
                    aria-label="Rechercher un membre FIJ"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nom du membre…"
                  />
                </label>
              </div>
              <div className="fij-table-wrap">
                <table className="fij-members-table">
                  <thead>
                    <tr>
                      <th>Membre / FIJ</th>
                      <th>Parcours</th>
                      <th>Présences · période</th>
                      <th>Suivi</th>
                      <th>Fiche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.people
                      .filter((p) =>
                        p.member.full_name
                          ?.toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((p) => {
                        const f = visibleFijs.find(
                          (f) => f.id === p.member.fij_id,
                        );
                        return (
                          <tr key={p.member.id}>
                            <td>
                              <b>{p.member.full_name}</b>
                              <small>{f?.name}</small>
                            </td>
                            <td>
                              {GROWTH_STATUS_LABELS[p.member.growth_status] ||
                                "Non renseigné"}
                            </td>
                            <td>
                              {p.rate == null
                                ? "Non renseigné"
                                : `${p.rate} % · ${p.present} / ${p.total}`}
                            </td>
                            <td>
                              <span
                                className={`fij-status ${p.consecutive >= 3 ? "" : "good"}`}
                              >
                                {p.consecutive >= 3
                                  ? `${p.consecutive} absences de suite`
                                  : p.total
                                    ? "Suivi courant"
                                    : "À renseigner"}
                              </span>
                            </td>
                            <td>
                              {canReadFijMembers(user, f) && (
                                <button
                                  className="fij-open-family"
                                  onClick={() => setMember(p.member)}
                                  aria-label={`Voir la fiche de ${p.member.full_name}`}
                                >
                                  Voir la fiche <ArrowUpRight size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              {!model.people.length && (
                <p className="fij-state">
                  Aucun membre enregistré sur ce périmètre.
                </p>
              )}
              {model.people.length > 0 &&
                !model.people.some((p) =>
                  p.member.full_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()),
                ) && <p>Aucun membre ne correspond à cette recherche.</p>}
            </article>
          )}
          {tab === "operations" && !presentation && (
            <>
              <div className="fij-section-heading">
                <div>
                  <span className="fij-kicker">
                    COORDINATION OPÉRATIONNELLE
                  </span>
                  <h2>Quatre missions, un même service</h2>
                  <p>Les outils existants restent à leur place.</p>
                </div>
              </div>
              <div className="fij-operations">
                {
                  /** @type {Array<[React.ElementType, string, string, Array<[string, string]>]>} */ ([
                    [
                      Target,
                      "Suivi & relance",
                      "Comptes rendus, échéances, FIJ en difficulté.",
                      [
                        ["relances", "Relancer les pilotes"],
                        ["cr-jeudi", "CR de présence"],
                        ["cr", "CR hebdomadaires"],
                        ["pause", "FIJ en pause"],
                      ],
                    ],
                    [
                      Users,
                      "Gestion administrative",
                      "Maisons, pilotes et étapes d’ouverture.",
                      [
                        ["registre", "Registre des FIJ"],
                        ["pilotes", "Pilotes"],
                        ["ouvertures", "Ouvertures · 24 h de prière"],
                        ["consecrations", "Consécrations"],
                        ["transferts", "Transferts"],
                      ],
                    ],
                    [
                      Presentation,
                      "Reporting & analyse",
                      "Bilan hebdomadaire, statistiques et préparation des réunions.",
                      [
                        ["reporting", "Rapports et bilans"],
                        ["alertes", "Alertes"],
                      ],
                    ],
                    [
                      HeartHandshake,
                      "Liaison & support",
                      "Informations, ressources et lien avec les responsables.",
                      [
                        ["communications", "Communications"],
                        ["documents", "Documents & procédures"],
                      ],
                    ],
                  ]).map(([Icon, title, text, links]) => (
                    <article className="fij-chart-panel" key={title}>
                      <Icon size={23} />
                      <h2>{title}</h2>
                      <p>{text}</p>
                      <div className="fij-operation-links">
                        {links.map(([path, label]) => (
                          <Link key={path} to={`${base}/${path}`}>
                            {label}
                            <ArrowUpRight size={15} />
                          </Link>
                        ))}
                      </div>
                    </article>
                  ))
                }
              </div>
            </>
          )}
          <footer className="fij-data-note">
            Données enregistrées dans l’application · semaine du{" "}
            {new Date(model.latest.key + "T12:00:00Z").toLocaleDateString(
              "fr-FR",
            )}{" "}
            · Semaine en cours susceptible d’être incomplète · Vue limitée aux
            données chargées (1 000 lignes par FIJ et source).{" "}
            {presentation &&
              "Mode présentation : données nominatives masquées."}
          </footer>
        </>
      )}
      {member && !presentation && (
        <FijMemberDialog
          member={data.members.find((m) => m.id === member.id) || member}
          fij={fijs.find((f) => f.id === member.fij_id)}
          user={user}
          onClose={() => setMember(null)}
          onUpdated={data.reload}
        />
      )}
    </section>
  );
  return presentation ? createPortal(dashboard, document.body) : dashboard;
}
function Metric({ label, value, detail }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
function ChartEmpty({ text }) {
  return (
    <div className="fij-chart-empty">
      <Presentation size={28} />
      <p>{text}</p>
    </div>
  );
}
