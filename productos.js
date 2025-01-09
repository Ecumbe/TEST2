// js/productos.js

const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const backButton = document.getElementById('back');

// Agregar un nuevo producto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productName = document.getElementById('product-name').value;
    const productPrice = parseFloat(document.getElementById('product-price').value);
    
    try {
        const newProduct = { name: productName, price: productPrice };
        // Enviar al main.js para agregar el producto
        await window.electronAPI.agregarProducto(newProduct);
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        loadProducts(); // Cargar productos después de agregar uno
    } catch (error) {
        console.error("Error al agregar el producto:", error);
    }
});

// Cargar productos desde la base de datos local
const loadProducts = async () => {
    try {
        const products = await window.electronAPI.cargarProductos();
        productList.innerHTML = ''; // Limpiar la lista antes de cargar
        products.forEach((product) => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <span>${product.name} - $${product.price.toFixed(2)}</span>
                <div>
                    <button onclick="editProduct(${product.id}, '${product.name}', ${product.price})">Editar</button>
                    <button onclick="deleteProduct(${product.id})">Borrar</button>
                </div>
            `;
            productList.appendChild(productItem);
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
};

// Borrar un producto
window.deleteProduct = async (id) => {
    try {
        await window.electronAPI.borrarProducto(id);
        loadProducts(); // Recargar productos después de borrar
    } catch (error) {
        console.error("Error al borrar el producto:", error);
    }
};

// Editar un producto
window.editProduct = async (id, currentName, currentPrice) => {
    const newName = prompt("Nuevo nombre del producto:", currentName);
    const newPrice = parseFloat(prompt("Nuevo precio del producto:", currentPrice));
    
    if (newName && !isNaN(newPrice)) {
        try {
            await window.electronAPI.editarProducto({ id, name: newName, price: newPrice });
            loadProducts(); // Recargar productos después de editar
        } catch (error) {
            console.error("Error al editar el producto:", error);
        }
    } else {
        alert("Por favor ingrese valores válidos.");
    }
};

// Cargar productos al iniciar la página
loadProducts();

// Manejar el botón de atrás
backButton.addEventListener('click', () => {
    window.location.href = "menu.html";
});
