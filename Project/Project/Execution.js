

var express = require('express');
const Alu = require('./Classes/Alu.js')
const Load = require('./Classes/Load.js')
const Store = require('./Classes/Store.js')
const QueueInst = require('./Classes/QueueInst.js')

const { render } = require('ejs');
var jsdom = require("jsdom");
var path = require('path')
var JSDOM = jsdom.JSDOM;
global.document={execCommand(){}};
var app = express();
var url = require('url');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var inlineCss = require('inline-css');
const { executionAsyncId } = require('async_hooks');
app.use(express.static(path.join(__dirname, 'Styles')));
app.use(express.static(path.join(__dirname, 'Images')));




var Instructions 
var latencies = [0,0,0,0,0,0]

var AllInst = [];
var AdderReserve = new Array(3)
var MultReserve = new Array(3)
var LoadReserve = new Array(3)
var StoreReserve = new Array(3)
const Memory = new Array(1024).fill(5)
const RegisterFile = new Array(32).fill(5)
const RegisterStatus = new Array(32).fill(0)
// const Issued = []
// const Executing = []
// const WriteBack = []
var ClockCycles = 1
var adderCounter = 0
var multCounter = 0
var storeCounter = 0
var loadCounter = 0
var instPos = 0


//issue()
function fillIn (){
    for(var i=1;i<=3;i++){
        const a = new Alu("","A"+i,0,"","","","","")
        const m = new Alu("","M"+i,0,"","","","","")
         const b = new Load("","L"+i,0,"")
         const c = new Store("","S"+i,0,"","","")
         AdderReserve[i-1]=a
         MultReserve[i-1]=m
         LoadReserve[i-1]=b
         StoreReserve[i-1]=c
   }
}
function Add(i){
    
  
    if(adderCounter!=3){
       
        var J = i.J
        var K = i.K
        const Instruction=''
        const JSplit = J.split("F")
       const KSplit =  K.split("F")
       const posJ = parseInt(JSplit[1])
       const posK = parseInt(KSplit[1])
       var JEmp = RegisterStatus[posJ]
       var KEmp = RegisterStatus[posK]
    
       var a = AdderReserve.findIndex((e)=>e.busy==0)
       var Destination = i.Dest.split('F')
       Destination =parseInt(Destination[1])
       
       if(a!=-1) {
       var latency = (i.Instruction==="ADD.D"?latencies[0]:latencies[1])
       var operation = (i.Instruction==="ADD.D"?"ADD":"SUB")
       RegisterStatus[Destination] = 'A'+(a+1)
       var vJ = ""
       var vK = ""
       var qJ = 0
       var qK = 0
       if(JEmp==0){vJ = RegisterFile[posJ]}
       else qJ = JEmp
       if(KEmp==0){ vK = RegisterFile[posK]}
       else  qK= KEmp 
       var zeft = AllInst[instPos]
       var lat=""
       if(JEmp==0 && KEmp==0){
        
       
        zeft.ExecutionCycles = `${ClockCycles+1} .. ${(ClockCycles+1)+latency-1}`
        lat=latency
       
    }
    zeft.IssueCycle=ClockCycles
    zeft.IdRes = a+1
    AllInst[instPos]=zeft

       
       const alu = new Alu(
          lat,
          "A"+(a+1),
           1,
           operation,
           vJ,
           vK,
           qJ,
           qK,
           instPos
       )
       AdderReserve[a]=alu  
       adderCounter++
       instPos++
    
    }}
  
}


