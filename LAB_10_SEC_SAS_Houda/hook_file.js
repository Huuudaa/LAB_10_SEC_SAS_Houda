console.log("[+] Hook fichiers chargé");

var libc = Process.getModuleByName("libc.so");
var openPtr = libc.getExportByName("open");
var readPtr = libc.getExportByName("read");

console.log("[+] open à : " + openPtr);
console.log("[+] read à : " + readPtr);

Interceptor.attach(openPtr, {
  onEnter(args) {
    this.path = args[0].readUtf8String();
    console.log("[+] open : " + this.path);
  }
});

Interceptor.attach(readPtr, {
  onEnter(args) {
    console.log("[+] read — fd=" + args[0] + " taille=" + args[2].toInt32());
  }
});