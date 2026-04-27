# TP Lab 10 — Installation et prise en main de Frida pour l'analyse dynamique Android

## Description

Travail pratique d'instrumentation dynamique Android avec **Frida**. Le lab couvre
l'installation complète du client Frida sur Windows, le déploiement de `frida-server`
sur un émulateur Android, la validation de la connexion, l'injection de scripts
JavaScript minimaux, l'exploration de la console interactive, et le hooking de
méthodes Java sensibles (SharedPreferences, SQLite, Debug, Runtime).

---

## Objectifs pédagogiques

| Objectif | Description |
|---|---|
| Installation | Installer frida, frida-tools et la bibliothèque Python |
| Déploiement | Déployer et lancer `frida-server` sur un émulateur Android |
| Connexion | Établir une connexion et valider l'environnement |
| Scripts | Injecter des scripts minimaux Java et natifs |
| Console | Explorer la console interactive Frida |
| Hooking Java | Intercepter SharedPreferences, SQLite, Debug, Runtime |
| Diagnostic | Identifier et résoudre les problèmes courants |

---

## Prérequis

| Prérequis | Valeur |
|---|---|
| OS | Windows 11 |
| Python | 3.13 |
| ADB | 35.0.2 (Android Platform Tools) |
| Émulateur | AVD Google APIs x86_64, API 36.1 |
| Architecture | x86_64 |
| Droits | Administrateur local |

---

## Outils installés

| Outil | Version | Rôle |
|---|---|---|
| `frida` | 17.9.1 | Bibliothèque Python d'instrumentation |
| `frida-tools` | 14.8.1 | CLI (frida, frida-ps, frida-trace…) |
| `frida-server` | 17.9.1 | Serveur déployé sur l'émulateur Android |
| `adb` | 35.0.2 | Communication PC ↔ émulateur |
| Python | 3.13 | Environnement d'exécution |

---

## Glossaire

| Terme | Définition |
|---|---|
| **Frida** | Framework d'instrumentation dynamique multiplateforme |
| **frida-server** | Binaire déployé sur l'appareil Android, reçoit les commandes du client |
| **JNI** | Java Native Interface, pont entre Java et le code natif C/C++ |
| **Hook** | Interception d'une fonction pour observer ou modifier son comportement |
| **Interceptor** | API Frida pour attacher des callbacks sur des fonctions natives |
| **Java.perform** | Initialise le contexte Java de Frida dans le processus cible |
| **SharedPreferences** | Système de stockage clé/valeur Android en XML |
| **SQLite** | Base de données locale embarquée dans les applications Android |

---

## Étape 1 — Installation du client Frida

### 1.1 Vérification de Python

```cmd
python --version
pip --version
```
### 1.2 Installation de frida et frida-tools

```cmd
pip install --upgrade frida frida-tools
```

### 1.3 Vérifications CLI

<img width="1280" height="732" alt="image" src="https://github.com/user-attachments/assets/844f87e0-2dcf-47e7-ac94-2312383f3334" />

---

## Étape 3 — Déployer frida-server sur l'émulateur Android

### 3.1 Identifier l'architecture CPU

```cmd
adb shell getprop ro.product.cpu.abi
```
<img width="902" height="314" alt="image" src="https://github.com/user-attachments/assets/a55f4e7b-9a63-4cd2-aea9-a54d39b6a8e1" />


### 3.2 Télécharger frida-server compatible

Fichier téléchargé depuis `https://github.com/frida/frida/releases` :
```
frida-server-17.9.1-android-x86_64.xz
```
<img width="424" height="111" alt="image" src="https://github.com/user-attachments/assets/f305a6bd-1e68-4aaf-9931-038cb10b3bbe" />

### 3.3 Décompresser l'archive

Extraction avec **7-Zip** sous Windows :
```
→ frida-server (110 787 848 octets)
```

### 3.4 Copier frida-server vers l'émulateur

```cmd
adb push "C:\Users\HP PRO\Downloads\frida-server\frida-server-17.9.1-android-x86_64" /data/local/tmp/frida-server
```
### 3.5 Rendre le fichier exécutable

```cmd
adb shell chmod 755 /data/local/tmp/frida-server
```

### 3.6 Lancer frida-server

```cmd
adb shell /data/local/tmp/frida-server -l 0.0.0.0
```
<img width="1076" height="436" alt="image" src="https://github.com/user-attachments/assets/6bdddd8d-2c6e-4597-9157-145604cac854" />


