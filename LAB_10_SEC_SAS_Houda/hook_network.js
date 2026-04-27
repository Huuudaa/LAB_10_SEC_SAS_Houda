console.log("[+] Hooks réseau chargés");

var libc = Process.getModuleByName("libc.so");
var sendPtr = libc.getExportByName("send");
var recvPtr = libc.getExportByName("recv");

console.log("[+] send à : " + sendPtr);
console.log("[+] recv à : " + recvPtr);

Interceptor.attach(sendPtr, {
  onEnter(args) {
    console.log("[+] send — fd=" + args[0] + " len=" + args[2].toInt32());
  }
});

Interceptor.attach(recvPtr, {
  onEnter(args) {
    console.log("[+] recv — fd=" + args[0] + " len=" + args[2].toInt32());
  },
  onLeave(retval) {
    console.log("    recv retourne=" + retval.toInt32());
  }
});