import app from "./index.js";
import { startPasswordResetCleanupJob } from "./src/services/passwordResetCleanup.js";
import { IS_TEST } from "./src/utils/env.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

if (!IS_TEST) {
  startPasswordResetCleanupJob();
}

/*-- NOTA : Para correr test es "npm test"--*/
