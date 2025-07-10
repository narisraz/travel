# Règles Cursor - Architecture HTTP

Ce dossier contient les règles Cursor pour l'architecture HTTP et les contrôleurs agnostiques.

## Règles Disponibles

### 1. `http-architecture.mdc`

- **Type** : Toujours appliquée (`alwaysApply: true`)
- **Description** : Architecture HTTP générale et patterns de routing
- **Contenu** :
  - Structure des dossiers
  - Principes architecturaux
  - Séparation des responsabilités
  - Conventions de nommage

### 2. `controllers.mdc`

- **Type** : Appliquée aux fichiers `*.controller.ts`
- **Description** : Patterns et conventions pour les contrôleurs HTTP
- **Contenu** :
  - Structure des contrôleurs
  - Template de contrôleur
  - Règles d'agnosticité framework
  - Gestion des erreurs
  - Types TypeScript

### 3. `routes.mdc`

- **Type** : Appliquée aux fichiers `*.routes.ts`
- **Description** : Patterns et conventions pour les routes HTTP
- **Contenu** :
  - Structure des routes
  - Template de route
  - Validation avec Zod
  - Mapping des données
  - Exemples de schémas

## Utilisation

Ces règles seront automatiquement appliquées par Cursor selon leur configuration :

- Les règles avec `alwaysApply: true` sont toujours actives
- Les règles avec `globs` s'appliquent aux fichiers correspondants
- Les règles avec `description` peuvent être invoquées manuellement

## Architecture Découlante

L'architecture promue par ces règles respecte les principes :

1. **Découplage** : Contrôleurs agnostiques du framework
2. **Testabilité** : Séparation claire des responsabilités
3. **Maintenabilité** : Structure cohérente et prévisible
4. **Réutilisabilité** : Composants indépendants

## Exemple d'Utilisation

```typescript
// Route légère
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await loginController(data);
  return c.json(result.response, result.status);
});

// Contrôleur agnostique
export const loginController = async (
  request: LoginRequest
): Promise<LoginResult> => {
  return await Effect.gen(function* () {
    // Logique métier
  }).pipe(
    Effect.provide(httpLayer),
    Effect.match({
      onFailure: handleError,
      onSuccess: handleSuccess,
    }),
    Effect.runPromise
  );
};
```
