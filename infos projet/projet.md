 
Institut catholique des arts et métiers
  		 Université catholique d’Afrique centrale
 
Mandat pour le développement d’un prototype de gestion intelligente d’agricole
Système Agricole Intelligent

Historique
Diffusion	Resp.	Description
2025-02-27	DP, DN, BF	Première version complète.
 		 
 
Table des matières
Introduction	3
I.	Vision	4
1.	Contexte	4
2.	Parties prenantes	4
3.	Objectifs	5
4.	Fonctionnalités générales	6
II.	Fonctionnement du prototype	9
1.	Procédés	9
2.	Architecture du système	12
III.	Modalités communes	14
1.	Document de spécification	14
2.	Document de conception	14
3.	Document de gestion de projet	15
IV.	Application d’exploitation (AE)	15
1.	Intrants	16
2.	Extrants	16
3.	Fonctionnalités	16
4.	Diagramme d’utilisation	16
5.	Diagramme d’interaction (flux)	16
6.	Réalisation	17
V.	Application d’automatisation (AA)	17
1.	Fonctionnalités	17
2.	Réalisation	17
VI.	Déroulement du projet	17

 
Introduction
L’agriculture évolue avec les avancées technologiques pour répondre aux défis modernes. Dans cette dynamique, une coopérative agricole locale (CAL) lance un projet visant à développer un prototype de système de gestion agricole intelligent intégrant des technologies IoT pour optimiser la surveillance et l’automatisation des exploitations. Ce projet permettra aux étudiants de mobiliser leurs compétences techniques pour concevoir une solution innovante qui répond aux enjeux de l’agriculture moderne. Le système est baptisé : “Agriculture intelligente”
Les objectifs fondamentaux à atteindre par les étudiants dans le cadre de ce projet sont les suivants :
1.	Concevoir et développer le prototype du système.
2.	Tester les plateformes technologiques envisagées pour le système.
3.	Recueillir les avis des parties prenantes après l’expérimentation du prototype.
Le prototype couvre la surveillance environnementale des parcelles agricoles, l'automatisation de certaines actions comme l'irrigation ou la ventilation des cultures sous serre et la sécurisation de l’infrastructure réseau.
Une équipe composée d’enseignants de l’Institut Ucac-Icam a pour mandat d’évaluer le prototype et d’assurer son alignement avec les objectifs pédagogiques des modules suivants : GINF421, INF0471, GNIF321, GINF432, INF0441, GLOG311, GINF331 et INF0331.
Le projet est divisé en trois composantes principales :
1.	Le système IoT : Intégration de capteurs, actionneurs et communication des données.
2.	L’application web d’exploitation : Interface graphique pour la visualisation et le contrôle du système.
3.	L’application d’automatisation : Interface en ligne de commande (CLI) et scripts batch pour la gestion des actions en masse sur les actionneurs. 
Chacune de ces composantes devra être analysée, modélisée, conçue, programmée, vérifiée, testée et validée en accord avec les attentes des parties prenantes. La vision détaillée du projet est présentée en section 1, suivie du fonctionnement du système en section 2. Les aspects communs aux différentes composantes sont décrits en section 3, tandis que les détails techniques liées à la réalisation de l’application web et de l’application d’automatisation sont abordés dans les sections 4, 5 et 6.
I.	Vision
1.	Contexte
Dans un monde où l’agriculture est confrontée à de nombreux défis – changement climatique, optimisation des ressources et besoin accru d’automatisation – le projet Agriculture intelligente ambitionne d’apporter une réponse innovante. Grâce à une plateforme intelligente et connectée, ce système vise à moderniser la gestion des cultures en intégrant des capteurs IoT, des actionneurs automatisés et une interface web interactive.
L’objectif principal est d’offrir aux agriculteurs un suivi et un pilotage de leurs exploitations, tout en réduisant leur charge de travail et de permettre des meilleures prises de décisions. L’application permettra non seulement de suivre l’évolution des conditions environnementales (température, humidité du sol, niveau de CO₂), mais aussi de déclencher automatiquement des actions essentielles telles que l’irrigation et la ventilation des serres.
Le système Agriculture intelligente ne se limite pas à un simple suivi des cultures : il repose sur une gestion intelligente et proactive. Les capteurs analyseront en continu les paramètres environnementaux, et l’interface affichera des alertes en cas d’anomalie (baisse critique du niveau d’eau, surchauffe, pollution excessive de l’air). Un historique détaillé des événements sera également accessible, permettant aux exploitants d’optimiser leurs interventions.
Le prototype initial couvrira plusieurs aspects essentiels :
-	La collecte et l’analyse des données via une base de données centralisée.
-	Un tableau de bord dynamique offrant une visualisation claire et en temps réel.
-	Un système de gestion des équipements permettant d’administrer capteurs et actionneurs.
-	L’intégration d’un batch script facilitant l’exécution d’actions en masse via ligne de commande.
Enfin, pour assurer une accessibilité maximale, l’application sera multilingue (français, anglais) et déclinée en version web responsive, permettant aux exploitants de suivre leurs cultures partout et à tout moment.
2.	Parties prenantes

