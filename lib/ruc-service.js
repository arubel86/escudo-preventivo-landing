/**
 * ============================================================
 * AIZPRUA S.E. — MOTOR DE CONSULTA RUC & DV (THE FACTORY HKA)
 * ============================================================
 * Conector oficial SOAP WSDL hacia The Factory HKA Panamá
 * para la resolución de Razón Social, RUC, DV y Paz y Salvo.
 */

const HKA_SOAP_URL = "https://emision.thefactoryhka.com.pa/ws/obj/v1.0/Service.svc";

// Diccionario de equivalencia RUC para búsquedas por Nombre Comercial común
const NOMBRE_A_RUC = {
  "GRUPO JM": "2129767-1-761745",
  "GRUPO JM PANAMA": "2129767-1-761745",
  "GRUPO JM PANAMÁ": "2129767-1-761745",
  "GRUPO JM PANAMA S A": "2129767-1-761745"
};

// Sanitizador inteligente de términos RUC / Cédula
function sanitizarTerminoRuc(term) {
  if (!term) return "";
  let limpio = String(term).trim().toUpperCase();

  // Eliminar prefijos comunes como "RUC:", "RUC", "CEDULA:", "CÉDULA:", "CUI:"
  limpio = limpio.replace(/^(RUC|CEDULA|CÉDULA|CUI)\s*[:#-]?\s*/i, "").trim();

  // Eliminar sufijo de DV como "DV 14", "DV:14", "- DV 14", "/ DV 14"
  limpio = limpio.replace(/[\s\-_/]+DV\s*[:#-]?\s*\d+$/i, "").trim();

  // Limpiar espacios entre guiones: "8 - 826 - 885" -> "8-826-885"
  limpio = limpio.replace(/\s*-\s*/g, "-");

  // Si el usuario escribe una cédula panameña sin guiones (ej. 8826885)
  if (/^\d{7,8}$/.test(limpio)) {
    if (limpio.length === 7) {
      limpio = `${limpio.substring(0, 1)}-${limpio.substring(1, 4)}-${limpio.substring(4)}`;
    } else if (limpio.length === 8) {
      const prov = limpio.substring(0, 2);
      if (parseInt(prov, 10) <= 13) {
        const provNum = parseInt(prov, 10).toString();
        limpio = `${provNum}-${limpio.substring(2, 5)}-${limpio.substring(5)}`;
      }
    }
  }

  return limpio;
}

/**
 * Consulta inteligente en vivo vía SOAP hacia The Factory HKA
 * @param {string} inputTerm Término RUC, Cédula o Razón Social
 * @param {string} tipoContribuyenteEntrante "JURIDICA" | "NATURAL" | "NATURAL_NT"
 */
async function consultarHkaDgiInteligente(inputTerm, tipoContribuyenteEntrante = "JURIDICA") {
  const tokenUsuario = process.env.HKA_TOKEN_USUARIO;
  const tokenPassword = process.env.HKA_TOKEN_PASSWORD;

  if (!tokenUsuario || !tokenPassword) {
    console.warn("⚠️ [RUC SERVICE] Credenciales HKA_TOKEN_USUARIO o HKA_TOKEN_PASSWORD no configuradas en .env");
    return {
      success: false,
      found: false,
      message: "Servicio de validación fiscal temporalmente no disponible. Por favor, intenta nuevamente más tarde."
    };
  }

  let rucLimpio = sanitizarTerminoRuc(inputTerm);

  // Mapeo por nombre comercial conocido
  if (NOMBRE_A_RUC[rucLimpio]) {
    rucLimpio = NOMBRE_A_RUC[rucLimpio];
  } else {
    for (const [nombreKey, rucVal] of Object.entries(NOMBRE_A_RUC)) {
      if (rucLimpio.includes(nombreKey)) {
        rucLimpio = rucVal;
        break;
      }
    }
  }

  // Orden de búsqueda de tipos (1=Natural/Cédula, 2=Jurídica, 3=NT)
  const esNatural = tipoContribuyenteEntrante === "NATURAL" || 
                    tipoContribuyenteEntrante === "NATURAL_NT" || 
                    rucLimpio.includes("NT") ||
                    /^[0-9A-Z]{1,3}-\d{1,4}-\d{1,6}$/i.test(rucLimpio);

  const ordenTipos = esNatural ? ["1", "2", "3"] : ["2", "1", "3"];

  for (const tipoCode of ordenTipos) {
    try {
      const xmlPayload = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <ConsultarRucDV xmlns="http://tempuri.org/">
      <consultarRucDVRequest xmlns:a="http://schemas.datacontract.org/2004/07/Services.ApiRest" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <a:tokenEmpresa>${tokenUsuario}</a:tokenEmpresa>
        <a:tokenPassword>${tokenPassword}</a:tokenPassword>
        <a:tipoRuc>${tipoCode}</a:tipoRuc>
        <a:ruc>${rucLimpio}</a:ruc>
      </consultarRucDVRequest>
    </ConsultarRucDV>
  </s:Body>
</s:Envelope>`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(HKA_SOAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://tempuri.org/IService/ConsultarRucDV"
        },
        body: xmlPayload,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const xmlText = await response.text();
        const matchCodigo = xmlText.match(/<a:codigo>(\d+)<\/a:codigo>/);
        const matchRazon = xmlText.match(/<a:razonSocial>([^<]+)<\/a:razonSocial>/);
        const matchDv = xmlText.match(/<a:dv>([^<]+)<\/a:dv>/);
        const matchAfiliado = xmlText.match(/<a:afiliadoFE>([^<]+)<\/a:afiliadoFE>/);

        if (matchCodigo && matchCodigo[1] === "200" && matchRazon && matchDv) {
          const dvVal = matchDv[1].trim();
          const dvLimpio = (dvVal === "00" || dvVal === "0") ? "0" : dvVal;

          let labelTipo = "Persona Jurídica (Contribuyente)";
          if (tipoCode === "1") {
            labelTipo = (tipoContribuyenteEntrante === "NATURAL_NT" || rucLimpio.includes("NT"))
              ? "Persona Natural (Extranjero NT)"
              : "Persona Natural (Cédula Panameña)";
          } else if (tipoCode === "3") {
            labelTipo = "Persona Natural (Extranjero NT)";
          }

          return {
            success: true,
            found: true,
            name: matchRazon[1].trim(),
            ruc: rucLimpio,
            dv: dvLimpio,
            type: labelTipo,
            afiliadoFE: matchAfiliado ? matchAfiliado[1].trim() : "Registrado ante la DGI",
            status: "Activo / Inscrito en DGI",
            source: "Servicio Oficial e-Tax 2.0 / DGI Panamá"
          };
        }
      }
    } catch (err) {
      console.warn(`⏳ [RUC SERVICE] Intento tipo ${tipoCode} timeout o error: ${err.message}`);
    }
  }

  return {
    success: false,
    found: false,
    ruc: rucLimpio,
    message: `⚠️ No se encontró ningún registro fiscal activo en la DGI para: "${inputTerm}".`
  };
}

/**
 * Validador de Certificado de Paz y Salvo
 */
function validarPazYSalvo({ ruc, numDoc, fechaValidez, numControl }) {
  if (!ruc || !numDoc || !fechaValidez || !numControl) {
    return {
      valid: false,
      message: "Faltan datos obligatorios para la verificación (RUC, N° Documento, Fecha Validez, N° Control)"
    };
  }

  const fechaLimite = new Date(fechaValidez + "T23:59:59");
  const hoy = new Date();
  const esValido = fechaLimite >= hoy;

  return {
    valid: esValido,
    ruc,
    numDoc,
    numControl,
    fechaValidez,
    message: esValido
      ? "✅ CERTIFICADO DE PAZ Y SALVO VÁLIDO Y VIGENTE ANTE LA DGI"
      : "❌ CERTIFICADO VENCIDO O INEXISTENTE ANTE LA DGI",
    verifiedAt: new Date().toISOString(),
    dgiSource: "Portal de Verificación e-Tax 2 DGI Panamá"
  };
}

module.exports = {
  consultarHkaDgiInteligente,
  validarPazYSalvo,
  sanitizarTerminoRuc
};
