const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const rimraf = require('rimraf'); // npm package to delete files/folders

const distPath = path.join(__dirname, 'dist');
const sourceEnvPath = path.join(__dirname, '.env');
const destEnvPath = path.join(distPath, '.env');

// Function to clean the dist directory
function cleanDist() {
    if (fs.existsSync(distPath)) {
        rimraf.sync(distPath);
        console.log('dist directory cleaned successfully.');
    }
    fs.mkdirSync(distPath);
    console.log('dist directory created.');
}

// Function to run the webpack build
function runWebpackBuild() {
    console.log('Running webpack build...');
    execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });
    console.log('Webpack build completed successfully.');
}

// Main build function
function build() {
    cleanDist(); // Clean and recreate the dist directory first
    runWebpackBuild(); // Build the JavaScript files into the clean dist directory
    fs.copyFileSync(sourceEnvPath, destEnvPath); // Copy .env file to dist
    console.log('.env file copied successfully to dist directory.');

    // Move to the dist directory and create a zip including the .env file
    process.chdir(distPath);
    execSync('zip -r output.zip ./* .env');
    console.log('Zip archive created successfully, including all files.');
}

build(); // Run the build process
