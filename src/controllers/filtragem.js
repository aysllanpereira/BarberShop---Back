const { Op } = require('sequelize');
const Booking = require('../models/booking');

function getStartAndEndOfWeek(date) {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(date);

    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
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

        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Erro ao filtrar agendamentos:', error);
        res.status(500).json({ success: false, message: 'Erro ao filtrar agendamentos' });
    }
};

module.exports = { filterAppointments };