Le succès de ce projet repose sur l’expertise et la collaboration de plusieurs acteurs :
-	Les agriculteurs, au cœur du projet, bénéficieront d’un outil leur permettant de mieux gérer leurs cultures et d’optimiser leur production.
-	Les ingénieurs en automatisation et en réseaux seront en charge de concevoir l’infrastructure IoT et d’assurer la transmission des données en toute sécurité.
-	Les développeurs web travaillent à la création d’une interface intuitive et responsive pour permettre un suivi en temps réel sur ordinateur et mobile.
3.	Objectifs
Le projet suivant nous propose donc le panel d’objectifs à atteindre ci-dessous : 
1)	Collecte des données avec des capteurs :
L’un des premiers objectifs est de mettre en place un système de capteurs environnementaux capable de mesurer des indicateurs essentiels. Les informations collectées, seront envoyées vers l’application web qui sera chargée de les stocker dans une base de données centralisée, permettant une analyse précise de l’évolution des conditions de culture. 
2)	Automatisation avec un microcontrôleur : 
L’objectif est d’assurer une gestion centralisée des parcelles agricoles au moyen d’un microcontrôleur qui devra automatiser un certain nombre de tâches en fonction des données collectées par les capteurs.
3)	Visualisation des données collectées via une application web : 
Pour exploiter tout le potentiel de ce système, Agriculture intelligente s’appuie sur une interface numérique conçue pour être ergonomique et accessible. Grâce à cette plateforme, les exploitants pourront anticiper les problèmes avant qu’ils ne deviennent critiques et prendre des décisions éclairées et réactives.
4)	Sécurisation de l’architecture : 
Agriculture intelligente intègre ainsi un volet sécurité essentiel à son bon fonctionnement. L’objectif est d’éviter toute intrusion ou manipulation malveillante des équipements et des données.

En combinant technologie, automatisation et sécurité, Agriculture intelligente ambitionne de redéfinir les pratiques agricoles en les rendant plus intelligentes, plus durables et plus rentables. Grâce à cet outil, les agriculteurs pourront :
-	Maximiser leurs rendements en assurant un suivi précis des cultures.
-	Réduire leur consommation d’eau grâce à une irrigation optimisée.
-	Prendre des décisions basées sur des données fiables plutôt que sur des estimations.
-	Connecter leurs exploitations à un réseau intelligent, accessible partout et à tout moment.
4.	Fonctionnalités générales
1)	Une Surveillance des parcelles agricoles grâce à des capteurs intelligents et un microcontrôleur 
L’un des piliers de Agriculture intelligente est la collecte en continu de données environnementales grâce à des capteurs IoT répartis sur l’exploitation. Ces capteurs permettent de surveiller plusieurs paramètres essentiels :
-	L’humidité du sol, pour éviter un arrosage excessif ou insuffisant.
-	La température ambiante, afin d’anticiper les périodes de chaleur ou de froid extrêmes.
-	Le taux de CO₂, un indicateur clé de la qualité de l’air dans les serres.
-	La luminosité, paramètre essentiel de la croissance des plantes
Ces données seront ensuite envoyées vers l’application web et seront traitées et analysées afin d’offrir une vision précise de l’état des cultures et de déclencher, si nécessaire, des actions automatiques.

