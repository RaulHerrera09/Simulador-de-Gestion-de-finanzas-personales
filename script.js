let balance = 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateUI() {
    const transactionsContainer = document.getElementById("transactions");
    transactionsContainer.innerHTML = "";
    balance = 0;

    transactions.forEach((transaction, index) => {
        const transactionDiv = document.createElement("div");
        transactionDiv.classList.add("transaction", "list-group-item", transaction.type === "income" ? "income" : "expense");
        transactionDiv.innerHTML = `
            <span class="fw-bold">${transaction.description}</span>
            <span class="fw-bold">${transaction.type === "income" ? "+" : "-"}$${transaction.amount.toFixed(2)}</span>
            <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${index})">❌</button>
        `;
        transactionsContainer.appendChild(transactionDiv);
        balance += transaction.type === "income" ? transaction.amount : -transaction.amount;
    });

    document.getElementById("balance").textContent = `$${balance.toFixed(2)}`;
    updateChart();
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction() {
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Ingrese una descripción válida y un monto positivo.");
        return;
    }

    transactions.push({ description, amount, type });
    updateUI();
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
}

function deleteTransaction(index) {
    if (confirm("¿Seguro que deseas eliminar esta transacción?")) {
        transactions.splice(index, 1);
        updateUI();
    }
}

function exportCSV() {
    let csvContent = "Descripción,Monto,Tipo\n";
    transactions.forEach(t => {
        csvContent += `${t.description},${t.amount},${t.type}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transacciones.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

let chart;
function updateChart() {
    const incomes = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

    if (chart) chart.destroy();

    const ctx = document.getElementById("financeChart").getContext("2d");
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Ingresos", "Gastos"],
            datasets: [{
                data: [incomes, expenses],
                backgroundColor: ["#28a745", "#dc3545"],
            }]
        },
        options: { responsive: true }
    });
}

document.addEventListener("DOMContentLoaded", updateUI);
