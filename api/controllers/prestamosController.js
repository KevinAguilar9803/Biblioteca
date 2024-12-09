const { pool } = require('../db');

exports.obtenerPrestamos = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
        p.id,
        e.cedula AS cedula_estudiante,
        e.nombre AS nombre_estudiante,
        e.apellido AS apellido_estudiante,
        p.fecha_prestamo,
        p.fecha_entrega,
        p.devuelto,
        p.fecha_devolucion,
        json_agg(json_build_object('id', pl.libro_id, 'nombre', l.nombre, 'cantidad', pl.cantidad )) AS libros
      FROM prestamos p
      JOIN estudiantes e ON p.estudiante_id = e.id
      JOIN prestamos_libros pl ON p.id = pl.prestamo_id
      JOIN libros l ON pl.libro_id = l.id
      GROUP BY p.id, e.cedula, e.nombre, e.apellido, p.fecha_prestamo, p.fecha_entrega, p.fecha_devolucion
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }; 


exports.agregarPrestamo = async (req, res) => {
    const { estudiante_id, libros, fecha_entrega } = req.body;
    const client = await pool.connect();
    const hoy = new Date();
  
    try {
      const estudiante = await client.query(
        `SELECT sancionado, sancion_termina FROM estudiantes WHERE id = $1`,
        [estudiante_id]
      );
      if (estudiante.rows[0].sancionado) {
        if(new Date(estudiante.rows[0].sancion_termina) < hoy){
            await client.query(
                `UPDATE estudiantes SET sancionado = FALSE, sancion_termina = NULL WHERE id = $1`,
                [estudiante_id]
              );
        }else{
            throw new Error('El estudiante está sancionado y no puede realizar préstamos.');
        }
      }
      await client.query('BEGIN');

    const prestamosPendientes = await client.query(
        `SELECT id, fecha_entrega 
         FROM prestamos 
         WHERE estudiante_id = $1 AND devuelto = FALSE`,
        [estudiante_id]
      );
  
      if (prestamosPendientes.rowCount > 0) {
        const prestamo = prestamosPendientes.rows[0];
  
        if (new Date(prestamo.fecha_entrega) < hoy) {
            const sancion_termina = new Date();
            sancion_termina.setDate(sancion_termina.getDate() + 15);
            await client.query(
              `UPDATE estudiantes 
               SET sancionado = TRUE, sancion_termina = $1 
               WHERE id = $2`,
              [sancion_termina, estudiante_id]
          );
          await client.query('COMMIT');
          throw new Error(
            'El estudiante tiene un préstamo pendiente vencido y ha sido sancionado por 15 dias.'
          );
        }
  
        /*throw new Error(
          'El estudiante tiene un préstamo pendiente sin devolver.'
        );*/
      }
  
      const prestamoResult = await client.query(
        `INSERT INTO prestamos (estudiante_id, fecha_prestamo, fecha_entrega, devuelto) 
         VALUES ($1, CURRENT_DATE, $2, FALSE) RETURNING id`,
        [estudiante_id, fecha_entrega]
      );
      const prestamo_id = prestamoResult.rows[0].id;
  
      for (const { libro_id, cantidad } of libros) {
        const libro = await client.query(
          `SELECT stock, nombre FROM libros WHERE id = $1`,
          [libro_id]
        );
        if (libro.rows[0].stock < cantidad) {
          throw new Error(`No hay suficiente stock para el libro ${libro.rows[0].nombre}.`);
        }
  
        await client.query(
          `INSERT INTO prestamos_libros (prestamo_id, libro_id, cantidad) 
           VALUES ($1, $2, $3)`,
          [prestamo_id, libro_id, cantidad]
        );
  
        await client.query(
          `UPDATE libros SET stock = stock - $1 WHERE id = $2`,
          [cantidad, libro_id]
        );
      }
  
      await client.query('COMMIT');
      res.status(201).json({ mensaje: 'Préstamo registrado exitosamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }; 
  

  exports.marcarComoDevuelto = async (req, res) => {
    const { id } = req.params;
    const { fecha_devolucion } = req.body;
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // Verificar que el préstamo existe y no ha sido devuelto
      const prestamo = await client.query(
        `SELECT estudiante_id, fecha_entrega, devuelto 
         FROM prestamos 
         WHERE id = $1`,
        [id]
      );
  
      if (prestamo.rowCount === 0) {
        throw new Error('Préstamo no encontrado.');
      }
  
      const { estudiante_id, fecha_entrega, devuelto } = prestamo.rows[0];
  
      if (devuelto) {
        throw new Error('Este préstamo ya ha sido marcado como devuelto.');
      }
  
      // Actualizar el estado del préstamo a devuelto
      await client.query(
        `UPDATE prestamos 
         SET devuelto = TRUE, fecha_devolucion = $1 
         WHERE id = $2`,
        [fecha_devolucion, id]
      );
  
      // Restaurar el stock de los libros asociados al préstamo
      const libros = await client.query(
        `SELECT libro_id, cantidad 
         FROM prestamos_libros 
         WHERE prestamo_id = $1`,
        [id]
      );
  
      for (const { libro_id, cantidad } of libros.rows) {
        await client.query(
          `UPDATE libros 
           SET stock = stock + $1 
           WHERE id = $2`,
          [cantidad, libro_id]
        );
      }
  
      // Verificar si la devolución está fuera de tiempo
    if (new Date(fecha_devolucion) > new Date(fecha_entrega)) {
        const sancion_termina = new Date();
        sancion_termina.setDate(sancion_termina.getDate() + 15);
  
        await client.query(
          `UPDATE estudiantes 
           SET sancionado = TRUE, sancion_termina = $1 
           WHERE id = $2`,
          [sancion_termina, estudiante_id]
        );
        await client.query('COMMIT');
        return res.json({
            mensaje: 'Préstamo devuelto, pero el estudiante ha sido sancionado 15 dias por retraso en la entrega',
          });
      }
  
      await client.query('COMMIT');
      res.json({ mensaje: 'Préstamo marcado como devuelto exitosamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: error.message });
    } finally {
      client.release();
    }
  };
  


  
  