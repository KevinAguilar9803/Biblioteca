const { pool } = require('../db');

exports.obtenerEstudiantes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes WHERE estado=TRUE');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerEstudiante = async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query('SELECT * FROM estudiantes WHERE id = $1 AND estado=TRUE', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerEstudiantesSancionados = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, cedula, nombre, apellido FROM estudiantes WHERE sancionado = TRUE`
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.agregarEstudiante = async (req, res) => {
    const { cedula, nombre, apellido, sexo, fecha_nacimiento } = req.body;
    try {
      await pool.query(
        `INSERT INTO estudiantes (cedula, nombre, apellido, sexo, fecha_nacimiento) 
         VALUES ($1, $2, $3, $4, $5)`,
        [cedula, nombre, apellido, sexo, fecha_nacimiento]
      );
      res.status(201).json({ mensaje: 'Estudiante agregado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.actualizarEstudiante = async (req, res) => {
    const { id } = req.params;
    const { cedula, nombre, apellido, sexo, fecha_nacimiento, sancionado } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE estudiantes 
         SET cedula = $1, 
             nombre = $2, 
             apellido = $3, 
             sexo = $4, 
             fecha_nacimiento = $5, 
             sancionado = $6
         WHERE id = $7`,
        [cedula, nombre, apellido, sexo, fecha_nacimiento, sancionado, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
      }
  
      res.json({ mensaje: 'Estudiante actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  exports.eliminarEstudiante = async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query(`UPDATE estudiantes SET estado=FALSE WHERE id = $1`, [id]);
      res.json({ mensaje: 'Estudiante eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  