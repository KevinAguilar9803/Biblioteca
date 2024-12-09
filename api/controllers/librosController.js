const { pool } = require('../db');

exports.obtenerLibros = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM libros WHERE estado=TRUE');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerLibro = async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM libros WHERE id = $1 AND estado=TRUE', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.agregarLibro = async (req, res) => {
  const { codigo, tipo, categoria, editorial, nombre, autor, anio_publicacion, stock } = req.body;
  try {
   await pool.query(
      `INSERT INTO libros (codigo, tipo, categoria, editorial, nombre, autor, anio_publicacion, stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [codigo, tipo, categoria, editorial, nombre, autor, anio_publicacion, stock]
    );
    res.status(201).json({ mensaje: 'Libro agregado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.actualizarLibro = async (req, res) => {
  const { id } = req.params;
  const { codigo, tipo, categoria, editorial, nombre, autor, anio_publicacion, stock} = req.body;
  try {
    await pool.query(
      `UPDATE libros 
       SET codigo = $1, tipo = $2, categoria = $3, editorial = $4, nombre = $5, anio_publicacion = $6, stock = $7
       WHERE id = $8`,
      [codigo, tipo, categoria, editorial, nombre, anio_publicacion, stock, id]
    );
    res.json({ mensaje: 'Libro actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarLibro = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE libros SET estado=FALSE WHERE id = $1`,
      [id]
    );
    res.json({ mensaje: 'Libro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
