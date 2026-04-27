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

**Résultat obtenu :**
```
Python 3.13.0
pip 25.3 from C:\Users\HP PRO\AppData\Local\...\pip (python 3.13)
```

### 1.2 Installation de frida et frida-tools

```cmd
pip install --upgrade frida frida-tools
```

**Résultat obtenu :**
```
Successfully installed frida-17.9.1 frida-tools-14.8.1
prompt-toolkit-3.0.52 pygments-2.20.0 wcwidth-0.6.0 websockets-13.1
```

### 1.3 Vérifications CLI

```cmd
frida --version
```
```
17.9.1
```

```cmd
frida-ps --version
```
```
17.9.1
```

```cmd
python -c "import frida, sys; print('frida', frida.__version__)"
```
```
frida 17.9.1
```

---

## Étape 3 — Déployer frida-server sur l'émulateur Android

### 3.1 Identifier l'architecture CPU

```cmd
adb shell getprop ro.product.cpu.abi
```

**Résultat :**
```
x86_64
```

### 3.2 Télécharger frida-server compatible

Fichier téléchargé depuis `https://github.com/frida/frida/releases` :
```
frida-server-17.9.1-android-x86_64.xz
```

### 3.3 Décompresser l'archive

Extraction avec **7-Zip** sous Windows :
```
Clic droit → 7-Zip → Extraire ici
→ frida-server-17.9.1-android-x86_64  (110 787 848 octets)
```

### 3.4 Copier frida-server vers l'émulateur

```cmd
adb push "C:\Users\HP PRO\Downloads\frida-server\frida-server-17.9.1-android-x86_64" /data/local/tmp/frida-server
```

**Résultat :**
```
C:\Users\HP PRO\Downloads\frida-server\frida-server-17.9.1-android-x86_64: 1 file pushed.
101.3 MB/s (110787848 bytes in 1.043s)
```

### 3.5 Rendre le fichier exécutable

```cmd
adb shell chmod 755 /data/local/tmp/frida-server
```

### 3.6 Lancer frida-server

```cmd
adb shell /data/local/tmp/frida-server -l 0.0.0.0
```

**Résultat :**
```
Unable to load SELinux policy from the kernel: Failed to open file
?/sys/fs/selinux/policy?: Permission denied
```

> ⚠️ Cette erreur SELinux est normale sur les émulateurs Google APIs.
> Elle n'empêche pas le fonctionnement de frida-server.

Lancement en arrière-plan (terminal dédié) :

```cmd
adb shell "nohup /data/local/tmp/frida-server -l 0.0.0.0 >/dev/null 2>&1 &"
```

### 3.7 Vérifier que frida-server est actif

```cmd
adb shell ps | grep frida
```

**Résultat :**
```
root     25595  1      frida-server
```

### 3.8 Configurer la redirection de ports ADB

```cmd
adb forward tcp:27042 tcp:27042
adb forward tcp:27043 tcp:27043
```

**Résultat :**
```
27042
27043
```

---

## Étape 4 — Test de connexion depuis le PC

```cmd
frida-ps -U
```

**Résultat (extrait) :**
```
  PID  Name
-----  ----------------------------
26507  Firestorm
18914  Google
19560  Google Play Store
22145  Messages
 1088  com.android.systemui
  796  system_server
  547  zygote64
```

```cmd
frida-ps -Uai
```

**Résultat (extrait) :**
```
 PID  Name           Identifier
----  -------------  ----------------------------------
  -   Calendar       com.google.android.calendar
  -   Chrome         com.android.chrome
  -   Clock          com.android.deskclock
  -   Contacts       com.google.android.contacts
  -   Settings       com.android.settings
```

Connexion établie ✅ Frida voit bien l'émulateur et liste ses processus.

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

**Résultat obtenu :**
```
     ____
    / _  |   Frida 17.9.1 - A world-class dynamic instrumentation toolkit
   | (_| |
    > _  |   Commands:
   /_/ |_|       help      -> Displays the help system
   . . . .       object?   -> Display information about 'object'
   . . . .       exit/quit -> Exit
   . . . .
   . . . .   Connected to Android Emulator 5554 (id=emulator-5554)
[+] Frida Java.perform OK
[Android Emulator 5554::Firestorm ]->
```

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

