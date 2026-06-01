const { request } = require("express");
const db = require("../bd");

const createLenderConditions = async (req, res) => {
  const {
    request_id,
    lender_id,
    approved_amount,
    interest,
    interest_type,
    rate_revision_period,
    amortization_system,
    payment_frequency,
    fees_count,
    estimated_fee_amount,
    closing_costs,
    late_fee_percentage,
    message,
    expiration_date,
    notification_id,
    notification_client_id,
    pay_days,
  } = req.body;
  let lenderCondition = "";
  try {
    if (
      !request_id ||
      !lender_id ||
      !approved_amount ||
      !interest ||
      !interest_type ||
      !rate_revision_period ||
      !amortization_system ||
      !payment_frequency ||
      !fees_count ||
      !estimated_fee_amount ||
      !closing_costs ||
      !late_fee_percentage ||
      !message ||
      !expiration_date ||
      !notification_id ||
      !notification_client_id ||
      !pay_days
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    db.query(
      "INSERT INTO lender_conditions (request_id, lender_id, approved_amount, interest, interest_type, rate_revision_period, amortization_system, payment_frequency,fees_count, estimated_fee_amount, closing_costs, late_fee_percentage, message, pay_days, expiration_date, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        request_id,
        lender_id,
        approved_amount,
        interest,
        interest_type,
        rate_revision_period,
        amortization_system,
        payment_frequency,
        fees_count,
        estimated_fee_amount,
        closing_costs,
        late_fee_percentage,
        message,
        pay_days,
        expiration_date,
        "pending",
        new Date(),
        new Date(),
      ],
      (err, result) => {
        if (err) {
          console.error("Error al crear condiciones del prestamista:", err);
          return res
            .status(500)
            .json({ message: "Error al crear condiciones del prestamista" });
        }
        lenderCondition = result.insertId;
        db.query(
          "UPDATE notifications SET state = 3 WHERE id = ?",
          [notification_id],
          (updateErr) => {
            if (updateErr) {
              console.error(
                "Error al actualizar el estado de notifications:",
                updateErr,
              );
              return res.status(500).json({
                message: "Error al actualizar el estado de la notificación",
              });
            }

            db.query(
              "INSERT INTO loans (lender_conditions_id, state, created_at, updated_at) VALUES (?, ?, ?, ?)",
              [
                lenderCondition,
                1,
                new Date(),
                new Date(),
              ],
              (responseErr) => {
                if (responseErr) {
                  console.error("Error al crear lender_response:", responseErr);
                  return res.status(500).json({
                    message: "Error al crear la respuesta del prestamista",
                  });
                }
              },
            );
            res.status(201).json({
              message: "Condiciones del prestamista creadas exitosamente",
              id: result.insertId,
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Error en crear condiciones del prestamista:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getClientRequest = async (req, res) => {
  const { request_id } = req.query;

  try {
    if (!request_id) {
      return res
        .status(400)
        .json({ message: "El ID de la solicitud del cliente es requerido" });
    }

    db.query(
      "SELECT * FROM client_request WHERE id = ?",
      [request_id],
      (err, result) => {
        if (err) {
          console.error("Error al consultar la solicitud del cliente:", err);
          return res
            .status(500)
            .json({ message: "Error al obtener la solicitud del cliente" });
        }

        if (result.length === 0) {
          return res
            .status(404)
            .json({ message: "Solicitud del cliente no encontrada" });
        }

        res.status(200).json(result[0]);
      },
    );
  } catch (error) {
    console.error("Error en obtener la solicitud del cliente:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const showLenderConditions = async (req, res) => {
  const { lender_conditions_id } = req.query;

  try {
    if (!lender_conditions_id) {
      return res.status(400).json({
        message: "El ID de las condiciones del prestamista es requerido",
      });
    }

    const sql = `
    SELECT 
      lc.*, 
      l.name AS lender_name, 
      l.profile_image AS profile_image,
      l.email AS lender_email,
      l.address AS lender_address,
      l.phone AS lender_phone,
      l.second_phone AS lender_second_phone,
      l.representante AS lender_representative,
      l.nacionalidad AS lender_nacionalidad,
      l.estado_civil AS lender_estado_civil,
      l.sexo AS lender_sexo,
      l.type_documente AS lender_type_documente,
      l.documento AS lender_documento
    FROM lender_conditions lc
      LEFT JOIN users u ON lc.lender_id = u.id
      LEFT JOIN lender l ON u.information_id = l.id
    WHERE lc.id = ?;

    `;

    db.query(sql, [lender_conditions_id], (err, result) => {
      if (err) {
        console.error("Error al consultar condiciones del prestamista:", err);
        return res
          .status(500)
          .json({ message: "Error al obtener condiciones del prestamista" });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "Condiciones del prestamista no encontradas" });
      }

      res.status(200).json(result[0]);
    });
  } catch (error) {
    console.error("Error en obtener condiciones del prestamista:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const registerLoan = async (req, res) => {
  try {
    const {
      lender_conditions_id,
      notification_id,
      client_request_id,
      lender_id,
      client_id,
    } = req.body;

    if (!lender_conditions_id) {
      return res.status(400).json({ message: "El ID de las condiciones es requerido" });
    }

    db.query(
      "SELECT * FROM loans WHERE lender_conditions_id = ? LIMIT 1",
      [lender_conditions_id],
      (selectErr, loanResults) => {
        if (selectErr) {
          console.error("Error al consultar loan:", selectErr);
          return res.status(500).json({ message: "Error al consultar el préstamo" });
        }

        if (loanResults.length === 0) {
          return res.status(404).json({ message: "Préstamo no encontrado para estas condiciones" });
        }

        const now = new Date();
        db.query(
          "UPDATE loans SET state = 3, updated_at = ? WHERE lender_conditions_id = ?",
          [now, lender_conditions_id],
          (updateErr) => {
            if (updateErr) {
              console.error("Error al actualizar loan:", updateErr);
              return res.status(500).json({ message: "Error al registrar el préstamo" });
            }

            if (notification_id) {
              db.query(
                "UPDATE notifications SET state = 3 WHERE id = ?",
                [notification_id],
                (notifErr) => {
                  if (notifErr) {
                    console.error("Error al actualizar notification:", notifErr);
                  }
                },
              );
            }

            return res.status(200).json({ message: "Préstamo registrado y activo" });
          },
        );
      },
    );
  } catch (error) {
    console.error("Error en registrar préstamo:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const publications = async (req, res) => {
  try {
    const { user_id, amount, reason } = req.body;

    if (!user_id || !amount || !reason) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Insertar publicación
    db.query(
      "INSERT INTO client_request (user_id, amount, reason, created_at, state) VALUES (?, ?, ?, ?, ?)",
      [user_id, amount, reason, new Date(), 1],
      (err, result) => {
        if (err) {
          console.error("Error al crear publicación:", err);
          return res
            .status(500)
            .json({ message: "Error al crear publicación" });
        }

        res.status(201).json({
          message: "Publicación creada exitosamente",
          id_publicacion: result.insertId,
        });
      },
    );
  } catch (error) {
    console.error("Error en publicación:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getLenderInfo = async (req, res) => {
  const { lender_id } = req.query;

  try {
    if (!lender_id) {
      return res
        .status(400)
        .json({ message: "El ID del prestamista es requerido" });
    }
    db.query(
      "SELECT l.* FROM lender l JOIN users u ON u.information_id = l.id WHERE u.id = ?",
      [lender_id],
      (err, result) => {
        if (err) {
          console.error("Error al consultar lender:", err);
          return res
            .status(500)
            .json({ message: "Error al obtener información del prestamista" });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Prestamista no encontrado" });
        }

        res.status(200).json(result[0]); // Devuelve el primer resultado
      },
    );
  } catch (error) {
    console.error("Error en obtener información del prestamista:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const registerPayment = async (req, res) => {
  try {
    const { loan_id, lender_conditions_id, amount, payment_method, notes } = req.body;

    if (!amount || (!loan_id && !lender_conditions_id)) {
      return res.status(400).json({ message: 'loan_id or lender_conditions_id and amount are required' });
    }

    // Resolve loan_id if only lender_conditions_id was provided
    const resolveLoanQuery = loan_id
      ? 'SELECT l.*, lc.approved_amount, lc.lender_id, lc.request_id FROM loans l JOIN lender_conditions lc ON l.lender_conditions_id = lc.id WHERE l.id = ? LIMIT 1'
      : 'SELECT l.*, lc.approved_amount, lc.lender_id, lc.request_id FROM loans l JOIN lender_conditions lc ON l.lender_conditions_id = lc.id WHERE lc.id = ? LIMIT 1';

    const resolveParams = loan_id ? [loan_id] : [lender_conditions_id];

    db.query(resolveLoanQuery, resolveParams, (err, loanResults) => {
      if (err) {
        console.error('Error resolving loan for payment:', err);
        return res.status(500).json({ message: 'Error resolving loan' });
      }

      if (!loanResults || loanResults.length === 0) {
        return res.status(404).json({ message: 'Loan not found for provided identifiers' });
      }

      const loan = loanResults[0];
      const targetLoanId = loan.id;
      const lenderId = loan.lender_id;
      const approvedAmount = parseFloat(loan.approved_amount || 0);

      // Get client id from client_request
      db.query(
        'SELECT user_id AS client_id FROM client_request WHERE id = ?',
        [loan.request_id],
        (err2, crRes) => {
          if (err2) {
            console.error('Error fetching client_request:', err2);
            return res.status(500).json({ message: 'Error fetching client info' });
          }

          const clientId = crRes && crRes[0] ? crRes[0].client_id : null;

          db.query(
            'INSERT INTO payments (loan_id, lender_id, client_id, amount, payment_method, notes, payment_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [targetLoanId, lenderId, clientId, amount, payment_method || null, notes || null, new Date(), new Date()],
            (insertErr, insertRes) => {
              if (insertErr) {
                console.error('Error inserting payment:', insertErr);
                return res.status(500).json({ message: 'Error recording payment' });
              }

              // Recalculate paid_amount
              db.query(
                'SELECT IFNULL(SUM(amount), 0) AS paid_total FROM payments WHERE loan_id = ?',
                [targetLoanId],
                (sumErr, sumRes) => {
                  if (sumErr) {
                    console.error('Error calculating paid total:', sumErr);
                  }

                  const paidTotal = sumRes && sumRes[0] ? parseFloat(sumRes[0].paid_total) : 0;

                  db.query(
                    'UPDATE loans SET paid_amount = ?, updated_at = ? WHERE id = ?',
                    [paidTotal, new Date(), targetLoanId],
                    (updErr) => {
                      if (updErr) {
                        console.error('Error updating loan paid_amount:', updErr);
                      }

                      // If fully paid, mark loan state to 4 (pagado)
                      if (approvedAmount > 0 && paidTotal >= approvedAmount) {
                        db.query('UPDATE loans SET state = ? WHERE id = ?', [4, targetLoanId], (sErr) => {
                          if (sErr) console.error('Error setting loan paid state:', sErr);
                        });
                      }

                      return res.status(201).json({ message: 'Payment registered', id: insertRes.insertId });
                    },
                  );
                },
              );
            },
          );
        },
      );
    });
  } catch (error) {
    console.error('Error in registerPayment:', error);
    res.status(500).send('Error interno del servidor');
  }
};

const getPaymentsByCondition = async (req, res) => {
  try {
    const { lender_conditions_id } = req.query;
    if (!lender_conditions_id) return res.status(400).json({ message: 'lender_conditions_id is required' });

    db.query(
      `SELECT p.*, l.lender_conditions_id, lc.request_id, lc.lender_id FROM payments p
       JOIN loans l ON p.loan_id = l.id
       JOIN lender_conditions lc ON l.lender_conditions_id = lc.id
       WHERE lc.id = ? ORDER BY p.payment_date DESC`,
      [lender_conditions_id],
      (err, results) => {
        if (err) {
          console.error('Error fetching payments by condition:', err);
          return res.status(500).json({ message: 'Error fetching payments' });
        }
        return res.status(200).json(results);
      },
    );
  } catch (error) {
    console.error('Error in getPaymentsByCondition:', error);
    res.status(500).send('Error interno del servidor');
  }
};

const getPaymentsByClient = async (req, res) => {
  try {
    const { client_id } = req.query;
    if (!client_id) return res.status(400).json({ message: 'client_id is required' });

    db.query(
      'SELECT p.* FROM payments p WHERE p.client_id = ? ORDER BY p.payment_date DESC',
      [client_id],
      (err, results) => {
        if (err) {
          console.error('Error fetching payments by client:', err);
          return res.status(500).json({ message: 'Error fetching payments' });
        }
        return res.status(200).json(results);
      },
    );
  } catch (error) {
    console.error('Error in getPaymentsByClient:', error);
    res.status(500).send('Error interno del servidor');
  }
};

const getRequestInfo = async (req, res) => {
  try {
    const { client_request_id, lender_id, client_id } = req.query;

    // Validar campo obligatorio
    if (!client_request_id || !lender_id || !client_id) {
      return res.status(400).json({
        message: "El ID de la solicitud y el ID del prestamista son requeridos",
      });
    }
    // Enviar solicitud al cliente
    db.query(
      "INSERT INTO notifications (client_request_id, lender_id, client_id, created_at, updated_at, state) VALUES (?, ?, ?, ?, ?, ?)",
      [client_request_id, lender_id, client_id, new Date(), new Date(), 1],
      (err, result) => {
        if (err) {
          console.error("Error al obtener información de la solicitud:", err);
          return res
            .status(500)
            .json({ message: "Error al obtener información de la solicitud" });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Solicitud no encontrada" });
        }
        res.status(200).json(result[0]);
      },
    );
  } catch (error) {
    console.error("Error en obtener información de la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getLenderConditionsByRequest = async (req, res) => {
  try {
    const { request_id, lender_id } = req.query;
    if (!request_id || !lender_id) {
      return res.status(400).json({ message: 'request_id and lender_id are required' });
    }

    db.query(
      'SELECT * FROM lender_conditions WHERE request_id = ? AND lender_id = ? LIMIT 1',
      [request_id, lender_id],
      (err, results) => {
        if (err) {
          console.error('Error fetching lender_conditions by request:', err);
          return res.status(500).json({ message: 'Error fetching lender conditions' });
        }
        if (!results || results.length === 0) {
          return res.status(404).json({ message: 'No lender_conditions found' });
        }
        return res.status(200).json(results[0]);
      },
    );
  } catch (error) {
    console.error('Error in getLenderConditionsByRequest:', error);
    res.status(500).send('Error interno del servidor');
  }
};

module.exports = {
  publications,
  createLenderConditions,
  getRequestInfo,
  getLenderInfo,
  showLenderConditions,
  getClientRequest,
  registerLoan,
  getLenderConditionsByRequest,
  registerPayment,
  getPaymentsByCondition,
  getPaymentsByClient,
};
