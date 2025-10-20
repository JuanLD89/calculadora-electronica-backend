const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ API Calculadora Electrónica funcionando");
});

// Ruta de cálculo
app.post("/calcular", (req, res) => {
  const { formula, valores } = req.body ?? {};
  if (!formula || !valores) {
    return res.status(400).json({ error: "Faltan datos: formula y valores" });
  }

  let resultado;

  try {
    switch (formula) {
      // --- Ley de Ohm ---
      case "ohm_voltaje": // V = I * R
        resultado = Number(valores.I) * Number(valores.R);
        break;
    
      case "ohm_corriente": // I = V / R
        resultado = Number(valores.V) / Number(valores.R);
        break;
    
      case "ohm_resistencia": // R = V / I
        resultado = Number(valores.V) / Number(valores.I);
        break;
    
      // --- Potencia ---
      case "potencia": // P = V * I
        resultado = Number(valores.V) * Number(valores.I);
        break;
    
      // --- Resistencias ---
      case "res_serie": // Rtotal = R1 + R2
        resultado = Number(valores.R1) + Number(valores.R2);
        break;
    
      case "res_paralelo": // Rtotal = 1 / (1/R1 + 1/R2)
        {
          const R1 = Number(valores.R1);
          const R2 = Number(valores.R2);
          resultado = 1 / (1 / R1 + 1 / R2);
        }
        break;
    
      // --- Divisor ---
      case "divisor": // Vout = Vin * R2/(R1+R2)
        resultado =
          Number(valores.Vin) *
          (Number(valores.R2) / (Number(valores.R1) + Number(valores.R2)));
        break;
    
      default:
        return res.status(400).json({ error: "Fórmula no soportada" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Error en cálculo", detail: String(e) });
  }

  return res.json({ resultado });
});

module.exports = app;



export default app;

