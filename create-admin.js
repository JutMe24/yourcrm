const bcrypt = require('bcryptjs');

async function createAdminUser() {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Mot de passe hashé pour admin:');
    console.log(hashedPassword);
    console.log('\nUtilisateur: admin');
    console.log('Mot de passe: admin123');
    console.log('Hash:', hashedPassword);
}

createAdminUser().catch(console.error);
