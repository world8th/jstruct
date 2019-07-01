(async () => {
    let jstruct = await import("./index.mjs");
    let arrayBuffer = new ArrayBuffer(256);
    let structInterface = new jstruct.StructType({"MBR":jstruct.U32,"HDR":jstruct.U32});
    
    // create structured pointer 
    const viewer = structInterface.construct(arrayBuffer);
    viewer.MBR = 0xFF;
    viewer.HDR = 0xFF;
    
    // view bytes
    console.log(jstruct.U8.construct(arrayBuffer,0,8));
})();