Lancement en arrière-plan (terminal dédié) :

```cmd
adb shell "/data/local/tmp/frida-server &"
```
<img width="854" height="134" alt="image" src="https://github.com/user-attachments/assets/0125b9e7-03d3-499c-a506-baead78a4403" />


### 3.7 Vérifier que frida-server est actif

```cmd
adb shell am start -n com.pwnsec.firestorm/.MainActivity
frida-ps -U | findstr Firestorm 
```
<img width="1049" height="342" alt="image" src="https://github.com/user-attachments/assets/377c2c97-8726-407a-bc76-ea15ec7a8b31" />

### 3.8 Configurer la redirection de ports ADB

```cmd
adb forward tcp:27042 tcp:27042
adb forward tcp:27043 tcp:27043
```
<img width="934" height="194" alt="image" src="https://github.com/user-attachments/assets/5a2e0767-5d2e-4bde-8e71-adb69e35fa1d" />

---

## Étape 4 — Test de connexion depuis le PC

```cmd
frida-ps -U
```
<img width="1280" height="878" alt="image" src="https://github.com/user-attachments/assets/b25ae8f9-b265-4c10-b27f-1621f811b4bf" />

```cmd
frida-ps -Uai
```
---

## Étape 5 — Injection minimale pour valider

### 5.1 Script Java — hello.js

**Contenu du fichier `hello.js` :**

```javascript
Java.perform(function () {
  console.log("[+] Frida Java.perform OK");
});
```

**Lancement :**

```cmd
frida -U -n Firestorm -l hello.js
```

<img width="853" height="347" alt="image" src="https://github.com/user-attachments/assets/2b204682-e788-4354-b2e5-224af54b9b1f" />
<img width="405" height="830" alt="image" src="https://github.com/user-attachments/assets/678eee09-55e5-46ad-9841-4029e3191acc" />

✅ Frida est connecté, le processus est instrumenté, Java.perform fonctionne.

---

### 5.2 Script natif — hello_native.js

**Contenu du fichier `hello_native.js` :**

```javascript
console.log("[+] Script chargé");

Interceptor.attach(Module.getExportByName(null, "recv"), {
  onEnter(args) {
    console.log("[+] recv appelée");
  }
});
```

**Lancement :**

```cmd
frida -U -n Firestorm -l hello_native.js
```
<img width="806" height="296" alt="image" src="https://github.com/user-attachments/assets/f883b662-0204-442c-84ee-9764c5fa55b1" />

✅ Le hooking natif fonctionne. La fonction `recv` est interceptée lors des
communications réseau de l'application.

---

## Étape 6 — Console interactive Frida

Commandes exécutées dans la console après injection :
<img width="1039" height="551" alt="image" src="https://github.com/user-attachments/assets/c535c303-c434-41c2-a761-0c016d23debf" />

### 6.1 Architecture du processus

```javascript
Process.arch
```
### 6.2 Module principal

```javascript
Process.mainModule
```

### 6.3 Informations sur libc.so

```javascript
Process.getModuleByName("libc.so")
```
### 6.4 Adresse de la fonction recv

```javascript
Process.getModuleByName("libc.so").getExportByName("recv")
```
### 6.5 Modules chargés (extrait)

```javascript
Process.enumerateModules()
```

### 6.6 Threads actifs (extrait)

```javascript
Process.enumerateThreads()
```

### 6.7 Zones mémoire exécutables (extrait)

```javascript
Process.enumerateRanges('r-x')
```

### 6.8 Disponibilité du runtime Java

```javascript
Java.available
```


### 6.9 Informations du processus

```javascript
Process.id
```
```javascript
Process.platform
```
## Étape 7 — Observation des bibliothèques réseau et stockage

### hook_connect.js

```javascript
console.log("[+] Hook connect chargé");

const connectPtr = Process.getModuleByName("libc.so").getExportByName("connect");
console.log("[+] connect trouvée à : " + connectPtr);

Interceptor.attach(connectPtr, {
  onEnter(args) {
    console.log("[+] connect appelée");
    console.log("    fd = " + args[0]);
    console.log("    sockaddr = " + args[1]);
  },
  onLeave(retval) {
    console.log("    retour = " + retval.toInt32());
  }
});
```

```cmd
frida -U -n Firestorm -l hook_connect.js
```

<img width="977" height="388" alt="image" src="https://github.com/user-attachments/assets/007be0ea-548c-43a3-8f07-cc4406d99ddd" />

---

### hook_network.js

