// js/facturar.js

const productDropdown = document.getElementById('product-dropdown');
const selectedProductsList = document.getElementById('selected-products-list');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const accountSelection = document.getElementById('account-selection');
const bankSelection = document.getElementById('bank-selection');
const account = document.getElementById('account');
const bank = document.getElementById('bank');
const saveInvoiceButton = document.getElementById('save-invoice');
const facturaDate = document.getElementById('factura-date');
const trabajadoraDropdown = document.getElementById('trabajadora');
const reviewInvoicesButton = document.getElementById('review-invoices');
const logoutButton = document.getElementById('logout');
const backButton = document.getElementById('back');

let selectedProducts = [];
let total = 0;

// Cargar productos desde la base de datos local
async function loadProducts() {
    try {
        const products = await window.electronAPI.cargarProductos();
        products.forEach((product) => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
            option.dataset.price = product.price;
            productDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// Cargar trabajadoras desde la base de datos local
async function loadTrabajadoras() {
    try {
        const trabajadoras = await window.electronAPI.cargarTrabajadoras();
        trabajadoras.forEach((trabajadora) => {
            const option = document.createElement('option');
            option.value = trabajadora.name;
            option.textContent = `${trabajadora.name} - ${trabajadora.percentage}%`;
            trabajadoraDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar las trabajadoras:", error);
    }
}

// Actualizar el total
function updateTotal() {
    total = selectedProducts.reduce((sum, product) => sum + product.price, 0);
    totalAmount.textContent = total.toFixed(2);
}

// Añadir producto a la lista seleccionada
productDropdown.addEventListener('change', () => {
    const selectedOption = productDropdown.options[productDropdown.selectedIndex];
    const productName = selectedOption.value;
    const productPrice = parseFloat(selectedOption.dataset.price);

    if (!productName) return;

    const product = { name: productName, price: productPrice };

    selectedProducts.push(product);
    updateTotal();

    const productItem = document.createElement('div');
    productItem.classList.add('product-item');
    productItem.textContent = `${productName} - $${productPrice.toFixed(2)}`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Eliminar';
    removeButton.onclick = () => {
        selectedProducts = selectedProducts.filter(p => p !== product);
        updateTotal();
        selectedProductsList.removeChild(productItem);
    };

    productItem.appendChild(removeButton);
    selectedProductsList.appendChild(productItem);
    productDropdown.value = ''; // Reset dropdown after selection
});

// Mostrar u ocultar opciones de cuenta y banco según el método de pago
paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'transferencia') {
        accountSelection.style.display = 'block';
        bankSelection.style.display = 'block';
    } else {
        accountSelection.style.display = 'none';
        bankSelection.style.display = 'none';
    }
});

// Confirmar y guardar factura en la base de datos local
saveInvoiceButton.addEventListener('click', async () => {
    if (!facturaDate.value || selectedProducts.length === 0) {
        alert("Por favor, complete la fecha y seleccione al menos un producto.");
        return;
    }

    const confirmSave = confirm("¿Está seguro de que desea guardar la factura?");
    if (!confirmSave) return;

    const t_pago = paymentMethod.value;
    const cuenta = t_pago === 'transferencia' ? account.value : '';
    const banco = t_pago === 'transferencia' ? bank.value : '';
    const trabajadora = trabajadoraDropdown.value;
    const productos = selectedProducts.map(p => p.name).join(', ');

    try {
        await window.electronAPI.guardarFactura({
            fecha: facturaDate.value,
            productos,
            t_pago,
            cuenta,
            banco,
            trabajadora,
            valor: total
        });
        alert("Factura guardada exitosamente.");
        selectedProducts = [];
        total = 0;
        totalAmount.textContent = '0.00';
        selectedProductsList.innerHTML = '';
    } catch (error) {
        console.error("Error al guardar la factura:", error);
    }
});

// Cerrar sesión
logoutButton.addEventListener('click', () => {
    const confirmLogout = confirm("¿Está seguro de que desea cerrar sesión?");
    if (confirmLogout) {
        window.location.href = "index.html"; // Redirigir a la página de inicio
    }
});

// Redirigir a la página de revisión de facturas
reviewInvoicesButton.addEventListener('click', () => {
    window.location.href = "revisar.html"; // Redirigir a la página de revisión de facturas
});

// Regresar al menú
backButton.addEventListener('click', () => {
    window.location.href = "menu.html"; // Redirigir al menú principal
});

// Cargar productos y trabajadoras al iniciar
loadProducts();
loadTrabajadoras();
