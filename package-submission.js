// package-submission.js
// Empaqueta los archivos del proyecto en un archivo .zip para la entrega en la plataforma virtual

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const zipName = 'T1S4_Gestion_Incidentes_Fer_Bermello.zip';
const zipPath = path.join(__dirname, zipName);

// Eliminar zip previo si existe
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log(`🗑️ Eliminado archivo previo: ${zipName}`);
}

console.log('📦 Generando paquete de entrega comprimido (.zip)...');

// Usar PowerShell Compress-Archive incluyendo código, docs, evidencias y excluyendo node_modules
const psCommand = `$files = (Get-ChildItem -Path . -Exclude 'node_modules', '${zipName}', '.git' | Select-Object -ExpandProperty FullName); Compress-Archive -Path $files -DestinationPath '${zipName}' -Force`;


try {
  execSync(`powershell -NoProfile -Command "${psCommand.replace(/\n/g, ' ')}"`, { stdio: 'inherit' });
  const stats = fs.statSync(zipPath);
  const sizeKb = (stats.size / 1024).toFixed(2);
  console.log(`\n✅ ¡Paquete creado con éxito!`);
  console.log(`📁 Archivo: ${zipPath}`);
  console.log(`⚖️ Tamaño: ${sizeKb} KB`);
  console.log(`🎯 Listo para subir a la plataforma virtual de entrega.`);
} catch (error) {
  console.error('❌ Error al comprimir:', error.message);
}