```javascript
console.log("[+] Hooks réseau chargés");

const sendPtr = Process.getModuleByName("libc.so").getExportByName("send");
const recvPtr = Process.getModuleByName("libc.so").getExportByName("recv");

console.log("[+] send trouvée à : " + sendPtr);
console.log("[+] recv trouvée à : " + recvPtr);

Interceptor.attach(sendPtr, {
  onEnter(args) {
    console.log("[+] send appelée — fd=" + args[0] + " len=" + args[2].toInt32());
  }
});

Interceptor.attach(recvPtr, {
  onEnter(args) {
    console.log("[+] recv appelée — fd=" + args[0] + " len=" + args[2].toInt32());
  },
  onLeave(retval) {
    console.log("    recv retourne = " + retval.toInt32());
  }
});
```
<img width="850" height="326" alt="image" src="https://github.com/user-attachments/assets/cb4a5ee1-3348-42d7-b93c-f32db6c5893e" />
---

### hook_file.js

```javascript
console.log("[+] Hook fichiers chargé");

const openPtr = Process.getModuleByName("libc.so").getExportByName("open");
const readPtr = Process.getModuleByName("libc.so").getExportByName("read");

Interceptor.attach(openPtr, {
  onEnter(args) {
    this.path = args[0].readUtf8String();
    console.log("[+] open appelée : " + this.path);
  }
});

Interceptor.attach(readPtr, {
  onEnter(args) {
    console.log("[+] read appelée — fd=" + args[0] + " taille=" + args[2].toInt32());
  }
});
```

<img width="968" height="360" alt="image" src="https://github.com/user-attachments/assets/853c16bf-35ac-4cab-b680-6c306700d6b5" />

---

## Récapitulatif des scripts créés

| Fichier | Rôle |
|---|---|
| `hello.js` | Validation de Java.perform |
| `hello_native.js` | Hook natif sur `recv` |
| `hook_connect.js` | Observation des connexions réseau |
| `hook_network.js` | Hook sur `send` et `recv` |
| `hook_file.js` | Observation des accès fichiers natifs |
| `hook_prefs.js` | Lecture SharedPreferences |
| `hook_prefs_write.js` | Écriture SharedPreferences |
| `hook_sqlite.js` | Requêtes SQLite |
| `hook_debug.js` | Vérifications débogage Android |
| `hook_runtime.js` | Commandes système Runtime.exec |
| `hook_file_java.js` | Chemins fichiers côté Java |

---

## Exercices pratiques — Livrables

### 1. Installation et preuve

| Commande | Résultat |
|---|---|
| `frida --version` | 17.9.1 |
| `frida-ps --version` | 17.9.1 |
| `python -c "import frida; print(frida.__version__)"` | frida 17.9.1 |
| `adb devices` | emulator-5554 device |

### 2. Déploiement Android

```cmd
adb shell /data/local/tmp/frida-server -l 0.0.0.0
```
```cmd
frida-ps -Uai
```
→ Liste de plus de 3 applications affichée ✅

### 3. Injection

```cmd
frida -U -n Firestorm -l hello.js
```
```
[+] Frida Java.perform OK
```
✅

### 4. Dépannage simulé

**Simulation :** frida-server arrêté → `adb shell pkill -f frida-server`

**Erreur obtenue :**
```
frida -U -n Firestorm -l hello.js
Failed to attach: unable to connect to remote frida-server
```

## Nettoyage

```cmd
adb shell pkill -f frida-server
adb shell rm /data/local/tmp/frida-server
```

---

## Checklist finale

- [x] Python 3.13 installé et vérifié
- [x] frida 17.9.1 et frida-tools 14.8.1 installés
- [x] frida-server x86_64 téléchargé, poussé et lancé sur l'émulateur
- [x] `frida-ps -U` liste les processus Android
- [x] `hello.js` injecté → Java.perform OK
- [x] `hello_native.js` injecté → recv hookée
- [x] Console interactive explorée (arch, modules, threads, mémoire)
- [x] Scripts de hooking Java créés et testés
- [x] Scénario de dépannage documenté
- [x] Nettoyage effectué

---

## Environnement

- **OS** : Windows 11
- **Python** : 3.13
- **Frida client** : 17.9.1
- **Frida server** : 17.9.1 android-x86_64
- **ADB** : 35.0.2
- **Émulateur** : AVD Google APIs x86_64, API 36.1
- **Niveau** : Initiation / Intermédiaire
- **Catégorie** : Mobile Security / Dynamic Instrumentation
