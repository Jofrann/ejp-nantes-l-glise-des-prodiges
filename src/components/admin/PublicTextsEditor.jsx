import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { catalog, expandPublicCopy, publicConfigOnly } from "@/lib/publicCopy";
const pages = [
  ["/", "Accueil"],
  ["/a-propos", "La maison"],
  ["/fij", "Familles d’Impact Jeunes"],
  ["/programmes", "Nos rendez-vous"],
  ["/venir", "Nous rejoindre"],
  ["/espace-serviteur", "Accès serviteur"],
];
const names = {
  Home: "Accueil — introduction",
  APropos: "La maison",
  FijPublic: "Familles d’Impact Jeunes",
  Programmes: "Nos rendez-vous",
  Venir: "Nous rejoindre",
  EspaceServiteurSas: "Accès serviteur",
  PublicHeader: "Navigation",
  PublicFooter: "Pied de page",
  HeroLumineux: "Accueil — grand titre",
  VisionEJP: "Vision et mission",
  Authorities: "Autorités",
  FijInvitation: "Invitation FIJ",
  PhotoStory: "Photos et légendes",
  CeDimanche: "Prochain culte",
  PremiereFois: "Première visite",
  FirstVisitForm: "Formulaire de visite",
  Ministeres: "Ministères",
  GalerieVivante: "Galerie",
  Temoignages: "Témoignages",
  CTAFinal: "Invitation finale",
  StickyCTA: "Bouton de visite",
  ImmersionScroll: "Immersion",
  NantesSection: "Nantes",
  BergereLeaders: "Équipe pastorale",
  FAQSection: "Questions fréquentes",
  VivreIci: "Vie de la maison",
};
const labels = {
  service_day: "Jour du culte",
  service_time: "Heure du culte (heure de Nantes)",
  address_label: "Adresse",
  vision_title: "Titre de la vision",
  vision_text: "Présentation de la vision",
  mission_title: "Titre de la mission",
  mission_text: "Présentation de la mission",
  hero_title: "Titre d’accueil (une ligne par ligne visuelle)",
  hero_subtitle: "Sous-titre d’accueil",
  apostle_name: "Nom de l’Apôtre",
  apostle_bio: "Présentation de l’Apôtre",
  world_shepherd_first_name: "Prénom / titre du Berger EJP Monde",
  world_shepherd_last_name: "Nom du Berger EJP Monde",
  world_shepherd_role: "Responsabilité du Berger EJP Monde",
  world_shepherd_bio: "Présentation du Berger EJP Monde",
  shepherd_name: "Nom de la Bergère",
  shepherd_bio: "Présentation de la Bergère",
  fij_title: "Titre FIJ",
  fij_text: "Présentation FIJ",
  fij_join_text: "Rejoindre une FIJ",
  church_name: "Nom de l’église",
  announcement_text: "Annonce publique",
};
const cls =
  "w-full rounded-xl border border-border bg-white px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40";
