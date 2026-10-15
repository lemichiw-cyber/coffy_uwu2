// ============================================================
// CAFETERÍA ESCOLAR — Sistema de Pedidos
// ============================================================

// 1. Catálogo de productos (mínimo 6)
const productos = [
  { codigo: "P001", nombre: "Pupusa",     precio: 0.75 },
  { codigo: "P002", nombre: "Hamburguesa", precio: 2.50 },
  { codigo: "P003", nombre: "Pizza",      precio: 2.00 },
  { codigo: "P004", nombre: "Taco",       precio: 1.50 },
  { codigo: "P005", nombre: "Jugo",       precio: 1.00 },
  { codigo: "P006", nombre: "Agua",       precio: 0.75 }
];

// Guardamos en memoria los pedidos cargados desde pedidos.txt
let pedidosCargados = [];

// Referencias a elementos del HTML
const formPedido   = document.getElementById("formPedido");
const seccionTicket = document.getElementById("seccionTicket");
const ticket        = document.getElementById("ticket");
const btnDescargar  = document.getElementById("btnDescargar");
const btnCargar     = document.getElementById("btnCargar");
const tablaBody     = document.querySelector("#tablaPedidos tbody");
const seccionResumen = document.getElementById("seccionResumen");
const resumen       = document.getElementById("resumen");

// ============================================================
// 2. Registrar un nuevo pedido
// ============================================================
formPedido.addEventListener("submit", function (e) {
  e.preventDefault();

  // Leer datos del formulario
  const cliente   = document.getElementById("cliente").value.trim();
  const codigo    = document.getElementById("producto").value;
  const cantidad  = parseInt(document.getElementById("cantidad").value);
  const metodoPago = document.querySelector('input[name="pago"]:checked').value;

  // Buscar el producto elegido
  const prod = productos.find(p => p.codigo === codigo);

  // Validación
  if (cliente === "" || isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor complete todos los campos correctamente.");
    return;
  }

  // 3. Cálculos
  const precio   = prod.precio;
  const subtotal = precio * cantidad;

  // 4. Promoción: 10% de descuento si cantidad >= 5
  let descuento = 0;
  if (cantidad >= 5) {
    descuento = subtotal * 0.10;
  }

  const total = subtotal - descuento;

  // Generar código consecutivo (001, 002, 003...)
  const codigoPedido = String(pedidosCargados.length + 1).padStart(3, "0");

  // Crear el registro separado por pipes |
  const registro = [
    codigoPedido,
    cliente,
    prod.nombre,
    cantidad,
    precio.toFixed(2),
    subtotal.toFixed(2),
    descuento.toFixed(2),
    total.toFixed(2),
    metodoPago
  ].join("|");

  pedidosCargados.push(registro);

  // 6. Mostrar el pedido en pantalla
  const linea = "══════════════════════════════";
  ticket.textContent =
`${linea}
PEDIDO REGISTRADO
${linea}
Cliente: ${cliente}
Producto: ${prod.nombre}
Cantidad: ${cantidad}
Subtotal: $${subtotal.toFixed(2)}
Descuento: $${descuento.toFixed(2)}
TOTAL: $${total.toFixed(2)}
Pago: ${metodoPago}
${linea}`;

  seccionTicket.hidden = false;

  // Actualizar tabla y resumen con lo registrado en memoria
  actualizarTabla();
  actualizarResumen();

  // Limpiar formulario
  formPedido.reset();
});

// ============================================================
// 7. Descargar el archivo pedidos.txt
// ============================================================
btnDescargar.addEventListener("click", function () {
  if (pedidosCargados.length === 0) {
    alert("No hay pedidos para guardar todavía.");
    return;
  }

  const contenido = pedidosCargados.join("\n");
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "pedidos.txt";
  enlace.click();

  URL.revokeObjectURL(url);
});

// ============================================================
// 8. Cargar pedidos.txt (botón CARGAR)
// ============================================================
btnCargar.addEventListener("click", function () {
  // Pedir el archivo al usuario
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";

  input.addEventListener("change", function () {
    const archivo = input.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (event) {
      const texto = event.target.result.trim();

      // Separar cada línea (cada pedido es un registro)
      pedidosCargados = texto === "" ? [] : texto.split("\n");

      actualizarTabla();
      actualizarResumen();
    };
    lector.readAsText(archivo);
  });

  input.click();
});

// ============================================================
// 9. Actualizar la tabla de pedidos
// ============================================================
function actualizarTabla() {
  tablaBody.innerHTML = "";

  for (const linea of pedidosCargados) {
    const campos = linea.split("|");
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${campos[0]}</td>
      <td>${campos[1]}</td>
      <td>${campos[2]}</td>
      <td>${campos[3]}</td>
      <td>$${parseFloat(campos[7]).toFixed(2)}</td>`;

    tablaBody.appendChild(fila);
  }
}

// ============================================================
// 10. Resumen de ventas: total de pedidos y monto vendido
// ============================================================
function actualizarResumen() {
  let pedidos = 0;
  let ventas = 0;

  for (const linea of pedidosCargados) {
    const campos = linea.split("|");
    pedidos++;
    ventas += parseFloat(campos[7]); // columna Total
  }

  const linea = "══════════════════════════";
  resumen.textContent =
`${linea}
RESUMEN DE VENTAS
${linea}
Pedidos: ${pedidos}
Ventas: $${ventas.toFixed(2)}
${linea}`;

  seccionResumen.hidden = false;
}
