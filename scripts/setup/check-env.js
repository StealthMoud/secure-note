const fs = require('fs');
const path = require('path');

const checkEnv = () => {
    const envPath = path.resolve(__dirname, '../../.env');
    if (!fs.existsSync(envPath)) {
        console.error('ERROR: .env file not found at project root');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
        'RSA_PRIVATE_KEY',
        'RSA_PUBLIC_KEY',
        'EMAIL_USER',
        'EMAIL_PASS'
    ];

    let missing = [];
    required.forEach(key => {
        if (!envContent.includes(`${key}=`)) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        console.warn('WARNING: The following required environment variables are missing from your .env:');
        missing.forEach(m => console.log(` - ${m}`));
    } else {
        console.log('SUCCESS: All required environment variables are present in .env');
    }
};

checkEnv();