function Mul(i){
   
    if(multCounter!=3){
        var J = i.J
        var K = i.K
        const Instruction=''
        const JSplit = J.split("F")
       const KSplit =  K.split("F")
       var Destination = i.Dest.split('F')
       Destination =parseInt(Destination[1])
      
       const posJ = parseInt(JSplit[1])
       const posK = parseInt(KSplit[1])
       var JEmp = RegisterStatus[posJ]
       var KEmp = RegisterStatus[posK]
       var a = MultReserve.findIndex((e)=>e.busy==0)
       if(a!=-1) {
       var latency = (i.Instruction==="MUL.D"?latencies[2]:latencies[3])
       var operation = (i.Instruction==="MUL.D"?"MUL":"DIV")
       RegisterStatus[Destination] = 'M'+(a+1)
       var vJ = ""
       var vK = ""
       var qJ = 0
       var qK = 0
       if(JEmp==0){vJ = RegisterFile[posJ]}
       else qJ = JEmp
       if(KEmp==0){ vK = RegisterFile[posK]}
       else  qK= KEmp 
       var zeft = AllInst[instPos]
       var lat = ""
       if(JEmp==0 && KEmp==0){
        lat=latency
      
        zeft.ExecutionCycles = `${ClockCycles+1} .. ${(ClockCycles+1)+latency-1}`
       
    }
    zeft.IssueCycle=ClockCycles
    zeft.IdRes = a+1
    AllInst[instPos]=zeft
       
       const alu = new Alu(
          lat,
          "M"+(a+1),
           1,
           operation,
           vJ,
           vK,
           qJ,
           qK,
           instPos
       )
       MultReserve[a]=alu  
       multCounter++
       instPos++

    }}
    
 
}

function load(i){
    if(loadCounter!=3){
      
        
       var a = LoadReserve.findIndex((e)=>e.busy==0)
       var Destination = i.Dest.split('F')
       Destination =parseInt(Destination[1])
       if(a!=-1) {
       var latency = latencies[4]
       var operation = "Load"
       var zeft = AllInst[instPos]
       zeft.IssueCycle=ClockCycles
    zeft.IdRes = a+1
    zeft.ExecutionCycles = `${ClockCycles+1} .. ${(ClockCycles+1)+latency-1}`
    AllInst[instPos]=zeft
    RegisterStatus[Destination] = 'L'+(a+1)
       const l = new Load(
          latency,
          "L"+(a+1),
           1,
           i.J,
           instPos
       )
       LoadReserve[a]=l  
       loadCounter++
       instPos++
    }
}
    
   
}


function store(i){
 
    if(storeCounter!=3){
        var J = i.Dest
        const Instruction=''
        const JSplit = J.split("F")
     
       const posJ = parseInt(JSplit[1])
     
       var JEmp = RegisterStatus[posJ]
     
       var a = StoreReserve.findIndex((e)=>e.busy==0)
       if(a!=-1)
       {var latency = latencies[5]
       var operation = "store"
       var vJ = ""
      
       var qJ = 0
     
       if(JEmp==0){vJ = RegisterFile[posJ]}
       else qJ = JEmp
      
       var zeft = AllInst[instPos]
       var lat = ""
       if(JEmp==0){
        lat=latency
       
        zeft.ExecutionCycles = `${ClockCycles+1} .. ${(ClockCycles+1)+latency-1}`
       
    }
    zeft.IssueCycle=ClockCycles
    zeft.IdRes = a+1
    AllInst[instPos]=zeft
   
       const alu = new Store(
          lat,
          "S"+(a+1),
           1,
           i.J,
           vJ,
           qJ,
           instPos
       )
    
       StoreReserve[a]=alu  
       storeCounter++
       instPos++
    }
    
 }
}


 function issue (){
        if(instPos!=AllInst.length)
       { 
           const i = AllInst[instPos];
        if(i.Instruction==="ADD.D" || i.Instruction==="SUB.D"){
            Add(i)
        }

        else if(i.Instruction==="MUL.D" || i.Instruction==="DIV.D"){
            Mul(i)
        }
        else if(i.Instruction==="L.D" ){
            load(i)
        }
        else if(i.Instruction==="S.D" ){
            store(i)
        }
}       
}