2)	Automatisation des actions agricoles grâce aux actionneurs
L’une des innovations majeures de Agriculture intelligente réside dans sa capacité à automatiser certaines tâches pour limiter l’intervention humaine et optimiser l’exploitation des ressources. Parmi ces automatismes :
●	Arrosage automatique : L’irrigation est un élément clé de la gestion agricole. Agriculture intelligente permet de déclencher automatiquement l’arrosage lorsque l’humidité du sol descend en dessous d’un seuil critique. Ce mécanisme offre plusieurs avantages qui sont entre autres la réservation des ressources en eau, en évitant un arrosage inutile, une meilleure croissance des cultures, grâce à une irrigation adaptée à leurs besoins réels et une réduction de la charge de travail, en supprimant l’intervention manuelle.
●	Déclenchement de la ventilation : Dans les serres, la régulation de la température et du taux de CO₂ est essentielle pour assurer un environnement optimal. Agriculture intelligente intègre un système de ventilation intelligente :
●	Si la température dépasse un seuil critique
●	Si le taux de CO₂ devient trop élevé
●	Eclairage automatique : La luminosité étant un facteur essentiel à la croissance des plantes, on devra effectuer des actions “allumer” ou “éteindre” selon la période de la journée (jour et nuit).

3)	Une application web pour une gestion centralisée
Pour que les agriculteurs puissent exploiter facilement ces informations, ils auront à leur disposition une application web avec une base de données, comportant au minimum trois (03) pages web et assurant les fonctionnalités suivantes :
-	Authentification des utilisateurs (login et mot de passe)
-	Affichage des différentes données collectées par les capteurs en fonction du temps.
-	Envoie des actions au contrôleur afin d’effectuer des tâches spécifiques (arrosage automatique, déclenchement de la ventilation)
-	Historisation des actions du système : Les actions et les mesures doivent être  sont enregistrées dans un journal consultable à tout moment et pouvant être exporté en cas de besoin sous format CSV.
Cette application permettra aux agriculteurs de suivre l’évolution de leurs récoltes et réaliser au besoin des tâches, indépendamment de celles réalisées automatiquement par le microcontrôleur.
Ces automatismes permettent de préserver la santé des cultures tout en optimisant la consommation énergétique.
4)	Notifications et Alertes
Pour garantir une surveillance efficace, Agriculture intelligente envoie des alertes immédiates en cas d’anomalie. Ces notifications doivent être transmises via L’application web, pour un accès rapide à l’information.
Les types d’alertes incluent :
-	Seuil critique d’humidité du sol atteint → nécessité d’irrigation : Sera déclenché lorsque l’humidité recueillie atteint un seuil critique défini préalablement par l’utilisateur.
-	Température trop élevée ou trop basse → risque pour les cultures : Sera déclarée lorsque la température mesurée dépasse ou descend en dessous des seuils définis, indiquant un risque pour les cultures.
-	Taux de CO₂ anormalement élevé → besoin d’aération : Sera déclenché lorsque la concentration de CO₂ dépasse le seuil de sécurité, nécessitant une ventilation pour préserver un environnement optimal.
-	Réservoir d’eau vide → intervention requise : Sera déclenché lorsque le niveau d’eau du réservoir atteint un seuil minimal critique, indiquant la nécessité d’un remplissage pour assurer l’irrigation.
-	Luminosité continuellement basse → nécessité d’allumer les lumières : Sera déclenché lorsque le niveau de luminosité reste en dessous du seuil défini pendant une période prolongée, indiquant la nécessité d’un éclairage artificiel pour assurer des conditions optimales de croissance des cultures.

