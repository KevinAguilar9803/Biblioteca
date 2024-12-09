const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const librosRoutes = require('./routes/librosRoutes');
const estudiantesRoutes = require('./routes/estudiantesRoutes');
const prestamosRoutes = require('./routes/prestamosRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/libros', librosRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/prestamos', prestamosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
