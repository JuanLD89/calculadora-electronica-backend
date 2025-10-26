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
    case "divisor":
      resultado =
        Number(valores.Vin) *
        (Number(valores.R2) / (Number(valores.R1) + Number(valores.R2)));
      break;

    case "divisor_corriente": {
      // Esperamos en valores: It (corriente total) y R1, R2, R3, ... Rn
      const { It, ...rest } = valores ?? {};
    
      // Validaciones básicas
      if (It == null) {
        return res.status(400).json({ error: "Falta corriente total (It)" });
      }
    
      const resistencias = Object.values(rest)
        .map((v) => Number(v))
        .filter((r) => !isNaN(r) && r > 0);
    
      if (resistencias.length < 1) {
        return res.status(400).json({ error: "Se requieren al menos 1 resistencia válida" });
      }
    
      // Resistencias originales con sus claves (R1, R2, ...)
      const entradas = Object.entries(rest)
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
    
      // Convertir a números y construir mapa clave -> número
      const mapa = {};
      entradas.forEach(([k, v]) => {
        const num = Number(v);
        if (!isNaN(num) && num > 0) mapa[k] = num;
      });
    
      // Recalcular con solo resistencias válidas (manteniendo claves)
      const valoresRes = Object.values(mapa);
      if (valoresRes.length < 1) {
        return res.status(400).json({ error: "No hay resistencias válidas (R1,R2,...)" });
      }
    
      // Rt = 1 / sum(1/Ri)
      const sumaInversas = valoresRes.reduce((s, r) => s + 1 / r, 0);
      const Rt = 1 / sumaInversas;
    
      const ItNum = Number(It);
      if (isNaN(ItNum)) return res.status(400).json({ error: "It debe ser un número" });
    
      // Corriente en cada resistencia: I_x = It * Rt / R_x
      const corrientesMap = {};
      Object.entries(mapa).forEach(([k, r]) => {
        const Ix = ItNum * (Rt / r);
        corrientesMap[k] = Ix;
      });
    
      // También devolvemos V (tensión común en las ramas)
      const V = ItNum * Rt;
    
      resultado = {
        Rt,
        V,
        corrientes: corrientesMap, // { R1: 0.1, R2: 0.2, ... }
      };
    
      break;
    }

      
    default:
      console.log("🚫 Fórmula no soportada:", f);
      return res.status(400).json({ error: "Fórmula no soportada" });
  }

  console.log("✅ Resultado:", resultado);
  res.json({ resultado });
});

export default app;