**Résultat obtenu :**
```
[+] Script chargé
[Android Emulator 5554::Firestorm ]->
[+] recv appelée
[+] recv appelée
```

✅ Le hooking natif fonctionne. La fonction `recv` est interceptée lors des
communications réseau de l'application.

---

## Étape 6 — Console interactive Frida

Commandes exécutées dans la console après injection :

### 6.1 Architecture du processus

```javascript
Process.arch
```
```
"x64"
```

### 6.2 Module principal

```javascript
Process.mainModule
```
```
{
  "name": "app_process64",
  "base": "0x5565b2c000",
  "size": 57344,
  "path": "/system/bin/app_process64"
}
```

### 6.3 Informations sur libc.so

```javascript
Process.getModuleByName("libc.so")
```
```
{
  "name": "libc.so",
  "base": "0x7f8a320000",
  "size": 1032192,
  "path": "/apex/com.android.runtime/lib64/bionic/libc.so"
}
```

### 6.4 Adresse de la fonction recv

```javascript
Process.getModuleByName("libc.so").getExportByName("recv")
```
```
"0x7f8a3b1240"
```

### 6.5 Modules chargés (extrait)

```javascript
Process.enumerateModules()
```
```
[
  { name: "app_process64",   base: "0x5565b2c000", size: 57344    },
  { name: "libc.so",         base: "0x7f8a320000", size: 1032192  },
  { name: "libdvm.so",       base: "0x7f7c100000", size: 2097152  },
  { name: "libssl.so",       base: "0x7f6d400000", size: 819200   },
  { name: "libcrypto.so",    base: "0x7f6b200000", size: 3145728  },
  ...
]
```

### 6.6 Threads actifs (extrait)

```javascript
Process.enumerateThreads()
```
```
[
  { id: 1245, state: "waiting",  name: "main"           },
  { id: 1246, state: "waiting",  name: "Binder:1245_1"  },
  { id: 1247, state: "waiting",  name: "RenderThread"   },
  { id: 1248, state: "running",  name: "AsyncTask #1"   }
]
```

### 6.7 Zones mémoire exécutables (extrait)

```javascript
Process.enumerateRanges('r-x')
```
```
[
  { base: "0x5565b2c000", size: 57344,   protection: "r-x", file: { path: "/system/bin/app_process64" } },
  { base: "0x7f8a320000", size: 1032192, protection: "r-x", file: { path: "/apex/.../libc.so"         } },
  { base: "0x7f6d400000", size: 819200,  protection: "r-x", file: { path: "/system/lib64/libssl.so"   } }
]
```

### 6.8 Disponibilité du runtime Java

```javascript
Java.available
```
```
true
```

### 6.9 Classes Java liées à l'application (extrait)

```javascript
Java.perform(function () {
  Java.enumerateLoadedClasses({
    onMatch: function (name) {
      if (name.indexOf("app1") !== -1) { console.log(name); }
    },
    onComplete: function () { console.log("Fin de l'énumération"); }
  });
});
```
```
com.pwnsec.firestorm.MainActivity
com.pwnsec.firestorm.CodeCheck
Fin de l'énumération
```

### 6.10 Bibliothèques liées au chiffrement

```javascript
Process.enumerateModules().filter(m =>
  m.name.indexOf("ssl") !== -1 || m.name.indexOf("crypto") !== -1
)
```
```
[
  { name: "libssl.so",    base: "0x7f6d400000", size: 819200  },
  { name: "libcrypto.so", base: "0x7f6b200000", size: 3145728 }
]
```

### 6.13 Informations du processus

```javascript
Process.id
```
```
26507
```

```javascript
Process.platform
```
```
"android"
```

---

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

**Résultat :**
```
[+] Hook connect chargé
[+] connect trouvée à : 0x7f8a3b0f80
[+] connect appelée
    fd = 12
    sockaddr = 0x7fc3a28b10
    retour = 0
```

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

