import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{i as t,r as n}from"./framework-CXnKph_e.js";var r=e(t(),1),i=n(),a=/^\+[1-9]\d{8,14}$/;

/**
 * Formulario de contacto + araña Clientify 301900.
 * La araña captura en el CLIC del botón ENVIAR (antes del submit).
 * Este componente solo valida, evita la recarga y muestra feedback.
 * No envía por fetch para no duplicar contactos.
 */
function d(){
  let[e,t]=(0,r.useState)(null);
  function n(r){
    r.preventDefault();
    let n=r.currentTarget,o=n.elements.namedItem("phone");
    if(o&&!a.test(o.value.trim())){
      o.setCustomValidity("Incluye el prefijo del país sin espacios, por ejemplo +34600123456.");
      o.reportValidity();
      t({message:"Revisa el teléfono: debe incluir el prefijo del país, por ejemplo +34600123456.",type:"error"});
      return;
    }
    o&&o.setCustomValidity("");
    if(!n.checkValidity()){
      n.reportValidity();
      t({message:"Revisa los campos obligatorios antes de enviar.",type:"error"});
      return;
    }
    // La araña 301900 ya ha capturado los datos en el evento click del botón.
    t({message:"Gracias. Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.",type:"success"});
    n.reset();
  }
  return(0,i.jsxs)("form",{id:"clientify-contact-form",noValidate:!0,onSubmit:n,children:[
    (0,i.jsx)("h3",{children:"Formulario de contacto"}),
    (0,i.jsx)("input",{name:"name",type:"text","aria-label":"Nombre y apellidos",placeholder:"Nombre y apellidos (obligatorio)",required:!0}),
    (0,i.jsx)("input",{name:"company",type:"text","aria-label":"Empresa",placeholder:"Empresa (obligatorio)",required:!0}),
    (0,i.jsx)("input",{name:"email",type:"email","aria-label":"Email",placeholder:"Email de contacto (obligatorio)",required:!0}),
    (0,i.jsx)("input",{name:"phone",type:"tel","aria-label":"Teléfono",placeholder:"+34600123456 (obligatorio)",inputMode:"tel",autoComplete:"tel",pattern:"^\\+[1-9]\\d{8,14}$",title:"Incluye el prefijo del país sin espacios, por ejemplo +34600123456",required:!0,onInput:n=>{n.currentTarget.setCustomValidity(""),e&&e.type==="error"&&t(null)}}),
    (0,i.jsxs)("select",{name:"interest","aria-label":"Motivo",required:!0,defaultValue:"",children:[
      (0,i.jsx)("option",{value:"",disabled:!0,children:"Elige una opción"}),
      (0,i.jsx)("option",{value:"Laboratorio de Investigación",children:"Laboratorio de Investigación"}),
      (0,i.jsx)("option",{value:"Encuentro Sobremesa",children:"Encuentro Sobremesa"}),
      (0,i.jsx)("option",{value:"Mesa de Investigación",children:"Mesa de Investigación"}),
      (0,i.jsx)("option",{value:"Todos",children:"Todos"})
    ]}),
    (0,i.jsx)("textarea",{name:"message","aria-label":"Mensaje",placeholder:"Mensaje"}),
    (0,i.jsxs)("div",{className:"form-bottom",children:[
      (0,i.jsxs)("label",{children:[(0,i.jsx)("input",{name:"privacy",type:"checkbox",required:!0})," Acepto los términos y condiciones"]}),
      (0,i.jsxs)("button",{type:"submit",children:["ENVIAR ",(0,i.jsx)("span",{"aria-hidden":"true",children:"→"})]})
    ]}),
    e&&(0,i.jsx)("p",{className:`form-feedback form-feedback--${e.type}`,role:"status","aria-live":"polite",children:e.message})
  ]});
}
export{d as default};