export default function PublicTextsEditor({
  config,
  setConfig,
  onSave,
  saving,
  onOpenTab,
}) {
  const [section, setSection] = useState("shared");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(false);
  const [page, setPage] = useState("/");
  const [mobile, setMobile] = useState(false);
  const frame = useRef(null);
  const [channel] = useState(() => crypto.randomUUID());
  const draft = useRef(config);
  draft.current = config;
  const send = () =>
    frame.current?.contentWindow?.postMessage(
      {
        type: "ejp-public-draft",
        channel,
        config: publicConfigOnly(draft.current),
      },
      window.location.origin,
    );
  useEffect(() => {
    const receive = (e) => {
      if (
        e.origin !== window.location.origin ||
        e.source !== frame.current?.contentWindow ||
        e.data?.channel !== channel
      )
        return;
      if (e.data.type === "ejp-preview-ready") send();
      if (e.data.type === "ejp-preview-close") setPreview(false);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [channel]);
  useEffect(() => {
    if (!preview) return;
    const id = setTimeout(send, 350);
    return () => clearTimeout(id);
  }, [config, preview]);
  const inactive = [
    "ImmersionScroll",
    "NantesSection",
    "BergereLeaders",
    "FAQSection",
    "VivreIci",
  ];
  const sections = [
    ...new Set(catalog.entries.flatMap((item) => item.sections)),
  ].filter((key) => names[key] && !inactive.includes(key));
  const matching = catalog.entries.filter(
    (item) =>
      !item.field &&
      item.sections.some((key) => !inactive.includes(key)) &&
      !catalog.fields.some(
        (field) => field.value && field.value === item.source,
      ) &&
      (section === "all" || item.sections.includes(section)) &&
      (!query ||
        `${item.value} ${config.public_copy?.[item.id] || ""}`
          .toLocaleLowerCase("fr")
          .includes(query.toLocaleLowerCase("fr"))),
  );
  const fields = catalog.fields.filter(
    (field) =>
      !query ||
      `${labels[field.key] || ""} ${config[field.key] ?? field.value}`
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
  );
  const update = (id, value) =>
    setConfig((current) => ({
      ...current,
      public_copy: { ...(current.public_copy || {}), [id]: value },
    }));
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#172b4b] p-6 text-white">
        <p className="text-xs uppercase tracking-widest text-[#dcc38c]">
          Site public
        </p>
        <h2 className="text-2xl font-semibold mt-2">Vos mots, partout.</h2>
        <p className="text-sm text-white/75 mt-3">
          Les textes affichés sont déjà remplis. Modifiez une section, vérifiez
          le résultat puis publiez vos modifications.
        </p>
        <button
          className="mt-5 rounded-full bg-white text-[#172b4b] px-5 py-3 text-sm font-semibold"
          onClick={() => setPreview(true)}
        >
          Voir l’aperçu avant publication
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <label className="block text-sm font-medium">
          Section du site
          <select
            className={`${cls} mt-2`}
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="shared">
              Informations partagées : horaires, vision, autorités…
            </option>
            {sections.map((key) => (
              <option key={key} value={key}>
                {names[key]}
              </option>
            ))}
            <option value="all">Tous les textes</option>
          </select>
        </label>
        <label className="block text-sm">
          Rechercher un mot ou une phrase
          <input
            className={`${cls} mt-2`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (section === "shared") setSection("all");
            }}
            placeholder="Ex. : culte, bienvenue, famille…"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Les variables {"{{jour}}"}, {"{{horaire}}"} et {"{{adresse}}"} suivent
          les informations partagées. Les textes identiques réutilisés sur
          plusieurs pages sont modifiés ensemble.
        </p>
      </div>
      {(section === "shared" || section === "all") &&
        fields.map((field) => (
          <label
            key={field.key}
            className="block rounded-2xl border border-border bg-white p-5"
          >
            <span className="block text-sm font-semibold mb-2">
              {labels[field.key] || field.key}
            </span>
            <textarea
              className={cls}
              rows={field.value.length > 120 ? 4 : 2}
              value={config[field.key] ?? field.value}
              onChange={(e) =>
                setConfig((current) => ({
                  ...current,
                  [field.key]: e.target.value,
                }))
              }
            />
            <span className="block text-xs text-muted-foreground mt-2">
              {field.key === "hero_title"
                ? "Les sauts de ligne conservent la composition du titre sur le site."
                : "Information réutilisée dans les pages concernées."}
            </span>
          </label>
        ))}
      {section !== "shared" && (
        <p className="text-xs text-muted-foreground">
          {matching.length} textes · Les champs ci-dessous correspondent au
          contenu existant.
        </p>
      )}
      {section !== "shared" &&
        matching.map((item) => (
          <label
            key={item.id}
            className="block rounded-2xl border border-border bg-white p-5"
          >
            <span className="block text-xs text-muted-foreground mb-2">
              {item.sections.map((key) => names[key] || key).join(" · ")}
            </span>
            <textarea
              aria-label={`Texte : ${item.value.slice(0, 70)}`}
              className={cls}
              rows={item.value.length > 120 ? 4 : 2}
              value={config.public_copy?.[item.id] ?? item.value}
              onChange={(e) => update(item.id, e.target.value)}
            />
            <span className="block text-xs text-muted-foreground mt-2">
              Aperçu :{" "}
              {expandPublicCopy(
                config.public_copy?.[item.id] ?? item.value,
                config,
              )}
            </span>
          </label>
        ))}
      {section !== "shared" && !matching.length && (
        <p role="status">Aucun texte ne correspond à cette recherche.</p>
      )}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h3 className="font-semibold text-sm">Contenus des listes publiques</h3>
        <p className="text-sm text-muted-foreground my-3">
          Les noms, descriptions, dates et légendes des contenus ci-dessous se
          modifient dans leur rubrique existante. Ces listes sont enregistrées
          directement.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            ["events", "Événements"],
            ["programs", "Programmes EJP"],
            ["leaders", "Leaders"],
            ["ministries", "Ministères"],
            ["testimonials", "Témoignages"],
            ["gallery", "Galerie"],
          ].map(([id, label]) => (
            <button
              key={id}
              className="rounded-full border border-border px-3 py-2 text-xs"
              onClick={() => onOpenTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <button
        disabled={saving}
        className="rounded-full bg-[#294d84] text-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
        onClick={onSave}
      >
        {saving ? "Publication…" : "Publier les modifications"}
      </button>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-[min(1400px,96vw)] w-[96vw] h-[92dvh] p-4 flex flex-col overflow-hidden">
          <DialogTitle>Aperçu non publié</DialogTitle>
          <DialogDescription>
            Vérifiez vos modifications dans le vrai rendu du site avant de les
            publier.
          </DialogDescription>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              aria-label="Page à prévisualiser"
              className="rounded-lg border p-2 text-sm max-w-full"
              value={page}
              onChange={(e) => setPage(e.target.value)}
            >
              {pages.map(([url, label]) => (
                <option key={url} value={url}>
                  {label}
                </option>
              ))}
            </select>
            <button
              className="rounded-lg border px-3 py-2 text-sm"
              onClick={() => setMobile((value) => !value)}
            >
              {mobile ? "Vue ordinateur" : "Vue téléphone"}
            </button>
            <button
              className="rounded-lg border px-3 py-2 text-sm"
              onClick={() => setPreview(false)}
            >
              Fermer l’aperçu
            </button>
            <span className="text-xs text-muted-foreground">
              Navigation et envoi des formulaires désactivés dans l’aperçu.
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto bg-[#e8edf3] rounded-xl">
            <iframe
              key={page}
              ref={frame}
              title="Aperçu du site public"
              src={`${page}?ejp_preview=${channel}`}
              className="h-full bg-white border-0 mx-auto"
              style={{ width: mobile ? "min(390px, 100%)" : "100%" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
