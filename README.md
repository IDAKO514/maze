# maze

Générateur et solveur de labyrinthe, en console, sans aucune dépendance.

Le labyrinthe est produit par backtracking récursif, puis résolu par
recherche en largeur. Le tout est déterministe : à graine égale, le même
labyrinthe et le même chemin.

## Utilisation

```bash
node maze.js                          # 21x11, graine aléatoire
node maze.js --seed=42                # labyrinthe reproductible
node maze.js --seed=42 --cols=41 --rows=21
node maze.js --cols 31 --rows 15
```

| Option | Défaut | Plage | Rôle |
| --- | --- | --- | --- |
| `--seed` | aléatoire | entier 32 bits | graine du générateur |
| `--cols` | 21 | 3 à 201 | largeur en cases |
| `--rows` | 11 | 3 à 101 | hauteur en cases |

Les options acceptent `--opt=valeur` et `--opt valeur`. Les valeurs hors
plage sont ramenées dans les bornes.

## Sortie

```
graine : 42
11x5 cases | 54 passages | solution : 32 pas

 # # # # # # # # # # #
#S#  .     * *#  * * *#
   # # # #     #   #
...
```

- `#` mur, `S` départ, `E` arrivée
- `*` chemin de la solution
- `.` case non empruntée décorative

## Comment ça marche

1. `mulberry32` — générateur pseudo-aléatoire déterministe (mulberry32), choisi
   pour être compact et sans dépendance.
2. `createMaze` — backtracking : on part de la case (0,0), on tire une case
   voisine non visitée, on abat le mur entre les deux, on empile. On dépile
   quand une case n'a plus de voisine libre. Chaque mur est donc abattu une
   seule fois et le graphe reste connexe.
3. `solve` — largeur d'abord depuis le départ, ce qui garantit le plus court
   chemin.
4. `render` — projection ASCII, une ligne sur deux pour les murs.

## Limites connues

- Le labyrinthe n'a qu'une seule issue : il n'y a ni boucle ni cul-de-sac
  multiple, donc « trouver le chemin » est plus simple qu'un vrai labyrinthe.
- `maze.js` appelle `main()` au chargement, ce qui empêche de le réimporter
  pour tester les fonctions internes. Extraire les exports demanderait une
  petite refactorisation.
- Pas de tests automatisés pour l'instant.

## Licence

MIT