# PonyGo
PonyGo è una piattaforma muti-tenant dedicata alle pizzerie per organizzare 
in modo semplice e intuitivo le consegne e le comunicazioni con i pony-pizza,
tutto a portata di smartphone. Con pochi tocchi, le pizzerie possono assegnare 
ordini, monitorare in tempo reale lo stato delle consegne e mantenere una 
comunicazione fluida con i propri fattorini, ottimizzando l'intero processo di consegne

- **Target:** Pizzerie;
- **Problema che risolve:** Organizzazione delle consegne;
- **Tecnologie utilizzate:** Javascript, Vue, Ubuntu, Server
- **Competitor:** GloriaFood, MenuDrive,Slice,Toast,Uber Eats, Just Eat, Deliveroo, Glovo, Zapiet, DoorDash, Tiller, Gus, Speedline ,Shipday, Onfleet
- **Timestamp:** 1726737736507

## Requisiti di avvio
- Docker Desktop

## Installazione di Docker
1. Visita il sito ufficiale di Docker: [Docker Website](https://www.docker.com).
2. Scarica Docker Desktop per Windows: **"Download for Windows - AMD64"**.
3. Segui le istruzioni per completare l'installazione.
4. Accedi o crea un account Docker.

## Istruzioni per l'Avvio
1. Avvia **Docker Desktop**.
2. Scarica il progetto da **GitHub** ed estrai il contenuto della cartella **zip**.
3. All'interno della cartella principale, crea un file denominato **.env**.
4. Esegui il file **Setup.bat** con un doppio clic e attendi il completamento del processo, seguendo le eventuali istruzioni visualizzate nel terminale.
5. Apri un browser e inserisci nella barra degli indirizzi: `http://localhost:3000`.

## Credenziali di Accesso

### Admin
- **Email**: `admin@example.com`
- **Password**: `123456`

### Utente Standard
- **Email**: `user@example.com`
- **Password**: `abcdef`

### Accesso con Google
- Utilizza il tuo account Google per accedere.

**Nota:** Assicurati che Docker Desktop sia avviato prima di eseguire il progetto per evitare errori di esecuzione.


---


# Requisiti:

 ### Requisiti di Dominio:
 
 **1 - Gestione degli Ordini:** 

- Il sistema deve permettere al pizzaiolo di inserire gli ordini ricevuti via telefono, associando ciascun ordine a un fattorino per la consegna.
- Il fattorino deve essere identificato nel sistema e collegato agli ordini per una gestione ottimale delle consegne.

**2 - Monitoraggio delle Consegne:**

- Il pizzaiolo deve poter monitorare lo stato delle consegne, vedendo se un ordine è in corso di consegna o è stato già completato.

**3 - Organizzazione delle Consegne:**

-Il sistema deve consentire una gestione efficiente delle consegne, ottimizzando il carico di lavoro dei fattorini e permettendo di seguire le consegne in corso.

### Requisiti Funzionali: 

 **1 - Inserimento dell'Ordine:**

- Il pizzaiolo deve poter inserire un ordine con i dettagli del cliente (indirizzo, numero di telefono, ecc.) e selezionare un fattorino per la consegna.

 **2 - Notifica al Fattorino:**

- Una volta assegnato l'ordine, il fattorino deve ricevere una notifica con tutti i dettagli dell'ordine e le informazioni di contatto del cliente.

 **3 - Conferma di Consegna:**

- Dopo la consegna, il fattorino deve poter segnare l'ordine come "consegnato" direttamente tramite l'applicazione o il sistema, aggiornando lo stato dell'ordine in tempo reale per il pizzaiolo.

**4 - Tracciamento della Posizione in Tempo Reale:**

- Il sistema deve permettere al pizzaiolo di visualizzare su una mappa la posizione in tempo reale dei fattorini, per monitorare le consegne in corso e ottimizzare le assegnazioni degli ordini futuri.

### Requisiti Non Funzionali: 

 **1 - Usabilità:**

- L' interfaccia dell'app per il pizzaiolo e per il fattorino deve essere intuitiva e facile da usare, garantendo la rapida gestione degli ordini e delle consegne.

 **2 - Performance:**

- Il sistema deve essere veloce nel gestire le operazioni di inserimento ordine, notifica e tracciamento in tempo reale, garantendo aggiornamenti tempestivi senza ritardi percepibili.

**3 - Scalabilità:**

- Il sistema deve poter gestire un numero crescente di ordini e fattorini senza cali di prestazioni, adattandosi a carichi di lavoro variabili.

 **4 - Affidabilità:**

- Il sistema deve garantire alta disponibilità e ridondanza, in modo che sia sempre accessibile e operativo anche in caso di elevato traffico o guasti tecnici.

 **5 - Sicurezza:**

- Devono essere implementati meccanismi di protezione dei dati, soprattutto per quanto riguarda le informazioni personali dei clienti (indirizzo, numero di telefono) e le credenziali dei fattorini e del pizzaiolo.

![USECASEdef](https://github.com/user-attachments/assets/95d14733-f654-4948-b64c-92af9822e46a)
