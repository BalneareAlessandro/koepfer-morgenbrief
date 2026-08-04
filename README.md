# KOEPFER Morgenbrief

## Projektzweck

Der KOEPFER Morgenbrief ist eine werktägliche, einkaufsorientierte Nachrichtenausgabe für KOEPFER. Er bündelt aktuelle Entwicklungen, die für Beschaffung, Lieferketten, Lieferanten, Kunden und Unternehmensrisiken relevant sein können.

Produktive Website:

https://koepfer-einkauf.github.io/koepfer-morgenbrief/

Repository:

`koepfer-einkauf/koepfer-morgenbrief`

## Aufgabe des Morgenbriefs

Jede Ausgabe soll aktuelle Meldungen recherchieren, knapp zusammenfassen und aus Sicht des KOEPFER Einkaufs einordnen. Entscheidend ist nicht nur, was passiert ist, sondern welche möglichen Folgen sich für Preise, Verfügbarkeit, Lieferzeiten, Verträge, Compliance, Kundenabrufe oder die Versorgungssicherheit ergeben.

Berichtet wird insbesondere über:

- Automotive, Fahrzeugmärkte, Zulieferindustrie und relevante KOEPFER-Kunden
- Neuigkeiten zu bekannten Lieferanten und deren Märkten
- EU-Richtlinien, Verordnungen, Sanktionen und andere Compliance-Vorgaben
- Zölle, Handelskonflikte, Exportkontrollen und internationale Handelspolitik
- Weltpolitische Ereignisse, Kriege und länger laufende Konflikte
- Energie, Rohstoffe, Logistik, Transportwege und Lieferketten
- Maschinenbau, Industrieproduktion, Konjunktur und Standortentwicklungen
- Unternehmensmeldungen wie Restrukturierungen, Insolvenzen, Produktionsänderungen, Übernahmen und Kapazitätsanpassungen

Die Auswahl richtet sich immer nach der konkreten Relevanz für den KOEPFER Einkauf. Meldungen ohne erkennbaren Einkaufsbezug werden nicht nur zur Füllung aufgenommen.

## Regelmäßiger Ablauf

Die produktive Ausgabe wird montags bis freitags um 06:30 Uhr in der Zeitzone Europe/Berlin erstellt. Samstags und sonntags gibt es keine Ausgabe.

Vor der Recherche werden die seit der letzten Ausgabe gespeicherten Bewertungen, Feedbacktexte und Themen- oder Firmenwünsche aus Supabase gelesen. Rückmeldungen vom Freitag und vom Wochenende bleiben gespeichert und werden für die Montagsausgabe berücksichtigt.

Danach erfolgt die Recherche aktueller, belastbarer Quellen. Die wichtigsten Meldungen werden priorisiert, auf Einkaufsrelevanz geprüft und in verständlicher Form zusammengefasst. Wünsche wie „mehr davon“ oder „weniger davon“ beeinflussen die Auswahl und können zu zusätzlichen Berichten über ein Thema oder eine Firma führen.

## Verbindliche Mastervorlage

Die jeweils aktuelle produktive Datei `/index.html` ist die alleinige Mastervorlage für neue Root-Ausgaben.

Bei einer neuen Ausgabe dürfen nur die tagesabhängigen redaktionellen Inhalte angepasst werden, insbesondere:

- Datum und Ausgabebezeichnung
- Schlagzeilen, Meldungstexte und Einordnungen
- Quellen und Verlinkungen
- Kennzahlen und redaktionelle Priorisierung
- die große thematische Grafik zur ersten Hauptmeldung

Design, Seitenstruktur, CSS, Navigation, Archiv-Schaltfläche, Bewertungsfunktion, Feedbackfunktion und Wünsche-Funktion bleiben erhalten. Es wird keine neue Vorlage erstellt und das vorhandene Layout wird nicht neu gestaltet.

Die große Grafik am Seitenanfang muss jeden Tag passend zur ersten Hauptmeldung angepasst werden. Sie soll den Inhalt visuell aufgreifen und sich stilistisch in die vorhandene Gestaltung einfügen.

## Archivierung

Vor dem Ersetzen der produktiven Root-Ausgabe wird die bisherige Ausgabe vollständig im bestehenden Archivformat gesichert.

