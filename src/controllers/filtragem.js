// controllers/filtragem.js
const { Op } = require('sequelize');
const Booking = require('../models/booking');

function formatTime(date) {
    return date.toISOString().split('T')[1].substring(0, 5);
}

function getStartAndEndOfWeek(date) {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);

    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
}

function getStartAndEndOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
}

function getStartAndEndOfNextTwoMonths(date) {
    const startOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const endOfNextTwoMonths = new Date(date.getFullYear(), date.getMonth() + 3, 0);
    endOfNextTwoMonths.setHours(23, 59, 59, 999);
    return { startOfNextMonth, endOfNextTwoMonths };
}

const filterAppointments = async (req, res) => {
    const { period, professional } = req.query;

    if (!professional) {
        return res.status(400).json({ success: false, message: 'Profissional não especificado' });
    }

    let startDate, endDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
        case 'day':
            startDate = today;
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'week':
            ({ startOfWeek: startDate, endOfWeek: endDate } = getStartAndEndOfWeek(today));
            break;
        case 'month':
            ({ startOfMonth: startDate, endOfMonth: endDate } = getStartAndEndOfMonth(today));
            break;
        case 'nextTwoMonths':
            ({ startOfNextMonth: startDate, endOfNextTwoMonths: endDate } = getStartAndEndOfNextTwoMonths(today));
            break;
        default:
            return res.status(400).json({ success: false, message: 'Período inválido' });
    }

    try {
        const appointments = await Booking.findAll({
            where: {
                professional,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const formattedAppointments = appointments.map(booking => ({
            ...booking.toJSON(),
            time: formatTime(new Date(booking.time)),
            endTime: formatTime(new Date(booking.endTime))
        }));

        res.json({ success: true, appointments: formattedAppointments });
    } catch (error) {
        console.error('Erro ao filtrar agendamentos:', error);
        res.status(500).json({ success: false, message: 'Erro ao filtrar agendamentos' });
    }
};

module.exports = { filterAppointments };