function Execution() {
    var zeft;

    for(var i =0;i<3;i++){
        if(AdderReserve[i].busy==1 && AdderReserve[i].timeRemaining!=0){

            if(AdderReserve[i].qJ==0 && AdderReserve[i].qK==0 ){
            zeft=AdderReserve[i]
            zeft.timeRemaining-=1
                AdderReserve[i]= zeft

            }
        }

        if(MultReserve[i].busy==1 && MultReserve[i].timeRemaining!=0){
            if(MultReserve[i].qJ==0 && MultReserve[i].qK==0){
                zeft=MultReserve[i]
                zeft.timeRemaining-=1
                MultReserve[i]= zeft
                
            }
        }
        if(LoadReserve[i].busy===1 && LoadReserve[i].timeRemaining!=0){
            
                zeft=LoadReserve[i]
                zeft.timeRemaining-=1
                LoadReserve[i]= zeft
              
            
        }

        if(StoreReserve[i].busy==1 && StoreReserve[i].timeRemaining!=0){
            if(StoreReserve[i].q==0){
                zeft=StoreReserve[i]
                zeft.timeRemaining-=1
                StoreReserve[i]= zeft
                
            }
        }

    }

}

function WriteBack() {
    var x=""
    var pos = Number.MAX_VALUE;
    var res = ""
    var result=""
    var dest  =""
    var id 
    for(var i=0;i<3;i++){
        
        if(AdderReserve[i].timeRemaining===0 && AdderReserve[i].pos<pos){
          
            x=AdderReserve[i].id.split("A")
            x=parseInt(x[1])
            id = AdderReserve[i].id
            pos=AdderReserve[i].pos
            if(AdderReserve[i].oper=="ADD") res="A"

           
            else res="S"
        }

        if(MultReserve[i].timeRemaining===0 &&MultReserve[i].pos<pos){
            x=MultReserve[i].id.split("M")
            x=parseInt(x[1])
            id = MultReserve[i].id
            pos=MultReserve[i].pos
            if(MultReserve[i].oper=="MUL")
            res="M"
           
            else  res="D" 
        }

        if(LoadReserve[i].timeRemaining===0 && LoadReserve[i].pos<pos){
            x=LoadReserve[i].id.split("L")
            x=parseInt(x[1])
            res="L"
            id = LoadReserve[i].id
            pos=LoadReserve[i].pos
            

        }

        if(StoreReserve[i].timeRemaining===0  && StoreReserve[i].pos<pos){
            x=StoreReserve[i].id.split("S")
            x=parseInt(x[1])
            res="T"
            id = StoreReserve[i].id
            pos=StoreReserve[i].pos
          
        }
    }
if(res!=""){
    if(res=="A"){
        result=AdderReserve[x-1].vJ + AdderReserve[x-1].vK 
        var all = AllInst[pos]
        dest = all.Dest.split("F")
        dest = parseInt(dest[1])
        RegisterFile[dest]=result
        RegisterStatus[dest]=0
        const a = new Alu("","A"+x,0,"","","","","")
      AdderReserve[x-1] = a
  

      
    }
    else if(res=="S"){
        result=AdderReserve[x-1].vJ - AdderReserve[x-1].vK
        var all = AllInst[pos]
        dest = all.Dest.split("F")
        dest = parseInt(dest[1])
        RegisterFile[dest]=result
        RegisterStatus[dest]=0
        const a = new Alu("","A"+x,0,"","","","","","")
        AdderReserve[x-1] = a
      
       
    }
   else if(res=="M"){
    result=MultReserve[x-1].vJ * MultReserve[x-1].vK 
    var all = AllInst[pos]
    dest = all.Dest.split("F")
    dest = parseInt(dest[1])
    RegisterFile[dest]=result
    RegisterStatus[dest]=0
   
        const m = new Alu("","M"+x,0,"","","","","","")
        MultReserve[x-1] = m
       
  
      
    }
   else if(res=="D"){
    result=MultReserve[x-1].vJ / MultReserve[x-1].vK 
    var all = AllInst[pos]
    dest = all.Dest.split("F")
    dest = parseInt(dest[1])
    RegisterFile[dest]=result
    RegisterStatus[dest]=0
  
    const m = new Alu("","M"+x,0,"","","","","","")
    MultReserve[x-1] = m
  
 
       
    }
  else if(res=="L"){

    result = Memory[parseInt(LoadReserve[x-1].address)]
   
    var all = AllInst[pos]
    dest = all.Dest.split("F")
    dest = parseInt(dest[1])

    RegisterFile[dest]=result
    RegisterStatus[dest]=0
   
         const b = new Load("","L"+x,0,"","")
         LoadReserve[x-1] = b
     
      
    }
   else if(res=="T"){
    result = StoreReserve[x-1].v
    var all = AllInst[pos]
    dest = parseInt(all.J)
    Memory[dest]=result
   
         const c = new Store("","S"+x,0,"","","","")
         StoreReserve[x-1] = c
         
  
    }

    var zeft = AllInst[pos]
    zeft.WritingBackCycles=ClockCycles
    AllInst[pos]=zeft

    for(var i=0;i<3;i++){
        if(AdderReserve[i].busy==1 && AdderReserve[i].id!=id){
            console.log(AdderReserve[i],"adddd")
            if(AdderReserve[i].qJ== id){
                AdderReserve[i].vJ = result
                AdderReserve[i].qJ = 0
                if(AdderReserve[i].qK==0)
               { 
                   if(AdderReserve[i].oper=="ADD"){
                    AdderReserve[i].timeRemaining=latencies[0]+1
                }
                else AdderReserve[i].timeRemaining=latencies[1]+1
                const latency = AdderReserve[i].oper==="ADD"?latencies[0] : latencies[1]
                AllInst[AdderReserve[i].pos].ExecutionCycles= `${ClockCycles+1} .. ${(ClockCycles+latency)}`
            }}

            if(AdderReserve[i].qK== id){
                AdderReserve[i].vK = result
                AdderReserve[i].qK = 0
                if(AdderReserve[i].qJ==0)
               { if(AdderReserve.oper=="ADD"){
                    AdderReserve[i].timeRemaining=latencies[0]+1
                }
                else AdderReserve[i].timeRemaining=latencies[1]+1
                const latency = AdderReserve[i].oper==="ADD"?latencies[0] : latencies[1]
                AllInst[AdderReserve[i].pos].ExecutionCycles= `${ClockCycles+1} .. ${(ClockCycles+latency)}`
            }}
        }

        if(MultReserve[i].busy==1 && MultReserve[i].id!=id){
            if(MultReserve[i].qJ== id){
                MultReserve[i].vJ = result
                MultReserve[i].qJ = 0
                if (MultReserve[i].qK==0)
               { 
                   if(MultReserve[i].oper=="MUL"){
                    MultReserve[i].timeRemaining=latencies[0]+1
                }
                else MultReserve[i].timeRemaining=latencies[1]+1
            }
            const latency = MultReserve[i].oper==="MUL"?latencies[2] : latencies[3]
            AllInst[MultReserve[i].pos].ExecutionCycles= `${ClockCycles+1} .. ${(ClockCycles+latency)}`
        }

            if(MultReserve[i].qK== id){
                MultReserve[i].vK = result
                MultReserve[i].qK = 0
                if(MultReserve[i].qJ==0)
               { if(MultReserve[i].oper=="MUL"){
                    MultReserve[i].timeRemaining=latencies[2]+1
                }
                else MultReserve[i].timeRemaining=latencies[3]+1
                const latency = MultReserve[i].oper==="MUL"?latencies[2] : latencies[3]
            AllInst[MultReserve[i].pos].ExecutionCycles= `${ClockCycles+1} .. ${(ClockCycles+latency)}`
            }
        }

           

        }


        if(StoreReserve[i].busy==1 && StoreReserve[i].id!=id){
            if(StoreReserve[i].q== id){
                StoreReserve[i].v= result
                StoreReserve[i].q= 0
                 StoreReserve[i].timeRemaining=latencies[5]+1
                 AllInst[StoreReserve[i].pos].ExecutionCycles= `${ClockCycles+1} .. ${(ClockCycles+latencies[5])}`
            }

          

        }


    }
}

}

