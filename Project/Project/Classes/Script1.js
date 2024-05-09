let table = document.querySelector(" #registers");
let values = document.querySelector(" #values");
    var html=``;
    var html2=``
    for(var i=1;i<=16;i++){
        html+=`<th scope="col" >F${i}</th>`
        html2+=`<td id="F${i}">0</td>`
    }
    table.innerHTML=html
    values.innerHTML=html2

   table=document.querySelector(" #registers16")
   values=document.querySelector(" #values16")
    html=``;
    html2=``
    for(var i=17;i<=32;i++){
        html+=`<th scope="col">F${i}</th>`
        html2+=`<td id="F${i}">0</td>`
    }
    table.innerHTML=html;
    values.innerHTML=html2

    var mem=document.querySelector("#mem");
    html=``
    for(var i=0;i<=1024;i++){
        html+=`<option id="mem${i}">${i} -> 0 </option>`
    }
    mem.innerHTML=html

    var reg=document.querySelector("#reg")
    html=``
    for(var i=1;i<=32;i++){
        html+=`<option id="reg${i}">F${i} -> 0 </option>`
    }
    reg.innerHTML=html



  

  

