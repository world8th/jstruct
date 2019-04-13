(async ()=>{
    let jstruct = await import("./index.mjs");

    let arrayBuffer = new ArrayBuffer(256);
    
    let structInterface = new jstruct.Struct([
        jstruct.U32("RTX", 1),
        jstruct.U8("MBR", 4)
    ]);
    
    // structured view
    let viewer = structInterface.observe(arrayBuffer).value;
    viewer.MBR = 0xFF;
    
    // view bytes
    let uint8 = new Uint8Array(arrayBuffer);
    console.log(uint8);
})();
