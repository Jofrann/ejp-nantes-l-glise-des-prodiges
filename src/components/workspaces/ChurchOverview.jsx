import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import {
  WorkspaceChart,
  WorkspaceMetrics,
  WorkspaceReadState,
} from "./WorkspacePrimitives";
export default function ChurchOverview({ onNavigateTab }) {
  const state = useWorkspaceData("getChurchOverview");
  const [view, setView] = useState("summary"),
    [presentation, setPresentation] = useState(false);
  useEffect(() => {
    if (!presentation) return;
    const root = document.querySelector(".serviteur-app"),
      prior = document.activeElement,
      old = document.body.style.overflow,
      oldInert = root instanceof HTMLElement ? root.inert : false;
    document.body.style.overflow = "hidden";
    if (root instanceof HTMLElement) root.inert = true;
    const escape = (e) => {
      if (e.key === "Escape") setPresentation(false);
    };
    document.addEventListener("keydown", escape);
    requestAnimationFrame(() =>
      document.getElementById("ws-presentation-close")?.focus(),
    );
    return () => {
      document.body.style.overflow = old;
      if (root instanceof HTMLElement) root.inert = oldInert;
      document.removeEventListener("keydown", escape);
      if (prior instanceof HTMLElement && prior.isConnected) prior.focus();
      else
        requestAnimationFrame(() =>
          document.getElementById("ws-presentation-open")?.focus(),
        );
    };
  }, [presentation]);
  if (state.loading || state.error)
    return (
      <div className="ws">
        <WorkspaceReadState {...state} />
      </div>
    );
  const d = state.data;
  const content = (
    <section
      className={`ws ${presentation ? "ws-presentation" : ""}`}
      aria-label="Synthèse des leaders"
    >
      <header className="ws-intro">
        <div>
          <span className="ws-eyebrow">LEADERS · EJP NANTES</span>
          <h1>La vie de l’église</h1>
          <p>
            Comprendre les évolutions. Accompagner les équipes. Décider
            ensemble.
          </p>
        </div>
        <button
          id={presentation ? "ws-presentation-close" : "ws-presentation-open"}
          className="ws-button"
          onClick={() => setPresentation(!presentation)}
        >
          {presentation ? "Quitter la présentation" : "Présenter la synthèse"}
        </button>
      </header>
      {!presentation && (
        <nav className="ws-tabs" aria-label="Vues de la synthèse leaders">
          {[
            ["summary", "En un regard"],
            ["departments", "Les départements"],
            ["analysis", "Évolutions & sources"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
      {(view === "summary" || presentation) && (
        <>
          <WorkspaceMetrics
            items={[
              [
                "Départements actifs",
                d.summary.departments,
                "Dans le registre actuel",
              ],
              [
                "Serviteurs rattachés",
                d.summary.servants,
                "Comptes distincts dans les équipes",
              ],
              [
                "Actions ouvertes",
                d.summary.actions,
                "Dans les nouveaux suivis internes",
              ],
              [
                "Visiteurs à suivre",
                d.summary.visitors_to_contact,
                "Dossiers Accueil en cours",
              ],
            ]}
          />
          <div className="ws-grid">
            <article className="ws-panel">
              <div className="ws-heading">
                <h2>Participation enregistrée</h2>
                <span>12 derniers événements passés</span>
              </div>
              <WorkspaceChart
                data={d.trend}
                valueKey="participants"
                label="Présents ou en retard"
              />
              <p className="ws-caption">
                {d.coverage.reported} événements avec présences renseignées sur{" "}
                {d.coverage.events}. Les périodes sans saisie restent vides.
              </p>
            </article>
            <article className="ws-panel ws-soft">
              <h2>Où porter notre attention</h2>
              <div className="ws-attentions">
                <div>
                  <strong>
                    {d.departments.reduce((n, r) => n + r.overdue, 0)}
                  </strong>
                  <span>actions ont dépassé leur échéance</span>
                </div>
                <div>
                  <strong>
                    {d.departments.filter((r) => r.members === 0).length}
                  </strong>
                  <span>départements sans rattachement actif renseigné</span>
                </div>
                <div>
                  <strong>{d.fij.missing}</strong>
                  <span>FIJ sans compte rendu cette semaine</span>
                </div>
              </div>
              {!presentation && (
                <button
                  className="ws-link"
                  onClick={() => onNavigateTab("decisions")}
                >
                  Ouvrir les décisions & suivis →
                </button>
              )}
            </article>
          </div>
          <article className="ws-panel">
            <div className="ws-heading">
              <h2>Les familles d’impact jeunes</h2>
              {!presentation && (
                <Link
                  className="ws-link"
                  to="/app/responsabilites/fij-coordination"
                >
                  Ouvrir la coordination →
                </Link>
              )}
            </div>
            <WorkspaceMetrics
              items={[
                ["FIJ actives", d.fij.active, "Registre FIJ"],
                ["Membres FIJ", d.fij.members, "Effectif propre aux FIJ"],
                [
                  "Participants cette semaine",
                  d.fij.participants,
                  "Comptes rendus reçus",
                ],
                [
                  "Présence déclarée",
                  d.fij.attendance == null ? null : d.fij.attendance + " %",
                  "Sur les effectifs des CR renseignés",
                ],
              ]}
            />
            <p className="ws-caption">{d.fij.note}</p>
          </article>
        </>
      )}
      {(view === "departments" || presentation) && (
        <article className="ws-panel ws-departments">
          <div className="ws-heading">
            <h2>Les départements, chacun dans son contexte</h2>
            <span>Équipe · travail à suivre</span>
          </div>
          {d.departments.map((row) => (
            <div className="ws-dept-row" key={row.id}>
              <div>
                <h3>{row.name}</h3>
                <p>
                  {row.members} serviteurs · {row.open} actions ouvertes
                  {row.planned != null
                    ? ` · ${row.planned} services à venir`
                    : ""}
                  {row.overdue > 0 ? ` · ${row.overdue} en retard` : ""}
                </p>
              </div>
              {!presentation && (
                <Link
                  className="ws-link"
                  to={`/app/pilotage/departements/${row.slug}`}
                >
                  Voir le détail →
                </Link>
              )}
            </div>
          ))}
          <p className="ws-caption">
            Un département sans action saisie ne signifie pas qu’il n’a pas
            d’activité. Les autres outils restent accessibles dans son espace.
          </p>
        </article>
      )}
      {(view === "analysis" || presentation) && (
        <>
          <WorkspaceMetrics
            items={[
              [
                "Incidents techniques ouverts",
                d.operations.incidents,
                "Outil Sonorisation",
              ],
              [
                "Suivis de coordination",
                d.operations.coordination,
                "Actions non clôturées",
              ],
              [
                "Demandes de prière en cours",
                d.operations.prayer,
                "Nombre uniquement, sans contenu",
              ],
              [
                "Rendez-vous en attente",
                d.operations.appointments,
                "Demandes, sans dossiers personnels",
              ],
            ]}
          />
          <div className="ws-grid">
            <article className="ws-panel">
              <h2>Les rencontres FIJ</h2>
              <WorkspaceChart
                data={d.fij.trend}
                valueKey="participants"
                label="Participants aux FIJ"
              />
            </article>
            <article className="ws-panel ws-soft">
              <h2>Ce que les chiffres permettent de dire</h2>
              <p className="ws-caption">{d.note}</p>
              <p className="ws-caption">
                {d.summary.accounts} comptes actifs dans l’application. Ce
                chiffre n’est pas l’effectif total de l’église.
              </p>
              <p className="ws-caption">
                Les effectifs des départements sont dédupliqués dans le total
                des serviteurs. Les membres FIJ ne sont pas ajoutés aux comptes.
              </p>
              {!presentation && (
                <button
                  className="ws-link"
                  onClick={() => onNavigateTab("details")}
                >
                  Consulter les données autorisées →
                </button>
              )}
            </article>
          </div>
        </>
      )}
      <footer className="ws-caption ws-updated">
        Actualisé le {new Date(d.generated_at).toLocaleString("fr-FR")} ·{" "}
        {presentation
          ? "Synthèse sans données nominatives"
          : "Les détails personnels restent soumis aux habilitations existantes."}
      </footer>
    </section>
  );
  return presentation ? createPortal(content, document.body) : content;
}
