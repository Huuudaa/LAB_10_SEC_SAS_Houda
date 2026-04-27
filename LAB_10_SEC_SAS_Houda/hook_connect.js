console.log("[+] Hook connect chargé");

var libc = Process.getModuleByName("libc.so");
var connectPtr = libc.getExportByName("connect");
console.log("[+] connect trouvée à : " + connectPtr);

Interceptor.attach(connectPtr, {
  onEnter(args) {
    console.log("[+] connect appelée — fd=" + args[0]);
  },
  onLeave(retval) {
    console.log("    retour = " + retval.toInt32());
  }
});