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
      console.log("Valores recibidos en divisor_corriente:", valores);
    
      const { It, ...resistencias } = valores;
    
      // 🔍 Mostrar cada resistencia con su valor original
      console.log("Resistencias (raw):", resistencias);
    
      const ItNum = parseFloat(It);
      console.log("It convertido:", ItNum);
    
      if (isNaN(ItNum)) {
        return res.status(400).json({ error: `It inválido: ${It}` });
      }
    
      const Rs = Object.values(resistencias)
        .map((r, i) => {
          const num = parseFloat(r);
          console.log(`R${i + 1}: raw=${r}, num=${num}`);
          return num;
        })
        .filter((r) => r > 0);
    
      console.log("Rs numéricas filtradas:", Rs);
    
      if (Rs.length < 1)
        return res.status(400).json({ error: "Se requieren al menos 1 resistencia válida" });
    
      // Calcular Rt
      const Rt = 1 / Rs.reduce((suma, r) => suma + 1 / r, 0);
      console.log("Rt calculada:", Rt);
    
      // Calcular tensión común
      const V = ItNum * Rt;
      console.log("Tensión común (V):", V);
    
      // Calcular corrientes individuales
      const corrientes = Rs.map((r, i) => ({
        etiqueta: `R${i + 1}`,
        I: V / r,
      }));
    
      console.log("Corrientes individuales:", corrientes);
    
      // Texto formateado
      const texto = [
        ...corrientes.map((c) => `${c.etiqueta}: ${c.I.toFixed(3)} A`),
        `V (tensión común): ${V.toFixed(3)} V`,
        `Rt: ${Rt.toFixed(3)} Ω`,
      ].join("\n");
    
      resultado = texto;
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
