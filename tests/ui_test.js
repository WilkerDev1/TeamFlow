const { Builder, By, Key, until } = require('selenium-webdriver');
// Importamos las opciones de Firefox en lugar de Chrome
const firefox = require('selenium-webdriver/firefox');

async function runTest() {
    // Configuración para Firefox
    let options = new firefox.Options();
    
    // Opcional: Si quisieras ejecutarlo sin ver la ventana (headless), descomenta la siguiente línea:
    // options.addArguments('--headless'); 

    // 1. Iniciar el navegador (Firefox)
    // Selenium detectará automáticamente el 'geckodriver' que instalaste con pacman
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    try {
        console.log("--- 🦊 Iniciando Prueba Automatizada con Firefox ---");

        // 2. Navegar a la aplicación
        await driver.get('http://localhost:3000');
        
        // 3. Verificar título
        let title = await driver.getTitle();
        console.log(`Página cargada: ${title}`);

        if(title.includes("Team Flow")) {
            console.log("✅ Título verificado: OK");
        } else {
            console.log("❌ Error en título: " + title);
        }

        // 4. Crear Tarea
        // Localizamos elementos
        let inputTitulo = await driver.findElement(By.name('title'));
        let inputDesc = await driver.findElement(By.name('description'));
        let btnCrear = await driver.findElement(By.css('button[type="submit"]'));

        // Interactuamos
        await inputTitulo.sendKeys('Tarea Firefox Automática');
        await inputDesc.sendKeys('Probando con el zorro de fuego en Arch Linux 🔥');
        
        // Hacemos click
        await btnCrear.click();

        // 5. Verificación visual
        await driver.sleep(3000); 

        console.log("✅ Formulario enviado correctamente");

    } catch (error) {
        console.error("❌ Error durante la prueba:", error);
    } finally {
        // 6. Cerrar navegador
        await driver.quit();
    }
}

runTest();