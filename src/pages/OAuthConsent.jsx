import { Link } from "react-router-dom";
export default function OAuthConsent() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1>Connexion externe indisponible</h1>
      <p>Cette version locale ne propose pas encore de connexion OAuth.</p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  );
}
