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

## Installazione da Docker Hub
Questo repository contiene il codice e le istruzioni per configurare e utilizzare l'immagine Docker.

#### Requisiti
1. **Installa Docker:**  
   Assicurati di avere installato una versione funzionante di *Docker* (Docker Desktop o Docker Engine).  
   Puoi scaricarlo [qui](https://www.docker.com/products/docker-desktop).

#### Informazioni sull'immagine Docker
L'immagine ufficiale del progetto PonyGo è ospitata su Docker Hub:
- **Docker Hub Username:** `fabioc9`
- **Link Docker Hub:** `https://hub.docker.com/r/fabioc9/ponygo`
- **Immagine:** `fabioc9/ponygo:latest`

#### Istruzioni per l'uso

1. **Scarica l'immagine:**

   ```bash
   docker pull fabioc9/ponygo:latest
   ```

2. Avvia il container sostituendo, se necessario, le variabili d'ambiente con i valori richiesti:
   ```bash
   docker run -d -p 3000:3000 --name ponygo_container -e API_KEY=YOUR_API_KEY fabioc9/ponygo:latest
   ```
3. Accedi all'applicazione:
   Una volta avviato il container, puoi accedere all'applicazione tramite il seguente URL:
   ```bash
   http://localhost:3000
   ```

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
