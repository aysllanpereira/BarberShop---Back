// routes/rota.js
const express = require('express');
const router = express.Router();
const controladorAgendamento = require('../controllers/agendamento');
const { filterAppointments } = require('../controllers/filtragem');

router.post('/book', controladorAgendamento.criarAgendamento);
router.get('/bookings', controladorAgendamento.listarAgendamentos);
router.delete('/book/:id', controladorAgendamento.deleteAgendamento);
router.get('/filter', filterAppointments);

module.exports = router;


