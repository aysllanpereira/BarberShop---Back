const { Op } = require('sequelize');
const Booking = require('../models/booking');

function formatTime(date) {
    return date.toISOString().split('T')[1].substring(0, 5);
}

function toUTCDate(date, time) {
    const localDate = new Date(`${date}T${time}`);
    const utcDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
    return utcDate;
}

async function isTimeConflict(professional, date, time, duration) {
    const startTime = toUTCDate(date, time);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const bookings = await Booking.findAll({
        where: {
            professional: professional,
            date: date,
            [Op.or]: [
                {
                    time: {
                        [Op.lte]: endTime.toISOString()
                    },
                    endTime: {
                        [Op.gte]: startTime.toISOString()
                    }
                }
            ]
        }
    });

    return bookings.length > 0;
}

async function criarAgendamento(req, res) {
    const { name, service, professional, date, time } = req.body;
    const serviceDurations = {
        'Cabelo': 40,
        'Cabelo e Barba': 80,
        'Barba': 30,
        'Personalizado': 120
    };

    const duration = serviceDurations[service];
    if (!duration) {
        return res.status(400).json({ success: false, message: 'Serviço inválido' });
    }

    try {
        const hasConflict = await isTimeConflict(professional, date, time, duration);

        if (hasConflict) {
            return res.status(409).json({ success: false, message: 'O horário selecionado está ocupado' });
        }

        const startTime = toUTCDate(date, time);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const newBooking = await Booking.create({
            name,
            service,
            professional,
            date,
            time: startTime.toISOString(),
            endTime: endTime.toISOString(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({
            success: true,
            booking: {
                ...newBooking.toJSON(),
                time: formatTime(startTime),
                endTime: formatTime(endTime)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
    }
}

async function listarAgendamentos(req, res) {
    try {
        const agendamentos = await Booking.findAll();
        const formattedAgendamentos = agendamentos.map(booking => ({
            ...booking.toJSON(),
            time: formatTime(new Date(booking.time)),
            endTime: formatTime(new Date(booking.endTime))
        }));
        res.json(formattedAgendamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
}

async function deleteAgendamento(req, res) {
    const { id } = req.params;
    try {
        const result = await Booking.destroy({ where: { id } });
        if (result) {
            res.json({ success: true, message: 'Agendamento excluído' });
        } else {
            res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Erro ao excluir o agendamento' });
    }
}

module.exports = { criarAgendamento, listarAgendamentos, deleteAgendamento };
