(function () {
  "use strict";

  const CLIENTIFY_ACTION = "https://api.clientify.net/web-marketing/webforms/action/301900/";
  const CLIENTIFY_FIELDS = {
    name: "name",
    company: "company",
    email: "email",
    phone: "phone",
    privacy: "gdpr_acceptance",
    interest: "custom_field_535942",
    message: "message"
  };

  const reportForms = {
    "La ficción de la lealtad": "283226",
    "Deus Ex Machina": "301889",
    "La aceleración sin destino": "284015",
    "La tentación de no hacer nada": "284015"
  };

  const footerLinks = {
    LinkedIn: ["https://www.linkedin.com/company/soulsight-madrid", true],
    Instagram: ["https://www.instagram.com/soulsightlife", true],
    YouTube: ["https://www.youtube.com/@soulsightlife", true],
    "POLÍTICA DE PRIVACIDAD": ["https://soulsight.es/politica-de-privacidad/", false],
    "POLÍTICA DE COOKIES": ["https://soulsight.es/politica-de-cookies/", false],
    "AVISO LEGAL": ["https://soulsight.es/aviso-legal/", false],
    POLICIES: ["https://soulsight.es/policies/", false]
  };

  function activateFooterLinks() {
    document.querySelectorAll("footer a").forEach(function (link) {
      const config = footerLinks[link.textContent.trim()];
      if (!config) return;
      link.href = config[0];
      if (config[1]) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });
  }

  function collectPayload(form) {
    const data = { window_location_href: window.location.href };
    Object.keys(CLIENTIFY_FIELDS).forEach(function (fieldName) {
      const field = form.elements.namedItem(fieldName);
      if (!field) return;
      const key = CLIENTIFY_FIELDS[fieldName];
      if (field.type === "checkbox") {
        if (field.checked) data[key] = field.value || "on";
        return;
      }
      const value = String(field.value || "").trim();
      if (value) data[key] = value;
    });
    return data;
  }

  function encodePayload(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      })
      .join("&");
  }

  function sendToClientify(form) {
    return fetch(CLIENTIFY_ACTION, {
      method: "POST",
      headers: {
        Accept: "application/x-www-form-urlencoded; charset=utf-8",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: encodePayload(collectPayload(form))
    }).then(function (response) {
      if (!response.ok) throw new Error("Clientify status " + response.status);
      return response.json();
    }).then(function (result) {
      if (!result.success) throw new Error("Clientify rejected");
      if (result.tracking_pixel) new Image().src = result.tracking_pixel;
      if (result.tracking_pixel2) new Image().src = result.tracking_pixel2;
      return result;
    });
  }

  function activateContactForm() {
    const form = document.getElementById("clientify-contact-form");
    const feedback = document.getElementById("form-feedback");
    if (!form || !feedback) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const phone = form.elements.namedItem("phone");
      const validPhone = /^\+[1-9]\d{8,14}$/.test(String(phone.value || "").trim());
      phone.setCustomValidity(validPhone ? "" : "Incluye el prefijo del país sin espacios, por ejemplo +34600123456.");

      if (!form.checkValidity()) {
        form.reportValidity();
        feedback.textContent = validPhone
          ? "Revisa los campos obligatorios antes de enviar."
          : "Revisa el teléfono: debe incluir el prefijo del país, por ejemplo +34600123456.";
        feedback.className = "form-feedback form-feedback--error";
        feedback.hidden = false;
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;

      sendToClientify(form)
        .then(function () {
          feedback.textContent = "Gracias. Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.";
          feedback.className = "form-feedback form-feedback--success";
          feedback.hidden = false;
          form.reset();
        })
        .catch(function (error) {
          console.error(error);
          feedback.textContent = "No hemos podido enviar el formulario. Inténtalo de nuevo en unos minutos.";
          feedback.className = "form-feedback form-feedback--error";
          feedback.hidden = false;
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  }

  function openReportForm(title, opener) {
    const formId = reportForms[title];
    if (!formId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const backdrop = document.createElement("div");
    backdrop.className = "report-modal-backdrop";
    backdrop.setAttribute("role", "presentation");

    const modal = document.createElement("div");
    modal.className = "report-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Formulario para " + title);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "report-modal-close";
    closeButton.setAttribute("aria-label", "Cerrar formulario");
    closeButton.textContent = "×";

    const frame = document.createElement("iframe");
    frame.className = "report-form-frame";
    frame.title = "Formulario para " + title;
    frame.style.height = "560px";
    frame.src = "/sobremesa/forms/" + formId + ".html";

    modal.append(closeButton, frame);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function measure() {
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      const host = doc.querySelector('[id^="_form_embedformselectorc"]');
      const embed = doc.querySelector("iframe.commonembedclientify");
      const hostH = host ? host.getBoundingClientRect().height : 0;
      const embedH = embed ? embed.getBoundingClientRect().height : 0;
      const height = Math.max(hostH, embedH, 240);
      if (height > 100) {
        frame.style.height = Math.min(Math.ceil(height + 24), Math.floor(window.innerHeight * 0.76)) + "px";
      }
    }

    const measuring = window.setInterval(measure, 400);
    frame.addEventListener("load", measure);

    function close() {
      window.clearInterval(measuring);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      backdrop.remove();
      opener.focus();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") close();
    }

    closeButton.addEventListener("click", close);
    backdrop.addEventListener("mousedown", function (event) {
      if (event.target === backdrop) close();
    });
    document.addEventListener("keydown", onKeyDown);
    closeButton.focus();
  }

  function activateReportForms() {
    document.querySelectorAll(".meeting-list article").forEach(function (article) {
      const title = article.querySelector("h3");
      const trigger = article.querySelector(".meeting-copy a");
      if (!title || !trigger || !reportForms[title.textContent.trim()]) return;
      trigger.classList.add("report-trigger");
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        openReportForm(title.textContent.trim(), trigger);
      });
    });
  }

  function activateCarousel() {
    document.querySelectorAll(".research-carousel").forEach(function (carousel) {
      let dragging = false;
      let previousX = 0;
      carousel.addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "mouse") return;
        dragging = true;
        previousX = event.clientX;
        carousel.classList.add("is-dragging");
        carousel.setPointerCapture(event.pointerId);
      });
      carousel.addEventListener("pointermove", function (event) {
        if (!dragging || event.pointerType !== "mouse") return;
        event.preventDefault();
        const delta = event.clientX - previousX;
        previousX = event.clientX;
        carousel.scrollLeft -= delta * 2.2;
      });
      function stop(event) {
        if (!dragging) return;
        dragging = false;
        carousel.classList.remove("is-dragging");
        if (carousel.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId);
      }
      carousel.addEventListener("pointerup", stop);
      carousel.addEventListener("pointercancel", stop);
    });
  }

  // Si una caché antigua inyectó un superform de Clientify en el documento
  // principal (aparece tras el footer, sin lightbox), lo eliminamos.
  function removeOrphanClientifyEmbeds() {
    var selectors = [
      'body > [id^="_form_embedformselectorc"]',
      'body > div[class^="id1"]',
      'body > div[class^="id2"]',
      'main ~ [id^="_form_embedformselectorc"]',
      'footer ~ [id^="_form_embedformselectorc"]',
      'body > iframe.commonembedclientify',
      'body > .form_embed_clientify_embed_form'
    ];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        if (node.closest && node.closest(".report-modal")) return;
        node.remove();
      });
    });
  }

  activateFooterLinks();
  activateContactForm();
  activateReportForms();
  activateCarousel();
  removeOrphanClientifyEmbeds();
  window.setTimeout(removeOrphanClientifyEmbeds, 1000);
  window.setTimeout(removeOrphanClientifyEmbeds, 3000);
  window.setTimeout(removeOrphanClientifyEmbeds, 6000);

  if (typeof MutationObserver === "function") {
    var orphanObserver = new MutationObserver(function () {
      removeOrphanClientifyEmbeds();
    });
    orphanObserver.observe(document.body, { childList: true });
    window.setTimeout(function () {
      orphanObserver.disconnect();
    }, 15000);
  }
})();
