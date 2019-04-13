
class AccessView {
    constructor({type, buffer, byteOffset = 0, length = 1, ptr = 0}) {
        this.type = type, this.handle = new type.type(buffer, byteOffset, length), this.ptr = ptr;
    }
    _handle(){
        return this.handle;
    }
    //set(ptr = 0){ this.ptr = ptr; return this; }
    //get(ptr = 0){ return this.type.get(this._handle(),this.ptr+ptr); }
    set value(a){ this._handle();
        if (Array.isArray(a)) {
            for (let i in a) { this.type.set(this.handle,a[i],this.ptr+i); };
        } else {
            this.type.set(this.handle,a,this.ptr);
        };
    }
    get value(){ return this.type.get(this._handle(),this.ptr); }
    get buffer(){ return this._handle().buffer; }
    get byteLength(){ return this.this.type.BYTES_PER_ELEMENT*this.length; }
    get BYTES_PER_ELEMENT(){ return this.handle.BYTES_PER_ELEMENT; }
}

class StructView {
    constructor({type, buffer, byteOffset = 0, ptr = 0}) {
        this.buffer = buffer, this.type = type, this.byteOffset = byteOffset, this.ptr = ptr, this.length = 1;
    }
    _handle(){
        let handler = this.handle || {};
        if (!this.handle) { for (let f of this.type.fields) {
            handler[f.name] = new (f.struct ? StructView : AccessView)({type: f, buffer: this.buffer, byteOffset: this.type.BYTES_PER_ELEMENT*this.ptr + this.byteOffset + f.byteOffset, length: f.length});
        };};
        this.handle = handler;
        let observer = this.observer || {_handler: handler};
        if (!this.observer) { for (let f of this.type.fields) {
            Object.defineProperty(observer, f.name, {
                get: function() { return handler[f.name].value; },
                set: function(v) { handler[f.name].value = v; },
                //writable: false
            });
        };};
        return (this.observer = observer);
    }
    get value(){ return this._handle(); }
    set value(obj){ Object.assign(this._handle(),obj); }
    get byteLength(){ return this.type.BYTES_PER_ELEMENT*this.length; }
    get BYTES_PER_ELEMENT(){ return this.type.BYTES_PER_ELEMENT; }
}

class Field {
    constructor({type, name = "", length = 1, byteOffset = 0, stride = 1}){
        this.type = type, this.length = length, this.name = name, this.byteOffset = byteOffset, this.stride = stride;
    }
    get struct(){ return (this.type == Struct); }
    get byteLength(){ return this.type.BYTES_PER_ELEMENT; }
    observe(buffer, ptr = 0){ let f = this; return new AccessView({type: this, buffer, byteOffset: f.BYTES_PER_ELEMENT*ptr + f.byteOffset, length: f.length}); }
    get BYTES_PER_ELEMENT(){ return this.type.BYTES_PER_ELEMENT; }
    set(view, a, ptr = 0){ view[ptr] = a; return this; }
    get(view, ptr = 0){ return view; }
    //get(view, ptr = 0){ return view[ptr]; }
}

class Struct {
    constructor(fields){
        this.struct = true;
        this.fields = Array.from(fields);
        this.length = 1;
        this.byteOffset = 0;
        //this.type = this;
        this.BYTES_PER_ELEMENT = 0;
        for (let f of this.fields) {
            //if (f.type) f.type = f.type;
            f.byteOffset = this.BYTES_PER_ELEMENT;
            this.BYTES_PER_ELEMENT += f.BYTES_PER_ELEMENT;
        }
    };
    field(f){ f.byteOffset = this.BYTES_PER_ELEMENT; this.BYTES_PER_ELEMENT += f.BYTES_PER_ELEMENT; this.fields.push(f); return this; }
    get byteLength(){ return BYTES_PER_ELEMENT; }
    observe(buffer, ptr = 0){ 
        let f = this;
        return new StructView({type: this, buffer, byteOffset: f.BYTES_PER_ELEMENT*ptr + f.byteOffset, length: f.length}); 
    };
    set(view, a, ptr = 0){
        
        //view[ptr] = a;
    }
}

let U8 = (name="",length=1)=>{return new Field({type:Uint8Array,name,length});};
let I8 = (name="",length=1)=>{return new Field({type:Int8Array,name,length});};
let U16 = (name="",length=1)=>{return new Field({type:Uint16Array,name,length});};
let I16 = (name="",length=1)=>{return new Field({type:Int16Array,name,length});};
let U32 = (name="",length=1)=>{return new Field({type:Uint32Array,name,length});};
let I32 = (name="",length=1)=>{return new Field({type:Int32Array,name,length});};
let F32 = (name="",length=1)=>{return new Field({type:Float32Array,name,length});};
let F64 = (name="",length=1)=>{return new Field({type:Float64Array,name,length});};

export {Struct, Field, StructView, AccessView, U8, I8, U16, I16, U32, I32, F32, F64};
