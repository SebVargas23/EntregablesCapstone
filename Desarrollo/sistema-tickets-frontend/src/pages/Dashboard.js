// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import apiClient from '../components/apiClient';
import '../App.css';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    LabelList,
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ticketsPorDepartamento, setTicketsPorDepartamento] = useState([]);
    const [ticketsPorCategoria, setTicketsPorCategoria] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/api/dashboard/stats/');
                setStats(response.data);
                setTicketsPorDepartamento(response.data.tickets_por_departamento || []);
                setTicketsPorCategoria(response.data.tickets_por_categoria || []);
            } catch (err) {
                setError('Error al cargar estadísticas');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Datos para el gráfico de distribución de tickets
    const ticketData = [
        { name: 'Abiertos', value: stats.tickets_abiertos || 0 },
        { name: 'Cerrados', value: stats.tickets_cerrados || 0 },
        { name: 'Asignados', value: stats.tickets_asignados || 0 },
        { name: 'Reabiertos', value: stats.tickets_reabiertos || 0 },
    ];

    // Simulación de actividad mensual
    const monthlyData = [
        { name: 'Enero', users: 400, tickets: 240 },
        { name: 'Febrero', users: 300, tickets: 456 },
        { name: 'Marzo', users: 200, tickets: 139 },
        { name: 'Abril', users: 278, tickets: 390 },
        { name: 'Mayo', users: 189, tickets: 480 },
        { name: 'Junio', users: 239, tickets: 380 },
        { name: 'Julio', users: 349, tickets: 430 },
    ];

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>

            {/* Contenedor de tarjetas de estadísticas */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Usuarios Totales</h3>
                    <p>{stats.usuarios_totales}</p>
                </div>
                <div className="stat-card">
                    <h3>Tickets Totales</h3>
                    <p>{stats.tickets_totales}</p>
                </div>
                <div className="stat-card">
                    <h3>Tickets Abiertos</h3>
                    <p>{stats.tickets_abiertos}</p>
                </div>
                <div className="stat-card">
                    <h3>Tickets Cerrados</h3>
                    <p>{stats.tickets_cerrados}</p>
                </div>
                <div className="stat-card">
                    <h3>Tickets Asignados</h3>
                    <p>{stats.tickets_asignados}</p>
                </div>
                <div className="stat-card">
                    <h3>Tickets Reabiertos</h3>
                    <p>{stats.tickets_reabiertos}</p>
                </div>
            </div>

            {/* Contenedor de gráficos */}
            <div className="chart-container-wrapper">
                {/* Distribución de Tickets */}
                <div className="chart-container">
                    <h3 className="chart-title">Distribución de Tickets</h3>
                    <PieChart width={500} height={350}>
                        <Pie
                            data={ticketData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {ticketData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </div>

                {/* Tiempo para Cerrar Tickets */}
                <div className="chart-container">
                    <h3 className="chart-title">Tiempo para Cerrar Tickets</h3>
                    <LineChart width={500} height={300} data={stats.tiempos_cierre}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ticket_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="dias_cierre" stroke="#82ca9d" />
                    </LineChart>
                </div>

                {/* Tickets por Departamento */}
                <div className="chart-container">
                    <h3 className="chart-title">Tickets por Departamento</h3>
                    <BarChart width={500} height={300} data={ticketsPorDepartamento}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="user__cargo__departamento__nom_departamento" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Tickets por Categoría */}
                <div className="chart-container">
                    <h3 className="chart-title">Tickets por Categoría</h3>
                    <BarChart width={500} height={300} data={ticketsPorCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="categoria__nom_categoria"
                            angle={-45}
                            textAnchor="end"
                            label={{ value: 'Categorías', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis label={{ value: 'Cantidad de Tickets', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#82ca9d">
                            <LabelList dataKey="total" position="top" />
                        </Bar>
                    </BarChart>
                </div>

                {/* Simulación de Actividad Mensual */}
                <div className="chart-container">
                    <h3 className="chart-title">Simulación de Actividad Mensual</h3>
                    <LineChart width={500} height={300} data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#8884d8" />
                        <Line type="monotone" dataKey="tickets" stroke="#82ca9d" />
                    </LineChart>
                </div>
                {/* Tiempo Promedio por Estado */}
                <div className="chart-container">
                    <h3 className="chart-title">Tiempo Promedio por Estado</h3>
                    <BarChart
                        width={500}
                        height={300}
                        data={stats.tiempos_promedio_por_estado}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="estado"
                            angle={-45}
                            textAnchor="end"
                            label={{ value: 'Estado', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                            label={{ value: 'Días Promedio', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="promedio_dias" fill="#82ca9d">
                            <LabelList dataKey="promedio_dias" position="top" />
                        </Bar>
                    </BarChart>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
