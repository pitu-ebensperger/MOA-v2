import app from "./index.js";
import { startPasswordResetCleanupJob } from "./src/jobs/passwordResetCleanup.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

if ((process.env.NODE_ENV || 'development') !== 'test') {
  startPasswordResetCleanupJob();
}

/*-- NOTA : Para correr test es "npm test"--*/
