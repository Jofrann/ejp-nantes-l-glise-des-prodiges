import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-danger/10 border border-danger/20">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Accès restreint</h1>
          <p className="text-muted-foreground mb-8">
            Tu n'es pas enregistré pour utiliser cette application. Contacte l'administrateur pour demander un accès.
          </p>
          <div className="p-4 bg-surface rounded-xl text-sm text-muted-foreground border border-border">
            <p>Si tu penses qu'il s'agit d'une erreur, tu peux :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Vérifier que tu es connecté avec le bon compte</li>
              <li>Contacter l'administrateur de l'application</li>
              <li>Essayer de te déconnecter puis reconnecter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;