import express from "express";
import cors from "cors";

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
  if (!formula || !valores)
    return res.status(400).json({ error: "Faltan datos: formula y valores" });

  let resultado;
  try {
    switch (formula) {
      // 🧮 LEY DE OHM general (solo voltaje)
      case "ohm": // V = I * R
      case "ohm_voltaje":
        resultado = Number(valores.I) * Number(valores.R);
        break;

      // 🔌 Corriente (I = V / R)
      case "ohm_corriente":
        resultado = Number(valores.V) / Number(valores.R);
        break;

      // 🧲 Resistencia (R = V / I)
      case "ohm_resistencia":
        resultado = Number(valores.V) / Number(valores.I);
        break;

      // ⚡ Potencia (P = V × I)
      case "potencia":
        resultado = Number(valores.V) * Number(valores.I);
        break;

      // 🧱 Resistencias en serie
      case "res_serie":
        resultado = Number(valores.R1) + Number(valores.R2);
        break;

      // 🔀 Resistencias en paralelo
      case "res_paralelo": {
        const R1 = Number(valores.R1),
          R2 = Number(valores.R2);
        resultado = 1 / (1 / R1 + 1 / R2);
        break;
      }

      // ⚙️ Divisor de tensión
      case "divisor":
        resultado =
          Number(valores.Vin) *
          (Number(valores.R2) / (Number(valores.R1) + Number(valores.R2)));
        break;

      default:
        return res.status(400).json({ error: "Fórmula no soportada" });
    }
  } catch (e) {
    return res.status(500).json({ error: "Error en cálculo", detail: String(e) });
  }

  return res.json({ resultado });
});


export default app;