function updateCounters (){
    adderCounter=0
    multCounter=0
    loadCounter=0
    storeCounter=0
    for(var i=0;i<3;i++){
        if(AdderReserve[i].busy==1) adderCounter+=1
        if(MultReserve[i].busy==1) multCounter+=1
        if(LoadReserve[i].busy==1) loadCounter+=1
        if(StoreReserve[i].busy==1) storeCounter+=1
    }
}
function NextCycle () {
    WriteBack();
    Execution();
    issue();
    updateCounters();

    ClockCycles++;
}

function splitting (){
    AllInst=[]
  SplittedInst.forEach((element,i) => {
        const inst = element.split(" ")
        if(inst[0]==="ADD.D" ){
            const alu = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                inst[3],
                "",
               "",
                "",
                latencies[0],
                -1,
                i
            );
            AllInst.push(alu)

        }
        else if(inst[0]==="SUB.D" ){
            const alu = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                inst[3],
                "",
               "",
                "",
                latencies[1],
                -1,
                i
            );
            AllInst.push(alu)

        }
         else if( inst[0]==="MUL.D"){
            const alu = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                inst[3],
                "",
               "",
                "",
                latencies[2],
                -1,
                i
            );
            AllInst.push(alu)

        }
        else if( inst[0]==="DIV.D" ){
            const alu = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                inst[3],
                "",
               "",
                "",
                latencies[3],
                -1,
                i
            );
            AllInst.push(alu)

        }
       else if(inst[0]==="L.D" ){
            const l = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                0,
               
                "",
               "",
                "",
                latencies[4],
                -1,
                i
            );
            AllInst.push(l)
        }
        else if(inst[0]==="S.D"){
            const l = new QueueInst(
                inst[0],
                inst[1],
                inst[2],
                0,
                
                "",
               "",
                "",
                latencies[5],
                -1,
                i
            );
            AllInst.push(l)
        }
        
     
        
     
       
     
     
        })