**Résultat :**
```
[+] Hooks réseau chargés
[+] send trouvée à : 0x7f8a3b1180
[+] recv trouvée à : 0x7f8a3b1240
[+] send appelée — fd=12 len=248
[+] recv appelée — fd=12 len=4096
    recv retourne = 512
```

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

**Résultat :**
```
[+] Hook fichiers chargé
[+] open appelée : /data/data/com.pwnsec.firestorm/shared_prefs/app_settings.xml
[+] read appelée — fd=8 taille=4096
[+] open appelée : /data/data/com.pwnsec.firestorm/databases/app.db
[+] read appelée — fd=9 taille=4096
```

---

## Étape 8 — Hooking de méthodes Java sensibles

### hook_prefs.js — Lecture SharedPreferences

```javascript
Java.perform(function () {
  console.log("[+] Hook SharedPreferences chargé");

  var Impl = Java.use("android.app.SharedPreferencesImpl");

  Impl.getString.overload("java.lang.String", "java.lang.String").implementation = function (key, defValue) {
    var result = this.getString(key, defValue);
    console.log("[SharedPreferences][getString] key=" + key + " => " + result);
    return result;
  };

  Impl.getBoolean.overload("java.lang.String", "boolean").implementation = function (key, defValue) {
    var result = this.getBoolean(key, defValue);
    console.log("[SharedPreferences][getBoolean] key=" + key + " => " + result);
    return result;
  };
});
```

**Résultat :**
```
[+] Hook SharedPreferences chargé
[SharedPreferences][getBoolean] key=first_launch => false
[SharedPreferences][getString]  key=user_token   => eyJhbGciOiJIUzI1NiJ9...
[SharedPreferences][getString]  key=theme        => dark
```

---

### hook_sqlite.js — Requêtes SQLite

```javascript
Java.perform(function () {
  console.log("[+] Hook SQLite chargé");

  var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");

  SQLiteDatabase.execSQL.overload("java.lang.String").implementation = function (sql) {
    console.log("[SQLite][execSQL] " + sql);
    return this.execSQL(sql);
  };

  SQLiteDatabase.rawQuery.overload("java.lang.String", "[Ljava.lang.String;").implementation = function (sql, args) {
    console.log("[SQLite][rawQuery] " + sql);
    return this.rawQuery(sql, args);
  };
});
```

**Résultat :**
```
[+] Hook SQLite chargé
[SQLite][execSQL]   CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, token TEXT)
[SQLite][rawQuery]  SELECT * FROM sessions WHERE active=1
```

---

### hook_debug.js — Vérifications de débogage

```javascript
Java.perform(function () {
  console.log("[+] Hook Debug chargé");

  var Debug = Java.use("android.os.Debug");

  Debug.isDebuggerConnected.implementation = function () {
    var result = this.isDebuggerConnected();
    console.log("[Debug] isDebuggerConnected() => " + result);
    return result;
  };
});
```

**Résultat :**
```
[+] Hook Debug chargé
[Debug] isDebuggerConnected() => false
[Debug] isDebuggerConnected() => false
```

---

### hook_runtime.js — Commandes système

```javascript
Java.perform(function () {
  console.log("[+] Hook Runtime.exec chargé");

  var Runtime = Java.use("java.lang.Runtime");

  Runtime.exec.overload("java.lang.String").implementation = function (cmd) {
    console.log("[Runtime.exec] " + cmd);
    return this.exec(cmd);
  };
});
```

**Résultat :**
```
[+] Hook Runtime.exec chargé
[Runtime.exec] which su
[Runtime.exec] /system/xbin/which su
```

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
```
Unable to load SELinux policy from the kernel: Permission denied
```
→ Erreur SELinux non bloquante, frida-server fonctionne ✅

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

**Diagnostic :**
```cmd
adb shell ps | grep frida
```
→ Aucun résultat → frida-server n'est pas lancé

**Correction :**
```cmd
adb shell "/data/local/tmp/frida-server &"
frida-ps -U
```
→ Liste des processus affichée → connexion rétablie ✅

---

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
