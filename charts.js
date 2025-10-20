/**
 * CHARTS.JS - Módulo de Gerenciamento de Gráficos
 * Responsável por criar e atualizar todos os gráficos usando Chart.js
 */

// ===== CONFIGURAÇÕES GLOBAIS DO CHART.JS =====
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();

// ===== CLASSE DE GERENCIAMENTO DE GRÁFICOS =====
class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        this.categoryColors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
            '#f59e0b', '#eab308', '#84cc16', '#22c55e',
            '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
        ];
    }

    // Destruir gráfico existente
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    // Obter tema atual
    getCurrentTheme() {
        return document.body.getAttribute('data-theme') || 'light';
    }

    // Obter cores baseadas no tema
    getThemeColors() {
        const theme = this.getCurrentTheme();
        const isDark = theme === 'dark';
        
        return {
            gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            textColor: isDark ? '#d1d5db' : '#6b7280',
            backgroundColor: isDark ? '#1f2937' : '#ffffff'
        };
    }

    // ===== GRÁFICO DE PIZZA - DESPESAS POR CATEGORIA =====
    createCategoryChart(canvasId, data) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const categories = Object.keys(data);
        const values = Object.values(data);
        const colors = this.categoryColors.slice(0, categories.length);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: themeColors.backgroundColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            color: themeColors.textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${dataManager.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE BARRAS - EVOLUÇÃO MENSAL =====
    createMonthlyChart(canvasId, data) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const labels = data.map(d => monthNames[d.month]);
        const incomeData = data.map(d => d.income);
        const expenseData = data.map(d => d.expense);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: this.colors.success,
                        borderRadius: 6
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: this.colors.danger,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: themeColors.textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${dataManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE LINHA - EVOLUÇÃO DOS INVESTIMENTOS =====
    createInvestmentChart(canvasId, investments) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Simular evolução ao longo do tempo
        const datasets = investments.map((inv, index) => {
            const color = this.categoryColors[index % this.categoryColors.length];
            
            // Criar pontos de dados simulados
            const dataPoints = [];
            const monthsSinceStart = Math.floor((new Date() - new Date(inv.date)) / (1000 * 60 * 60 * 24 * 30));
            const months = Math.max(monthsSinceStart, 6);
            
            for (let i = 0; i <= months; i++) {
                const progress = i / months;
                const value = inv.initialAmount + (inv.currentAmount - inv.initialAmount) * progress;
                dataPoints.push(value);
            }
            
            return {
                label: inv.name,
                data: dataPoints,
                borderColor: color,
                backgroundColor: color + '20',
                fill: true,
                tension: 0.4,
                borderWidth: 2
            };
        });

        const labels = datasets[0] ? datasets[0].data.map((_, i) => `M${i}`) : [];
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: themeColors.textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${dataManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE BARRAS - RECEITAS VS DESPESAS =====
    createIncomeExpenseChart(canvasId, data) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas', 'Saldo'],
                datasets: [{
                    data: [data.income, data.expense, data.balance],
                    backgroundColor: [
                        this.colors.success,
                        this.colors.danger,
                        data.balance >= 0 ? this.colors.primary : this.colors.warning
                    ],
                    borderRadius: 8,
                    barThickness: 60
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return dataManager.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE PIZZA - DISTRIBUIÇÃO POR CATEGORIA =====
    createCategoryDistributionChart(canvasId, data) {
        this.createCategoryChart(canvasId, data);
    }

    // ===== GRÁFICO DE PIZZA - MÉTODOS DE PAGAMENTO =====
    createPaymentMethodChart(canvasId, transactions) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const methods = {};
        transactions.forEach(t => {
            if (!methods[t.paymentMethod]) {
                methods[t.paymentMethod] = 0;
            }
            methods[t.paymentMethod] += parseFloat(t.amount);
        });

        const labels = Object.keys(methods).map(m => {
            const methodNames = {
                cash: 'Dinheiro',
                debit: 'Débito',
                credit: 'Crédito',
                pix: 'PIX',
                transfer: 'Transferência'
            };
            return methodNames[m] || m;
        });
        
        const values = Object.values(methods);
        const colors = this.categoryColors.slice(0, labels.length);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: themeColors.backgroundColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            color: themeColors.textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${dataManager.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE LINHA - TENDÊNCIA DE GASTOS =====
    createTrendChart(canvasId) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const monthlyData = dataManager.getMonthlyEvolution();
        const last12Months = monthlyData.slice(-12);
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const labels = last12Months.map(d => monthNames[d.month]);
        const expenseData = last12Months.map(d => d.expense);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Despesas: ${dataManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE LINHA - PREVISÃO DE SALDO FUTURO =====
    createForecastChart(canvasId) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const forecast = dataManager.getForecast(6);
        const labels = forecast.map(f => `Mês ${f.month}`);
        const balanceData = forecast.map(f => f.predictedBalance);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Saldo Previsto',
                    data: balanceData,
                    borderColor: this.colors.secondary,
                    backgroundColor: this.colors.secondary + '20',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Saldo: ${dataManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== GRÁFICO DE BARRAS - VISUALIZAÇÃO ANUAL =====
    createAnnualChart(canvasId) {
        this.destroyChart(canvasId);
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const monthlyData = dataManager.getMonthlyEvolution();
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const labels = monthlyData.map(d => monthNames[d.month]);
        const incomeData = monthlyData.map(d => d.income);
        const expenseData = monthlyData.map(d => d.expense);
        const balanceData = monthlyData.map(d => d.balance);
        
        const themeColors = this.getThemeColors();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: this.colors.success,
                        borderRadius: 4
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: this.colors.danger,
                        borderRadius: 4
                    },
                    {
                        label: 'Saldo',
                        data: balanceData,
                        backgroundColor: this.colors.primary,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
                            callback: function(value) {
                                return dataManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            color: themeColors.textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${dataManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Atualizar todos os gráficos (útil ao mudar tema)
    updateAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            const chart = this.charts[chartId];
            if (chart) {
                const themeColors = this.getThemeColors();
                
                // Atualizar cores do tema
                if (chart.options.scales) {
                    if (chart.options.scales.x) {
                        chart.options.scales.x.grid.color = themeColors.gridColor;
                        chart.options.scales.x.ticks.color = themeColors.textColor;
                    }
                    if (chart.options.scales.y) {
                        chart.options.scales.y.grid.color = themeColors.gridColor;
                        chart.options.scales.y.ticks.color = themeColors.textColor;
                    }
                }
                
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = themeColors.textColor;
                }
                
                chart.update();
            }
        });
    }
}

// Instância global do gerenciador de gráficos
const chartManager = new ChartManager();

