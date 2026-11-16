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

- Le flux vidéo sert **uniquement au guidage**. Aucune frame vidéo ne devient une photo client.
- La capture via `ImageCapture.takePhoto()` est obligatoire dans la caméra guidée.
  Si elle échoue ou est indisponible, la caméra propose une vraie prise de vue
  via l'appareil natif du téléphone (`input capture="user"`), sans substitution silencieuse.
- Lorsque `getPhotoCapabilities()` renvoie des dimensions maximales exploitables,
  celles-ci sont demandées à `takePhoto()`. Si les paramètres sont refusés, un
  second essai `takePhoto()` sans paramètres reste une photographie native.
- L’orientation EXIF est appliquée par `createImageBitmap`.
- La photo fixe conserve son propre ratio de capteur. Le recadrage autour du
  visage, si nécessaire, vise environ 58 % de hauteur sans imposer le ratio
  plus étroit de l'aperçu vidéo, qui pourrait écarter joues et tempes.
- La plus grande dimension reste limitée à 4095 px conformément au contrat
  fournisseur, sans upscale.
- La sortie JPEG tente d'abord les qualités 0,95 à 0,80, **à pixels constants**.
  Un encodeur qui renvoie un autre format est refusé.
  Le rééchantillonnage n'intervient que si toutes les tentatives dépassent 5 Mo.
  Chaque tentative repart de l'image source décodée, jamais d'un JPEG déjà compressé.
  Un JPEG ne garantit pas une conservation strictement sans perte des détails fins.
- Les photos importées sont conservées octet pour octet lorsqu'elles sont déjà
  conformes ; sinon elles utilisent la même normalisation. Le sélecteur accepte
  les images HEIC lorsque le navigateur sait les décoder ; une conversion
  impossible produit une erreur explicite.
- La limite de 5 Mo est interprétée prudemment comme 5 000 000 octets. La
  validation avertit lorsque le petit côté du visage détecté est ≤ 400 px,
  seuil indicatif mentionné par Zyla.
- Le backend conserve ensuite le JPEG octet pour octet s’il est déjà conforme.
- Le paramètre local `?photoDiagnostics` révèle un volet « Détails techniques de la photo » :
  résolution du flux, maximum annoncé par le navigateur lorsqu'il existe,
  résolution native capturée, recadrage, dimensions JPEG, poids, qualité et réduction.
  Ces métriques ne prouvent pas l'accès à la résolution physique absolue du capteur
  et ne sont pas enregistrées en backend. La résolution demandée n'est jamais
  qualifiée de résolution maximale physiquement atteinte.

## Contrôle sur appareils réels

- Photographier la même personne dans les mêmes conditions via SkinView et l'appareil photo natif.
- Comparer les dimensions de l'image brute (avant crop) et les détails fins à
  100 % : pores, texture, ridules, sans filtres de beauté.
- Tester Safari iOS récent, Android Chrome, et le parcours « appareil photo natif »
  après indisponibilité/échec de `takePhoto()`.
- Vérifier que les deux prises de vue respectent le contrat Zyla (JPEG, 5 Mo,
  dimensions 201 à 4095 px) et que les erreurs de capture ne génèrent aucune frame vidéo.
