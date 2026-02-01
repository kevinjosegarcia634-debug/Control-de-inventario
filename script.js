import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, increment, serverTimestamp, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAhus2VCCvIW8FF72bO7ALXTGb1HVxiqLA",
    authDomain: "inventario-40315.firebaseapp.com",
    projectId: "inventario-40315",
    storageBucket: "inventario-40315.firebasestorage.app",
    messagingSenderId: "258128152561",
    appId: "1:258128152561:web:190133e6299bff3c1f6650",
    measurementId: "G-M5ETN7G69M"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Habilitar persistencia fuera de línea (opcional pero recomendado para consistencia)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("La persistencia falló: múltiples pestañas abiertas.");
    } else if (err.code == 'unimplemented') {
        console.warn("La persistencia no es compatible con este navegador.");
    }
});

console.log("🔥 Firebase inicializado correctamente.");

const addProductForm = document.getElementById('addProductForm');
const movementForm = document.getElementById('movementForm');
const productSelect = document.getElementById('producto_id');
const inventoryTableBody = document.querySelector('#inventoryTable tbody');
const historyTableBody = document.querySelector('#historyTable tbody');
const toastContainer = document.getElementById('toast-container');
const clearHistoryBtn = document.getElementById('clear-history');

// Caché local de nombres de productos para el historial
let productNamesCache = {};

// Función para mostrar notificaciones personalizadas
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- FUNCIONES DE INTERFAZ PERSONALIZADAS ---

const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalInput = document.getElementById('modal-input');
const modalInputContainer = document.getElementById('modal-input-container');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

function showCustomModal({ title, message, showInput = false, defaultValue = '' }) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        if (showInput) {
            modalInputContainer.style.display = 'block';
            modalInput.value = defaultValue;
            setTimeout(() => modalInput.focus(), 100);
        } else {
            modalInputContainer.style.display = 'none';
        }

        customModal.classList.add('active');

        const cleanup = (value) => {
            customModal.classList.remove('active');
            modalConfirm.onclick = null;
            modalCancel.onclick = null;
            resolve(value);
        };

        modalConfirm.onclick = () => cleanup(showInput ? modalInput.value : true);
        modalCancel.onclick = () => cleanup(null);
    });
}

// --- FUNCIONES DE GESTIÓN (CRUD) ---

import { deleteDoc, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.editProduct = async (id, currentName) => {
    const newName = await showCustomModal({
        title: "Editar Producto",
        message: "Ingresa el nuevo nombre para este producto:",
        showInput: true,
        defaultValue: currentName
    });

    if (!newName || newName.trim() === "" || newName === currentName) return;

    try {
        await updateDoc(doc(db, "productos", id), {
            nombre: newName.trim()
        });
        showToast("Producto actualizado con éxito");
    } catch (error) {
        showToast("Error al editar: " + error.message, "error");
    }
};

window.deleteProduct = async (id, name) => {
    const confirmed = await showCustomModal({
        title: "Eliminar Producto",
        message: `¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`
    });

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "productos", id));
        showToast("Producto eliminado", "success");
    } catch (error) {
        console.error(error);
        showToast("Error al eliminar", "error");
    }
};

window.deleteMovement = async (id) => {
    try {
        await deleteDoc(doc(db, "movimientos", id));
        showToast("Registro eliminado");
    } catch (error) {
        showToast("Error al borrar registro", "error");
    }
};

clearHistoryBtn.addEventListener('click', async () => {
    const confirmed = await showCustomModal({
        title: "Limpiar Historial",
        message: "¿Estás seguro de que deseas borrar TODO el historial de movimientos? Esta acción es irreversible."
    });

    if (!confirmed) return;

    try {
        const querySnapshot = await getDocs(collection(db, "movimientos"));
        const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
        showToast("Historial vaciado correctamente");
    } catch (error) {
        showToast("Error al limpiar historial", "error");
    }
});

// --- LISTENERS EN TIEMPO REAL ---

// 1. Listener de Productos (con Alertas y Acciones)
const qProductos = query(collection(db, "productos"), orderBy("nombre"));

