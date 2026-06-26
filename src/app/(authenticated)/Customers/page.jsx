"use client";

import { useState } from "react";

import Sidebar from "@/app/Components/Sidebar/Sidebar.jsx";
import { Eye } from 'lucide-react';
import styles from "./Customers.module.css";

export default function Customers() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const clientes = [
        {
            id: 1,
            nome: "Gabriel Queiroz",
            cpf: "123.456.789-00",
            plano: "Vitalício",
            status: "Ativo",
            visita: "15/06/2026"
        },
        {
            id: 2,
            nome: "Lucas Silva",
            cpf: "987.654.321-00",
            plano: "Anual",
            status: "Ativo",
            visita: "12/06/2026"
        },
        {
            id: 3,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 4,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 5,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 6,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 7,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 8,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 9,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
                {
            id: 10,
            nome: "Pedro Santos",
            cpf: "456.789.123-00",
            plano: "3 Anos",
            status: "Inativo",
            visita: "03/06/2026"
        },
        

    ];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentClientes = clientes.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className={styles.container}>

            <Sidebar
                activeItem="clientes"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className={styles.mainContent}>

                <div className={styles.content}>
                    
                    <div className={styles.topBar}>

                    <div>
                        <h1>Clientes</h1>
                        <p className={styles.tex}>Gestão e análise de visitantes</p>
                    </div>

                    <button className={styles.addButtonCustomers}>
                       + Novo Cliente
                    </button>

                    </div>

                      <div className={styles.cardsGridCustomers}>

                        <div className={styles.cardCustomers}>

                            <div className={styles.cardHeaderCustomers}>
                                <span className={styles.cardIconCustomers}>👥</span>

                                <span className={styles.cardBadgeCustomers}>
                                    +12%
                                </span>

                            </div>

                            <div className={styles.cardValueCustomers}>
                                ...
                            </div>

                            <div className={styles.cardTitleCustomers}>
                                Clientes Totais
                            </div>

                        </div>

                        <div className={styles.cardCustomers}>

                            <div className={styles.cardHeaderCustomers}>
                                <span className={styles.cardIconCustomers}>👥</span>

                                <span className={styles.cardBadgeCustomers}>
                                    +12%
                                </span>

                            </div>

                            <div className={styles.cardValueCustomers}>
                                ...
                            </div>

                            <div className={styles.cardTitleCustomers}>
                                Clientes de Hoje
                            </div>

                        </div>

                        <div className={styles.cardCustomers}>

                            <div className={styles.cardHeaderCustomers}>
                                <span className={styles.cardIconCustomers}>👥</span>

                                <span className={styles.cardBadgeCustomers}>
                                    +3%
                                </span>

                            </div>

                            <div className={styles.cardValueCustomers}>
                                ...
                            </div>

                            <div className={styles.cardTitleCustomers}>
                                Novos Cadastros
                            </div>
                        </div>

                        <div className={styles.cardCustomers}>

                            <div className={styles.cardHeaderCustomers}>
                                <span className={styles.cardIconCustomers}>👥</span>

                                <span className={styles.cardBadgeCustomers}>
                                    +0%
                                </span>

                            </div>

                            <div className={styles.cardValueCustomers}>
                                ...
                            </div>

                            <div className={styles.cardTitleCustomers}>
                                Contas canceladas
                            </div>
                        </div>

                    </div>

                    <div className = {styles.cardGridCustomersGraphic}>
                        
                        <div className={styles.cardCustomersGraphic}>

                            <div className={styles.graphHeaderCustomers}>
                                <h3>Fluxo de Clientes</h3>
                                <p>ultimos 30 dias</p>
                            </div>

                            <span className={styles.graphBadgeCustomers}>
                                ↗ +21% vs. mês anterior
                            </span>

                            <div className={styles.graphAreaCustomers}>
                                ...
                            </div>

                        </div>

                        <div className={styles.cardCustomersGraphic}>

                            <div className={styles.graphHeaderCustomers}>
                                <h3>Pico de Horarios</h3>
                                <p>Hoje</p>
                            </div>

                            <span className={styles.graphBadgeCustomers}>
                                ↗ +16% vs. semana anterior
                            </span>

                            <div className={styles.graphAreaCustomers}>
                                ...
                            </div>

                        </div>

                    </div>

                    <div className = {styles.midBar}>
                        
                        <div>
                            <h1>Tabela Clientes</h1>
                        </div>

                    </div>


                    <div className = {styles.CardGridCustomersTable}>

                        <div className = {styles.cardCustomersTable}>

                            <div className = {styles.searchContainerCustomers}>

                                <input
                                    type="text"
                                    placeholder="Pesquisar cliente..."
                                    className={styles.searchInputCustomers}
                                />

                                <select className = {styles.filterSelectCustomers}>
                                    <option>Planos</option>
                                    <option>Plano A</option>
                                    <option>Plano B</option>
                                    <option>Plano C</option>
                                </select>

                                <select className = {styles.filterSelectCustomers}>
                                    <option>STATUS</option>
                                    <option>Ativo</option>
                                    <option>Desativo</option>
                                </select>

                                 <select className = {styles.filterSelectCustomers}>
                                    <option>Visita</option>
                                    <option>Hoje</option>
                                    <option>Ultimos 7d</option>
                                    <option>Ultimos 30d</option>
                                </select>

                            </div>

                            <table className = {styles.customersTable}>

                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>CPF</th>
                                        <th>Plano</th>
                                        <th>Ultima visita</th>
                                        <th>STATUS</th>
                                        <th>Visualizar</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {currentClientes.map((cliente) => (
                                        <tr key={cliente.id}>

                                            <td>{cliente.nome}</td>
                                            <td>{cliente.cpf}</td>
                                            <td>{cliente.plano}</td>
                                            <td>{cliente.visita}</td>
                                            <td>{cliente.status}</td>

                                            <td>
                                                <button className={styles.button}> 
                                                    <Eye size={18} color='black' />
                                                </button>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                           <div className={styles.pagination}>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ← Anterior
                                </button>

                                <span className={styles.pageInfo}>
                                    Página {currentPage} de {Math.ceil(clientes.length / itemsPerPage)}
                                </span>

                                <button
                                    className={styles.pageButton}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(clientes.length / itemsPerPage)}
                                >
                                    Próximo →
                                </button>
                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}