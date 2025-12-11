const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

async function runTest() {
    let options = new firefox.Options();
    // options.addArguments('--headless'); // Descomentar si no quieres ver el navegador
    let driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

    try {
        console.log("--- 🦊 Iniciando Prueba E2E Completa (Team Flow) ---");

        // 1. Registro / Login
        // Usamos un timestamp para que el email siempre sea único y no falle el test
        const uniqueId = Date.now();
        const userEmail = `test${uniqueId}@example.com`;
        
        await driver.get('http://localhost:3000/register');
        console.log("1. Registro de usuario nuevo...");
        
        await driver.findElement(By.name('name')).sendKeys('Test User');
        await driver.findElement(By.name('email')).sendKeys(userEmail);
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();
        
        // 2. Login
        console.log("2. Iniciando sesión...");
        await driver.findElement(By.name('email')).sendKeys(userEmail);
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // 3. Crear Proyecto
        console.log("3. Creando Proyecto...");
        // Esperamos a que aparezca el dashboard
        await driver.wait(until.elementLocated(By.name('title')), 5000); 
        
        await driver.findElement(By.name('title')).sendKeys(`Proyecto Selenium ${uniqueId}`);
        await driver.findElement(By.name('description')).sendKeys('Proyecto de prueba automatizada');
        // Usamos selector CSS específico para el botón dentro del card de crear
        await driver.findElement(By.css('form[action="/projects/add"] button')).click();

        // 4. Entrar al Tablero
        console.log("4. Entrando al Tablero...");
        // Esperamos a que aparezca el botón del nuevo proyecto y hacemos click
        let projectBtn = await driver.wait(until.elementLocated(By.xpath(`//h5[contains(text(), 'Proyecto Selenium ${uniqueId}')]/../../div/a`)), 5000);
        await projectBtn.click();

        // 5. Crear Tarea (AQUÍ ESTABA EL ERROR)
        console.log("5. Abriendo modal de tarea...");
        
        // Localizamos el botón que abre el modal
        let openModalBtn = await driver.wait(until.elementLocated(By.css('[data-bs-target="#addTaskModal"]')), 5000);
        await openModalBtn.click();
        
        // --- LA SOLUCIÓN: ESPERAR VISIBILIDAD ---
        console.log("   > Esperando animación del modal...");
        
        // 1. Localizamos el input
        let titleInput = await driver.findElement(By.css('#addTaskModal input[name="title"]'));
        
        // 2. Le decimos al driver: "Espera hasta 5 segundos a que este input sea VISIBLE"
        await driver.wait(until.elementIsVisible(titleInput), 5000);
        
        console.log("   > Modal visible, escribiendo...");
        await titleInput.sendKeys('Tarea Auto');

        // Llenar descripción (ahora que sabemos que el modal está visible)
        await driver.findElement(By.css('#addTaskModal textarea[name="description"]')).sendKeys('Descripción obligatoria para el test');
        
        // Click en guardar
        await driver.findElement(By.css('#addTaskModal button[type="submit"]')).click();

        // 6. Verificar
        console.log("6. Verificando creación...");
        await driver.sleep(2000); // Espera visual para ver el resultado
        
        let pageSource = await driver.getPageSource();
        if (pageSource.includes("Tarea Auto")) {
            console.log("✅ Tarea creada y verificada en el tablero");
        } else {
            console.error("❌ La tarea no apareció en el tablero");
        }

        console.log("--- 🏁 Prueba Finalizada con Éxito ---");

    } catch (error) {
        console.error("❌ Error Crítico:", error);
    } finally {
        await driver.quit();
    }
}

runTest();