5)	Sécurisation de l’architecture et des données
Agriculture intelligente intègre plusieurs mécanismes de protection pour garantir la fiabilité du système :
-	Les informations critiques notamment les mots de passe utilisateurs devront être chiffrées
-	Un protocole de communication sécurisé devra être utilisé pour récupérer les données des capteurs IoT. 
-	Chacune des exécutions du script devra être enregistrée dans un fichier log
-	Les utilisateurs ayant accès à l’interface web devront avoir des privilèges différents (consultation, modification)
Ces mesures garantissent un fonctionnement stable et sécurisé, protégeant les agriculteurs contre tout risque de piratage ou de dysfonctionnement.
6)	Intégration d’un batch script pour l’exécution d’actions en masse
Dans un souci d’optimisation, Agriculture intelligente prévoit l’intégration d’un batch script, permettant d’exécuter des actions mentionnées plus hauts (arrosage et déclenchement de la ventilation ) en via la ligne de commande (CLI) sans utiliser directement le microcontrôleur ou l’application web.
II.	Fonctionnement du prototype 

1.	Procédés

La solution Agriculture intelligente devra effectuer :
1.	Une collecte des données environnementales : Les capteurs jouent un rôle crucial dans la surveillance des paramètres environnementaux et permettent donc d'obtenir des mesures précises 
Ces données seront envoyées vers un serveur pour pouvoir être analyser et traiter. Afin de mener cette collecte nous utiliserons : 
❖	Capteur d'humidité du sol (ex: YL-69) : Mesure le niveau d’humidité pour éviter le stress hydrique ou l’excès d’eau.

❖	Capteur de température et d'humidité (DHT22) : pour le Suivi des conditions climatiques influençant la croissance des cultures.

❖	 Capteur de luminosité (BH1750): permettant de vérifier si l’exposition lumineuse est optimale pour la photosynthèse.


❖	Capteur de CO2 SEN0159 : permettant de détecter la présence de CO2. Couplé à un booster 6V permettant de mettre le capteur à température pour avoir une mesure précise

❖	 Capteur de niveau d’eau pour le réservoir :  est un dispositif utilisé pour détecter le niveau de liquide dans un réservoir. Le commutateur peut actionner une pompe, un indicateur, une alarme, ou un autre dispositif. 


Et des actionneurs tel que : 
-	Une pompe d’irrigation (relais 5V)  : qui active l’irrigation automatique selon les besoins détectés