console.log(AllInst)

}
app.get('/Home' ,function(req,res){
    res.render('Input')
  
  });
  app.post('/Execution' ,function(req,res){
      
    latencies=[parseInt(req.body.Add),parseInt(req.body.Sub),parseInt(req.body.Mult),parseInt(req.body.Div)
      ,parseInt(req.body.Load),parseInt(req.body.Store)]
    Instructions = req.body.code
     SplittedInst = Instructions.split(/\r?\n/);  
      splitting()
      fillIn()
    res.render('Animation',{AllInst:AllInst,AdderReserve:AdderReserve,MultReserve:MultReserve
        ,LoadReserve:LoadReserve,StoreReserve:StoreReserve,RegisterFile,RegisterFile:RegisterFile,
        Memory:Memory,RegisterStatus:RegisterStatus,ClockCycles:ClockCycles})
  
  });
  app.get('/Execution' ,function(req,res){
    res.render('Animation',{AllInst:AllInst,AdderReserve:AdderReserve,MultReserve:MultReserve
        ,LoadReserve:LoadReserve,StoreReserve:StoreReserve,RegisterFile,RegisterFile:RegisterFile,
      Memory:Memory,RegisterStatus:RegisterStatus,ClockCycles:ClockCycles})
  
  });
  app.post('/issue',function(req,res){
    NextCycle()
    res.redirect('Execution')
  })
app.listen(8000, function(){console.log("Server started on port 8000")});