Dabei gelten folgende Regeln:

1. Die vorherige Ausgabe bleibt als eigene, direkt aufrufbare Archivdatei erhalten.
2. Die Archivübersicht erhält einen neuen Eintrag mit Datum, Titel, Vorschaubild und Link.
3. Neueste Ausgaben erscheinen zuerst.
4. Vorhandene Archivdateien und ältere Einträge werden nicht überschrieben oder entfernt.
5. Die Archiv-Schaltfläche der neuen Root-Ausgabe muss weiterhin funktionieren.

Erst nach erfolgreicher Archivierung wird `/index.html` mit der neuen Ausgabe aktualisiert.

## Bewertungen, Feedback und Wünsche

Die Website enthält Funktionen für Bewertungen, freies Feedback sowie Wünsche zu Themen oder Firmen. Die Eingaben werden in der verbundenen Supabase-Datenbank gespeichert und vor der nächsten regulären Ausgabe ausgewertet.

Die Funktionen müssen in jeder neuen Root-Ausgabe erhalten bleiben und nach der Veröffentlichung geprüft werden. Zugangsschlüssel oder geheime Daten gehören nicht in diese README und dürfen nicht öffentlich dokumentiert werden.

Testeinträge werden nur auf ausdrückliche Anweisung gelöscht. Reguläre Rückmeldungen bleiben bis zu ihrer vorgesehenen Verarbeitung erhalten.

## Qualitäts- und Veröffentlichungsprüfung

Nach jeder produktiven Veröffentlichung ist mindestens zu prüfen:

- Root-Seite ist unter der aktuellen GitHub-Pages-Adresse erreichbar
- Datum, Titel, Meldungen und Quellen sind korrekt
- die vorherige Ausgabe ist vollständig archiviert
- Archiv-Schaltfläche und Archivübersicht funktionieren
- Bewertungs-, Feedback- und Wünsche-Funktion sind vorhanden
- Datenbankübermittlung verursacht keinen sichtbaren Fehler
- große Grafik passt zur ersten Hauptmeldung
- Layout und Design entsprechen der bisherigen Mastervorlage
- Links und mobile Darstellung weisen keine offensichtlichen Fehler auf

Bei einer Kartenausgabe werden zusätzlich Kartenkacheln, Marker, Cluster, Ebenen und Popups geprüft.

## Wiederanlauf-Anweisung

Falls die Aufgabe in einer neuen Unterhaltung oder Automatisierung erneut eingerichtet werden muss, kann folgende Kurzbeschreibung verwendet werden:

> Arbeite am GitHub-Repository `koepfer-einkauf/koepfer-morgenbrief`. Erstelle montags bis freitags um 06:30 Uhr Europe/Berlin eine neue, einkaufsrelevante KOEPFER-Morgenausgabe. Lies vorher Bewertungen, Feedback und Themen- oder Firmenwünsche aus der verbundenen Supabase-Datenbank. Recherchiere aktuelle Meldungen zu Automotive, Lieferanten, Kunden, EU-Regeln, Zöllen, Handelspolitik, Weltpolitik, Konflikten, Energie, Rohstoffen, Logistik, Maschinenbau und Lieferketten. Archiviere zuerst die bisherige Root-Ausgabe im vorhandenen Archivformat. Verwende danach ausschließlich die aktuelle `/index.html` als Mastervorlage und ändere nur Datum, News, Quellen, redaktionelle Inhalte und die thematisch passende Grafik der ersten Hauptmeldung. Verändere weder Design noch Funktionen. Erhalte Archiv, Bewertung, Feedback und Wünsche und prüfe die veröffentlichte GitHub-Pages-Seite. Am Wochenende gibt es keine Ausgabe; Rückmeldungen vom Freitag und Wochenende werden am Montag berücksichtigt. Die Testumgebung wird nur auf ausdrückliche Anweisung geändert.

## Grundsatz

Die Root-Ausgabe ist produktiv und stabil zu halten. Inhaltliche Aktualität darf nicht zu unbeabsichtigten Änderungen an Design, Navigation, Archiv oder Rückmeldefunktionen führen.
