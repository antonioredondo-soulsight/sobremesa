import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{i as t,r as n}from"./framework-CXnKph_e.js";var r=e(t(),1),i=n();

var FORM_IDS={
  "La ficción de la lealtad":"283226",
  "Deus Ex Machina":"301889",
  "La aceleración sin destino":"284015",
  "La tentación de no hacer nada":"284015"
};

var IMAGES={
  "La ficción de la lealtad":{src:"/sobremesa/assets/encuentro-ficcion-lealtad.jpg",alt:"Persona relajada en una oficina"},
  "Deus Ex Machina":{src:"/sobremesa/assets/encuentro-deus-ex-machina.jpg",alt:"Teclado con las letras AI visibles tras una capa de cartón"},
  "La aceleración sin destino":{src:"/sobremesa/assets/encuentro-aceleracion-sin-destino.jpg",alt:"Persona caminando frente a un tren en movimiento"},
  "La tentación de no hacer nada":{src:"/sobremesa/assets/encuentro-tentacion-no-hacer-nada.jpg",alt:"Persona leyendo en casa",objectPosition:"center 42%"}
};

var ACCOUNT_ID="128210";

function randomId(){
  var possible="abcdefghijklmnopqrstuvw";
  var out="";
  for(var i=0;i<5;i++) out+=possible.charAt(Math.floor(Math.random()*possible.length));
  return out;
}

function mountClientifySuperform(container,formId){
  container.innerHTML="";

  var rand=randomId();
  var host=document.createElement("div");
  host.id="_form_embedformselectorc"+rand;
  container.appendChild(host);

  var d1=document.createElement("div");
  d1.id=ACCOUNT_ID;
  d1.className="id1"+rand;
  d1.style.display="none";
  document.body.appendChild(d1);

  var d2=document.createElement("div");
  d2.id=String(formId);
  d2.className="id2"+rand;
  d2.style.display="none";
  document.body.appendChild(d2);

  var script=document.createElement("script");
  script.async=false;
  script.type="text/javascript";
  script.className="loadjs";
  script.src="https://api.clientify.net/static/js/superformbuilderembedv2/launcher/clientify_regularembed.js?"+rand;
  document.head.appendChild(script);

  return function cleanup(){
    script.remove();
    d1.remove();
    d2.remove();
    container.innerHTML="";
  };
}

function ReportDownloads({meetings:e}){
  var openState=(0,r.useState)(null);
  var openTitle=openState[0];
  var setOpenTitle=openState[1];
  var openerRef=(0,r.useRef)(null);
  var closeBtnRef=(0,r.useRef)(null);
  var mountRef=(0,r.useRef)(null);
  var cleanupRef=(0,r.useRef)(null);

  (0,r.useEffect)(function(){
    if(!openTitle) return;
    var prevOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    closeBtnRef.current&&closeBtnRef.current.focus();

    function onKey(ev){
      if(ev.key==="Escape") setOpenTitle(null);
    }
    document.addEventListener("keydown",onKey);

    return function(){
      document.removeEventListener("keydown",onKey);
      document.body.style.overflow=prevOverflow;
      openerRef.current&&openerRef.current.focus();
    };
  },[openTitle]);

  (0,r.useEffect)(function(){
    if(!openTitle||!mountRef.current) return;
    var formId=FORM_IDS[openTitle];
    if(!formId) return;
    cleanupRef.current=mountClientifySuperform(mountRef.current,formId);
    return function(){
      if(cleanupRef.current){
        cleanupRef.current();
        cleanupRef.current=null;
      }
    };
  },[openTitle]);

  function openForm(title,button){
    openerRef.current=button;
    setOpenTitle(title);
  }

  return (0,i.jsxs)(i.Fragment,{children:[
    (0,i.jsx)("div",{className:"meeting-list",children:e.map(function(pair){
      var title=pair[0];
      var copy=pair[1];
      var img=IMAGES[title];
      return (0,i.jsxs)("article",{children:[
        (0,i.jsxs)("div",{className:"meeting-title",children:[
          (0,i.jsx)("small",{children:"ENCUENTRO"}),
          (0,i.jsx)("h3",{children:title})
        ]}),
        (0,i.jsxs)("div",{className:"meeting-copy",children:[
          (0,i.jsx)("small",{children:"SOBRE QUÉ CONVERSAREMOS"}),
          (0,i.jsx)("p",{children:copy}),
          (0,i.jsx)("button",{
            type:"button",
            className:"report-trigger",
            onClick:function(ev){openForm(title,ev.currentTarget);},
            "aria-haspopup":"dialog",
            children:"Descargar informe"
          })
        ]}),
        (0,i.jsx)("img",{src:img.src,style:{objectPosition:img.objectPosition||"center"},alt:img.alt})
      ]},title);
    })}),
    openTitle&&(0,i.jsx)("div",{
      className:"report-modal-backdrop",
      role:"presentation",
      onMouseDown:function(ev){if(ev.target===ev.currentTarget) setOpenTitle(null);},
      children:(0,i.jsxs)("div",{
        className:"report-modal",
        role:"dialog",
        "aria-modal":"true",
        "aria-labelledby":"report-modal-title",
        children:[
          (0,i.jsxs)("h2",{id:"report-modal-title",className:"sr-only",children:["Formulario para ",openTitle]}),
          (0,i.jsx)("button",{
            ref:closeBtnRef,
            type:"button",
            className:"report-modal-close",
            onClick:function(){setOpenTitle(null);},
            "aria-label":"Cerrar formulario",
            children:"×"
          }),
          (0,i.jsx)("div",{ref:mountRef,className:"report-form-host"})
        ]
      })
    })
  ]});
}

export{ReportDownloads as default};
