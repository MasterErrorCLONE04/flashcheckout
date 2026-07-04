const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function syncTunnel() {
  try {
    console.log('🔍 Leyendo logs del contenedor del túnel...');
    const logs = execSync('docker logs flashcheckout-tunnel', { encoding: 'utf8' });
    
    // Buscar URLs del túnel
    const matches = [...logs.matchAll(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g)];
    if (matches.length === 0) {
      console.log('❌ No se encontró ninguna URL de trycloudflare activa en los logs.');
      return;
    }
    
    const latestUrl = matches[matches.length - 1][0];
    console.log(`🔗 Última URL activa del túnel encontrada: ${latestUrl}`);
    
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ No se encontró el archivo .env en la raíz del proyecto.');
      return;
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const urlRegex = /NEXT_PUBLIC_APP_URL=https:\/\/[a-z0-9-]+\.trycloudflare\.com/;
    
    if (envContent.match(urlRegex)) {
      const currentUrlMatch = envContent.match(urlRegex)[0];
      const currentUrl = currentUrlMatch.split('=')[1];
      
      if (currentUrl === latestUrl) {
        console.log('✅ El archivo .env ya está sincronizado con la última URL del túnel. No se requieren cambios.');
        return;
      }
      
      // Reemplazar URL
      envContent = envContent.replace(urlRegex, `NEXT_PUBLIC_APP_URL=${latestUrl}`);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log(`📝 Archivo .env actualizado con éxito: ${latestUrl}`);
      
      // Reiniciar contenedor web
      console.log('🔄 Reiniciando el contenedor flashcheckout-web...');
      execSync('docker restart flashcheckout-web');
      console.log('✨ Servidor reiniciado con la nueva configuración.');
    } else {
      console.log('⚠️ No se encontró la variable NEXT_PUBLIC_APP_URL configurada con un dominio de trycloudflare en tu .env.');
    }
  } catch (error) {
    console.error('❌ Error al sincronizar el túnel:', error.message);
  }
}

syncTunnel();
