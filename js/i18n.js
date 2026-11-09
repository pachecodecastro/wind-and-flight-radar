// Interface texts in the six languages of quintopontocardeal.org, one dictionary per
// language with the same keys everywhere. Portuguese is the default.
//
// The language comes from ?lang= in the address, otherwise from the browser's
// languages, otherwise Portuguese. Place names (cities and airports) are not translated.

export const LANGS = ['pt', 'en', 'es', 'fr', 'nl', 'de'];
const DEFAULT_LANG = 'pt';
const LOCALES = { pt: 'pt-PT', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', nl: 'nl-NL', de: 'de-DE' };

// Links used inside translated paragraphs, written as {name} in the texts.
const LINKS = {
  omcom: ['https://open-meteo.com/', 'Open-Meteo.com'],
  om: ['https://open-meteo.com/', 'Open-Meteo'],
  adsb: ['https://adsb.lol/', 'adsb.lol'],
  ne: ['https://www.naturalearthdata.com/', 'Natural Earth'],
};

export const STRINGS = {
  pt: {
    meta_description: 'Mapa de vento e temperatura para as próximas 48 horas, com radar de voos.',
    map_label: 'Mapa de vento e voos. Toque num ponto para ver o vento e a temperatura, ou num avião para ver o voo.',
    loading: 'A carregar a previsão',
    about_label: 'Sobre esta app e fontes de dados',
    locate_label: 'Centrar na minha localização',
    lang_label: 'Idioma',
    dock_label: 'Camadas e linha temporal',
    color_label: 'Cor do mapa',
    mode_wind: 'Vento',
    mode_temp: 'Temperatura',
    flights: 'Voos',
    play: 'Reproduzir a previsão',
    pause: 'Pausar a previsão',
    today: 'hoje',
    now: 'agora',
    in_hours: 'daqui a {n} h',
    slider_label: 'Hora da previsão',
    credits_html: 'Previsão {omcom} (CC BY 4.0). Voos {adsb} (ODbL). Mapa {ne}.',
    sheet_label: 'Detalhes do voo',
    sheet_close: 'Fechar detalhes do voo',
    f_alt: 'Altitude',
    f_gs: 'Velocidade',
    f_trk: 'Rumo',
    f_vr: 'Razão vertical',
    f_type: 'Aeronave',
    f_sq: 'Squawk',
    close: 'Fechar',
    info_intro: 'O vento e a temperatura das próximas 48 horas, com o tráfego aéreo por cima. Toque no mapa para ver os valores num ponto, ou num avião para ver o voo. O botão de reprodução anima a previsão hora a hora.',
    info_data_title: 'De onde vêm os dados',
    info_data_html: 'A previsão vem da {om}, que junta modelos de vários serviços meteorológicos nacionais (licença CC BY 4.0). Os voos ao vivo vêm da rede comunitária de recetores ADS-B {adsb}. O contorno dos países é da Natural Earth.',
    info_how_title: 'Como foi feito',
    info_how: 'JavaScript sem frameworks, Leaflet para o mapa e canvas para as partículas de vento e os aviões. Funciona no telemóvel e pode ser instalada como app.',
    made_by: 'Feito por',
    view_code: 'Ver o código no GitHub',
    radius_note: 'Os voos ao vivo aparecem num raio de 460 km do centro do mapa',
    flights_offline: 'Sem ligação ao serviço de voos. A mostrar voos simulados.',
    locate_failed: 'Não foi possível obter a sua localização',
    no_type: 'Aeronave sem tipo indicado',
    on_ground: 'No solo',
    climbing: 'a subir',
    descending: 'a descer',
    level: 'nivelado',
    source_sim: 'Voo simulado para demonstração. Rotas e companhias plausíveis, posições inventadas.',
    source_live: 'Dados ADS-B ao vivo da rede adsb.lol. Origem e destino não fazem parte destes dados.',
    wind_from: 'de {dir}',
    no_data: 'Sem dados para este ponto. Aproxime-se da zona colorida.',
    status_live: 'Previsão ao vivo',
    status_demo: 'Previsão de demonstração',
    status_flights_live: 'Voos ao vivo',
    status_flights_sim: 'Voos simulados',
    mode_both: 'Neste momento a previsão mostrada é um campo de vento sintético (uma depressão no Atlântico), porque a Open-Meteo não está acessível daqui, e os aviões são simulados, porque não está configurado um proxy para os dados ADS-B. A barra de cima indica sempre o que é real e o que é demonstração.',
    mode_weather: 'Neste momento a previsão mostrada é um campo de vento sintético (uma depressão no Atlântico), porque a Open-Meteo não está acessível daqui. A barra de cima indica sempre o que é real e o que é demonstração.',
    mode_flights: 'Neste momento os aviões são simulados, porque não está configurado um proxy para os dados ADS-B. A barra de cima indica sempre o que é real e o que é demonstração.',
    mode_real: 'Neste momento todos os dados são reais.',
    compass: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
    hemispheres: ['N', 'S', 'E', 'O'],
  },

  en: {
    meta_description: 'Wind and temperature map for the next 48 hours, with a flight radar.',
    map_label: 'Wind and flight map. Tap a point to see the wind and temperature, or a plane to see its flight.',
    loading: 'Loading the forecast',
    about_label: 'About this app and its data sources',
    locate_label: 'Centre on my location',
    lang_label: 'Language',
    dock_label: 'Layers and timeline',
    color_label: 'Map colour',
    mode_wind: 'Wind',
    mode_temp: 'Temperature',
    flights: 'Flights',
    play: 'Play the forecast',
    pause: 'Pause the forecast',
    today: 'today',
    now: 'now',
    in_hours: 'in {n} h',
    slider_label: 'Forecast hour',
    credits_html: 'Forecast {omcom} (CC BY 4.0). Flights {adsb} (ODbL). Map {ne}.',
    sheet_label: 'Flight details',
    sheet_close: 'Close flight details',
    f_alt: 'Altitude',
    f_gs: 'Speed',
    f_trk: 'Heading',
    f_vr: 'Vertical rate',
    f_type: 'Aircraft',
    f_sq: 'Squawk',
    close: 'Close',
    info_intro: 'The wind and temperature for the next 48 hours, with air traffic on top. Tap the map to see the values at a point, or a plane to see its flight. The play button animates the forecast hour by hour.',
    info_data_title: 'Where the data comes from',
    info_data_html: 'The forecast comes from {om}, which combines models from several national weather services (CC BY 4.0 licence). Live flights come from {adsb}, a community network of ADS-B receivers. Country outlines are from Natural Earth.',
    info_how_title: 'How it was made',
    info_how: 'JavaScript with no frameworks, Leaflet for the map and canvas for the wind particles and the planes. It works on phones and can be installed as an app.',
    made_by: 'Made by',
    view_code: 'View the code on GitHub',
    radius_note: 'Live flights are shown within 460 km of the map centre',
    flights_offline: 'No connection to the flight service. Showing simulated flights.',
    locate_failed: 'Your location could not be found',
    no_type: 'Aircraft type not given',
    on_ground: 'On the ground',
    climbing: 'climbing',
    descending: 'descending',
    level: 'level',
    source_sim: 'Simulated flight for demonstration. Plausible routes and airlines, invented positions.',
    source_live: 'Live ADS-B data from the adsb.lol network. Origin and destination are not part of this data.',
    wind_from: 'from {dir}',
    no_data: 'No data for this point. Move closer to the coloured area.',
    status_live: 'Live forecast',
    status_demo: 'Demo forecast',
    status_flights_live: 'Live flights',
    status_flights_sim: 'Simulated flights',
    mode_both: 'Right now the forecast shown is a synthetic wind field (a low over the Atlantic), because Open-Meteo cannot be reached from here, and the planes are simulated, because no proxy is set up for the ADS-B data. The top bar always shows what is real and what is a demonstration.',
    mode_weather: 'Right now the forecast shown is a synthetic wind field (a low over the Atlantic), because Open-Meteo cannot be reached from here. The top bar always shows what is real and what is a demonstration.',
    mode_flights: 'Right now the planes are simulated, because no proxy is set up for the ADS-B data. The top bar always shows what is real and what is a demonstration.',
    mode_real: 'Right now all the data is real.',
    compass: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
    hemispheres: ['N', 'S', 'E', 'W'],
  },

  es: {
    meta_description: 'Mapa de viento y temperatura para las próximas 48 horas, con radar de vuelos.',
    map_label: 'Mapa de viento y vuelos. Toque un punto para ver el viento y la temperatura, o un avión para ver el vuelo.',
    loading: 'Cargando la previsión',
    about_label: 'Acerca de esta aplicación y de las fuentes de datos',
    locate_label: 'Centrar en mi ubicación',
    lang_label: 'Idioma',
    dock_label: 'Capas y línea temporal',
    color_label: 'Color del mapa',
    mode_wind: 'Viento',
    mode_temp: 'Temperatura',
    flights: 'Vuelos',
    play: 'Reproducir la previsión',
    pause: 'Pausar la previsión',
    today: 'hoy',
    now: 'ahora',
    in_hours: 'dentro de {n} h',
    slider_label: 'Hora de la previsión',
    credits_html: 'Previsión {omcom} (CC BY 4.0). Vuelos {adsb} (ODbL). Mapa {ne}.',
    sheet_label: 'Detalles del vuelo',
    sheet_close: 'Cerrar los detalles del vuelo',
    f_alt: 'Altitud',
    f_gs: 'Velocidad',
    f_trk: 'Rumbo',
    f_vr: 'Velocidad vertical',
    f_type: 'Aeronave',
    f_sq: 'Squawk',
    close: 'Cerrar',
    info_intro: 'El viento y la temperatura de las próximas 48 horas, con el tráfico aéreo encima. Toque el mapa para ver los valores en un punto, o un avión para ver el vuelo. El botón de reproducción anima la previsión hora a hora.',
    info_data_title: 'De dónde vienen los datos',
    info_data_html: 'La previsión viene de {om}, que combina modelos de varios servicios meteorológicos nacionales (licencia CC BY 4.0). Los vuelos en directo vienen de {adsb}, una red comunitaria de receptores ADS-B. El contorno de los países es de Natural Earth.',
    info_how_title: 'Cómo se hizo',
    info_how: 'JavaScript sin frameworks, Leaflet para el mapa y canvas para las partículas de viento y los aviones. Funciona en el móvil y se puede instalar como aplicación.',
    made_by: 'Hecho por',
    view_code: 'Ver el código en GitHub',
    radius_note: 'Los vuelos en directo se muestran en un radio de 460 km desde el centro del mapa',
    flights_offline: 'Sin conexión con el servicio de vuelos. Se muestran vuelos simulados.',
    locate_failed: 'No se ha podido obtener su ubicación',
    no_type: 'Aeronave sin tipo indicado',
    on_ground: 'En tierra',
    climbing: 'ascendiendo',
    descending: 'descendiendo',
    level: 'nivelado',
    source_sim: 'Vuelo simulado para la demostración. Rutas y aerolíneas verosímiles, posiciones inventadas.',
    source_live: 'Datos ADS-B en directo de la red adsb.lol. El origen y el destino no forman parte de estos datos.',
    wind_from: 'del {dir}',
    no_data: 'No hay datos para este punto. Acérquese a la zona coloreada.',
    status_live: 'Previsión en directo',
    status_demo: 'Previsión de demostración',
    status_flights_live: 'Vuelos en directo',
    status_flights_sim: 'Vuelos simulados',
    mode_both: 'En este momento, la previsión que se muestra es un campo de viento sintético (una borrasca en el Atlántico), porque Open-Meteo no es accesible desde aquí, y los aviones son simulados, porque no hay ningún proxy configurado para los datos ADS-B. La barra superior indica siempre qué es real y qué es demostración.',
    mode_weather: 'En este momento, la previsión que se muestra es un campo de viento sintético (una borrasca en el Atlántico), porque Open-Meteo no es accesible desde aquí. La barra superior indica siempre qué es real y qué es demostración.',
    mode_flights: 'En este momento, los aviones son simulados, porque no hay ningún proxy configurado para los datos ADS-B. La barra superior indica siempre qué es real y qué es demostración.',
    mode_real: 'En este momento, todos los datos son reales.',
    compass: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
    hemispheres: ['N', 'S', 'E', 'O'],
  },

  fr: {
    meta_description: 'Carte du vent et de la température pour les 48 prochaines heures, avec un radar des vols.',
    map_label: 'Carte du vent et des vols. Touchez un point pour voir le vent et la température, ou un avion pour voir son vol.',
    loading: 'Chargement de la prévision',
    about_label: 'À propos de cette application et des sources de données',
    locate_label: 'Centrer sur ma position',
    lang_label: 'Langue',
    dock_label: 'Calques et chronologie',
    color_label: 'Couleur de la carte',
    mode_wind: 'Vent',
    mode_temp: 'Température',
    flights: 'Vols',
    play: 'Lancer la prévision',
    pause: 'Mettre la prévision en pause',
    today: 'aujourd’hui',
    now: 'maintenant',
    in_hours: 'dans {n} h',
    slider_label: 'Heure de la prévision',
    credits_html: 'Prévision {omcom} (CC BY 4.0). Vols {adsb} (ODbL). Carte {ne}.',
    sheet_label: 'Détails du vol',
    sheet_close: 'Fermer les détails du vol',
    f_alt: 'Altitude',
    f_gs: 'Vitesse',
    f_trk: 'Cap',
    f_vr: 'Vitesse verticale',
    f_type: 'Appareil',
    f_sq: 'Squawk',
    close: 'Fermer',
    info_intro: 'Le vent et la température des 48 prochaines heures, avec le trafic aérien par-dessus. Touchez la carte pour voir les valeurs en un point, ou un avion pour voir son vol. Le bouton de lecture anime la prévision heure par heure.',
    info_data_title: 'D’où viennent les données',
    info_data_html: 'La prévision vient d’{om}, qui combine les modèles de plusieurs services météorologiques nationaux (licence CC BY 4.0). Les vols en direct viennent d’{adsb}, un réseau communautaire de récepteurs ADS-B. Le contour des pays provient de Natural Earth.',
    info_how_title: 'Comment elle a été réalisée',
    info_how: 'JavaScript sans framework, Leaflet pour la carte et canvas pour les particules de vent et les avions. Elle fonctionne sur téléphone et peut s’installer comme une application.',
    made_by: 'Réalisé par',
    view_code: 'Voir le code sur GitHub',
    radius_note: 'Les vols en direct s’affichent dans un rayon de 460 km autour du centre de la carte',
    flights_offline: 'Pas de connexion au service des vols. Affichage de vols simulés.',
    locate_failed: 'Impossible d’obtenir votre position',
    no_type: 'Type d’appareil non indiqué',
    on_ground: 'Au sol',
    climbing: 'en montée',
    descending: 'en descente',
    level: 'en palier',
    source_sim: 'Vol simulé pour la démonstration. Routes et compagnies plausibles, positions inventées.',
    source_live: 'Données ADS-B en direct du réseau adsb.lol. L’origine et la destination ne font pas partie de ces données.',
    wind_from: 'secteur {dir}',
    no_data: 'Pas de données pour ce point. Rapprochez-vous de la zone colorée.',
    status_live: 'Prévision en direct',
    status_demo: 'Prévision de démonstration',
    status_flights_live: 'Vols en direct',
    status_flights_sim: 'Vols simulés',
    mode_both: 'Pour l’instant, la prévision affichée est un champ de vent synthétique (une dépression sur l’Atlantique), car Open-Meteo n’est pas accessible d’ici, et les avions sont simulés, car aucun proxy n’est configuré pour les données ADS-B. La barre du haut indique toujours ce qui est réel et ce qui relève de la démonstration.',
    mode_weather: 'Pour l’instant, la prévision affichée est un champ de vent synthétique (une dépression sur l’Atlantique), car Open-Meteo n’est pas accessible d’ici. La barre du haut indique toujours ce qui est réel et ce qui relève de la démonstration.',
    mode_flights: 'Pour l’instant, les avions sont simulés, car aucun proxy n’est configuré pour les données ADS-B. La barre du haut indique toujours ce qui est réel et ce qui relève de la démonstration.',
    mode_real: 'Pour l’instant, toutes les données sont réelles.',
    compass: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
    hemispheres: ['N', 'S', 'E', 'O'],
  },

  nl: {
    meta_description: 'Wind- en temperatuurkaart voor de komende 48 uur, met een vluchtradar.',
    map_label: 'Kaart met wind en vluchten. Tik op een punt om de wind en de temperatuur te zien, of op een vliegtuig om de vlucht te zien.',
    loading: 'Verwachting wordt geladen',
    about_label: 'Over deze app en de gegevensbronnen',
    locate_label: 'Centreren op mijn locatie',
    lang_label: 'Taal',
    dock_label: 'Lagen en tijdlijn',
    color_label: 'Kaartkleur',
    mode_wind: 'Wind',
    mode_temp: 'Temperatuur',
    flights: 'Vluchten',
    play: 'Verwachting afspelen',
    pause: 'Verwachting pauzeren',
    today: 'vandaag',
    now: 'nu',
    in_hours: 'over {n} uur',
    slider_label: 'Uur van de verwachting',
    credits_html: 'Verwachting {omcom} (CC BY 4.0). Vluchten {adsb} (ODbL). Kaart {ne}.',
    sheet_label: 'Vluchtgegevens',
    sheet_close: 'Vluchtgegevens sluiten',
    f_alt: 'Hoogte',
    f_gs: 'Snelheid',
    f_trk: 'Koers',
    f_vr: 'Verticale snelheid',
    f_type: 'Toestel',
    f_sq: 'Squawk',
    close: 'Sluiten',
    info_intro: 'De wind en de temperatuur voor de komende 48 uur, met het luchtverkeer erboven. Tik op de kaart om de waarden op een punt te zien, of op een vliegtuig om de vlucht te zien. De afspeelknop laat de verwachting uur per uur zien.',
    info_data_title: 'Waar de gegevens vandaan komen',
    info_data_html: 'De verwachting komt van {om}, dat modellen van verschillende nationale weerdiensten combineert (licentie CC BY 4.0). De live vluchten komen van {adsb}, een gemeenschapsnetwerk van ADS-B-ontvangers. De omtrek van de landen komt van Natural Earth.',
    info_how_title: 'Hoe het gemaakt is',
    info_how: 'JavaScript zonder frameworks, Leaflet voor de kaart en canvas voor de winddeeltjes en de vliegtuigen. Werkt op de telefoon en is als app te installeren.',
    made_by: 'Gemaakt door',
    view_code: 'Bekijk de code op GitHub',
    radius_note: 'Live vluchten worden getoond binnen 460 km van het midden van de kaart',
    flights_offline: 'Geen verbinding met de vluchtdienst. Er worden gesimuleerde vluchten getoond.',
    locate_failed: 'Uw locatie kon niet worden bepaald',
    no_type: 'Type toestel niet opgegeven',
    on_ground: 'Aan de grond',
    climbing: 'stijgend',
    descending: 'dalend',
    level: 'horizontaal',
    source_sim: 'Gesimuleerde vlucht voor de demonstratie. Aannemelijke routes en maatschappijen, verzonnen posities.',
    source_live: 'Live ADS-B-gegevens van het netwerk adsb.lol. Vertrek en bestemming maken geen deel uit van deze gegevens.',
    wind_from: 'uit {dir}',
    no_data: 'Geen gegevens voor dit punt. Kies een punt dichter bij het gekleurde gebied.',
    status_live: 'Live verwachting',
    status_demo: 'Demoverwachting',
    status_flights_live: 'Live vluchten',
    status_flights_sim: 'Gesimuleerde vluchten',
    mode_both: 'Op dit moment is de getoonde verwachting een synthetisch windveld (een lagedrukgebied boven de Atlantische Oceaan), omdat Open-Meteo van hieruit niet bereikbaar is, en zijn de vliegtuigen gesimuleerd, omdat er geen proxy voor de ADS-B-gegevens is ingesteld. De balk bovenaan laat altijd zien wat echt is en wat demonstratie is.',
    mode_weather: 'Op dit moment is de getoonde verwachting een synthetisch windveld (een lagedrukgebied boven de Atlantische Oceaan), omdat Open-Meteo van hieruit niet bereikbaar is. De balk bovenaan laat altijd zien wat echt is en wat demonstratie is.',
    mode_flights: 'Op dit moment zijn de vliegtuigen gesimuleerd, omdat er geen proxy voor de ADS-B-gegevens is ingesteld. De balk bovenaan laat altijd zien wat echt is en wat demonstratie is.',
    mode_real: 'Op dit moment zijn alle gegevens echt.',
    compass: ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'],
    hemispheres: ['N', 'Z', 'O', 'W'],
  },

  de: {
    meta_description: 'Wind- und Temperaturkarte für die nächsten 48 Stunden, mit Flugradar.',
    map_label: 'Karte mit Wind und Flügen. Tippen Sie auf einen Punkt, um Wind und Temperatur zu sehen, oder auf ein Flugzeug, um den Flug zu sehen.',
    loading: 'Vorhersage wird geladen',
    about_label: 'Über diese App und die Datenquellen',
    locate_label: 'Auf meinen Standort zentrieren',
    lang_label: 'Sprache',
    dock_label: 'Ebenen und Zeitleiste',
    color_label: 'Kartenfarbe',
    mode_wind: 'Wind',
    mode_temp: 'Temperatur',
    flights: 'Flüge',
    play: 'Vorhersage abspielen',
    pause: 'Vorhersage anhalten',
    today: 'heute',
    now: 'jetzt',
    in_hours: 'in {n} Std.',
    slider_label: 'Stunde der Vorhersage',
    credits_html: 'Vorhersage {omcom} (CC BY 4.0). Flüge {adsb} (ODbL). Karte {ne}.',
    sheet_label: 'Flugdetails',
    sheet_close: 'Flugdetails schließen',
    f_alt: 'Höhe',
    f_gs: 'Geschwindigkeit',
    f_trk: 'Kurs',
    f_vr: 'Steig-/Sinkrate',
    f_type: 'Flugzeug',
    f_sq: 'Squawk',
    close: 'Schließen',
    info_intro: 'Wind und Temperatur der nächsten 48 Stunden, mit dem Flugverkehr darüber. Tippen Sie auf die Karte, um die Werte an einem Punkt zu sehen, oder auf ein Flugzeug, um den Flug zu sehen. Die Wiedergabetaste spielt die Vorhersage Stunde für Stunde ab.',
    info_data_title: 'Woher die Daten stammen',
    info_data_html: 'Die Vorhersage stammt von {om}, das Modelle mehrerer nationaler Wetterdienste kombiniert (Lizenz CC BY 4.0). Die Live-Flüge stammen aus {adsb}, einem Community-Netzwerk von ADS-B-Empfängern. Die Umrisse der Länder stammen von Natural Earth.',
    info_how_title: 'Wie die App entstand',
    info_how: 'JavaScript ohne Frameworks, Leaflet für die Karte und Canvas für die Windteilchen und die Flugzeuge. Sie funktioniert auf dem Smartphone und lässt sich als App installieren.',
    made_by: 'Erstellt von',
    view_code: 'Code auf GitHub ansehen',
    radius_note: 'Live-Flüge werden im Umkreis von 460 km um die Kartenmitte angezeigt',
    flights_offline: 'Keine Verbindung zum Flugdienst. Es werden simulierte Flüge angezeigt.',
    locate_failed: 'Ihr Standort konnte nicht ermittelt werden',
    no_type: 'Flugzeugtyp nicht angegeben',
    on_ground: 'Am Boden',
    climbing: 'steigend',
    descending: 'sinkend',
    level: 'horizontal',
    source_sim: 'Simulierter Flug zur Demonstration. Plausible Routen und Fluggesellschaften, erfundene Positionen.',
    source_live: 'Live-ADS-B-Daten aus dem Netzwerk adsb.lol. Start- und Zielflughafen sind nicht Teil dieser Daten.',
    wind_from: 'aus {dir}',
    no_data: 'Keine Daten für diesen Punkt. Gehen Sie näher an den farbigen Bereich heran.',
    status_live: 'Live-Vorhersage',
    status_demo: 'Demo-Vorhersage',
    status_flights_live: 'Live-Flüge',
    status_flights_sim: 'Simulierte Flüge',
    mode_both: 'Derzeit ist die angezeigte Vorhersage ein synthetisches Windfeld (ein Tiefdruckgebiet über dem Atlantik), weil Open-Meteo von hier aus nicht erreichbar ist, und die Flugzeuge sind simuliert, weil kein Proxy für die ADS-B-Daten eingerichtet ist. Die obere Leiste zeigt immer, was echt ist und was Demonstration.',
    mode_weather: 'Derzeit ist die angezeigte Vorhersage ein synthetisches Windfeld (ein Tiefdruckgebiet über dem Atlantik), weil Open-Meteo von hier aus nicht erreichbar ist. Die obere Leiste zeigt immer, was echt ist und was Demonstration.',
    mode_flights: 'Derzeit sind die Flugzeuge simuliert, weil kein Proxy für die ADS-B-Daten eingerichtet ist. Die obere Leiste zeigt immer, was echt ist und was Demonstration.',
    mode_real: 'Derzeit sind alle Daten echt.',
    compass: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
    hemispheres: ['N', 'S', 'O', 'W'],
  },
};

// ---------------------------------------------------------------------------

function fromQuery() {
  try {
    const q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
    return LANGS.includes(q) ? q : null;
  } catch {
    return null;
  }
}

function fromBrowser() {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of list) {
    const code = String(tag || '').slice(0, 2).toLowerCase();
    if (LANGS.includes(code)) return code;
  }
  return null;
}

