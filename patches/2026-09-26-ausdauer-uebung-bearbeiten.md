## Ausdauer-Übung bearbeiten machte sie zur Kraftübung

Das Formular „Übung bearbeiten“ bietet bei „Art“ und „Bewegungsmuster“ keine Option
„Ausdauer“. Öffnete man eine eingebaute Ausdauer-Übung (Laufen, Rad, Schwimmen … – alle 12)
und tippte auf „Speichern“, auch ohne etwas zu ändern, wurden beide Felder leer gespeichert.
Die Übung verschwand danach aus der Ausdauer-Auswahl und wurde wie eine Kraftübung
behandelt.

Jetzt behält das Formular bei Ausdauer-Übungen ihre Art. Anpassungen, die schon mit leeren
Feldern gespeichert wurden, fallen beim Laden auf das Original zurück – betroffene Übungen
sind damit ohne weiteres Zutun wieder da.

### Formular: Ausdauer als Art behalten

ALT:
```js
  if(existing)typeSel.value=existing.t;
```

NEU:
```js
  // Ausdauer-Übungen lassen sich bearbeiten, aber nicht neu anlegen – darum fehlt die Option
  // sonst. Ohne sie würde das Feld leer, und die Übung verlöre beim Speichern ihre Art: Sie
  // verschwand aus der Ausdauer-Auswahl und wurde wie eine Kraftübung behandelt.
  if(existing&&existing.t==="cardio"){var opT=document.createElement("option");opT.value="cardio";opT.textContent="Ausdauer (Minuten)";typeSel.appendChild(opT);}
  if(existing)typeSel.value=existing.t;
```

### Formular: Ausdauer als Bewegungsmuster behalten

ALT:
```js
  if(existing)patSel.value=existing.pat;
```

NEU:
```js
  if(existing&&existing.pat==="cardio"){var opP=document.createElement("option");opP.value="cardio";opP.textContent="Ausdauer";patSel.appendChild(opP);}
  if(existing)patSel.value=existing.pat;
```

### Bereits gespeicherte kaputte Anpassungen reparieren

ALT:
```js
    Object.assign(merged,state.exOverrides[id]);
```

NEU:
```js
    Object.assign(merged,state.exOverrides[id]);
    // Ältere Fassungen des Formulars haben bei Ausdauer-Übungen Art und Bewegungsmuster leer
    // gespeichert. Leer ist nie gewollt – dann gilt wieder das Original.
    if(!merged.t)merged.t=base.t;
    if(!merged.pat)merged.pat=base.pat;
```