2.	Une automatisation des processus :
-	 Analyse des données reçues : Le système évalue si l’humidité du sol est inférieure au seuil défini.
-	Actions automatiques : Si besoin, la pompe d’irrigation est activée pour apporter l’eau nécessaire.
-	Actionneur déclenché : La pompe fonctionne jusqu’à atteindre un niveau d’humidité optimal, puis s’arrête automatiquement.
-	 Effectue des notifications et des alertes : En cas d’anomalie (manque d’eau, panne de capteur…), une alerte est envoyée à l’utilisateur via l’interface web.
3.	Interaction utilisateur : L’utilisateur pourra visualiser et intervenir via l’interface web ou en ligne de commande. Pour : 
-	Accéder aux données des capteurs (application web uniquement)
-	Contrôler manuellement les actions (application web uniquement et en ligne de commande)
-	Définir les paramètres seuils de surveillance (seuils d'humidité et fréquence des mesures) (application web uniquement)
-	Visualiser l’historique des actions sur les cultures pour analyse 
2.	Architecture du système 
L’architecture de la solution à concevoir reposera donc sur 3 couches : 
1.	Une couche Capteurs & Actionneurs 
Cette couche permettra d'initier tout ce qui recueille des paramètres environnementaux pour l’analyse et les activations des différentes actions de régularisation par le biais des actionneurs. Ici l’étudiant mettra en place toute la connectique nécessaire à la collecte des données ambiantes. 
2.	Une couche Microcontrôleur et Communication
Cette couche sera en charge de la centralisation des données des capteurs, du stockage, l’analyse et de l’envoie des données vers le serveur. Elle gère l’activation des actionneurs selon les seuils définis dans le système. La communication avec les différents éléments du système se fera via les protocoles : 
●	MQTT (Pour la collecte des données des capteurs)
●	HTTP (Pour la communication entre le microcontrôleur et l’application web)
Dans le cadre de ce projet nous serons amenés à utiliser une ESP32 (Wi-Fi + Bluetooth) ou Arduino avec module Wi-Fi (ESP8266) en guise de microcontrôleur :

3.	Une application web et base de données
Le système sera muni d’une base de données centralisée au choix (MySQL/PostgreSQL/Firebase) pour le stockage de l’historique des mesures et des actions. 
Un backend qui permettra le traitement des données reçues et appliquera les règles d'automatisation.
Un front end qui permettra la construction d’un Dashboard accessible pour la visualisation muni d’une interface intuitive pour la gestion du système.

 

III.	Modalités communes
Pour la réalisation de ce projet, plusieurs documents devront être rédigés afin d’assurer une structuration rigoureuse et une bonne traçabilité des travaux effectués. Ces documents permettront de définir les exigences, de concevoir les différentes composantes du système et d’organiser la gestion du projet.
1.	Document de spécification
Ce document détaillera l’analyse du besoin, la spécification des exigences fonctionnelles et techniques du système. 
2.	Document de conception
Il s’agira d’un document essentiel qui devra impérativement inclure :
●	L’architecture générale : Définition des différentes couches du système (back-end, front-end, IoT, base de données).
●	Maquette du système IoT : Dispositions des capteurs, protocoles de communication et intégration avec l’application.
●	Les diagrammes : Diagrammes de cas d’utilisation, diagrammes d’interaction. 
3.	Document de gestion de projet
Ce document servira à organiser le développement du projet et à garantir un bon suivi des ressources et du temps. Il comprendra :
●	La planification des tâches : Conception d’un planning prévisionnel de travail pour la durée entière du projet.  Le planning réel du projet sera présenté pendant la soutenance.
●	L’analyse financière du projet : Estimation des coûts des équipements IoT, de l’hébergement (Supposez que votre application web est hébergée) et des outils nécessaires.
L’ensemble de ces documents devra être rédigé de manière formelle, à l’exception de certains éléments de conception comme l’architecture IoT ou certaines modélisations spécifiques, qui pourront être directement intégrées aux artefacts. Ces derniers pourront être réalisés à l’aide d’environnements tels que Proteus ou Flowgorithme pour la simulation de circuits électroniques ou d’autres outils adaptés au projet.
La rigueur dans la rédaction et l’organisation de ces documents garantira une meilleure compréhension du projet et facilitera son implémentation.

IV.	Application d’exploitation (AE)
L’application d’exploitation (AE) constitue l’interface principale permettant aux utilisateurs d’interagir avec le système. Il s’agit de concevoir une application web qui exploitera les données collectées par les capteurs et permet une gestion centralisée des informations et des actions à effectuer sur l’exploitation agricole. Cette application comprend plusieurs fonctionnalités essentielles, notamment l’affichage des mesures, l’envoi d’alertes en cas d’anomalie, le déclenchement manuel ou automatique des actionneurs, ainsi que la gestion des accès.
L’AE devra être intuitive, sécurisée et accessible sur plusieurs types d’appareils (ordinateur, tablette, mobile), c'est-à-dire une application web responsive. Elle adoptera une architecture client-serveur, avec un back-end chargé du traitement des données et un front-end permettant la visualisation et l’interaction avec l’utilisateur.
Le script Batch fait aussi partie intégrante de l’AE. Il constitue le deuxième moyen par lequel les agriculteurs pourront réaliser des actions sur leurs plantations. Ce script pourra leur donner la possibilité de choisir dans un menu l’action qu’ils souhaitent réaliser (arrosage, ventilation, luminosité).
1.	Intrants
L’AE traitera en entrée les données suivantes : 
●	Les données des capteurs :
-	Température ambiante
-	Humidité du sol
-	Niveau de CO₂
-	Luminosité 
●	Les données des utilisateurs à savoir leurs informations de connexion (nom d’utilisateur, mot de passe, rôle)
2.	Extrants
Les données à sortie seront l’ensemble des paramètres (température etc.) collectées sous formes d'historique via l’interface web.
3.	Fonctionnalités
Se référer à la section 3 (Une application web pour une gestion centralisée), portant sur les fonctionnalités, dans la partie Vision.
4.	Diagramme d’utilisation
Il est question de réaliser un diagramme des cas d’utilisation pour représenter les acteurs et les interactions entre les utilisateurs et les différentes fonctionnalités du système.
5.	Diagramme d’interaction (flux)
Un diagramme UML de flux devra être conçu pour illustrer le parcours des données (de la capture des mesures à l’affichage sur le tableau de bord) et les interactions entre le serveur, la base de données et l’interface utilisateur.
6.	Réalisation
Concernant les technologies de développement, les étudiants ont la possibilité de choisir les outils (framework possibles) qu’ils devront utiliser, selon les besoins et les compétences de l’équipe. 
V.	Application d’automatisation (AA)
L’application d’automatisation (AA) est un composant essentiel du système de gestion intelligente des exploitations agricoles. Elle permet d’automatiser des actions critiques pour améliorer la productivité et réduire la charge de travail des agriculteurs.
1.	Fonctionnalités
Se référer à la section 2 (Automatisation des actions agricoles grâce aux actionneurs), portant sur les fonctionnalités, dans la partie Vision.  Les sections 1 et 4 de cette même partie peuvent vous servir à la bonne compréhension des fonctionnalités à réaliser. 
2.	Réalisation
L’automatisation des actions se fera à travers la programmation du microcontrôleur.
VI.	Déroulement du projet
Afin de mener à bien le projet, des groupes de travail de 6 personnes seront constitués pour couvrir tous les aspects techniques et méthodologiques liés à la réalisation de ce dernier.
Le projet s'étalera sur une durée de 4 semaines. Durant laquelle les étudiants seront amenés à :
Semaine 1 : 
-	Ressortir un document de spécification technique
-	Ressortir la liste complète des éléments matériel nécessaire pour montage
-	Ressortir une représentation schématique du montage du prototype
-	 Premier test de connexion ESP32 aux capteurs
Semaine 2 : 
-	Ressortir le plan de la maquette du prototype à concevoir au Fablab
-	Ressortir les diagrammes de l’application 
-	Ressortir un MCD
-	Développer le code ESP32 pour la lecture des capteurs
-	Envoyer les données via Wi-Fi/MQTT/HTTP vers un serveur.
-	Créer une base de données pour stocker les relevés.
-	Tester l’intégration ESP32 – Base de données.
Semaine 3 : 
-	Concevoir un mockup de la solution 
-	Concevoir les scripts de gestions des actionneurs
-	Dashboard web opérationnel avec affichage des données capteurs.
-	Automatisation fonctionnelle des actionneurs selon les seuils définis
-	Présentation du MVP 
Semaine 4 : 
-	Présentation du projet complet Prototype + Site Web
-	Rapport final de présentation
 
Produit le 2025-03-20 20:12:06 -0400
 
Institut catholique des arts et métiers
Université catholique d’Afrique centrale
