/*
class AccessView {
    constructor({type, buffer, byteOffset = 0, length = 1, ptr = 0}) {
        this.type = type, this.handle = new type.type(buffer, byteOffset, length), this.ptr = ptr;
    }
    _handle(){ return this.handle; }
    //set(ptr = 0){ this.ptr = ptr; return this; }
    //get(ptr = 0){ return this.type.get(this._handle(),this.ptr+ptr); }
    set value(a){ this._handle();
        if (Array.isArray(a)) {
            for (let i in a) { this.type.set(this.handle,a[i],this.ptr+i); }
        } else {
            this.type.set(this.handle,a,this.ptr);
        }
    }
    get length(){ return this.handle.length; }
    get value(){ return this.type.get(this._handle(),this.ptr); }
    get buffer(){ return this._handle().buffer; }
    get byteLength(){ return this.this.type.BYTES_PER_ELEMENT*this.length; }
    get BYTES_PER_ELEMENT(){ return this.handle.BYTES_PER_ELEMENT; }
}

class StructView {
    constructor({type, buffer, byteOffset = 0, length = 1, ptr = 0}) {
        this.buffer = buffer, this.type = type, this.byteOffset = byteOffset, this.length = length, this.ptr = ptr;
    }
    _handle(){
        let handler = this.handle || {};
        if (!this.handle) { for (let f of this.type.fields) {
            handler[f.name] = new (f.struct ? StructView : AccessView)({type: f, buffer: this.buffer, byteOffset: this.type.BYTES_PER_ELEMENT*this.ptr + this.byteOffset + f.byteOffset, length: f.length});
        }}
        this.handle = handler;
        let observer = this.observer || {_handler: handler};
        if (!this.observer) { for (let f of this.type.fields) {
            Object.defineProperty(observer, f.name, {
                get: ( ) => { return handler[f.name].value; },
                set: (v) => { handler[f.name].value = v; },
                //writable: false
            });
        }}
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
    }
    field(f){ f.byteOffset = this.BYTES_PER_ELEMENT; this.BYTES_PER_ELEMENT += f.BYTES_PER_ELEMENT; this.fields.push(f); return this; }
    get byteLength(){ return BYTES_PER_ELEMENT; }
    observe(buffer, ptr = 0){ 
        let f = this;
        return new StructView({type: this, buffer, byteOffset: f.BYTES_PER_ELEMENT*ptr + f.byteOffset, length: f.length}); 
    }
    set(view, a, ptr = 0){
        
        //view[ptr] = a;
    }
}
*/


class ValueType {
    constructor(type,count=1){
        this.type = type, this.count = 1;
    }
    accessView(obj,name,ptr) {
        obj[name+"*"] = ptr;
        Object.defineProperty(obj, name, {
            get: ( ) => { return ptr[0]; },
            set: (v) => { ptr[0] = v; },
        });
    }
    construct(AB,offset=0,count=this.count) {
        return this.type.construct(AB,offset,count);
    }
    get sizeof(){ return this.type.sizeof * this.count; };
};

class ArrayType {
    constructor(type,count=1){
        this.type = type, this.count = count;
    }
    accessView(obj,name,ptr) { obj[name+"*"] = ptr, obj[name] = ptr; }
    construct(AB,offset=0,count=this.count) {
        return this.type.construct(AB,offset,count);
    }
    get sizeof(){ return this.type.sizeof * this.count; };
};

class StructType {
    constructor(types,count=1) {
        this.types = types, this.count = count;
    }
    accessView(obj,name,ptr) { obj[name+"*"] = ptr, obj[name] = ptr; };
    construct(AB,offset=0,count=this.count) {
        let struct = {}, scnt = 0;
        for (let k in this.types) {
            let soff = scnt; scnt += this.types[k].sizeof;
            this.types[k].accessView(struct,k,this.types[k].construct(AB,offset+soff));
        };
        return struct;
    }
    get sizeof(){ let scnt = 0; for (let k in this.types) { let soff = scnt; scnt += this.types[k].sizeof; }; return scnt; };
};



// generic types 
let U8 = new ValueType({construct(AB,offset=0,count=1) {return new Uint8Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Uint8Array.BYTES_PER_ELEMENT;}});
let I8 = new ValueType({construct(AB,offset=0,count=1) {return new Int8Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Int8Array.BYTES_PER_ELEMENT;}});
let U16 = new ValueType({construct(AB,offset=0,count=1) {return new Uint16Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Uint16Array.BYTES_PER_ELEMENT;}});
let I16 = new ValueType({construct(AB,offset=0,count=1) {return new Int16Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Int16Array.BYTES_PER_ELEMENT;}});
let U32 = new ValueType({construct(AB,offset=0,count=1) {return new Uint32Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Uint32Array.BYTES_PER_ELEMENT;}});
let I32 = new ValueType({construct(AB,offset=0,count=1) {return new Int32Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Int32Array.BYTES_PER_ELEMENT;}});
let F32 = new ValueType({construct(AB,offset=0,count=1) {return new Float32Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Float32Array.BYTES_PER_ELEMENT;}});
let F64 = new ValueType({construct(AB,offset=0,count=1) {return new Float64Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return Float64Array.BYTES_PER_ELEMENT;}});

// new types 
let U64 = new ValueType({construct(AB,offset=0,count=1) {return new BigUint64Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return BigUint64Array.BYTES_PER_ELEMENT;}});
let I64 = new ValueType({construct(AB,offset=0,count=1) {return new BigInt64Array(AB,offset,count);},accessView(obj,name,ptr) { obj[name] = ptr; }, get sizeof(){return BigInt64Array.BYTES_PER_ELEMENT;}});

export {StructType, ArrayType, ValueType, U8, I8, U16, I16, U32, I32, F32, F64, U64, I64};
