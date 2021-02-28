require('dotenv').config();
const { writeFile } = require('fs');

const host = process.env.HOST || 'localhost';

const envs = ['tso', 'dso', 'bsp', 'producer'];
const data = {
  tso : {
    port: 5000,
    org: 'TSO'
  },
  dso : {
    port: 5001,
    org: 'DSO'
  },
  bsp : {
    port: 5002,
    org: 'AA'
  },
  producer : {
    port: 5003,
    org: 'PRODUCER'
  },
}

envs.forEach((env) => {
  const { port, org } = data[env];
  const targetPath = `./src/environments/environment.${env}.ts`;

  const environmentFileContent = `
  export const environment = {
    production: false,
    apiUrl: 'http://${host}:${port}/',
    wsUrl: 'http://${host}:${port}/',
    org: '${org}'
  };
  `;

  writeFile(targetPath, environmentFileContent, function (err) {
    if (err) {
      console.error(err);
    }
    console.log(`Wrote variables to ${targetPath}`);
  });
});