let lang = fromQuery() || fromBrowser() || DEFAULT_LANG;
let dict = STRINGS[lang];
const listeners = [];

export function getLang() {
  return lang;
}

// Text for a key in the active language; {name} placeholders are filled from vars.
export function t(key, vars) {
  const s = dict[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
  if (!vars || typeof s !== 'string') return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function html(key) {
  return t(key).replace(/\{(\w+)\}/g, (m, k) => {
    const link = LINKS[k];
    return link ? `<a href="${link[0]}" target="_blank" rel="noopener">${link[1]}</a>` : m;
  });
}

// Dates and numbers for the active locale.
export const fmt = {};
function buildFormats() {
  const loc = LOCALES[lang];
  const int = new Intl.NumberFormat(loc, { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const day = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' });
  const weekday = new Intl.DateTimeFormat(loc, { weekday: 'short' });
  const hour = new Intl.DateTimeFormat(loc, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  fmt.int = (v) => int.format(v);
  fmt.one = (v) => one.format(v);
  fmt.day = (d) => day.format(d);
  fmt.weekday = (d) => weekday.format(d);
  fmt.hour = (d) => hour.format(d);
}

// Compass point for a bearing in degrees.
export function compass(bearing) {
  return t('compass')[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16];
}

// Fill the static page: data-i18n (text), data-i18n-html (text with links),
// data-i18n-label (aria-label).
function applyStatic() {
  document.documentElement.lang = lang === 'pt' ? 'pt-PT' : lang;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta_description'));
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = html(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
}

export function onLangChange(fn) {
  listeners.push(fn);
}

// Switch language from inside the app and keep it in the address, so a reload keeps it.
export function setLang(code) {
  if (!LANGS.includes(code) || code === lang) return;
  lang = code;
  dict = STRINGS[lang];
  buildFormats();
  applyStatic();
  try {
    // Other parameters (such as ?demo) are kept exactly as they were.
    const parts = location.search.slice(1).split('&').filter((p) => p && !/^lang(=|$)/i.test(p));
    parts.push(`lang=${code}`);
    history.replaceState(history.state, '', `${location.pathname}?${parts.join('&')}${location.hash}`);
  } catch { /* the address stays as it is */ }
  listeners.forEach((fn) => fn(lang));
}

buildFormats();
applyStatic();
