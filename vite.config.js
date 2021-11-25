import { defineConfig } from 'vite'
import { readFileSync } from 'fs'

export default defineConfig({
    server: {
        host: true,
        port: 1673,
        https: {
            key: readFileSync("C:/Certs/ssc/LocalServer_Cert1/create-cert-key.pem"),
            cert: readFileSync("C:/Certs/ssc/LocalServer_Cert1/create-cert.pem")
        },
    }
});