onSnapshot(qProductos, (snapshot) => {
    inventoryTableBody.innerHTML = '';
    productSelect.innerHTML = '<option value="" disabled selected>Selecciona</option>';
    productNamesCache = {}; // Reiniciar caché cada vez que cambian los productos

    if (snapshot.empty) {
        inventoryTableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No hay productos en la base de datos</td></tr>';
        return;
    }

    snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const id = docSnapshot.id;
        productNamesCache[id] = data.nombre;

        // Lógica de Alertas de Stock
        let badgeClass = 'stock-medium';
        const stock = data.cantidad_actual || 0;

        if (stock >= 20) badgeClass = 'stock-high';
        else if (stock < 20 && stock >= 10) badgeClass = 'stock-low';
        else if (stock < 10) {
            badgeClass = 'stock-critical';
            // Alerta visual discreta en consola para depuración, el Toast se maneja en el registro
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${data.nombre}</strong></td>
            <td><span class="stock-badge ${badgeClass}">${stock} unidades</span></td>
            <td>
                <button class="btn-action btn-edit" title="Editar" onclick="editProduct('${id}', '${data.nombre}')">✏️</button>
                <button class="btn-action btn-delete" title="Eliminar" onclick="deleteProduct('${id}', '${data.nombre}')">🗑️</button>
            </td>
        `;
        inventoryTableBody.appendChild(row);

        const option = document.createElement('option');
        option.value = id;
        option.textContent = data.nombre;
        productSelect.appendChild(option);
    });
}, (error) => {
    console.error("❌ Error en Listener de Productos:", error);
});

// 2. Listener de Historial (movimientos recientes)
const qMovimientos = query(
    collection(db, "movimientos"),
    orderBy("fecha", "desc"),
    limit(10)
);

onSnapshot(qMovimientos, (snapshot) => {
    historyTableBody.innerHTML = '';

    if (snapshot.empty) {
        historyTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay actividad reciente</td></tr>';
        return;
    }

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const productName = productNamesCache[data.producto_id] || "Producto Desconocido";
        const date = data.fecha ? data.fecha.toDate().toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        }) : '...';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><small>${date}</small></td>
            <td>${productName}</td>
            <td><span class="type-badge ${data.tipo === 'ENTRADA' ? 'type-entrada' : 'type-salida'}">${data.tipo}</span></td>
            <td><strong>${data.cantidad}</strong></td>
            <td>
                <button class="btn-action btn-delete" style="padding: 0.2rem 0.4rem;" onclick="deleteMovement('${id}')">🗑️</button>
            </td>
        `;
        historyTableBody.appendChild(row);
    });
});

// --- EVENTOS DE ENVÍO DE FORMULARIOS ---

// Agregar Producto
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre_producto').value.trim();
    const cantidad = parseInt(document.getElementById('cantidad_inicial').value) || 0;

    if (!nombre) return showToast("El nombre es obligatorio", 'warning');

    try {
        await addDoc(collection(db, "productos"), {
            nombre: nombre,
            cantidad_actual: cantidad,
            fecha_creacion: serverTimestamp()
        });
        showToast('✅ Producto creado correctamente');
        addProductForm.reset();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
});

// Registrar Movimiento
movementForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productoId = document.getElementById('producto_id').value;
    const tipo = document.getElementById('tipo').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);

    if (!productoId) return showToast('Selecciona un producto', 'warning');
    if (!cantidad || cantidad <= 0) return showToast('Ingresa una cantidad válida', 'warning');

    const factor = tipo === 'ENTRADA' ? 1 : -1;

    try {
        const productRef = doc(db, "productos", productoId);

        // 1. Guardar log del movimiento
        await addDoc(collection(db, "movimientos"), {
            producto_id: productoId,
            tipo: tipo,
            cantidad: cantidad,
            fecha: serverTimestamp()
        });

        // 2. Actualizar stock en el producto
        await updateDoc(productRef, {
            cantidad_actual: increment(cantidad * factor)
        });

        showToast(`${tipo} registrada con éxito`);

        // Verificar si el stock quedó crítico después del movimiento
        // (El listener se encargará de la parte visual, pero podemos avisar proactivamente)
        movementForm.reset();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
});



