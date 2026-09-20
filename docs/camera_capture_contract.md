# Contrat de capture SkinView

Le live et la validation post-capture utilisent les mêmes constantes dans
`cameraGuidance.ts`. L’ovale est un guide visuel, pas un masque pixel strict.

## Tolérances

| Contrôle | Ancien | Actuel | Raison |
|---|---:|---:|---|
| Décalage horizontal du centre | 0,18 | 0,22 | Accepter le décentrage normal d’un selfie tenu en main. |
| Décalage vertical du centre | 0,16 | 0,20 | Accepter un visage légèrement haut ou bas. |
| Visage visible | 80 % | 72 % | Refuser les crops réellement dommageables sans exiger un cadre parfait. |
| Largeur du visage | 17–84 % | 15–88 % | Élargir la plage de distance exploitable. |
| Hauteur du visage | 24–92 % | 22–94 % | Élargir la plage de distance exploitable. |
| Lumière moyenne | 45–240 | 38–245 | Tolérer une lumière imparfaite, toujours hors sous/surexposition franche. |
| Netteté face / 3⁄4 | 4 / 3,5 | 3 / 2,75 | Le seuil conseillé devient un warning ; le rejet reste à 50 % pour le vrai flou. |
| Yaw face maximal | ±12° | ±15° | Tolérer une orientation frontale naturelle. |
| Roll maximal | ±15° | ±18° | Tolérer une légère inclinaison du téléphone/tête. |
| Yaw 3⁄4 | 10° inclus–30° exclu | 8°–30° inclus | Accepter gauche et droite sans imposer un profil prononcé. |
| Stabilité | 4 frames | 2 frames | Réduire l’attente tout en exigeant deux mesures consécutives. |
| Baisse de netteté transitoire | 2 frames | 3 frames | Absorber les micro-mouvements mobiles. |

Une image légèrement douce (`>= 50 %` du seuil de netteté conseillé) peut rendre
le cadre vert et reste classée `acceptable` après capture. En dessous, elle est
rejetée comme réellement floue.

## Image finale

- La capture native haute résolution est préférée ; la frame vidéo est le fallback.
- L’orientation EXIF est appliquée par `createImageBitmap`.
- Le crop conserve le ratio exact de la prévisualisation et vise un visage à
  environ 58 % de la hauteur, au lieu de 70 %, pour éviter un cadrage final trop
  serré et préserver front, joues, nez et menton.
- La plus grande dimension reste limitée à 4095 px conformément au contrat
  fournisseur, sans upscale.
- Le JPEG est produit une fois à qualité 0,95 avec rééchantillonnage haute qualité.
- Le backend conserve ensuite le JPEG octet pour octet s’il est déjà conforme,
  ce qui supprime le double encodage historique.
