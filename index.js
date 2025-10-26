import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ API local de Calculadora Electrónica activa");
});

app.post("/calcular", (req, res) => {
  const { formula, valores } = req.body ?? {};
  console.log("📥 Recibido:", formula, valores);

  if (!formula) {
    return res.status(400).json({ error: "Falta fórmula" });
  }

  const f = formula.trim().toLowerCase();
  let resultado;

  switch (f) {
    case "ohm_voltaje":
      resultado = Number(valores.I) * Number(valores.R);
      break;
    case "ohm_corriente":
      resultado = Number(valores.V) / Number(valores.R);
      break;
    case "ohm_resistencia":
      resultado = Number(valores.V) / Number(valores.I);
      break;
    case "potencia": // P = V * I
    resultado = Number(valores.V) * Number(valores.I);
    break;
    case "potencia_voltaje": // V = P / I
      if (valores.P == null || valores.I == null) {
        return res.status(400).json({ error: "Faltan datos: P e I" });
      }
      resultado = Number(valores.P) / Number(valores.I);
      break;
    case "potencia_corriente": // I = P / V
      if (valores.P == null || valores.V == null) {
        return res.status(400).json({ error: "Faltan datos: P y V" });
      }
      resultado = Number(valores.P) / Number(valores.V);
      break;
    case "res_serie":
      const resistencias = Object.values(valores).map(Number);
      resultado = resistencias.reduce((acc, r) => acc + r, 0);
      break;
    case "res_paralelo": {
      const resistencias = Object.values(valores).map(Number).filter((r) => r > 0);
    
      if (resistencias.length < 2) {
        return res.status(400).json({ error: "Se requieren al menos 2 resistencias" });
      }
    
      const inversaTotal = resistencias.reduce((suma, r) => suma + 1 / r, 0);
      resultado = 1 / inversaTotal;
      break;
      }
    case "divisor_corriente": {
      const { It, R1, R2 } = valores;
    
      if (!It || !R1 || !R2)
        return res.json({ error: "Faltan valores (It, R1, R2)" });
    
      // Calculamos la resistencia total (en paralelo)
      const Rt = 1 / (1 / parseFloat(R1) + 1 / parseFloat(R2));
    
      // Corriente por R1 y R2
      const I1 = parseFloat(It) * (Rt / parseFloat(R1));
      const I2 = parseFloat(It) * (Rt / parseFloat(R2));
    
      data.resultado = {
        I1,
        I2,
        Rt,
      };  
      break;
      }
    case "divisor":
      resultado =
        Number(valores.Vin) *
        (Number(valores.R2) / (Number(valores.R1) + Number(valores.R2)));
      break;
    default:
      console.log("🚫 Fórmula no soportada:", f);
      return res.status(400).json({ error: "Fórmula no soportada" });
  }

  console.log("✅ Resultado:", resultado);
  res.json({ resultado });
});

export default app;
