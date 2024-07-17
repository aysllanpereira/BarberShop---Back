// agendamento
const { Op } = require('sequelize');
const Booking = require('../models/booking');

// verificar se é domingo
// function domingo(date) {
//     const dayOff = new Date(date).getDay();
//     return dayOff === 0;
// }

// Função para verificar conflitos de agendamento
async function isTimeConflict(professional, date, time, duration) {
    const startTime = new Date(`${date}T${time}`);
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

// criar agendamentos
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

    // if(domingo(date)) {
    //     return res.status(400).json({ success: false, message: 'Não é possível agendar aos domingos'});
    // }

    try {
        const hasConflict = await isTimeConflict(professional, date, time, duration);

        if (hasConflict) {
            return res.status(409).json({ success: false, message: 'O horário selecionado está ocupado' });
        }

        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        await Booking.create({
            name,
            service,
            professional,
            date,
            time: startTime.toISOString(),
            endTime: endTime.toISOString(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao criar agendamento' });
    }
}

//listar todos os agendamentos
async function listarAgendamentos(req, res) {
    try {
        const agendamentos = await Booking.findAll();
        res.json(agendamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos' });
    }
}

// deletar agendamentos
async function deleteAgendamento(req, res) {
    const { id } = req.params;
    try {
        const result = await Booking.destroy({where: { id }});
        if(result) {
            res.json({ success: true, message: 'Agendamento excluído' });
        } else {
            res.status(404).json({ success: false, message: 'Agendamento não encontrato' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Erro ao excluir o agendamento' });
    }
}

// verificar disponibilidade 
// async function obterDisponibilidade(req, res) {
//     const { professional, date } = req.query;

//     if (!professional || !date) {
//         return res.status(400).json({ success: false, message: 'Profissional ou data não especificado' });
//     }

//     try {
//         const bookings = await Booking.findAll({
//             where: {
//                 professional,
//                 date
//             }
//         });

//         const bookedTimes = bookings.map(booking => ({
//             startTime: new Date(booking.time).toISOString(),
//             endTime: new Date(booking.endTime).toISOString()
//         }));

//         res.json({ success: true, bookedTimes });
//     } catch (error) {
//         console.error('Erro ao obter disponibilidade:', error);
//         res.status(500).json({ success: false, message: 'Erro ao obter disponibilidade' });
//     }
// }

module.exports = { criarAgendamento, listarAgendamentos, deleteAgendamento };
